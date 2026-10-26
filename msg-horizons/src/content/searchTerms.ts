import type { Locale } from "@/content/i18n";

/**
 * The words buyers type for what MSG does, mapped to the page that answers them. Used only by the site search
 * (lib/site-search): a term here makes its page come up, it states nothing about MSG, so the content rules still hold:
 * nothing that implies customs clearance, cash on delivery, cold-chain or delivery-time promises is listed, because
 * facts.ts does not claim them. Keys are search-hit ids.
 */
export const ALIASES: Record<Locale, Record<string, string[]>> = {
  en: {
    "page-last-mile-delivery-saudi-arabia": [
      "last mile", "last-mile delivery", "delivery company", "courier", "courier company", "courier service", "parcel", "parcels", "parcel delivery", "package delivery",
      "door to door", "home delivery", "doorstep delivery", "deliver orders", "delivery service", "delivery partner", "dispatch", "riders", "motorbike delivery", "city delivery",
      "shipping company", "shipment", "shipments", "deliveries", "express delivery company",
    ],
    "page-ecommerce-delivery-saudi-arabia": [
      "ecommerce", "e-commerce", "online store", "online shop", "online seller", "online sellers", "webshop", "store delivery", "shopify", "woocommerce", "salla", "zid", "instagram seller",
      "social seller", "dropshipping", "fulfilment", "fulfillment", "order fulfilment", "3pl", "third party logistics", "logistics partner", "logistics company", "logistics services",
      "startup", "start-up", "returns", "order management", "marketplace seller", "amazon seller", "noon seller", "supply chain",
    ],
    "page-warehousing-storage-riyadh": [
      "warehouse", "warehousing", "warehouses", "storage", "store goods", "stock", "inventory", "inventory management", "pick and pack", "pick pack", "picking", "packing",
      "fulfilment centre", "fulfillment center", "distribution centre", "distribution center", "hub", "sabya", "jazan", "racking", "pallets", "storage and delivery",
    ],
    "page-land-freight-saudi-arabia": [
      "land freight", "road freight", "freight", "cargo", "trucking", "truck", "trucks", "lorry", "haulage", "long haul", "transport", "transportation", "transport company",
      "goods transport", "heavy freight", "heavy transport", "inter-city", "intercity", "between cities", "shipping inside saudi", "road transport", "trailer", "load", "loads",
    ],
    "page-fleet-management-saudi-arabia": [
      "fleet", "fleet management", "vehicles", "vehicle", "delivery vehicles", "vans", "van", "hiace", "toyota hiace", "telematics", "gps tracking", "vehicle tracking",
      "route optimisation", "route optimization", "routing", "fleet operations", "fleet outsourcing", "own fleet", "drivers and vehicles",
    ],
    "page-delivery-drivers-manpower-saudi-arabia": [
      "drivers", "driver", "delivery drivers", "delivery driver", "couriers", "manpower", "man power", "workforce", "staffing", "staff", "labour", "labor", "hire drivers",
      "outsourcing", "outsourced drivers", "supply drivers", "peak season", "peak demand", "seasonal", "ramadan", "white friday", "recruitment", "warehouse staff", "headcount",
    ],
    "service-tracking": ["tracking", "track my order", "track parcel", "track shipment", "live tracking", "proof of delivery", "pod", "delivery status", "visibility", "real-time", "real time"],
    "service-account": ["account manager", "account management", "dedicated manager", "support", "customer support", "reporting", "reports", "kpi", "service level", "contract"],
    planner: ["quote", "price", "pricing", "cost", "rates", "rate", "how much", "estimate", "calculator", "plan", "proposal", "get started", "start", "onboard", "cheap", "cheapest", "affordable"],
    contact: ["contact", "call", "phone", "whatsapp", "email", "address", "location", "office", "talk to", "speak", "sales", "enquiry", "inquiry", "demo", "meeting"],
    proof: ["about", "about us", "company", "who are you", "partners", "clients", "customers", "vision 2030", "imile", "profile", "trusted", "reviews", "licence", "license"],
    fleet: ["operations", "24/7", "round the clock", "always on"],
    enterprise: ["enterprise", "corporate", "large business", "b2b", "workforce supply", "pipeline", "deployment"],
  },
  ar: {
    "page-last-mile-delivery-saudi-arabia": [
      "توصيل", "التوصيل", "شركة توصيل", "شركات توصيل", "توصيل طرود", "توصيل الطرود", "توصيل الميل الأخير", "ميل اخير", "مندوب", "مندوب توصيل", "ساعي", "توصيل للمنازل", "توصيل لباب البيت",
      "شحنات", "شحنة", "شركة شحن", "شركات شحن", "كوريير", "كورير", "توصيل داخل المدينة", "توصيل سريع",
    ],
    "page-ecommerce-delivery-saudi-arabia": [
      "متجر الكتروني", "متاجر الكترونية", "تجارة الكترونية", "التجارة الالكترونية", "توصيل طلبات", "توصيل طلبات المتاجر", "شركة لوجستية", "شركات لوجستية", "خدمات لوجستية", "لوجستيات",
      "تنفيذ الطلبات", "فلفلمنت", "سلة", "زد", "شوبيفاي", "بائع", "بائع اونلاين", "ستارت اب", "شركة ناشئة", "مرتجعات", "سلاسل الامداد", "سلسلة الامداد", "نون", "امازون",
    ],
    "page-warehousing-storage-riyadh": [
      "مستودع", "مستودعات", "تخزين", "شركة تخزين", "تخزين وتوصيل", "مخزون", "ادارة المخزون", "تجهيز الطلبات", "تعبئة وتغليف", "تغليف", "مركز توزيع", "مركز لوجستي", "صبيا", "جازان", "رفوف", "طبليات",
    ],
    "page-land-freight-saudi-arabia": [
      "شحن بري", "نقل بري", "شحن", "نقل", "شركة نقل", "نقل بضائع", "شاحنة", "شاحنات", "تريلا", "تريلات", "نقل ثقيل", "شحن ثقيل", "بين المدن", "شحن داخل السعودية", "نقل البضائع",
    ],
    "page-fleet-management-saudi-arabia": [
      "اسطول", "ادارة اسطول", "ادارة اساطيل", "اساطيل", "مركبات", "مركبة", "سيارات توصيل", "فان", "هايس", "تويوتا هايس", "تتبع المركبات", "تتبع", "جي بي اس", "تحسين المسارات", "تشغيل اسطول",
    ],
    "page-delivery-drivers-manpower-saudi-arabia": [
      "سائق", "سائقين", "سائقين توصيل", "مناديب", "مناديب توصيل", "توفير مناديب", "عمالة", "توريد عمالة", "قوى عاملة", "توفير عمالة", "موظفين", "توظيف", "تعهيد", "موسم الذروة", "رمضان", "الجمعة البيضاء", "استقدام",
    ],
    "service-tracking": ["تتبع الطلب", "تتبع الشحنة", "تتبع مباشر", "اثبات التسليم", "حالة التوصيل", "تتبع الطرود"],
    "service-account": ["مدير حساب", "ادارة الحساب", "دعم", "خدمة العملاء", "تقارير", "عقد"],
    planner: ["سعر", "اسعار", "تسعيرة", "تكلفة", "عرض سعر", "كم", "حاسبة", "خطة", "ابدأ", "ابدا", "رخيص", "ارخص"],
    contact: ["تواصل", "اتصال", "اتصل", "واتساب", "واتس اب", "رقم", "جوال", "هاتف", "ايميل", "بريد", "عنوان", "موقع", "مكتب", "مبيعات", "استفسار", "طلب خدمة", "اجتماع"],
    proof: ["من نحن", "عن الشركة", "عنا", "شركاء", "عملاء", "رؤية 2030", "ايميل", "تقييم", "ترخيص"],
    fleet: ["عمليات", "على مدار الساعة", "٢٤"],
    enterprise: ["شركات", "قطاع الاعمال", "مؤسسات", "نشر"],
  },
};

