"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { profileCopy } from "@/content/profile";
import { getDictionary, type Locale } from "@/content/i18n";
import { layerClosed, layerOpened } from "@/lib/rays-store";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { SLIDES } from "./slides";

const DW = 1920;
const DH = 1080;
const TURN = 1.05;

const copy: Record<Locale, { prev: string; next: string; full: string; pdf: string; page: string; profile: string; hint: string }> = {
  en: { prev: "Previous page", next: "Next page", full: "Full screen", pdf: "Download PDF", page: "Page", profile: "Scroll version", hint: "Click, swipe or use the arrow keys" },
  ar: { prev: "الصفحة السابقة", next: "الصفحة التالية", full: "ملء الشاشة", pdf: "تنزيل PDF", page: "صفحة", profile: "النسخة المتحركة", hint: "انقر أو اسحب أو استخدم الأسهم" },
};

/**
 * MSG's company profile as a flip-book deck (app/[lang]/company-profile/deck): ten 1920 × 1080 pages scaled to the
 * screen. Turning a page lifts it from its outer edge and over the spine in 3D (its back is the brand's paper, a
 * gloss runs across it and its shadow falls on the page beneath), while the next page's content arrives. In Arabic
 * the book is bound on the right. Keys, clicks and swipes all turn; `?print` lays every page out for the PDF.
 */
/** One page. An arriving page mounts hidden and goes live a frame later, so its content's entrance can play. */
function DeckSlide({ i, state, lang }: { i: number; state: "active" | "shown"; lang: Locale }) {
  const [live, setLive] = useState(state === "shown");
  useEffect(() => {
    if (state === "shown") return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setLive(true)));
    return () => cancelAnimationFrame(id);
  }, [state]);
  const S = SLIDES[i];
  const rtl = lang === "ar";
  return (
    <div className="dk-slide absolute inset-0 overflow-hidden" data-state={live ? state : "idle"} dir={rtl ? "rtl" : "ltr"} lang={lang}>
      <S c={profileCopy[lang]} t={getDictionary(lang)} lang={lang} active={live && state === "active"} />
    </div>
  );
}

