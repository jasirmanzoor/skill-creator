import type { Locale } from "@/content/i18n";

/**
 * Copy and geography for the planner's route console. The console shows how a shipment moves under
 * each of MSG's working models; it names no times, prices or facilities beyond MSG's Riyadh hub
 * (Al Malaz) and the Sabya logistics centre.
 */

export const MODELS = ["door", "b2b", "dropoff", "e2e"] as const;
export type Model = (typeof MODELS)[number];

export const CITIES = ["riyadh", "jeddah", "makkah", "madinah", "dammam", "ahsa", "buraidah", "hail", "tabuk", "taif", "abha", "najran", "sabya"] as const;
export type City = (typeof CITIES)[number];

export const SITES = ["riyadh", "sabya"] as const;
export type Site = (typeof SITES)[number];

/** Riyadh is shown by district (matching the city map); other cities by part of town. */
export const AREAS: Record<"riyadh" | "other", { id: string; fx: number; fy: number }[]> = {
  riyadh: [
    { id: "olaya", fx: 0.3, fy: 0.3 },
    { id: "kingfahd", fx: 0.2, fy: 0.58 },
    { id: "malaz", fx: 0.55, fy: 0.5 },
    { id: "rawdah", fx: 0.78, fy: 0.72 },
    { id: "naseem", fx: 0.86, fy: 0.28 },
    { id: "sulay", fx: 0.42, fy: 0.84 },
  ],
  other: [
    { id: "centre", fx: 0.5, fy: 0.5 },
    { id: "north", fx: 0.5, fy: 0.16 },
    { id: "south", fx: 0.5, fy: 0.84 },
    { id: "east", fx: 0.86, fy: 0.5 },
    { id: "west", fx: 0.14, fy: 0.5 },
  ],
};
export const areasFor = (c: City) => AREAS[c === "riyadh" ? "riyadh" : "other"];
/** Where MSG's own sites sit on the city map. */
export const SITE_SPOT: Record<Site, { fx: number; fy: number }> = { riyadh: { fx: 0.6, fy: 0.46 }, sabya: { fx: 0.5, fy: 0.5 } };

export type StepKey =
  | "collect" | "load" | "bring" | "inbound" | "sort" | "store" | "order" | "pack" | "segregate"
  | "linehaul" | "lastmile" | "onedrop" | "cod" | "return";

type Copy = {
  title: string;
  sub: string;
  models: Record<Model, { t: string; d: string }>;
  from: string;
  fromFor: Record<"dropoff" | "e2e", string>;
  to: string;
  toB2b: string;
  site: string;
  siteFor: Record<"dropoff" | "e2e", string>;
  city: string;
  area: string;
  options: string;
  cod: string;
  returns: string;
  codOff: string;
  steps: Record<StepKey, string>;
  who: Record<"you" | "msg", string>;
  route: string;
  legs: string;
  handovers: string;
  vehicles: string;
  kinds: Record<"courier" | "van" | "truck", string>;
  play: string;
  pause: string;
  replay: string;
  view: Record<"city" | "kingdom" | "satellite" | "street", string>;
  legend: Record<"parcel" | "you" | "cash" | "back", string>;
  pins: { you: string; door: string; drop: string; cash: string; back: string };
  siteName: Record<Site, string>;
  cities: Record<City, string>;
  areas: Record<string, string>;
  note: string;
  canvasLabel: string;
  live: string;
};