/** words that say nothing about the service, ignored when matching */
export const STOP: Record<Locale, string[]> = {
  en: ["a", "an", "the", "in", "of", "for", "to", "and", "or", "with", "me", "my", "near", "best", "top", "good", "cheap", "company", "companies", "services", "service", "saudi", "arabia", "ksa", "riyadh", "jeddah", "dammam", "makkah", "madinah", "khobar", "jazan", "online"],
  ar: ["في", "من", "الى", "على", "و", "او", "مع", "افضل", "احسن", "شركة", "شركات", "خدمات", "خدمة", "السعودية", "سعودية", "الرياض", "جدة", "الدمام", "مكة", "المدينة", "الخبر"],
};

/** what to try first, one tap each */
export const POPULAR: Record<Locale, string[]> = {
  en: ["last mile delivery", "courier company", "online store delivery", "warehouse", "3PL", "delivery drivers", "fleet", "freight", "get a quote"],
  ar: ["شركة توصيل", "توصيل طرود", "توصيل طلبات المتاجر", "مستودعات", "مناديب توصيل", "إدارة أسطول", "شحن بري", "عرض سعر"],
};

export const searchCopy: Record<Locale, { popular: string; fallbackTitle: string; fallbackLead: string; planTitle: string; contactTitle: string }> = {
  en: {
    popular: "Popular searches",
    fallbackTitle: "We may not use that exact word, but MSG can help.",
    fallbackLead: "Tell us what you need moved, stored or staffed and MSG will come back with a plan.",
    planTitle: "Build your logistics plan",
    contactTitle: "Talk to MSG",
  },
  ar: {
    popular: "عمليات بحث شائعة",
    fallbackTitle: "قد لا نستخدم هذه الكلمة بالضبط، لكن ام اس جي تستطيع مساعدتك.",
    fallbackLead: "أخبرنا بما تريد نقله أو تخزينه أو توفير العمالة له، وسترد ام اس جي بخطة.",
    planTitle: "ابنِ خطتك اللوجستية",
    contactTitle: "تحدث مع ام اس جي",
  },
};
