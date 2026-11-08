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
      extract: { name: "Commercial Registration extract", issuer: "Ministry of Commerce" },
      gosi: { name: "GOSI certificate", issuer: "General Organization for Social Insurance" },
      nitaqat: { name: "Saudization certificate (Nitaqat)", issuer: "Ministry of Human Resources and Social Development" },
      transport: { name: "Light goods transport licence", issuer: "Transport General Authority" },
      address: { name: "National Address proof", issuer: "Saudi Post · National Address" },
    },
  },
  ar: {
    title: "مرخّصون ومسجّلون",
    number: "رقم", issued: "تاريخ الإصدار", validTo: "سارية حتى", active: "نشط",
    items: {
      cr: { name: "السجل التجاري", issuer: "وزارة التجارة" },
      vat: { name: "شهادة التسجيل في ضريبة القيمة المضافة", issuer: "هيئة الزكاة والضريبة والجمارك" },
      chamber: { name: "عضوية الغرفة التجارية", issuer: "غرفة الرياض" },
      extract: { name: "مستخرج السجل التجاري", issuer: "وزارة التجارة" },
      gosi: { name: "شهادة التأمينات الاجتماعية", issuer: "المؤسسة العامة للتأمينات الاجتماعية" },
      nitaqat: { name: "شهادة التوطين (نطاقات)", issuer: "وزارة الموارد البشرية والتنمية الاجتماعية" },
      transport: { name: "ترخيص النقل الخفيف للبضائع", issuer: "الهيئة العامة للنقل" },
      address: { name: "إثبات العنوان الوطني", issuer: "سبل · العنوان الوطني" },
    },
  },
};

export const LICENCES = facts.licences;
/** the ones valid today, for places that say \"Active\" */
export const ACTIVE_LICENCES = facts.licences.filter((l) => l.active);
