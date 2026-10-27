"use client";

/**
 * The site map as a push menu: a panel slides in from the end edge while the page moves aside, after the
 * Push Menu Navigation component for Framer (Daniyal). Same feel: 440px panel (84% on phones), the page pushed
 * with a 0.7s ease that settles on open and accelerates away on close, and the rows rising out of a mask with a
 * short stagger (reversed, faster, on close).
 *
 * Built for this site: the rows are the route's stops (content/journey.ts), so the map and the rail never drift
 * apart; a row lands on its section through the same scroller and deck as the rail. It is a modal dialog: focus
 * moves in, Tab stays inside, Esc or the scrim closes it and focus returns to the button. Reduced motion skips the
 * travel. The page is pushed through `.push-shift` (main, footer, header) so fixed rails stay where they are.
 */
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { STOPS } from "@/content/journey";
import { facts, whatsappLink } from "@/content/facts";
import type { Dictionary, Locale } from "@/content/i18n";
import { goTo } from "@/lib/book";
import { lockScroll } from "@/lib/scroller";
import { track } from "@/lib/analytics";
import { useActiveSection } from "@/lib/use-active-section";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const noop = () => () => {};
const OPEN = "cubic-bezier(0.32,0.72,0,1)";
const CLOSE = "cubic-bezier(0.82,-0.01,0.88,0.77)";
const ROW_IN = "cubic-bezier(0.22,1,0.36,1)";
const ROW_OUT = "cubic-bezier(0.82,0,0.88,0.77)";

