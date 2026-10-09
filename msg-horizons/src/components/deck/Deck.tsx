"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/i18n";
import { deckCopy } from "@/content/cockpit";
import { DECK_ID, DECK_PANELS, focusPanel, isDeckPanel, type DeckPanel } from "@/lib/deck";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type Props = { lang: Locale; live: React.ReactNode; plan: React.ReactNode };

/**
 * The two core features on one sideways canvas: live tracking and the plan builder. The page still scrolls
 * down to reach them, but between them you pan sideways (tabs, arrows, swipe, or any link that points at
 * either one), so the visitor chooses where to look instead of scrolling past. Without JavaScript the two
 * simply stack.
 */
export default function Deck({ lang, live, plan }: Props) {
  const c = deckCopy[lang];
  const rtl = lang === "ar";
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [instant, setInstant] = useState(true); // no animation for the first placement
  const [height, setHeight] = useState<number>();
  const wraps = useRef<(HTMLDivElement | null)[]>([]);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const panels = [live, plan];

  const show = useCallback((i: number, immediately = false) => {
    setInstant(immediately);
    setIdx(Math.max(0, Math.min(DECK_PANELS.length - 1, i)));
  }, []);

  // a link, the route, or a shared plan can ask for a panel
  useEffect(() => {
    const onAsk = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (isDeckPanel(id)) show(DECK_PANELS.indexOf(id));
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      const id = a?.getAttribute("href")?.slice(1);
      if (!a || !id || !isDeckPanel(id) || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      focusPanel(id);
    };
    window.addEventListener("msg-deck", onAsk);
    document.addEventListener("click", onClick, true);
    return () => { window.removeEventListener("msg-deck", onAsk); document.removeEventListener("click", onClick, true); };
  }, [show]);

  // arriving on a shared plan, a service page's link, or a #planner link opens on the plan builder
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const wantsPlan = window.location.hash === "#planner" || q.has("plan") || q.has("persona");
    if (!wantsPlan) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the URL
    setIdx(1);
  }, []);

  // the panel height follows the active panel, so a short panel never leaves a gap
  useEffect(() => {
    const el = wraps.current[idx];
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    setHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, [idx]);

  // tell the route which panel is showing
  useEffect(() => {
    document.documentElement.dataset.deck = DECK_PANELS[idx];
    window.dispatchEvent(new Event("msg-deck-state"));
  }, [idx]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const t = e.target as HTMLElement;
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return; // fields and sliders keep their arrows
    if (t.getAttribute("role") === "tab" && !t.id.startsWith("deck-tab-")) return; // so do the plan's own tabs
    show(idx + d * (rtl ? -1 : 1), true); // arrow keys are repeated: no travel time
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.target as HTMLElement;
    touch.current = t.closest("input,select,textarea,canvas,.maplibregl-map,[data-noswipe]") ? null : { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touch.current;
    touch.current = null;
    if (!s) return;
    const dx = e.changedTouches[0].clientX - s.x;
    const dy = e.changedTouches[0].clientY - s.y;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) show(idx + (dx < 0 ? 1 : -1) * (rtl ? -1 : 1));
  };

  const shift = (rtl ? 1 : -1) * idx * 100;
  // on-screen movement: the strong ease-in-out; the height simply follows, it is not animated
  const still = instant || reduce;
  const glide = still ? "" : "transition-transform duration-300 ease-in-out";

  return (
    <section
      id={DECK_ID}
      data-theme="dark"
      aria-label={c.label}
      onKeyDown={onKeyDown}
      className="on-dark relative scroll-mt-16 overflow-hidden bg-deep text-white"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_85%_0%,rgba(19,113,121,0.55),transparent_70%),radial-gradient(50%_45%_at_0%_100%,rgba(11,125,54,0.28),transparent_70%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(80%_70%_at_50%_30%,#000,transparent)]" />

      <div className="relative mx-auto max-w-[88rem] px-5 pt-6 lg:px-8 lg:pt-8">
        <div role="tablist" aria-label={c.label} className="grid grid-cols-2 gap-2.5 sm:gap-4">
          {DECK_PANELS.map((id, i) => {
            const on = i === idx;
            const tab = c.tabs[id];
            return (
              <button
                key={id}
                id={`deck-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={`deck-panel-${id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => show(i)}
                data-press="soft"
                className={`group relative overflow-hidden rounded-2xl border p-3 text-start transition-colors sm:p-4 ${on ? "border-white/25 bg-white/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"}`}
              >
                <span className="flex items-center gap-3">
                  <span className={`num grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors sm:size-10 sm:text-sm ${on ? "bg-brand-bright text-deep" : "border border-white/25 text-white/70"}`}>{tab.n}</span>
                  <span className="min-w-0">
                    <span className="block font-display text-base font-semibold leading-tight sm:text-xl">{tab.t}</span>
                    <span className={`mt-0.5 hidden text-sm transition-colors sm:block ${on ? "text-white/75" : "text-white/55"}`}>{tab.d}</span>
                  </span>
                </span>
                <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-bright transition-transform duration-300 rtl:origin-right ${on ? "scale-x-100" : "scale-x-0"}`} />
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="relative overflow-clip"
        style={{ height: height ? `${height}px` : undefined }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className={`deck-track flex items-start ${glide}`} style={{ transform: `translate3d(${shift}%,0,0)` }}>
          {DECK_PANELS.map((id, i) => {
            const on = i === idx;
            return (
              <div
                key={id}
                id={`deck-panel-${id}`}
                ref={(el) => { wraps.current[i] = el; }}
                role="tabpanel"
                aria-labelledby={`deck-tab-${id}`}
                inert={on ? undefined : true}
                className={`deck-panel w-full shrink-0 ${still ? "" : "transition-[opacity,scale] duration-300 ease-in-out"} ${on ? "scale-100 opacity-100" : "scale-[0.97] opacity-0"}`}
              >
                {panels[i]}
              </div>
            );
          })}
        </div>
      </div>

      {/* the neighbours */}
      {(["prev", "next"] as const).map((d) => {
        const target = idx + (d === "next" ? 1 : -1);
        if (target < 0 || target >= DECK_PANELS.length) return null;
        return (
          <button
            key={d}
            type="button"
            onClick={() => show(target)}
            aria-label={`${c[d]}: ${c.tabs[DECK_PANELS[target] as DeckPanel].t}`}
            className={`absolute top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/25 2xl:grid ${d === "prev" ? "start-3" : "end-3"}`}
          >
            <svg viewBox="0 0 24 24" className={`size-5 ${d === "prev" ? "rtl:-scale-x-100" : "-scale-x-100 rtl:scale-x-100"}`} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
        );
      })}

      <noscript>
        <style>{`.deck-track{display:block!important;transform:none!important}.deck-panel{opacity:1!important;transform:none!important}`}</style>
      </noscript>
    </section>
  );
}
