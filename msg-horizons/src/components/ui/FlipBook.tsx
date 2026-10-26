"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type Labels = { next: string; prev: string; again: string; page: string };

const FLIP = [0.4, 0, 0.2, 1] as const;

/**
 * A book you open and leaf through, after the Interactive Book component for Framer. The pages are hinged on the
 * spine and turn in 3D (a page turns in 0.7s on a soft curve; the whole book slides half a page across as it opens,
 * so the spread sits centred). At the end it closes itself, page by page. Built for this site with real HTML pages
 * instead of images, so the text stays readable and translatable, and in Arabic the book opens from the right.
 * Tap the book, or use the buttons under it.
 */
export default function FlipBook({ pages, labels, rtl = false }: { pages: React.ReactNode[]; labels: Labels; rtl?: boolean }) {
  const reduce = useReducedMotion();
  const all = pages.length % 2 === 0 ? pages : [...pages, null];
  const leaves: [React.ReactNode, React.ReactNode][] = [];
  for (let i = 0; i < all.length; i += 2) leaves.push([all[i], all[i + 1]]);
  const total = leaves.length;
  const [flipped, setFlipped] = useState(0);
  const [moving, setMoving] = useState(-1);
  const [closing, setClosing] = useState(false);

  const turn = (dir: 1 | -1) => {
    if (closing) return;
    if (dir === 1 && flipped >= total) {
      // the end: close the book, last page first
      setClosing(true);
      window.setTimeout(() => { setFlipped(0); setClosing(false); }, reduce ? 0 : 80 * total + 500);
      return;
    }
    const next = Math.max(0, Math.min(total, flipped + dir));
    setMoving(dir === 1 ? flipped : next);
    setFlipped(next);
    window.setTimeout(() => setMoving(-1), 720);
  };

  const open = flipped > 0 && !closing;
  const sign = rtl ? 1 : -1;
  const where = closing ? 0 : flipped;
  const atEnd = flipped >= total;

  return (
    <div className="flex flex-col items-center">
      <div className="book-stage grid w-full place-items-center py-6" style={{ perspective: 2500 }}>
        <motion.div
          className="flipbook relative cursor-pointer"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ x: open ? (rtl ? "-50%" : "50%") : "0%" }}
          transition={reduce ? { duration: 0 } : { duration: closing ? 0.8 : 0.6, ease: "easeInOut" }}
          onClick={() => turn(1)}
          aria-hidden="true"
        >
          {leaves.map(([front, back], i) => {
            const isFlipped = i < where;
            const z = i === moving ? 100 : isFlipped ? i : total - i;
            return (
              <motion.div
                key={i}
                className="absolute inset-0"
                style={{ transformOrigin: rtl ? "right center" : "left center", transformStyle: "preserve-3d", zIndex: z, willChange: "transform" }}
                animate={{ rotateY: isFlipped ? sign * 180 : 0, z: (isFlipped ? i : total - i) * 0.4 }}
                transition={reduce ? { duration: 0 } : closing ? { duration: 0.5, ease: "easeInOut", delay: (total - 1 - i) * 0.08 } : { duration: 0.7, ease: FLIP }}
              >
                <div className={`book-face ${rtl ? "rounded-s-xl" : "rounded-e-xl"}`}>
                  {front}
                  <span className={`book-spine ${rtl ? "book-spine-end" : ""}`} />
                </div>
                <div className={`book-face ${rtl ? "rounded-e-xl" : "rounded-s-xl"}`} style={{ transform: "rotateY(180deg) translateZ(0.01px)" }}>
                  {back}
                  <span className={`book-spine ${rtl ? "" : "book-spine-end"}`} />
                </div>
              </motion.div>
            );
          })}
          {/* the closed book's thickness and shadow */}
          <span className={`pointer-events-none absolute inset-0 -z-10 rounded-xl shadow-[var(--shadow-scene)] transition-opacity duration-500 ${open ? "opacity-0" : "opacity-100"}`} />
        </motion.div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button type="button" onClick={() => turn(-1)} disabled={flipped === 0 || closing} aria-label={labels.prev} className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-subtle disabled:opacity-35">
          <svg viewBox="0 0 24 24" className="size-4 -scale-x-100 rtl:scale-x-100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
        <span className="num min-w-24 text-center text-sm text-muted" aria-live="polite">
          {labels.page.replace("{n}", String(Math.min(total, flipped) + (atEnd ? 0 : 1))).replace("{total}", String(total))}
        </span>
        <button type="button" onClick={() => turn(1)} disabled={closing} className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-paper transition-colors hover:bg-ink-2 disabled:opacity-50">
          {atEnd ? labels.again : labels.next}
          <svg viewBox="0 0 24 24" className="size-4 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  );
}
