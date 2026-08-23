import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AppSettings, Dealership, Photo, SyncQueueItem } from './types';
import { buildSeedDealerships } from './seed';
import type { AgentFinding, DuplicateFlag, ResearchRunLogEntry, ResearchTask } from './research-types';

const DB_NAME = 'qadisiyah-survey';
const DB_VERSION = 2;

interface SurveyDB extends DBSchema {
  dealerships: {
    key: string;
    value: Dealership;
    indexes: { 'by-status': string; 'by-updated': string };
  };
  photos: {
    key: string;
    value: Photo;
    indexes: { 'by-dealership': string };
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
  researchTasks: {
    key: string;
    value: ResearchTask;
  };
  agentFindings: {
    key: string;
    value: AgentFinding;
    indexes: { 'by-dealership': string };
  };
  researchRuns: {
    key: string;
    value: ResearchRunLogEntry;
    indexes: { 'by-date': string };
  };
  duplicateFlags: {
    key: string;
    value: DuplicateFlag;
  };
}

let dbPromise: Promise<IDBPDatabase<SurveyDB>> | null = null;

function getDB(): Promise<IDBPDatabase<SurveyDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SurveyDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('dealerships')) {
          const store = db.createObjectStore('dealerships', { keyPath: 'id' });
          store.createIndex('by-status', 'visitStatus');
          store.createIndex('by-updated', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('photos')) {
          const store = db.createObjectStore('photos', { keyPath: 'id' });
          store.createIndex('by-dealership', 'dealershipId');
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('researchTasks')) {
          db.createObjectStore('researchTasks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('agentFindings')) {
          const store = db.createObjectStore('agentFindings', { keyPath: 'id' });
          store.createIndex('by-dealership', 'dealershipId');
        }
        if (!db.objectStoreNames.contains('researchRuns')) {
          const store = db.createObjectStore('researchRuns', { keyPath: 'id' });
          store.createIndex('by-date', 'ranAt');
        }
        if (!db.objectStoreNames.contains('duplicateFlags')) {
          db.createObjectStore('duplicateFlags', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function ensureSeeded(): Promise<void> {
  const db = await getDB();
  const count = await db.count('dealerships');
  if (count === 0) {
    const tx = db.transaction('dealerships', 'readwrite');
    for (const d of buildSeedDealerships()) {
      await tx.store.put(d);
    }
    await tx.done;
  }
}

export async function getAllDealerships(): Promise<Dealership[]> {
  const db = await getDB();
  return db.getAll('dealerships');
}

export async function getDealership(id: string): Promise<Dealership | undefined> {
  const db = await getDB();
  return db.get('dealerships', id);
}

export async function saveDealership(d: Dealership): Promise<void> {
  const db = await getDB();
  const updated: Dealership = { ...d, updatedAt: new Date().toISOString(), dirty: true };
  await db.put('dealerships', updated);
  await queueSync('dealership', d.id);
}

export async function addDealership(d: Dealership): Promise<void> {
  const db = await getDB();
  await db.put('dealerships', d);
  await queueSync('dealership', d.id);
}

export async function deleteDealership(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('dealerships', id);
}

async function queueSync(entity: SyncQueueItem['entity'], entityId: string): Promise<void> {
  const db = await getDB();
  const settings = await getSettings();
  if (!settings.remoteEndpoint) return; // local-only mode: nothing to queue
  const item: SyncQueueItem = {
    id: `${entity}-${entityId}-${Date.now()}`,
    entity,
    entityId,
    createdAt: new Date().toISOString(),
  };
  await db.put('syncQueue', item);
}

export async function getSyncQueueCount(): Promise<number> {
  const db = await getDB();
  return db.count('syncQueue');
}

export async function flushSyncQueue(): Promise<{ pushed: number; failed: number }> {
  const db = await getDB();
  const settings = await getSettings();
  if (!settings.remoteEndpoint || !navigator.onLine) return { pushed: 0, failed: 0 };

  const items = await db.getAll('syncQueue');
  let pushed = 0;
  let failed = 0;
  for (const item of items) {
    try {
      if (item.entity === 'dealership') {
        const record = await db.get('dealerships', item.entityId);
        if (!record) {
          await db.delete('syncQueue', item.id);
          continue;
        }
        const res = await fetch(settings.remoteEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'dealership', record }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      await db.delete('syncQueue', item.id);
      pushed += 1;
    } catch {
      failed += 1;
    }
  }
  return { pushed, failed };
}

export async function savePhoto(photo: Photo): Promise<void> {
  const db = await getDB();
  await db.put('photos', photo);
}

export async function getPhotosForDealership(dealershipId: string): Promise<Photo[]> {
  const db = await getDB();
  return db.getAllFromIndex('photos', 'by-dealership', dealershipId);
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('photos', id);
}

const DEFAULT_SETTINGS: AppSettings = {
  id: 'singleton',
  surveyorName: null,
  darkMode: false,
  remoteEndpoint: null,
};

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const s = await db.get('settings', 'singleton');
  return s ?? DEFAULT_SETTINGS;
}

export async function saveSettings(s: AppSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', s);
}

export async function resetAllData(): Promise<void> {
  const db = await getDB();
  await db.clear('dealerships');
  await db.clear('photos');
  await db.clear('syncQueue');
  await ensureSeeded();
}

// ---------- Phase 2: research tasks ----------

export async function getAllResearchTasks(): Promise<ResearchTask[]> {
  const db = await getDB();
  return db.getAll('researchTasks');
}

export async function saveResearchTask(task: ResearchTask): Promise<void> {
  const db = await getDB();
  await db.put('researchTasks', task);
}

export async function deleteResearchTask(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('researchTasks', id);
}

// ---------- Phase 2: agent-sourced findings ----------

export async function saveFinding(finding: AgentFinding): Promise<void> {
  const db = await getDB();
  await db.put('agentFindings', finding);
}

export async function getFindingsForDealership(dealershipId: string): Promise<AgentFinding[]> {
  const db = await getDB();
  return db.getAllFromIndex('agentFindings', 'by-dealership', dealershipId);
}

export async function getAllFindings(): Promise<AgentFinding[]> {
  const db = await getDB();
  return db.getAll('agentFindings');
}

export async function updateFindingStatus(id: string, status: AgentFinding['status']): Promise<void> {
  const db = await getDB();
  const f = await db.get('agentFindings', id);
  if (!f) return;
  await db.put('agentFindings', { ...f, status });
}

// ---------- Phase 2: run log / cost tracking ----------

export async function logResearchRun(entry: ResearchRunLogEntry): Promise<void> {
  const db = await getDB();
  await db.put('researchRuns', entry);
}

export async function getRunsToday(): Promise<ResearchRunLogEntry[]> {
  const db = await getDB();
  const all = await db.getAll('researchRuns');
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return all.filter((r) => new Date(r.ranAt) >= todayStart);
}

// ---------- Phase 2: suspected duplicates ----------

export async function saveDuplicateFlags(flags: DuplicateFlag[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('duplicateFlags', 'readwrite');
  for (const f of flags) await tx.store.put(f);
  await tx.done;
}

export async function getAllDuplicateFlags(): Promise<DuplicateFlag[]> {
  const db = await getDB();
  return db.getAll('duplicateFlags');
}

export async function updateDuplicateFlagStatus(
  id: string,
  status: DuplicateFlag['status']
): Promise<void> {
  const db = await getDB();
  const f = await db.get('duplicateFlags', id);
  if (!f) return;
  await db.put('duplicateFlags', { ...f, status });
}
