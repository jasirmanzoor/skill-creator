"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fmt, type Locale } from "@/content/i18n";
import { journeyCopy, LENS_OF, STOPS, type Lens, type Stop } from "@/content/journey";
import { pageTop, position, routeFraction, showNext, stepIndex } from "@/lib/journey";
import { track } from "@/lib/analytics";
import { scrollToY } from "@/lib/scroller";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { usePlan } from "../PlanContext";
import { ArrowIcon } from "../ui/icons";
import { VanGlyph } from "../live/glyphs";
import RouteMap from "./RouteMap";

/**
 * The page as a route. Every section is a stop; a courier marker moves along the route as you scroll, so
 * you always know where you are, what is ahead and where it ends. Click any stop, hop with ] and [, or open
 * the whole route as a map (M) and let it show you what matters to you. It never takes over the scroll wheel.
 */
export default function Journey({ lang }: { lang: Locale }) {
  const c = journeyCopy[lang];
  const reduce = useReducedMotion();
  const { plan, seed } = usePlan();
  const [stops, setStops] = useState<Stop[]>([]);
  const [active, setActive] = useState(0);
  const [next, setNext] = useState(false);
  const [open, setOpen] = useState(false);
  const [lens, setLens] = useState<Lens>("all");
  const hud = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const tops = useRef<number[]>([]);
  const ids = useRef<string[]>([]);
  const cur = useRef({ index: 0, t: 0 });
  const touchedLens = useRef(false);

  // who the visitor says they are (from the planner or the hero) picks the starting lens, until they choose one
  const fromPlan = plan?.persona ?? seed?.persona;
  useEffect(() => {
    if (!fromPlan || touchedLens.current) return;
    const frame = requestAnimationFrame(() => setLens(LENS_OF[fromPlan]));
    return () => cancelAnimationFrame(frame);
  }, [fromPlan]);
  const chooseLens = (l: Lens) => { touchedLens.current = true; setLens(l); };

  // measure the stops, then follow the scroll
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const n = tops.current.length;
      if (!n) return;
      const y = window.scrollY + window.innerHeight * 0.4; // the reading line
      const pos = position(tops.current, document.documentElement.scrollHeight, y);
      cur.current = { index: pos.index, t: pos.t };
      hud.current?.style.setProperty("--f", routeFraction(pos.p, n).toFixed(4));
      setActive((a) => (a === pos.index ? a : pos.index));
      setNext((v) => (v === showNext(pos.index, pos.t, n) ? v : !v));
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    const measure = () => {
      const found = STOPS.map((s) => ({ s, el: document.getElementById(s.id) })).filter((x): x is { s: Stop; el: HTMLElement } => !!x.el);
      found.sort((a, b) => pageTop(a.el) - pageTop(b.el));
      tops.current = found.map((x) => pageTop(x.el));
      const next = found.map((x) => x.s.id);
      if (next.join() !== ids.current.join()) {
        ids.current = next;
        setStops(found.map((x) => x.s));
      }
      schedule();
    };
    const first = requestAnimationFrame(measure);
    const late = window.setTimeout(measure, 900);
    const ro = new ResizeObserver(() => measure());
    ro.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(raf);
      window.clearTimeout(late);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const go = useCallback((i: number, immediate = false) => {
    const id = ids.current[i];
    const el = id ? document.getElementById(id) : null;
    if (!el) return;
    scrollToY(i === 0 ? 0 : pageTop(el) - 64, { immediate: immediate || reduce });
    track("cta_click", { cta: "route_stop", location: id });
  }, [reduce]);

  const openMap = useCallback(() => {
    opener.current = document.activeElement as HTMLElement | null;
    setOpen(true);
    track("cta_click", { cta: "route_map", location: "route" });
  }, []);
  const closeMap = useCallback(() => {
    setOpen(false);
    opener.current?.focus?.();
  }, []);

  // keyboard: ] next stop, [ previous stop (or the start of this one), M the map
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const n = ids.current.length;
      if (!n) return;
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        if (open) closeMap();
        else openMap();
      } else if (!open && e.key === "]") {
        go(stepIndex(cur.current.index, 1, n));
      } else if (!open && e.key === "[") {
        // mid-stop: back to its start; already at the start (where a hop lands): the stop before
        const { index } = cur.current;
        const atStart = Math.abs(window.scrollY - Math.max(0, (tops.current[index] ?? 0) - 64)) < 120;
        go(atStart ? stepIndex(index, -1, n) : index);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go, openMap, closeMap]);

  const n = stops.length;
  if (n < 2) return null;
  const here = stops[Math.min(active, n - 1)];
  const label = (s: Stop) => s.title[lang];
  const ofTotal = fmt(c.stopOf, { n: active + 1, total: n });
  const nextStop = stops[Math.min(active + 1, n - 1)];

  return (
    <>
      <div ref={hud} className="pointer-events-none fixed inset-0 z-30" style={{ ["--f" as string]: 0 }}>
        {/* wide screens: the whole route, always in view */}
        <nav aria-label={c.stops} className="pointer-events-auto absolute end-5 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 rounded-full bg-ink/80 px-2.5 py-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10 backdrop-blur-md 2xl:flex">
          <button
            type="button"
            onClick={openMap}
            aria-label={c.openMap}
            aria-haspopup="dialog"
            className="grid size-8 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20V6.5ZM9 4v13.5M15 6.5V20" />
            </svg>
          </button>
          <div className="relative h-[min(52vh,23rem)] w-6">
            <span aria-hidden="true" className="absolute inset-y-0 start-1/2 w-px -translate-x-1/2 bg-white/20 rtl:translate-x-1/2" />
            <span aria-hidden="true" className="absolute start-1/2 top-0 w-0.5 -translate-x-1/2 rounded-full bg-brand-bright rtl:translate-x-1/2" style={{ height: "calc(var(--f) * 100%)" }} />
            {stops.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={fmt(c.goTo, { title: label(s) })}
                aria-current={i === active ? "location" : undefined}
                className="group absolute start-1/2 grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full rtl:translate-x-1/2"
                style={{ top: `${(i / (n - 1)) * 100}%` }}
              >
                <span className={`block rounded-full transition-all duration-300 ${i < active ? "size-2.5 bg-brand-bright" : i === active ? "size-2.5 bg-white" : "size-2 bg-white/35 group-hover:bg-white/80"}`} />
                <span className="pointer-events-none absolute end-full top-1/2 me-4 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-lg group-hover:block group-focus-visible:block">
                  {label(s)}
                </span>
              </button>
            ))}
            {/* the courier: moves with the scroll and says where you are */}
            <div aria-hidden="true" className="pointer-events-none absolute start-1/2 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2" style={{ top: "calc(var(--f) * 100%)" }}>
              <span className="grid size-7 place-items-center rounded-full bg-brand-bright text-ink shadow-[0_0_0_5px_rgba(76,201,122,0.25)]">
                <VanGlyph className="size-4" />
              </span>
              <span className="absolute end-full top-1/2 me-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-brand-bright px-3 py-1.5 text-xs font-bold text-ink shadow-lg">
                <span className="num" dir="ltr">{active + 1}/{n}</span> · {label(here)}
              </span>
            </div>
          </div>
        </nav>

        {/* everywhere else: a small route button with progress, which opens the map */}
        <button
          type="button"
          onClick={openMap}
          aria-label={`${c.openMap}. ${ofTotal}: ${label(here)}`}
          aria-haspopup="dialog"
          className="pointer-events-auto absolute bottom-[5.5rem] end-3 flex items-center gap-2.5 rounded-full bg-ink/85 py-1.5 pe-1.5 ps-1.5 text-white shadow-[0_18px_40px_-16px_rgba(0,0,0,0.7)] ring-1 ring-white/10 backdrop-blur-md transition-transform hover:-translate-y-0.5 lg:bottom-6 lg:end-6 lg:pe-4 2xl:hidden"
        >
          <span className="relative grid size-11 place-items-center">
            <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90 rtl:rotate-90" aria-hidden="true">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="#4cc97a" strokeWidth="3" strokeLinecap="round" strokeDasharray="94.25" style={{ strokeDashoffset: "calc(94.25px * (1 - var(--f)))" }} />
            </svg>
            <span className="num relative text-[11px] font-bold" dir="ltr">{active + 1}/{n}</span>
          </span>
          <span className="hidden max-w-[11rem] truncate text-sm font-semibold lg:block">{label(here)}</span>
        </button>

        {/* near the end of a stop: invite the visitor onward instead of letting them drift */}
        <div className="absolute inset-x-0 bottom-6 hidden justify-center lg:flex">
          <button
            type="button"
            onClick={() => go(active + 1)}
            tabIndex={next && !open ? 0 : -1}
            aria-hidden={!(next && !open)}
            className={`group flex items-center gap-2.5 rounded-full bg-white py-2.5 pe-3 ps-5 text-sm font-semibold text-ink shadow-[0_20px_50px_-18px_rgba(12,14,17,0.55)] ring-1 ring-ink/10 transition-all duration-500 ${next && !open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
          >
            <span className="text-muted">{c.next}</span>
            <span>{label(nextStop)}</span>
            <span className="grid size-7 place-items-center rounded-full bg-ink text-white transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
              <ArrowIcon className="size-3.5" />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <RouteMap
          stops={stops}
          active={active}
          lang={lang}
          c={c}
          lens={lens}
          onLens={chooseLens}
          reduce={reduce}
          onClose={closeMap}
          onGo={(i) => go(i, true)}
        />
      ) : null}
    </>
  );
}
