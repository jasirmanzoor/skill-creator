"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Spatial section: lifts into place as it enters the viewport. Entry is measured in viewport terms, so tall
 * sections behave like short ones; the lift is spring-smoothed and the transform is identity while the section
 * is in view. It never fades or scales the section, so text keeps its contrast and its size at every scroll position.
 */
export default function Depth({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const enter = useSpring(useScroll({ target: ref, offset: ["start end", "start 0.7"] }).scrollYProgress, { stiffness: 120, damping: 26, mass: 0.35 });
  const transform = useTransform(enter, (v) => `translate3d(0, ${((1 - v) * 40).toFixed(2)}px, 0)`);
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div ref={ref} className={className} style={{ transform }}>
      {children}
    </motion.div>
  );
}
