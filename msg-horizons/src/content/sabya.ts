import type { Locale } from "@/content/i18n";

/**
 * Sabya Hub pitch. Every figure here was supplied by MSG (30 Sept 2026): the 800 m² floor in the
 * Sabya logistics centre, the channel partners and the 1 kg standard rates. Nothing else about the
 * south (other cities, other floors, other prices) may be added without MSG confirming it.
 */

/** 1 kg standard, SAR per shipment. `local` = doorstep inside Sabya / Jazan; `north` = Sabya ↔ RUH / JED / DMM incl. last mile. */
export const SABYA_RATES = {
  tiers: [
    { id: "walkin", local: 29, north: 48 },
    { id: "t299", local: 17, north: 28 },
    { id: "t500", local: 13, north: 22 },
  ],
  sameDay: { local: 16, north: 20 },
} as const;

export type SabyaTierId = (typeof SABYA_RATES.tiers)[number]["id"];

type Copy = {
  eyebrow: string;
  title: string;
  sub: string;
  tiles: { value: string; ar: string; label: string }[];
  body: string[];
  doIntro: string;
  does: string[];
  bodyClose: string;
  hardTitle: string;
  hard: { t: string; d: string }[];
  turn: string;
  map: { sabya: string; riyadh: string; jeddah: string; dammam: string; hub: string; lane: string };
  rates: {
    title: string;
    unit: string;
    tier: string;
    local: string;
    north: string;
    tiers: Record<SabyaTierId, string>;
    sameDay: string;
    cod: string;
    codLow: string;
    codHigh: string;
    returns: string;
    returnsFlat: string;
    returnsElse: string;
    scroll: string;
  };
  whoTitle: string;
  who: string[];
  cta: string;
  button: string;
  closer: string;
  waText: string;
};