/** two lines that cross into an X */
export function MenuButton({ open, onClick, label, ink, controls = true }: { open: boolean; onClick: () => void; label: string; ink: boolean; controls?: boolean }) {
  const bar = { transitionTimingFunction: OPEN } as const;
  return (
    <button
      type="button"
      aria-expanded={controls ? open : undefined}
      aria-controls={controls ? "site-map" : undefined}
      aria-haspopup={controls ? "dialog" : undefined}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 rounded-md px-2 py-2 ${ink ? "text-ink" : "text-white"}`}
    >
      <span aria-hidden="true" className="relative block h-3.5 w-5">
        <span style={bar} className={`absolute inset-x-0 top-[3px] h-[1.8px] rounded-full bg-current transition-transform duration-500 motion-reduce:transition-none ${open ? "translate-y-[3.6px] rotate-45" : ""}`} />
        <span style={bar} className={`absolute inset-x-0 bottom-[3px] h-[1.8px] rounded-full bg-current transition-transform duration-500 motion-reduce:transition-none ${open ? "-translate-y-[3.6px] -rotate-45" : ""}`} />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export default function PushMenu({ t, lang, open, onClose }: { t: Dictionary; lang: Locale; open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  const active = useActiveSection();
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  // the portal needs document.body: false while rendering on the server, true in the browser
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  // push the page, lock its scroll, move focus in; undo all of it on close
  useEffect(() => {
    const root = document.documentElement;
    if (!open) { root.classList.remove("push-open"); return; }
    opener.current = document.activeElement as HTMLElement | null;
    root.classList.add("push-open");
    lockScroll(true);
    const first = panel.current?.querySelector<HTMLElement>("a,button");
    const id = window.setTimeout(() => first?.focus({ preventScroll: true }), reduce ? 0 : 120);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !panel.current) return;
      const items = [...panel.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled])")];
      if (!items.length) return;
      const [a, z] = [items[0], items[items.length - 1]];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      root.classList.remove("push-open");
      opener.current?.focus({ preventScroll: true });
    };
  }, [open, onClose, reduce]);

  const land = useCallback((id: string) => {
    onClose();
    track("cta_click", { cta: "site_map", location: id });
    // let the page unlock first, then travel the way the route rail does
    window.setTimeout(() => goTo(id, { immediate: reduce }), 30);
  }, [onClose, reduce]);

  if (!mounted) return null;
  const n = STOPS.length;
  const other = lang === "en" ? "ar" : "en";
  const row = (i: number) => ({
    transitionProperty: "transform, opacity",
    transitionDuration: reduce ? "0s" : open ? "0.5s" : "0.28s",
    transitionTimingFunction: open ? ROW_IN : ROW_OUT,
    transitionDelay: reduce ? "0s" : open ? `${0.2 + i * 0.03}s` : `${(n - 1 - i) * 0.018}s`,
  });

  return createPortal(
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[55] bg-pitch/40 transition-opacity duration-500 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <div
        id="site-map"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.siteMap}
        inert={!open}
        className="fixed inset-y-0 end-0 z-[60] flex w-[var(--push-w)] flex-col overflow-y-auto overscroll-contain bg-pitch text-white"
        data-lenis-prevent
        style={{
          transform: open ? "translateX(0)" : `translateX(${lang === "ar" ? "-100%" : "100%"})`,
          // hidden (out of the accessibility tree too) once the close slide has finished
          visibility: open ? "visible" : "hidden",
          transition: reduce ? "none" : `transform 0.7s ${open ? OPEN : CLOSE}, visibility 0s linear ${open ? "0s" : "0.7s"}`,
        }}
      >
        <div className="flex h-16 shrink-0 items-center justify-between ps-6 pe-3 sm:ps-8 sm:pe-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a8dcff] rtl:tracking-normal">{t.nav.siteMap}</p>
          <MenuButton open={open} onClick={onClose} label={t.nav.close} ink={false} controls={false} />
        </div>

        <nav aria-label={t.nav.siteMap} className="flex-1 px-6 pb-6 sm:px-8">
          <ol className="border-t border-white/10">
            {STOPS.map((s, i) => {
              const here = active === s.id;
              return (
                <li key={s.id} className="overflow-hidden border-b border-white/10">
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => { e.preventDefault(); land(s.id); }}
                    aria-current={here ? "location" : undefined}
                    className="group flex items-baseline gap-4 py-3 outline-none focus-visible:bg-white/5"
                    style={{ ...row(i), transform: open ? "translateY(0)" : "translateY(110%)", opacity: open ? 1 : 0 }}
                  >
                    <span className="num w-6 shrink-0 text-xs font-medium text-white/45" dir="ltr">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block font-display text-xl font-semibold leading-tight transition-colors group-hover:text-[#a8dcff] sm:text-2xl ${here ? "text-[#a8dcff]" : ""}`}>{s.title[lang]}</span>
                      <span className="mt-0.5 block truncate text-[13px] text-white/60">{s.hint[lang]}</span>
                    </span>
                    {here ? <span className="shrink-0 rounded-full bg-[#a8dcff]/15 px-2 py-0.5 text-[10px] font-semibold text-[#a8dcff]">{t.nav.youAreHere}</span> : null}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="grid gap-5 border-t border-white/10 px-6 py-6 sm:px-8" style={{ ...row(n), transform: open ? "translateY(0)" : "translateY(16px)", opacity: open ? 1 : 0 }}>
          <div className="grid grid-cols-2 gap-2.5">
            <a href="#planner" onClick={(e) => { e.preventDefault(); land("planner"); track("cta_click", { cta: "plan", location: "site_map" }); }} className="rounded-full bg-white px-4 py-3 text-center text-sm font-semibold text-teal-deep">
              {t.nav.ctaShort}
            </a>
            <a href={whatsappLink(t.wa.general)} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_click", { location: "site_map" })} className="rounded-full px-4 py-3 text-center text-sm font-semibold text-white ring-1 ring-white/25">
              {t.nav.whatsapp}
            </a>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4 text-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45 rtl:tracking-normal">{t.nav.reach}</p>
              <a href={`tel:${facts.contact.phoneE164}`} className="mt-1.5 block text-white/85 hover:text-white" dir="ltr">{facts.contact.phoneDisplay}</a>
              <a href={`mailto:${facts.contact.email}`} className="block text-white/85 hover:text-white">{facts.contact.email}</a>
            </div>
            <a href={`/${other}`} hrefLang={other} lang={other} aria-label={t.nav.langSwitchLabel} className="rounded-full px-3 py-1.5 text-white/85 ring-1 ring-white/20 hover:text-white">
              {t.nav.langSwitch}
            </a>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
