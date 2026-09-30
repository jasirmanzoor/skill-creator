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
export const PARTNER_TEXT = ["iMile", "J&T", "Keeta", "Landmark", "AJEX"];

type Copy = {
  network: {
    eyebrow: string;
    title: string;
    sub: string;
    stats: { v: string; l: string }[];
    partners: string;
    rateTitle: string;
    rateUnit: string;
    intra: string;
    inter: string;
    walkin: string;
    t299: string;
  };
  growth: {
    eyebrow: string;
    title: string[];
    lead: string;
    lane: string;
    lanes: Record<Lane, string>;
    orders: string;
    perMonth: string;
    band: string;
    walkinBand: string;
    tierBand: string;
    cur: string;
    perShipment: string;
    monthly: string;
    save: string;
    unlock: string;
    note: string;
    cta: string;
    wa: string;
    milestones: { first: string; tier: string; peak: string };
  };
  sabya: {
    eyebrow: string;
    title: string;
    sub: string;
    local: string;
    major: string;
    walkin: string;
    t299: string;
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
      rateTitle: "1 kg, next-day",
      rateUnit: "SAR per shipment",
      intra: "Intra-city",
      inter: "Inter-city",
      walkin: "Walk-in",
      t299: "299 a month",
    },
    growth: {
      eyebrow: "Growing with MSG Horizons",
      title: ["From your first order", "to your biggest peak season,", "MSG moves with you."],
      lead: "Move the slider to your monthly shipments. The price is read straight from MSG's 1 kg next-day rate card.",
      lane: "Where do they go?",
      lanes: { intra: "Same city", inter: "City to city", sabyaLocal: "Inside Sabya", sabyaMajor: "Sabya → major cities" },
      orders: "Shipments a month",
      perMonth: "a month",
      band: "Your band",
      walkinBand: "Walk-in",
      tierBand: "299 a month",
      cur: "SAR",
      perShipment: "per shipment",
      monthly: "Shipping, per month",
      save: "The 299 band saves you",
      unlock: "more shipments a month unlock the 299 band",
      note: "1 kg next-day. Cash on delivery, returns and same-day are quoted with your plan.",
      cta: "Lock this band on WhatsApp",
      wa: "Hello MSG Horizons, I ship about {n} a month ({lane}). I want the {band} band.",
      milestones: { first: "First order", tier: "299 a month", peak: "Peak season" },
    },
    sabya: {
      eyebrow: "Sabya · Jazan",
      title: "800 m² equipped with all necessary components",
      sub: "Our logistics centre in Sabya: doorstep delivery across Jazan, and line-haul north to the major cities.",
      local: "Sabya local",
      major: "To major cities",
      walkin: "Walk-in",
      t299: "299 a month",
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
      rateTitle: "1 كجم، اليوم التالي",
      rateUnit: "ريال للشحنة",
      intra: "داخل المدينة",
      inter: "بين المدن",
      walkin: "بدون اشتراك",
      t299: "299 شهرياً",
    },
    growth: {
      eyebrow: "النمو مع مسج هورايزونز",
      title: ["من أول طلب لك", "إلى أكبر مواسم الذروة،", "مسج تتحرك معك."],
      lead: "حرّك المؤشر إلى عدد شحناتك الشهرية. السعر مأخوذ مباشرة من جدول أسعار مسج لشحنة 1 كجم في اليوم التالي.",
      lane: "إلى أين تذهب؟",
      lanes: { intra: "داخل المدينة", inter: "بين المدن", sabyaLocal: "داخل صبيا", sabyaMajor: "من صبيا إلى المدن الكبرى" },
      orders: "الشحنات شهرياً",
      perMonth: "شهرياً",
      band: "شريحتك",
      walkinBand: "بدون اشتراك",
      tierBand: "299 شهرياً",
      cur: "ريال",
      perShipment: "للشحنة",
      monthly: "الشحن شهرياً",
      save: "توفّر لك شريحة 299",
      unlock: "شحنة إضافية شهرياً تفتح لك شريحة 299",
      note: "1 كجم، اليوم التالي. الدفع عند الاستلام والمرتجعات ونفس اليوم تُسعّر مع خطتك.",
      cta: "ثبّت هذه الشريحة عبر واتساب",
      wa: "مرحباً مسج هورايزونز، أشحن نحو {n} شهرياً ({lane}). أريد شريحة {band}.",
      milestones: { first: "أول طلب", tier: "299 شهرياً", peak: "موسم الذروة" },
    },
    sabya: {
      eyebrow: "صبيا · جازان",
      title: "800 م² مجهزة بكل المكونات اللازمة",
      sub: "مركزنا اللوجستي في صبيا: توصيل حتى الباب في أنحاء جازان، ونقل بري شمالاً إلى المدن الكبرى.",
      local: "داخل صبيا",
      major: "إلى المدن الكبرى",
      walkin: "بدون اشتراك",
      t299: "299 شهرياً",
      cta: "اسأل عن صبيا",
      wa: "مرحباً مسج هورايزونز، أريد الشحن من صبيا.",
    },
  },
};
