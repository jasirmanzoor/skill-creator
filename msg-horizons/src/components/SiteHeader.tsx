"use client";

import { useEffect, useState } from "react";
import Logo from "./ui/Logo";
import { track } from "@/lib/analytics";
import { whatsappLink } from "@/content/facts";
import type { Dictionary, Locale } from "@/content/i18n";

export default function SiteHeader({ t, lang }: { t: Dictionary; lang: Locale }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    ["#planner", t.nav.plan],
    ["#sellers", t.nav.sellers],
    ["#services", t.nav.services],
    ["#fleet", t.nav.fleet],
    ["#enterprise", t.nav.enterprise],
    ["#contact", t.nav.contact],
  ] as const;
  const other = lang === "en" ? "ar" : "en";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b bg-paper/90 backdrop-blur-md transition-colors duration-300 ${
        scrolled || open ? "border-line" : "border-transparent"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        {t.nav.skip}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
        <a href={`/${lang}`} className="rounded" aria-label="MSG Horizons">
          <Logo />
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {links.map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-[15px] text-muted transition-colors hover:text-ink">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`/${other}`}
            hrefLang={other}
            lang={other}
            aria-label={t.nav.langSwitchLabel}
            onClick={() => track("lang_switch", { to: other })}
            className="text-[15px] text-muted transition-colors hover:text-ink"
          >
            {t.nav.langSwitch}
          </a>
          <a
            href="#planner"
            onClick={() => track("cta_click", { cta: "plan", location: "header" })}
            className="hidden rounded-md bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink-3 sm:inline-flex"
          >
            {t.nav.ctaShort}
          </a>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.nav.close : t.nav.menu}
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>

      <div id="mobile-nav" hidden={!open} className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-paper px-5 pb-10 lg:hidden">
        <nav aria-label="Mobile">
          <ul className="divide-y divide-line">
            {links.map(([href, label]) => (
              <li key={href}>
                <a href={href} onClick={() => setOpen(false)} className="block py-4 font-display text-2xl font-medium text-ink">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-8 grid gap-3">
          <a
            href="#planner"
            onClick={() => { setOpen(false); track("cta_click", { cta: "plan", location: "mobile_menu" }); }}
            className="rounded-md bg-ink px-5 py-3.5 text-center font-medium text-white"
          >
            {t.nav.cta}
          </a>
          <a
            href={whatsappLink(t.wa.general)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { location: "mobile_menu" })}
            className="rounded-md border border-line-strong px-5 py-3.5 text-center font-medium text-ink"
          >
            {t.nav.talk} · {t.nav.whatsapp}
          </a>
        </div>
      </div>
    </header>
  );
}
