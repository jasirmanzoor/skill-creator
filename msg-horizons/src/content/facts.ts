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
  nameAr: "ام اس جي هورايزونز",
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
    // Enquiries and WhatsApp: 057 806 1556, confirmed by MSG (Sept 2026). Replaces the profile's 055 895 1422.
    phoneDisplay: "+966 57 806 1556",
    phoneE164: "+966578061556",
    whatsapp: "966578061556",
    email: "info@msg-horizons.com",
    street: "Al Malaz",
    city: "Riyadh",
    postalCode: "12836",
    country: "SA",
    addressDisplay: "Al Malaz, Riyadh 12836, Kingdom of Saudi Arabia",
  },

  /** MSG's Sabya hub (Jazan), confirmed by MSG on 6 Oct 2026. */
  sabyaHub: { areaM2: 1000, fleet: "MSG-owned Toyota Hiace vans", drivers: "in-house", coverageKm2: 300_000 },
  /** iMile franchise outlet owned and run by MSG (6 Oct 2026): walk-in parcel kiosk, delivery within 5 km. */
  outlet: { brand: "iMile", model: "franchise", deliveryRadiusKm: 5 },

  /** "Our Valued Partners" — 2026 profile. Text only; no third-party logos without permission. */
  /**
   * MSG's own online store, supplied by MSG on 26 Oct 2026 ("our existing ecommerce business site"). A Salla store for
   * perfumes and beauty; the VAT number printed on perfmix.com is corporate.taxId. Category links are the store's own.
   * The store's wording is its own: nothing about its prices, promotions or shipping is repeated on this site.
   */
  ownStore: {
    name: "Perfmix",
    nameAr: "بيرفمكس",
    url: "https://perfmix.com",
    categories: { mens: "https://perfmix.com/category/yNaZwD", unisex: "https://perfmix.com/category/voGnjo", alternatives: "https://perfmix.com/category/XRyxnY" },
  },
  partners: ["AJEX", "Keeta", "iMile", "Logistiq", "J&T Express", "Naqel", "Landmark"],
  /** Official licences and certificates, as supplied by MSG on 8 Nov 2026, with the number and dates printed on each. */
  licences: [
    { id: "cr", number: "7052688707", issued: "24/11/2025" },
    { id: "vat", number: "314432187500003", issued: "01/12/2025" },
    { id: "transport", number: "60/00017336", issued: "04/08/2026", validTo: "03/10/2026" },
    { id: "chamber", number: "1219759", issued: "24/11/2025", validTo: "23/11/2026" },
    { id: "gosi", number: "105454077", issued: "25/11/2025", validTo: "05/07/1447 AH" },
    { id: "nitaqat", number: "204702-17117975", issued: "28/04/2026", validTo: "27/07/2026" },
    { id: "address", number: "1084425604", issued: "20/04/2026", validTo: "17/10/2026" },
    { id: "extract", number: "7052688707", issued: "26/11/2025", validTo: "23/11/2026" },
  ] as { id: "cr" | "extract" | "vat" | "chamber" | "gosi" | "nitaqat" | "transport" | "address"; number: string; issued: string; validTo?: string }[],


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
