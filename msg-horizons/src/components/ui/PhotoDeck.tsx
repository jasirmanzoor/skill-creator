"use client";

import Image from "next/image";
import { motion, type PanInfo } from "motion/react";
import { useCallback, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export type DeckPhoto = { src: string; alt: string; caption?: string; width: number; height: number };

const EASE = [0.65, 0, 0.35, 1] as const;

/**
 * A stack of photographs dealt one over the other, after Skiper UI's Skiper17 sticky cards (skiper-ui.com, free
 * version: attribution in the footer). The next photo slides up over the one before, which settles back, smaller and
 * turned a little, like a print laid on a pile. Skiper17 deals on page scroll; here the deck deals on its own (swipe
 * or drag up, the arrows, the keys, or a tap), so the chapter stays one screen long.
 */
export default function PhotoDeck({ photos, labels, className = "" }: { photos: DeckPhoto[]; labels: { prev: string; next: string; of: string }; className?: string }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const n = photos.length;
  const go = useCallback((to: number) => setI(Math.max(0, Math.min(n - 1, to))), [n]);
  const onEnd = (_: unknown, info: PanInfo) => {
    const d = Math.abs(info.offset.y) > Math.abs(info.offset.x) ? info.offset.y : info.offset.x;
    if (d < -60) go(i + 1);
    else if (d > 60) go(i - 1);
  };
  const t = reduce ? { duration: 0 } : { duration: 0.9, ease: EASE };
  const cur = photos[i];

  return (
    <div className={className}>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={cur.caption ?? cur.alt}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); go(i + 1); }
          if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); go(i - 1); }
        }}
        className="relative mx-auto aspect-[4/3] w-full max-w-3xl touch-pan-y select-none overflow-hidden rounded-[2rem] outline-offset-4"
      >
        {photos.map((p, k) => {
          // dealt (k < i) photos rest on the pile, the open one lies flat, the rest wait below the frame
          const state = k < i ? { y: "0%", scale: 0.7, rotate: 5, opacity: i - k > 2 ? 0 : 1 }
            : k === i ? { y: "0%", scale: 1, rotate: 0, opacity: 1 }
            : { y: "105%", scale: 1, rotate: 0, opacity: 1 };
          return (
            <motion.div
              key={p.src}
              initial={false}
              animate={state}
              transition={t}
              drag={k === i}
              dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={k === i ? onEnd : undefined}
              onTap={k === i ? () => go(i + 1 < n ? i + 1 : 0) : undefined}
              style={{ zIndex: k + 1 }}
              inert={k !== i}
              className="absolute inset-0 cursor-grab overflow-hidden rounded-[2rem] bg-subtle shadow-[var(--shadow-scene)] active:cursor-grabbing"
            >
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 768px, 100vw" className="pointer-events-none object-cover" draggable={false} />
              {p.caption ? (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-6 pb-5 pt-16 text-sm font-medium text-white">{p.caption}</span>
              ) : null}
            </motion.div>
          );
        })}
      </div>
      <div className="mx-auto mt-6 flex max-w-3xl items-center justify-between gap-4">
        <span className="num text-sm text-muted" aria-live="polite">{labels.of.replace("{n}", String(i + 1)).replace("{total}", String(n))}</span>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {photos.map((p, k) => (
            <span key={p.src} className={`h-1 rounded-full transition-all duration-500 ${k === i ? "w-8 bg-brand" : "w-3 bg-line-strong"}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => go(i - 1)} disabled={i === 0} aria-label={labels.prev} className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-subtle disabled:opacity-35">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
          </button>
          <button type="button" onClick={() => go(i + 1)} disabled={i === n - 1} aria-label={labels.next} className="grid size-11 place-items-center rounded-full bg-ink text-paper transition-colors hover:bg-ink-2 disabled:opacity-35">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
