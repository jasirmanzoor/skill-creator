"use client";

import { motion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useRef } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Spatial section: rises out of depth as it enters the viewport (a slight tilt, scale and lift)
 * and leans a fraction with scroll speed before springing back. Entry and exit
 * are measured in viewport terms, so tall sections behave like short ones; everything is
 * spring-smoothed and the transform is identity while the section is in view.
 */
export default function Depth({ children, className = "", lean = true }: { children: React.ReactNode; className?: string; lean?: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const spring = { stiffness: 120, damping: 26, mass: 0.35 };
  const enter = useSpring(useScroll({ target: ref, offset: ["start end", "start 0.62"] }).scrollYProgress, spring);
  const { scrollY } = useScroll();
  const scale = useTransform(enter, [0, 1], [0.94, 1]);
  const rotateX = useTransform(enter, [0, 1], [7, 0]);
  const y = useTransform(enter, [0, 1], [70, 0]);
  const opacity = useTransform(enter, [0, 1], [0.35, 1]);
  const velocity = useSpring(useVelocity(scrollY), { stiffness: 140, damping: 30 });
  const skewY = useTransform(velocity, [-3000, 0, 3000], [0.8, 0, -0.8], { clamp: true });
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      ref={ref}
      className={`origin-top ${className}`}
      style={{ scale, rotateX, y, opacity, skewY: lean ? skewY : 0, transformPerspective: 1400 }}
    >
      {children}
    </motion.div>
  );
}
