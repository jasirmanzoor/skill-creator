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
  rolls: string[];
  gate: {
    hook: string;
    individual: string;
    business: string;
    segments: Record<Segment, { t: string; d: string }>;
    pick: string;
    selected: string;
    typical: string;
    walk: string;
    change: string;
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
    covered: string;
    cost: string;
    costMonthly: string;
    costNote: string;
    whatsapp: string;
    send: string;
    edit: string;
    example: string;
  };
};

export const roadmapCopy: Record<Locale, Copy> = {
  en: {
    eyebrow: "The MSG roadmap",
    title: "Our service, mapped out for you step by step.",
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
      selected: "Your roadmap is now personalised for",
      typical: "We'll start your plan at about {n} orders a day. You can change it in the estimator.",
      walk: "Walk me through my roadmap",
      change: "Pick another profile any time.",
    },
    steps: [
      { t: "Submit your enquiry", d: "Two minutes on the web, or one WhatsApp message.", points: ["No sign-up", "Arabic or English", "Straight to MSG's team"] },
      { t: "We map your requirements", d: "Volumes, areas, peaks, cash share and returns.", points: ["Your real numbers", "Peak seasons planned", "Cash and returns covered"] },
      { t: "Our standard guide", d: "Packaging, labelling, pickup windows and handover rules.", points: ["Shared before day one", "Clear handover rules", "Fewer failed deliveries"] },
      { t: "Curated recommendations", d: "Your price quote and everything your plan covers, with absolute clarity.", points: ["A written price quote", "Every checkpoint covered", "Proof of delivery, live tracking, cash on time"] },
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
      covered: "Covered in your plan",
      cost: "Approx. cost per order",
      costMonthly: "≈ SAR {total} a month for {n} orders",
      costNote: "1 kg next-day, from MSG's rate card at your volume. Cash on delivery, storage and returns are confirmed in your quote.",
      whatsapp: "Get my quote on WhatsApp",
      send: "Send plan to MSG",
      edit: "Adjust numbers",
      example: "Planning estimate from your inputs, not a delivery promise.",
    },
  },
  ar: {
    eyebrow: "خارطة MSG",
    title: "خدمة سلسة، مرسومة لك خطوة بخطوة.",
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
      selected: "خارطتك الآن مخصصة لـ",
      typical: "سنبدأ خطتك بنحو {n} طلب يومياً، ويمكنك تعديله في المقدّر.",
      walk: "خذني في جولة على خارطتي",
      change: "يمكنك اختيار ملف آخر في أي وقت.",
    },
    steps: [
      { t: "أرسل استفسارك", d: "دقيقتان على الموقع، أو رسالة واتساب واحدة.", points: ["دون تسجيل", "بالعربية أو الإنجليزية", "مباشرة إلى فريق MSG"] },
      { t: "نحدد متطلباتك", d: "الأحجام والمناطق والذروات ونسبة النقد والمرتجعات.", points: ["أرقامك الفعلية", "مواسم الذروة مخطط لها", "النقد والمرتجعات مغطاة"] },
      { t: "دليلنا المعياري", d: "التغليف والملصقات ومواعيد الاستلام وقواعد التسليم.", points: ["قبل اليوم الأول", "قواعد تسليم واضحة", "توصيلات فاشلة أقل"] },
      { t: "توصيات مخصصة", d: "عرض السعر وكل ما تشمله خطتك، بوضوح تام.", points: ["عرض سعر مكتوب", "كل نقطة مغطاة", "إثبات التسليم والتتبع والنقد في وقته"] },
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
      covered: "مشمول في خطتك",
      cost: "التكلفة التقريبية للطلب",
      costMonthly: "≈ {total} ريال شهرياً مقابل {n} طلب",
      costNote: "شحنة 1 كجم في اليوم التالي، من جدول أسعار MSG حسب حجمك. الدفع عند الاستلام والتخزين والمرتجعات تُؤكد في عرض السعر.",
      whatsapp: "احصل على عرض السعر عبر واتساب",
      send: "أرسل الخطة إلى MSG",
      edit: "عدّل الأرقام",
      example: "تقدير تخطيطي من مدخلاتك، وليس التزاماً بموعد.",
    },
  },
};

/** Hand-holding guide for each roadmap step: who does what, and the device demo's strings. */
export const guideCopy: Record<
  Locale,
  {
    you: string;
    msg: string;
    nextUp: string;
    walk: string;
    pause: string;
    steps: { you: string; msg: string }[];
    demo: {
      chatHead: string;
      hello: (who: string, orders: number, where: string) => string;
      who: Record<Segment, string>;
      where: { riyadh: string; multi: string; kingdom: string };
      reply: string;
      typing: string;
      quick: string;
      formTitle: string;
      fields: { profile: string; orders: string; cod: string; area: string; stock: string };
      perDay: string;
      yes: string;
      no: string;
      guideTitle: string;
      guideItems: string[];
      label: { to: string; cod: string; handle: string };
      planTitle: string;
      perOrder: string;
      services: { lastMile: string; cod: string; storage: string; tracking: string };
      docTitle: string;
      docItems: string[];
      signed: string;
      pilotTitle: string;
      pod: string;
      live: string;
      liveBody: string;
    };
  }
