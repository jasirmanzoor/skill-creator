"use client";

 
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { roadmapCopy, SEGMENT_ORDERS, SEGMENT_PERSONA, type Segment } from "@/content/roadmap";
import type { Dictionary, Locale } from "@/content/i18n";
import { DEFAULT_SIZER, type SizerInput } from "@/lib/sizer";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { track } from "@/lib/analytics";
import HookRoll from "./HookRoll";
import EmbeddedPhoto from "../ui/EmbeddedPhoto";
import SegmentGateway from "./SegmentGateway";
import RoadmapPath from "./RoadmapPath";
import StepStage, { TOUR_MS } from "./StepStage";
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
  const [touring, setTouring] = useState(false);
  useEffect(() => {
    if (!touring || step >= 5) return;
    const id = window.setTimeout(() => {
      setDir(1);
      setStep(step + 1);
      if (step + 1 >= 5) setTouring(false); // the tour ends on go-live
    }, TOUR_MS);
    return () => window.clearTimeout(id);
  }, [touring, step]);
  const go = (i: number) => {
    setTouring(false);
    if (i === step) return;
    setDir(i > step ? 1 : -1);
    setStep(i);
    track("planner_step", { step: i + 1, value: "roadmap" });
  };
  // "Walk me through my roadmap": from step one, the tour plays and the stage comes into view
  const startTour = () => {
    setDir(1);
    setStep(0);
    setTouring(true);
    track("cta_click", { cta: "tour", location: "gateway" });
    document.getElementById("roadmap-stage")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };
  const toEstimator = () => {
    if (!segment) chooseSegment("social");
    document.getElementById("estimator")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <section id="journey" ref={ref} aria-labelledby="roadmap-title" className="sea-band relative scroll-mt-16 overflow-hidden py-24 text-teal-deep lg:py-32">
      {/* backdrop: MSG's warehouse dissolved into the sea-glass light, with a slow parallax */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden [contain:paint]">
        <motion.div style={reduce ? undefined : { y: bgY }} className="absolute inset-x-0 -top-[8%] h-[70%]">
          <EmbeddedPhoto src="/photos/msg/warehouse-floor.webp" tone="teal" fade="bottom" strength={0.35} className="size-full opacity-25" />
        </motion.div>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_85%_0%,rgba(196,233,231,0.7),transparent_70%),linear-gradient(to_bottom,rgba(243,251,251,0.2),#f3fbfb_55%)]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {/* entry gate */}
        <div className="max-w-4xl">
          <p className="text-sm font-semibold text-teal">{c.eyebrow}</p>
          <HookRoll phrases={c.rolls} className="mt-3 text-lg font-medium text-teal-deep/90 sm:text-xl" />
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
          <SegmentGateway lang={lang} value={segment} onChange={chooseSegment} onWalk={startTour} />
        </div>

        {/* the roadmap */}
        <div className="sea-glass mt-6 rounded-3xl p-5 sm:p-8">
          <RoadmapPath labels={c.steps.map((s) => s.t)} active={step} onSelect={go} stepLabel={c.stepLabel} rtl={lang === "ar"} />
          {/* mobile step rail */}
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:hidden" role="tablist" aria-label={c.stepLabel}>
            {c.steps.map((s, i) => (
              <button key={s.t} type="button" role="tab" aria-selected={i === step} aria-controls="roadmap-stage" onClick={() => go(i)}
                className={`num shrink-0 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${i === step ? "border-teal bg-teal text-white" : i < step ? "border-teal/30 bg-sea-100 text-teal-deep" : "border-teal/23 text-teal-deep/75"}`}>
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
          <div className="md:mt-16">
            <StepStage lang={lang} step={step} dir={dir} segment={segment} net={net} touring={touring} onTour={() => { setTouring((t) => !t); track("cta_click", { cta: "tour", location: "roadmap" }); }} />
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <button type="button" onClick={() => go(Math.max(0, step - 1))} disabled={step === 0} className="rounded-full px-4 py-2 text-sm text-teal-deep/80 transition-opacity hover:text-teal-deep disabled:opacity-30">{c.prev}</button>
            {step < 5 ? (
              <button type="button" onClick={() => go(step + 1)} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-teal-deep ring-1 ring-teal/28 backdrop-blur hover:bg-white">{c.next}</button>
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
