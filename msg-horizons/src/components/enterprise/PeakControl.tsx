"use client";

import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import EmbeddedPhoto from "../ui/EmbeddedPhoto";

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
const PHOTOS = ["/photos/clean/business.webp", "/photos/clean/team.webp", "/photos/clean/courier-mall.webp", "/photos/clean/fleet-car.webp", "/photos/msg/warehouse-floor.webp"];
const POS = ["50% 40%", "50% 100%", "55% 50%", "50% 65%", "50% 50%"];

/**
 * Peak control: one season, played by the scroll. A playhead sweeps a demand wave; capacity is built
 * ahead of it, the standby pool is called in at Mobilise, held under Control and released at
 * Demobilise. Each stage takes the panel with MSG photography dissolved into the glass behind it.
 */
export default function PeakControl({ stages, labels }: { stages: Stage[]; labels: Labels }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.4 });
  const head = useTransform(p, [0.04, 0.96], [0, 1], { clamp: true });
  const headX = useTransform(head, (t) => X(t));
  const headY = useTransform(head, (t) => Y(capacity(t)));
  const reveal = useTransform(head, (t) => X(t) - 20);
  const [stage, setStage] = useState(0);
  useMotionValueEvent(head, "change", (t) => {
    const s = STARTS.filter((x) => t >= x).length - 1;
    if (s !== stage) setStage(Math.max(0, s));
  });

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + span * (0.04 + (STARTS[i] + 0.1) * 0.92), behavior: reduce ? "auto" : "smooth" });
  };

  const active = reduce ? 4 : stage;
  const pool = Array.from({ length: 24 }, (_, k) => k);
  const called = active >= 2 && active < 4 ? (active === 2 ? 14 : 18) : 0;

  return (
    <div ref={ref} className={reduce ? "" : "relative h-[380vh]"}>
      <div className={reduce ? "" : "sticky top-16 flex h-[calc(100svh-4rem)] items-center"}>
        <div className="relative w-full overflow-hidden rounded-[28px] border border-white bg-white/85 shadow-[0_40px_80px_-40px_rgba(11,58,64,0.55)] backdrop-blur">
          {/* the stage's photo, dissolved behind the words and fading toward the chart */}
          <motion.div key={`ph-${active}`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="pointer-events-none absolute inset-0" aria-hidden="true">
            <EmbeddedPhoto src={PHOTOS[active]} position={POS[active]} tone="teal" fade="bottom" strength={0.4} className="absolute inset-x-0 top-0 h-1/2 opacity-30 lg:hidden" />
            <EmbeddedPhoto src={PHOTOS[active]} position={POS[active]} tone="teal" fade="end" strength={0.4} className="absolute inset-y-0 start-0 hidden w-3/5 opacity-30 lg:block" />
          </motion.div>
          <div className="relative grid gap-4 p-5 sm:p-8 lg:grid-cols-[0.9fr_1.6fr] lg:gap-10">
            {/* the stage */}
            <div className="flex flex-col">
              <div role="tablist" aria-label={labels.capacity} className="flex gap-1.5">
                {stages.map((s, i) => (
                  <button
                    key={s.t}
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    onClick={() => jump(i)}
                    className={`num h-8 min-w-8 rounded-full px-2.5 text-xs font-semibold transition-all duration-500 ${i === active ? "bg-teal text-white shadow-[0_8px_20px_-8px_rgba(19,113,121,0.9)]" : i < active ? "bg-sea-200 text-teal-deep" : "bg-white text-teal-deep/60 ring-1 ring-teal/15"}`}
                  >
                    0{i + 1}
                  </button>
                ))}
              </div>
              <div className="relative mt-6 min-h-[150px] sm:min-h-[170px]">
                <motion.div
                  key={active}
                  initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="num text-sm font-semibold text-teal">0{active + 1} / 05</p>
                  <h4 className="mt-1 font-display text-4xl font-semibold tracking-[-0.02em] text-teal-deep sm:text-5xl rtl:tracking-normal">{stages[active].t}</h4>
                  <p className="mt-3 max-w-sm text-lg text-teal-deep/80">{stages[active].d}</p>
                </motion.div>
              </div>
              <div className="mt-auto hidden flex-wrap gap-x-5 gap-y-2 pt-6 text-xs text-teal-deep/75 lg:flex">
                <Legend swatch="h-0.5 w-5 bg-teal-deep" label={labels.demand} />
                <Legend swatch="h-3 w-3 rounded-sm bg-teal" label={labels.capacity} />
                <Legend swatch="size-2 rounded-full bg-sea-400" label={labels.standby} />
              </div>
            </div>

            {/* the season */}
            <div>
              <div className="relative aspect-[1000/340] w-full rtl:-scale-x-100" dir="ltr">
                <svg viewBox={`0 0 ${VW} ${VH}`} className="absolute inset-0 size-full overflow-visible" role="img" aria-label={`${stages[active].t}: ${stages[active].d}. ${labels.illustrative}`}>
                  <defs>
                    <linearGradient id="pk-cap" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#137179" stopOpacity="0.95" />
                      <stop offset="1" stopColor="#137179" stopOpacity="0.55" />
                    </linearGradient>
                    <linearGradient id="pk-dem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#6cc3c3" stopOpacity="0.35" />
                      <stop offset="1" stopColor="#6cc3c3" stopOpacity="0" />
                    </linearGradient>
                    <clipPath id="pk-past">
                      {reduce ? <rect x="0" y="0" width={VW} height={VH} /> : <motion.rect x="0" y="0" height={VH} width={reveal} />}
                    </clipPath>
                  </defs>
                  {/* stage bands */}
                  {STARTS.map((s, i) => (
                    <g key={i}>
                      <rect x={X(s)} y={TOP - 10} width={X(s + 0.2) - X(s)} height={BOT - TOP + 10} fill={i === active ? "rgba(108,195,195,0.12)" : "transparent"} style={{ transition: "fill .5s" }} />
                      {i ? <line x1={X(s)} x2={X(s)} y1={TOP - 10} y2={BOT} stroke="rgba(19,113,121,0.14)" strokeDasharray="3 5" /> : null}
                    </g>
                  ))}
                  <line x1={X(0)} x2={X(1)} y1={BOT} y2={BOT} stroke="rgba(11,58,64,0.25)" />
                  {/* the future, faint */}
                  <path d={area(capacity)} fill="rgba(19,113,121,0.08)" />
                  <path d={line(forecast)} fill="none" stroke="rgba(11,58,64,0.35)" strokeWidth="2" strokeDasharray="5 7" />
                  {/* the past, solid */}
                  <g clipPath="url(#pk-past)">
                    <path d={area(demand)} fill="url(#pk-dem)" />
                    <path d={area(capacity)} fill="url(#pk-cap)" />
                    <path d={line(demand)} fill="none" stroke="#0b3a40" strokeWidth="2.6" />
                  </g>
                  {/* standby pool */}
                  <g style={{ opacity: active >= 1 ? 1 : 0.25, transition: "opacity .6s" }}>
                    {pool.map((k) => {
                      const on = k < called;
                      return (
                        <circle
                          key={k}
                          cx={VW - 150 + (k % 8) * 17}
                          cy={TOP - 22 + Math.floor(k / 8) * 15}
                          r="4.6"
                          fill={on ? "#137179" : "#6cc3c3"}
                          style={{ opacity: on ? 0.35 : 1, transition: `opacity .5s ${k * 25}ms, fill .5s ${k * 25}ms` }}
                        />
                      );
                    })}
                  </g>
                  {/* review tick */}
                  <g style={{ opacity: active === 4 ? 1 : 0, transition: "opacity .6s" }}>
                    <circle cx={X(0.9)} cy={Y(capacity(0.9)) - 26} r="13" fill="#0b7d36" />
                    <path d={`M${X(0.9) - 5} ${Y(capacity(0.9)) - 26} l3.5 3.5 l6.5 -7`} stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  {/* playhead */}
                  {!reduce ? (
                    <g>
                      <motion.line y1={TOP - 16} y2={BOT} stroke="#0b3a40" strokeWidth="1.5" x1={headX} x2={headX} />
                      <motion.circle r="9" fill="#fff" stroke="#137179" strokeWidth="3" cx={headX} cy={headY} />
                      <motion.circle r="20" fill="rgba(19,113,121,0.18)" cx={headX} cy={headY} />
                    </g>
                  ) : null}
                </svg>
              </div>
              <div className="mt-3 grid grid-cols-5 text-center text-[11px] font-medium text-teal-deep/70 sm:text-xs">
                {stages.map((s, i) => <span key={s.t} className={i === active ? "font-semibold text-teal-deep" : ""}>{s.t}</span>)}
              </div>
              <p className="mt-3 text-xs text-teal-deep/70">{labels.illustrative}</p>
            </div>
          </div>
          {/* season progress */}
          {!reduce ? <motion.div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 origin-left bg-teal rtl:origin-right" style={{ scaleX: head }} /> : null}
        </div>
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return <span className="flex items-center gap-2"><span className={swatch} />{label}</span>;
}
