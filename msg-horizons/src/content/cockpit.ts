import type { Locale } from "./i18n";

/** Short labels for the plan cockpit (src/components/sections/Planner.tsx): the stepper and the result tabs. */
export const cockpitCopy: Record<Locale, {
  steps: [string, string, string, string];
  tabs: { quote: string; handled: string; services: string; next: string };
  tabsLabel: string;
  setup: string;
  /** the plan builder's console bar */
  console: string;
  /** how much of the plan the answers have built: {n} is a percentage */
  built: string;
  draft: string;
  /** the approximate price, once the volume is in */
  estimate: string;
}> = {
  en: {
    steps: ["You", "Cargo", "Volume", "Priorities"],
    tabs: { quote: "Your quote", handled: "We handle", services: "Services", next: "Next steps" },
    tabsLabel: "Your plan",
    setup: "Your setup so far",
    console: "MSG Control · Plan builder",
    built: "{n}% built",
    draft: "Draft plan",
    estimate: "Your price so far",
  },
  ar: {
    steps: ["أنت", "شحنتك", "الحجم", "الأولويات"],
    tabs: { quote: "عرض السعر", handled: "نتولاه عنك", services: "الخدمات", next: "الخطوات التالية" },
    tabsLabel: "خطتك",
    setup: "منظومتك حتى الآن",
    console: "تحكّم ام اس جي · منشئ الخطة",
    built: "اكتملت {n}%",
    draft: "خطة أولية",
    estimate: "سعرك حتى الآن",
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
    label: "ميزتان تقدمهما ام اس جي وحدها: التتبع المباشر وخطتك الخاصة",
    prev: "السابق",
    next: "التالي",
    tabs: {
      "live-tracking": { n: "01", t: "التتبع المباشر", d: "مندوبك مباشرةً على خريطتك" },
      planner: { n: "02", t: "ابنِ خطتك", d: "منظومتك جاهزة في دقيقة" },
    },
  },
};
