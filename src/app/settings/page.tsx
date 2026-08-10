'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/lib/settings-context';
import { resetAllData } from '@/lib/db';
import ImportDealerships from '@/components/ImportDealerships';
import DiscoverDealerships from '@/components/DiscoverDealerships';

export default function SettingsPage() {
  const { surveyorName, darkMode, remoteEndpoint, logout, toggleDarkMode, setRemoteEndpoint } =
    useSettings();
  const router = useRouter();
  const [endpointInput, setEndpointInput] = useState(remoteEndpoint ?? '');
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <div className="safe-top h-full overflow-y-auto pb-24">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/95 px-4 py-4 backdrop-blur">
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
      </header>

      <div className="space-y-6 px-4 py-5">
        <section className="rounded-2xl border border-border bg-surface p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted">Surveyor</div>
          <div className="mt-1 text-base font-medium text-foreground">{surveyorName}</div>
          <button
            onClick={async () => {
              await logout();
              router.replace('/login');
            }}
            className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-sm font-medium text-foreground"
          >
            Switch surveyor
          </button>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Dark mode</div>
              <div className="text-xs text-muted">Easier on the eyes for evening visits</div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative h-7 w-12 rounded-full transition-colors ${darkMode ? 'bg-accent' : 'bg-surface-2'}`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-4">
          <div className="text-sm font-medium text-foreground">Cloud sync endpoint</div>
          <p className="mt-1 text-xs text-muted">
            Optional. All data already lives safely on this device and works fully offline.
            Set this only if you&apos;ve stood up a backend to receive pushed records — leave
            blank for local-only, single-device use.
          </p>
          <input
            value={endpointInput}
            onChange={(e) => setEndpointInput(e.target.value)}
            placeholder="https://your-backend.example.com/sync"
            className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setRemoteEndpoint(endpointInput.trim() || null)}
              className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-contrast"
            >
              Save
            </button>
            {remoteEndpoint && (
              <button
                onClick={() => {
                  setEndpointInput('');
                  setRemoteEndpoint(null);
                }}
                className="rounded-lg bg-surface-2 px-3 py-2 text-sm font-medium text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-4">
          <div className="text-sm font-medium text-foreground">Discover more dealerships</div>
          <p className="mt-1 text-xs text-muted">
            Search OpenStreetMap for car dealerships near Al Qadisiyah that aren&apos;t on your
            roster yet. This is how you grow toward the market&apos;s real size — real, sourced
            names and coordinates, never invented ones. Each result still needs a field visit.
          </p>
          <div className="mt-3">
            <DiscoverDealerships onImported={() => {}} />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-4">
          <div className="text-sm font-medium text-foreground">Import dealerships</div>
          <p className="mt-1 text-xs text-muted">
            Load a manually-surveyed CSV or Excel sheet — map its columns to fields and merge
            it into the roster without overwriting existing records.
          </p>
          <div className="mt-3">
            <ImportDealerships onImported={() => {}} />
          </div>
        </section>

        <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
          <div className="text-sm font-medium text-red-500">Reset all data</div>
          <p className="mt-1 text-xs text-muted">
            Wipes every survey record, photo, and note on this device and reloads the
            original 38-dealership roster. Cannot be undone — export first if unsure.
          </p>
          {!confirmingReset ? (
            <button
              onClick={() => setConfirmingReset(true)}
              className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500"
            >
              Reset all data…
            </button>
          ) : (
            <div className="mt-3 flex gap-2">
              <button
                onClick={async () => {
                  await resetAllData();
                  setConfirmingReset(false);
                  router.replace('/');
                }}
                className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white"
              >
                Yes, wipe everything
              </button>
              <button
                onClick={() => setConfirmingReset(false)}
                className="rounded-lg bg-surface-2 px-3 py-2 text-sm font-medium text-foreground"
              >
                Cancel
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
