import type { Locale } from "@/content/i18n";

/**
 * "Red Sea glass" bands: the network band, the live price band and the Sabya beat.
 * Every number here was supplied by MSG on 30 Sept 2026 (1 kg next-day rate card and the Sabya
 * 800 m² logistics centre). Nothing is derived or invented beyond orders × the stated rate.
 */

export const LANES = ["intra", "inter", "sabyaLocal", "sabyaMajor"] as const;
export type Lane = (typeof LANES)[number];

/** SAR per 1 kg shipment. `walkin` below 299 shipments a month, `t299` from 299 a month. */
export const RATE_CARD: Record<Lane, { walkin: number; t299: number }> = {
  intra: { walkin: 33, t299: 21 },
  inter: { walkin: 52, t299: 30 },
  sabyaLocal: { walkin: 29, t299: 17 },
  sabyaMajor: { walkin: 48, t299: 28 },
};
export const TIER_FROM = 299;

export const rateFor = (lane: Lane, monthly: number) => (monthly >= TIER_FROM ? RATE_CARD[lane].t299 : RATE_CARD[lane].walkin);

/** Partners exactly as MSG listed them for this band (text, no logos). */
export const PARTNER_TEXT = ["iMile", "J&T", "Keeta", "Landmark", "AJEX", "Naqel", "Logistiq"];

type Copy = {
  network: {
    eyebrow: string;
    title: string;
    sub: string;
    stats: { v: string; l: string }[];
    partners: string;
    ctaTitle: string;
    ctaBody: string;
    cta: string;
  };
  growth: {
    eyebrow: string;
    title: string[];
    lead: string;
    lane: string;
    lanes: Record<Lane, string>;
    orders: string;
    perMonth: string;
    cur: string;
    perShipment: string;
    monthly: string;
    note: string;
    cta: string;
    wa: string;
    milestones: { first: string; peak: string };
  };
  sabya: {
    eyebrow: string;
    title: string;
    sub: string;
    approx: string;
    local: string;
    major: string;
    cta: string;
    wa: string;
  };
};

export const redSea: Record<Locale, Copy> = {
  en: {
    network: {
      eyebrow: "MSG Horizons at a glance",
      title: "1,000+ couriers. 100+ vehicles.",
      sub: "One network, operating around the clock.",
      stats: [
        { v: "1,000+", l: "Couriers on the road" },
        { v: "100+", l: "Vehicles in the fleet" },
        { v: "24/7", l: "Operations, every day" },
      ],
      partners: "Working alongside",
      ctaTitle: "Your approximate cost per order, in two minutes.",
      ctaBody: "Tell the MSG roadmap who you are and how many orders you ship. It returns your delivery plan with an approximate cost per order.",
      cta: "Map my delivery plan",
    },
    growth: {
      eyebrow: "Growing with MSG Horizons",
      title: ["From your first order", "to your biggest peak season,", "MSG moves with you."],
      lead: "Move the slider to your monthly orders and see the approximate cost per order, straight from MSG's rate card.",
      lane: "Where do they go?",
      lanes: { intra: "Same city", inter: "City to city", sabyaLocal: "Inside Sabya", sabyaMajor: "Sabya → major cities" },
      orders: "Orders a month",
      perMonth: "a month",
      cur: "SAR",
      perShipment: "Approx. cost per order",
      monthly: "Approx. per month",
      note: "1 kg next-day, from MSG's rate card at your volume. Cash on delivery, returns and same-day are quoted with your plan.",
      cta: "Get my quote on WhatsApp",
      wa: "Hello MSG Horizons, I ship about {n} orders a month ({lane}). Please send my quote.",
      milestones: { first: "First order", peak: "Peak season" },
    },
    sabya: {
      eyebrow: "Sabya · Jazan",
      title: "800 m² equipped with all necessary components",
      sub: "Our logistics centre in Sabya: doorstep delivery across Jazan, and line-haul north to the major cities.",
      approx: "Approx. cost per order · 1 kg next-day",
      local: "Inside Sabya",
      major: "Sabya to major cities",
      cta: "Ask about Sabya",
      wa: "Hello MSG Horizons, I want to ship from Sabya.",
    },
  },
  ar: {
    network: {
      eyebrow: "مسج هورايزونز في لمحة",
      title: "+1,000 مندوب. +100 مركبة.",
      sub: "شبكة واحدة تعمل على مدار الساعة.",
      stats: [
        { v: "+1,000", l: "مندوب على الطريق" },
        { v: "+100", l: "مركبة في الأسطول" },
        { v: "24/7", l: "عمليات كل يوم" },
      ],
      partners: "نعمل جنباً إلى جنب مع",
      ctaTitle: "التكلفة التقريبية لطلبك، في دقيقتين.",
      ctaBody: "أخبر خارطة MSG من أنت وكم طلباً تشحن، وستحصل على خطة التوصيل مع التكلفة التقريبية لكل طلب.",
      cta: "ارسم خطة التوصيل",
    },
    growth: {
      eyebrow: "النمو مع مسج هورايزونز",
      title: ["من أول طلب لك", "إلى أكبر مواسم الذروة،", "مسج تتحرك معك."],
      lead: "حرّك المؤشر إلى عدد طلباتك الشهرية لترى التكلفة التقريبية لكل طلب، مباشرة من جدول أسعار مسج.",
      lane: "إلى أين تذهب؟",
      lanes: { intra: "داخل المدينة", inter: "بين المدن", sabyaLocal: "داخل صبيا", sabyaMajor: "من صبيا إلى المدن الكبرى" },
      orders: "الطلبات شهرياً",
      perMonth: "شهرياً",
      cur: "ريال",
      perShipment: "التكلفة التقريبية للطلب",
      monthly: "تقريباً شهرياً",
      note: "1 كجم، اليوم التالي. الدفع عند الاستلام والمرتجعات ونفس اليوم تُسعّر مع خطتك.",
      cta: "احصل على عرض السعر عبر واتساب",
      wa: "مرحباً مسج هورايزونز، أشحن نحو {n} طلب شهرياً ({lane}). أرسلوا لي عرض السعر.",
      milestones: { first: "أول طلب", peak: "موسم الذروة" },
    },
    sabya: {
      eyebrow: "صبيا · جازان",
      title: "800 م² مجهزة بكل المكونات اللازمة",
      sub: "مركزنا اللوجستي في صبيا: توصيل حتى الباب في أنحاء جازان، ونقل بري شمالاً إلى المدن الكبرى.",
      approx: "التكلفة التقريبية للطلب · 1 كجم اليوم التالي",
      local: "داخل صبيا",
      major: "من صبيا إلى المدن الكبرى",
      cta: "اسأل عن صبيا",
      wa: "مرحباً مسج هورايزونز، أريد الشحن من صبيا.",
    },
  },
};
