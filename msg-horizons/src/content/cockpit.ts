import type { Locale } from "./i18n";

/** Short labels for the plan cockpit (src/components/sections/Planner.tsx): the stepper and the result tabs. */
export const cockpitCopy: Record<Locale, {
  steps: [string, string, string, string];
  tabs: { numbers: string; services: string; why: string; next: string };
  tabsLabel: string;
  setup: string;
}> = {
  en: {
    steps: ["You", "Cargo", "Volume", "Priorities"],
    tabs: { numbers: "Your numbers", services: "Services", why: "Why this", next: "Next steps" },
    tabsLabel: "Your plan",
    setup: "Your setup so far",
  },
  ar: {
    steps: ["أنت", "شحنتك", "الحجم", "الأولويات"],
    tabs: { numbers: "أرقامك", services: "الخدمات", why: "لماذا هذا", next: "الخطوات التالية" },
    tabsLabel: "خطتك",
    setup: "منظومتك حتى الآن",
  },
};

/** The deck that holds the two core features side by side (src/components/deck). */
export const deckCopy: Record<Locale, {
  label: string;
  prev: string;
  next: string;
  tabs: Record<"live-tracking" | "planner", { n: string; t: string; d: string }>;
}> = {
  en: {
    label: "Two things only MSG does: live tracking and your own plan",
    prev: "Previous",
    next: "Next",
    tabs: {
      "live-tracking": { n: "01", t: "Live tracking", d: "Your driver, live on your map" },
      planner: { n: "02", t: "Build your plan", d: "Your setup, configured in a minute" },
    },
  },
  ar: {
    label: "ميزتان تقدمهما مسج وحدها: التتبع المباشر وخطتك الخاصة",
    prev: "السابق",
    next: "التالي",
    tabs: {
      "live-tracking": { n: "01", t: "التتبع المباشر", d: "مندوبك مباشرةً على خريطتك" },
      planner: { n: "02", t: "ابنِ خطتك", d: "منظومتك جاهزة في دقيقة" },
    },
  },
};
