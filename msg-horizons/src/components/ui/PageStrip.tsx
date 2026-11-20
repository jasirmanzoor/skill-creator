"use client";

import { useRef } from "react";

type Props = {
  /** pages drawn at designWidth x designHeight; the strip shows them smaller, side by side */
  pages: React.ReactNode[];
  labels: { region: string; prev: string; next: string };
  designWidth?: number;
  designHeight?: number;
  scale?: number;
  rtl?: boolean;
};

/**
 * A row of pages that scrolls the way every row on a phone does: swipe, trackpad, scrollbar or the two buttons.
 * Nothing to learn, so it needs no instructions. Pages snap into place, and the region can be focused and scrolled
 * with the arrow keys.
 */
export default function PageStrip({ pages, labels, designWidth = 420, designHeight = 560, scale = 0.68, rtl = false }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const w = Math.round(designWidth * scale), h = Math.round(designHeight * scale);
  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (w + 16) * (rtl ? -1 : 1), behavior: reduce ? "auto" : "smooth" });
  };
  const btn = "grid size-11 place-items-center rounded-full text-white ring-1 ring-white/25 transition-[background-color,transform] duration-150 ease-out hover:bg-white/10 active:scale-[0.96]";
  return (
    <div>
      <div
        ref={track}
        role="region"
        aria-label={labels.region}
        tabIndex={0}
        data-lenis-prevent
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-3 outline-none [scrollbar-width:thin] focus-visible:ring-2 focus-visible:ring-brand-bright"
      >
        {pages.map((p, i) => (
          <div key={i} className="shrink-0 snap-start overflow-hidden rounded-lg shadow-[0_24px_48px_-24px_rgba(0,0,0,0.7)] ring-1 ring-white/10" style={{ width: w, height: h }}>
            <div style={{ width: designWidth, height: designHeight, transform: `scale(${scale})`, transformOrigin: rtl ? "100% 0" : "0 0" }}>{p}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={() => step(-1)} aria-label={labels.prev} className={btn}>
          <svg viewBox="0 0 24 24" className="size-5 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <button type="button" onClick={() => step(1)} aria-label={labels.next} className={btn}>
          <svg viewBox="0 0 24 24" className="size-5 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  );
}
