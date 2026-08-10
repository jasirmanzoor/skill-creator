import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AppSettings, Dealership, Photo, SyncQueueItem } from './types';
import { buildSeedDealerships } from './seed';

const DB_NAME = 'qadisiyah-survey';
const DB_VERSION = 1;

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
