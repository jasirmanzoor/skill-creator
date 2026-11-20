import type { Locale } from "./i18n";
import { servicePages, type ServiceSlug } from "./servicePages";
import { experience, NEEDS_BY_STAGE, type NeedId, type NeedStage } from "./experience";

/**
 * Ask MSG: the logistics explorer. Every question and answer here is reused, word for word, from content already on
 * the site: the service pages' "Questions buyers ask" (content/servicePages) and the seller answers of "one order
 * through MSG" (content/experience). Nothing is written for this section, so nothing in it can drift from the
 * verified source. Topics only group them.
 */

type Ref = { page: ServiceSlug; i: number } | { need: NeedId };
export type TopicId = "delivery" | "warehousing" | "pricing" | "cod" | "fleet" | "enterprise" | "onboarding";
export type Cta = "price" | "plan" | "whatsapp";

const LM = "last-mile-delivery-saudi-arabia", EC = "ecommerce-delivery-saudi-arabia", WH = "warehousing-storage-riyadh";
const LF = "land-freight-saudi-arabia", FL = "fleet-management-saudi-arabia", MP = "delivery-drivers-manpower-saudi-arabia";

const TOPICS: { id: TopicId; refs: Ref[]; photo: { src: string; pos: string }; cta: Cta }[] = [
  { id: "delivery", photo: { src: "/media/msg/fleet-hub-side.webp", pos: "45% 60%" }, cta: "price",
    refs: [{ page: LM, i: 0 }, { page: LM, i: 2 }, { page: LF, i: 0 }, { page: LF, i: 1 }, { need: "pod" }, { need: "damages" }] },
  { id: "warehousing", photo: { src: "/media/msg/hub-racks.webp", pos: "50% 60%" }, cta: "plan",
    refs: [{ page: EC, i: 1 }, { page: WH, i: 1 }, { page: WH, i: 0 }, { need: "storage" }, { need: "packaging" }] },
  { id: "pricing", photo: { src: "/media/msg/outlet-counter.webp", pos: "50% 50%" }, cta: "price",
    refs: [{ page: EC, i: 3 }, { page: LM, i: 3 }, { page: WH, i: 2 }] },
  { id: "cod", photo: { src: "/media/msg/hub-team-scan.webp", pos: "50% 45%" }, cta: "whatsapp",
    refs: [{ need: "cod" }, { need: "remittance" }, { need: "returns" }] },
  { id: "fleet", photo: { src: "/media/msg/fleet-hub-row.webp", pos: "55% 60%" }, cta: "plan",
    refs: [{ page: LM, i: 1 }, { page: FL, i: 0 }, { page: FL, i: 1 }, { page: MP, i: 0 }, { page: MP, i: 1 }] },
  { id: "enterprise", photo: { src: "/media/msg/hub-team.webp", pos: "60% 55%" }, cta: "plan",
    refs: [{ page: EC, i: 2 }, { page: MP, i: 2 }] },
  { id: "onboarding", photo: { src: "/media/msg/hub-open.webp", pos: "50% 55%" }, cta: "plan",
    refs: [{ page: EC, i: 0 }, { need: "pickups" }, { need: "overseas" }] },
];

const STAGE_OF = Object.fromEntries(
  (Object.entries(NEEDS_BY_STAGE) as [NeedStage, NeedId[]][]).flatMap(([st, ids]) => ids.map((id) => [id, st])),
) as Record<NeedId, NeedStage>;

export type AskItem = { key: string; q: string; a: string; stage?: NeedStage };
export type AskTopic = { id: TopicId; title: string; items: AskItem[]; photo: { src: string; pos: string }; cta: Cta };

export const askUi: Record<Locale, {
  idx: string; title: string; lead: string; search: string; searchLabel: string; results: string; none: string;
  next: string; source: string; stages: string;
  topics: Record<TopicId, string>;
  ctas: Record<Cta, string>;
}> = {
  en: {
    idx: "Ask MSG",
    title: "The logistics explorer.",
    lead: "Pick a topic or search. Every answer here is the one MSG already gives on its service pages and in its operation.",
    search: "Search the questions",
    searchLabel: "Search all questions",
    results: "{n} matching",
    none: "No question matches that yet. Ask MSG directly on WhatsApp.",
    next: "Keep exploring",
    source: "Answer as stated by MSG",
    stages: "Where it happens in one order",
    topics: { delivery: "Delivery and coverage", warehousing: "Warehousing and fulfilment", pricing: "Pricing and billing", cod: "COD and returns", fleet: "Fleet and manpower", enterprise: "Enterprise and peaks", onboarding: "Onboarding and setup" },
    ctas: { price: "Price a delivery", plan: "Build my plan", whatsapp: "Ask MSG on WhatsApp" },
  },
  ar: {
    idx: "اسأل ام اس جي",
    title: "مستكشف الخدمات اللوجستية.",
    lead: "اختر موضوعًا أو ابحث. كل إجابة هنا هي ما تقدّمه ام اس جي في صفحات خدماتها وفي عملياتها.",
    search: "ابحث في الأسئلة",
    searchLabel: "ابحث في جميع الأسئلة",
    results: "{n} نتيجة",
    none: "لا يوجد سؤال مطابق بعد. اسأل ام اس جي مباشرة عبر واتساب.",
    next: "تابع الاستكشاف",
    source: "الإجابة كما تذكرها ام اس جي",
    stages: "أين يحدث ذلك في الطلب",
    topics: { delivery: "التوصيل والتغطية", warehousing: "التخزين والتجهيز", pricing: "الأسعار والفوترة", cod: "الدفع عند الاستلام والمرتجعات", fleet: "الأسطول والقوى العاملة", enterprise: "الشركات ومواسم الذروة", onboarding: "البدء والإعداد" },
    ctas: { price: "احسب تكلفة التوصيل", plan: "ابنِ خطتك", whatsapp: "اسأل ام اس جي عبر واتساب" },
  },
};

export function askTopics(lang: Locale): AskTopic[] {
  const pages = servicePages[lang];
  const needs = experience[lang].needs.items;
  const t = askUi[lang].topics;
  return TOPICS.map(({ id, refs, photo, cta }) => ({
    id, photo, cta, title: t[id],
    items: refs.flatMap((r): AskItem[] => {
      if ("need" in r) {
        const n = needs[r.need];
        return n ? [{ key: `n-${r.need}`, q: n.q, a: n.a, stage: STAGE_OF[r.need] }] : [];
      }
      const f = pages[r.page]?.faqs[r.i];
      return f ? [{ key: `p-${r.page}-${r.i}`, q: f.q, a: f.a }] : [];
    }),
  }));
}
