import type { Locale } from "@/content/i18n";

/**
 * Copy for the seller-questions grid, the onboarding journey and the partner constellation.
 *
 * The seller capabilities (cash on delivery, remittance, packaging support, returns, proof of
 * delivery, overseas sellers, multiple collection points, damage handling) were confirmed by MSG
 * on 29 Sept 2026. Their commercial terms (cycles, fees, liability) live in each client agreement,
 * so the copy states the capability and points to the agreement — it never states a term.
 */

export const NEED_IDS = ["cod", "remittance", "packaging", "storage", "returns", "pod", "overseas", "pickups", "damages"] as const;
export type NeedId = (typeof NEED_IDS)[number];

export const STAGE_IDS = ["enquiry", "requirements", "guide", "recommendations", "agreement", "testing", "live"] as const;
export type StageId = (typeof STAGE_IDS)[number];

export type PartnerId = "ajex" | "keeta" | "imile" | "logistiqa" | "jt";

/** Official artwork where we have it; the rest render as name tiles until MSG supplies files. */
export const PARTNERS: { id: PartnerId; name: string; logo?: { en: string; ar?: string; w: number; h: number } }[] = [
  { id: "imile", name: "iMile", logo: { en: "/partners/imile.svg", ar: "/partners/imile-ar.svg", w: 859, h: 463 } },
  { id: "jt", name: "J&T Express", logo: { en: "/partners/jt-express.svg", w: 1006, h: 217 } },
  { id: "keeta", name: "Keeta", logo: { en: "/partners/keeta.png", w: 144, h: 144 } },
  { id: "ajex", name: "AJEX" },
  { id: "logistiqa", name: "Logistiqa" },
];

type Copy = {
  needs: { eyebrow: string; title: string; lead: string; items: Record<NeedId, { q: string; a: string }>; cta: string; note: string };
  journey: { eyebrow: string; title: string; lead: string; stages: Record<StageId, { t: string; d: string; tag: string }>; cta: string };
  partners: { eyebrow: string; title: string; lead: string; hub: string; note: string };
};

