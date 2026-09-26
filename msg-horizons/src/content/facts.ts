/**
 * VERIFIED FACTS — single source of truth for every company claim on the site.
 *
 * Every value here is taken from `MSG_Horizons_Source_Material_Pack.md`
 * (2026 Company Profile = primary; 2025 Profile = operational/workforce detail).
 * Do not add a claim here unless it is backed by verified source material.
 * Unverified / conflicting items are tracked in `docs/CONTENT-NOTES.md`.
 */

export const facts = {
  name: "MSG Horizons",
  legalName: "MSG Horizons Company",
  nameAr: "مسج هورايزونز",
  tagline: "Leading Integrated Logistics Solutions in the Kingdom of Saudi Arabia", // 2026 cover

  metrics: {
    couriers: { value: 1000, display: "1,000+", source: "2026 profile — Key Performance Metrics" },
    vehicles: { value: 100, display: "100+", source: "2026 profile — Logistics & Fleet Management" },
    revenueSAR: { value: 20_000_000, display: "SAR 20M+", source: "2026 profile — Key Performance Metrics" },
    operations: { display: "24/7", source: "2026 profile — Key Performance Metrics" },
  },

  corporate: {
    legalStatus: "Limited Liability Company (LLC)",
    commercialRegistration: "7052688707",
    establishmentNumber: "3144321875",
    taxId: "314432187500003",
    sector: "Logistics & Integrated Solutions",
    headquarters: "Riyadh, Kingdom of Saudi Arabia",
    // Establishment date intentionally omitted: the source lists "11-04-1446 AH (01/12/2025)",
    // and the growth trajectory starts 2024 Q1. Flagged in docs/CONTENT-NOTES.md.
  },

  contact: {
    phoneDisplay: "+966 55 895 1422",
    phoneE164: "+966558951422",
    whatsapp: "966558951422", // same number as the published phone — confirm it is WhatsApp-enabled
    email: "info@msg-horizons.com",
    street: "Al Malaz",
    city: "Riyadh",
    postalCode: "12836",
    country: "SA",
    addressDisplay: "Al Malaz, Riyadh 12836, Kingdom of Saudi Arabia",
  },

  /** "Our Valued Partners" — 2026 profile. Text only; no third-party logos without permission. */
  partners: ["AJEX", "Keeta", "iMile", "Logistiqa", "J&T Express"],

  /** Services promoted on the website. Customs Clearance is excluded by project instruction. */
  services: [
    "last-mile",
    "warehousing",
    "land-freight",
    "fleet",
    "manpower",
    "tracking",
    "account",
  ] as const,

  /** 2025 profile — Workforce Capability. */
  workforceStages: ["source", "screen", "onboard", "train"] as const,
  /** 2025 profile — Peak Demand Management. */
  peakStages: ["forecast", "ready", "mobilize", "control", "demobilize"] as const,
  /** 2025 profile — roles. */
  roles: 7,
} as const;

export type ServiceId = (typeof facts.services)[number];

export const whatsappLink = (text?: string) =>
  `https://wa.me/${facts.contact.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://msg-horizons.vercel.app").replace(/\/$/, "");
