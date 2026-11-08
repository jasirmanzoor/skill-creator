import type { Locale } from "./i18n";

/**
 * The pitch, in MSG's own words (6 Oct 2026, docs/CONTENT-NOTES.md): good products and ideas stall because getting
 * them to customers' doors is hard, and the hardest part is licences, compliance, paperwork, warehousing and labour
 * rules. MSG already has all of that done. No percentages, no customs, no claims about other companies.
 */
/** pain and fix are the sentences; own and win are each side's one big word in the scroll timeline */
export type PitchRow = { pain: string; fix: string; own: string; win: string };

export const pitchCopy: Record<Locale, {
  eyebrow: string;
  title: string;
  lead: string;
  toggle: [string, string];
  scrollHint: string;
  toggleLabel: string;
  rows: PitchRow[];
  close: string;
  closeLead: string;
  cta: string;
  talk: string;
  photoAlt: string;
}> = {
  en: {
    eyebrow: "Why MSG",
    title: "Great products stall at the same place: getting them to the customer.",
    lead: "You have a product, an idea or a shop that should be online. Then come fulfilment, shipping, delivery and cash collection, and the hardest part of all: licences, compliance, paperwork, warehousing and labour rules. That is where most new businesses get stuck.",
    toggle: ["On your own", "With MSG"],
    scrollHint: "Keep scrolling: each problem turns into MSG's answer",
    toggleLabel: "Compare doing it on your own with doing it with MSG",
    rows: [
      { pain: "No idea where to start", fix: "One MSG team plans it with you, from your first order", own: "Where?", win: "Planned." },
      { pain: "Storage, packing and fulfilment", fix: "Our warehouses store, pack and dispatch for you", own: "Storage", win: "Stored." },
      { pain: "Shipping across a huge country", fix: "Our own fleet and drivers, from city streets to remote villages", own: "Distance", win: "Delivered." },
      { pain: "Cash on delivery and returns", fix: "Cash collected and remitted on schedule, returns handled", own: "Cash", win: "Collected." },
      { pain: "Licences, compliance and paperwork", fix: "Already licensed and compliant, ZATCA and VAT in order, legal team on it", own: "Paperwork", win: "Licensed." },
      { pain: "Hiring drivers under labour rules", fix: "In-house drivers and staff, managed within labour regulations", own: "Hiring", win: "Staffed." },
    ],
    close: "MSG is the route from your idea to every doorstep.",
    closeLead: "You focus on selling. We bring the infrastructure, the paperwork and the people.",
    cta: "Start my plan",
    talk: "Talk to MSG on WhatsApp",
    photoAlt: "MSG Horizons Sabya hub",
  },
  ar: {
    eyebrow: "لماذا ام اس جي",
    title: "المنتجات الرائعة تتوقف في المكان نفسه: إيصالها إلى العميل.",
    lead: "لديك منتج أو فكرة أو متجر يجب أن يكون أونلاين. ثم يأتي التخزين والشحن والتوصيل وتحصيل النقد، والأصعب من كل ذلك: التراخيص والامتثال والأوراق والمستودعات وأنظمة العمل. هنا تتوقف أغلب الأعمال الجديدة.",
    toggle: ["بمفردك", "مع ام اس جي"],
    scrollHint: "واصل التمرير: كل مشكلة تتحول إلى حل ام اس جي",
    toggleLabel: "قارن بين العمل بمفردك والعمل مع ام اس جي",
    rows: [
      { pain: "لا تعرف من أين تبدأ", fix: "فريق ام اس جي يخطط معك من أول طلب", own: "من أين؟", win: "مخطّط." },
      { pain: "التخزين والتغليف والتجهيز", fix: "مستودعاتنا تخزّن وتغلّف وتشحن عنك", own: "التخزين", win: "مُخزَّن." },
      { pain: "الشحن عبر بلد شاسع", fix: "أسطولنا ومناديبنا، من شوارع المدن إلى القرى النائية", own: "المسافة", win: "وصل." },
      { pain: "الدفع عند الاستلام والمرتجعات", fix: "نقد يُحصَّل ويُحوَّل في موعده، والمرتجعات مُدارة", own: "النقد", win: "حُصِّل." },
      { pain: "التراخيص والامتثال والأوراق", fix: "مرخّصون وملتزمون، الزكاة والضريبة مكتملة، وفريق قانوني يتابع", own: "الأوراق", win: "مرخّص." },
      { pain: "توظيف المناديب وفق أنظمة العمل", fix: "مناديب وفريق من داخل ام اس جي، وفق أنظمة العمل", own: "التوظيف", win: "فريقنا." },
    ],
    close: "ام اس جي هي طريقك من الفكرة إلى كل باب.",
    closeLead: "ركّز على البيع، ونحن نوفّر البنية والأوراق والفريق.",
    cta: "ابدأ خطتي",
    talk: "تحدث مع ام اس جي عبر واتساب",
    photoAlt: "مركز ام اس جي هورايزونز في صبيا",
  },
};
