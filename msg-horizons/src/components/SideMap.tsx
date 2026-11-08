"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CHAPTERS } from "@/content/chapters";
import type { Locale } from "@/content/i18n";
import { goTo } from "@/lib/book";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { PLATE } from "./PushMenu";

const copy: Record<Locale, { label: string; open: string }> = {
  en: { label: "Site map", open: "Open the site map" },
  ar: { label: "خريطة الموقع", open: "افتح خريطة الموقع" },
};
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The site map, always at hand on the page's edge (after Framer's "Brand Logo Images"). Closed, it is a slim bar of
 * ticks, one per chapter, the one you are in lit with its number. Pointed at or tabbed into, it opens: a photo card
 * that follows the chapter you are in as you scroll (or the one under the pointer), with its "05 / 10" line, and the
 * chapters to jump to. On phones it is a small tab on the edge that opens the full site map panel.
 */
export default function SideMap({ lang }: { lang: Locale }) {
  const reduce = useReducedMotion();
  const c = copy[lang];
  const [cur, setCur] = useState(0);
  const [over, setOver] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  // the chapter you are in, as the page scrolls (the book marks it with data-current)
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const id = document.querySelector<HTMLElement>("[data-chapter][data-current]")?.dataset.chapter;
      const i = CHAPTERS.findIndex((ch) => ch.id === id);
      if (i >= 0) setCur(i);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  const k = over ?? cur;
  const ch = CHAPTERS[k];
  const pl = PLATE[ch.id] ?? PLATE.hero;

  return (
    <>
      {/* wide screens: the bar on the edge, opening into the card and the list */}
      <nav
        aria-label={c.label}
        onPointerEnter={(e) => { if (e.pointerType === "mouse") setOpen(true); }}
        onPointerLeave={() => { setOpen(false); setOver(null); }}
        onFocus={() => setOpen(true)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) { setOpen(false); setOver(null); } }}
        className="side-map fixed end-3 top-1/2 z-[45] hidden -translate-y-1/2 lg:block"
      >
        <div className={`flex items-center gap-3 ${open ? "" : "pointer-events-auto"}`}>
          <AnimatePresence>
            {open ? (
              <motion.div
                key="panel"
                initial={reduce ? false : { opacity: 0, x: lang === "ar" ? -16 : 16, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: lang === "ar" ? -12 : 12, transition: { duration: 0.15 } }}
                transition={{ type: "spring", bounce: 0.25, duration: 0.35 }}
                className="w-72 overflow-hidden rounded-[1.5rem] bg-[#0b1730]/92 p-3 text-white shadow-[0_30px_70px_-25px_rgba(0,0,0,0.8)] ring-1 ring-white/12 backdrop-blur-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-[1.1rem] bg-white/5 ring-1 ring-white/10">
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.div key={ch.id} className="absolute inset-0"
                      initial={reduce ? false : { opacity: 0, scale: 1.06, filter: "blur(10px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
                      transition={{ type: "spring", bounce: 0.25, duration: 0.35 }}>
                      <Image src={pl.src} alt="" fill sizes="288px" className="object-cover" style={{ objectPosition: pl.pos }} />
                    </motion.div>
                  </AnimatePresence>
                  <span className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgba(6,16,32,0.85),transparent)]" />
                  <p className="absolute bottom-2.5 start-3 end-3 flex items-baseline gap-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/85 rtl:font-sans rtl:tracking-normal">
                    <span className="tabular-nums text-[#a8dcff]" dir="ltr">{pad(k + 1)} / {pad(CHAPTERS.length)}</span>
                    <span className="truncate">{ch.title[lang]}</span>
                  </p>
                </div>
                <ol className="mt-2 max-h-[46svh] overflow-y-auto" data-lenis-prevent>
                  {CHAPTERS.map((x, i) => (
                    <li key={x.id}>
                      <a
                        href={`#${x.id}`}
                        onClick={(e) => { e.preventDefault(); goTo(x.id); }}
                        onPointerEnter={() => setOver(i)}
                        onFocus={() => setOver(i)}
                        aria-current={i === cur ? "location" : undefined}
                        className={`flex items-baseline gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-white/8 ${i === cur ? "text-[#a8dcff]" : "text-white/80 hover:text-white"}`}
                      >
                        <span className="num w-5 shrink-0 text-[10px] text-white/45" dir="ltr">{pad(i + 1)}</span>
                        <span className="truncate font-semibold">{x.title[lang]}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </motion.div>
            ) : null}
          </AnimatePresence>
          {/* the bar: a tick per chapter */}
          <div className="flex flex-col items-center gap-1.5 rounded-full bg-[#0b1730]/70 px-2 py-3 ring-1 ring-white/12 backdrop-blur-md">
            <span className="num mb-1 text-[10px] font-semibold text-[#a8dcff]" dir="ltr">{pad(cur + 1)}</span>
            {CHAPTERS.map((x, i) => (
              <button
                key={x.id}
                type="button"
                onClick={() => goTo(x.id)}
                onPointerEnter={() => setOver(i)}
                aria-label={`${pad(i + 1)} ${x.title[lang]}`}
                aria-current={i === cur ? "location" : undefined}
                className="group grid h-3 w-5 place-items-center"
              >
                <span className={`block h-0.5 rounded-full transition-all duration-300 ${i === cur ? "w-5 bg-brand-bright shadow-[0_0_8px_rgba(0,157,248,0.9)]" : "w-2.5 bg-white/40 group-hover:w-4 group-hover:bg-white/80"}`} />
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* phones: a tab on the edge that opens the site map panel */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("msg-sitemap-open"))}
        aria-label={c.open}
        className="fixed end-0 top-1/2 z-[45] flex -translate-y-1/2 flex-col items-center gap-1 rounded-s-xl bg-[#0b1730]/80 px-1.5 py-2.5 text-white ring-1 ring-white/15 backdrop-blur-md lg:hidden"
      >
        <span className="num text-[9px] font-semibold text-[#a8dcff]" dir="ltr">{pad(cur + 1)}</span>
        {CHAPTERS.map((x, i) => (
          <span key={x.id} aria-hidden="true" className={`block h-0.5 rounded-full ${i === cur ? "w-3 bg-brand-bright" : "w-1.5 bg-white/45"}`} />
        ))}
      </button>
    </>
  );
}
