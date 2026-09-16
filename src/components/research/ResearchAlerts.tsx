'use client';

import { useEffect, useState } from 'react';
import {
  getAllDealerships,
  getAllDuplicateFlags,
  getAllFindings,
  saveDuplicateFlags,
  updateDuplicateFlagStatus,
} from '@/lib/db';
import { findSuspectedDuplicates } from '@/lib/duplicate-detection';
import type { AgentFinding, DuplicateFlag } from '@/lib/research-types';
import type { Dealership } from '@/lib/types';

export default function ResearchAlerts() {
  const [changed, setChanged] = useState<AgentFinding[]>([]);
  const [dupes, setDupes] = useState<DuplicateFlag[]>([]);
  const [byId, setById] = useState<Record<string, Dealership>>({});
  const [scanning, setScanning] = useState(false);

  const load = async () => {
    const [findings, flags, dealerships] = await Promise.all([
      getAllFindings(),
      getAllDuplicateFlags(),
      getAllDealerships(),
    ]);
    setChanged(findings.filter((f) => f.changedFromPrevious && f.status === 'pending'));
    setDupes(flags.filter((f) => f.status === 'pending'));
    setById(Object.fromEntries(dealerships.map((d) => [d.id, d])));
  };

  useEffect(() => {
    (async () => {
      const [findings, flags, dealerships] = await Promise.all([
        getAllFindings(),
        getAllDuplicateFlags(),
        getAllDealerships(),
      ]);
      setChanged(findings.filter((f) => f.changedFromPrevious && f.status === 'pending'));
      setDupes(flags.filter((f) => f.status === 'pending'));
      setById(Object.fromEntries(dealerships.map((d) => [d.id, d])));
    })();
  }, []);

  const scanForDuplicates = async () => {
    setScanning(true);
    const dealerships = await getAllDealerships();
    const found = findSuspectedDuplicates(dealerships);
    await saveDuplicateFlags(found);
    setScanning(false);
    await load();
  };

  const dismissDupe = async (id: string) => {
    await updateDuplicateFlagStatus(id, 'dismissed');
    await load();
  };

  if (changed.length === 0 && dupes.length === 0) {
    return (
      <div>
        <p className="text-xs text-muted">No alerts right now.</p>
        <button
          onClick={scanForDuplicates}
          disabled={scanning}
          className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-xs font-medium text-foreground disabled:opacity-40"
        >
          {scanning ? 'Scanning…' : 'Scan roster for suspected duplicates'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {changed.length > 0 && (
        <div>
          <div className="mb-1.5 text-xs font-semibold text-purple-500">Changed since last check</div>
          <div className="space-y-1.5">
            {changed.map((f) => (
              <div key={f.id} className="rounded-lg bg-purple-500/5 px-3 py-2 text-xs">
                <span className="font-medium text-foreground">{byId[f.dealershipId]?.nameEn ?? f.dealershipId}</span>
                <span className="text-muted"> — {f.taskName}: </span>
                <span className="text-purple-500">&quot;{f.previousValue}&quot; → &quot;{f.value}&quot;</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-500">Suspected duplicates</span>
          <button onClick={scanForDuplicates} disabled={scanning} className="text-[11px] text-accent underline">
            {scanning ? 'Scanning…' : 'Re-scan'}
          </button>
        </div>
        {dupes.length === 0 ? (
          <p className="text-xs text-muted">None flagged. Run a scan to check the current roster.</p>
        ) : (
          <div className="space-y-1.5">
            {dupes.map((d) => (
              <div key={d.id} className="flex items-start justify-between gap-2 rounded-lg bg-amber-500/5 px-3 py-2 text-xs">
                <div>
                  <div className="text-foreground">
                    {byId[d.dealershipIdA]?.nameEn ?? d.dealershipIdA} <span className="text-muted">↔</span>{' '}
                    {byId[d.dealershipIdB]?.nameEn ?? d.dealershipIdB}
                  </div>
                  <div className="text-muted">
                    {d.reason}
                    {d.distanceMeters !== null ? ` · ${d.distanceMeters}m apart` : ''}
                  </div>
                </div>
                <button onClick={() => dismissDupe(d.id)} className="shrink-0 text-[11px] text-muted underline">
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
