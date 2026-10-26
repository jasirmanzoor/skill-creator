"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useTransform } from "motion/react";
import { fmt, type Locale } from "@/content/i18n";
import { bookCopy, CHAPTERS } from "@/content/chapters";
import { bookState, chapterProgress, onBookState } from "@/lib/book";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { MOBILE_BAR_ATTR, MOBILE_BAR_EVENT } from "../MobileBar";

const onBar = (cb: () => void) => { window.addEventListener(MOBILE_BAR_EVENT, cb); return () => window.removeEventListener(MOBILE_BAR_EVENT, cb); };
const SPRING = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 } as const;
const num = (i: number) => String(i + 1).padStart(2, "0");

/**
 * The route rail: the book's chapters as milestones on one line, after the Timeline Slider component for Framer
 * (Matthias Ölschlegel). A light rests on the open chapter, and that milestone unfolds out of its dot into a card
 * (first a slim bud, then its full size, then its words) while the others wait folded on either side. The strip
 * swipes and scrolls on its own, so it needs no page space; tapping a milestone turns the book to it.
 */
export default function RouteRail({ lang }: { lang: Locale }) {
  const c = bookCopy[lang];
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const track = useRef<HTMLOListElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const docked = useSyncExternalStore(onBar, () => document.documentElement.hasAttribute(MOBILE_BAR_ATTR), () => false);
  const fill = useTransform(chapterProgress, (v) => `scaleX(${Math.max(0.02, v)})`);
  const total = CHAPTERS.length;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with the book once it has opened
    setActive(bookState().index);
    return onBookState((s) => setActive(s.index));
  }, []);

  // keep the open milestone in the middle of the strip
  useEffect(() => {
    const el = items.current[active];
    const tr = track.current;
    if (!el || !tr) return;
    const center = () => {
      const r = el.getBoundingClientRect();
      const t = tr.getBoundingClientRect();
      tr.scrollBy({ left: r.left + r.width / 2 - (t.left + t.width / 2), behavior: reduce ? "auto" : "smooth" });
    };
    center();
    const late = window.setTimeout(center, 420); // again once the card has unfolded
    return () => window.clearTimeout(late);
  }, [active, reduce]);

  const prev = CHAPTERS[active - 1];
  const next = CHAPTERS[active + 1];

  return (
    <nav
      aria-label={c.rail}
      className={`route-rail fixed inset-x-3 z-40 mx-auto flex max-w-[60rem] items-center gap-1 rounded-full border border-line bg-surface/85 p-1.5 shadow-[var(--shadow-float)] backdrop-blur-xl transition-[bottom] duration-300 lg:inset-x-6 lg:bottom-5 ${
        docked ? "bottom-[5.4rem]" : "bottom-3"
      }`}
    >
      <EndButton href={prev ? `#${prev.id}` : undefined} label={c.previous} dir="prev" />
      <ol ref={track} className="rail-track relative flex min-w-0 flex-1 items-center overflow-x-auto overscroll-x-contain px-6">
        {CHAPTERS.map((ch, i) => {
          const on = i === active;
          const done = i < active;
          return (
            <li key={ch.id} ref={(el) => { items.current[i] = el; }} className="relative flex shrink-0 items-center">
              {i > 0 ? <span aria-hidden="true" className={`h-0.5 w-5 rounded-full transition-colors duration-500 sm:w-7 ${done || on ? "bg-brand" : "bg-line-strong"}`} /> : null}
              <a
                href={`#${ch.id}`}
                aria-current={on ? "step" : undefined}
                aria-label={`${num(i)} ${ch.title[lang]}`}
                title={ch.title[lang]}
                className={`group relative flex items-center rounded-full outline-offset-2 ${on ? "" : "px-1 py-2"}`}
              >
                <span className="relative grid size-5 shrink-0 place-items-center">
                  {on ? (
                    <motion.span
                      layoutId="rail-light"
                      transition={reduce ? { duration: 0 } : SPRING}
                      aria-hidden="true"
                      className="rail-light absolute inset-[-7px] rounded-full"
                    />
                  ) : null}
                  <span
                    aria-hidden="true"
                    className={`relative block rounded-full transition-all duration-500 ${
                      on ? "size-2.5 bg-brand-bright shadow-[var(--shadow-glow)]" : done ? "size-2 bg-brand" : "size-2 border border-line-strong bg-surface group-hover:border-brand"
                    }`}
                  />
                </span>
                {on ? (
                  <motion.span
                    key={ch.id}
                    initial={reduce ? false : { width: 18, opacity: 0.4 }}
                    animate={{ width: "auto", opacity: 1 }}
                    transition={reduce ? { duration: 0 } : { width: { ...SPRING, delay: 0.05 }, opacity: { duration: 0.2 } }}
                    className="relative ms-2 block overflow-hidden rounded-full bg-ink text-paper"
                  >
                    <motion.span
                      initial={reduce ? false : { opacity: 0, filter: "blur(6px)", y: 4 }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      transition={{ duration: 0.35, delay: reduce ? 0 : 0.22, ease: [0.23, 1, 0.32, 1] }}
                      className="flex items-center gap-2.5 whitespace-nowrap py-2 pe-4 ps-3"
                    >
                      <span className="font-display text-xs font-semibold tabular-nums text-brand-bright dark:text-[#0b7d36]">{num(i)}</span>
                      <span className="text-sm font-semibold">{ch.title[lang]}</span>
                      <span className="hidden text-xs text-paper/60 xl:inline">{ch.hint[lang]}</span>
                    </motion.span>
                    <motion.span aria-hidden="true" style={{ transform: fill }} className="absolute inset-x-3 bottom-1 h-px origin-left rounded-full bg-brand-bright/80 rtl:origin-right" />
                  </motion.span>
                ) : (
                  <span className="ms-1.5 hidden font-display text-[11px] font-semibold tabular-nums text-muted transition-colors group-hover:text-ink sm:inline">{num(i)}</span>
                )}
              </a>
            </li>
          );
        })}
      </ol>
      <span className="sr-only">{fmt(c.chapter, { n: active + 1, total })}</span>
      <EndButton href={next ? `#${next.id}` : undefined} label={c.next} dir="next" />
    </nav>
  );
}

function EndButton({ href, label, dir }: { href?: string; label: string; dir: "prev" | "next" }) {
  const icon = (
    <svg viewBox="0 0 24 24" className={`size-4 ${dir === "prev" ? "-scale-x-100 rtl:scale-x-100" : "rtl:-scale-x-100"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
  const base = "grid size-10 shrink-0 place-items-center rounded-full transition-colors";
  if (!href) return <span aria-hidden="true" className={`${base} text-line-strong`}>{icon}</span>;
  return (
    <a href={href} aria-label={label} title={label} className={`${base} ${dir === "next" ? "bg-ink text-paper hover:bg-ink-2" : "text-muted hover:bg-subtle hover:text-ink"}`}>
      {icon}
    </a>
  );
}
