import type { Locale } from "@/content/i18n";
import { facts } from "@/content/facts";

/**
 * The outro of the peak-control graph (components/enterprise/PeakControl.tsx): MSG's record, then its leadership.
 *
 * Achievements come only from facts.ts (verified). A leader appears only once their portrait is in
 * public/leadership/ (see `photo`); until then the outro shows the achievements alone.
 * Names are left empty until MSG confirms them. The quotes are DRAFTS written for the CEO and COO to approve
 * or rewrite before their portraits go in.
 */

export type LeaderId = "ceo" | "coo";

export const LEADERS: { id: LeaderId; photo: string; name: Record<Locale, string> | null }[] = [
  { id: "ceo", photo: "leadership/ceo.jpg", name: null },
  { id: "coo", photo: "leadership/coo.jpg", name: null },
];

type Copy = {
  open: string;
  replay: string;
  eyebrow: string;
  title: string;
  /** the title while no portrait has been supplied yet */
  titleRecord: string;
  achievements: { v: string; l: string }[];
  roles: Record<LeaderId, string>;
  quotes: Record<LeaderId, string>;
};

const m = facts.metrics;

export const leadershipCopy: Record<Locale, Copy> = {
  en: {
    open: "Behind every peak",
    replay: "Replay the season",
    eyebrow: "Behind every peak",
    title: "The record, and the people who keep it.",
    titleRecord: "The record behind every peak.",
    achievements: [
      { v: m.couriers.display, l: "couriers on the network" },
      { v: m.vehicles.display, l: "vehicles in the fleet" },
      { v: m.revenueSAR.display, l: "annual revenue" },
      { v: String(facts.partners.length), l: "partner networks" },
      { v: `${facts.sabyaHub.areaM2.toLocaleString("en-US")} m²`, l: "Sabya hub" },
      { v: m.operations.display, l: "operations" },
    ],
    roles: { ceo: "Chief Executive Officer", coo: "Chief Operating Officer" },
    quotes: {
      ceo: "Every order a seller hands us is a promise to their customer. We built MSG to keep that promise at every door, in every city, every day.",
      coo: "Peaks are planned, not survived. We forecast, ready the people and vehicles, and stand them down cleanly, so service holds when it matters most.",
    },
  },
  ar: {
    open: "خلف كل ذروة",
    replay: "أعد تشغيل الموسم",
    eyebrow: "خلف كل ذروة",
    title: "السجل، والفريق الذي يحافظ عليه.",
    titleRecord: "السجل خلف كل ذروة.",
    achievements: [
      { v: m.couriers.display, l: "مندوب في الشبكة" },
      { v: m.vehicles.display, l: "مركبة في الأسطول" },
      { v: m.revenueSAR.display.replace("SAR", "ريال"), l: "إيرادات سنوية" },
      { v: String(facts.partners.length), l: "شبكات شريكة" },
      { v: `${facts.sabyaHub.areaM2.toLocaleString("en-US")} م²`, l: "مركز صبيا" },
      { v: m.operations.display, l: "تشغيل" },
    ],
    roles: { ceo: "الرئيس التنفيذي", coo: "الرئيس التنفيذي للعمليات" },
    quotes: {
      ceo: "كل طلب يسلّمنا إياه البائع وعدٌ لعميله. بنينا ام اس جي لنفي بهذا الوعد عند كل باب، في كل مدينة، كل يوم.",
      coo: "الذروات تُخطَّط ولا تُترك للصدفة. نتوقّع الطلب، ونجهّز الفرق والمركبات، ثم نعيدها بانضباط، ليبقى مستوى الخدمة ثابتاً حين يكون أهم.",
    },
  },
};