export const sabyaCopy: Record<Locale, Copy> = {
  en: {
    eyebrow: "The lane other networks price as a penalty.",
    title: "800 m² in the middle of Sabya. That is the whole argument.",
    sub: "We keep a warehouse where delivery density dies, so local sellers do not pay a remote tax for existing.",
    tiles: [
      { value: "800 m²", ar: "800 م²", label: "Owned floor at the Sabya logistics centre" },
      { value: "Jazan", ar: "جازان", label: "A doorstep we actually staff" },
      { value: "RUH · JED · DMM", ar: "صبيا", label: "Line-haul north from the same building" },
    ],
    body: [
      "Sabya is not a convenient pin on a KSA coverage map. It sits in Jazan — long empty miles, thin daily stops, expensive first-attempt failure. Most carriers answer that with a surcharge or a shrug. MSG Horizons put an 800 m² warehouse in the Sabya logistics centre and staffed the last metre from that floor.",
    ],
    doIntro: "From this building we do three things other people quote as “remote”:",
    does: [
      "Doorstep delivery inside Sabya / Jazan",
      "Short-hold storage for local sellers who cannot rent a city shed in Riyadh",
      "Line-haul north into Riyadh, Jeddah and Dammam, then last-mile through our couriers and partner fleets (iMile, J&T, Naqel)",
    ],
    bodyClose: "You are not buying a forwarded tracking number. You are buying a floor that already exists in a place that punishes networks without one.",
    hardTitle: "Why this geography is hard",
    hard: [
      { t: "Thin stop density", d: "Few drops per route, so every stop carries more of the run." },
      { t: "Expensive empty miles", d: "Long spokes between towns, driven loaded one way." },
      { t: "High first-attempt failure", d: "A missed door costs a second long drive." },
      { t: "Weak storage for SMEs", d: "Few places a small seller can hold stock near the customer." },
    ],
    turn: "MSG already absorbed that cost into a standing hub. Doorstep in Sabya, sort on our floor, truck north — not a forwarded label with no owner on the ground.",
    map: { sabya: "Sabya", riyadh: "Riyadh", jeddah: "Jeddah", dammam: "Dammam", hub: "800 m² hub", lane: "Northbound line-haul" },
    rates: {
      title: "Sabya rate band",
      unit: "1 kg, standard · SAR per shipment",
      tier: "Monthly volume",
      local: "Sabya / Jazan doorstep",
      north: "Sabya ↔ Riyadh · Jeddah · Dammam",
      tiers: { walkin: "Walk-in", t299: "299+ a month", t500: "500+ a month" },
      sameDay: "Same-day / evening",
      cod: "Cash on delivery",
      codLow: "4%, min SAR 8 at low volume",
      codHigh: "3%, min SAR 5 from 200+ a month",
      returns: "Returns",
      returnsFlat: "SAR 18 flat from 150 shipments a month",
      returnsElse: "Otherwise 50% of the delivery rate or SAR 20",
      scroll: "Swipe for the northbound lane",
    },
    whoTitle: "Who this is for",
    who: [
      "Sabya and Jazan shopkeepers",
      "Small factories in the region",
      "Marketplace sellers shipping north",
      "Riyadh and Jeddah brands that need a real south door instead of a surcharge",
    ],
    cta: "Price Sabya as a hub, not as a remote zone.",
    button: "Lock Sabya band",
    closer: "Price Sabya as a hub. Stop paying for it as a problem.",
    waText: "Hello MSG Horizons, I want to lock the Sabya band.\nMonthly shipments: \nLocal Sabya / northbound: ",
  },
  ar: {
    eyebrow: "المسار الذي تسعّره الشبكات الأخرى كغرامة.",
    title: "800 م² في قلب صبيا. هذه هي الحجة كلها.",
    sub: "نحتفظ بمستودع حيث تتلاشى كثافة التوصيل، حتى لا يدفع البائع المحلي ضريبة المنطقة النائية لمجرد وجوده.",
    tiles: [
      { value: "800 م²", ar: "800 m²", label: "مساحة مملوكة في مركز صبيا اللوجستي" },
      { value: "جازان", ar: "Jazan", label: "توصيل حتى الباب بفريق موجود فعلاً" },
      { value: "RUH · JED · DMM", ar: "Sabya", label: "نقل بري شمالاً من المبنى نفسه" },
    ],
    body: [
      "صبيا ليست نقطة مريحة على خريطة التغطية في المملكة. تقع في جازان: مسافات طويلة فارغة، ونقاط توقف يومية قليلة، وتكلفة عالية لفشل المحاولة الأولى. معظم شركات الشحن تواجه ذلك برسوم إضافية أو بتجاهل. أما MSG Horizons فوضعت مستودعاً بمساحة 800 م² في مركز صبيا اللوجستي، ووفّرت فريق الميل الأخير من الأرضية نفسها.",
    ],
    doIntro: "من هذا المبنى نقدّم ثلاثة أمور يسعّرها غيرنا على أنها «نائية»:",
    does: [
      "توصيل حتى الباب داخل صبيا وجازان",
      "تخزين قصير المدى للبائعين المحليين الذين لا يستطيعون استئجار مستودع في الرياض",
      "نقل بري شمالاً إلى الرياض وجدة والدمام، ثم الميل الأخير عبر مناديبنا وأساطيل شركائنا: iMile وJ&T وناقل",
    ],
    bodyClose: "أنت لا تشتري رقم تتبع محوّلاً. أنت تشتري أرضية موجودة بالفعل في مكان يعاقب الشبكات التي لا تملك واحدة.",
    hardTitle: "لماذا هذه الجغرافيا صعبة",
    hard: [
      { t: "كثافة توقف منخفضة", d: "نقاط تسليم قليلة في كل مسار، فيتحمل كل توقف جزءاً أكبر من الرحلة." },
      { t: "أميال فارغة مكلفة", d: "مسافات طويلة بين البلدات، محمّلة في اتجاه واحد." },
      { t: "فشل مرتفع في المحاولة الأولى", d: "الباب الفائت يعني رحلة طويلة ثانية." },
      { t: "خيارات تخزين ضعيفة للمنشآت الصغيرة", d: "أماكن قليلة يحفظ فيها البائع الصغير مخزونه قرب العميل." },
    ],
    turn: "استوعبت MSG هذه التكلفة مسبقاً في مركز قائم. التسليم عند الباب في صبيا، والفرز على أرضيتنا، والشاحنة تتجه شمالاً، لا ملصق محوّل بلا مسؤول على الأرض.",
    map: { sabya: "صبيا", riyadh: "الرياض", jeddah: "جدة", dammam: "الدمام", hub: "مركز 800 م²", lane: "نقل بري شمالاً" },
    rates: {
      title: "شريحة أسعار صبيا",
      unit: "1 كجم، قياسي · ريال للشحنة",
      tier: "الحجم الشهري",
      local: "صبيا / جازان حتى الباب",
      north: "صبيا ↔ الرياض · جدة · الدمام",
      tiers: { walkin: "بدون اشتراك", t299: "299+ شهرياً", t500: "500+ شهرياً" },
      sameDay: "نفس اليوم / مسائي",
      cod: "الدفع عند الاستلام",
      codLow: "4% بحد أدنى 8 ريال للأحجام المنخفضة",
      codHigh: "3% بحد أدنى 5 ريال من 200+ شهرياً",
      returns: "المرتجعات",
      returnsFlat: "18 ريال ثابتة من 150 شحنة شهرياً",
      returnsElse: "غير ذلك 50% من سعر التوصيل أو 20 ريال",
      scroll: "اسحب لرؤية المسار الشمالي",
    },
    whoTitle: "لمن هذا",
    who: [
      "أصحاب المحلات في صبيا وجازان",
      "المصانع الصغيرة في المنطقة",
      "بائعو المتاجر الإلكترونية الذين يشحنون شمالاً",
      "علامات الرياض وجدة التي تحتاج باباً حقيقياً في الجنوب بدلاً من رسوم إضافية",
    ],
    cta: "سعّر صبيا كمركز، لا كمنطقة نائية.",
    button: "ثبّت شريحة صبيا",
    closer: "سعّر صبيا كمركز. توقف عن دفع ثمنها كمشكلة.",
    waText: "مرحباً MSG Horizons، أريد تثبيت شريحة صبيا.\nالشحنات الشهرية: \nمحلي صبيا / شمالاً: ",
  },
};
