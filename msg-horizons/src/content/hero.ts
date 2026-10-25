import type { Locale } from "@/content/i18n";

/** Hero (first screen) copy. Prices come from content/redsea.ts; nothing here states a price. */
export type HeroLane = "intra" | "inter" | "sabya";

type Copy = {
  live: string;
  title: string[];
  lead: string;
  ctaPlan: string;
  ctaTalk: string;
  stats: { v: number; suffix: string; l: string }[];
  ops: string;
  quote: {
    title: string;
    lanes: Record<HeroLane, string>;
    orders: string;
    perMonth: string;
    perOrder: string;
    monthly: string;
    cur: string;
    note: string;
    cta: string;
    full: string;
    wa: string;
  };
  map: { label: string; hub: string; sabya: string; delivered: string; caption: string };
  /** the warehouse walk-in: real MSG photos (public/media/msg, see docs/CONTENT-NOTES.md) */
  facade: { alt: string; caption: string; hint: string };
  inside: { eyebrow: string; title: string; lead: string; alt: string; spots: { storage: string; sorting: string; dispatch: string } };
  /** after the walk-in: MSG's network as a live control console (components/hero/Command.tsx) */
  command: {
    title: string[];
    /** the headline's second line, typed in turn (the first is title[1]); only what the lead already says */
    typed: string[];
    lead: string;
    /** the lead on phones, where the console needs the room */
    leadShort: string;
    waShort: string;
    eyebrow: string;
    ctaPrice: string;
    console: string;
    clock: string;
    lanes: string;
    partners: string;
    fleet: { t: string; d: string };
    price: { t: string; per: string; open: string; close: string };
    order: { label: string; note: string; steps: { t: string; d: string; at: string }[] };
    /** `unit` is a word set after the figure in the reading direction (Arabic), outside the left-to-right number */
    strengths: { v: number; pre?: string; suffix: string; unit?: string; l: string }[];
    hint: string;
  };
  cities: Record<string, string>;
  kingdom: {
    eyebrow: string; title: string; lead: string;
    /** the four-stage operation layered on the map: rail label and hint */
    rail: string; hint: string;
    /** short labels drawn on the map beside each stage's action (illustrative, captioned as such) */
    callouts: { pickups: string; abroad: string; packed: string; shelf: string; haul: string; pod: string; cash: string; returns: string; you: string };
  };
};

