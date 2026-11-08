"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export type SyncItem = { src: string; pos?: string; alt: string; title: string; group?: string };

/** the card's own spring, as in the original: a quick settle with a little give */
const SPRING = { type: "spring", bounce: 0.25, duration: 0.35 } as const;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A scroll-synced showcase, after Framer's "Brand Logo Images" card (a square picture over a "01 / 08  NAME" line,
 * switching between its variants on a short spring). The captions scroll; the card stays put beside them (above them
 * on a phone) and turns to the photo of whichever caption is in the middle of the screen. One sharp photo at a time,
 * nothing stacked or blurred while it rests, and every photo keeps its caption in the page for search and screen
 * readers.
 */
export default function ScrollSync({ items, label }: { items: SyncItem[]; label: string }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const total = items.length;

  useEffect(() => {
    // a caption is "the one" while it crosses a thin band: the middle of the screen beside the card, or, on a phone,
    // the band just under the card
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: wide ? "-46% 0px -46% 0px" : "-68% 0px -28% 0px" },
    );
    rows.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, [total]);

  const it = items[active] ?? items[0];
  const swap = reduce
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 1.06, filter: "blur(12px)" },
        animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
        exit: { opacity: 0, scale: 0.98, filter: "blur(8px)" },
      };

  return (
    <div aria-label={label} className="grid gap-x-16 lg:grid-cols-[1fr_minmax(0,30rem)]">
      {/* the card: sticky beside the captions on wide screens, above them on a phone */}
      <figure aria-hidden="true" className="sticky top-16 z-10 order-first -mx-5 self-start bg-paper px-5 pb-4 pt-3 lg:order-last lg:top-[calc(50svh-15rem)] lg:mx-0 lg:bg-transparent lg:p-0">
        <div className="mx-auto w-[min(100%,40svh)] lg:w-full">
        <div className="relative aspect-square overflow-hidden rounded-[1.75rem] bg-subtle shadow-[var(--shadow-float)] ring-1 ring-line">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div key={active} className="absolute inset-0" transition={SPRING} {...swap}>
              <Image src={it.src} alt="" fill sizes="(min-width:1024px) 480px, 90vw" className="object-cover" style={{ objectPosition: it.pos ?? "50% 50%" }} />
            </motion.div>
          </AnimatePresence>
        </div>
        <figcaption className="mt-4 flex items-baseline gap-4 font-mono text-xs uppercase tracking-[0.16em] text-muted rtl:tracking-normal">
          <span className="tabular-nums text-ink" dir="ltr">
            {pad(active + 1)} / {pad(total)}
          </span>
          <span className="relative h-4 flex-1 overflow-hidden">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span key={active} className="absolute inset-0 truncate" initial={reduce ? false : { y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={SPRING}>
                {it.group ?? it.title}
              </motion.span>
            </AnimatePresence>
          </span>
        </figcaption>
        </div>
      </figure>

      {/* the captions: each one holds the stage while it crosses the middle of the screen */}
      <ol className="pb-[30svh] lg:py-[18svh]">
        {items.map((x, i) => (
          <li key={x.src} ref={(el) => { rows.current[i] = el; }} data-i={i} className="flex min-h-[34svh] flex-col justify-center border-t border-line py-8 first:border-t-0 lg:min-h-[58svh] lg:py-10">
            <span className={`font-display text-sm font-semibold tabular-nums transition-colors duration-300 ${i === active ? "text-brand" : "text-muted"}`} dir="ltr">
              {pad(i + 1)}
            </span>
            <p className={`mt-3 max-w-md font-display text-[clamp(1.6rem,3.2vw,2.6rem)] font-semibold leading-[1.08] tracking-[-0.03em] transition-colors duration-300 text-balance rtl:tracking-normal ${i === active ? "text-ink" : "text-ink/55"}`}>
              {x.title}
            </p>
            {x.group ? <p className="mt-3 text-sm text-muted">{x.group}</p> : null}
            {/* what the photo shows, for screen readers (the card above is decoration) */}
            <span className="sr-only">{x.alt}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
