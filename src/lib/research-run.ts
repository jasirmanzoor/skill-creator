import { v4 as uuid } from 'uuid';
import { getFindingsForDealership, getRunsToday, getSettings, logResearchRun, saveFinding } from './db';
import type { AgentFinding, ResearchTask } from './research-types';
import type { Dealership } from './types';

// Conservative default used only for the pre-run cost *estimate* shown to
// the user before a batch — the real cost comes back per-run from the API
// (token usage + $10/1,000 web searches) and is what gets logged.
export const ESTIMATED_COST_PER_RUN_USD = 0.05;

export interface RunOutcome {
  ok: boolean;
  finding?: AgentFinding;
  error?: string;
  capReached?: boolean;
}

export async function checkDailyCapRemaining(): Promise<{ used: number; cap: number; remaining: number }> {
  const settings = await getSettings();
  const runsToday = await getRunsToday();
  const used = runsToday.length;
  return { used, cap: settings.dailyResearchCap, remaining: Math.max(0, settings.dailyResearchCap - used) };
}

export async function runResearchTask(dealership: Dealership, task: ResearchTask): Promise<RunOutcome> {
  const { remaining } = await checkDailyCapRemaining();
  if (remaining <= 0) {
    return { ok: false, capReached: true, error: 'Daily research run cap reached. Raise it in Settings or wait for tomorrow.' };
  }

  let res: Response;
  try {
    res = await fetch('/api/research/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dealership: { id: dealership.id, nameEn: dealership.nameEn, nameAr: dealership.nameAr, lat: dealership.lat, lng: dealership.lng },
        task: { instruction: task.instruction, targetField: task.targetField, sources: task.sources },
      }),
    });
  } catch {
    return { ok: false, error: 'Network error reaching the research endpoint.' };
  }

  const data = await res.json();

  await logResearchRun({
    id: uuid(),
    ranAt: new Date().toISOString(),
    taskId: task.id,
    dealershipId: dealership.id,
    ok: res.ok && data.ok,
    error: data.ok ? null : (data.error ?? `HTTP ${res.status}`),
    estimatedCostUsd: data.finding?.costUsd ?? 0,
  });

  if (!res.ok || !data.ok) {
    return { ok: false, error: data.error ?? `HTTP ${res.status}` };
  }

  // Change detection: compare against the most recent prior finding for the
  // same dealership + field.
  const priorFindings = await getFindingsForDealership(dealership.id);
  const priorForField = priorFindings
    .filter((f) => f.targetField === task.targetField)
    .sort((a, b) => (a.retrievedAt < b.retrievedAt ? 1 : -1))[0];

  const finding: AgentFinding = {
    id: uuid(),
    dealershipId: dealership.id,
    taskId: task.id,
    taskName: task.name,
    targetField: task.targetField,
    found: data.finding.found,
    value: data.finding.value,
    summary: data.finding.summary,
    sourceUrl: data.finding.sourceUrl,
    confidence: data.finding.confidence,
    model: data.finding.model,
    retrievedAt: new Date().toISOString(),
    status: 'pending',
    changedFromPrevious: Boolean(priorForField && priorForField.value !== data.finding.value),
    previousValue: priorForField?.value ?? null,
  };

  await saveFinding(finding);
  return { ok: true, finding };
}
