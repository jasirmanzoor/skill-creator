import type { Locale } from "./i18n";

/**
 * The homepage's chapters, in reading order. Each chapter is one page of the book (components/book) and holds one or
 * more of the sections that already exist; `id` is the anchor of its first section, so every existing #link keeps
 * working and lands in the right chapter. Order follows the visitor's decision: who MSG is, the price, the plan, then
 * the proof that MSG can run it, and finally the conversation. Titles and hints reuse the sections' own wording.
 */
export type Chapter = {
  id: string;
  title: Record<Locale, string>;
  hint: Record<Locale, string>;
};

export const CHAPTERS: Chapter[] = [
  { id: "hero", title: { en: "Start", ar: "ابدأ" }, hint: { en: "Price a delivery in ten seconds", ar: "سعّر توصيلتك في عشر ثوانٍ" } },
  { id: "why", title: { en: "Why MSG", ar: "لماذا ام اس جي" }, hint: { en: "Six hard problems, already solved", ar: "ست مشكلات صعبة، محلولة مسبقاً" } },
  { id: "estimate", title: { en: "Your price", ar: "سعرك" }, hint: { en: "An approximate cost per order", ar: "تكلفة تقريبية لكل طلب" } },
  { id: "planner", title: { en: "Your plan", ar: "خطتك" }, hint: { en: "Four steps to a setup that fits", ar: "أربع خطوات إلى منظومة تناسبك" } },
  { id: "live-tracking", title: { en: "Live network", ar: "الشبكة المباشرة" }, hint: { en: "1,000+ couriers, 100+ vehicles", ar: "+1,000 مندوب و+100 مركبة" } },
  { id: "fleet", title: { en: "Fleet & hubs", ar: "الأسطول والمراكز" }, hint: { en: "Always ready. Always moving.", ar: "جاهزون دائمًا. في حركة دائمة." } },
  { id: "profile", title: { en: "Company profile", ar: "الملف التعريفي" }, hint: { en: "Flip through MSG", ar: "تصفّح ام اس جي" } },
  { id: "proof", title: { en: "Proof", ar: "الإثبات" }, hint: { en: "Scale you can see, standards you can trust", ar: "حجم تراه ومعايير تثق بها" } },
  { id: "enterprise", title: { en: "Enterprise", ar: "للشركات الكبرى" }, hint: { en: "Capability you can inspect", ar: "قدرات يمكنك فحصها" } },
  { id: "contact", title: { en: "Talk to MSG", ar: "تحدث مع ام اس جي" }, hint: { en: "Let's move what matters", ar: "لننقل ما يهمك" } },
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
};

export const bookCopy: Record<Locale, UI> = {
  en: {
    chapter: "Chapter {n} of {total}",
    next: "Next chapter",
    previous: "Previous chapter",
    turn: "Turn to {title}",
    rail: "Chapters",
    opened: "Chapter {n} of {total}: {title}",
    keys: "Tip: press ] and [ to turn the page.",
    backToStart: "Back to the start",
  },
  ar: {
    chapter: "الفصل {n} من {total}",
    next: "الفصل التالي",
    previous: "الفصل السابق",
    turn: "انتقل إلى {title}",
    rail: "الفصول",
    opened: "الفصل {n} من {total}: {title}",
    keys: "تلميح: اضغط ] و [ لتقليب الصفحات.",
    backToStart: "العودة إلى البداية",
  },
};
