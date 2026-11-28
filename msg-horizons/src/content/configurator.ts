import type { Locale } from "./i18n";
import type { Persona } from "@/lib/planner";
import type { Area, DeliveryWindow } from "@/lib/sizer";

/**
 * Copy for the Build My Plan configurator (components/configurator). Option names, descriptions, services and
 * results keep coming from the dictionaries (t.planner) and the sizer copy, so nothing drifts from the rest of the
 * site; this file only holds the configurator's own voice: chapter titles, stage captions and the blueprint.
 * Nothing here states a price, a delivery time or a capacity: those come from the rate card or from MSG.
 */

export type ChapterId = "profile" | "volume" | "route" | "speed" | "services";
export const CHAPTER_IDS: ChapterId[] = ["profile", "volume", "route", "speed", "services"];

type Chapter = { label: string; title: string; lead: string; stage: string; stageLead: string };

type Copy = {
  brand: string;
  product: string;
  eyebrow: string;
  launchTitle: string;
  launchLead: string;
  start: string;
  close: string;
  chapters: Record<ChapterId, Chapter>;
  of: string; // {n} {total}
  back: string;
  next: string;
  reveal: string;
  swipe: string;
  edit: string;
  personaStage: Record<Persona, string>;
  volume: { custom: string; customHint: string; perDay: string; busiest: string; size: string; field: string; fieldNote: string; each: string };
  route: { note: string; areaLead: Record<Area, string>; hq: string; hub: string; cities: string };
  speed: {
    lead: Record<DeliveryWindow, string>;
    milestones: [string, string, string, string];
    day0: string;
    day1: string;
    slot: string;
    note: string;
  };
  services: { base: string; baseD: string; extras: string; matters: string; mattersHint: string; codShare: string; included: string };
  price: { title: string; perOrder: string; perMonth: string; confirm: string; confirmWindow: string; confirmProfile: string; reference: string; basis: string; conditions: string[] };
  blueprint: {
    eyebrow: string;
    title: string;
    lead: string;
    model: string;
    yourSetup: string;
    rows: { profile: string; volume: string; route: string; speed: string; services: string };
    servicesNone: string;
    peak: string; // {x}
    detail: string;
    run: string;
    runLead: string;
    request: string;
    requestLead: string;
  };
};