export const heroCopy: Record<Locale, Copy> = {
  en: {
    live: "Operating now · Riyadh · 24/7",
    title: ["You have something to sell.", "We already have the drivers."],
    lead: "Have a product, an idea or a shop that should be selling online? MSG runs the storage, shipping and delivery, with the licences, compliance and people already in place. Price a delivery in ten seconds.",
    ctaPlan: "Build my logistics plan",
    ctaTalk: "Talk to MSG on WhatsApp",
    stats: [
      { v: 1000, suffix: "+", l: "couriers" },
      { v: 100, suffix: "+", l: "vehicles" },
      { v: 24, suffix: "/7", l: "operations" },
    ],
    ops: "operations",
    quote: {
      title: "Price a delivery in 10 seconds",
      lanes: { intra: "Same city", inter: "City to city", sabya: "Sabya → cities" },
      orders: "Orders a month",
      perMonth: "a month",
      perOrder: "Approx. per order",
      monthly: "Approx. per month",
      cur: "SAR",
      note: "1 kg, next-day, from MSG's rate card at your volume. Cash on delivery and returns are quoted with your plan.",
      cta: "Get this quote on WhatsApp",
      full: "Build the full plan",
      wa: "Hello MSG Horizons, I'd like the {lane} rate for about {n} orders a month.",
    },
    map: {
      label: "Animated map of Saudi Arabia: parcels travel from MSG's Riyadh hub and Sabya logistics centre to cities across the Kingdom.",
      hub: "Riyadh hub",
      sabya: "Sabya centre",
      delivered: "Delivered",
      caption: "Illustrative network view",
    },
    command: {
      title: ["The Kingdom's delivery network.", "Already running."],
      typed: ["Already running.", "Storing your stock.", "Delivering it.", "Collecting your cash.", "Handling returns."],
      lead: "MSG Horizons owns the vans, employs the drivers and runs the hub. Your stock is stored, delivered, tracked live and paid back by one accountable team, with the licences and compliance already in place.",
      leadShort: "Our own vans, in-house drivers and our own hub. Stored, delivered, tracked live and paid back by one accountable team.",
      waShort: "WhatsApp",
      eyebrow: "Last-mile delivery and logistics across Saudi Arabia",
      ctaPrice: "Price a delivery",
      console: "MSG Control · Live network",
      clock: "Riyadh",
      lanes: "Network view",
      partners: "In the network with",
      fleet: { t: "Own vans, in-house drivers", d: "MSG's fleet runs out of the Sabya hub" },
      price: { t: "Your price, in 10 seconds", per: "per order", open: "Adjust your price", close: "Close" },
      order: {
        label: "One order, live",
        note: "Illustrative order",
        steps: [
          { t: "Driver accepted", d: "Tracking starts the moment they say yes", at: "09:12" },
          { t: "Collected", d: "Scanned at the Sabya hub", at: "09:40" },
          { t: "Line-haul", d: "Sabya to Riyadh, on MSG's own van", at: "13:05" },
          { t: "Out for delivery", d: "Your customer can follow it live", at: "08:20" },
          { t: "Delivered", d: "Photo and signature as proof", at: "10:47" },
          { t: "Cash settled", d: "Cash on delivery reconciled to you", at: "18:00" },
        ],
      },
      strengths: [
        { v: 1000, suffix: "+", l: "couriers on the network" },
        { v: 100, suffix: "+", l: "vehicles in the fleet" },
        { v: 20, pre: "SAR ", suffix: "M+", l: "annual revenue" },
        { v: 1000, suffix: " m²", l: "Sabya hub" },
        { v: 24, suffix: "/7", l: "operations" },
      ],
      hint: "Scroll into the network",
    },
    facade: {
      alt: "The MSG Horizons Sabya hub, with the company sign above the open loading door",
      caption: "Our Sabya hub. Real photo, retouched for presentation.",
      hint: "Scroll to step inside",
    },
    inside: {
      eyebrow: "Inside the Sabya hub",
      title: "Stored, sorted and sent out, under one roof.",
      lead: "Racks for your stock, cages for sorting, and a floor ready for every pickup and dispatch.",
      alt: "Inside the MSG Horizons Sabya hub: racks of parcels, sorting cages and an open floor",
      spots: { storage: "Your stock, on racks", sorting: "Sorting", dispatch: "Ready for dispatch" },
    },
    kingdom: {
      eyebrow: "Then out across the Kingdom",
      title: "From this floor to your customer's door.",
      lead: "Line-haul between cities, then couriers to the door, every day of the week. One MSG team accountable at every step.",
      rail: "One order through MSG",
      hint: "Keep scrolling to follow one order",
      callouts: {
        pickups: "Collection points, one pickup schedule",
        abroad: "Stock arriving from abroad",
        packed: "Packed and labelled",
        shelf: "Stock on the shelf",
        haul: "Line-haul between cities",
        pod: "Proof of delivery",
        cash: "Cash reconciled",
        returns: "Return tracked",
        you: "Your account",
      },
    },
    cities: { riyadh: "Riyadh", jeddah: "Jeddah", makkah: "Makkah", madinah: "Madinah", dammam: "Dammam", abha: "Abha", tabuk: "Tabuk", hail: "Hail", buraidah: "Buraidah", sabya: "Sabya", najran: "Najran", ahsa: "Al Ahsa", taif: "Taif" },
  },
  ar: {
    live: "نعمل الآن · الرياض · على مدار الساعة",
    title: ["لديك ما تبيعه.", "ولدينا المناديب بالفعل."],
    lead: "لديك منتج أو فكرة أو متجر يجب أن يبيع أونلاين؟ ام اس جي تتولى التخزين والشحن والتوصيل، مع التراخيص والامتثال والفريق جاهزة مسبقاً. احسب تكلفة التوصيل في عشر ثوانٍ.",
    ctaPlan: "ابنِ خطتك اللوجستية",
    ctaTalk: "تحدث مع ام اس جي عبر واتساب",
    stats: [
      { v: 1000, suffix: "+", l: "مندوب" },
      { v: 100, suffix: "+", l: "مركبة" },
      { v: 24, suffix: "/7", l: "تشغيل" },
    ],
    ops: "تشغيل",
    quote: {
      title: "احسب تكلفة التوصيل في 10 ثوانٍ",
      lanes: { intra: "داخل المدينة", inter: "بين المدن", sabya: "صبيا ← المدن" },
      orders: "الطلبات شهرياً",
      perMonth: "شهرياً",
      perOrder: "تقريباً للطلب",
      monthly: "تقريباً شهرياً",
      cur: "ريال",
      note: "شحنة 1 كجم في اليوم التالي، من جدول أسعار ام اس جي حسب حجمك. الدفع عند الاستلام والمرتجعات تُسعّر مع خطتك.",
      cta: "اطلب هذا السعر عبر واتساب",
      full: "ابنِ الخطة كاملة",
      wa: "مرحباً ام اس جي هورايزونز، أريد سعر ({lane}) لنحو {n} طلب شهرياً.",
    },
    map: {
      label: "خريطة متحركة للمملكة: طرود تنطلق من محطة ام اس جي في الرياض ومركز صبيا اللوجستي إلى مدن المملكة.",
      hub: "محطة الرياض",
      sabya: "مركز صبيا",
      delivered: "تم التسليم",
      caption: "عرض توضيحي للشبكة",
    },
    command: {
      title: ["شبكة التوصيل في المملكة.", "تعمل الآن."],
      typed: ["تعمل الآن.", "تخزّن بضاعتك.", "توصلها لعملائك.", "تحصّل أموالك.", "تدير المرتجعات."],
      lead: "ام اس جي هورايزونز تملك المركبات، ومناديبها من فريقها، وتدير مركزها بنفسها. مخزونك يُخزَّن ويُوصَّل ويُتتبَّع مباشرة وتعود أمواله إليك عبر فريق واحد مسؤول، مع التراخيص والامتثال جاهزة مسبقاً.",
      leadShort: "مركباتنا الخاصة، ومناديب من فريقنا، ومركزنا الخاص. تخزين وتوصيل وتتبع مباشر وتحصيل أموالك عبر فريق واحد مسؤول.",
      waShort: "واتساب",
      eyebrow: "توصيل الميل الأخير والخدمات اللوجستية في السعودية",
      ctaPrice: "احسب تكلفة التوصيل",
      console: "تحكّم ام اس جي · الشبكة مباشرة",
      clock: "الرياض",
      lanes: "عرض الشبكة",
      partners: "ضمن شبكة واحدة مع",
      fleet: { t: "أسطول خاص ومناديب من فريقنا", d: "أسطول ام اس جي ينطلق من مركز صبيا" },
      price: { t: "سعرك في 10 ثوانٍ", per: "للطلب", open: "عدّل سعرك", close: "إغلاق" },
      order: {
        label: "طلب واحد، مباشرة",
        note: "طلب توضيحي",
        steps: [
          { t: "المندوب قبل الطلب", d: "يبدأ التتبع لحظة موافقته", at: "09:12" },
          { t: "تم الاستلام", d: "مسح الطرد في مركز صبيا", at: "09:40" },
          { t: "نقل بين المدن", d: "من صبيا إلى الرياض بمركبة ام اس جي", at: "13:05" },
          { t: "خرج للتوصيل", d: "عميلك يتابعه مباشرة", at: "08:20" },
          { t: "تم التسليم", d: "صورة وتوقيع كإثبات", at: "10:47" },
          { t: "تمت التسوية", d: "مطابقة الدفع عند الاستلام لحسابك", at: "18:00" },
        ],
      },
      strengths: [
        { v: 1000, suffix: "+", l: "مندوب في الشبكة" },
        { v: 100, suffix: "+", l: "مركبة في الأسطول" },
        { v: 20, suffix: "+", unit: "مليون ريال", l: "إيرادات سنوية" },
        { v: 1000, suffix: "", unit: "م²", l: "مركز صبيا" },
        { v: 24, suffix: "/7", l: "تشغيل" },
      ],
      hint: "مرّر لتدخل الشبكة",
    },
    facade: {
      alt: "مركز ام اس جي هورايزونز في صبيا، ولوحة الشركة فوق باب التحميل المفتوح",
      caption: "مركزنا في صبيا. صورة حقيقية مُحسَّنة للعرض.",
      hint: "مرّر لتدخل",
    },
    inside: {
      eyebrow: "داخل مركز صبيا",
      title: "تخزين وفرز وانطلاق، تحت سقف واحد.",
      lead: "أرفف لمخزونك، وأقفاص للفرز، وأرضية جاهزة لكل استلام وشحن.",
      alt: "داخل مركز ام اس جي هورايزونز في صبيا: أرفف طرود وأقفاص فرز وأرضية مفتوحة",
      spots: { storage: "مخزونك على الأرفف", sorting: "الفرز", dispatch: "جاهز للشحن" },
    },
    kingdom: {
      eyebrow: "ثم إلى أنحاء المملكة",
      title: "من هذه الأرضية إلى باب عميلك.",
      lead: "نقل بين المدن، ثم مناديب حتى الباب، كل أيام الأسبوع. فريق واحد من ام اس جي مسؤول عن كل خطوة.",
      rail: "طلب واحد عبر ام اس جي",
      hint: "واصل التمرير لتتبع طلباً واحداً",
      callouts: {
        pickups: "نقاط استلام، وجدول استلام واحد",
        abroad: "مخزون قادم من الخارج",
        packed: "مغلّف وملصق",
        shelf: "المخزون على الرف",
        haul: "نقل بين المدن",
        pod: "إثبات التسليم",
        cash: "مطابقة النقد",
        returns: "مرتجع متتبع",
        you: "حسابك",
      },
    },
    cities: { riyadh: "الرياض", jeddah: "جدة", makkah: "مكة", madinah: "المدينة", dammam: "الدمام", abha: "أبها", tabuk: "تبوك", hail: "حائل", buraidah: "بريدة", sabya: "صبيا", najran: "نجران", ahsa: "الأحساء", taif: "الطائف" },
  },
};
