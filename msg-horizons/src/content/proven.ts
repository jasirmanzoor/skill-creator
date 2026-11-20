import type { Locale } from "./i18n";
import { facts } from "./facts";

/**
 * For businesses already running: what MSG has in place today, each figure from facts.ts. Shown as an orbit
 * (components/ui/OrbitShowcase) in the enterprise chapter. No customer quotes until MSG supplies real ones.
 */
const P = (image: string, pos?: string) => ({ image, pos });
const m = facts.metrics;

export const provenCopy: Record<Locale, {
  eyebrow: string; title: string; lead: string; label: string; prev: string; next: string;
  items: { id: string; image: string; pos?: string; label: string; figure: string; text: string; note?: string }[];
}> = {
  en: {
    eyebrow: "For proven businesses",
    title: "Already running at the scale you need.",
    lead: "Moving an existing operation is a risk. These are the parts MSG already has in place, today.",
    label: "What MSG already runs",
    prev: "Previous", next: "Next",
    items: [
      { id: "fleet", ...P("/media/msg/fleet-hub.webp", "50% 60%"), label: "Own fleet", figure: m.vehicles.display, text: "Vehicles in MSG's own fleet: our vans and in-house drivers, not a pool of strangers.", note: "Owned and run by MSG" },
      { id: "couriers", ...P("/media/photos/lastmile.webp", "55% 45%"), label: "Couriers", figure: m.couriers.display, text: "Couriers behind every delivery, from city streets to remote villages." },
      { id: "hub", ...P("/media/msg/hub-racks.webp"), label: "Sabya hub", figure: `${facts.sabyaHub.areaM2.toLocaleString("en-US")} m²`, text: "Our own hub in Sabya: racks for your stock, cages for sorting and a floor ready for dispatch." },
      { id: "ops", ...P("/media/msg/hub-team.webp", "60% 55%"), label: "Operations", figure: m.operations.display, text: "Operations that never close, with one accountable team on every order." },
      { id: "revenue", ...P("/media/msg/facade.jpg", "50% 45%"), label: "Annual revenue", figure: m.revenueSAR.display, text: "A Riyadh logistics company with the scale to carry your volume, licensed and VAT-registered." },
      { id: "partners", ...P("/media/msg/hub-sorting.webp"), label: "Partner networks", figure: String(facts.partners.length), text: `Networks MSG runs alongside: ${facts.partners.join(", ")}.` },
    ],
  },
  ar: {
    eyebrow: "للأعمال القائمة",
    title: "نعمل اليوم بالحجم الذي تحتاجه.",
    lead: "نقل عملية قائمة مخاطرة. هذه هي الأجزاء التي تملكها ام اس جي وتعمل بها اليوم.",
    label: "ما تديره ام اس جي اليوم",
    prev: "السابق", next: "التالي",
    items: [
      { id: "fleet", ...P("/media/msg/fleet-hub.webp", "50% 60%"), label: "أسطولنا", figure: m.vehicles.display, text: "مركبات في أسطول ام اس جي: مركباتنا ومناديبنا من داخل الشركة، لا مقاولون مجهولون.", note: "ملك ام اس جي وبإدارتها" },
      { id: "couriers", ...P("/media/photos/lastmile.webp", "55% 45%"), label: "المناديب", figure: m.couriers.display, text: "مندوب خلف كل توصيلة، من شوارع المدن إلى القرى النائية." },
      { id: "hub", ...P("/media/msg/hub-racks.webp"), label: "مركز صبيا", figure: `${facts.sabyaHub.areaM2.toLocaleString("en-US")} م²`, text: "مركزنا في صبيا: رفوف لمخزونك، وأقفاص للفرز، وأرضية جاهزة للشحن." },
      { id: "ops", ...P("/media/msg/hub-team.webp", "60% 55%"), label: "العمليات", figure: m.operations.display, text: "عمليات لا تتوقف، وفريق واحد مسؤول عن كل طلب." },
      { id: "revenue", ...P("/media/msg/facade.jpg", "50% 45%"), label: "الإيرادات السنوية", figure: m.revenueSAR.display, text: "شركة لوجستية في الرياض بحجم يحمل طلباتك، مرخّصة ومسجّلة في ضريبة القيمة المضافة." },
      { id: "partners", ...P("/media/msg/hub-sorting.webp"), label: "الشبكات الشريكة", figure: String(facts.partners.length), text: `شبكات تعمل ام اس جي معها: ${facts.partners.join("، ")}.` },
    ],
  },
};