export const configuratorCopy: Record<Locale, Copy> = {
  en: {
    brand: "MSG Horizons",
    product: "Build your operation",
    eyebrow: "MSG / Build your operation",
    launchTitle: "Your logistics. Configured around you.",
    launchLead: "Five choices: your business, your volume, where it goes, how fast and what else MSG runs for you. Each one reshapes the plan and the estimate as you go.",
    start: "Start building my plan",
    close: "Close the plan builder",
    chapters: {
      profile: { label: "Business profile", title: "Built around your business.", lead: "Choose the profile that best describes your operation.", stage: "Your business. MSG's operation.", stageLead: "Five choices and you have a plan, an estimate from MSG's rate card and a team ready to run it." },
      volume: { label: "Order volume", title: "How much moves on a normal day?", lead: "A close estimate is enough. Type the number if you know it.", stage: "Your volume, in view.", stageLead: "Every mark is part of your normal day. The lighter ones are what your busiest day adds." },
      route: { label: "Delivery route", title: "Where do your orders go?", lead: "Pick the area your customers are in. The rate card prices each lane separately.", stage: "Where your orders go.", stageLead: "Riyadh headquarters and the Sabya hub are MSG's own. The destinations follow your choice." },
      speed: { label: "Delivery speed", title: "What do your customers expect?", lead: "The rate card prices next-day delivery. Other windows are confirmed by MSG.", stage: "From pickup to doorstep.", stageLead: "Each order is scanned at every step, and live tracking starts when the driver accepts." },
      services: { label: "Additional services", title: "What else should MSG run for you?", lead: "Switch on what you need. Delivery to customers is already in.", stage: "One partner, one operation.", stageLead: "Storage, cash collection, freight and people, run by the same team that delivers." },
    },
    of: "{n} / {total}",
    back: "Back",
    next: "Continue",
    reveal: "Build my plan",
    swipe: "Swipe to move between steps",
    edit: "Edit",
    personaStage: {
      seller: "At MSG's iMile outlet: parcels dropped off, labelled and on their way.",
      startup: "Your first orders, packed and dispatched from MSG's hub.",
      ecommerce: "Stock on MSG's racks, picked and packed the day it sells.",
      enterprise: "Sorting at the Sabya hub, run by MSG's own team.",
      platform: "MSG-owned vans and in-house drivers, ready to plug into your network.",
    },
    volume: {
      custom: "Orders on a normal day",
      customHint: "Type a number or use the slider",
      perDay: "a day",
      busiest: "Your busiest day",
      size: "Parcel size",
      field: "Your day",
      fieldNote: "Your own numbers, drawn to scale. Not an MSG capacity figure.",
      each: "1 mark = {n} orders",
    },
    route: {
      note: "Diagram. Riyadh and Sabya are at their true positions; destinations are illustrative and MSG confirms coverage for each city.",
      areaLead: {
        riyadh: "Same-city delivery inside Riyadh.",
        multi: "Riyadh plus orders to other cities, by road.",
        kingdom: "City-to-city delivery across the Kingdom.",
      },
      hq: "Riyadh HQ",
      hub: "Sabya hub",
      cities: "Your destinations",
    },
    speed: {
      lead: {
        nextday: "Picked up today, delivered tomorrow. This is the window MSG's rate card prices.",
        sameday: "Picked up and delivered the same day. Available where MSG confirms it for your area and volume.",
        scheduled: "Delivered in a slot your customer chooses. MSG confirms slots and pricing.",
      },
      milestones: ["Order in", "Picked up", "Hub scan", "Delivered"],
      day0: "Day 1",
      day1: "Day 2",
      slot: "Chosen slot",
      note: "Every step is scanned; proof of delivery with photo and signature.",
    },
    services: {
      base: "Delivery to customers",
      baseD: "Parcels to the doorstep, tracked live. Always part of your plan.",
      extras: "Add to your operation",
      matters: "What matters most",
      mattersHint: "Up to three",
      codShare: "Orders paid in cash",
      included: "Included in every plan",
    },
    price: {
      title: "Estimate",
      perOrder: "per order",
      perMonth: "About SAR {total} a month for {n} orders",
      confirm: "MSG confirms",
      confirmWindow: "The rate card prices next-day delivery only. MSG confirms this window in your quote.",
      confirmProfile: "The rate card prices 1 kg parcels only. MSG confirms other sizes in your quote.",
      reference: "Next-day 1 kg reference: ≈ SAR {n} per order",
      basis: "1 kg, next day, from MSG's rate card at your volume. Excludes VAT.",
      conditions: [
        "An estimate, not a quotation. MSG confirms every price in writing before go-live.",
        "Cash on delivery, storage and returns are priced in your quote.",
        "The rate card's lower tier applies from 299 shipments a month.",
      ],
    },
    blueprint: {
      eyebrow: "Your operational blueprint",
      title: "Your operation, configured.",
      lead: "Everything you chose, the estimate it produces and what MSG runs for you. Change any line and the plan updates.",
      model: "Operating model",
      yourSetup: "Your setup",
      rows: { profile: "Business", volume: "Volume", route: "Route", speed: "Speed", services: "Services" },
      servicesNone: "Delivery to customers only",
      peak: "busiest day {x}× normal",
      detail: "The detail",
      run: "See it run",
      runLead: "A live model of your plan on MSG's network: pickups, the hub, line haul and the last mile.",
      request: "Send this plan to MSG",
      requestLead: "MSG's team reviews it with you and replies with a written proposal.",
    },
  },
  ar: {
    brand: "ام اس جي هورايزونز",
    product: "ابنِ عملياتك",
    eyebrow: "ام اس جي / ابنِ عملياتك",
    launchTitle: "خدماتك اللوجستية، مُهيّأة حولك.",
    launchLead: "خمسة اختيارات: نشاطك، حجمك، وجهة طلباتك، سرعة التوصيل، وما تريد أن تديره ام اس جي لك. كل اختيار يعيد تشكيل الخطة والتقدير فورًا.",
    start: "ابدأ بناء خطتي",
    close: "إغلاق منشئ الخطة",
    chapters: {
      profile: { label: "نوع النشاط", title: "مبنية حول نشاطك.", lead: "اختر الوصف الأقرب إلى عملياتك.", stage: "نشاطك. وعمليات ام اس جي.", stageLead: "خمسة اختيارات وتحصل على خطة، وتقدير من جدول أسعار ام اس جي، وفريق جاهز للتنفيذ." },
      volume: { label: "حجم الطلبات", title: "كم طلبًا في يوم عادي؟", lead: "يكفي تقدير قريب. اكتب الرقم إن كنت تعرفه.", stage: "حجمك أمامك.", stageLead: "كل علامة جزء من يومك العادي، والعلامات الفاتحة ما يضيفه أكثر أيامك ازدحامًا." },
      route: { label: "مسار التوصيل", title: "إلى أين تذهب طلباتك؟", lead: "اختر المنطقة التي فيها عملاؤك. جدول الأسعار يسعّر كل مسار على حدة.", stage: "إلى أين تذهب طلباتك.", stageLead: "المقر في الرياض ومركز صبيا تابعان لام اس جي. الوجهات تتبع اختيارك." },
      speed: { label: "سرعة التوصيل", title: "ماذا يتوقع عملاؤك؟", lead: "جدول الأسعار يسعّر التوصيل في اليوم التالي. النوافذ الأخرى تؤكدها ام اس جي.", stage: "من الاستلام إلى الباب.", stageLead: "كل طلب يُمسح في كل خطوة، ويبدأ التتبع المباشر عند قبول المندوب." },
      services: { label: "خدمات إضافية", title: "ماذا تريد أن تديره ام اس جي أيضًا؟", lead: "فعّل ما تحتاجه. التوصيل للعملاء مشمول أصلًا.", stage: "شريك واحد، عمليات واحدة.", stageLead: "التخزين وتحصيل النقد والشحن والقوى العاملة، يديرها الفريق نفسه الذي يوصل." },
    },
    of: "{n} / {total}",
    back: "رجوع",
    next: "متابعة",
    reveal: "ابنِ خطتي",
    swipe: "اسحب للتنقل بين الخطوات",
    edit: "تعديل",
    personaStage: {
      seller: "في منفذ iMile الذي تديره ام اس جي: طرود تُسلَّم وتُلصق عليها البيانات وتنطلق.",
      startup: "أولى طلباتك، تُغلّف وتُشحن من مركز ام اس جي.",
      ecommerce: "مخزونك على رفوف ام اس جي، يُجهّز يوم بيعه.",
      enterprise: "الفرز في مركز صبيا بفريق ام اس جي.",
      platform: "مركبات تملكها ام اس جي وسائقون من فريقها، جاهزون للانضمام إلى شبكتك.",
    },
    volume: {
      custom: "الطلبات في يوم عادي",
      customHint: "اكتب رقمًا أو استخدم المؤشر",
      perDay: "يوميًا",
      busiest: "أكثر أيامك ازدحامًا",
      size: "حجم الطرد",
      field: "يومك",
      fieldNote: "أرقامك أنت، مرسومة بمقياس. ليست رقمًا لطاقة ام اس جي.",
      each: "علامة واحدة = {n} طلب",
    },
    route: {
      note: "رسم توضيحي. موقعا الرياض وصبيا حقيقيان؛ الوجهات توضيحية وتؤكد ام اس جي التغطية لكل مدينة.",
      areaLead: {
        riyadh: "توصيل داخل مدينة الرياض.",
        multi: "الرياض وطلبات إلى مدن أخرى برًا.",
        kingdom: "توصيل بين المدن في أنحاء المملكة.",
      },
      hq: "المقر · الرياض",
      hub: "مركز صبيا",
      cities: "وجهاتك",
    },
    speed: {
      lead: {
        nextday: "يُستلم اليوم ويُسلَّم غدًا. هذه النافذة التي يسعّرها جدول أسعار ام اس جي.",
        sameday: "يُستلم ويُسلَّم في اليوم نفسه، حيث تؤكده ام اس جي لمنطقتك وحجمك.",
        scheduled: "يُسلَّم في موعد يختاره عميلك. تؤكد ام اس جي المواعيد والسعر.",
      },
      milestones: ["وصول الطلب", "الاستلام", "المسح في المركز", "التسليم"],
      day0: "اليوم 1",
      day1: "اليوم 2",
      slot: "الموعد المختار",
      note: "كل خطوة تُمسح؛ وإثبات التسليم بصورة وتوقيع.",
    },
    services: {
      base: "التوصيل للعملاء",
      baseD: "طرود حتى الباب مع تتبع مباشر. جزء دائم من خطتك.",
      extras: "أضف إلى عملياتك",
      matters: "ما الأهم لك",
      mattersHint: "حتى ثلاثة",
      codShare: "الطلبات المدفوعة نقدًا",
      included: "مشمول في كل خطة",
    },
    price: {
      title: "التقدير",
      perOrder: "للطلب",
      perMonth: "نحو {total} ريال شهريًا لـ {n} طلب",
      confirm: "تؤكده ام اس جي",
      confirmWindow: "جدول الأسعار يسعّر التوصيل في اليوم التالي فقط. تؤكد ام اس جي هذه النافذة في عرضك.",
      confirmProfile: "جدول الأسعار يسعّر طرود 1 كجم فقط. تؤكد ام اس جي الأحجام الأخرى في عرضك.",
      reference: "مرجع اليوم التالي لطرد 1 كجم: ≈ {n} ريال للطلب",
      basis: "طرد 1 كجم، في اليوم التالي، من جدول أسعار ام اس جي لحجمك. غير شامل الضريبة.",
      conditions: [
        "تقدير وليس عرض سعر. تؤكد ام اس جي كل سعر كتابيًا قبل الإطلاق.",
        "الدفع عند الاستلام والتخزين والمرتجعات تُسعّر في عرضك.",
        "الفئة الأقل في جدول الأسعار تبدأ من 299 شحنة شهريًا.",
      ],
    },
    blueprint: {
      eyebrow: "مخطط عملياتك",
      title: "عملياتك، مُهيّأة.",
      lead: "كل ما اخترته، والتقدير الناتج عنه، وما تديره ام اس جي لك. عدّل أي سطر وتتحدث الخطة.",
      model: "نموذج التشغيل",
      yourSetup: "إعدادك",
      rows: { profile: "النشاط", volume: "الحجم", route: "المسار", speed: "السرعة", services: "الخدمات" },
      servicesNone: "التوصيل للعملاء فقط",
      peak: "أكثر الأيام ازدحامًا {x}× المعتاد",
      detail: "التفاصيل",
      run: "شاهدها تعمل",
      runLead: "نموذج حي لخطتك على شبكة ام اس جي: الاستلام والمركز والشحن بين المدن والميل الأخير.",
      request: "أرسل هذه الخطة إلى ام اس جي",
      requestLead: "يراجعها فريق ام اس جي معك ويرد بعرض مكتوب.",
    },
  },
};

/** MSG's own photographs (public/media/msg) for each business profile */
export const PERSONA_PHOTO: Record<Persona, { src: string; pos: string }> = {
  seller: { src: "/media/msg/outlet-counter.webp", pos: "50% 50%" },
  startup: { src: "/media/msg/hub-cartons.webp", pos: "50% 60%" },
  ecommerce: { src: "/media/msg/hub-racks.webp", pos: "50% 55%" },
  enterprise: { src: "/media/msg/hub-sorting.webp", pos: "50% 50%" },
  platform: { src: "/media/msg/fleet-hub-row.webp", pos: "55% 60%" },
};

/** the stage photograph for each chapter (the route chapter draws the Kingdom instead) */
export const CHAPTER_PHOTO: Record<Exclude<ChapterId, "route">, { src: string; pos: string }> = {
  profile: { src: "/media/msg/hub-open.webp", pos: "50% 55%" },
  volume: { src: "/media/msg/hub-floor.webp", pos: "45% 50%" },
  speed: { src: "/media/msg/fleet-hub-side.webp", pos: "45% 60%" },
  services: { src: "/media/msg/hub-team-scan.webp", pos: "50% 45%" },
};
