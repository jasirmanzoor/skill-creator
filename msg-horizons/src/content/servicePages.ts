import type { ServiceId } from "@/content/facts";
import type { Locale } from "@/content/i18n";

/**
 * Search landing pages — one per service cluster that Saudi buyers actually type into Google
 * (keyword clusters taken from Google's Saudi autocomplete, gl=sa, EN + AR, Sept 2026).
 *
 * Content rules match the rest of the site: every claim traces to src/content/facts.ts.
 * No prices, SLAs, delivery times, named cities beyond the Riyadh HQ, cash-on-delivery or customs.
 */

export const SERVICE_SLUGS = [
  "last-mile-delivery-saudi-arabia",
  "ecommerce-delivery-saudi-arabia",
  "warehousing-storage-riyadh",
  "land-freight-saudi-arabia",
  "fleet-management-saudi-arabia",
  "delivery-drivers-manpower-saudi-arabia",
] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export type ServicePage = {
  scene: ServiceId;
  persona: "seller" | "startup" | "ecommerce" | "enterprise" | "platform";
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  eyebrow: string;
  h1: string;
  lead: string;
  included: { t: string; d: string }[];
  forWho: string[];
  faqs: { q: string; a: string }[];
  related: ServiceSlug[];
};

type Chrome = {
  home: string;
  services: string;
  plan: string;
  whatsapp: string;
  includedTitle: string;
  forTitle: string;
  howTitle: string;
  how: { t: string; d: string }[];
  scaleTitle: string;
  scale: { v: string; l: string }[];
  faqTitle: string;
  relatedTitle: string;
  ctaTitle: string;
  ctaBody: string;
  langSwitch: string;
  waIntro: (h1: string) => string;
};

export const pageChrome: Record<Locale, Chrome> = {
  en: {
    home: "Home",
    services: "Services",
    plan: "Build my logistics plan",
    whatsapp: "Talk to MSG on WhatsApp",
    includedTitle: "What's included",
    forTitle: "Built for",
    howTitle: "How it works",
    how: [
      { t: "Tell us what you move", d: "Build your plan on the website in under a minute, or message MSG on WhatsApp." },
      { t: "We size the operation", d: "MSG's team reviews your volumes, areas and peaks with you." },
      { t: "Tailored proposal", d: "Scope, pricing and onboarding shaped around your operation." },
      { t: "Go live, tracked 24/7", d: "Shipments run with real-time tracking and responsive support." },
    ],
    scaleTitle: "The network behind it",
    scale: [
      { v: "1,000+", l: "couriers" },
      { v: "100+", l: "vehicles" },
      { v: "24/7", l: "operations" },
    ],
    faqTitle: "Questions buyers ask",
    relatedTitle: "Related services",
    ctaTitle: "Get a delivery setup sized to your numbers.",
    ctaBody: "Enter your daily orders and peak, and the planner calculates routes, couriers and structure — then send it to MSG in one tap.",
    langSwitch: "العربية",
    waIntro: (h1) => `Hello MSG Horizons, I'm interested in: ${h1}`,
  },
  ar: {
    home: "الرئيسية",
    services: "الخدمات",
    plan: "ابنِ خطتك اللوجستية",
    whatsapp: "تحدث مع MSG عبر واتساب",
    includedTitle: "ما الذي تشمله الخدمة",
    forTitle: "مصممة لـ",
    howTitle: "كيف تعمل",
    how: [
      { t: "أخبرنا بما تنقله", d: "ابنِ خطتك على الموقع في أقل من دقيقة، أو راسل MSG عبر واتساب." },
      { t: "نحدد حجم التشغيل", d: "يراجع فريق MSG معك حجم طلباتك ومناطقك وذرواتك." },
      { t: "عرض مخصص", d: "النطاق والتسعير والتشغيل مصممة حول عمليتك." },
      { t: "انطلق بتتبع ٢٤/٧", d: "شحناتك تعمل بتتبع لحظي ودعم سريع الاستجابة." },
    ],
    scaleTitle: "الشبكة التي تقف خلفها",
    scale: [
      { v: "1,000+", l: "مندوب" },
      { v: "100+", l: "مركبة" },
      { v: "24/7", l: "تشغيل" },
    ],
    faqTitle: "أسئلة يطرحها العملاء",
    relatedTitle: "خدمات ذات صلة",
    ctaTitle: "احصل على إعداد توصيل بحجم أرقامك.",
    ctaBody: "أدخل طلباتك اليومية وذروتك، وسيحسب المخطط المسارات والمناديب والهيكل، ثم أرسله إلى MSG بلمسة واحدة.",
    langSwitch: "English",
    waIntro: (h1) => `مرحباً MSG Horizons، أنا مهتم بـ: ${h1}`,
  },
};

