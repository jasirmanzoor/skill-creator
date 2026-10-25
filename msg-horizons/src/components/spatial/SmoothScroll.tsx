"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { registerScroller } from "@/lib/scroller";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Momentum scrolling for mouse and trackpad: the page glides and settles instead of stepping. Configured like the
 * Lenis component for Framer (darkroom.engineering): a timed glide (intensity 12, so 1.2s), nested scroll areas keep
 * their own wheel, a click on an in-page link stops the coast, and Lenis pauses itself while the page is locked.
 * Touch keeps the phone's native scroll. Off entirely for visitors who prefer reduced motion.
 * Lenis drives the real window scroll, so motion's useScroll, sticky panels and anchors keep working.
 */
export default function SmoothScroll() {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      anchors: { offset: -64 },
      autoRaf: true,
      autoToggle: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });
    document.documentElement.classList.add("lenis-on");
    registerScroller(lenis);
    return () => {
      registerScroller(null);
      lenis.destroy();
      document.documentElement.classList.remove("lenis-on");
    };
  }, [reduce]);
  return null;
}
