import type { Locale } from "@/content/i18n";
import type { ServiceId } from "@/content/facts";

/**
 * Words for the small live panel each service carries over its photo (components/services/ServiceView.tsx).
 * They describe what the service does, step by step; none of them is a count or a claim. Captioned illustrative.
 */
type Hud = { title: string; a: string; b: string; c?: string };

export const serviceHud: Record<Locale, { note: string; details: string; of: string; hud: Record<ServiceId, Hud> }> = {
  en: {
    note: "Illustrative",
    details: "Service details",
    of: "of",
    hud: {
      "last-mile": { title: "Out for delivery", a: "Courier on the way", b: "Delivered · photo proof" },
      warehousing: { title: "Your stock", a: "Picked from the shelf", b: "Inventory synced" },
      "land-freight": { title: "Line-haul", a: "Riyadh", b: "Jeddah" },
      fleet: { title: "Telematics live", a: "Route optimised", b: "Vehicle checked" },
      manpower: { title: "Peak roster", a: "Couriers", b: "Site supervisors", c: "Peak cover" },
      tracking: { title: "Live tracking", a: "Driver accepted", b: "On the way", c: "Delivered" },
      account: { title: "Your account team", a: "One contact for every question", b: "Report ready" },
    },
  },
  ar: {
    note: "توضيحي",
    details: "تفاصيل الخدمة",
    of: "من",
    hud: {
      "last-mile": { title: "خرج للتوصيل", a: "المندوب في الطريق", b: "تم التسليم · صورة إثبات" },
      warehousing: { title: "مخزونك", a: "تم الالتقاط من الرف", b: "المخزون محدّث" },
      "land-freight": { title: "نقل بين المدن", a: "الرياض", b: "جدة" },
      fleet: { title: "تتبع المركبات مباشرة", a: "مسار محسّن", b: "تم فحص المركبة" },
      manpower: { title: "جدول الذروة", a: "المناديب", b: "مشرفو المواقع", c: "تغطية الذروة" },
      tracking: { title: "تتبع مباشر", a: "المندوب قبل الطلب", b: "في الطريق", c: "تم التسليم" },
      account: { title: "فريق حسابك", a: "جهة اتصال واحدة لكل سؤال", b: "التقرير جاهز" },
    },
  },
};
