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

/** The same nine answers, grouped into the order lifecycle they belong to. */
export const NEED_STAGES = ["setup", "store", "deliver", "settle"] as const;
export type NeedStage = (typeof NEED_STAGES)[number];
export const NEEDS_BY_STAGE: Record<NeedStage, NeedId[]> = {
  setup: ["packaging", "pickups", "overseas"],
  store: ["storage"],
  deliver: ["pod", "damages"],
  settle: ["cod", "remittance", "returns"],
};

export const STAGE_IDS = ["enquiry", "requirements", "guide", "recommendations", "agreement", "testing", "live"] as const;
export type StageId = (typeof STAGE_IDS)[number];

export type PartnerId = "ajex" | "keeta" | "imile" | "logistiqa" | "jt" | "naqel" | "gold";

/**
 * Logos exactly as they appear on the "Professional customers / partners" slide of MSG's 2026 profile
 * (square brand tiles). `name: null` = name still to be confirmed by MSG; the tile shows, the text does not.
 */
export const PARTNERS: { id: PartnerId; name: string | null; src: string; wide?: boolean }[] = [
  { id: "ajex", name: "AJEX", src: "/partners/ajex.png" },
  { id: "gold", name: null, src: "/partners/partner-gold.png" },
  { id: "keeta", name: "Keeta", src: "/partners/keeta.png" },
  { id: "imile", name: "iMile", src: "/partners/imile.png" },
  { id: "naqel", name: "Naqel Express", src: "/partners/naqel.png" },
  { id: "logistiqa", name: "Logistiq", src: "/partners/logistiq.png" },
  { id: "jt", name: "J&T Express", src: "/partners/jt-express.png" },
];

/** Short strings for the app-style cards that sit on each journey photo. */
type JourneyUI = {
  chatName: string; chatMsg: string; chatReply: string;
  reqTitle: string; reqChips: string[];
  guideTitle: string; guideItems: string[];
  planTag: string; planName: string; planStats: [string, string][];
  signTitle: string; signed: string;
  testTitle: string; testDone: string;
  liveTitle: string; liveBody: string;
};

type Copy = {
  needs: {
    eyebrow: string; title: string; lead: string; items: Record<NeedId, { q: string; a: string }>; cta: string; note: string;
    stages: Record<NeedStage, { t: string; d: string }>;
    owner: string;
    support: { title: string; body: string; items: string[] };
    track: string[];
    pod: string;
    cards: { setup: string; store: string; settle: string; settleRows: string[] };
    scroll: string;
  };
  journey: { eyebrow: string; title: string; lead: string; stages: Record<StageId, { t: string; d: string; tag: string }>; cta: string; ui: JourneyUI };
  partners: { eyebrow: string; title: string; lead: string; hub: string; note: string };
};

