import { en, type Dictionary } from "./dictionaries/en";
import { ar } from "./dictionaries/ar";

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

const dictionaries: Record<Locale, Dictionary> = { en, ar };

export const isLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);
export const getDictionary = (l: Locale): Dictionary => dictionaries[l];
export const dirOf = (l: Locale) => (l === "ar" ? "rtl" : "ltr");

/** Tiny template helper: fmt("Step {n}", { n: 1 }) */
export const fmt = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

export type { Dictionary };
