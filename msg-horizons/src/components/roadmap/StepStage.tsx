"use client";

import { AnimatePresence, motion } from "motion/react";
import { guideCopy, roadmapCopy, type Segment } from "@/content/roadmap";
import type { Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { SizerInput } from "@/lib/sizer";
import GuideDevice from "./GuideDevice";

export const TOUR_MS = 7500;

/**
 * The split sub-screen for the active milestone: a phone performing the step for this visitor on one
 * side; on the other, the step with exactly what the visitor does and what MSG does, and what comes
 * next. "Walk me through it" plays the six steps as a guided tour.
 */
export default function StepStage({
  lang, step, dir, segment, net, touring, onTour,
}: { lang: Locale; step: number; dir: 1 | -1; segment: Segment | null; net: SizerInput; touring: boolean; onTour: () => void }) {
  const c = roadmapCopy[lang];
  const gc = guideCopy[lang];
  const s = c.steps[step];
  const role = gc.steps[step];
  const reduce = useReducedMotion();
  const pop = reduce
    ? {}
    : {
        initial: { opacity: 0, scale: 0.96, filter: "blur(10px)", x: 40 * dir },
        animate: { opacity: 1, scale: 1, filter: "blur(0px)", x: 0 },
        exit: { opacity: 0, scale: 0.98, filter: "blur(8px)", x: -30 * dir },
        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
      };
  return (
    <div id="roadmap-stage" role="tabpanel" aria-live="polite" className="relative mt-4 overflow-hidden rounded-3xl">
      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div key={step} {...pop} className="journey-card relative grid overflow-hidden rounded-3xl border border-teal/18 bg-white/75 md:grid-cols-[1.15fr_1fr]" data-active>
          <div className="relative">
            <GuideDevice lang={lang} step={step} segment={segment} net={net} />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal rtl:tracking-normal">
              {c.stepLabel} <span className="num">{String(step + 1).padStart(2, "0")}</span> / <span className="num">06</span>
            </p>
            <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.02em] text-teal-deep rtl:tracking-normal">{s.t}</h3>
            <p className="mt-3 text-lg text-teal-deep/80">{s.d}</p>
            <dl className="mt-6 grid gap-3">
              {([[gc.you, role.you, "you"], [gc.msg, role.msg, "msg"]] as const).map(([k, v, who], i) => (
                <motion.div
                  key={who}
                  initial={reduce ? false : { opacity: 0, x: 12 * dir }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
                  className={`rounded-2xl p-4 ring-1 ${who === "you" ? "bg-white/75 ring-teal/18" : "bg-sea-100 ring-teal/30"}`}
                >
                  <dt className={`text-xs font-semibold ${who === "you" ? "text-teal-deep/75" : "text-teal"}`}>{k}</dt>
                  <dd className="mt-1 text-teal-deep/95">{v}</dd>
                </motion.div>
              ))}
            </dl>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {s.points.map((pt) => (
                <li key={pt} className="rounded-full bg-white/75 px-3 py-1 text-xs text-teal-deep/80 ring-1 ring-teal/18">{pt}</li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-teal/18 pt-4">
              {step < 5 ? (
                <p className="text-sm text-teal-deep/75">{gc.nextUp}: <span className="font-medium text-teal-deep">{c.steps[step + 1].t}</span></p>
              ) : <span />}
              <button type="button" onClick={onTour} aria-pressed={touring} className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-teal-deep ring-1 ring-teal/28 hover:bg-white">
                {touring ? (
                  <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true"><path d="M3 2h2v8H3zM7 2h2v8H7z" fill="currentColor" /></svg>
                ) : (
                  <svg viewBox="0 0 12 12" className="size-3 rtl:-scale-x-100" aria-hidden="true"><path d="M3 1.8v8.4L10 6z" fill="currentColor" /></svg>
                )}
                {touring ? gc.pause : gc.walk}
              </button>
            </div>
          </div>
          {/* guided tour progress */}
          {touring && !reduce ? (
            <motion.span key={`tour-${step}`} aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left bg-teal rtl:origin-right" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: TOUR_MS / 1000, ease: "linear" }} />
          ) : null}
          {/* holographic flash-up */}
          {!reduce ? (
            <motion.span
              aria-hidden="true"
              initial={{ left: "-50%", opacity: 0 }}
              animate={{ left: ["-50%", "110%"], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
              className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-[#b5f5cc]/15 to-transparent mix-blend-screen"
            />
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
