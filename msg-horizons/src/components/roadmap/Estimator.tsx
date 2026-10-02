"use client";

import NumberFlow from "@number-flow/react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useMemo, useState } from "react";
import { roadmapCopy, SEGMENTS, SEGMENT_PERSONA, type Segment } from "@/content/roadmap";
import type { Dictionary, Locale } from "@/content/i18n";
import { ordersFromSlider, size, sliderFromOrders, volumeBand, AREAS, type SizerInput } from "@/lib/sizer";
import { operatingModel } from "@/lib/planner";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { track } from "@/lib/analytics";
import PlanCard from "./PlanCard";

/**
 * The terminus of the roadmap: profile, volume, cash share, area and storage in; a live structure out.
 * Every change morphs the containers (shared layout) and rolls the numbers; "Generate my plan"
 * teleports the panel into the Curated Recommendation Plan.
 */
export default function Estimator({
  t, lang, segment, onSegment, net, onNet,
}: {
  t: Dictionary; lang: Locale; segment: Segment; onSegment: (s: Segment) => void; net: SizerInput; onNet: (v: SizerInput) => void;
}) {
  const c = roadmapCopy[lang];
  const e = c.est;
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"input" | "plan">("input");
  const persona = SEGMENT_PERSONA[segment];
  const s = useMemo(() => size(net, persona), [net, persona]);
  const set = <K extends keyof SizerInput>(k: K, v: SizerInput[K]) => onNet({ ...net, [k]: v });
  const flow = reduce ? { animated: false } : {};

  return (
    <div id="estimator" className="sea-glass relative scroll-mt-24 overflow-hidden rounded-3xl p-5 sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 end-[-10%] size-[28rem] rounded-full bg-sea-100 blur-3xl" />
      <LayoutGroup>
        <AnimatePresence mode="wait" initial={false}>
          {phase === "input" ? (
            <motion.div
              key="input"
              layout
              initial={reduce ? false : { opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.97, filter: "blur(10px)" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative grid gap-8 lg:grid-cols-[1.25fr_1fr]"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal rtl:tracking-normal">{e.eyebrow}</p>
                <h3 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] text-teal-deep rtl:tracking-normal">{e.title}</h3>

                <p className="mt-6 text-sm font-medium text-teal-deep/85">{e.profile}</p>
                <div role="radiogroup" aria-label={e.profile} className="mt-2 flex flex-wrap gap-2">
                  {SEGMENTS.map((id) => {
                    const on = id === segment;
                    return (
                      <button key={id} type="button" role="radio" aria-checked={on} onClick={() => onSegment(id)} className="relative rounded-full px-3.5 py-2 text-sm transition-colors">
                        {on ? <motion.span layoutId="est-seg" transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 rounded-full bg-teal shadow-[0_8px_20px_-8px_rgba(19,113,121,0.9)]" /> : <span className="absolute inset-0 rounded-full border border-teal/23" />}
                        <span className={`relative ${on ? "text-white" : "text-teal-deep/80"}`}>{c.gate.segments[id].t}</span>
                      </button>
                    );
                  })}
                </div>

                <Range label={e.orders} value={`${net.orders.toLocaleString("en-US")} ${e.ordersUnit}`} min={0} max={1000} step={1}
                  current={Math.round(sliderFromOrders(net.orders) * 1000)} onChange={(v) => set("orders", ordersFromSlider(v / 1000))} />
                <Range label={e.cod} value={`${net.cod}%`} min={0} max={100} step={5} current={net.cod} onChange={(v) => set("cod", v)} />

                <p className="mt-6 text-sm font-medium text-teal-deep/85">{e.area}</p>
                <div role="radiogroup" aria-label={e.area} className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-white/75 p-1">
                  {AREAS.map((a) => (
                    <button key={a} type="button" role="radio" aria-checked={net.area === a} onClick={() => set("area", a)} className="relative rounded-lg px-2 py-2 text-sm">
                      {net.area === a ? <motion.span layoutId="est-area" className="absolute inset-0 rounded-lg bg-white ring-1 ring-teal/28" transition={{ type: "spring", stiffness: 420, damping: 32 }} /> : null}
                      <span className={`relative ${net.area === a ? "text-teal-deep" : "text-teal-deep/75"}`}>{e.areas[a]}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-teal-deep/85">{e.stock}</p>
                  <button type="button" role="switch" aria-checked={net.stock} aria-label={e.stock} onClick={() => set("stock", !net.stock)}
                    className={`relative h-7 w-12 rounded-full transition-colors ${net.stock ? "bg-teal" : "bg-white ring-1 ring-teal/25"}`}>
                    <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 32 }} className={`absolute top-1 size-5 rounded-full bg-white shadow ${net.stock ? "end-1" : "start-1"}`} />
                  </button>
                </div>
              </div>

              {/* live read-out */}
              <motion.div layout className="relative self-start rounded-2xl border border-white bg-sea-100/80 p-5 shadow-[0_24px_48px_-28px_rgba(19,113,121,0.5)] backdrop-blur-md">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal rtl:tracking-normal">
                  <span className="relative inline-flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-teal/60 motion-reduce:hidden" /><span className="relative size-2 rounded-full bg-teal" /></span>
                  {t.planner.result.models[operatingModel({ persona, cargo: [], volume: volumeBand(net.orders), priorities: [] })].name}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    [c.plan.routes, s.baseRoutes],
                    [c.plan.couriers, s.baseCouriers],
                    [c.plan.peak, s.peakCouriers],
                  ].map(([k, v]) => (
                    <motion.div layout key={k as string} className="rounded-xl bg-white/75 p-3">
                      <dt className="text-xs text-teal-deep/70">{k}</dt>
                      <dd className="num mt-1 font-display text-3xl font-semibold text-teal-deep"><NumberFlow value={v as number} locales="en-US" {...flow} /></dd>
                    </motion.div>
                  ))}
                </dl>
                <button
                  type="button"
                  onClick={() => { setPhase("plan"); track("planner_complete", { model: "roadmap_estimator", modules: segment }); document.getElementById("estimator")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 font-semibold text-ink shadow-[0_18px_40px_-18px_rgba(76,201,122,0.9)] transition-transform hover:-translate-y-0.5"
                >
                  {e.build}
                </button>
                <p className="mt-3 text-xs text-teal-deep/65">{c.plan.example}</p>
              </motion.div>
            </motion.div>
          ) : (
            <PlanCard key="plan" t={t} lang={lang} segment={segment} net={net} structure={s} onEdit={() => setPhase("input")} />
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}

function Range({ label, value, min, max, step, current, onChange }: { label: string; value: string; min: number; max: number; step: number; current: number; onChange: (v: number) => void }) {
  return (
    <div className="mt-6">
      <div className="flex items-end justify-between gap-4">
        <label className="text-sm font-medium text-teal-deep/85">{label}</label>
        <output className="num font-display text-2xl font-semibold text-teal-deep">{value}</output>
      </div>
      <input type="range" aria-label={label} aria-valuetext={value} min={min} max={max} step={step} value={current}
        onChange={(ev) => onChange(+ev.target.value)} className="est-range mt-2 w-full" />
    </div>
  );
}
