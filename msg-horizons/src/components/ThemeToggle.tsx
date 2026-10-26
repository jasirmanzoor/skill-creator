"use client";

import { motion } from "motion/react";
import { useEffect, useSyncExternalStore } from "react";
import type { Locale } from "@/content/i18n";

const KEY = "msg-theme";
const QUERY = "(prefers-color-scheme: dark)";
const label: Record<Locale, string> = { en: "Dark theme", ar: "الوضع الداكن" };

const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
};

function apply(dark: boolean, save: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  if (save) {
    try { localStorage.setItem(KEY, dark ? "dark" : "light"); } catch { /* private mode: the choice lasts this visit */ }
  }
}

/**
 * Light and dark, after Skiper UI's Skiper26 theme toggle (skiper-ui.com, free version: attribution in the footer):
 * the half-moon disc turns over, and the new theme spreads out of the button in a circle (View Transitions, the
 * "circle" variant started from the button). It starts on the device's own setting and remembers a choice; the
 * first-paint script in the layout applies it before anything shows. Reduced motion switches at once.
 */
export default function ThemeToggle({ lang, className = "" }: { lang: Locale; className?: string }) {
  const dark = useSyncExternalStore(subscribe, () => document.documentElement.classList.contains("dark"), () => false);

  // follow the device while the visitor has not chosen
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const on = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem(KEY); } catch { /* ignore */ }
      if (!saved) apply(mq.matches, false);
    };
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = !dark;
    const root = document.documentElement;
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    root.style.setProperty("--theme-x", `${x}px`);
    root.style.setProperty("--theme-y", `${y}px`);
    root.style.setProperty("--theme-r", `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof document.startViewTransition !== "function") return apply(next, true);
    root.dataset.themeTurn = "";
    const t = document.startViewTransition(() => apply(next, true));
    t.finished.finally(() => { delete root.dataset.themeTurn; });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={label[lang]}
      title={label[lang]}
      className={`tap grid size-9 shrink-0 place-items-center rounded-full bg-ink p-0 ring-1 ring-white/15 transition-transform duration-300 active:scale-95 ${className}`}
    >
      <svg viewBox="0 0 240 240" className="size-9" fill="none" aria-hidden="true">
        <motion.g animate={{ rotate: dark ? -180 : 0 }} transition={{ ease: "easeInOut", duration: 0.5 }}>
          <path d="M120 67.5C149.25 67.5 172.5 90.75 172.5 120C172.5 149.25 149.25 172.5 120 172.5" fill="var(--color-paper)" />
          <path d="M120 67.5C90.75 67.5 67.5 90.75 67.5 120C67.5 149.25 90.75 172.5 120 172.5" fill="var(--color-ink)" />
        </motion.g>
        <motion.path
          animate={{ rotate: dark ? 180 : 0 }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
         
          d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120C236.25 55.5 184.5 3.75 120 3.75ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z"
          fill="var(--color-paper)"
        />
      </svg>
    </button>
  );
}
