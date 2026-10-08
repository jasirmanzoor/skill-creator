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
  cities: Record<string, string>;
  /** the warehouse walk-in: real MSG photos (public/media/msg, see docs/CONTENT-NOTES.md) */
  facade: { alt: string; caption: string; hint: string };
  inside: { eyebrow: string; title: string; lead: string; alt: string; spots: { storage: string; sorting: string; dispatch: string } };
  kingdom: { eyebrow: string; title: string; lead: string };
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
      lead: "Line-haul between cities, then couriers to the door, every day of the week.",
    },
    cities: { riyadh: "Riyadh", jeddah: "Jeddah", makkah: "Makkah", madinah: "Madinah", dammam: "Dammam", abha: "Abha", tabuk: "Tabuk", hail: "Hail", buraidah: "Buraidah", sabya: "Sabya", najran: "Najran", ahsa: "Al Ahsa", taif: "Taif" },
  },
  ar: {
    live: "نعمل الآن · الرياض · على مدار الساعة",
    title: ["لديك ما تبيعه.", "ولدينا المناديب بالفعل."],
    lead: "لديك منتج أو فكرة أو متجر يجب أن يبيع أونلاين؟ مسج تتولى التخزين والشحن والتوصيل، مع التراخيص والامتثال والفريق جاهزة مسبقاً. احسب تكلفة التوصيل في عشر ثوانٍ.",
    ctaPlan: "ابنِ خطتك اللوجستية",
    ctaTalk: "تحدث مع مسج عبر واتساب",
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
      note: "شحنة 1 كجم في اليوم التالي، من جدول أسعار مسج حسب حجمك. الدفع عند الاستلام والمرتجعات تُسعّر مع خطتك.",
      cta: "اطلب هذا السعر عبر واتساب",
      full: "ابنِ الخطة كاملة",
      wa: "مرحباً مسج هورايزونز، أريد سعر ({lane}) لنحو {n} طلب شهرياً.",
    },
    map: {
      label: "خريطة متحركة للمملكة: طرود تنطلق من محطة مسج في الرياض ومركز صبيا اللوجستي إلى مدن المملكة.",
      hub: "محطة الرياض",
      sabya: "مركز صبيا",
      delivered: "تم التسليم",
      caption: "عرض توضيحي للشبكة",
    },
    facade: {
      alt: "مركز مسج هورايزونز في صبيا، ولوحة الشركة فوق باب التحميل المفتوح",
      caption: "مركزنا في صبيا. صورة حقيقية مُحسَّنة للعرض.",
      hint: "مرّر لتدخل",
    },
    inside: {
      eyebrow: "داخل مركز صبيا",
      title: "تخزين وفرز وانطلاق، تحت سقف واحد.",
      lead: "أرفف لمخزونك، وأقفاص للفرز، وأرضية جاهزة لكل استلام وشحن.",
      alt: "داخل مركز مسج هورايزونز في صبيا: أرفف طرود وأقفاص فرز وأرضية مفتوحة",
      spots: { storage: "مخزونك على الأرفف", sorting: "الفرز", dispatch: "جاهز للشحن" },
    },
    kingdom: {
      eyebrow: "ثم إلى أنحاء المملكة",
      title: "من هذه الأرضية إلى باب عميلك.",
      lead: "نقل بين المدن، ثم مناديب حتى الباب، كل أيام الأسبوع.",
    },
    cities: { riyadh: "الرياض", jeddah: "جدة", makkah: "مكة", madinah: "المدينة", dammam: "الدمام", abha: "أبها", tabuk: "تبوك", hail: "حائل", buraidah: "بريدة", sabya: "صبيا", najran: "نجران", ahsa: "الأحساء", taif: "الطائف" },
  },
};
