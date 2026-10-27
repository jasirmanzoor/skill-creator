"use client";

import { useState, type MouseEvent } from "react";
import type { ProfileCopy } from "@/content/profile";
import { scrollToHash } from "./engine";

function go(e: MouseEvent<HTMLAnchorElement>, then?: () => void) {
  const hash = e.currentTarget.getAttribute("href");
  if (!hash?.startsWith("#")) return;
  e.preventDefault();
  then?.();
  scrollToHash(hash);
}

/** The profile's header (after the template's): the MSG lockup, the sections, the language and one call to action. */
export function Header({ c, lang }: { c: ProfileCopy; lang: string }) {
  const [open, setOpen] = useState(false);
  const other = lang === "ar" ? "en" : "ar";
  return (
    <header className="fixed inset-x-0 top-0 z-50 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#05070c]/70 to-transparent" />
      <div className="relative flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-5 md:px-[3vw]">
        <a href="#top" onClick={(e) => go(e)} className="flex items-center" aria-label="MSG Horizons">
          {/* eslint-disable-next-line @next/next/no-img-element -- the brand lockup, already sized */}
          <img src="/brand/msg-logo-white.svg" alt="MSG Horizons Logistics" className="h-7 w-auto md:h-8" />
        </a>
        <nav aria-label="Profile" className="hidden items-center gap-8 md:flex">
          {c.nav.map((item) => (
            <a key={item.href} href={item.href} onClick={(e) => go(e)} className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-white/75 transition-colors hover:text-white rtl:tracking-normal">
              {item.label}
            </a>
          ))}
          <a href={`/${other}/company-profile`} className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-white/75 hover:text-white" lang={other}>
            {other === "ar" ? "العربية" : "English"}
          </a>
          <a href="#contact" onClick={(e) => go(e)} className="rounded-[4px] bg-[#fff] px-4 py-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#05070c] transition-colors hover:bg-[#009df8] rtl:tracking-normal">
            {c.talk}
          </a>
        </nav>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="pf-menu" className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] md:hidden">
          {open ? c.close : c.menu}
        </button>
      </div>
      <div id="pf-menu" inert={!open} className={`fixed inset-0 -z-10 flex flex-col justify-center gap-6 bg-[#05070c]/95 px-6 backdrop-blur-xl transition-opacity md:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        {[...c.nav, { label: c.talk, href: "#contact" }].map((item, i) => (
          <a key={item.href} href={item.href} onClick={(e) => go(e, () => setOpen(false))} className="flex items-baseline gap-4 font-display text-[1.75rem] font-semibold uppercase tracking-[0.1em] rtl:tracking-normal">
            <span className="font-mono text-[0.6875rem] text-[#7fcbfb]" dir="ltr">0{i + 1}</span>
            {item.label}
          </a>
        ))}
        <a href={`/${other}/company-profile`} className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-white/70" lang={other}>
          {other === "ar" ? "العربية" : "English"}
        </a>
      </div>
    </header>
  );
}

export function Footer({ c, lang }: { c: ProfileCopy; lang: string }) {
  return (
    <footer className="border-t border-white/10 bg-[#05070c] px-4 py-8 sm:px-6 md:px-[6vw]">
      <div className="flex flex-col gap-4 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-white/50 rtl:tracking-normal md:flex-row md:items-center md:justify-between">
        <span className="flex items-center gap-2.5 text-white/80">
          {/* eslint-disable-next-line @next/next/no-img-element -- the brand mark */}
          <img src="/brand/msg-mark-white.svg" alt="" className="h-4 w-auto" />
          {c.footer.line}
        </span>
        <a href={`/${lang}`} className="hover:text-white">{c.footer.site}</a>
        <a href="#top" onClick={(e) => go(e)} className="hover:text-white">{c.footer.back}</a>
      </div>
    </footer>
  );
}
