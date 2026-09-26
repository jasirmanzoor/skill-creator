"use client";

import { facts } from "@/content/facts";
import { planVisual } from "@/content/planVisual";
import type { Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { buildPlan, type PlanInput } from "@/lib/planner";
import { useEffect, useMemo, useState } from "react";

const RIDE = "M72 214 C 150 214 168 96 228 96 S 312 168 368 168 S 456 86 518 86 S 612 206 656 206";

type Phase = "idle" | "origin" | "hub" | "road" | "door" | "delivered";

type Props = {
  locale: Locale;
  input: PlanInput | null;
  complete?: boolean;
};

function phaseOf(input: PlanInput | null, complete: boolean): Phase {
  if (complete) return "delivered";
  if (!input) return "idle";
  if (input.priorities.length) return "door";
  if (input.volume && input.volume !== "starting") return "road";
  if (input.cargo.length) return "hub";
  return "origin";
}

const PHASE_ORDER: Phase[] = ["idle", "origin", "hub", "road", "door", "delivered"];

export default function PlanStage({ locale, input, complete = false }: Props) {
  const copy = planVisual[locale];
  const reduce = useReducedMotion();
  const phase = phaseOf(input, complete);
  const plan = input ? buildPlan(input) : null;
  const tracking = !plan || plan.modules.some((m) => m.id === "tracking");
  const storage = Boolean(input?.cargo.includes("storage") || plan?.modules.some((m) => m.id === "warehousing"));
  const freight = Boolean(input?.cargo.includes("freight") || input?.cargo.includes("b2b"));
  const people = Boolean(input?.cargo.includes("people") || plan?.modules.some((m) => m.id === "manpower"));
  const ghosts =
    input?.volume === "high" ? 3 : input?.volume === "scaling" ? 2 : input?.volume === "steady" ? 1 : 0;

  const scans = copy.scans[phase];
  const [scanIx, setScanIx] = useState(0);
  useEffect(() => {
    setScanIx(0);
    if (reduce || scans.length < 2) return;
    const id = window.setInterval(() => setScanIx((n) => (n + 1) % scans.length), 2400);
    return () => window.clearInterval(id);
  }, [phase, reduce, scans.length]);

  const rideDur = reduce ? 0 : phase === "delivered" ? 5.6 : phase === "idle" ? 10 : 7.2;
  const marks = useMemo(() => {
    const out: string[] = [];
    if (input?.persona) out.push(copy.personaMark[input.persona]);
    input?.cargo.slice(0, 2).forEach((c) => out.push(copy.cargoMark[c]));
    if (input?.volume) out.push(copy.volumeMark[input.volume]);
    return out.slice(0, 3);
  }, [copy, input]);

  return (
    <div className="relative overflow-hidden bg-[#0b0d12] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(31,67,224,0.22),transparent_46%),radial-gradient(ellipse_at_90%_80%,rgba(142,162,255,0.1),transparent_42%)]" />
      <div className="relative flex items-start justify-between gap-4 px-5 pt-4 sm:px-7">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8ea2ff]">
            <span className="relative inline-flex size-1.5">
              <span className="absolute inset-0 rounded-full bg-[#8ea2ff] plan-ping" />
              <span className="relative size-1.5 rounded-full bg-[#8ea2ff]" />
            </span>
            {copy.live}
          </p>
          <p className="mt-1 font-display text-lg font-semibold tracking-[-0.03em] text-white sm:text-xl rtl:tracking-normal">
            {copy.status[phase]}
          </p>
          <p className="mt-0.5 text-xs text-white/55">{copy.hq}</p>
        </div>
        <div className="text-end">
          <p className="font-display text-sm font-semibold text-white">
            <span className="num">{facts.metrics.operations.display}</span>
            <span className="ms-1 text-white/50">{copy.ops}</span>
          </p>
          <p className="mt-1 text-[11px] text-[#8ea2ff]">{tracking ? copy.trackingOn : copy.trackingOff}</p>
        </div>
      </div>

      <svg viewBox="0 0 720 300" className="relative mt-1 block h-[210px] w-full sm:h-[248px]" role="img" aria-label={copy.canvasLabel}>
        <defs>
          <linearGradient id="plan-route" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8ea2ff" />
            <stop offset="1" stopColor="#1f43e0" />
          </linearGradient>
          <filter id="plan-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {Array.from({ length: 18 }, (_, i) => (
          <circle key={i} cx={40 + ((i * 97) % 660)} cy={40 + ((i * 53) % 230)} r={1.1} fill="#fff" opacity={0.08} />
        ))}

        <path d={RIDE} fill="none" stroke="#2a3140" strokeWidth="10" strokeLinecap="round" />
        <path d={RIDE} fill="none" stroke="url(#plan-route)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="7 9" className={reduce ? undefined : "plan-dash"} opacity={phase === "idle" ? 0.35 : 1} />

        {storage ? <HubBox x={214} y={58} lit label={locale === "ar" ? "مستودع" : "Warehouse"} /> : null}
        <Node x={72} y={214} lit={phase !== "idle"} title={copy.stages[0].label} sub={locale === "ar" ? "البائع" : "Origin"} />
        <Node x={368} y={168} lit={PHASE_ORDER.indexOf(phase) >= 2} title={copy.stages[1].label} sub={locale === "ar" ? "الرياض" : "Riyadh"} />
        <Node x={518} y={86} lit={PHASE_ORDER.indexOf(phase) >= 3} title={copy.stages[2].label} sub={freight ? (locale === "ar" ? "شاحنة" : "Freight") : locale === "ar" ? "أسطول" : "Fleet"} />
        <Door x={656} y={206} lit={PHASE_ORDER.indexOf(phase) >= 4} people={people || phase === "delivered"} label={copy.stages[3].label} />

        {!reduce && ghosts > 0
          ? Array.from({ length: ghosts }, (_, i) => (
              <GhostParcel key={`${phase}-g-${i}`} delay={1.4 + i * 1.6} dur={rideDur + 2} />
            ))
          : null}

        <g filter="url(#plan-soft)">
          <Parcel reduce={reduce} dur={rideDur} parked={reduce || phase === "idle"} complete={phase === "delivered"} />
        </g>
      </svg>

      <div className="relative grid grid-cols-4 gap-px border-t border-white/10 bg-white/5">
        {copy.stages.map((s, i) => {
          const on = PHASE_ORDER.indexOf(phase) >= i + 1;
          return (
            <div key={s.id} className={`px-2 py-2.5 text-center sm:px-3 ${on ? "bg-white/10" : ""}`}>
              <p className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${on ? "text-[#8ea2ff]" : "text-white/35"}`}>
                0{i + 1}
              </p>
              <p className={`mt-0.5 text-xs ${on ? "text-white" : "text-white/45"}`}>{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-5 py-3 sm:px-7">
        <p className="text-xs text-white/70" aria-live="polite">
          <span className="me-2 inline-block size-1.5 rounded-full bg-[#8ea2ff] align-middle" />
          {scans[scanIx] ?? scans[0]}
        </p>
        <p className="text-[11px] text-white/40">{phase === "idle" ? copy.captionIdle : copy.captionLive}</p>
      </div>

      {marks.length ? (
        <div className="relative flex flex-wrap gap-1.5 border-t border-white/10 px-5 py-2.5 sm:px-7">
          {marks.map((m) => (
            <span key={m} className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/80">
              {m}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Node({ x, y, lit, title, sub }: { x: number; y: number; lit: boolean; title: string; sub: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {lit ? <circle r="18" fill="#1f43e0" opacity="0.22" className="plan-glow" /> : null}
      <circle r="7.5" fill={lit ? "#1f43e0" : "#1c2230"} stroke={lit ? "#8ea2ff" : "#3a4254"} strokeWidth="1.5" />
      <circle r="2.2" fill={lit ? "#fff" : "#6b7384"} />
      <text y="24" textAnchor="middle" fill={lit ? "#fff" : "#8b9098"} fontSize="10" fontWeight="600">{title}</text>
      <text y="36" textAnchor="middle" fill="#6b7384" fontSize="9">{sub}</text>
    </g>
  );
}

function HubBox({ x, y, lit, label }: { x: number; y: number; lit: boolean; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={lit ? 1 : 0.45}>
      <rect x="-22" y="-14" width="44" height="28" rx="4" fill="#151922" stroke="#3a4254" />
      <rect x="-14" y="-6" width="10" height="12" fill="#1f43e0" opacity="0.85" />
      <rect x="0" y="-6" width="10" height="12" fill="#8ea2ff" opacity="0.55" />
      <text y="28" textAnchor="middle" fill="#8ea2ff" fontSize="9">{label}</text>
    </g>
  );
}

function Door({ x, y, lit, people, label }: { x: number; y: number; lit: boolean; people: boolean; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {lit ? <circle r="22" fill="#1f43e0" opacity="0.18" className="plan-glow" /> : null}
      <rect x="-11" y="-20" width="22" height="28" rx="2" fill={lit ? "#1f43e0" : "#151922"} stroke={lit ? "#8ea2ff" : "#3a4254"} />
      <rect x="-4" y="-6" width="5" height="14" fill="#0b0d12" opacity="0.45" />
      {people ? (
        <g transform="translate(18 -6)">
          <circle cy="-6" r="3" fill="#fff" />
          <path d="M-4 2 Q0 -2 4 2 V8 H-4 Z" fill="#fff" />
        </g>
      ) : null}
      <text y="26" textAnchor="middle" fill={lit ? "#fff" : "#8b9098"} fontSize="10" fontWeight="600">{label}</text>
    </g>
  );
}

function Parcel({ reduce, dur, parked, complete }: { reduce: boolean; dur: number; parked: boolean; complete: boolean }) {
  const inner = (
    <g>
      <rect x="-11" y="-8" width="22" height="16" rx="3" fill="#f4f1ea" />
      <rect x="-11" y="-1" width="22" height="3" fill="#1f43e0" />
      <rect x="-1.5" y="-8" width="3" height="16" fill="#1f43e0" opacity="0.35" />
      {!reduce && !parked ? (
        <circle r="16" fill="none" stroke="#8ea2ff" strokeWidth="1" className="plan-ping origin-center" opacity="0.7" />
      ) : null}
    </g>
  );
  if (parked) return <g transform="translate(72 214)">{inner}</g>;
  if (complete) {
    return (
      <g>
        {inner}
        <animateMotion dur={`${dur}s`} repeatCount="1" fill="freeze" rotate="auto" path={RIDE} />
      </g>
    );
  }
  return (
    <g>
      {inner}
      <animateMotion dur={`${dur}s`} repeatCount="indefinite" rotate="auto" path={RIDE} />
    </g>
  );
}

function GhostParcel({ delay, dur }: { delay: number; dur: number }) {
  return (
    <g opacity="0.28">
      <rect x="-8" y="-6" width="16" height="12" rx="2" fill="#8ea2ff" />
      <animateMotion dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" rotate="auto" path={RIDE} />
    </g>
  );
}
