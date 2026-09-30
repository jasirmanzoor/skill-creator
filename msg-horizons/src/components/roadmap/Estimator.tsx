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
    <div id="estimator" className="glass relative scroll-mt-24 overflow-hidden rounded-3xl p-5 sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 end-[-10%] size-[28rem] rounded-full bg-[#0f9641]/25 blur-3xl" />
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
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4cc97a] rtl:tracking-normal">{e.eyebrow}</p>
                <h3 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] text-white rtl:tracking-normal">{e.title}</h3>

                <p className="mt-6 text-sm font-medium text-white/80">{e.profile}</p>
                <div role="radiogroup" aria-label={e.profile} className="mt-2 flex flex-wrap gap-2">
                  {SEGMENTS.map((id) => {
                    const on = id === segment;
                    return (
                      <button key={id} type="button" role="radio" aria-checked={on} onClick={() => onSegment(id)} className="relative rounded-full px-3.5 py-2 text-sm transition-colors">
                        {on ? <motion.span layoutId="est-seg" transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 rounded-full bg-[#0b7d36] shadow-[0_0_24px_-6px_rgba(76,201,122,0.9)]" /> : <span className="absolute inset-0 rounded-full border border-white/15" />}
                        <span className={`relative ${on ? "text-white" : "text-white/70"}`}>{c.gate.segments[id].t}</span>
                      </button>
                    );
                  })}
                </div>

                <Range label={e.orders} value={`${net.orders.toLocaleString("en-US")} ${e.ordersUnit}`} min={0} max={1000} step={1}
                  current={Math.round(sliderFromOrders(net.orders) * 1000)} onChange={(v) => set("orders", ordersFromSlider(v / 1000))} />
                <Range label={e.cod} value={`${net.cod}%`} min={0} max={100} step={5} current={net.cod} onChange={(v) => set("cod", v)} />

                <p className="mt-6 text-sm font-medium text-white/80">{e.area}</p>
                <div role="radiogroup" aria-label={e.area} className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-white/[0.05] p-1">
                  {AREAS.map((a) => (
                    <button key={a} type="button" role="radio" aria-checked={net.area === a} onClick={() => set("area", a)} className="relative rounded-lg px-2 py-2 text-sm">
                      {net.area === a ? <motion.span layoutId="est-area" className="absolute inset-0 rounded-lg bg-white/15 ring-1 ring-white/20" transition={{ type: "spring", stiffness: 420, damping: 32 }} /> : null}
                      <span className={`relative ${net.area === a ? "text-white" : "text-white/60"}`}>{e.areas[a]}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-white/80">{e.stock}</p>
                  <button type="button" role="switch" aria-checked={net.stock} aria-label={e.stock} onClick={() => set("stock", !net.stock)}
                    className={`relative h-7 w-12 rounded-full transition-colors ${net.stock ? "bg-[#0b7d36]" : "bg-white/15"}`}>
                    <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 32 }} className={`absolute top-1 size-5 rounded-full bg-white shadow ${net.stock ? "end-1" : "start-1"}`} />
                  </button>
                </div>
              </div>

              {/* live read-out */}
              <motion.div layout className="relative self-start rounded-2xl border border-white/10 bg-black/25 p-5 backdrop-blur-md">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#4cc97a] rtl:tracking-normal">
                  <span className="relative inline-flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-[#4cc97a]/60 motion-reduce:hidden" /><span className="relative size-2 rounded-full bg-[#4cc97a]" /></span>
                  {t.planner.result.models[operatingModel({ persona, cargo: [], volume: volumeBand(net.orders), priorities: [] })].name}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    [c.plan.routes, s.baseRoutes],
                    [c.plan.couriers, s.baseCouriers],
                    [c.plan.peak, s.peakCouriers],
                  ].map(([k, v]) => (
                    <motion.div layout key={k as string} className="rounded-xl bg-white/[0.06] p-3">
                      <dt className="text-xs text-white/55">{k}</dt>
                      <dd className="num mt-1 font-display text-3xl font-semibold text-white"><NumberFlow value={v as number} locales="en-US" {...flow} /></dd>
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
                <p className="mt-3 text-xs text-white/50">{c.plan.example}</p>
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
        <label className="text-sm font-medium text-white/80">{label}</label>
        <output className="num font-display text-2xl font-semibold text-white">{value}</output>
      </div>
      <input type="range" aria-label={label} aria-valuetext={value} min={min} max={max} step={step} value={current}
        onChange={(ev) => onChange(+ev.target.value)} className="est-range mt-2 w-full" />
    </div>
  );
}
