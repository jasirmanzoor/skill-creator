"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/** Hero copy lifts away faster than the scene as the camera pushes in (parallax). */
export default function HeroLift({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, reduce ? 0 : -90]);
  const opacity = useTransform(scrollY, [150, 650], [1, reduce ? 1 : 0]);
  return <motion.div style={{ y, opacity }}>{children}</motion.div>;
}
