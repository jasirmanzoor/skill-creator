"use client";

import { motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

/**
 * "From your first order, to your biggest peak season, MSG moves with you."
 * A single point (the first order) draws itself into a growth line, spikes at peak season and
 * carries on to the horizon, scrubbed by scroll. The shape is illustrative — no axes, no numbers.
 */
const PATH =
  "M 60 272 C 170 270 250 258 330 236 S 470 206 540 196 C 560 193 575 150 598 70 C 616 150 632 188 660 186 C 760 176 850 150 950 118";

export default function GrowthScene({ progress, reduce }: { progress: MotionValue<number>; reduce: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const draw = useTransform(progress, [0.18, 0.62], [0.001, 1], { clamp: true });
  const fade = useTransform(progress, [0.14, 0.22, 0.84, 0.95], [0, 1, 1, 0]);

  // keep the leading dot on the tip of the line
  useMotionValueEvent(draw, "change", (v) => {
    const path = pathRef.current;
    const tip = tipRef.current;
    if (!path || !tip) return;
    const pt = path.getPointAtLength(path.getTotalLength() * v);
    tip.style.left = `${(pt.x / 1000) * 100}%`;
    tip.style.top = `${(pt.y / 300) * 100}%`;
  });

  if (reduce) {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[6%] h-[42%]">
        <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="h-full w-full">
          <path d={PATH} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  return (
    <motion.div aria-hidden="true" dir="ltr" style={{ opacity: fade }} className="pointer-events-none absolute inset-x-0 bottom-[6%] h-[42%]">
      <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id="growth-stroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="1" stopColor="#8ea2ff" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* soft glow pass */}
        <motion.path d={PATH} fill="none" stroke="rgba(142,162,255,0.35)" strokeWidth="10" strokeLinecap="round" style={{ pathLength: draw }} />
        <motion.path ref={pathRef} d={PATH} fill="none" stroke="url(#growth-stroke)" strokeWidth="2.25" strokeLinecap="round" style={{ pathLength: draw }} />
      </svg>
      {/* first order: the origin point */}
      <span className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_5px_rgba(255,255,255,0.18)]" style={{ left: "6%", top: `${(272 / 300) * 100}%` }} />
      {/* the moving tip */}
      <span ref={tipRef} className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8ea2ff] shadow-[0_0_18px_4px_rgba(142,162,255,0.7)]" style={{ left: "6%", top: "90.7%" }} />
    </motion.div>
  );
}
