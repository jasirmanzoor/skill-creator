"use client";

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useRef } from "react";

/**
 * A cinematic interlude: content steps aside, the horizon fills the screen, and a statement
 * reveals line by line as the visitor scrolls (pinned, Apple-keynote style). All lines are real
 * text in the DOM for SEO and screen readers; only their emphasis animates.
 */
export default function Interlude({ lines, label, tone = "light" }: { lines: string[]; label: string; tone?: "light" | "dark" }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // While pinned, clear the stage: the MSG landmark fades out (see .msg-landmark in globals.css).
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const root = document.documentElement;
    const pinned = v > 0.18 && v < 0.86;
    if (pinned) root.dataset.interlude = label;
    else if (root.dataset.interlude === label) delete root.dataset.interlude;
  });
  return (
    <section ref={ref} aria-label={label} className="relative" style={{ height: `${100 + lines.length * 55}vh` }}>
      <div className="sticky top-0 flex h-[100svh] items-start overflow-hidden pt-[15svh]">
        {/* soft vignette so white type always reads over any time of day */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_45%_at_40%_30%,rgba(5,10,28,0.22),transparent_75%)]" />
        <div className="relative mx-auto w-full max-w-6xl px-5 lg:px-8">
          {lines.map((line, i) => (
            <Line key={line} i={i} n={lines.length} progress={scrollYProgress} reduce={!!reduce} tone={tone}>
              {line}
            </Line>
          ))}
        </div>
      </div>
    </section>
  );
}

function Line({ children, i, n, progress, reduce, tone }: { children: string; i: number; n: number; progress: MotionValue<number>; reduce: boolean; tone: "light" | "dark" }) {
  // each line brightens in turn across the middle of the section's scroll
  const start = 0.22 + (i / n) * 0.4;
  const opacity = useTransform(progress, [start, start + 0.12], [0.18, 1]);
  const y = useTransform(progress, [start, start + 0.12], [24, 0]);
  return (
    <motion.p
      style={reduce ? undefined : { opacity, y }}
      className={`font-display text-[clamp(2rem,5vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-balance rtl:leading-[1.3] rtl:tracking-normal ${
        tone === "light" ? "text-white [text-shadow:0_2px_30px_rgba(5,10,28,0.35)]" : "text-ink"
      }`}
    >
      {children}
    </motion.p>
  );
}
