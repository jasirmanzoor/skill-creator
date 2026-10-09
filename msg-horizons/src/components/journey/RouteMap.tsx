"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fmt, type Locale } from "@/content/i18n";
import { journeyCopy, LENSES, type Lens, type Stop } from "@/content/journey";
import { buildRoute } from "@/lib/journey";
import { lockScroll } from "@/lib/scroller";
import { CheckIcon } from "../ui/icons";
import { VanGlyph } from "../live/glyphs";

type Props = {
  stops: Stop[];
  active: number;
  lang: Locale;
  c: (typeof journeyCopy)["en"];
  lens: Lens;
  onLens: (l: Lens) => void;
  reduce: boolean;
  /** opened from the keyboard: appear at once, no entrance */
  still?: boolean;
  onClose: () => void;
  onGo: (i: number) => void;
};

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * The whole website as one route you can see at once. Pick who you are and the stops that matter to you light
 * up; pick a stop and the courier travels the route to it, then the page is there. Esc or M closes it.
 */
export default function RouteMap({ stops, active, lang, c, lens, onLens, reduce, still, onClose, onGo }: Props) {
  const n = stops.length;
  const rtl = lang === "ar";
  const route = useMemo(() => buildRoute(n, rtl), [n, rtl]);
  const dlg = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const courier = useRef<HTMLSpanElement>(null);
  const raf = useRef(0);
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const fits = (s: Stop) => lens === "all" || s.for.includes(lens);
  const pct = (p: { x: number; y: number }) => ({ left: `${(p.x / route.W) * 100}%`, top: `${(p.y / route.H) * 100}%` });
  const start = route.at(route.stopLen[Math.min(active, n - 1)] ?? 0);
  const doneLen = route.stopLen[Math.min(active, n - 1)] ?? 0;

  useEffect(() => {
    lockScroll(true);
    closeBtn.current?.focus();
    return () => { lockScroll(false); cancelAnimationFrame(raf.current); };
  }, []);

  const finish = (to: number) => {
    onGo(to); // the page jumps behind the map while it fades, so you land on the stop
    setLeaving(true);
    window.setTimeout(onClose, reduce ? 0 : 280);
  };

  const travel = (to: number) => {
    if (busy) return;
    setBusy(true);
    if (reduce || to === active) return finish(to);
    const from = route.stopLen[active];
    const dest = route.stopLen[to];
    const dur = clamp((Math.abs(dest - from) / route.total) * 1700 + 380, 480, 1800);
    let t0 = -1;
    const step = (now: number) => {
      if (t0 < 0) t0 = now;
      const k = Math.min(1, (now - t0) / dur);
      const p = route.at(from + (dest - from) * easeInOut(k));
      const el = courier.current;
      if (el) { el.style.left = `${(p.x / route.W) * 100}%`; el.style.top = `${(p.y / route.H) * 100}%`; }
      if (k < 1) raf.current = requestAnimationFrame(step);
      else finish(to);
    };
    raf.current = requestAnimationFrame(step);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !busy) { e.stopPropagation(); onClose(); return; }
    if (e.key !== "Tab") return;
    const f = [...(dlg.current?.querySelectorAll<HTMLElement>("button:not([disabled]), [href]") ?? [])].filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const node = (i: number) =>
    i < active ? "bg-brand-bright text-ink" : i === active ? "bg-white text-ink ring-4 ring-brand-bright/60" : "border border-white/30 bg-[#0b2e33] text-white";

  const label = (s: Stop, i: number) => (
    <>
      <span className="block font-display text-[15px] font-semibold leading-tight">{s.title[lang]}</span>
      <span className="mt-1 block text-[12px] leading-snug text-white/70">{s.hint[lang]}</span>
      {i === active ? <span className="mt-1.5 inline-block rounded-full bg-brand-bright px-2 py-0.5 text-[11px] font-bold text-ink">{c.here}</span> : null}
      {lens !== "all" && fits(s) && i !== active ? <span className="mt-1.5 inline-block rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white">{c.fits}</span> : null}
    </>
  );

  return (
    <div
      ref={dlg}
      role="dialog"
      aria-modal="true"
      aria-labelledby="route-title"
      onKeyDown={onKeyDown}
      className={`${still ? "" : "route-in"} fixed inset-0 z-[70] overflow-y-auto bg-pitch/[0.97] text-white backdrop-blur-xl transition-opacity duration-300 ${leaving ? "opacity-0" : "opacity-100"}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_85%_0%,rgba(19,113,121,0.5),transparent_70%),radial-gradient(50%_45%_at_0%_100%,rgba(11,125,54,0.25),transparent_70%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(80%_70%_at_50%_30%,#000,transparent)]" />

      <div className="relative mx-auto flex min-h-full max-w-6xl flex-col px-5 pb-10 pt-8 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand-bright">{c.route}</p>
            <h2 id="route-title" className="mt-2 font-display text-3xl font-semibold tracking-[-0.025em] sm:text-4xl rtl:tracking-normal">{c.mapTitle}</h2>
            <p className="mt-3 max-w-xl text-white/70">{fmt(c.mapLead, { total: n })}</p>
          </div>
          <button
            ref={closeBtn}
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label={c.close}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition-colors hover:bg-white/20 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span id="route-lens" className="text-sm font-medium text-white/80">{c.lensTitle}</span>
          <div role="radiogroup" aria-labelledby="route-lens" className="flex flex-wrap gap-2">
            {LENSES.map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={lens === l}
                onClick={() => onLens(l)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 transition-colors ${lens === l ? "bg-white text-ink ring-white" : "bg-white/5 text-white ring-white/20 hover:bg-white/15"}`}
              >
                {c.lens[l]}
              </button>
            ))}
          </div>
        </div>

        {/* wide screens: the route laid out as a map */}
        <div className="relative mx-auto my-auto hidden aspect-[1000/425] w-full max-w-[72rem] md:block">
          <svg viewBox={`0 0 ${route.W} ${route.H}`} className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
            <path d={route.d} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 12" />
            <path d={route.d} fill="none" stroke="var(--color-brand-bright)" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${doneLen} ${route.total}`} style={{ filter: "drop-shadow(0 0 6px rgba(76,201,122,0.5))" }} />
          </svg>
          <ol aria-label={c.stops}>
            {stops.map((s, i) => (
              <li key={s.id} className="absolute" style={pct(route.pts[i])}>
                <button
                  type="button"
                  onClick={() => travel(i)}
                  disabled={busy}
                  aria-label={fmt(c.goTo, { title: s.title[lang] })}
                  aria-current={i === active ? "location" : undefined}
                  className={`group absolute start-1/2 top-0 flex w-32 -translate-x-1/2 -translate-y-[1.375rem] flex-col items-center text-center transition-opacity duration-300 rtl:translate-x-1/2 lg:w-40 ${fits(s) ? "opacity-100" : "opacity-40 hover:opacity-100 focus-visible:opacity-100"}`}
                >
                  <span className={`relative grid size-11 shrink-0 place-items-center rounded-full text-sm font-bold transition-transform group-hover:scale-110 ${node(i)}`}>
                    {i < active ? <CheckIcon className="size-4" /> : <span className="num">{i + 1}</span>}
                  </span>
                  <span className="mt-3 block">{label(s, i)}</span>
                </button>
              </li>
            ))}
          </ol>
          <span
            ref={courier}
            aria-hidden="true"
            className="pointer-events-none absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-bright text-ink shadow-[0_0_0_7px_rgba(76,201,122,0.25),0_10px_24px_-8px_rgba(0,0,0,0.6)]"
            style={pct(start)}
          >
            <VanGlyph className="size-5" />
          </span>
        </div>

        {/* phones: the same route as a list */}
        <ol aria-label={c.stops} className="relative mt-8 space-y-2 md:hidden">
          {stops.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => travel(i)}
                disabled={busy}
                aria-label={fmt(c.goTo, { title: s.title[lang] })}
                aria-current={i === active ? "location" : undefined}
                className={`flex w-full items-center gap-4 rounded-2xl bg-white/5 p-3 text-start ring-1 ring-white/10 transition-opacity ${i === active ? "ring-brand-bright/60" : ""} ${fits(s) ? "opacity-100" : "opacity-45"}`}
              >
                <span className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold ${node(i)}`}>
                  {i < active ? <CheckIcon className="size-4" /> : <span className="num">{i + 1}</span>}
                </span>
                <span className="min-w-0">{label(s, i)}</span>
              </button>
            </li>
          ))}
        </ol>

        <p className="mt-auto pt-10 text-xs text-white/60">{c.tip}</p>
      </div>
    </div>
  );
}
