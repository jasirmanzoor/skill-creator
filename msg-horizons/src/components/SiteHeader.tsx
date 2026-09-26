"use client";

import { useEffect, useState } from "react";
import Logo from "./ui/Logo";
import SiteSearch from "./SiteSearch";
import { track } from "@/lib/analytics";
import { whatsappLink } from "@/content/facts";
import { PRIMARY_NAV, type NavId } from "@/content/nav";
import { useActiveSection } from "@/lib/use-active-section";
import type { Dictionary, Locale } from "@/content/i18n";

const NAV_LABEL: Record<(typeof PRIMARY_NAV)[number]["id"], keyof Dictionary["nav"]> = {
  services: "services",
  fleet: "fleet",
  enterprise: "enterprise",
  contact: "contact",
};

const CRUMB_LABEL: Partial<Record<NavId, keyof Dictionary["nav"]>> = {
  planner: "planFull",
  sellers: "sellers",
  services: "services",
  fleet: "fleet",
  proof: "proof",
  gallery: "proof",
  enterprise: "enterprise",
  contact: "contact",
};

export default function SiteHeader({ t, lang }: { t: Dictionary; lang: Locale }) {
  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection();

  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.3);
      const y = 32;
      setOverDark(
        [...document.querySelectorAll<HTMLElement>('[data-theme="dark"]')].some((el) => {
          const r = el.getBoundingClientRect();
          return r.top <= y && r.bottom >= y;
        }),
      );
    };
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

  const other = lang === "en" ? "ar" : "en";
  const solid = (scrolled || open) && !overDark;
  const dark = overDark && !open;
  const linkBase = solid ? "text-muted hover:text-ink" : "text-white/80 hover:text-white";
  const crumb = active ? CRUMB_LABEL[active] : null;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        dark
          ? "border-white/10 bg-ink/80 backdrop-blur-md"
          : solid
            ? "border-line bg-paper/90 backdrop-blur-md"
            : "border-transparent bg-transparent"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        {t.nav.skip}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <a href={`/${lang}`} className="rounded" aria-label="MSG Horizons">
          <Logo inverted={!solid} />
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {PRIMARY_NAV.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    aria-current={isActive ? "location" : undefined}
                    className={`relative inline-flex px-3 py-2 text-[15px] transition-colors ${
                      isActive
                        ? solid
                          ? "font-semibold text-ink"
                          : "font-semibold text-white"
                        : linkBase
                    }`}
                  >
                    {t.nav[NAV_LABEL[item.id]]}
                    {isActive && (
                      <span
                        className={`absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full ${solid ? "bg-brand" : "bg-white"}`}
                        aria-hidden="true"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <SiteSearch t={t} inverted={!solid} />
          <a
            href={`/${other}`}
            hrefLang={other}
            lang={other}
            aria-label={t.nav.langSwitchLabel}
            onClick={() => track("lang_switch", { to: other })}
            className={`text-[15px] transition-colors ${linkBase}`}
          >
            {t.nav.langSwitch}
          </a>
          <a
            href="#planner"
            onClick={() => track("cta_click", { cta: "plan", location: "header" })}
            className={`hidden rounded-md px-4 py-2 text-sm font-medium transition-colors md:inline-flex ${
              solid ? "bg-ink text-white hover:bg-ink-3" : "bg-white text-ink hover:bg-white/90"
            }`}
          >
            {t.nav.ctaShort}
          </a>
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-md px-2 py-2 lg:hidden ${solid ? "text-ink" : "text-white"}`}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.nav.close : t.nav.menu}
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
            <span className="text-sm font-medium">{open ? t.nav.close : t.nav.menu}</span>
          </button>
        </div>
      </div>

      {scrolled && crumb && !open && (
        <div className={`hidden border-t px-5 text-xs lg:block lg:px-8 ${solid ? "border-line text-muted" : "border-white/10 text-white/70"}`}>
          <nav aria-label="Breadcrumb" className="mx-auto flex h-8 max-w-7xl items-center gap-2">
            <a href={`/${lang}`} className="hover:underline">
              {t.nav.home}
            </a>
            <span aria-hidden="true">/</span>
            <span className={solid ? "font-medium text-ink" : "font-medium text-white"}>
              {t.nav[crumb]}
            </span>
          </nav>
        </div>
      )}

      <div id="mobile-nav" hidden={!open} className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-paper px-5 pb-10 lg:hidden">
        <nav aria-label={t.nav.menu}>
          <ul className="divide-y divide-line">
            {PRIMARY_NAV.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    aria-current={isActive ? "location" : undefined}
                    onClick={() => setOpen(false)}
                    className={`block py-4 font-display text-2xl font-medium ${isActive ? "text-brand" : "text-ink"}`}
                  >
                    {t.nav[NAV_LABEL[item.id]]}
                  </a>
                </li>
              );
            })}
            <li>
              <a href="#sellers" onClick={() => setOpen(false)} className="block py-4 font-display text-2xl font-medium text-ink">
                {t.nav.sellers}
              </a>
            </li>
          </ul>
        </nav>
        <div className="mt-8 grid gap-3">
          <a
            href="#planner"
            onClick={() => {
              setOpen(false);
              track("cta_click", { cta: "plan", location: "mobile_menu" });
            }}
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
