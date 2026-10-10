import type { Locale } from "./i18n";
import type { Persona } from "../lib/planner.ts";

/**
 * The route: the homepage's sections as stops on one journey (src/components/journey). Each stop points at an
 * element id that already exists on the page; a stop whose section is not rendered (for example the gallery
 * before there are photos) is simply left off the route. Wording only uses what the sections themselves say.
 */

export const LENSES = ["all", "seller", "brand", "enterprise"] as const;
export type Lens = (typeof LENSES)[number];

export type Stop = {
  id: string;
  title: Record<Locale, string>;
  hint: Record<Locale, string>;
  /** who this stop matters most to; "all" lens ignores this */
  for: Exclude<Lens, "all">[];
  /** lives on the sideways deck: reaching it pans the deck rather than scrolling to it */
  panel?: boolean;
};

export const STOPS: Stop[] = [
  { id: "hero", for: ["seller", "brand"], title: { en: "Start", ar: "ابدأ" }, hint: { en: "Price a delivery in ten seconds", ar: "سعّر توصيلتك في عشر ثوانٍ" } },
  { id: "why", for: ["seller", "brand", "enterprise"], title: { en: "Why MSG", ar: "لماذا ام اس جي" }, hint: { en: "Six hard problems, already solved", ar: "ست مشكلات صعبة، محلولة مسبقاً" } },
  { id: "live-tracking", panel: true, for: ["seller", "brand", "enterprise"], title: { en: "Live tracking", ar: "التتبع المباشر" }, hint: { en: "See your driver live, once they approve", ar: "شاهد المندوب مباشرةً بعد موافقته" } },
  { id: "sellers", for: ["seller"], title: { en: "Your questions", ar: "أسئلتك" }, hint: { en: "One partner for the whole operation", ar: "شريك واحد للعملية كاملة" } },
  { id: "planner", panel: true, for: ["seller", "brand"], title: { en: "Build your plan", ar: "ابنِ خطتك" }, hint: { en: "Four steps to a setup that fits", ar: "أربع خطوات إلى منظومة تناسبك" } },
  { id: "network", for: ["brand", "enterprise"], title: { en: "The network", ar: "الشبكة" }, hint: { en: "1,000+ couriers, 100+ vehicles", ar: "+1,000 مندوب و+100 مركبة" } },
  { id: "journey", for: ["seller", "brand"], title: { en: "How it works", ar: "كيف نعمل" }, hint: { en: "Our service, mapped step by step", ar: "خدمتنا مرسومة لك خطوة بخطوة" } },
  { id: "services", for: ["seller", "brand", "enterprise"], title: { en: "Services", ar: "الخدمات" }, hint: { en: "Seven services, one accountable partner", ar: "سبع خدمات وشريك واحد مسؤول" } },
  { id: "fleet", for: ["enterprise"], title: { en: "Fleet & operations", ar: "الأسطول والعمليات" }, hint: { en: "Always ready. Always moving.", ar: "جاهزون دائمًا. في حركة دائمة." } },
  { id: "partners", for: ["seller", "brand", "enterprise"], title: { en: "Partners", ar: "الشركاء" }, hint: { en: "Trusted by the names that move the Kingdom", ar: "موثوقون من الأسماء التي تحرّك المملكة" } },
  { id: "proof", for: ["brand", "enterprise"], title: { en: "Proof", ar: "الإثبات" }, hint: { en: "Scale you can see, standards you can trust", ar: "حجم تراه ومعايير تثق بها" } },
  { id: "enterprise", for: ["enterprise"], title: { en: "For enterprise", ar: "للشركات الكبرى" }, hint: { en: "Capability you can inspect", ar: "قدرات يمكنك فحصها" } },
  { id: "contact", for: ["seller", "brand", "enterprise"], title: { en: "Talk to MSG", ar: "تحدث مع ام اس جي" }, hint: { en: "Let's move what matters", ar: "لننقل ما يهمك" } },
];

/** the planner's personas, folded into the three lenses the route map offers */
export const LENS_OF: Record<Persona, Exclude<Lens, "all">> = { seller: "seller", startup: "seller", ecommerce: "brand", enterprise: "enterprise", platform: "enterprise" };

type UI = {
  route: string;
  stopOf: string; // {n} {total}
  openMap: string;
  mapTitle: string;
  mapLead: string; // {total}
  lensTitle: string;
  lens: Record<Lens, string>;
  close: string;
  next: string;
  here: string;
  fits: string;
  tip: string;
  goTo: string; // {title}
  stops: string;
};

export const journeyCopy: Record<Locale, UI> = {
  en: {
    route: "Route",
    stopOf: "Stop {n} of {total}",
    openMap: "Open the route map",
    mapTitle: "Every stop on the route",
    mapLead: "{total} stops, one journey. Jump to any of them, or let the route show you what matters most.",
    lensTitle: "Show me what matters to",
    lens: { all: "Everyone", seller: "A seller or start-up", brand: "An e-commerce brand", enterprise: "An enterprise team" },
    close: "Close the route map",
    next: "Next stop",
    here: "You are here",
    fits: "For you",
    tip: "Tip: press ] and [ to hop between stops, and M for this map.",
    goTo: "Go to {title}",
    stops: "Route stops",
  },
  ar: {
    route: "المسار",
    stopOf: "المحطة {n} من {total}",
    openMap: "افتح خريطة المسار",
    mapTitle: "كل محطات المسار",
    mapLead: "{total} محطة، رحلة واحدة. انتقل إلى أي محطة، أو دع المسار يريك ما يهمك أكثر.",
    lensTitle: "أرني ما يهم",
    lens: { all: "الجميع", seller: "تاجر أو شركة ناشئة", brand: "علامة تجارة إلكترونية", enterprise: "فريق شركة كبرى" },
    close: "أغلق خريطة المسار",
    next: "المحطة التالية",
    here: "أنت هنا",
    fits: "لك",
    tip: "نصيحة: اضغط ] و [ للتنقل بين المحطات، وM لفتح هذه الخريطة.",
    goTo: "انتقل إلى {title}",
    stops: "محطات المسار",
  },
};
