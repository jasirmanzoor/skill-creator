"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export type ExpandItem = {
  id: string;
  title: string;
  text: string;
  /** a line under the text, e.g. the service's key figure */
  extra?: ReactNode;
  image: { src: string; pos?: string; alt: string };
  href: string;
  cta: string;
  icon?: ReactNode;
};

/** the original's springs: the row's own fold, the photo card's swing, and the line that fills */
const FOLD = { type: "spring", stiffness: 400, damping: 68 } as const;
const SWING = { type: "spring", stiffness: 400, damping: 36 } as const;
const FILL = { type: "spring", stiffness: 454, damping: 60 } as const;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A numbered list that opens one row at a time, after Framer's "Expand OnHover List": closed rows are a quiet number
 * and title in grey; the open row brightens, its text folds out, a photo card swings in on a tilt, the arrow turns to
 * point at its page and the line under it fills with the brand colour. With a mouse the row under the pointer opens;
 * on a touch screen the row crossing the middle of the screen opens as the page scrolls (a tap opens one too). Every
 * row's text stays in the page for search and screen readers; the row's title is a button that says whether it is
 * open.
 */
export default function ExpandList({ items, label, rtl = false }: { items: ExpandItem[]; label: string; rtl?: boolean }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(0);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  // while the rows fold, the list moves under a still pointer; the row under it is taken once they have settled
  const hover = useRef({ at: -1, open: 0, until: 0, timer: 0 });
  // `now` is the event's own time stamp (the same clock as the settle time)
  const pointTo = (i: number, now: number) => {
    const h = hover.current;
    h.at = i;
    window.clearTimeout(h.timer);
    if (now < h.until) { h.timer = window.setTimeout(() => pointTo(h.at, h.until), h.until - now); return; }
    if (h.open !== i) { h.until = now + 450; choose(i); }
  };
  const choose = (i: number) => { hover.current.open = i; setOpen(i); };
  useEffect(() => () => window.clearTimeout(hover.current.timer), []);
  const t = (x: object) => (reduce ? { duration: 0 } : x);

  // on a touch screen, the row in the middle of the screen is the open one
  useEffect(() => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const io = new IntersectionObserver(
      (es) => { for (const e of es) if (e.isIntersecting) choose(Number((e.target as HTMLElement).dataset.i)); },
      { rootMargin: "-42% 0px -48% 0px" },
    );
    rows.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, [items.length]);

  return (
    <ol aria-label={label} className="relative">
      {items.map((it, i) => {
        const on = open === i;
        return (
          <li
            key={it.id}
            ref={(el) => { rows.current[i] = el; }}
            data-i={i}
            onPointerEnter={(e) => { if (e.pointerType === "mouse") pointTo(i, e.timeStamp); }}
            className="relative"
          >
            {/* the lines above and below, and the brand line that fills as the row opens */}
            {i === 0 ? <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/15" /> : null}
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-white/15" />
            <motion.span
              aria-hidden="true"
              className="absolute bottom-0 start-0 h-px w-full origin-left bg-brand-bright shadow-[0_0_12px_rgba(0,157,248,0.8)] rtl:origin-right"
              initial={false}
              animate={{ scaleX: on ? 1 : 0 }}
              transition={on ? t(FILL) : { duration: 0 }}
            />

            <div className="grid grid-cols-[2.75rem_1fr_auto] items-start gap-x-4 py-6 sm:grid-cols-[4rem_1fr_auto] sm:gap-x-8 lg:grid-cols-[4.5rem_1fr_17.5rem_auto] lg:gap-x-10 lg:py-8">
              <span aria-hidden="true" dir="ltr" className={`pt-2 font-mono text-sm tabular-nums transition-colors duration-300 sm:text-base ${on ? "text-brand-bright" : "text-white/30"}`}>
                {pad(i + 1)}
              </span>

              <div className="min-w-0">
                {/* the site's heading reveal stays off: the title is a button with an icon, and it must take the pointer */}
                <h3 data-mask-skip>
                  <button
                    type="button"
                    aria-expanded={on}
                    aria-controls={`xl-${it.id}`}
                    onClick={() => choose(i)}
                    onFocus={() => choose(i)}
                    className={`flex items-center gap-3 text-start font-display text-[clamp(1.55rem,3.2vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] transition-colors duration-300 rtl:leading-[1.35] rtl:tracking-normal ${on ? "text-white" : "text-white/35 hover:text-white/60"}`}
                  >
                    {it.icon ? (
                      <span aria-hidden="true" className={`hidden size-10 shrink-0 place-items-center rounded-xl ring-1 transition-colors duration-300 sm:grid [&_svg]:size-5 ${on ? "bg-brand-bright/15 text-brand-bright ring-brand-bright/35" : "text-white/30 ring-white/15"}`}>{it.icon}</span>
                    ) : null}
                    {it.title}
                  </button>
                </h3>
                <motion.div
                  id={`xl-${it.id}`}
                  initial={false}
                  animate={on ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                  transition={t(FOLD)}
                  className="overflow-hidden"
                  inert={!on}
                >
                  <p className="max-w-[34rem] pt-4 text-base leading-relaxed text-white/75 text-pretty sm:text-lg">{it.text}</p>
                  {it.extra ? <div className="pt-4">{it.extra}</div> : null}
                  {/* on a phone the photo sits under the text */}
                  <div className="relative mt-5 aspect-[16/10] overflow-hidden rounded-2xl ring-1 ring-white/15 lg:hidden">
                    <Image src={it.image.src} alt="" fill sizes="90vw" className="object-cover" style={{ objectPosition: it.image.pos ?? "50% 50%" }} />
                  </div>
                  <a href={it.href} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-teal-deep transition-transform duration-200 hover:-translate-y-0.5">
                    {it.cta}
                    <svg viewBox="0 0 24 24" className="size-4 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </a>
                </motion.div>
              </div>

              {/* the photo card: swings in on a tilt as the row opens (wide screens) */}
              <motion.div
                aria-hidden="true"
                className="relative hidden lg:block"
                initial={false}
                animate={{ height: on ? 200 : 48 }}
                transition={t(FOLD)}
              >
                <motion.div
                  className="absolute start-2 top-1 h-[10.75rem] w-[16.5rem] overflow-hidden rounded-2xl bg-white/10 p-1.5 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.9)] ring-1 ring-white/25"
                  initial={false}
                  animate={on ? { opacity: 1, rotate: rtl ? 5 : -5, x: 0, y: 0 } : { opacity: 0, rotate: rtl ? -66 : 66, x: rtl ? 156 : -156, y: 97 }}
                  transition={on ? t(SWING) : t({ duration: 0.25 })}
                >
                  <div className="relative size-full overflow-hidden rounded-xl">
                    <Image src={it.image.src} alt="" fill sizes="264px" className="object-cover" style={{ objectPosition: it.image.pos ?? "50% 50%" }} />
                  </div>
                </motion.div>
              </motion.div>

              {/* the arrow: points down the list while closed, at the row's page once open */}
              <a
                href={it.href}
                tabIndex={on ? 0 : -1}
                aria-label={`${it.cta}: ${it.title}`}
                className={`grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-300 sm:size-11 ${on ? "bg-brand-bright text-pitch" : "bg-white/[0.07] text-white/40"}`}
              >
                <motion.svg
                  viewBox="0 0 24 24"
                  className="size-5 rtl:-scale-x-100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  initial={false}
                  animate={{ rotate: on ? -45 : 45 }}
                  transition={t(SWING)}
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </motion.svg>
              </a>
            </div>
            <span className="sr-only">{it.image.alt}</span>
          </li>
        );
      })}
    </ol>
  );
}
