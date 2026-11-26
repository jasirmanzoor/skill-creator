"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { registerScroller } from "@/lib/scroller";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Momentum scrolling for mouse and trackpad: the page glides and settles instead of stepping. Configured like the
 * Lenis component for Framer (darkroom.engineering): a weighted follow (lerp 0.075, wheel 0.8: calm, never overshooting), nested scroll areas keep
 * their own wheel, a click on an in-page link stops the coast, and Lenis pauses itself while the page is locked.
 * Touch keeps the phone's native scroll. Off entirely for visitors who prefer reduced motion.
 * Lenis drives the real window scroll, so motion's useScroll, sticky panels and anchors keep working.
 */
export default function SmoothScroll() {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({
      // a weighted follow instead of a fixed 1.2 s glide: the page trails the wheel and settles, never overshoots
      // a section. Each wheel notch travels a little less than the browser's own step, so a flick can't fly
      // past a paragraph, and the eye can follow every line on the way.
      lerp: 0.075,
      wheelMultiplier: 0.8,
      smoothWheel: true,
      // #links are handled by the book (components/book/RouteBook): it turns to the chapter, then lands
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
