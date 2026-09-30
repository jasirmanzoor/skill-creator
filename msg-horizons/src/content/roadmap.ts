import type { Locale } from "@/content/i18n";
import type { StageId } from "@/content/experience";
import type { Persona } from "@/lib/planner";

/** Copy for the roadmap + segmentation + estimator section ("Our effortless service, mapped out for you."). */

export const SEGMENTS = ["offline", "social", "neighborhood", "enterprise", "sme", "aggregator"] as const;
export type Segment = (typeof SEGMENTS)[number];

/** Each audience segment feeds the existing planning engine through its closest persona. */
export const SEGMENT_PERSONA: Record<Segment, Persona> = {
  offline: "seller",
  social: "seller",
  neighborhood: "seller",
  enterprise: "enterprise",
  sme: "ecommerce",
  aggregator: "platform",
};

/** Sensible starting volume per segment, so the estimator opens on a realistic picture. */
export const SEGMENT_ORDERS: Record<Segment, number> = {
  offline: 25,
  social: 40,
  neighborhood: 60,
  enterprise: 2500,
  sme: 400,
  aggregator: 5000,
};

export const ROADMAP_STEPS: { id: string; visual: StageId }[] = [
  { id: "enquiry", visual: "enquiry" },
  { id: "requirements", visual: "requirements" },
  { id: "guide", visual: "guide" },
  { id: "recommendations", visual: "recommendations" },
  { id: "agreement", visual: "agreement" },
  { id: "live", visual: "live" },
];

type Copy = {
  eyebrow: string;
  title: string;
  theme: string[];
  rolls: string[];
  gate: {
    hook: string;
    individual: string;
    business: string;
    segments: Record<Segment, { t: string; d: string }>;
    pick: string;
  };
  steps: { t: string; d: string; points: string[] }[];
  stepLabel: string;
  next: string;
  prev: string;
  toEstimator: string;
  est: {
    eyebrow: string;
    title: string;
    profile: string;
    orders: string;
    ordersUnit: string;
    cod: string;
    area: string;
    areas: { riyadh: string; multi: string; kingdom: string };
    stock: string;
    yes: string;
    no: string;
    build: string;
  };
  plan: {
    eyebrow: string;
    config: string;
    assets: string;
    routes: string;
    couriers: string;
    peak: string;
    vehicles: string;
    pickup: string;
    dispatch: string;
    cost: string;
    costPending: string;
    costNote: string;
    perMonth: string;
    whatsapp: string;
    send: string;
    edit: string;
    example: string;
  };
};

