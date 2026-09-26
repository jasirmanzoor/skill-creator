import type { Locale } from "@/content/i18n";
import type { Cargo, Persona, Volume } from "@/lib/planner";

/** Visual labels for the planner operating canvas. Facts only — no SLAs or prices. */
export const planVisual: Record<
  Locale,
  {
    live: string;
    idleStatus: string;
    hq: string;
    ops: string;
    trackingOn: string;
    trackingOff: string;
    stages: { id: "origin" | "hub" | "road" | "door"; label: string }[];
    status: Record<"idle" | "origin" | "hub" | "road" | "door" | "delivered", string>;
    scans: Record<"idle" | "origin" | "hub" | "road" | "door" | "delivered", string[]>;
    cargoMark: Record<Cargo, string>;
    personaMark: Record<Persona, string>;
    volumeMark: Record<Volume, string>;
    captionIdle: string;
    captionLive: string;
    delivered: string;
    canvasLabel: string;
  }
> = {
  en: {
    live: "Live network",
    idleStatus: "Waiting on the first answer",
    hq: "Riyadh · Al Malaz",
    ops: "operations",
    trackingOn: "Live tracking on",
    trackingOff: "Tracking on every shipment",
    stages: [
      { id: "origin", label: "Pickup" },
      { id: "hub", label: "Hub" },
      { id: "road", label: "On route" },
      { id: "door", label: "Door" },
    ],
    status: {
      idle: "Network standing by",
      origin: "Order accepted at origin",
      hub: "Sorted at the Riyadh hub",
      road: "Out with an MSG courier",
      door: "Approaching the door",
      delivered: "Handed to the customer",
    },
    scans: {
      idle: ["Select who you are — the route lights from there."],
      origin: ["Scan · accepted at origin", "Seller handoff logged"],
      hub: ["Scan · arrived Riyadh hub", "Sortation in progress"],
      road: ["Scan · out for delivery", "Courier assigned · live"],
      door: ["Scan · at the door", "Proof of delivery ready"],
      delivered: ["Delivered · signed at the door", "One owner from store to handoff"],
    },
    cargoMark: {
      parcels: "Parcels to the door",
      b2b: "Site-to-site freight",
      freight: "Heavy road load",
      storage: "Warehouse in the loop",
      people: "People on the shift",
    },
    personaMark: {
      seller: "Seller origin",
      startup: "Launch origin",
      ecommerce: "Brand origin",
      enterprise: "Enterprise origin",
      platform: "Platform origin",
    },
    volumeMark: {
      starting: "First orders",
      steady: "Daily flow",
      scaling: "Scaling wave",
      high: "Peak traffic",
    },
    captionIdle: "This is the operating picture. Your answers move the parcel.",
    captionLive: "Illustrative journey — the same hops MSG runs from Riyadh.",
    delivered: "At the door",
    canvasLabel:
      "Animated last-mile canvas showing a parcel travelling from pickup in Riyadh through the hub and out to the customer door.",
  },
  ar: {
    live: "شبكة حية",
    idleStatus: "بانتظار أول إجابة",
    hq: "الرياض · الملز",
    ops: "تشغيل",
    trackingOn: "التتبع مفعّل",
    trackingOff: "تتبع على كل شحنة",
    stages: [
      { id: "origin", label: "الاستلام" },
      { id: "hub", label: "المحطة" },
      { id: "road", label: "في الطريق" },
      { id: "door", label: "الباب" },
    ],
    status: {
      idle: "الشبكة في الانتظار",
      origin: "الطلب قُبل في نقطة الانطلاق",
      hub: "فُرز في محطة الرياض",
      road: "مع مندوب مسج",
      door: "يقترب من الباب",
      delivered: "سُلّم للعميل",
    },
    scans: {
      idle: ["اختر من أنت — المسار يضيء من هنا."],
      origin: ["مسح · قُبل في نقطة الانطلاق", "تم تسجيل تسليم البائع"],
      hub: ["مسح · وصل محطة الرياض", "الفرز جارٍ"],
      road: ["مسح · خرج للتوصيل", "المندوب معيّن · مباشر"],
      door: ["مسح · عند الباب", "إثبات التسليم جاهز"],
      delivered: ["تم التسليم · توقيع عند الباب", "مالك واحد من المتجر حتى التسليم"],
    },
    cargoMark: {
      parcels: "طرود إلى الباب",
      b2b: "شحن بين المواقع",
      freight: "حمل ثقيل على الطريق",
      storage: "المستودع ضمن المسار",
      people: "فريق على الوردية",
    },
    personaMark: {
      seller: "انطلاق البائع",
      startup: "انطلاق الإطلاق",
      ecommerce: "انطلاق العلامة",
      enterprise: "انطلاق المنشأة",
      platform: "انطلاق المنصة",
    },
    volumeMark: {
      starting: "أولى الطلبات",
      steady: "تدفق يومي",
      scaling: "موجة توسع",
      high: "حركة ذروة",
    },
    captionIdle: "هذه صورة التشغيل. إجاباتك تحرّك الطرد.",
    captionLive: "مسار توضيحي — نفس المحطات التي تشغّلها مسج من الرياض.",
    delivered: "عند الباب",
    canvasLabel: "لوحة حية لمسار الميل الأخير: طرد يتحرك من الاستلام في الرياض عبر المحطة حتى باب العميل.",
  },
};
