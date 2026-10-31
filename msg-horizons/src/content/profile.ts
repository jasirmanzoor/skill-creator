import { facts } from "./facts";
import type { Locale } from "./i18n";

/**
 * THE COMPANY PROFILE (app/[lang]/company-profile): every word of MSG's one-page profile, curated from the site's
 * dictionaries and facts.ts, in both languages. Built on the "Selene" landing template MSG supplied (27 Oct 2026): a
 * dawn over Riyadh opens it (HORIZONS), then a day at the hub as a reel of stills, the network drawn across the
 * Kingdom, three ways to work with MSG, the scale, and the first conversation. Figures come from facts.ts only.
 */

type Card = { tag: string; title: string; body: string; image: string; pos?: string };
type Leg = { tag: string; title: string; body: string };
type Path = { name: string; who: string; lines: string[]; cta: string; featured?: boolean };

export type ProfileCopy = {
  meta: { title: string; description: string };
  nav: { label: string; href: string }[];
  talk: string;
  menu: string;
  close: string;
  hero: { title: string; kicker: string; site: string; clockLabel: string; sunLabel: string; sunUnit: string; crewLabel: string; dust: string; scroll: string };
  day: { eyebrow: string; heading: string; body: string; cards: Card[] };
  web: string;
  network: { eyebrow: string; heading: string; deckHeading: string; counterLabel: string; counterUnit: string; legs: Leg[]; riyadh: string; sabya: string; legWord: string; mapLabel: string };
  paths: { eyebrow: string; heading: string; note: string; items: Path[]; servicesTitle: string };
  scale: { eyebrow: string; heading: string; metrics: { value: number; prefix?: string; suffix: string; label: string; d: string; text?: string }[]; partners: string; vision: string; visionTitle: string; vision2030: string };
  contact: {
    eyebrow: string; heading: string; body: string; clockLabel: string; clockNote: string;
    name: string; namePh: string; company: string; companyPh: string; service: string; send: string; invalid: string; sent: string;
    corporate: { label: string; value: string; ltr?: boolean }[];
    email: string; whatsapp: string;
  };
  footer: { line: string; back: string; site: string };
  services: { id: (typeof facts.services)[number]; name: string }[];
};

const card = (image: string, pos?: string) => ({ image, pos });

