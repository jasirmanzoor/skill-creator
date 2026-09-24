"use client";

import { useState } from "react";

type Stage = { t: string; d: string };

/**
 * Source → Screen → Onboard → Train → On site.
 * Particles (people) travel the pipeline and change state at each gate.
 * Hover / focus a stage to highlight its gate.
 */
export default function WorkforcePipeline({ stages, site }: { stages: Stage[]; site: Stage }) {
  const [active, setActive] = useState<number | null>(null);
  const all = [...stages, site];
  const particles = Array.from({ length: 22 }, (_, i) => i);

  return (
    <div className="rounded-3xl border border-line bg-ink/60 p-6 sm:p-8">
      {/* track */}
      <div className="relative h-28 overflow-hidden rounded-2xl bg-white/[0.02]" aria-hidden="true">
        <div className="absolute inset-0 rtl:-scale-x-100">
          {/* gates */}
          {[20, 40, 60, 80].map((x, i) => (
            <div
              key={x}
              className={`absolute inset-y-3 w-px transition-colors duration-300 ${active === i ? "bg-sun" : "bg-white/15"}`}
              style={{ left: `${x}%` }}
            >
              <span className={`absolute -start-1 top-0 size-2 rounded-full transition-colors ${active === i ? "bg-sun" : "bg-white/30"}`} />
            </div>
          ))}
          <div className={`absolute inset-y-3 end-0 w-[18%] rounded-xl border transition-colors ${active === 4 ? "border-signal bg-signal/10" : "border-signal/30 bg-signal/5"}`} />
          {particles.map((i) => (
            <span
              key={i}
              className="wf-dot absolute size-2 rounded-full"
              style={{
                top: `${18 + ((i * 37) % 64)}%`,
                animationDelay: `${-(i * 0.43).toFixed(2)}s`,
                animationDuration: `${8 + (i % 5) * 0.6}s`,
              }}
            />
          ))}
        </div>
      </div>

      <ol className="mt-6 grid gap-3 sm:grid-cols-5">
        {all.map((s, i) => (
          <li key={s.t}>
            <button
              type="button"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className={`w-full rounded-2xl border p-4 text-start transition ${
                active === i ? (i === 4 ? "border-signal bg-signal/10" : "border-sun bg-sun/10") : "border-line hover:border-white/20"
              }`}
            >
              <span className={`num font-mono text-xs ${i === 4 ? "text-signal" : "text-sun"}`}>{i < 4 ? `0${i + 1}` : "→"}</span>
              <span className="mt-1 block font-semibold text-white">{s.t}</span>
              <span className="mt-1 block text-sm text-fog">{s.d}</span>
            </button>
          </li>
        ))}
      </ol>

      <style>{`
        .wf-dot { left: 0; animation-name: wf-move; animation-timing-function: linear; animation-iteration-count: infinite; }
        @keyframes wf-move {
          0%   { left: -2%;  background: #5b6478; transform: scale(.8); }
          19%  { background: #5b6478; }
          21%  { background: #c9d0dc; transform: scale(1); }
          39%  { background: #c9d0dc; }
          41%  { background: #ffd48a; }
          59%  { background: #ffd48a; }
          61%  { background: #f6a623; transform: scale(1.1); }
          79%  { background: #f6a623; }
          81%  { background: #4fe3c1; transform: scale(1.2); box-shadow: 0 0 10px #4fe3c1; }
          100% { left: 97%;  background: #4fe3c1; transform: scale(1.2); box-shadow: 0 0 10px #4fe3c1; }
        }
        @media (prefers-reduced-motion: reduce) { .wf-dot { animation: none; opacity: .6; background: #c9d0dc; } }
      `}</style>
    </div>
  );
}
