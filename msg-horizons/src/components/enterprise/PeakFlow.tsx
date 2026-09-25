"use client";

import { useEffect, useRef, useState } from "react";

type Stage = { t: string; d: string };
type Labels = { demand: string; capacity: string; standby: string; illustrative: string };

// Illustrative demand profile (normalised 0..1) — NOT MSG data. Labelled as such in the UI.
const N = 16;
const PEAK = 8;
const demand = Array.from({ length: N }, (_, i) => 0.28 + 0.62 * Math.exp(-Math.pow((i - PEAK) / 2.4, 2)));
const forecast = demand.map((d, i) => d * (1 + 0.05 * Math.sin(i * 1.7)));
const BASE = 0.34;
const planned = forecast.map((f) => Math.max(BASE, Math.min(1, f * 1.08)));

const W = 560, H = 300, PAD = 28;
const x = (i: number) => PAD + (i / (N - 1)) * (W - PAD * 2);
const y = (v: number) => H - PAD - v * (H - PAD * 2.4);
const linePath = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

/** Scroll-driven peak-demand story: the chart is pinned while the five stages scroll past. */
export default function PeakFlow({ stages, labels }: { stages: Stage[]; labels: Labels }) {
  const [step, setStep] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setStep(Number((e.target as HTMLElement).dataset.step));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const bw = ((W - PAD * 2) / N) * 0.62;
  const capacity = (i: number) => {
    if (step < 2) return BASE;
    if (step < 4 && i > PEAK) return Math.max(planned[i], planned[PEAK]); // not yet released
    return planned[i];
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
      <ol className="order-2 lg:order-1">
        {stages.map((s, i) => (
          <li
            key={s.t}
            ref={(el) => { refs.current[i] = el; }}
            data-step={i}
            className="flex min-h-[40vh] items-center lg:min-h-[50vh]"
          >
            <div className="transition-colors duration-500">
              <span className={`num text-sm transition-colors ${step === i ? "text-brand-bright" : "text-white/55"}`}>0{i + 1} / 05</span>
              <h4 className={`mt-2 font-display text-3xl font-semibold transition-colors sm:text-4xl ${step === i ? "text-white" : "text-white/55"}`}>{s.t}</h4>
              <p className={`mt-3 max-w-sm text-lg transition-colors ${step === i ? "text-white/80" : "text-white/55"}`}>{s.d}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="order-1 lg:order-2">
        <div className="sticky top-20 z-10 rounded-xl border border-white/10 bg-ink-2/90 p-4 backdrop-blur sm:p-6 lg:top-28">
          <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/65">
            <span className="flex items-center gap-2"><span className="h-0.5 w-5 bg-white" />{labels.demand}</span>
            <span className="flex items-center gap-2"><span className="h-3 w-2.5 rounded-sm bg-brand-bright" />{labels.capacity}</span>
            <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-white" />{labels.standby}</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${stages[step].t}: ${stages[step].d}. ${labels.illustrative}`}>
            {/* grid */}
            {[0.25, 0.5, 0.75, 1].map((g) => (
              <line key={g} x1={PAD} x2={W - PAD} y1={y(g)} y2={y(g)} stroke="rgba(255,255,255,0.06)" />
            ))}
            {/* capacity bars */}
            {Array.from({ length: N }, (_, i) => {
              const v = capacity(i);
              const released = step >= 4 && i > PEAK;
              return (
                <rect
                  key={i}
                  x={x(i) - bw / 2}
                  width={bw}
                  y={y(v)}
                  height={H - PAD - y(v)}
                  rx={3}
                  fill={released ? "rgba(142,162,255,0.4)" : "#8ea2ff"}
                  opacity={0.85}
                  style={{ transition: `y .8s cubic-bezier(.16,1,.3,1) ${i * 30}ms, height .8s cubic-bezier(.16,1,.3,1) ${i * 30}ms, fill .6s` }}
                />
              );
            })}
            {/* control ticks (attendance & performance checks) */}
            {Array.from({ length: N }, (_, i) => (
              <path
                key={`c${i}`}
                d={`M${x(i) - 4} ${y(capacity(i)) - 10} l3 3 l6 -6`}
                stroke="#ffffff"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                style={{ opacity: step >= 3 ? 1 : 0, transition: `opacity .4s ${i * 40}ms` }}
              />
            ))}
            {/* forecast (dashed) */}
            <path d={linePath(forecast)} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeDasharray="5 6"
              style={{ opacity: step >= 0 ? 1 : 0, transition: "opacity .6s" }} />
            {/* actual demand */}
            <path d={linePath(demand)} fill="none" stroke="#fff" strokeWidth="2.5" pathLength={1} strokeDasharray="1"
              style={{ strokeDashoffset: step >= 3 ? 0 : 1, transition: "stroke-dashoffset 1.4s ease" }} />
            {/* standby pool */}
            <g style={{ opacity: step >= 1 && step < 4 ? 1 : 0, transition: "opacity .6s" }}>
              {Array.from({ length: 18 }, (_, k) => (
                <circle
                  key={k}
                  cx={W - PAD - 8 - (k % 6) * 11}
                  cy={PAD + 6 + Math.floor(k / 6) * 11}
                  r="3.2"
                  fill="#ffffff"
                  style={{
                    opacity: step === 2 && k % 3 === 0 ? 0.25 : 1,
                    transition: "opacity .6s",
                  }}
                />
              ))}
            </g>
            {/* review badge */}
            <g style={{ opacity: step >= 4 ? 1 : 0, transition: "opacity .6s .6s" }}>
              <rect x={W - PAD - 92} y={PAD - 4} width="92" height="26" rx="13" fill="rgba(79,227,193,0.12)" stroke="#ffffff" />
              <text x={W - PAD - 46} y={PAD + 13} textAnchor="middle" className="fill-white text-[12px] font-semibold">✓ {stages[4].t}</text>
            </g>
          </svg>
          <p className="mt-3 text-xs text-white/65">{labels.illustrative}</p>
          <div className="mt-4 flex gap-1.5" aria-hidden="true">
            {stages.map((s, i) => (
              <span key={s.t} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-brand-bright" : "bg-white/10"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