export const experience: Record<Locale, Copy> = {
  en: {
    needs: {
      eyebrow: "The questions every seller asks",
      title: "Your delivery questions, answered in one line.",
      lead: "Whether you sell from home, run a growing brand or ship from abroad, these are the things that decide whether delivery works for you.",
      items: {
        cod: { q: "How do I get paid on cash orders?", a: "Cash collected at the door is reconciled and paid to you." },
        remittance: { q: "When does my money arrive?", a: "Remittance cycle and statements are fixed in your agreement." },
        packaging: { q: "Can you help with packaging?", a: "Packaging and labelling guidance before your first pickup." },
        storage: { q: "Where do I keep my stock?", a: "Secure storage with smart inventory control, shipped from the shelf." },
        returns: { q: "What happens with returns?", a: "Returned parcels come back to you tracked, reason recorded." },
        pod: { q: "How do I know it was delivered?", a: "Proof of delivery on every shipment, in real-time tracking." },
        overseas: { q: "My business is outside Saudi Arabia.", a: "Once your stock is in the Kingdom, MSG stores, delivers and remits." },
        pickups: { q: "I ship from more than one location.", a: "Multiple collection points planned into one pickup schedule." },
        damages: { q: "What if something arrives damaged?", a: "Every scan is logged; claims follow the terms in your agreement." },
      },
      cta: "Size my delivery setup",
      note: "Cycles, fees and claim terms are agreed with you in writing. No surprises after go-live.",
    },
    journey: {
      eyebrow: "From enquiry to first delivery",
      title: "Seven steps. One accountable team.",
      lead: "Every MSG client goes through the same clear path, so you always know what happens next and who owns it.",
      stages: {
        enquiry: { tag: "Day one", t: "Submit your enquiry", d: "Two minutes on the website, or one WhatsApp message." },
        requirements: { tag: "Listen", t: "We map your requirements", d: "Volumes, areas, peaks, cash share and returns, understood first." },
        guide: { tag: "Standard", t: "Our standard guide", d: "Packaging, labelling, pickup windows and handover rules, shared up front." },
        recommendations: { tag: "Design", t: "Curated recommendations", d: "A structure sized to your numbers, with the reason for every choice." },
        agreement: { tag: "Commit", t: "Project agreement", d: "Scope, remittance, returns and claims written down and signed." },
        testing: { tag: "Prove", t: "Testing", d: "Pilot shipments run end to end, tracking and proof checked with you." },
        live: { tag: "Go", t: "Go live", d: "Deliveries start. Tracked 24/7, one team accountable." },
      },
      cta: "Start with step one",
    },
    partners: {
      eyebrow: "Valued partners",
      title: "Moving the Kingdom alongside the names you know.",
      lead: "Strategic alliances with industry leaders, so your shipments reach further with one accountable partner.",
      hub: "MSG Horizons",
      note: "Partner names and marks belong to their respective owners.",
    },
  },
  ar: {
    needs: {
      eyebrow: "الأسئلة التي يطرحها كل بائع",
      title: "أسئلتك عن التوصيل، بإجابة من سطر واحد.",
      lead: "سواء كنت تبيع من المنزل أو تدير علامة تنمو أو تشحن من الخارج، هذه هي الأمور التي تحدد نجاح التوصيل معك.",
      items: {
        cod: { q: "كيف أحصل على قيمة الطلبات النقدية؟", a: "النقد المحصّل عند الباب يُطابق ويُحوّل إليك." },
        remittance: { q: "متى تصلني أموالي؟", a: "دورة التحويل والكشوفات محددة في اتفاقيتك." },
        packaging: { q: "هل تساعدون في التغليف؟", a: "إرشادات التغليف والملصقات قبل أول استلام." },
        storage: { q: "أين أحفظ مخزوني؟", a: "تخزين آمن وإدارة مخزون ذكية، والشحن مباشرة من الرف." },
        returns: { q: "ماذا عن المرتجعات؟", a: "الطرود المرتجعة تعود إليك متتبعة مع تسجيل السبب." },
        pod: { q: "كيف أعرف أن الطلب وصل؟", a: "إثبات تسليم لكل شحنة ضمن التتبع اللحظي." },
        overseas: { q: "نشاطي التجاري خارج السعودية.", a: "بمجرد وصول مخزونك إلى المملكة، تخزّن MSG وتوصّل وتحوّل لك." },
        pickups: { q: "أشحن من أكثر من موقع.", a: "نقاط استلام متعددة ضمن جدول استلام واحد." },
        damages: { q: "ماذا لو وصلت شحنة متضررة؟", a: "كل مسح موثّق، والمطالبات وفق شروط اتفاقيتك." },
      },
      cta: "احسب إعداد التوصيل",
      note: "الدورات والرسوم وشروط المطالبات يُتفق عليها معك كتابياً، دون مفاجآت بعد الإطلاق.",
    },
    journey: {
      eyebrow: "من الاستفسار إلى أول توصيل",
      title: "سبع خطوات. فريق واحد مسؤول.",
      lead: "كل عميل لدى MSG يمر بالمسار الواضح نفسه، فتعرف دائماً ما الخطوة التالية ومن يتولاها.",
      stages: {
        enquiry: { tag: "اليوم الأول", t: "أرسل استفسارك", d: "دقيقتان على الموقع، أو رسالة واتساب واحدة." },
        requirements: { tag: "نستمع", t: "نحدد متطلباتك", d: "الأحجام والمناطق والذروات ونسبة النقد والمرتجعات، نفهمها أولاً." },
        guide: { tag: "المعيار", t: "دليلنا المعياري", d: "التغليف والملصقات ومواعيد الاستلام وقواعد التسليم، نشاركها مسبقاً." },
        recommendations: { tag: "التصميم", t: "توصيات مخصصة", d: "هيكل بحجم أرقامك، مع سبب كل اختيار." },
        agreement: { tag: "الالتزام", t: "اتفاقية المشروع", d: "النطاق والتحويلات والمرتجعات والمطالبات مكتوبة وموقّعة." },
        testing: { tag: "الإثبات", t: "الاختبار", d: "شحنات تجريبية من البداية للنهاية، مع مراجعة التتبع والإثبات معك." },
        live: { tag: "انطلق", t: "الإطلاق", d: "يبدأ التوصيل. تتبع على مدار الساعة وفريق واحد مسؤول." },
      },
      cta: "ابدأ بالخطوة الأولى",
    },
    partners: {
      eyebrow: "شركاؤنا",
      title: "نحرّك المملكة إلى جانب أسماء تعرفها.",
      lead: "تحالفات استراتيجية مع رواد القطاع، لتصل شحناتك أبعد مع شريك واحد مسؤول.",
      hub: "MSG Horizons",
      note: "أسماء الشركاء وعلاماتهم ملك لأصحابها.",
    },
  },
};