export const roadmapCopy: Record<Locale, Copy> = {
  en: {
    eyebrow: "The MSG roadmap",
    title: "Our effortless service, mapped out for you.",
    theme: ["Navigate the unseen.", "Animate your reach.", "Experience VFX logistics."],
    rolls: ["Need to scale online?", "Launch your homemade creations nationwide.", "From your door to the Kingdom—seamlessly handled."],
    gate: {
      hook: "Delivering across KSA? We bridge the distance.",
      individual: "Individual sellers",
      business: "Businesses",
      segments: {
        offline: { t: "Local offline stores", d: "A shop that wants to deliver" },
        social: { t: "Social marketplace sellers", d: "Selling on Facebook, WhatsApp or Instagram" },
        neighborhood: { t: "Neighbourhood network stores", d: "Serving the streets around you" },
        enterprise: { t: "Enterprise & retailers", d: "Multi-site operations" },
        sme: { t: "Scaling SMEs & D2C brands", d: "Orders every day, growing fast" },
        aggregator: { t: "Merchants & delivery aggregators", d: "Capacity for your own network" },
      },
      pick: "Who are you?",
    },
    steps: [
      { t: "Submit your enquiry", d: "Two minutes on the web, or one WhatsApp message.", points: ["No sign-up", "Arabic or English", "Straight to MSG's team"] },
      { t: "We map your requirements", d: "Volumes, areas, peaks, cash share and returns.", points: ["Your real numbers", "Peak seasons planned", "Cash and returns covered"] },
      { t: "Our standard guide", d: "Packaging, labelling, pickup windows and handover rules.", points: ["Shared before day one", "Clear handover rules", "Fewer failed deliveries"] },
      { t: "Curated recommendations", d: "A structure sized to your numbers, with absolute clarity.", points: ["Routes and couriers", "Pickup and dispatch model", "The reason for each choice"] },
      { t: "Project agreement", d: "Scope, remittance, returns and claims, signed in writing.", points: ["Remittance cycle agreed", "Returns and claims terms", "No surprises after launch"] },
      { t: "Testing & go-live", d: "Pilot shipments verified end to end, then launch with 24/7 tracked operations.", points: ["Pilot shipments checked", "Proof of delivery verified", "24/7 tracking from day one"] },
    ],
    stepLabel: "Step",
    next: "Next step",
    prev: "Back",
    toEstimator: "Map my delivery plan",
    est: {
      eyebrow: "Live estimator",
      title: "Your numbers in. Your plan out.",
      profile: "Your profile",
      orders: "Orders on a normal day",
      ordersUnit: "a day",
      cod: "Paid in cash at the door",
      area: "Where do they go?",
      areas: { riyadh: "Riyadh", multi: "Riyadh + other cities", kingdom: "Across the Kingdom" },
      stock: "Should MSG store your stock?",
      yes: "Yes",
      no: "No",
      build: "Generate my plan",
    },
    plan: {
      eyebrow: "Curated recommendation plan",
      config: "Your configuration",
      assets: "Operational assets",
      routes: "Daily routes",
      couriers: "Couriers, normal day",
      peak: "Couriers, peak day",
      vehicles: "Vehicle mix",
      pickup: "Pickup",
      dispatch: "Dispatch",
      cost: "Cost estimate",
      costPending: "Priced by MSG for your volumes",
      costNote: "MSG prices every plan from its rate card after reviewing your volumes. Send this plan and get your quote directly.",
      perMonth: "per month, estimated",
      whatsapp: "Get my quote on WhatsApp",
      send: "Send plan to MSG",
      edit: "Adjust numbers",
      example: "Planning estimate from your inputs, not a delivery promise.",
    },
  },
  ar: {
    eyebrow: "خارطة MSG",
    title: "خدمة سلسة، مرسومة لك خطوة بخطوة.",
    theme: ["استكشف ما لا يُرى.", "وسّع وصولك.", "لوجستيات بتجربة بصرية."],
    rolls: ["تريد التوسع أونلاين؟", "أوصل منتجاتك المنزلية إلى كل المملكة.", "من بابك إلى المملكة، بسلاسة تامة."],
    gate: {
      hook: "توصّل في أنحاء المملكة؟ نحن نختصر المسافة.",
      individual: "البائعون الأفراد",
      business: "الشركات",
      segments: {
        offline: { t: "متاجر محلية", d: "محل يريد التوصيل" },
        social: { t: "بائعو منصات التواصل", d: "البيع عبر فيسبوك وواتساب وإنستغرام" },
        neighborhood: { t: "متاجر الأحياء", d: "تخدم الشوارع من حولك" },
        enterprise: { t: "المنشآت وتجار التجزئة", d: "عمليات متعددة المواقع" },
        sme: { t: "الشركات الصغيرة والمتوسطة والعلامات المباشرة", d: "طلبات يومية ونمو سريع" },
        aggregator: { t: "التجار ومجمّعو التوصيل", d: "طاقة لشبكتك الخاصة" },
      },
      pick: "من أنت؟",
    },
    steps: [
      { t: "أرسل استفسارك", d: "دقيقتان على الموقع، أو رسالة واتساب واحدة.", points: ["دون تسجيل", "بالعربية أو الإنجليزية", "مباشرة إلى فريق MSG"] },
      { t: "نحدد متطلباتك", d: "الأحجام والمناطق والذروات ونسبة النقد والمرتجعات.", points: ["أرقامك الفعلية", "مواسم الذروة مخطط لها", "النقد والمرتجعات مغطاة"] },
      { t: "دليلنا المعياري", d: "التغليف والملصقات ومواعيد الاستلام وقواعد التسليم.", points: ["قبل اليوم الأول", "قواعد تسليم واضحة", "توصيلات فاشلة أقل"] },
      { t: "توصيات مخصصة", d: "هيكل بحجم أرقامك، بوضوح تام.", points: ["المسارات والمناديب", "نموذج الاستلام والانطلاق", "سبب كل اختيار"] },
      { t: "اتفاقية المشروع", d: "النطاق والتحويلات والمرتجعات والمطالبات، موقّعة كتابياً.", points: ["دورة التحويل متفق عليها", "شروط المرتجعات والمطالبات", "دون مفاجآت بعد الإطلاق"] },
      { t: "الاختبار والإطلاق", d: "شحنات تجريبية موثقة من البداية للنهاية، ثم إطلاق بتتبع على مدار الساعة.", points: ["فحص الشحنات التجريبية", "التحقق من إثبات التسليم", "تتبع ٢٤/٧ من اليوم الأول"] },
    ],
    stepLabel: "الخطوة",
    next: "الخطوة التالية",
    prev: "رجوع",
    toEstimator: "ارسم خطة التوصيل",
    est: {
      eyebrow: "مقدّر مباشر",
      title: "أدخل أرقامك، واحصل على خطتك.",
      profile: "ملفك",
      orders: "الطلبات في يوم عادي",
      ordersUnit: "يومياً",
      cod: "الدفع نقداً عند الباب",
      area: "إلى أين تذهب؟",
      areas: { riyadh: "الرياض", multi: "الرياض ومدن أخرى", kingdom: "في أنحاء المملكة" },
      stock: "هل تخزّن MSG مخزونك؟",
      yes: "نعم",
      no: "لا",
      build: "أنشئ خطتي",
    },
    plan: {
      eyebrow: "خطة التوصية المخصصة",
      config: "إعدادك",
      assets: "الأصول التشغيلية",
      routes: "مسارات يومية",
      couriers: "مناديب، يوم عادي",
      peak: "مناديب، يوم الذروة",
      vehicles: "المركبات",
      pickup: "الاستلام",
      dispatch: "الانطلاق",
      cost: "تقدير التكلفة",
      costPending: "تسعّرها MSG حسب أحجامك",
      costNote: "تسعّر MSG كل خطة من جدول أسعارها بعد مراجعة أحجامك. أرسل الخطة واحصل على عرضك مباشرة.",
      perMonth: "شهرياً، تقديرياً",
      whatsapp: "احصل على عرض السعر عبر واتساب",
      send: "أرسل الخطة إلى MSG",
      edit: "عدّل الأرقام",
      example: "تقدير تخطيطي من مدخلاتك، وليس التزاماً بموعد.",
    },
  },
};
