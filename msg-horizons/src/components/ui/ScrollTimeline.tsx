"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export type TimelinePanel = {
  /** the small line at the top, e.g. "01 / 06 · On your own" */
  eyebrow: string;
  /** a short mark before the eyebrow (an icon) */
  mark?: ReactNode;
  desc: string;
  /** the huge word at the foot of the panel */
  big: string;
  bg: string;
  fg: string;
  /** a seam of light runs along the wipe as this panel arrives */
  glow?: boolean;
  /** a picture for the panel's open space: beside the text on wide screens, between the text and the big word on phones */
  art?: ReactNode;
};

/** the original's feel: a firm spring toward the scroll position */
const SPRING = { stiffness: 450, damping: 50, mass: 1 };
/** of each step, how much is the wipe; the rest is the panel holding still */
const MOVE = 0.72;

/**
 * A scroll timeline, after Framer's "Scrolltimeline": a sticky frame of full-bleed panels, each wiping across the one
 * before as the page scrolls, while the leaving panel's huge word tips over onto its side. Every panel holds still for
 * a moment before the next one comes, so a step is a clear change, never a scrub. Use it for anything told as a run of
 * changes: a timeline, or a before and after. In Arabic the wipe and the tip run the other way. Every panel's text
 * stays in the page in order for search and screen readers; under reduced motion the panels are a plain list.
 */
export default function ScrollTimeline({ panels, rtl = false, label, step = 50 }: { panels: TimelinePanel[]; rtl?: boolean; label: string; step?: number }) {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLElement | null)[]>([]);
  const words = useRef<(HTMLElement | null)[]>([]);
  const seam = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const n = panels.length;

  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  // raw progress → panel position, holding still around each panel
  const held = useTransform(scrollYProgress, (p) => {
    const s = Math.min(n - 1, Math.max(0, p * (n - 1)));
    const i = Math.min(n - 2, Math.floor(s));
    const t = Math.min(1, Math.max(0, (s - i - (1 - MOVE) / 2) / MOVE));
    return i + t;
  });
  const pos = useSpring(held, SPRING);

  function apply(v: number) {
    const s = Math.min(n - 1, Math.max(0, v));
    const idx = Math.min(n - 2, Math.floor(s));
    const t = s - idx;
    // the seam the wipe moves along, measured from the start edge
    const edge = (x: number) => (rtl ? `inset(0 0 0 ${x}%)` : `inset(0 ${x}% 0 0)`);
    const from = (x: number) => (rtl ? `inset(0 ${x}% 0 0)` : `inset(0 0 0 ${x}%)`);
    const tip = rtl ? 90 : -90;
    els.current.forEach((el, i) => {
      const w = words.current[i];
      if (!el) return;
      if (i < idx) {
        el.style.clipPath = edge(100);
        if (w) w.style.transform = `rotate(${tip}deg)`;
      } else if (i === idx) {
        el.style.clipPath = edge(t * 100);
        if (w) w.style.transform = `rotate(${tip * t}deg)`;
      } else if (i === idx + 1) {
        el.style.clipPath = from((1 - t) * 100);
        if (w) w.style.transform = "rotate(0deg)";
      } else {
        el.style.clipPath = from(100);
        if (w) w.style.transform = "rotate(0deg)";
      }
    });
    const sm = seam.current;
    if (sm) {
      const on = t > 0.002 && t < 0.998 && panels[idx + 1]?.glow;
      sm.style.opacity = on ? "1" : "0";
      sm.style.left = `${(rtl ? t : 1 - t) * 100}%`;
    }
    if (bar.current) bar.current.style.transform = `scaleX(${n > 1 ? s / (n - 1) : 1})`;
  }
  useMotionValueEvent(pos, "change", apply);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- place the panels once, before the first scroll
  useEffect(() => apply(pos.get()), [n, rtl, reduce]);

  if (reduce) {
    return (
      <div ref={wrap}>
      <ol aria-label={label} className="grid gap-3">
        {panels.map((p, i) => (
          <li key={i} className="rounded-3xl p-6" style={{ background: p.bg, color: p.fg }}>
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] opacity-70 rtl:tracking-normal">{p.mark}{p.eyebrow}</p>
            <p className="mt-3 font-display text-xl font-medium leading-snug">{p.desc}</p>
            <p aria-hidden="true" className="mt-4 font-display text-5xl font-semibold leading-none tracking-[-0.04em] rtl:tracking-normal">{p.big}</p>
          </li>
        ))}
      </ol>
      </div>
    );
  }

  return (
    <div ref={wrap} aria-label={label} role="group" className="relative" style={{ height: `calc(${(n - 1) * step}svh + 100svh)` }}>
      <div className="sticky top-[4.75rem] h-[calc(100svh-14rem)] overflow-hidden rounded-[1.75rem] bg-black ring-1 ring-white/10 [container-type:inline-size] lg:top-[5.25rem] lg:h-[calc(100svh-11rem)]">
        {panels.map((p, i) => (
          <section
            key={i}
            ref={(el) => { els.current[i] = el; }}
            className="absolute inset-0"
            style={{ background: p.bg, color: p.fg, clipPath: i === 0 ? "inset(0)" : rtl ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)", zIndex: i }}
          >
            <div className="flex h-full flex-col justify-between p-6 sm:p-10 lg:p-12">
              <div className="max-w-[26rem] self-end">
                <p className="flex items-center gap-2.5 font-mono text-[0.7rem] uppercase tracking-[0.16em] opacity-70 sm:text-xs rtl:tracking-normal">
                  {p.mark}
                  <span dir="auto">{p.eyebrow}</span>
                </p>
                <p className="mt-3 font-display text-[clamp(1.15rem,2.1vw,1.6rem)] font-medium leading-[1.4] text-pretty">{p.desc}</p>
              </div>
              {p.art ? (
                <div className="flex min-h-0 flex-1 items-center justify-start py-4 lg:absolute lg:bottom-[calc(min(15cqw,13rem)+4rem)] lg:start-12 lg:top-12 lg:w-[min(48%,36rem)] lg:py-0">{p.art}</div>
              ) : null}
              <p
                ref={(el) => { words.current[i] = el; }}
                aria-hidden="true"
                className="origin-bottom-left whitespace-nowrap font-display text-[min(15cqw,13rem)] font-semibold leading-[0.82] tracking-[-0.05em] will-change-transform rtl:origin-bottom-right rtl:tracking-normal"
              >
                {p.big}
              </p>
            </div>
          </section>
        ))}
        {/* a seam of light along the wipe as MSG arrives */}
        <span
          ref={seam}
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 z-[60] w-px -translate-x-1/2 bg-white opacity-0 shadow-[0_0_24px_6px_rgba(0,157,248,0.75)]"
        />
        {/* how far through the run */}
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 z-[61] h-1 bg-black/15">
          <span ref={bar} className="block h-full origin-left scale-x-0 bg-current opacity-60 mix-blend-difference rtl:origin-right" style={{ color: "#fff" }} />
        </span>
      </div>
    </div>
  );
}