const riyadhKingdomEn =
  "MSG Horizons is headquartered in Al Malaz, Riyadh, and moves shipments within cities and across regions of the Kingdom. Share your destinations and MSG confirms coverage for your routes.";
const riyadhKingdomAr =
  "يقع مقر MSG Horizons في حي الملز بالرياض، وتنقل الشحنات داخل المدن وبين مناطق المملكة. شارك وجهاتك وتؤكد MSG التغطية لمساراتك.";
const pricingEn =
  "Every MSG setup is tailored, so pricing is confirmed after MSG's team reviews your volumes and requirements. The website planner gives you a sized structure in under a minute, with no sign-up.";
const pricingAr =
  "كل إعداد لدى MSG مخصص، لذا يُؤكد السعر بعد أن يراجع فريق MSG حجم طلباتك ومتطلباتك. يمنحك المخطط على الموقع هيكلاً محسوباً في أقل من دقيقة ودون تسجيل.";

export const servicePages: Record<Locale, Record<ServiceSlug, ServicePage>> = {
  en: {
    "last-mile-delivery-saudi-arabia": {
      scene: "last-mile",
      persona: "ecommerce",
      metaTitle: "Last-Mile & Parcel Delivery Company in Saudi Arabia",
      metaDescription:
        "Last-mile parcel delivery across Saudi Arabia from a Riyadh-based courier company: 1,000+ couriers, 100+ vehicles, real-time tracking and 24/7 operations.",
      keywords: ["last mile delivery Saudi Arabia", "last mile delivery KSA", "parcel delivery Riyadh", "delivery company Riyadh", "courier company Riyadh", "parcel delivery KSA", "last mile delivery companies in Saudi Arabia"],
      eyebrow: "Shipping & last-mile delivery",
      h1: "Last-mile and parcel delivery across Saudi Arabia",
      lead:
        "From pickup to the customer's door, MSG Horizons runs the last mile with 1,000+ couriers, 100+ vehicles and real-time tracking on every shipment — operated from Riyadh, around the clock.",
      included: [
        { t: "Door-to-door parcel delivery", d: "Integrated distribution focused on fast, accurate and reliable delivery to your customers' doors." },
        { t: "Real-time tracking", d: "Advanced real-time shipment monitoring, backed by responsive 24/7 support." },
        { t: "Peak capacity", d: "Pre-qualified couriers planned ahead for campaigns and seasonal peaks." },
        { t: "One accountable team", d: "Dedicated account management that knows your operation." },
      ],
      forWho: ["Online sellers and social-media stores", "Growing e-commerce brands", "Retailers and enterprises", "Delivery platforms needing courier capacity"],
      faqs: [
        { q: "Does MSG Horizons deliver outside Riyadh?", a: riyadhKingdomEn },
        { q: "How many couriers does MSG Horizons have?", a: "MSG Horizons operates with 1,000+ couriers and 100+ vehicles, running 24/7 operations." },
        { q: "Can my customers track their parcels?", a: "Yes. Every MSG configuration includes real-time shipment tracking, supported by a responsive 24/7 team." },
        { q: "How much does last-mile delivery cost?", a: pricingEn },
      ],
      related: ["ecommerce-delivery-saudi-arabia", "warehousing-storage-riyadh", "delivery-drivers-manpower-saudi-arabia"],
    },
    "ecommerce-delivery-saudi-arabia": {
      scene: "tracking",
      persona: "seller",
      metaTitle: "E-commerce Delivery Partner for Online Stores in Saudi Arabia",
      metaDescription:
        "A delivery partner for online sellers, startups and e-commerce brands in KSA: order delivery, storage, tracking and peak capacity from a Riyadh logistics company.",
      keywords: ["e-commerce delivery Saudi Arabia", "delivery company for online stores KSA", "order delivery company Riyadh", "3PL Saudi Arabia", "logistics company in KSA", "delivery partner for startups Saudi"],
      eyebrow: "For sellers, startups and e-commerce",
      h1: "E-commerce delivery for online stores in Saudi Arabia",
      lead:
        "You sell; MSG Horizons takes the order to the door. From your first orders to your biggest sale day, one logistics partner in Riyadh handles delivery, storage and peaks — with tracking your customers can see.",
      included: [
        { t: "Order delivery to your customers", d: "Your orders delivered to the doorstep with real-time tracking behind every shipment." },
        { t: "Storage that grows with you", d: "Secure warehousing and smart inventory control when your stock needs a home." },
        { t: "Ready for campaigns", d: "Peak capacity planned ahead, so launch day doesn't become delivery chaos." },
        { t: "A plan in under a minute", d: "The website planner sizes routes and couriers from your own numbers." },
      ],
      forWho: ["Home-based and social-media sellers", "New startups launching online", "E-commerce brands with daily orders", "Marketplace sellers"],
      faqs: [
        { q: "I'm just starting. Is MSG Horizons for me?", a: "Yes. MSG Horizons works with sellers from their very first orders, and the setup grows with you so you never have to switch partners." },
        { q: "Can MSG store my products?", a: "Yes. MSG offers secure storage with smart inventory control as part of its warehousing and inventory service." },
        { q: "What happens on sale days and in Ramadan?", a: "MSG plans peak capacity ahead through its peak demand process: forecast, get ready, mobilise, control and demobilise." },
        { q: "How do I get a price?", a: pricingEn },
      ],
      related: ["last-mile-delivery-saudi-arabia", "warehousing-storage-riyadh", "land-freight-saudi-arabia"],
    },
    "warehousing-storage-riyadh": {
      scene: "warehousing",
      persona: "ecommerce",
      metaTitle: "Warehousing, Storage & Inventory Management in Riyadh",
      metaDescription:
        "Secure warehousing and inventory management in Riyadh, connected to last-mile delivery across Saudi Arabia. Store once and dispatch from one place.",
      keywords: ["warehouse Riyadh", "storage and delivery company", "inventory management Saudi Arabia", "parcel handling and storage KSA", "warehousing Riyadh", "storage and delivery Riyadh"],
      eyebrow: "Warehousing & inventory",
      h1: "Warehousing, storage and inventory management in Riyadh",
      lead:
        "Store your stock with MSG Horizons and dispatch from one place. Secure storage and smart inventory control, connected directly to MSG's delivery network — no separate pickup runs.",
      included: [
        { t: "Secure storage", d: "Your stock kept in a secure warehouse environment." },
        { t: "Smart inventory control", d: "Inventory managed to keep your supply chain running smoothly." },
        { t: "Dispatch from the warehouse", d: "Orders leave from where the stock already is, straight into last-mile routes." },
        { t: "Tracked end to end", d: "Real-time visibility with responsive 24/7 support." },
      ],
      forWho: ["E-commerce brands holding stock", "Retailers and distributors", "Startups outgrowing home storage", "Enterprises with multi-site supply chains"],
      faqs: [
        { q: "Where is MSG Horizons' base?", a: "MSG Horizons is headquartered in Al Malaz, Riyadh 12836, Kingdom of Saudi Arabia." },
        { q: "Can storage and delivery be combined?", a: "Yes. Warehousing and last-mile delivery are part of one logistics ecosystem, so orders dispatch from storage into delivery routes." },
        { q: "How much does storage cost?", a: pricingEn },
      ],
      related: ["ecommerce-delivery-saudi-arabia", "last-mile-delivery-saudi-arabia", "land-freight-saudi-arabia"],
    },
    "land-freight-saudi-arabia": {
      scene: "land-freight",
      persona: "enterprise",
      metaTitle: "Land Freight & Road Transport Within Saudi Arabia",
      metaDescription:
        "Door-to-door land freight within cities and across regions of Saudi Arabia, from last-mile loads to heavy freight, with 100+ vehicles and real-time monitoring.",
      keywords: ["land freight Saudi Arabia", "road freight KSA", "shipping within Saudi Arabia", "freight transport Riyadh", "transport company in KSA", "shipping and delivery in KSA"],
      eyebrow: "Land freight",
      h1: "Land freight and road transport within Saudi Arabia",
      lead:
        "Reliable door-to-door road transportation within cities and across regions. MSG's 100+ specialised vehicles cover everything from last-mile loads to heavy freight, monitored in real time.",
      included: [
        { t: "Door-to-door road freight", d: "Shipments moved by road within cities and across regions of the Kingdom." },
        { t: "Site-to-site transfers", d: "Stock moved between stores, branches, warehouses and cities." },
        { t: "Specialised fleet", d: "100+ vehicles, from last-mile to heavy freight." },
        { t: "Real-time monitoring", d: "Telematics and route optimisation behind every movement." },
      ],
      forWho: ["Retailers moving stock between branches", "Enterprises with multi-site operations", "E-commerce brands delivering beyond Riyadh", "Distributors and suppliers"],
      faqs: [
        { q: "Where does MSG Horizons transport freight?", a: riyadhKingdomEn },
        { q: "What vehicles does MSG use?", a: "MSG operates 100+ specialised vehicles covering last-mile loads through to heavy freight, with telematics, route optimisation and real-time monitoring." },
        { q: "How is land freight priced?", a: pricingEn },
      ],
      related: ["fleet-management-saudi-arabia", "warehousing-storage-riyadh", "last-mile-delivery-saudi-arabia"],
    },
    "fleet-management-saudi-arabia": {
      scene: "fleet",
      persona: "enterprise",
      metaTitle: "Fleet Management & Delivery Vehicles in Saudi Arabia",
      metaDescription:
        "Managed fleet of 100+ specialised vehicles in Saudi Arabia with telematics, route optimisation and real-time monitoring, operated 24/7 from Riyadh.",
      keywords: ["fleet management Saudi Arabia", "fleet management KSA", "delivery vehicles Riyadh", "logistics fleet Saudi Arabia", "vehicle telematics KSA"],
      eyebrow: "Fleet management",
      h1: "Fleet management and delivery vehicles in Saudi Arabia",
      lead:
        "100+ specialised vehicles, run with telematics, route optimisation and real-time monitoring. Put MSG's managed fleet behind your deliveries — from last-mile to heavy freight, 24/7.",
      included: [
        { t: "100+ specialised vehicles", d: "Fleet capacity from last-mile to heavy freight." },
        { t: "Telematics", d: "Every vehicle connected and visible." },
        { t: "Route optimisation", d: "Routes planned for density and reliability." },
        { t: "24/7 monitoring", d: "Real-time oversight with responsive support." },
      ],
      forWho: ["Enterprises and retailers", "Delivery platforms and 3PLs", "High-volume e-commerce brands"],
      faqs: [
        { q: "How big is MSG Horizons' fleet?", a: "MSG Horizons operates 100+ specialised vehicles, alongside 1,000+ couriers and 24/7 operations." },
        { q: "Is the fleet monitored?", a: "Yes. The fleet runs with telematics, route optimisation and real-time monitoring." },
        { q: "How is fleet capacity priced?", a: pricingEn },
      ],
      related: ["land-freight-saudi-arabia", "delivery-drivers-manpower-saudi-arabia", "last-mile-delivery-saudi-arabia"],
    },
    "delivery-drivers-manpower-saudi-arabia": {
      scene: "manpower",
      persona: "platform",
      metaTitle: "Delivery Drivers, Couriers & Logistics Manpower in Saudi Arabia",
      metaDescription:
        "Pre-qualified couriers, delivery drivers and warehouse teams in Saudi Arabia for ongoing operations and peak seasons — sourced, screened, onboarded and trained by MSG Horizons.",
      keywords: ["delivery drivers Saudi Arabia", "courier manpower KSA", "manpower supply Saudi Arabia", "delivery drivers Riyadh", "logistics manpower Saudi Arabia", "manpower supply companies in Riyadh"],
      eyebrow: "Manpower & peak support",
      h1: "Delivery drivers, couriers and logistics manpower in Saudi Arabia",
      lead:
        "Pre-qualified couriers, drivers and warehouse teams for ongoing operations and peaks. MSG Horizons sources, screens, onboards and trains the people your network runs on — across 7 roles.",
      included: [
        { t: "Couriers and delivery drivers", d: "Pre-qualified people ready for your routes." },
        { t: "Warehouse teams", d: "Staff for storage, handling and dispatch." },
        { t: "A four-stage pipeline", d: "Source, screen, onboard and train — before anyone reaches your operation." },
        { t: "Peak mobilisation", d: "Forecast, get ready, mobilise, control and demobilise for seasonal peaks." },
      ],
      forWho: ["Delivery platforms and 3PLs", "Enterprises scaling operations", "Retailers preparing for peak season"],
      faqs: [
        { q: "What roles does MSG Horizons supply?", a: "MSG Horizons supplies people across 7 roles, from couriers and drivers to warehouse teams and site supervisors." },
        { q: "How are couriers prepared?", a: "Through a four-stage workforce pipeline: source, screen, onboard and train." },
        { q: "Can MSG support seasonal peaks?", a: "Yes. MSG's peak demand process runs in five stages: forecast, get ready, mobilise, control and demobilise." },
        { q: "How is manpower priced?", a: pricingEn },
      ],
      related: ["fleet-management-saudi-arabia", "last-mile-delivery-saudi-arabia", "land-freight-saudi-arabia"],
    },
  },
  ar: {
    "last-mile-delivery-saudi-arabia": {
      scene: "last-mile",
      persona: "ecommerce",
      metaTitle: "شركة توصيل طرود وتوصيل الميل الأخير في السعودية",
      metaDescription:
        "توصيل الطرود والميل الأخير في السعودية من شركة توصيل مقرها الرياض: أكثر من 1,000 مندوب و100 مركبة وتتبع لحظي وتشغيل على مدار الساعة.",
      keywords: ["شركة توصيل", "شركات توصيل الطرود في الرياض", "توصيل الميل الأخير", "شركة توصيل طرود", "شركات توصيل في الرياض", "توصيل طلبات السعودية"],
      eyebrow: "الشحن وتوصيل الميل الأخير",
      h1: "توصيل الطرود والميل الأخير في أنحاء السعودية",
      lead:
        "من الاستلام حتى باب العميل، تدير MSG Horizons الميل الأخير بأكثر من 1,000 مندوب و100 مركبة وتتبع لحظي لكل شحنة، انطلاقاً من الرياض وعلى مدار الساعة.",
      included: [
        { t: "توصيل الطرود من الباب إلى الباب", d: "توزيع متكامل يركز على التوصيل السريع والدقيق والموثوق إلى أبواب عملائك." },
        { t: "تتبع لحظي", d: "مراقبة متقدمة للشحنات لحظياً، مع دعم سريع الاستجابة على مدار الساعة." },
        { t: "طاقة للذروات", d: "مناديب مؤهلون مسبقاً ومخطط لهم للحملات والمواسم." },
        { t: "فريق واحد مسؤول", d: "إدارة حساب مخصصة تعرف عمليتك." },
      ],
      forWho: ["البائعون عبر الإنترنت ومتاجر التواصل الاجتماعي", "العلامات التجارية الإلكترونية المتنامية", "تجار التجزئة والمنشآت", "منصات التوصيل التي تحتاج مناديب"],
      faqs: [
        { q: "هل توصل MSG Horizons خارج الرياض؟", a: riyadhKingdomAr },
        { q: "كم عدد مناديب MSG Horizons؟", a: "تعمل MSG Horizons بأكثر من 1,000 مندوب وأكثر من 100 مركبة، بتشغيل على مدار الساعة." },
        { q: "هل يستطيع عملائي تتبع طرودهم؟", a: "نعم. كل إعداد لدى MSG يتضمن تتبعاً لحظياً للشحنات، مع فريق دعم سريع الاستجابة على مدار الساعة." },
        { q: "كم تكلفة توصيل الميل الأخير؟", a: pricingAr },
      ],
      related: ["ecommerce-delivery-saudi-arabia", "warehousing-storage-riyadh", "delivery-drivers-manpower-saudi-arabia"],
    },
    "ecommerce-delivery-saudi-arabia": {
      scene: "tracking",
      persona: "seller",
      metaTitle: "شركة توصيل طلبات للمتاجر الإلكترونية في السعودية",
      metaDescription:
        "شريك توصيل للبائعين والشركات الناشئة والمتاجر الإلكترونية في السعودية: توصيل الطلبات والتخزين والتتبع وطاقة الذروة من شركة لوجستية في الرياض.",
      keywords: ["شركة توصيل طلبات", "شركة لوجستية توصيل طلبات", "توصيل طلبات المتاجر الإلكترونية", "شركة لوجستية السعودية", "شركة لوجستية الرياض"],
      eyebrow: "للبائعين والشركات الناشئة والتجارة الإلكترونية",
      h1: "توصيل طلبات المتاجر الإلكترونية في السعودية",
      lead:
        "أنت تبيع، وMSG Horizons توصل الطلب إلى الباب. من أول طلباتك حتى أكبر أيام العروض، شريك لوجستي واحد في الرياض يتولى التوصيل والتخزين والذروات، مع تتبع يراه عملاؤك.",
      included: [
        { t: "توصيل الطلبات لعملائك", d: "طلباتك تصل إلى الباب مع تتبع لحظي لكل شحنة." },
        { t: "تخزين ينمو معك", d: "مستودعات آمنة وإدارة مخزون ذكية عندما يحتاج مخزونك إلى مكان." },
        { t: "جاهزية للحملات", d: "طاقة الذروة مخطط لها مسبقاً، حتى لا يتحول يوم الإطلاق إلى فوضى توصيل." },
        { t: "خطة في أقل من دقيقة", d: "مخطط الموقع يحسب المسارات والمناديب من أرقامك." },
      ],
      forWho: ["البائعون من المنزل وعبر التواصل الاجتماعي", "الشركات الناشئة التي تطلق متجرها", "العلامات التجارية ذات الطلبات اليومية", "البائعون في المنصات الإلكترونية"],
      faqs: [
        { q: "أنا في البداية. هل MSG Horizons مناسبة لي؟", a: "نعم. تعمل MSG Horizons مع البائعين من أول طلباتهم، والإعداد ينمو معك فلا تحتاج لتغيير شريكك." },
        { q: "هل تستطيع MSG تخزين منتجاتي؟", a: "نعم. تقدم MSG تخزيناً آمناً مع إدارة مخزون ذكية ضمن خدمة المستودعات والمخزون." },
        { q: "ماذا يحدث في أيام العروض ورمضان؟", a: "تخطط MSG لطاقة الذروة مسبقاً عبر مراحل: التوقع، الاستعداد، الحشد، التحكم، ثم التسريح." },
        { q: "كيف أحصل على السعر؟", a: pricingAr },
      ],
      related: ["last-mile-delivery-saudi-arabia", "warehousing-storage-riyadh", "land-freight-saudi-arabia"],
    },
    "warehousing-storage-riyadh": {
      scene: "warehousing",
      persona: "ecommerce",
      metaTitle: "شركة تخزين وتوصيل وإدارة مخزون في الرياض",
      metaDescription:
        "مستودعات آمنة وإدارة مخزون في الرياض، متصلة مباشرة بتوصيل الميل الأخير في أنحاء السعودية. خزّن مرة واشحن من مكان واحد.",
      keywords: ["شركة تخزين وتوصيل", "شركات تخزين وتوصيل", "تخزين وتوصيل", "مستودعات الرياض", "إدارة المخزون السعودية"],
      eyebrow: "المستودعات والمخزون",
      h1: "تخزين وتوصيل وإدارة مخزون في الرياض",
      lead:
        "خزّن بضاعتك لدى MSG Horizons واشحن من مكان واحد. تخزين آمن وإدارة مخزون ذكية، متصلة مباشرة بشبكة توصيل MSG دون رحلات استلام منفصلة.",
      included: [
        { t: "تخزين آمن", d: "مخزونك محفوظ في بيئة مستودع آمنة." },
        { t: "إدارة مخزون ذكية", d: "مخزون مُدار ليبقي سلسلة إمدادك تعمل بسلاسة." },
        { t: "الشحن من المستودع", d: "الطلبات تخرج من حيث يوجد المخزون مباشرة إلى مسارات التوصيل." },
        { t: "تتبع من البداية للنهاية", d: "رؤية لحظية مع دعم سريع الاستجابة على مدار الساعة." },
      ],
      forWho: ["العلامات الإلكترونية التي تحتفظ بمخزون", "تجار التجزئة والموزعون", "الشركات الناشئة التي تجاوزت التخزين المنزلي", "المنشآت متعددة المواقع"],
      faqs: [
        { q: "أين يقع مقر MSG Horizons؟", a: "يقع مقر MSG Horizons في حي الملز، الرياض 12836، المملكة العربية السعودية." },
        { q: "هل يمكن الجمع بين التخزين والتوصيل؟", a: "نعم. المستودعات وتوصيل الميل الأخير جزء من منظومة لوجستية واحدة، فتنتقل الطلبات من التخزين إلى مسارات التوصيل." },
        { q: "كم تكلفة التخزين؟", a: pricingAr },
      ],
      related: ["ecommerce-delivery-saudi-arabia", "last-mile-delivery-saudi-arabia", "land-freight-saudi-arabia"],
    },
    "land-freight-saudi-arabia": {
      scene: "land-freight",
      persona: "enterprise",
      metaTitle: "شحن بري ونقل داخل السعودية",
      metaDescription:
        "شحن بري من الباب إلى الباب داخل المدن وبين مناطق السعودية، من أحمال الميل الأخير حتى الشحن الثقيل، بأكثر من 100 مركبة ومراقبة لحظية.",
      keywords: ["شحن بري داخل السعودية", "شحن بري", "نقل بري السعودية", "شركة نقل في السعودية", "شحن وتوصيل في السعودية"],
      eyebrow: "الشحن البري",
      h1: "شحن بري ونقل داخل السعودية",
      lead:
        "نقل بري موثوق من الباب إلى الباب داخل المدن وبين المناطق. أكثر من 100 مركبة متخصصة لدى MSG تغطي من أحمال الميل الأخير حتى الشحن الثقيل، بمراقبة لحظية.",
      included: [
        { t: "شحن بري من الباب إلى الباب", d: "شحنات تُنقل براً داخل المدن وبين مناطق المملكة." },
        { t: "نقل بين المواقع", d: "نقل المخزون بين المتاجر والفروع والمستودعات والمدن." },
        { t: "أسطول متخصص", d: "أكثر من 100 مركبة، من الميل الأخير حتى الشحن الثقيل." },
        { t: "مراقبة لحظية", d: "تتبع المركبات وتحسين المسارات خلف كل حركة." },
      ],
      forWho: ["تجار التجزئة الذين ينقلون المخزون بين الفروع", "المنشآت متعددة المواقع", "المتاجر الإلكترونية التي توصل خارج الرياض", "الموزعون والموردون"],
      faqs: [
        { q: "إلى أين تنقل MSG Horizons الشحنات؟", a: riyadhKingdomAr },
        { q: "ما المركبات التي تستخدمها MSG؟", a: "تشغّل MSG أكثر من 100 مركبة متخصصة من أحمال الميل الأخير حتى الشحن الثقيل، مع أنظمة تتبع وتحسين للمسارات ومراقبة لحظية." },
        { q: "كيف يُسعّر الشحن البري؟", a: pricingAr },
      ],
      related: ["fleet-management-saudi-arabia", "warehousing-storage-riyadh", "last-mile-delivery-saudi-arabia"],
    },
    "fleet-management-saudi-arabia": {
      scene: "fleet",
      persona: "enterprise",
      metaTitle: "إدارة أساطيل ومركبات توصيل في السعودية",
      metaDescription:
        "أسطول مُدار من أكثر من 100 مركبة متخصصة في السعودية مع أنظمة تتبع وتحسين مسارات ومراقبة لحظية، يعمل على مدار الساعة من الرياض.",
      keywords: ["إدارة أساطيل", "إدارة أسطول السعودية", "مركبات توصيل الرياض", "أسطول لوجستي السعودية"],
      eyebrow: "إدارة الأسطول",
      h1: "إدارة الأساطيل ومركبات التوصيل في السعودية",
      lead:
        "أكثر من 100 مركبة متخصصة تعمل بأنظمة تتبع وتحسين مسارات ومراقبة لحظية. ضع أسطول MSG المُدار خلف توصيلاتك، من الميل الأخير حتى الشحن الثقيل، على مدار الساعة.",
      included: [
        { t: "أكثر من 100 مركبة متخصصة", d: "طاقة أسطول من الميل الأخير حتى الشحن الثقيل." },
        { t: "أنظمة تتبع المركبات", d: "كل مركبة متصلة ومرئية." },
        { t: "تحسين المسارات", d: "مسارات مخططة للكثافة والموثوقية." },
        { t: "مراقبة على مدار الساعة", d: "إشراف لحظي مع دعم سريع الاستجابة." },
      ],
      forWho: ["المنشآت وتجار التجزئة", "منصات التوصيل وشركات الطرف الثالث", "العلامات الإلكترونية ذات الحجم الكبير"],
      faqs: [
        { q: "ما حجم أسطول MSG Horizons؟", a: "تشغّل MSG Horizons أكثر من 100 مركبة متخصصة، إلى جانب أكثر من 1,000 مندوب وتشغيل على مدار الساعة." },
        { q: "هل الأسطول مراقب؟", a: "نعم. يعمل الأسطول بأنظمة تتبع وتحسين مسارات ومراقبة لحظية." },
        { q: "كيف تُسعّر طاقة الأسطول؟", a: pricingAr },
      ],
      related: ["land-freight-saudi-arabia", "delivery-drivers-manpower-saudi-arabia", "last-mile-delivery-saudi-arabia"],
    },
    "delivery-drivers-manpower-saudi-arabia": {
      scene: "manpower",
      persona: "platform",
      metaTitle: "توفير مناديب توصيل وسائقين وقوى عاملة لوجستية في السعودية",
      metaDescription:
        "مناديب توصيل وسائقون وفرق مستودعات مؤهلون مسبقاً في السعودية للتشغيل اليومي والمواسم، يتم استقطابهم وفحصهم وتهيئتهم وتدريبهم من MSG Horizons.",
      keywords: ["مناديب توصيل", "مناديب توصيل الرياض", "مناديب توصيل طرود", "توفير مناديب توصيل", "توريد عمالة للشركات", "قوى عاملة لوجستية"],
      eyebrow: "القوى العاملة ودعم الذروة",
      h1: "مناديب توصيل وسائقون وقوى عاملة لوجستية في السعودية",
      lead:
        "مناديب وسائقون وفرق مستودعات مؤهلون مسبقاً للتشغيل اليومي والذروات. تستقطب MSG Horizons الأشخاص الذين تعمل عليهم شبكتك وتفحصهم وتهيئهم وتدربهم، عبر 7 أدوار.",
      included: [
        { t: "مناديب وسائقو توصيل", d: "أشخاص مؤهلون مسبقاً وجاهزون لمساراتك." },
        { t: "فرق مستودعات", d: "كوادر للتخزين والمناولة والشحن." },
        { t: "مسار من أربع مراحل", d: "الاستقطاب، الفحص، التهيئة، التدريب، قبل وصول أي شخص إلى عمليتك." },
        { t: "حشد للذروات", d: "التوقع، الاستعداد، الحشد، التحكم، ثم التسريح للمواسم." },
      ],
      forWho: ["منصات التوصيل وشركات الطرف الثالث", "المنشآت التي توسّع عملياتها", "تجار التجزئة الذين يستعدون للمواسم"],
      faqs: [
        { q: "ما الأدوار التي توفرها MSG Horizons؟", a: "توفر MSG Horizons كوادر عبر 7 أدوار، من المناديب والسائقين إلى فرق المستودعات ومشرفي المواقع." },
        { q: "كيف يتم تجهيز المناديب؟", a: "عبر مسار قوى عاملة من أربع مراحل: الاستقطاب، الفحص، التهيئة، التدريب." },
        { q: "هل تدعم MSG ذروات المواسم؟", a: "نعم. تعمل إدارة الذروة لدى MSG على خمس مراحل: التوقع، الاستعداد، الحشد، التحكم، ثم التسريح." },
        { q: "كيف تُسعّر القوى العاملة؟", a: pricingAr },
      ],
      related: ["fleet-management-saudi-arabia", "last-mile-delivery-saudi-arabia", "land-freight-saudi-arabia"],
    },
  },
};

export const isServiceSlug = (s: string): s is ServiceSlug => (SERVICE_SLUGS as readonly string[]).includes(s);

/** Homepage service → its search landing page (tracking and account live inside the others). */
export const SLUG_FOR: Partial<Record<ServiceId, ServiceSlug>> = {
  "last-mile": "last-mile-delivery-saudi-arabia",
  warehousing: "warehousing-storage-riyadh",
  "land-freight": "land-freight-saudi-arabia",
  fleet: "fleet-management-saudi-arabia",
  manpower: "delivery-drivers-manpower-saudi-arabia",
};
