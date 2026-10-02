"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Momentum scrolling for mouse and trackpad: the page glides and settles instead of stepping.
 * Touch keeps the phone's native scroll. Off entirely for visitors who prefer reduced motion.
 * Lenis drives the real window scroll, so motion's useScroll, sticky panels and anchors keep working.
 */
export default function SmoothScroll() {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, anchors: { offset: -64 }, autoRaf: true });
    document.documentElement.classList.add("lenis-on");
    return () => {
      lenis.destroy();
      document.documentElement.classList.remove("lenis-on");
    };
  }, [reduce]);
  return null;
}
