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
};

export const heroCopy: Record<Locale, Copy> = {
  en: {
    live: "Operating now · Riyadh · 24/7",
    title: ["You have something to sell.", "We already have the drivers."],
    lead: "Last-mile delivery, storage and line-haul across Saudi Arabia, run as one accountable operation. Price your deliveries in ten seconds, then build the full plan.",
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
      cta: "Lock this rate on WhatsApp",
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
    cities: { riyadh: "Riyadh", jeddah: "Jeddah", makkah: "Makkah", madinah: "Madinah", dammam: "Dammam", abha: "Abha", tabuk: "Tabuk", hail: "Hail", buraidah: "Buraidah", sabya: "Sabya", najran: "Najran", ahsa: "Al Ahsa", taif: "Taif" },
  },
  ar: {
    live: "نعمل الآن · الرياض · على مدار الساعة",
    title: ["لديك ما تبيعه.", "ولدينا المناديب بالفعل."],
    lead: "توصيل الميل الأخير والتخزين والنقل بين المدن في أنحاء المملكة، كعملية واحدة مسؤولة. احسب تكلفة توصيلاتك في عشر ثوانٍ، ثم ابنِ خطتك كاملة.",
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
      cta: "ثبّت هذا السعر عبر واتساب",
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
    cities: { riyadh: "الرياض", jeddah: "جدة", makkah: "مكة", madinah: "المدينة", dammam: "الدمام", abha: "أبها", tabuk: "تبوك", hail: "حائل", buraidah: "بريدة", sabya: "صبيا", najran: "نجران", ahsa: "الأحساء", taif: "الطائف" },
  },
};