export const routeCopy: Record<Locale, Copy> = {
  en: {
    title: "Route console",
    sub: "Pick a working model and your two ends. The map plays the route.",
    models: {
      door: { t: "Door to door", d: "We collect from you and deliver to your customer." },
      b2b: { t: "One-point drop", d: "B2B: your load to one store, branch or site." },
      dropoff: { t: "Drop at MSG", d: "You drop at our site; we deliver door to door." },
      e2e: { t: "End to end", d: "Stock with MSG: orders packed, sorted, delivered, cash and returns handled." },
    },
    from: "Pick up from",
    fromFor: { dropoff: "You are in", e2e: "Stock ships from" },
    to: "Deliver to",
    toB2b: "Drop point",
    site: "MSG site",
    siteFor: { dropoff: "You drop parcels at", e2e: "Your stock is held at" },
    city: "City",
    area: "Area",
    options: "Add to the route",
    cod: "Cash on delivery remittance",
    returns: "Returns of failed deliveries",
    codOff: "Not used for B2B drops",
    steps: {
      collect: "MSG courier collects from you in {from}",
      load: "Your load is collected in {from}",
      bring: "You drop your parcels at the {site}",
      inbound: "Your stock arrives at the {site}",
      sort: "Sorted at the {site}",
      store: "Stored and counted on the shelf",
      order: "Your customer's order comes in",
      pack: "Picked and packed",
      segregate: "Segregated by destination city",
      linehaul: "Line-haul from {a} to {b}",
      lastmile: "Out for delivery in {to}: handed to your customer",
      onedrop: "Delivered to your drop point in {to}, signed for",
      cod: "Cash collected is remitted to you",
      return: "If delivery fails: returned to {back}",
    },
    who: { you: "You", msg: "MSG" },
    route: "Your route",
    legs: "Legs",
    handovers: "Steps",
    vehicles: "Vehicles",
    kinds: { courier: "Courier", van: "Van", truck: "Line-haul truck" },
    play: "Play",
    pause: "Pause",
    replay: "Replay",
    view: { city: "City view", kingdom: "Kingdom view", satellite: "Satellite", street: "Map" },
    legend: { parcel: "MSG moves it", you: "You or your customer", cash: "Cash to you", back: "Return" },
    pins: { you: "You", door: "Customer", drop: "Drop point", cash: "Cash to you", back: "Return" },
    siteName: { riyadh: "Riyadh hub", sabya: "Sabya centre" },
    cities: { riyadh: "Riyadh", jeddah: "Jeddah", makkah: "Makkah", madinah: "Madinah", dammam: "Dammam", ahsa: "Al Ahsa", buraidah: "Buraidah", hail: "Hail", tabuk: "Tabuk", taif: "Taif", abha: "Abha", najran: "Najran", sabya: "Sabya" },
    areas: { olaya: "Olaya", kingfahd: "King Fahd", malaz: "Al Malaz", rawdah: "Al Rawdah", naseem: "Al Naseem", sulay: "Al Sulay", centre: "Centre", north: "North", south: "South", east: "East", west: "West" },
    note: "Illustrative route, not live tracking. MSG confirms coverage and timing with your plan.",
    canvasLabel: "Map showing your chosen route step by step: pickup, MSG handling, line-haul between cities where needed, delivery, cash remittance and returns.",
    live: "Route playing",
  },
  ar: {
    title: "لوحة المسار",
    sub: "اختر نموذج العمل وطرفي الشحنة، وستعرض الخريطة المسار.",
    models: {
      door: { t: "من الباب إلى الباب", d: "نستلم منك ونوصّل إلى عميلك." },
      b2b: { t: "تسليم لنقطة واحدة", d: "للشركات: شحنتك إلى متجر أو فرع أو موقع واحد." },
      dropoff: { t: "سلّمها في مسج", d: "تسلّم شحناتك في موقعنا، ونوصّلها إلى الأبواب." },
      e2e: { t: "حل متكامل", d: "مخزونك لدى مسج: تجهيز الطلبات وفرزها وتوصيلها، مع التحصيل والمرتجعات." },
    },
    from: "الاستلام من",
    fromFor: { dropoff: "موقعك في", e2e: "يُشحن المخزون من" },
    to: "التوصيل إلى",
    toB2b: "نقطة التسليم",
    site: "موقع مسج",
    siteFor: { dropoff: "تسلّم شحناتك في", e2e: "مخزونك محفوظ في" },
    city: "المدينة",
    area: "المنطقة",
    options: "أضف إلى المسار",
    cod: "تحويل مبالغ الدفع عند الاستلام",
    returns: "مرتجعات التوصيل المتعثر",
    codOff: "غير مستخدم في التسليم للشركات",
    steps: {
      collect: "مندوب مسج يستلم منك في {from}",
      load: "تُستلم شحنتك في {from}",
      bring: "تسلّم طرودك في {site}",
      inbound: "يصل مخزونك إلى {site}",
      sort: "الفرز في {site}",
      store: "التخزين والجرد على الرف",
      order: "يصل طلب عميلك",
      pack: "الالتقاط والتغليف",
      segregate: "الفرز حسب مدينة الوجهة",
      linehaul: "نقل بين المدن من {a} إلى {b}",
      lastmile: "خرج للتوصيل في {to}: تسليم إلى عميلك",
      onedrop: "تسليم موقّع إلى نقطة التسليم في {to}",
      cod: "تحويل المبالغ المحصّلة إليك",
      return: "إن تعذّر التسليم: يعود إلى {back}",
    },
    who: { you: "أنت", msg: "مسج" },
    route: "مسارك",
    legs: "المراحل",
    handovers: "الخطوات",
    vehicles: "المركبات",
    kinds: { courier: "مندوب", van: "فان", truck: "شاحنة بين المدن" },
    play: "تشغيل",
    pause: "إيقاف",
    replay: "إعادة",
    view: { city: "عرض المدينة", kingdom: "عرض المملكة", satellite: "قمر صناعي", street: "خريطة" },
    legend: { parcel: "مسج تنقلها", you: "أنت أو عميلك", cash: "المبالغ إليك", back: "مرتجع" },
    pins: { you: "أنت", door: "العميل", drop: "نقطة التسليم", cash: "المبالغ إليك", back: "مرتجع" },
    siteName: { riyadh: "محطة الرياض", sabya: "مركز صبيا" },
    cities: { riyadh: "الرياض", jeddah: "جدة", makkah: "مكة", madinah: "المدينة", dammam: "الدمام", ahsa: "الأحساء", buraidah: "بريدة", hail: "حائل", tabuk: "تبوك", taif: "الطائف", abha: "أبها", najran: "نجران", sabya: "صبيا" },
    areas: { olaya: "العليا", kingfahd: "الملك فهد", malaz: "الملز", rawdah: "الروضة", naseem: "النسيم", sulay: "السلي", centre: "الوسط", north: "الشمال", south: "الجنوب", east: "الشرق", west: "الغرب" },
    note: "مسار توضيحي وليس تتبعاً مباشراً. تؤكد مسج التغطية والمواعيد مع خطتك.",
    canvasLabel: "خريطة تعرض مسارك خطوة بخطوة: الاستلام، ومعالجة مسج، والنقل بين المدن عند الحاجة، والتوصيل، وتحويل المبالغ، والمرتجعات.",
    live: "المسار قيد العرض",
  },
};
