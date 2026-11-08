import type { Locale } from "./i18n";
import { facts } from "./facts";

/** How each registration in facts.licences is named and who issued it, in both languages. */
export const licenceCopy: Record<Locale, {
  title: string; number: string; issued: string; validTo: string; active: string;
  items: Record<(typeof facts.licences)[number]["id"], { name: string; issuer: string }>;
}> = {
  en: {
    title: "Licensed and registered",
    number: "No.", issued: "Issued", validTo: "Valid to", active: "Active",
    items: {
      cr: { name: "Commercial Registration", issuer: "Ministry of Commerce" },
      vat: { name: "VAT Registration", issuer: "Zakat, Tax and Customs Authority (ZATCA)" },
      chamber: { name: "Chamber of Commerce membership", issuer: "Riyadh Chamber" },
    },
  },
  ar: {
    title: "مرخّصون ومسجّلون",
    number: "رقم", issued: "تاريخ الإصدار", validTo: "سارية حتى", active: "نشط",
    items: {
      cr: { name: "السجل التجاري", issuer: "وزارة التجارة" },
      vat: { name: "شهادة التسجيل في ضريبة القيمة المضافة", issuer: "هيئة الزكاة والضريبة والجمارك" },
      chamber: { name: "عضوية الغرفة التجارية", issuer: "غرفة الرياض" },
    },
  },
};

export const LICENCES = facts.licences;
