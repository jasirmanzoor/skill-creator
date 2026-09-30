"use client";

import { AnimatePresence, motion } from "motion/react";
import { ROADMAP_STEPS, roadmapCopy } from "@/content/roadmap";
import type { Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { StageScene } from "./StageVisual";

/**
 * The split sub-screen for the active milestone: MSG photography + app card on one side, the step on the other.
 * Changing step "teleports" the panel (blur-scale pop) and a holographic sheen sweeps across it.
 */
export default function StepStage({ lang, step, dir }: { lang: Locale; step: number; dir: 1 | -1 }) {
  const c = roadmapCopy[lang];
  const s = c.steps[step];
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
        <motion.div key={step} {...pop} className="journey-card relative grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] md:grid-cols-[1.15fr_1fr]" data-active>
          <div className="relative [&>div]:border-b-0 md:[&>div]:h-full md:[&>div]:aspect-auto">
            <StageScene id={ROADMAP_STEPS[step].visual} lang={lang} />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4cc97a] rtl:tracking-normal">
              {c.stepLabel} <span className="num">{String(step + 1).padStart(2, "0")}</span> / <span className="num">06</span>
            </p>
            <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.02em] text-white rtl:tracking-normal">{s.t}</h3>
            <p className="mt-3 text-lg text-white/70">{s.d}</p>
            <ul className="mt-6 grid gap-2.5">
              {s.points.map((pt, k) => (
                <motion.li
                  key={pt}
                  initial={reduce ? false : { opacity: 0, x: 12 * dir }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + k * 0.08, duration: 0.4 }}
                  className="flex items-center gap-3 text-white/85"
                >
                  <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0b7d36] text-white">
                    <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true"><path d="M2.5 6.2l2.2 2.2 4.8-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  {pt}
                </motion.li>
              ))}
            </ul>
          </div>
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
