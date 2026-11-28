import type { Locale } from "./i18n";
import type { Lane } from "./redsea";
import type { ExtraId } from "@/lib/quote";
import type { Origin } from "@/lib/sizer";

/**
 * Copy for the plan builder (components/sections/Planner.tsx): one screen where every input reprices the plan live.
 * Prices come only from MSG's rate card; anything it does not cover is labelled as confirmed by MSG.
 */
type Copy = {
  console: string;
  open: string;
  close: string;
  launchTitle: string;
  launchLead: string;
  launchPoints: string[];
  quickStart: string;
  groups: { you: string; move: string; volume: string; route: string; service: string; matters: string };
  mattersHint: string;
  origin: string;
  origins: Record<Origin, string>;
  dest: string;
  dests: { riyadh: string; multi: string; kingdom: string };
  split: string; // {n}
  ordersMinus: string;
  ordersPlus: string;
  ordersInput: string;
  window: string;
  profile: string;
  profileHint: string;
  stock: string;
  live: string;
  ref: string;
  seeQuote: string;
  quote: {
    title: string;
    month: string;
    perOrder: string;
    year: string;
    day: string;
    peakDay: string; // {x}
    lanes: Record<Lane, string>;
    shipments: string; // {n} {rate}
    tierReached: string; // {saving}
    tierToGo: string; // {n} {saving}
    tierLabel: string; // {n}
    extrasTitle: string;
    extras: Record<ExtraId, string>;
    byMsg: string;
    perShipment: string; // {rate}
    basis: string;
    noVat: string;
  };
  plan: { title: string; core: string; addon: string; why: string };
  lock: {
    cta: string;
    title: string;
    body: string;
    name: string;
    phone: string;
    phoneHint: string;
    company: string;
    optional: string;
    consent: string;
    submit: string;
    sending: string;
    back: string;
    done: string; // {ref}
    doneBody: string;
    handoff: string;
    errors: { required: string; phone: string; consent: string; network: string };
  };
  whatsapp: string;
  copy: string;
  copied: string;
  reset: string;
  summary: {
    intro: string;
    ref: string;
    profile: string;
    orders: string; // {n}
    peak: string; // {x}
    route: string;
    cod: string; // {n}
    stock: string;
    quote: string;
    byMsg: string;
    services: string;
  };
};

