"use client";

import { useState } from "react";

type Stage = { t: string; d: string };
type Labels = { demand: string; capacity: string; standby: string; illustrative: string };

// Illustrative season (normalised 0..1): not MSG data, labelled as such in the UI.
const demand = (t: number) => 0.24 + 0.64 * Math.exp(-Math.pow((t - 0.6) / 0.13, 2));
const forecast = (t: number) => demand(t) * (1 + 0.06 * Math.sin(t * 13));
const capacity = (t: number) => (t < 0.28 ? 0.32 : t > 0.84 ? Math.max(0.32, forecast(t) * 1.05) : Math.max(0.32, Math.min(0.96, forecast(Math.min(t + 0.04, 1)) * 1.1)));

const VW = 1000, VH = 340, TOP = 40, BOT = 300;
const X = (t: number) => 20 + t * (VW - 40);
const Y = (v: number) => BOT - v * (BOT - TOP);
const line = (f: (t: number) => number) => Array.from({ length: 121 }, (_, i) => { const t = i / 120; return `${i ? "L" : "M"}${X(t).toFixed(1)} ${Y(f(t)).toFixed(1)}`; }).join(" ");
const area = (f: (t: number) => number) => `${line(f)} L${X(1)} ${BOT} L${X(0)} ${BOT} Z`;
const STARTS = [0, 0.2, 0.4, 0.6, 0.8];
/** how much of the standby pool is on shift in each stage */
const CALLED = [0, 0, 14, 18, 0];

/**
 * Peak control, the closing argument: one season laid out whole, from the first demand signal to the closeout.
 * The chart shows demand against the capacity MSG deploys; the five stages sit directly under the part of the
 * season they govern, so the page reads left to right as one controlled path. Choosing a stage marks its span
 * on the chart, moves the marker there and shows how much of the standby pool is on shift.
 */
export default function PeakControl({ stages, labels }: { stages: Stage[]; labels: Labels }) {
  const [active, setActive] = useState(0);
  const pool = Array.from({ length: 24 }, (_, k) => k);
  const called = CALLED[active];
  const at = STARTS[active] + 0.1;

  return (
    <div className="overflow-hidden rounded-[28px] bg-teal-deep text-white shadow-[var(--shadow-scene)]">
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs text-white/75">
          <p className="flex flex-wrap gap-x-5 gap-y-2">
            <Legend swatch="h-0.5 w-5 bg-white" label={labels.demand} />
            <Legend swatch="size-3 rounded-sm bg-brand-bright" label={labels.capacity} />
            <Legend swatch="size-2 rounded-full bg-sea-400" label={labels.standby} />
          </p>
          <p className="max-w-md text-white/60">{labels.illustrative}</p>
        </div>

        {/* the season */}
        <div className="relative mt-5 aspect-[1000/340] w-full rtl:-scale-x-100" dir="ltr">
          <svg viewBox={`0 0 ${VW} ${VH}`} className="absolute inset-0 size-full overflow-visible" role="img" aria-label={`${stages[active].t}: ${stages[active].d}. ${labels.illustrative}`}>
            <defs>
              <linearGradient id="pk-cap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--color-brand-bright)" stopOpacity="0.85" />
                <stop offset="1" stopColor="var(--color-brand-bright)" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            {/* the span each stage governs */}
            {STARTS.map((s, i) => (
              <g key={i}>
                <rect x={X(s)} y={TOP - 14} width={X(s + 0.2) - X(s)} height={BOT - TOP + 14} fill={i === active ? "rgba(255,255,255,0.09)" : "transparent"} />
                {i ? <line x1={X(s)} x2={X(s)} y1={TOP - 14} y2={BOT} stroke="rgba(255,255,255,0.16)" strokeDasharray="3 5" /> : null}
              </g>
            ))}
            <line x1={X(0)} x2={X(1)} y1={BOT} y2={BOT} stroke="rgba(255,255,255,0.3)" />
            <path d={area(capacity)} fill="url(#pk-cap)" />
            <path d={line(forecast)} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeDasharray="5 7" />
            <path d={line(demand)} fill="none" stroke="#fff" strokeWidth="2.6" />
            {/* standby pool: dimmed dots are on shift */}
            {pool.map((k) => (
              <circle key={k} cx={VW - 150 + (k % 8) * 17} cy={TOP - 22 + Math.floor(k / 8) * 15} r="4.6" fill="var(--color-sea-400)" opacity={k < called ? 0.28 : active === 0 ? 0.5 : 1} />
            ))}
            {/* closeout reviewed */}
            {active === 4 ? (
              <g>
                <circle cx={X(0.9)} cy={Y(capacity(0.9)) - 26} r="13" fill="#fff" />
                <path d={`M${X(0.9) - 5} ${Y(capacity(0.9)) - 26} l3.5 3.5 l6.5 -7`} stroke="var(--color-teal-deep)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            ) : null}
            {/* where the chosen stage sits in the season */}
            <line x1={X(at)} x2={X(at)} y1={TOP - 16} y2={BOT} stroke="#fff" strokeWidth="1.5" />
            <circle r="18" fill="rgba(255,255,255,0.16)" cx={X(at)} cy={Y(capacity(at))} />
            <circle r="8" fill="var(--color-teal-deep)" stroke="#fff" strokeWidth="3" cx={X(at)} cy={Y(capacity(at))} />
          </svg>
        </div>

        {/* the path: five stages, each under the part of the season it governs */}
        <ol role="tablist" aria-label={labels.capacity} className="mt-2 grid lg:grid-cols-5 lg:px-[2%]">
          {stages.map((s, i) => {
            const on = i === active;
            return (
              <li key={s.t} role="presentation">
                <button
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  data-press="soft"
                  className="group flex w-full items-start gap-4 border-t border-white/15 py-4 text-start lg:block lg:border-t-0 lg:py-0 lg:pe-4"
                >
                  <span aria-hidden="true" className={`hidden h-1 transition-colors lg:block ${on ? "bg-brand-bright" : i < active ? "bg-white/45" : "bg-white/15"}`} />
                  <span className={`num grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold transition-colors lg:mt-5 lg:size-auto lg:place-items-start lg:rounded-none lg:bg-transparent ${on ? "bg-brand-bright text-teal-deep lg:text-brand-bright" : "bg-white/10 text-white/70 lg:text-white/55"}`} dir="ltr">0{i + 1}</span>
                  <span className="min-w-0">
                    <span className={`block font-display text-2xl font-semibold tracking-[-0.02em] transition-colors lg:mt-1 rtl:tracking-normal ${on ? "text-white" : "text-white/70 group-hover:text-white"}`}>{s.t}</span>
                    <span className={`mt-1 block text-sm leading-relaxed transition-colors ${on ? "text-white/85" : "text-white/60"}`}>{s.d}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return <span className="flex items-center gap-2"><span className={swatch} />{label}</span>;
}