export default function Deck({ lang, print = false }: { lang: Locale; print?: boolean }) {
  const c = profileCopy[lang];
  const k = copy[lang];
  const rtl = lang === "ar";
  const reduce = useReducedMotion();
  const n = SLIDES.length;

  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState<{ from: number; to: number; dir: 1 | -1 } | null>(null);
  const angle = useMotionValue(0);
  const hinge = rtl ? 1 : -1; // forward turns towards the spine
  const shade = useTransform(angle, (a) => Math.sin((Math.abs(a) * Math.PI) / 180) * 0.55);
  const gloss = useTransform(angle, (a) => Math.sin((Math.abs(a) * Math.PI) / 180) * 0.35);

  useEffect(() => {
    layerOpened();
    document.documentElement.classList.add("pf-page");
    if (print) document.documentElement.setAttribute("data-print", "");
    return () => {
      layerClosed();
      document.documentElement.classList.remove("pf-page");
    };
  }, [print]);

  // the page, scaled to fit the room it has
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const el = stageRef.current;
    if (!el || print) return;
    const fit = () => setScale(Math.min(el.clientWidth / DW, el.clientHeight / DH));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [print]);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (turn) return;
      const to = index + dir;
      if (to < 0 || to >= n) return;
      if (reduce) {
        setIndex(to);
        return;
      }
      setTurn({ from: index, to, dir });
      setIndex(to);
      angle.set(dir === 1 ? 0 : hinge * 180);
      animate(angle, dir === 1 ? hinge * 180 : 0, { duration: TURN, ease: [0.45, 0.05, 0.25, 1], onComplete: () => setTurn(null) });
    },
    [turn, index, n, reduce, angle, hinge],
  );

  useEffect(() => {
    if (print) return;
    const onKey = (e: KeyboardEvent) => {
      const fwd = rtl ? "ArrowLeft" : "ArrowRight";
      const back = rtl ? "ArrowRight" : "ArrowLeft";
      if ([fwd, "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); go(1); }
      if ([back, "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); go(-1); }
      if (e.key === "Home" && !turn) setIndex(0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, rtl, print, turn]);

  // a swipe turns the page too
  const down = useRef<{ x: number; t: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => { down.current = { x: e.clientX, t: Date.now() }; };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = down.current;
    down.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 40) go((dx < 0) !== rtl ? 1 : -1);
    else {
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const right = e.clientX > r.left + r.width / 2;
      go(right !== rtl ? 1 : -1);
    }
  };

  const slide = (i: number, state: "active" | "shown") => (
    <DeckSlide key={`${i}-${state}`} i={i} state={state} lang={lang} />
  );

  if (print) {
    return (
      <div className="pf-root dk-print bg-[#05070c]">
        {SLIDES.map((_, i) => (
          <section key={i} className="relative" style={{ width: DW, height: DH, breakAfter: i < SLIDES.length - 1 ? "page" : "auto" }}>
            {slide(i, "shown")}
          </section>
        ))}
      </div>
    );
  }

  const base = turn ? (turn.dir === 1 ? turn.to : turn.from) : index;
  const leaf = turn ? (turn.dir === 1 ? turn.from : turn.to) : -1;
  const other = rtl ? "en" : "ar";

  return (
    <div className="pf-root fixed inset-0 flex flex-col bg-[radial-gradient(90%_80%_at_50%_40%,#0d1a33_0%,#05070c_70%)] text-white">
      <div ref={stageRef} className="relative min-h-0 flex-1 px-4 pt-4 md:px-10 md:pt-8">
        <div
          className="absolute left-1/2 top-1/2 cursor-pointer select-none"
          style={{ width: DW, height: DH, transform: `translate(-50%, -50%) scale(${scale})`, perspective: 4200 }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          role="region"
          aria-roledescription="slide deck"
          aria-label={`${c.meta.title}, ${k.page} ${index + 1} / ${n}`}
        >
          {/* the book's edge: the pages still to come, stacked under this one */}
          <div aria-hidden="true" className="absolute inset-0 translate-x-[10px] translate-y-[10px] rounded-[6px] bg-[#0b1326] shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)] rtl:-translate-x-[10px]" />
          <div aria-hidden="true" className="absolute inset-0 translate-x-[5px] translate-y-[5px] rounded-[6px] bg-[#111c33] rtl:-translate-x-[5px]" />
          <div className="absolute inset-0 overflow-hidden rounded-[6px] ring-1 ring-white/10">
            {slide(base, "active")}
            <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: turn ? shade : 0 }} />
          </div>
          {leaf >= 0 ? (
            <motion.div
              className="absolute inset-0"
              style={{ rotateY: angle, transformOrigin: rtl ? "right center" : "left center", transformStyle: "preserve-3d" }}
              aria-hidden="true"
            >
              <div className="absolute inset-0 overflow-hidden rounded-[6px] [backface-visibility:hidden]">
                {slide(leaf, "shown")}
                <motion.div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.55)_75%,rgba(255,255,255,0)_100%)] mix-blend-soft-light rtl:bg-[linear-gradient(270deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.55)_75%,rgba(255,255,255,0)_100%)]" style={{ opacity: gloss }} />
              </div>
              {/* the back of the page: the brand's paper */}
              <div className="absolute inset-0 grid place-items-center overflow-hidden rounded-[6px] bg-[#0b1326] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <span className="absolute -end-[160px] -top-[120px] h-[760px] w-[900px] bg-[#009df8]/25 [clip-path:polygon(28%_0,62%_0,100%_100%)]" />
                {/* eslint-disable-next-line @next/next/no-img-element -- the brand mark */}
                <img src="/brand/msg-mark-white.svg" alt="" className="h-[120px] w-auto opacity-20" />
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>

      <nav className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-white/70 md:px-10 rtl:tracking-normal" aria-label={c.meta.title}>
        <a href={`/${lang}/company-profile`} className="flex items-center gap-2 hover:text-white">
          {/* eslint-disable-next-line @next/next/no-img-element -- the brand lockup */}
          <img src="/brand/msg-logo-white.svg" alt="MSG Horizons Logistics" className="h-6 w-auto" />
          <span className="hidden sm:inline">· {k.profile}</span>
        </a>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => go(-1)} disabled={index === 0 || !!turn} aria-label={k.prev} className="grid size-10 place-items-center rounded-full ring-1 ring-white/20 transition-colors hover:bg-white/10 disabled:opacity-30">
            <span aria-hidden="true" className="rtl:-scale-x-100">←</span>
          </button>
          <span className="min-w-[5.5rem] text-center tabular-nums" aria-live="polite" dir="ltr">
            {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <button type="button" onClick={() => go(1)} disabled={index === n - 1 || !!turn} aria-label={k.next} className="grid size-10 place-items-center rounded-full ring-1 ring-white/20 transition-colors hover:bg-white/10 disabled:opacity-30">
            <span aria-hidden="true" className="rtl:-scale-x-100">→</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-white/40 lg:inline">{k.hint}</span>
          <a href={`/${other}/company-profile/deck`} lang={other} className="hover:text-white">{other === "ar" ? "العربية" : "English"}</a>
          <a href={`/media/profile/MSG-Horizons-Company-Profile-${lang.toUpperCase()}.pdf`} download className="rounded-[4px] bg-[#fff] px-3 py-2 text-[#05070c] transition-colors hover:bg-[#009df8]">{k.pdf}</a>
          <button
            type="button"
            onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.())}
            className="hidden hover:text-white sm:inline"
          >
            {k.full}
          </button>
        </div>
      </nav>
      <div className="h-[2px] w-full bg-white/10">
        <div className="h-full bg-[#009df8] transition-[width] duration-700" style={{ width: `${((index + 1) / n) * 100}%`, marginInlineStart: 0 }} />
      </div>
    </div>
  );
}