export const profileCopy: Record<Locale, ProfileCopy> = {
  en: {
    meta: {
      title: "Company profile",
      description: "MSG Horizons in one page: last-mile delivery, warehousing, land freight and people across Saudi Arabia, from Riyadh. 1,000+ couriers, 100+ vehicles, 24/7.",
    },
    nav: [
      { label: "The day", href: "#day" },
      { label: "Network", href: "#network" },
      { label: "Work with us", href: "#paths" },
      { label: "Scale", href: "#scale" },
    ],
    web: "www.msg-horizons.com",
    talk: "Talk to MSG",
    menu: "Menu",
    close: "Close",
    hero: {
      title: "HORIZONS",
      kicker: "Integrated logistics · Kingdom of Saudi Arabia",
      site: "Al Malaz, Riyadh · 24.66°N 46.73°E",
      clockLabel: "Riyadh time",
      sunLabel: "Sun",
      sunUnit: "above the horizon",
      crewLabel: "Couriers on the network",
      dust: "Scroll to clear the dust",
      scroll: "Scroll",
    },
    day: {
      eyebrow: "Who we are",
      heading: "One accountable operation, from the shelf to the door.",
      body: "MSG Horizons runs last-mile delivery, warehousing, land freight and people as one operation for online sellers, e-commerce brands and enterprises. Based in Riyadh. Operating 24/7.",
      cards: [
        { tag: "Receive", title: "Into the hub", body: "Stock checked in at MSG's own hub, ready to move.", ...card("/media/msg/hub-open.webp", "50% 55%") },
        { tag: "Sort", title: "By zone", body: "Every parcel sorted at the tables, route by route.", ...card("/media/photos/sorting.webp", "45% 55%") },
        { tag: "Dispatch", title: "Out for dispatch", body: "Loaded pallet by pallet, and out of the door.", ...card("/media/photos/dispatch.webp", "38% 55%") },
        { tag: "Route", title: "On the road", body: "Each courier leaves with the route on his phone.", ...card("/media/photos/courier-route.webp", "30% 55%") },
        { tag: "Deliver", title: "At the door", body: "Into the customer's hands, tracked to the last metre.", ...card("/media/photos/lastmile.webp", "55% 50%") },
      ],
    },
    network: {
      eyebrow: "The network",
      heading: "From Riyadh to the far south, drawn as you scroll.",
      deckHeading: "From Riyadh to the far south.",
      counterLabel: "Covered from the Sabya hub",
      counterUnit: "km²",
      legs: [
        { tag: "Riyadh", title: "Headquarters", body: "Planning, dispatch control and the account team, in Al Malaz." },
        { tag: "Line haul", title: "Land freight", body: "Door-to-door road freight within cities and across regions." },
        { tag: "Jazan", title: "The Sabya hub", body: "MSG's own 1,000 m² hub, with MSG-owned vans and in-house drivers." },
        { tag: "Last mile", title: "To the door", body: "Up to 300,000 km² reached from Sabya, delivered and tracked." },
      ],
      riyadh: "RIYADH",
      sabya: "SABYA",
      legWord: "Leg",
      mapLabel: "Map of Saudi Arabia: a route drawn from the Riyadh headquarters south to MSG's Sabya hub, then out across the area it covers.",
    },
    paths: {
      eyebrow: "Work with MSG",
      heading: "Three ways in. One partner accountable for all of it.",
      note: "Use one service, or combine all seven.",
      items: [
        { name: "Sellers", who: "Individual sellers and new startups", lines: ["Your first orders, delivered reliably", "Real-time tracking on every shipment", "Grow without switching partners"], cta: "Start on WhatsApp" },
        { name: "Brands", who: "Growing e-commerce brands", lines: ["Last-mile delivery at volume", "Warehousing with smart inventory control", "Peak capacity planned ahead"], cta: "Plan my operation", featured: true },
        { name: "Enterprise", who: "Enterprises, retailers and platforms", lines: ["Couriers, drivers and hub teams on demand", "Seven roles, deployed under governance", "One dedicated account team"], cta: "Discuss requirements" },
      ],
      servicesTitle: "The seven services",
    },
    scale: {
      eyebrow: "At a glance",
      heading: "Scale you can see. Standards you can trust.",
      metrics: [
        { value: facts.metrics.couriers.value, suffix: "+", label: "Active couriers & specialists", d: "Workforce depth" },
        { value: facts.metrics.vehicles.value, suffix: "+", label: "Specialised vehicles", d: "Last-mile to heavy freight" },
        { value: 24, suffix: "/7", label: "Operations & support", d: "Round-the-clock coverage", text: "24/7" },
        { value: 20, prefix: "SAR ", suffix: "M+", label: "Annual revenue", d: "Sustainable growth" },
      ],
      partners: "Valued partners",
      visionTitle: "Our vision",
      vision: "To be a hub for the logistics services sector in the Kingdom, contributing to the goals of Vision 2030 by providing smart, fast and safe logistics services.",
      vision2030: "Aligned with Saudi Vision 2030",
    },
    contact: {
      eyebrow: "The first conversation",
      heading: "Let's move what matters.",
      body: "Tell us what you move and where. MSG replies on WhatsApp with a setup shaped around your volumes.",
      clockLabel: "Right now in Riyadh",
      clockNote: "and MSG operations are running.",
      name: "Your name",
      namePh: "Full name",
      company: "Company",
      companyPh: "Store or company name",
      service: "What you need",
      send: "Send on WhatsApp",
      invalid: "Your name and company, please.",
      sent: "WhatsApp should be open with your message drafted.",
      corporate: [
        { label: "Headquarters", value: facts.contact.addressDisplay },
        { label: "Commercial registration", value: facts.corporate.commercialRegistration, ltr: true },
        { label: "VAT number", value: facts.corporate.taxId, ltr: true },
      ],
      email: facts.contact.email,
      whatsapp: facts.contact.phoneDisplay,
    },
    footer: { line: `${facts.legalName} · Riyadh, Kingdom of Saudi Arabia`, back: "Back to the dawn ↑", site: "Visit the website" },
    services: [
      { id: "last-mile", name: "Shipping & Last-Mile Delivery" },
      { id: "warehousing", name: "Warehousing & Inventory" },
      { id: "land-freight", name: "Land Freight" },
      { id: "fleet", name: "Fleet Management" },
      { id: "manpower", name: "Manpower & Peak Support" },
      { id: "tracking", name: "Real-Time Tracking & Support" },
      { id: "account", name: "Dedicated Account Management" },
    ],
  },
  ar: {
    meta: {
      title: "الملف التعريفي",
      description: "ام اس جي هورايزونز في صفحة واحدة: توصيل الميل الأخير والتخزين والشحن البري والقوى العاملة في أنحاء المملكة، من الرياض. أكثر من 1,000 مندوب و100 مركبة، على مدار الساعة.",
    },
    nav: [
      { label: "يومنا", href: "#day" },
      { label: "الشبكة", href: "#network" },
      { label: "اعمل معنا", href: "#paths" },
      { label: "الحجم", href: "#scale" },
    ],
    web: "www.msg-horizons.com",
    talk: "تحدث مع ام اس جي",
    menu: "القائمة",
    close: "إغلاق",
    hero: {
      title: "HORIZONS",
      kicker: "حلول لوجستية متكاملة · المملكة العربية السعودية",
      site: "الملز، الرياض · 24.66° شمالًا 46.73° شرقًا",
      clockLabel: "توقيت الرياض",
      sunLabel: "الشمس",
      sunUnit: "فوق الأفق",
      crewLabel: "مندوب على الشبكة",
      dust: "مرّر لإزالة الغبار",
      scroll: "مرّر",
    },
    day: {
      eyebrow: "من نحن",
      heading: "عملية واحدة مسؤولة، من الرف حتى الباب.",
      body: "تدير ام اس جي هورايزونز توصيل الميل الأخير والتخزين والشحن البري والقوى العاملة كعملية واحدة للبائعين عبر الإنترنت وعلامات التجارة الإلكترونية والشركات. مقرنا الرياض، ونعمل على مدار الساعة.",
      cards: [
        { tag: "الاستلام", title: "إلى المركز", body: "يُسجَّل المخزون في مركز ام اس جي، جاهزًا للانطلاق.", ...card("/media/msg/hub-open.webp", "50% 55%") },
        { tag: "الفرز", title: "حسب المنطقة", body: "يُفرز كل طرد على الطاولات، مسارًا بمسار.", ...card("/media/photos/sorting.webp", "45% 55%") },
        { tag: "الإرسال", title: "في طريقها للتوزيع", body: "تُحمَّل طبلية بعد طبلية، وتخرج من الباب.", ...card("/media/photos/dispatch.webp", "38% 55%") },
        { tag: "المسار", title: "على الطريق", body: "ينطلق كل مندوب والمسار على هاتفه.", ...card("/media/photos/courier-route.webp", "30% 55%") },
        { tag: "التسليم", title: "عند الباب", body: "في يد العميل، مع تتبع حتى آخر متر.", ...card("/media/photos/lastmile.webp", "55% 50%") },
      ],
    },
    network: {
      eyebrow: "الشبكة",
      heading: "من الرياض إلى أقصى الجنوب، تُرسم مع التمرير.",
      deckHeading: "من الرياض إلى أقصى الجنوب.",
      counterLabel: "المساحة المغطاة من مركز صبيا",
      counterUnit: "كم²",
      legs: [
        { tag: "الرياض", title: "المقر الرئيسي", body: "التخطيط والتحكم في الإرسال وفريق الحساب، في حي الملز." },
        { tag: "النقل بين المدن", title: "الشحن البري", body: "شحن بري من الباب إلى الباب داخل المدن وبين المناطق." },
        { tag: "جازان", title: "مركز صبيا", body: "مركز ام اس جي بمساحة 1,000 م²، بشاحنات تملكها ام اس جي وسائقين من فريقها." },
        { tag: "الميل الأخير", title: "حتى الباب", body: "حتى 300,000 كم² من صبيا، توصيلًا وتتبعًا." },
      ],
      riyadh: "الرياض",
      sabya: "صبيا",
      legWord: "المرحلة",
      mapLabel: "خريطة المملكة: مسار يُرسم من المقر الرئيسي في الرياض جنوبًا إلى مركز ام اس جي في صبيا، ثم عبر المنطقة التي يغطيها.",
    },
    paths: {
      eyebrow: "اعمل مع ام اس جي",
      heading: "ثلاث طرق للبدء. وشريك واحد مسؤول عن كل شيء.",
      note: "استخدم خدمة واحدة، أو اجمع الخدمات السبع.",
      items: [
        { name: "البائعون", who: "البائعون الأفراد والشركات الناشئة", lines: ["طلباتك الأولى، بتوصيل موثوق", "تتبع مباشر لكل شحنة", "انمُ دون تغيير شريكك"], cta: "ابدأ على واتساب" },
        { name: "العلامات", who: "علامات التجارة الإلكترونية المتنامية", lines: ["توصيل الميل الأخير بأحجام كبيرة", "تخزين مع تحكم ذكي في المخزون", "سعة مخططة مسبقًا لمواسم الذروة"], cta: "خطّط لعملياتي", featured: true },
        { name: "الشركات", who: "الشركات وتجار التجزئة والمنصات", lines: ["مناديب وسائقون وفرق مراكز عند الطلب", "سبعة أدوار، بانتشار منضبط", "فريق حساب مخصص"], cta: "ناقش متطلباتك" },
      ],
      servicesTitle: "الخدمات السبع",
    },
    scale: {
      eyebrow: "لمحة سريعة",
      heading: "حجم تراه. ومعايير تثق بها.",
      metrics: [
        { value: facts.metrics.couriers.value, prefix: "+", suffix: "", label: "مندوب ومتخصص نشط", d: "عمق في القوى العاملة" },
        { value: facts.metrics.vehicles.value, prefix: "+", suffix: "", label: "مركبة متخصصة", d: "من الميل الأخير إلى الشحن الثقيل" },
        { value: 24, suffix: "/7", label: "عمليات ودعم", d: "تغطية على مدار الساعة", text: "24/7" },
        { value: 20, prefix: "+", suffix: " مليون ريال", label: "إيرادات سنوية", d: "نمو مستدام" },
      ],
      partners: "شركاؤنا",
      visionTitle: "رؤيتنا",
      vision: "أن نكون مركزًا لقطاع الخدمات اللوجستية في المملكة، ونسهم في تحقيق أهداف رؤية 2030 بتقديم خدمات لوجستية ذكية وسريعة وآمنة.",
      vision2030: "متوافقون مع رؤية السعودية 2030",
    },
    contact: {
      eyebrow: "المحادثة الأولى",
      heading: "لننقل ما يهمك.",
      body: "أخبرنا بما تنقله وإلى أين. ترد ام اس جي على واتساب بإعداد مصمم حول أحجامك.",
      clockLabel: "الآن في الرياض",
      clockNote: "وعمليات ام اس جي تعمل.",
      name: "اسمك",
      namePh: "الاسم الكامل",
      company: "الشركة",
      companyPh: "اسم المتجر أو الشركة",
      service: "ما تحتاجه",
      send: "أرسل على واتساب",
      invalid: "اسمك واسم شركتك من فضلك.",
      sent: "يُفترض أن يكون واتساب مفتوحًا ورسالتك جاهزة.",
      corporate: [
        { label: "المقر الرئيسي", value: "الملز، الرياض 12836، المملكة العربية السعودية" },
        { label: "السجل التجاري", value: facts.corporate.commercialRegistration, ltr: true },
        { label: "الرقم الضريبي", value: facts.corporate.taxId, ltr: true },
      ],
      email: facts.contact.email,
      whatsapp: facts.contact.phoneDisplay,
    },
    footer: { line: "شركة ام اس جي هورايزونز · الرياض، المملكة العربية السعودية", back: "العودة إلى الفجر ↑", site: "زر الموقع" },
    services: [
      { id: "last-mile", name: "الشحن وتوصيل الميل الأخير" },
      { id: "warehousing", name: "التخزين وإدارة المخزون" },
      { id: "land-freight", name: "الشحن البري" },
      { id: "fleet", name: "إدارة الأسطول" },
      { id: "manpower", name: "القوى العاملة ودعم الذروة" },
      { id: "tracking", name: "التتبع المباشر والدعم" },
      { id: "account", name: "إدارة حساب مخصصة" },
    ],
  },
};

/** MSG's valued partners (2026 profile), with the logos already licensed for the site (public/partners). */
export const PARTNER_LOGOS: { name: string; src?: string }[] = [
  { name: "AJEX", src: "/partners/ajex.png" },
  { name: "Keeta", src: "/partners/keeta.png" },
  { name: "iMile", src: "/partners/imile.png" },
  { name: "Logistiq", src: "/partners/logistiq.png" },
  { name: "J&T Express", src: "/partners/jt-express.png" },
  { name: "Naqel", src: "/partners/naqel.png" },
  { name: "Landmark" },
];