export const studioCopy: Record<Locale, Copy> = {
  en: {
    console: "MSG Plan Studio",
    open: "Open the plan builder",
    close: "Close the plan builder",
    launchTitle: "Your plan and your price, built live.",
    launchLead: "Every choice you make reprices the plan as you go: who you are, what you move, how much, where it goes and how fast. You get one screen, MSG's own rate card and a quote reference you can lock in.",
    launchPoints: ["Priced from MSG's rate card", "Each lane itemised", "Volume-tier savings", "Lock it with one tap"],
    quickStart: "Start as",
    groups: { you: "You", move: "What you move", volume: "Volume", route: "Route", service: "Service", matters: "What matters" },
    mattersHint: "Up to three",
    origin: "Ship from",
    origins: { riyadh: "Riyadh", sabya: "Sabya hub" },
    dest: "Deliver to",
    dests: { riyadh: "Same city", multi: "Both", kingdom: "Other cities" },
    split: "{n}% go to other cities",
    ordersMinus: "Fewer orders",
    ordersPlus: "More orders",
    ordersInput: "Orders on a normal day",
    window: "Delivery",
    profile: "Parcels",
    profileHint: "The rate card prices 1 kg parcels",
    stock: "MSG holds my stock",
    live: "Live",
    ref: "Quote",
    seeQuote: "See quote",
    quote: {
      title: "Your quote",
      month: "a month",
      perOrder: "per order",
      year: "a year",
      day: "Normal day",
      peakDay: "Busiest day ({x})",
      lanes: { intra: "Same city", inter: "City to city", sabyaLocal: "Inside Sabya", sabyaMajor: "Sabya → major cities" },
      shipments: "{n} × SAR {rate}",
      tierReached: "Volume rate unlocked: you save SAR {saving} a month",
      tierToGo: "{n} more shipments a month unlock the volume rate, saving SAR {saving}",
      tierLabel: "Volume rate from {n} a month",
      extrasTitle: "Added to your quote by MSG",
      extras: {
        cod: "Cash on delivery",
        sameday: "Same-day delivery",
        weight: "Parcels over 1 kg",
        storage: "Storage and fulfilment",
        returns: "Returns, if any",
      },
      byMsg: "Confirmed by MSG",
      perShipment: "SAR {rate} each",
      basis: "From MSG's 1 kg next-day rate card at your monthly volume. An approximate quote, confirmed by MSG's team.",
      noVat: "Excl. VAT",
    },
    plan: { title: "Your services", core: "Core", addon: "Recommended", why: "Why" },
    lock: {
      cta: "Lock this quote",
      title: "Lock this quote with MSG",
      body: "MSG's team gets your full plan and quote reference, and contacts you to confirm it.",
      name: "Your name",
      phone: "Mobile",
      phoneHint: "05X XXX XXXX",
      company: "Company",
      optional: "optional",
      consent: "MSG may contact me on WhatsApp or by phone about this quote.",
      submit: "Send to MSG",
      sending: "Sending…",
      back: "Back",
      done: "Quote {ref} is with MSG",
      doneBody: "MSG's team will contact you to confirm it. You can also message them now.",
      handoff: "We couldn't reach MSG from here. Send it on WhatsApp instead and nothing is lost.",
      errors: { required: "Please fill this in.", phone: "Please enter a valid mobile number.", consent: "Please tick to let MSG contact you.", network: "That didn't send. Please try again or use WhatsApp." },
    },
    whatsapp: "WhatsApp",
    copy: "Copy link",
    copied: "Link copied",
    reset: "Reset",
    summary: {
      intro: "Hello MSG Horizons, here is my plan and quote:",
      ref: "Quote reference",
      profile: "Profile",
      orders: "{n} orders a day",
      peak: "Busiest day {x} a normal day",
      route: "Route",
      cod: "{n}% cash on delivery",
      stock: "MSG holds my stock",
      quote: "Approximate quote",
      byMsg: "to be confirmed by MSG",
      services: "Services",
    },
  },
  ar: {
    console: "استوديو خطط ام اس جي",
    open: "افتح منشئ الخطة",
    close: "إغلاق منشئ الخطة",
    launchTitle: "خطتك وسعرك، يُبنيان مباشرة.",
    launchLead: "كل اختيار تقوم به يعيد تسعير الخطة فوراً: من أنت، وماذا تنقل، وكم، وإلى أين، وبأي سرعة. شاشة واحدة، وجدول أسعار ام اس جي نفسه، ورقم عرض سعر يمكنك تثبيته.",
    launchPoints: ["مسعّر من جدول أسعار ام اس جي", "كل مسار بنده الخاص", "توفير شريحة الحجم", "ثبّته بلمسة واحدة"],
    quickStart: "ابدأ بصفتك",
    groups: { you: "أنت", move: "ماذا تنقل", volume: "الحجم", route: "المسار", service: "الخدمة", matters: "ما يهمك" },
    mattersHint: "حتى ثلاثة",
    origin: "الشحن من",
    origins: { riyadh: "الرياض", sabya: "مركز صبيا" },
    dest: "التوصيل إلى",
    dests: { riyadh: "نفس المدينة", multi: "كلاهما", kingdom: "مدن أخرى" },
    split: "{n}% تذهب إلى مدن أخرى",
    ordersMinus: "طلبات أقل",
    ordersPlus: "طلبات أكثر",
    ordersInput: "الطلبات في يوم عادي",
    window: "التوصيل",
    profile: "الطرود",
    profileHint: "جدول الأسعار يسعّر طرود 1 كجم",
    stock: "ام اس جي تحفظ مخزوني",
    live: "مباشر",
    ref: "عرض السعر",
    seeQuote: "اعرض السعر",
    quote: {
      title: "عرض السعر",
      month: "شهرياً",
      perOrder: "للطلب",
      year: "سنوياً",
      day: "يوم عادي",
      peakDay: "أكثر الأيام ازدحاماً ({x})",
      lanes: { intra: "داخل المدينة", inter: "بين المدن", sabyaLocal: "داخل صبيا", sabyaMajor: "من صبيا إلى المدن الكبرى" },
      shipments: "{n} × {rate} ريال",
      tierReached: "سعر الحجم مفعّل: توفّر {saving} ريال شهرياً",
      tierToGo: "{n} شحنة إضافية شهرياً تفعّل سعر الحجم وتوفّر {saving} ريال",
      tierLabel: "سعر الحجم من {n} شحنة شهرياً",
      extrasTitle: "تضيفها ام اس جي إلى عرضك",
      extras: {
        cod: "الدفع عند الاستلام",
        sameday: "التوصيل في نفس اليوم",
        weight: "طرود أثقل من 1 كجم",
        storage: "التخزين وتجهيز الطلبات",
        returns: "المرتجعات إن وُجدت",
      },
      byMsg: "تؤكده ام اس جي",
      perShipment: "{rate} ريال للشحنة",
      basis: "من جدول أسعار ام اس جي لطرود 1 كجم والتوصيل في اليوم التالي، حسب حجمك الشهري. عرض تقريبي يؤكده فريق ام اس جي.",
      noVat: "غير شامل الضريبة",
    },
    plan: { title: "خدماتك", core: "أساسية", addon: "موصى بها", why: "لماذا" },
    lock: {
      cta: "ثبّت عرض السعر",
      title: "ثبّت عرض السعر مع ام اس جي",
      body: "يتلقى فريق ام اس جي خطتك كاملة ورقم عرض السعر، ويتواصل معك لتأكيده.",
      name: "الاسم",
      phone: "الجوال",
      phoneHint: "05X XXX XXXX",
      company: "الشركة",
      optional: "اختياري",
      consent: "أوافق على أن تتواصل معي ام اس جي عبر واتساب أو الهاتف بخصوص هذا العرض.",
      submit: "أرسل إلى ام اس جي",
      sending: "جارٍ الإرسال…",
      back: "رجوع",
      done: "عرض السعر {ref} لدى ام اس جي",
      doneBody: "سيتواصل معك فريق ام اس جي لتأكيده. ويمكنك مراسلتهم الآن أيضاً.",
      handoff: "تعذّر الوصول إلى ام اس جي من هنا. أرسله عبر واتساب ولن يضيع شيء.",
      errors: { required: "يرجى تعبئة هذا الحقل.", phone: "يرجى إدخال رقم جوال صحيح.", consent: "يرجى الموافقة لتتواصل معك ام اس جي.", network: "لم يتم الإرسال. حاول مرة أخرى أو استخدم واتساب." },
    },
    whatsapp: "واتساب",
    copy: "نسخ الرابط",
    copied: "تم نسخ الرابط",
    reset: "إعادة ضبط",
    summary: {
      intro: "مرحباً ام اس جي هورايزونز، هذه خطتي وعرض السعر:",
      ref: "رقم عرض السعر",
      profile: "النشاط",
      orders: "{n} طلب يومياً",
      peak: "أكثر الأيام ازدحاماً {x} يوم عادي",
      route: "المسار",
      cod: "{n}% دفع عند الاستلام",
      stock: "ام اس جي تحفظ مخزوني",
      quote: "عرض سعر تقريبي",
      byMsg: "تؤكده ام اس جي",
      services: "الخدمات",
    },
  },
};
