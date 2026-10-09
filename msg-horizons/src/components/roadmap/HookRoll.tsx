"use client";

import { EASE_OUT } from "@/lib/motion";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Rolling pathway phrases with a word-by-word "materialise" reveal (blur → sharp, rise).
 * Words, not letters, so Arabic keeps its joined shaping. Pauses while the tab is hidden.
 */
export default function HookRoll({ phrases, interval = 3200, className = "" }: { phrases: string[]; interval?: number; className?: string }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce || phrases.length < 2) return;
    const id = window.setInterval(() => { if (!document.hidden) setI((n) => (n + 1) % phrases.length); }, interval);
    return () => window.clearInterval(id);
  }, [reduce, phrases.length, interval]);

  const words = phrases[i].split(" ");
  return (
    <span className={`relative inline-flex min-h-[1.6em] items-center ${className}`} aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={i} className="inline-flex flex-wrap gap-x-[0.3em]" exit={reduce ? undefined : { opacity: 0, transform: "translateY(-6px)", transition: { duration: 0.16, ease: EASE_OUT } }}>
          {words.map((w, k) => (
            <motion.span
              key={k}
              initial={reduce ? false : { opacity: 0, transform: "translateY(8px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              transition={{ duration: 0.4, delay: k * 0.05, ease: EASE_OUT }}
            >
              {w}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
