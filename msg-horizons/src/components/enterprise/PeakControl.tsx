"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/i18n";
import { leadershipCopy, type LeaderId } from "@/content/leadership";
import { EASE_OUT } from "@/lib/motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";

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
/** while it plays by itself: each stage holds this long, then the outro holds for OUTRO_MS */
const STAGE_MS = 2600, OUTRO_MS = 11000;

export type Leader = { id: LeaderId; photo: string; name: string | null };

/**
 * Peak control, the closing argument: one season laid out whole, from the first demand signal to the closeout.
 * The chart shows demand against the capacity MSG deploys; the five stages sit directly under the part of the
 * season they govern, so the page reads left to right as one controlled path. Choosing a stage marks its span
 * on the chart, moves the marker there and shows how much of the standby pool is on shift.
 *
 * While in view the season plays itself, stage by stage, and ends on an outro: the graph steps back and MSG's
 * record (verified figures) rises in its place, followed by its leadership, portrait and a line each. A leader
 * appears only once their portrait has been supplied. Touching any stage hands control to the visitor.
 */
export default function PeakControl({ stages, labels, lang, leaders = [] }: { stages: Stage[]; labels: Labels; lang: Locale; leaders?: Leader[] }) {
  const o = leadershipCopy[lang];
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const [active, setActiveRaw] = useState(0);
  const [outro, setOutro] = useState(false);
  const [inView, setInView] = useState(false);
  const [taken, setTaken] = useState(false); // the visitor has taken over: no more autoplay
  const setActive = (i: number) => { setTaken(true); setOutro(false); setActiveRaw(i); };

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // the season plays through, then the outro, then it starts again
  useEffect(() => {
    if (reduce || taken || !inView) return;
    const id = window.setTimeout(() => {
      if (outro) { setOutro(false); setActiveRaw(0); }
      else if (active < stages.length - 1) setActiveRaw(active + 1);
      else setOutro(true);
    }, outro ? OUTRO_MS : STAGE_MS);
    return () => window.clearTimeout(id);
  }, [reduce, taken, inView, outro, active, stages.length]);

  const pool = Array.from({ length: 24 }, (_, k) => k);
  const called = CALLED[active];
  const at = STARTS[active] + 0.1;

  return (
    <div ref={box} className="relative overflow-hidden rounded-[28px] bg-teal-deep text-white shadow-[var(--shadow-scene)]">
      {/* the outro's backdrop: the hub floor, softened (pre-blurred file, so nothing blurs live), under a teal wash */}
      <AnimatePresence>
        {outro ? (
          <motion.div key="bg" aria-hidden="true" className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.8, ease: EASE_OUT }}>
            <motion.img
              src="/media/msg/hub-floor-soft.webp"
              alt=""
              className="absolute inset-0 size-full object-cover"
              initial={reduce ? false : { scale: 1.12 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: EASE_OUT }}
            />
            <span className="absolute inset-0 bg-[linear-gradient(115deg,rgba(8,38,43,0.9)_0%,rgba(8,38,43,0.62)_50%,rgba(26,18,10,0.55)_100%)]" />
            <span className="absolute -start-24 -top-24 size-96 rounded-full bg-[radial-gradient(closest-side,rgba(230,196,140,0.18),transparent)]" />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="relative p-5 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs text-white/75">
          <p className={`flex flex-wrap gap-x-5 gap-y-2 transition-opacity duration-500 ${outro ? "opacity-0" : ""}`}>
            <Legend swatch="h-0.5 w-5 bg-white" label={labels.demand} />
            <Legend swatch="size-3 rounded-sm bg-brand-bright" label={labels.capacity} />
            <Legend swatch="size-2 rounded-full bg-sea-400" label={labels.standby} />
          </p>
          <p className="flex items-center gap-4">
            <span className={`max-w-md text-white/60 transition-opacity duration-500 ${outro ? "opacity-0" : ""}`}>{labels.illustrative}</span>
            <button
              type="button"
              aria-pressed={outro}
              onClick={() => { setTaken(true); setOutro((x) => !x); }}
              className="shrink-0 rounded-full bg-white/10 px-3.5 py-2 font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/20"
            >
              {outro ? o.replay : o.open}
            </button>
          </p>
        </div>

        <div className="relative">
        {/* the season steps back while the outro plays */}
        <div aria-hidden={outro || undefined} inert={outro} className={`transition-[opacity,filter,transform] duration-700 ease-out ${outro ? "scale-[0.97] opacity-0" : ""}`}>

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

        <AnimatePresence>
          {outro ? <Outro key="outro" lang={lang} leaders={leaders} reduce={reduce} /> : null}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/**
 * The record, then the people: rises out of the graph once the season is done. The figures sit as one quiet row;
 * the leaders take the stage as full-height portraits with their own words over the image, in the warm dark of
 * MSG's own quote cards (gold accent on the second half of each line, role in spaced capitals under a gold rule).
 */
const GOLD = "#e6c48c";
/** translucent glass over the softened hub: a light fill, a frosted backdrop, a hairline and a lit top edge */
const GLASS = "bg-white/[0.07] ring-1 ring-white/15 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_30px_60px_-34px_rgba(0,0,0,0.7)]";
function Outro({ lang, leaders, reduce }: { lang: Locale; leaders: Leader[]; reduce: boolean }) {
  const o = leadershipCopy[lang];
  const rise = (delay: number, y = 18) => (reduce ? {} : { initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.7, ease: EASE_OUT } });
  const people = leaders.length > 0;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className={`absolute inset-0 grid gap-6 overflow-y-auto ${people ? (leaders.length > 1 ? "lg:grid-cols-[0.8fr_1.2fr] lg:gap-8" : "lg:grid-cols-[1.15fr_0.85fr] lg:gap-8") : "content-center"}`}
    >
      {/* the record, on a pane of glass */}
      <div className={`flex flex-col justify-center rounded-2xl p-6 sm:p-7 ${GLASS}`}>
        <motion.p {...rise(0.1)} className="text-[11px] font-semibold uppercase tracking-[0.22em] rtl:tracking-normal" style={{ color: GOLD }}>{o.eyebrow}</motion.p>
        <motion.h3 {...rise(0.2)} className="mt-3 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.025em] text-balance sm:text-4xl rtl:leading-snug rtl:tracking-normal">
          {people ? o.title : o.titleRecord}
        </motion.h3>
        <motion.span {...rise(0.3)} aria-hidden="true" className="mt-5 block h-px w-12" style={{ background: GOLD }} />
        <dl className={`mt-6 grid gap-x-6 gap-y-5 ${people ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
          {o.achievements.map((a, i) => (
            <motion.div key={a.l} {...rise(0.4 + i * 0.08, 10)} className="border-t border-white/15 pt-3">
              <dd className={`font-display text-2xl font-semibold tracking-[-0.02em] tabular-nums sm:text-[1.75rem] rtl:tracking-normal ${lang === "ar" ? "" : "num"}`} dir={lang === "ar" ? "rtl" : "ltr"}>{a.v}</dd>
              <dt className="mt-1 text-xs uppercase tracking-[0.12em] text-white/55 rtl:tracking-normal">{a.l}</dt>
            </motion.div>
          ))}
        </dl>
      </div>

      {/* the people */}
      {people ? (
        <div className={`grid gap-3 ${leaders.length > 1 ? "sm:grid-cols-2" : ""}`}>
          {leaders.map((l, i) => (
            <motion.figure
              key={l.id}
              {...(reduce ? {} : { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.9 + i * 0.3, duration: 0.9, ease: EASE_OUT } })}
              className="relative min-h-[380px] overflow-hidden rounded-2xl bg-[#14110d] ring-1 ring-white/20 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] lg:min-h-0"
            >
              <motion.div
                className="absolute inset-0"
                {...(reduce ? {} : { initial: { scale: 1.08 }, animate: { scale: 1 }, transition: { delay: 0.9 + i * 0.3, duration: 2.4, ease: EASE_OUT } })}
              >
                <Image src={`/${l.photo}`} alt={l.name ? `${l.name}, ${o.roles[l.id]}` : o.roles[l.id]} fill sizes="(min-width: 1024px) 34vw, 90vw" className="object-cover [object-position:50%_20%]" />
              </motion.div>
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,6,0)_45%,rgba(10,8,6,0.45)_100%)]" />
              {/* the words on a frosted pane over the portrait */}
              <figcaption className="absolute inset-x-3 bottom-3 rounded-xl bg-black/25 p-4 ring-1 ring-white/15 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] sm:p-5">
                <blockquote className="font-display text-lg leading-snug tracking-[-0.01em] text-white text-pretty sm:text-xl rtl:tracking-normal">
                  <span aria-hidden="true" className="-mb-3 block h-9 font-serif text-6xl leading-none" style={{ color: GOLD }}>“</span>
                  {o.quotes[l.id][0]} <span style={{ color: GOLD }}>{o.quotes[l.id][1]}</span>
                </blockquote>
                <span aria-hidden="true" className="mt-3 block h-px w-10" style={{ background: GOLD }} />
                {l.name ? <span className="mt-3 block text-sm font-semibold text-white">{l.name}</span> : null}
                <span className="mt-2 block text-[11px] font-medium uppercase tracking-[0.24em] text-white/75 rtl:tracking-normal">{o.roles[l.id]}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return <span className="flex items-center gap-2"><span className={swatch} />{label}</span>;
}
