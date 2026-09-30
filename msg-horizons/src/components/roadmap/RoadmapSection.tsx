"use client";

/* eslint-disable @next/next/no-img-element -- local, pre-optimised webp backdrop */
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { roadmapCopy, SEGMENT_ORDERS, SEGMENT_PERSONA, type Segment } from "@/content/roadmap";
import type { Dictionary, Locale } from "@/content/i18n";
import { DEFAULT_SIZER, type SizerInput } from "@/lib/sizer";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { track } from "@/lib/analytics";
import HookRoll from "./HookRoll";
import SegmentGateway from "./SegmentGateway";
import RoadmapPath from "./RoadmapPath";
import StepStage from "./StepStage";
import Estimator from "./Estimator";

/**
 * "Our effortless service, mapped out for you."
 * Who you are → the six-step MSG roadmap → a live estimator that ends in a Curated Recommendation Plan.
 * Glass layers over MSG's own warehouse photography, with a slow parallax behind them.
 */
export default function RoadmapSection({ t, lang }: { t: Dictionary; lang: Locale }) {
  const c = roadmapCopy[lang];
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  const [segment, setSegment] = useState<Segment | null>(null);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [net, setNet] = useState<SizerInput>(DEFAULT_SIZER);

  const chooseSegment = (s: Segment) => {
    setSegment(s);
    setNet((n) => ({ ...n, orders: SEGMENT_ORDERS[s], window: SEGMENT_PERSONA[s] === "platform" ? "sameday" : n.window }));
    track("planner_step", { step: 0, value: `segment:${s}` });
  };
  const go = (i: number) => {
    if (i === step) return;
    setDir(i > step ? 1 : -1);
    setStep(i);
    track("planner_step", { step: i + 1, value: "roadmap" });
  };
  const toEstimator = () => {
    if (!segment) chooseSegment("social");
    document.getElementById("estimator")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <section id="journey" ref={ref} aria-labelledby="roadmap-title" data-theme="dark" className="on-dark relative scroll-mt-16 overflow-hidden bg-[#04110a] py-24 text-white lg:py-32">
      {/* backdrop: MSG warehouse, blurred, with slow parallax and brand light */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden [contain:paint]">
        <motion.div style={reduce ? undefined : { y: bgY }} className="absolute -inset-y-[8%] inset-x-0">
          <img src="/photos/clean/warehouse.webp" alt="" className="h-full w-full scale-110 object-cover opacity-30 blur-2xl" />
        </motion.div>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_15%_0%,rgba(15,150,65,0.35),transparent_70%),radial-gradient(50%_40%_at_90%_40%,rgba(76,201,122,0.18),transparent_70%),linear-gradient(to_bottom,rgba(4,17,10,0.55),#04110a_85%)]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {/* entry gate */}
        <div className="max-w-4xl">
          <p className="text-sm font-semibold text-[#4cc97a]">{c.eyebrow}</p>
          <HookRoll phrases={c.rolls} className="mt-3 text-lg font-medium text-white/85 sm:text-xl" />
          <h2 id="roadmap-title" className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-balance sm:text-6xl rtl:leading-[1.3] rtl:tracking-normal">
            {c.title}
          </h2>
          <p className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-lg">
            {c.theme.map((ph, i) => (
              <span key={ph} className="theme-shine bg-clip-text text-transparent" style={{ animationDelay: `${i * 0.6}s` }}>{ph}</span>
            ))}
          </p>
        </div>

        <div className="mt-12">
          <SegmentGateway lang={lang} value={segment} onChange={chooseSegment} />
        </div>

        {/* the roadmap */}
        <div className="glass mt-6 rounded-3xl p-5 sm:p-8">
          <RoadmapPath labels={c.steps.map((s) => s.t)} active={step} onSelect={go} stepLabel={c.stepLabel} rtl={lang === "ar"} />
          {/* mobile step rail */}
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:hidden" role="tablist" aria-label={c.stepLabel}>
            {c.steps.map((s, i) => (
              <button key={s.t} type="button" role="tab" aria-selected={i === step} aria-controls="roadmap-stage" onClick={() => go(i)}
                className={`num shrink-0 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${i === step ? "border-[#4cc97a]/60 bg-[#0b7d36] text-white" : i < step ? "border-[#4cc97a]/30 bg-[#0f9641]/20 text-white" : "border-white/15 text-white/60"}`}>
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
          <div className="md:mt-16">
            <StepStage lang={lang} step={step} dir={dir} />
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <button type="button" onClick={() => go(Math.max(0, step - 1))} disabled={step === 0} className="rounded-full px-4 py-2 text-sm text-white/70 transition-opacity hover:text-white disabled:opacity-30">{c.prev}</button>
            {step < 5 ? (
              <button type="button" onClick={() => go(step + 1)} className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/15">{c.next}</button>
            ) : (
              <button type="button" onClick={toEstimator} className="rounded-full bg-[#0b7d36] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_30px_-6px_rgba(76,201,122,0.9)] hover:bg-[#12a84b]">{c.toEstimator}</button>
            )}
          </div>
        </div>

        {/* terminus */}
        <div className="mt-6">
          <Estimator t={t} lang={lang} segment={segment ?? "social"} onSegment={chooseSegment} net={net} onNet={setNet} />
        </div>
      </div>
    </section>
  );
}
