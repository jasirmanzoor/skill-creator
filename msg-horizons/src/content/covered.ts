import type { Locale } from "./i18n";

/**
 * What a plan covers, in the client's terms: the four things they ask for first (a price quote, proof of delivery,
 * live tracking, cash on delivery on time) and the six areas MSG handles behind the scenes. Stated by MSG on
 * 6 Oct 2026 (see docs/CONTENT-NOTES.md). No percentages, no times, and nothing about customs.
 */
export const MUSTS = ["quote", "pod", "tracking", "cod"] as const;
export const PILLARS = ["legal", "infrastructure", "licences", "team", "visibility", "record"] as const;
export type MustId = (typeof MUSTS)[number];
export type PillarId = (typeof PILLARS)[number];
type Item<K extends string> = { id: K; t: string; d: string };

export const coveredCopy: Record<Locale, {
  musts: Item<MustId>[];
  pillars: Item<PillarId>[];
  ui: { included: string; handled: string; handledLead: string; quoteTitle: string; unit: string };
}> = {
  en: {
    musts: [
      { id: "quote", t: "Price quote", d: "A clear written quote for your volume, agreed before go-live." },
      { id: "pod", t: "Proof of delivery", d: "A verified record of every delivery, so nothing is left to argue about." },
      { id: "tracking", t: "Live tracking", d: "Your driver approves, then you and your customer follow the delivery live." },
      { id: "cod", t: "Cash on delivery, on time", d: "Cash collected at the door and remitted with a statement, on the schedule in your contract." },
    ],
    pillars: [
      { id: "legal", t: "Legal", d: "Our legal team keeps every operation inside the Kingdom's laws, and updates it as they change." },
      { id: "infrastructure", t: "Compliant infrastructure", d: "Our own warehouses, line-haul vehicles and delivery fleet, run on compliant processes with ZATCA-compliant tax filing and VAT paid." },
      { id: "licences", t: "Licences", d: "The licences the government requires for each activity, already in place." },
      { id: "team", t: "People and resources", d: "Couriers, drivers, warehouse staff and operations managers, within labour regulations and ready from day one." },
      { id: "visibility", t: "Connectivity and visibility", d: "Your orders connected from pickup to the customer's door, with live tracking and proof of delivery." },
      { id: "record", t: "A proven record", d: "A working operation across the Kingdom, trusted by partners such as iMile, J&T Express and Keeta." },
    ],
    ui: {
      included: "Included in your plan",
      handled: "You focus on selling. MSG handles the rest.",
      handledLead: "Six things most new businesses struggle with, already done.",
      quoteTitle: "Your price quote",
      unit: "per order",
    },
  },
  ar: {
    musts: [
      { id: "quote", t: "عرض السعر", d: "عرض سعر مكتوب وواضح لحجمك، يُتفق عليه قبل الإطلاق." },
      { id: "pod", t: "إثبات التسليم", d: "سجل موثّق لكل عملية تسليم، فلا مجال للخلاف." },
      { id: "tracking", t: "التتبع المباشر", d: "يوافق المندوب، ثم تتابع أنت وعميلك التوصيل مباشرةً." },
      { id: "cod", t: "تحصيل النقد في وقته", d: "نقد يُحصَّل عند الباب ويُحوَّل مع كشف حساب، وفق الجدول المتفق عليه في عقدك." },
    ],
    pillars: [
      { id: "legal", t: "الجانب القانوني", d: "فريقنا القانوني يضمن بقاء كل عملية ضمن أنظمة المملكة، ويحدّثها كلما تغيّرت." },
      { id: "infrastructure", t: "بنية تشغيلية ملتزمة", d: "مستودعاتنا ومركبات النقل بين المدن وأسطول التوصيل المملوك لنا، بإجراءات ملتزمة وإقرارات ضريبية متوافقة مع الزكاة والضريبة (ZATCA) وضريبة القيمة المضافة مسددة." },
      { id: "licences", t: "التراخيص", d: "التراخيص التي تشترطها الجهات الحكومية لكل نشاط، جاهزة ومعتمدة." },
      { id: "team", t: "الفريق والموارد", d: "مناديب وسائقون وعاملو مستودعات ومديرو عمليات، وفق أنظمة العمل وجاهزون من اليوم الأول." },
      { id: "visibility", t: "الربط والرؤية الكاملة", d: "طلباتك مترابطة من الاستلام إلى باب العميل، مع تتبع مباشر وإثبات تسليم." },
      { id: "record", t: "سجل مُثبت", d: "عملية تشغيلية قائمة في أنحاء المملكة، وشركاء مثل iMile وJ&T Express وKeeta." },
    ],
    ui: {
      included: "مشمول في خطتك",
      handled: "ركّز على البيع، ونحن نتولى الباقي.",
      handledLead: "ستة أمور تعيق أغلب الأعمال الجديدة، أنجزناها لك.",
      quoteTitle: "عرض السعر الخاص بك",
      unit: "للطلب",
    },
  },
};