> = {
  en: {
    you: "You do",
    msg: "MSG does",
    nextUp: "Next up",
    walk: "Walk me through it",
    pause: "Pause the tour",
    steps: [
      { you: "Send one WhatsApp message or the two-minute form.", msg: "Replies in Arabic or English and assigns your contact." },
      { you: "Share your numbers: orders, areas, cash share and returns.", msg: "Turns them into a delivery profile you can check line by line." },
      { you: "Prepare parcels with the packaging and label guide.", msg: "Sets your pickup window and handover rules before day one." },
      { you: "Review the plan and ask anything.", msg: "Prepares your price quote and shows every checkpoint your plan covers." },
      { you: "Sign scope, remittance, returns and claims.", msg: "Puts every term in writing before the first parcel moves." },
      { you: "Hand over the pilot parcels.", msg: "Delivers them with proof, reviews them with you, then switches you to live." },
    ],
    demo: {
      chatHead: "MSG Horizons",
      hello: (who, orders, where) => `Hi MSG, we're ${who} with about ${orders} orders a day ${where}.`,
      who: { offline: "a local shop", social: "an online seller on social media", neighborhood: "a neighbourhood store", enterprise: "a retailer with several sites", sme: "a growing online brand", aggregator: "a delivery platform" },
      where: { riyadh: "in Riyadh", multi: "in Riyadh and other cities", kingdom: "across the Kingdom" },
      reply: "Welcome. Let's map your deliveries together.",
      typing: "typing…",
      quick: "Share my numbers",
      formTitle: "Your delivery profile",
      fields: { profile: "Profile", orders: "Orders", cod: "Paid in cash", area: "Areas", stock: "Storage" },
      perDay: "a day",
      yes: "Yes",
      no: "No",
      guideTitle: "Standard guide",
      guideItems: ["Packaging", "Shipping label", "Pickup window", "Handover rules"],
      label: { to: "Deliver to", cod: "Cash on delivery", handle: "Handle with care" },
      planTitle: "Recommended plan",
      perOrder: "Approx. per order",
      services: { lastMile: "Last-mile", cod: "Cash collection", storage: "Storage", tracking: "Live tracking" },
      docTitle: "Project agreement",
      docItems: ["Scope", "Remittance", "Returns", "Claims"],
      signed: "Signed",
      pilotTitle: "Pilot shipments",
      pod: "proof of delivery",
      live: "You're live",
      liveBody: "Tracked 24/7, one team accountable.",
    },
  },
  ar: {
    you: "ما تقوم به",
    msg: "ما تقوم به ام اس جي",
    nextUp: "التالي",
    walk: "خذني في جولة",
    pause: "أوقف الجولة",
    steps: [
      { you: "أرسل رسالة واتساب واحدة أو النموذج في دقيقتين.", msg: "ترد بالعربية أو الإنجليزية وتعيّن لك جهة تواصل." },
      { you: "شارك أرقامك: الطلبات والمناطق ونسبة النقد والمرتجعات.", msg: "تحوّلها إلى ملف توصيل تراجعه سطراً بسطر." },
      { you: "جهّز الطرود وفق دليل التغليف والملصقات.", msg: "تحدد موعد الاستلام وقواعد التسليم قبل اليوم الأول." },
      { you: "راجع الخطة واسأل عن أي شيء.", msg: "تجهّز عرض السعر وتريك كل نقطة تشملها خطتك." },
      { you: "وقّع النطاق والتحويلات والمرتجعات والمطالبات.", msg: "تكتب كل الشروط قبل أن يتحرك أول طرد." },
      { you: "سلّم الطرود التجريبية.", msg: "توصلها مع إثبات التسليم وتراجعها معك، ثم تنقلك إلى التشغيل." },
    ],
    demo: {
      chatHead: "ام اس جي هورايزونز",
      hello: (who, orders, where) => `مرحباً ام اس جي، نحن ${who} ولدينا نحو ${orders} طلب يومياً ${where}.`,
      who: { offline: "متجر محلي", social: "بائع عبر منصات التواصل", neighborhood: "متجر حي", enterprise: "متاجر بعدة فروع", sme: "علامة إلكترونية متنامية", aggregator: "منصة توصيل" },
      where: { riyadh: "في الرياض", multi: "في الرياض ومدن أخرى", kingdom: "في أنحاء المملكة" },
      reply: "أهلاً بك. لنرسم توصيلاتك معاً.",
      typing: "يكتب…",
      quick: "شارك أرقامي",
      formTitle: "ملف التوصيل الخاص بك",
      fields: { profile: "الملف", orders: "الطلبات", cod: "الدفع نقداً", area: "المناطق", stock: "التخزين" },
      perDay: "يومياً",
      yes: "نعم",
      no: "لا",
      guideTitle: "الدليل المعياري",
      guideItems: ["التغليف", "ملصق الشحن", "موعد الاستلام", "قواعد التسليم"],
      label: { to: "التسليم إلى", cod: "الدفع عند الاستلام", handle: "يُرجى العناية" },
      planTitle: "الخطة الموصى بها",
      perOrder: "تقريباً للطلب",
      services: { lastMile: "الميل الأخير", cod: "تحصيل النقد", storage: "التخزين", tracking: "تتبع مباشر" },
      docTitle: "اتفاقية المشروع",
      docItems: ["النطاق", "التحويلات", "المرتجعات", "المطالبات"],
      signed: "موقّعة",
      pilotTitle: "الشحنات التجريبية",
      pod: "إثبات تسليم",
      live: "أنت الآن في التشغيل",
      liveBody: "تتبع على مدار الساعة وفريق واحد مسؤول.",
    },
  },
};