export const experience: Record<Locale, Copy> = {
  en: {
    needs: {
      eyebrow: "One stop, start to finish",
      title: "One partner for the whole operation.",
      lead: "Setup, storage, delivery, cash and returns run as one structured operation, with one MSG team accountable at every step. Here is where each of your questions is handled.",
      stages: {
        setup: { t: "Set up", d: "Before your first pickup" },
        store: { t: "Store", d: "Held and shipped from the shelf" },
        deliver: { t: "Deliver", d: "Tracked to the door" },
        settle: { t: "Settle", d: "Cash and returns closed out" },
      },
      owner: "Handled by MSG",
      support: {
        title: "The support system behind it",
        body: "Structure is agreed before go-live and held after it. You deal with one team, and every commitment is on paper.",
        items: ["One accountable team, start to finish", "Terms agreed in writing before go-live", "Pilot shipments checked with you first", "Every scan logged, proof on every delivery", "Operations running 24/7"],
      },
      track: ["Picked up", "Hub", "On route", "Delivered"],
      pod: "Proof of delivery captured",
      cards: { setup: "Ready before your first pickup", store: "Stock on the shelf", settle: "Your statement", settleRows: ["Cash on delivery reconciled", "Remittance on your agreed cycle", "Returns tracked, reason recorded"] },
      scroll: "Scroll to follow one order through MSG",
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
      ui: {
        chatName: "MSG Horizons", chatMsg: "Hi, we ship about 300 orders a day across Riyadh.", chatReply: "Great, let's size your setup.",
        reqTitle: "Your requirements", reqChips: ["300 orders/day", "Peak 2.5×", "Cash on delivery", "Returns"],
        guideTitle: "Standard guide", guideItems: ["Packaging", "Labelling", "Pickup windows", "Handover"],
        planTag: "Example plan", planName: "Growth Engine", planStats: [["Routes", "12"], ["Couriers", "14"], ["Peak", "+22"]],
        signTitle: "Project agreement", signed: "Signed",
        testTitle: "Pilot shipments", testDone: "3 of 3 delivered",
        liveTitle: "Delivered", liveBody: "Proof of delivery received",
      },
    },
    partners: {
      eyebrow: "Partners & clients",
      title: "Trusted by the names that move the Kingdom.",
      lead: "Leading delivery platforms and logistics brands already work with MSG Horizons. Your shipments join the same network.",
      hub: "MSG Horizons",
      note: "Partner names and marks belong to their respective owners.",
    },
  },
  ar: {
    needs: {
      eyebrow: "جهة واحدة، من البداية إلى النهاية",
      title: "شريك واحد للعملية كاملة.",
      lead: "الإعداد والتخزين والتوصيل والتحصيل والمرتجعات تُدار كعملية واحدة منظمة، مع فريق واحد من مسج مسؤول عن كل خطوة. وهنا أين تُعالج كل أسئلتك.",
      stages: {
        setup: { t: "الإعداد", d: "قبل أول استلام" },
        store: { t: "التخزين", d: "حفظ وشحن من الرف" },
        deliver: { t: "التوصيل", d: "متتبع حتى الباب" },
        settle: { t: "التسوية", d: "إغلاق التحصيل والمرتجعات" },
      },
      owner: "تتولاه مسج",
      support: {
        title: "منظومة الدعم خلف كل ذلك",
        body: "يُتفق على الهيكل قبل الإطلاق ويُلتزم به بعده. تتعامل مع فريق واحد، وكل التزام مكتوب.",
        items: ["فريق واحد مسؤول من البداية إلى النهاية", "شروط مكتوبة ومتفق عليها قبل الإطلاق", "شحنات تجريبية نراجعها معك أولاً", "كل مسح موثّق وإثبات لكل تسليم", "عمليات على مدار الساعة"],
      },
      track: ["الاستلام", "المحطة", "في الطريق", "تم التسليم"],
      pod: "تم تسجيل إثبات التسليم",
      cards: { setup: "جاهز قبل أول استلام", store: "المخزون على الرف", settle: "كشف حسابك", settleRows: ["مطابقة مبالغ الدفع عند الاستلام", "التحويل وفق الدورة المتفق عليها", "المرتجعات متتبعة مع تسجيل السبب"] },
      scroll: "مرّر لتتبع طلباً واحداً عبر مسج",
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
      ui: {
        chatName: "MSG Horizons", chatMsg: "مرحباً، نشحن نحو 300 طلب يومياً في الرياض.", chatReply: "ممتاز، لنحدد إعدادك.",
        reqTitle: "متطلباتك", reqChips: ["300 طلب/يوم", "ذروة 2.5×", "الدفع عند الاستلام", "مرتجعات"],
        guideTitle: "الدليل المعياري", guideItems: ["التغليف", "الملصقات", "مواعيد الاستلام", "التسليم"],
        planTag: "خطة مثال", planName: "محرك النمو", planStats: [["مسارات", "12"], ["مناديب", "14"], ["ذروة", "+22"]],
        signTitle: "اتفاقية المشروع", signed: "موقّعة",
        testTitle: "شحنات تجريبية", testDone: "3 من 3 سُلّمت",
        liveTitle: "تم التسليم", liveBody: "تم استلام إثبات التسليم",
      },
    },
    partners: {
      eyebrow: "شركاؤنا وعملاؤنا",
      title: "موثوقون من الأسماء التي تحرّك المملكة.",
      lead: "منصات توصيل وعلامات لوجستية رائدة تعمل بالفعل مع MSG Horizons، وشحناتك تنضم إلى الشبكة نفسها.",
      hub: "MSG Horizons",
      note: "أسماء الشركاء وعلاماتهم ملك لأصحابها.",
    },
  },
};
