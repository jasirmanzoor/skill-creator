import type { Locale } from "./i18n";

/**
 * The homepage's six chapters, in reading order: who MSG is and what it costs (Start), the record (Scale), what MSG
 * solves (Solutions), where and how it runs (Network), what it runs on (Infrastructure), and the configuration that
 * ends in a conversation (Configure). Each chapter is one page of the book (components/book) and holds one or
 * more of the sections; `id` is the anchor of its first section, and every older #link (#contact, #planner, #perfmix,
 * #live-tracking, #services...) still lands inside the chapter that now holds it.
 */
export type Chapter = {
  id: string;
  title: Record<Locale, string>;
  hint: Record<Locale, string>;
};

export const CHAPTERS: Chapter[] = [
  { id: "hero", title: { en: "Start", ar: "ابدأ" }, hint: { en: "Price a delivery in ten seconds", ar: "سعّر توصيلتك في عشر ثوانٍ" } },
  { id: "proof", title: { en: "Scale", ar: "الحجم" }, hint: { en: "Licensed, registered, already running", ar: "مرخّصون ومسجّلون ونعمل بالفعل" } },
  { id: "why", title: { en: "Solutions", ar: "الحلول" }, hint: { en: "Six hard problems, seven services, one partner", ar: "ست مشكلات صعبة، سبع خدمات، شريك واحد" } },
  { id: "network", title: { en: "Network", ar: "الشبكة" }, hint: { en: "Riyadh to the far south, and one order through it", ar: "من الرياض إلى أقصى الجنوب، وطلب واحد عبرها" } },
  { id: "fleet", title: { en: "Infrastructure", ar: "البنية" }, hint: { en: "The hub, the fleet, the people, a store launched on them", ar: "المركز والأسطول والفريق، ومتجر انطلق عليها" } },
  { id: "estimate", title: { en: "Configure", ar: "خطّط" }, hint: { en: "Your price, your plan, then MSG", ar: "سعرك، خطتك، ثم ام اس جي" } },
];

export const chapterIndex = (id: string) => CHAPTERS.findIndex((c) => c.id === id);

type UI = {
  chapter: string; // {n} {total}
  next: string;
  previous: string;
  turn: string; // {title}
  rail: string;
  opened: string; // {n} {total} {title}
  keys: string;
  backToStart: string;
  /** the first-visit guide above the rail */
  guide: string;
  guideTap: string;
};

export const bookCopy: Record<Locale, UI> = {
  en: {
    chapter: "Chapter {n} of {total}",
    next: "Next chapter",
    previous: "Previous chapter",
    turn: "Turn to {title}",
    rail: "Chapters",
    opened: "Chapter {n} of {total}: {title}",
    keys: "Tip: press ] and [ to jump between chapters.",
    backToStart: "Back to the start",
    guide: "Scroll down to explore",
    guideTap: "or tap a chapter to jump to it",
  },
  ar: {
    chapter: "الفصل {n} من {total}",
    next: "الفصل التالي",
    previous: "الفصل السابق",
    turn: "انتقل إلى {title}",
    rail: "الفصول",
    opened: "الفصل {n} من {total}: {title}",
    keys: "تلميح: اضغط ] و [ للتنقل بين الفصول.",
    backToStart: "العودة إلى البداية",
    guide: "مرّر للأسفل للاستكشاف",
    guideTap: "أو اضغط على فصل للانتقال إليه",
  },
};
