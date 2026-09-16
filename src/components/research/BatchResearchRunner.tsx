'use client';

import { useEffect, useState } from 'react';
import { getAllDealerships, getAllResearchTasks } from '@/lib/db';
import { checkDailyCapRemaining, ESTIMATED_COST_PER_RUN_USD, runResearchTask } from '@/lib/research-run';
import type { ResearchTask } from '@/lib/research-types';
import type { Dealership } from '@/lib/types';

type BatchScope = 'all' | 'not_visited' | 'missing_cr';

async function scopedDealerships(targetScope: BatchScope): Promise<Dealership[]> {
  const all = await getAllDealerships();
  const surveyable = all.filter((d) => d.visitStatus !== 'competitor' && d.visitStatus !== 'closed_moved');
  if (targetScope === 'not_visited') return surveyable.filter((d) => d.visitStatus === 'not_visited');
  if (targetScope === 'missing_cr') return surveyable.filter((d) => !d.crNumber);
  return surveyable;
}

export default function BatchResearchRunner() {
  const [tasks, setTasks] = useState<ResearchTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [scope, setScope] = useState<BatchScope>('missing_cr');
  const [cap, setCap] = useState({ used: 0, cap: 0, remaining: 0 });
  const [confirming, setConfirming] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const t = await getAllResearchTasks();
      setTasks(t.filter((x) => x.enabled));
      if (t.length > 0) setSelectedTaskId((prev) => prev || t[0].id);
      setCap(await checkDailyCapRemaining());
    })();
  }, []);

  const [previewCount, setPreviewCount] = useState<number | null>(null);
  useEffect(() => {
    scopedDealerships(scope).then((d) => setPreviewCount(Math.min(d.length, cap.remaining)));
  }, [scope, cap.remaining]);

  const runBatch = async () => {
    const task = tasks.find((t) => t.id === selectedTaskId);
    if (!task) return;
    setConfirming(false);
    setRunning(true);
    setResult(null);
    const dealerships = (await scopedDealerships(scope)).slice(0, cap.remaining);
    setProgress({ done: 0, total: dealerships.length });

    let succeeded = 0;
    let failed = 0;
    for (const d of dealerships) {
      const outcome = await runResearchTask(d, task);
      if (outcome.capReached) break;
      if (outcome.ok) succeeded += 1;
      else failed += 1;
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    setRunning(false);
    setResult(`Done — ${succeeded} succeeded, ${failed} failed. Review results per-dealership from the Survey → Research panel.`);
    setCap(await checkDailyCapRemaining());
  };

  if (tasks.length === 0) {
    return <p className="text-xs text-muted">Add and enable at least one research task first.</p>;
  }

  const estimatedCost = previewCount !== null ? previewCount * ESTIMATED_COST_PER_RUN_USD : 0;

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Task to run</label>
        <select
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
        >
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Which dealerships</label>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as typeof scope)}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
        >
          <option value="missing_cr">Missing CR number</option>
          <option value="not_visited">Not yet visited</option>
          <option value="all">All surveyable dealerships</option>
        </select>
      </div>

      <div className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">
        {cap.remaining} of {cap.cap} daily runs remaining · will process up to{' '}
        <b className="text-foreground">{previewCount ?? '…'}</b> dealerships · estimated cost{' '}
        <b className="text-foreground">${estimatedCost.toFixed(2)}</b> (rough — actual cost is billed and logged per run)
      </div>

      {running ? (
        <div className="rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent">
          Running {progress.done} / {progress.total}…
        </div>
      ) : !confirming ? (
        <button
          onClick={() => setConfirming(true)}
          disabled={!previewCount}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-contrast disabled:opacity-40"
        >
          Run batch
        </button>
      ) : (
        <div className="flex gap-2">
          <button onClick={runBatch} className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-contrast">
            Confirm — spend ~${estimatedCost.toFixed(2)}
          </button>
          <button onClick={() => setConfirming(false)} className="rounded-lg bg-surface-2 px-4 py-2.5 text-sm font-medium text-foreground">
            Cancel
          </button>
        </div>
      )}

      {result && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-500">{result}</p>}
    </div>
  );
}
