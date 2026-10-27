"use client";

import { useCallback, useEffect, useState } from "react";
import Logo from "./ui/Logo";
import SiteSearch from "./SiteSearch";
import ThemeToggle from "./ThemeToggle";
import Glass, { useGlass } from "./fx/Glass";
import PushMenu, { MenuButton } from "./PushMenu";
import { track } from "@/lib/analytics";
import { onBookState } from "@/lib/book";
import { PRIMARY_NAV } from "@/content/nav";
import { useActiveSection } from "@/lib/use-active-section";
import type { Dictionary, Locale } from "@/content/i18n";

const NAV_LABEL: Record<(typeof PRIMARY_NAV)[number]["id"], keyof Dictionary["nav"]> = {
  services: "services",
  fleet: "fleet",
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
    const off = onBookState(() => requestAnimationFrame(on));
    window.addEventListener("scroll", on, { passive: true });
    return () => { off(); window.removeEventListener("scroll", on); };
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const other = lang === "en" ? "ar" : "en";
  const solid = scrolled && !overDark;
  // ink text on the light hero and light sections; white only over dark sections
  const ink = !overDark;
  const dark = overDark;
  const linkBase = ink ? "text-muted hover:text-ink" : "text-white/80 hover:text-white";
  const glass = useGlass();
  const blur = glass ? "" : " backdrop-blur-md";

  return (
    <>
    <header
      className={`push-shift fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        dark
          ? `border-white/10 ${glass ? "bg-night/70" : "bg-night/80"}${blur}`
          : solid
            ? `border-line ${glass ? "bg-paper/80" : "bg-paper/90"}${blur}`
            : "border-transparent bg-transparent"
      }`}
    >
      {dark || solid ? <Glass /> : null}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        {t.nav.skip}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <a href={`/${lang}`} className="tap rounded" aria-label="MSG Horizons">
          <Logo inverted={!ink} />
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
                    className={`nav-link relative inline-flex px-3 py-2 text-[15px] transition-colors ${
                      isActive
                        ? ink
                          ? "font-semibold text-ink"
                          : "font-semibold text-white"
                        : linkBase
                    }`}
                  >
                    {t.nav[NAV_LABEL[item.id]]}
                    {isActive && (
                      <span
                        className={`absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full ${ink ? "bg-brand" : "bg-white"}`}
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
          <SiteSearch t={t} lang={lang} inverted={!ink} />
          <ThemeToggle lang={lang} />
          <a
            href={`/${other}`}
            hrefLang={other}
            lang={other}
            aria-label={t.nav.langSwitchLabel}
            onClick={() => track("lang_switch", { to: other })}
            className={`tap inline-flex min-w-11 items-center justify-center text-[15px] transition-colors ${linkBase}`}
          >
            {t.nav.langSwitch}
          </a>
          <a
            href="#planner"
            onClick={() => track("cta_click", { cta: "plan", location: "header" })}
            className={`btn-primary hidden px-4 py-2 text-sm md:inline-flex ${ink ? "" : "on-dark"}`}
          >
            {t.nav.ctaShort}
          </a>
          <MenuButton open={open} onClick={() => setOpen((o) => !o)} label={t.nav.menu} ink={ink} />
        </div>
      </div>

    </header>
    <PushMenu t={t} lang={lang} open={open} onClose={close} />
    </>
  );
}
