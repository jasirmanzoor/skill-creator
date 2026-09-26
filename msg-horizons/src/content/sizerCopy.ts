import type { Locale } from "@/content/i18n";
import type { Area, Cadence, Decision, DeliveryWindow, Pickup, Profile, SizerInput, Structure } from "@/lib/sizer";
import { ASSUMPTIONS } from "@/lib/sizer";

/**
 * Copy for the network sizer. Every sentence is a one-line "because": the decision, then the reason,
 * built only from the visitor's inputs and the published planning assumptions.
 */

const n = (v: number) => v.toLocaleString("en-US");
const pct = (v: number) => `${Math.round(v)}%`;
const x = (v: number) => `${Number.isInteger(v) ? v : v.toFixed(1)}×`;

type Copy = {
  title: string;
  hint: string;
  inputs: {
    orders: string;
    ordersUnit: string;
    peak: string;
    peakHint: string;
    area: string;
    areas: Record<Area, string>;
    window: string;
    windows: Record<DeliveryWindow, string>;
    profile: string;
    profiles: Record<Profile, string>;
    stock: string;
    stockYes: string;
    stockNo: string;
    cod: string;
  };
  live: string;
  kpis: { routes: string; couriers: string; peak: string; flex: string };
  legend: { base: (per: number) => string; peak: string };
  headline: (s: Structure, i: SizerInput) => string;
  decision: (d: Decision) => { title: string; why: string };
  assumptionsTitle: string;
  whyTitle: string;
  servicesTitle: string;
  assumptions: string[];
  disclaimer: string;
  summary: (s: Structure, i: SizerInput) => string[];
};

const pickupEn: Record<Pickup, string> = {
  direct: "Courier collects from your door",
  scheduled: "Scheduled daily pickup, sorted at the hub",
  dedicated: "Dedicated pickup vehicle feeding the hub",
  warehouse: "Stock held at MSG, dispatched from the warehouse",
};
const pickupAr: Record<Pickup, string> = {
  direct: "المندوب يستلم من بابك",
  scheduled: "استلام يومي مجدول وفرز في المحطة",
  dedicated: "مركبة استلام مخصصة تغذي المحطة",
  warehouse: "مخزونك لدى MSG ويُشحن من المستودع",
};
const cadenceEn: Record<Cadence, string> = {
  single: "One daily dispatch",
  waves: "Two dispatch waves a day",
  slots: "Routes built around delivery slots",
  roundclock: "Rolling shifts under 24/7 control",
};
const cadenceAr: Record<Cadence, string> = {
  single: "انطلاق واحد يومياً",
  waves: "موجتا انطلاق يومياً",
  slots: "مسارات مبنية على مواعيد التسليم",
  roundclock: "ورديات متتالية بتحكم على مدار الساعة",
};

export const sizerCopy: Record<Locale, Copy> = {
  en: {
    title: "Your numbers",
    hint: "Move the controls. The structure recalculates as you go.",
    inputs: {
      orders: "Orders or shipments on a normal day",
      ordersUnit: "a day",
      peak: "Your busiest day",
      peakHint: "Sale days, Ramadan, White Friday — compared with a normal day",
      area: "Where do they go?",
      areas: { riyadh: "Riyadh", multi: "Riyadh + other cities", kingdom: "Across the Kingdom" },
      window: "What do your customers expect?",
      windows: { sameday: "Same day", nextday: "Next day", scheduled: "A chosen slot" },
      profile: "What size are they?",
      profiles: { small: "Small parcels", mixed: "Mixed sizes", bulky: "Bulky items" },
      stock: "Should MSG hold your stock?",
      stockYes: "Yes, store it",
      stockNo: "No, collect from me",
      cod: "Paid in cash at the door",
    },
    live: "Calculated live",
    kpis: { routes: "Daily routes", couriers: "Couriers on a normal day", peak: "Couriers on your peak day", flex: "Peak-only couriers" },
    legend: { base: (per) => (per === 1 ? "1 courier, every day" : `${per} couriers, every day`), peak: "Peak days only" },
    headline: (s, i) => {
      switch (s.headline) {
        case "flex":
          return `Staff for your normal day, flex for your peak: ${n(s.baseCouriers)} regular couriers plus ${n(s.flex)} on peak days, because your busiest day is ${x(i.peak)} a normal one.`;
        case "stock":
          return `Store once, dispatch from one place: ${n(s.baseRoutes)} daily routes leave the warehouse, so there are no pickup runs to your premises.`;
        case "linehaul":
          return `Road linehaul plus local last mile: ${n(s.baseRoutes)} routes cover the day, and orders beyond Riyadh travel by scheduled land freight first.`;
        case "waves":
          return `Two waves beat one long day: ${n(s.baseRoutes)} shorter routes in two dispatches keep same-day orders inside the day.`;
        default:
          return `${n(s.baseRoutes)} ${s.baseRoutes === 1 ? "route covers" : "routes cover"} your day with ${n(s.baseCouriers)} ${s.baseCouriers === 1 ? "courier" : "couriers"}, sized to your volume with no idle capacity.`;
      }
    },
    decision: (d) => {
      switch (d.id) {
        case "routes":
          return { title: `${n(d.routes)} daily ${d.routes === 1 ? "route" : "routes"}`, why: `At about ${n(d.drops)} stops a route for your parcel mix, window and cash share.` };
        case "flex":
          return { title: `${n(d.flex)} surge couriers, peak days only`, why: `Your peak is ${x(d.peak)} a normal day, so a fixed team that size would sit idle most of the year.` };
        case "pickup":
          return {
            title: pickupEn[d.pickup],
            why:
              d.pickup === "direct" ? `Below ${ASSUMPTIONS.pickupDirectMax} orders a day, a hub run adds a step without saving one.`
              : d.pickup === "scheduled" ? "One consolidated collection replaces many separate courier visits."
              : d.pickup === "dedicated" ? `From ${ASSUMPTIONS.pickupDedicatedMin} orders a day, one dedicated vehicle beats splitting pickups across delivery routes.`
              : "Orders ship from where the stock already is, with no collection leg.",
          };
        case "cadence":
          return {
            title: cadenceEn[d.cadence],
            why:
              d.cadence === "waves" ? "A morning and an afternoon dispatch keep same-day orders inside the day."
              : d.cadence === "slots" ? "Routes follow the slots your customers chose, so fewer doors are missed."
              : d.cadence === "roundclock" ? "At this volume, work runs in shifts around the clock, matching MSG's 24/7 operation."
              : "Next-day orders fit one planned dispatch, which gives the densest routes.",
          };
        case "linehaul":
          return { title: "Scheduled land freight between cities", why: "Moving orders city-to-city by road first keeps each last-mile route local and dense." };
        case "vehicles":
          return {
            title: d.profile === "bulky" ? "Vans sized for bulky items" : d.profile === "mixed" ? "Mix of cars and vans" : "Light vehicles for parcel routes",
            why: d.profile === "bulky" ? "Big items need load space, not speed between stops." : d.profile === "mixed" ? "Match each route's vehicle to what it carries." : "Small parcels are about stops per hour, not load space.",
          };
        case "cod":
          return { title: `Cash collection on ${pct(d.cod)} of orders`, why: "Cash takes longer at the door, so those routes are planned shorter. MSG confirms collection terms with you." };
        case "account":
          return { title: "Dedicated account management", why: "At this scale, one team that knows your operation plans the peaks with you." };
        case "scale":
          return d.beyond
            ? { title: "Phased onboarding through MSG's workforce pipeline", why: "Your peak exceeds a single courier pool, so capacity is sourced, screened, onboarded and trained in phases." }
            : { title: `About ${pct(Math.max(1, d.share * 100))} of MSG's 1,000+ courier base`, why: "Your peak sits inside MSG's published scale." };
      }
    },
    assumptionsTitle: "How this is calculated",
    whyTitle: "Why this structure",
    servicesTitle: "MSG services in this plan",
    assumptions: [
      `Stops per route: about ${ASSUMPTIONS.dropsPerRoute.small} for small parcels, ${ASSUMPTIONS.dropsPerRoute.mixed} for mixed sizes and ${ASSUMPTIONS.dropsPerRoute.bulky} for bulky items.`,
      `Same-day routes are planned ${Math.round((1 - ASSUMPTIONS.sameDayDensity) * 100)}% shorter. Cash on delivery cuts up to ${Math.round(ASSUMPTIONS.codSlowdown * 100)}% more.`,
      `Couriers = routes + ${Math.round(ASSUMPTIONS.cover * 100)}% cover for rest days and absence.`,
    ],
    disclaimer: "These are planning estimates from your inputs, not a quote or a delivery promise. MSG confirms the real figures with you.",
    summary: (s, i) => [
      `Orders a day: ${n(i.orders)} (peak ${x(i.peak)})`,
      `Structure: ${n(s.baseRoutes)} routes · ${n(s.baseCouriers)} couriers · ${n(s.peakCouriers)} at peak`,
      `Pickup: ${pickupEn[s.pickup]}`,
      `Dispatch: ${cadenceEn[s.cadence]}`,
      ...(s.linehaul ? ["Linehaul: land freight between cities"] : []),
      ...(i.cod ? [`Cash on delivery: ${pct(i.cod)}`] : []),
    ],
  },
  ar: {
    title: "أرقامك",
    hint: "حرّك المؤشرات، ويُعاد حساب الهيكل مباشرة.",
    inputs: {
      orders: "الطلبات أو الشحنات في يوم عادي",
      ordersUnit: "يومياً",
      peak: "أكثر أيامك ازدحاماً",
      peakHint: "أيام العروض ورمضان والجمعة البيضاء مقارنة بيوم عادي",
      area: "إلى أين تذهب؟",
      areas: { riyadh: "الرياض", multi: "الرياض ومدن أخرى", kingdom: "في أنحاء المملكة" },
      window: "ماذا يتوقع عملاؤك؟",
      windows: { sameday: "نفس اليوم", nextday: "اليوم التالي", scheduled: "موعد يختارونه" },
      profile: "ما حجمها؟",
      profiles: { small: "طرود صغيرة", mixed: "أحجام مختلفة", bulky: "قطع كبيرة" },
      stock: "هل تحفظ MSG مخزونك؟",
      stockYes: "نعم، خزّنوه",
      stockNo: "لا، استلموا مني",
      cod: "الدفع نقداً عند الباب",
    },
    live: "يُحسب مباشرة",
    kpis: { routes: "مسارات يومية", couriers: "مناديب في يوم عادي", peak: "مناديب يوم الذروة", flex: "مناديب للذروة فقط" },
    legend: { base: (per) => (per === 1 ? "مندوب واحد يومياً" : `${per} مناديب يومياً`), peak: "أيام الذروة فقط" },
    headline: (s, i) => {
      switch (s.headline) {
        case "flex":
          return `فريق ليومك العادي ومرونة لذروتك: ${n(s.baseCouriers)} مندوباً ثابتاً و${n(s.flex)} إضافياً في أيام الذروة، لأن أكثر أيامك ازدحاماً يعادل ${x(i.peak)} اليوم العادي.`;
        case "stock":
          return `خزّن مرة وانطلق من مكان واحد: ${n(s.baseRoutes)} مسارات يومية تخرج من المستودع، دون رحلات استلام إلى مقرك.`;
        case "linehaul":
          return `نقل بري بين المدن ثم ميل أخير محلي: ${n(s.baseRoutes)} مسارات تغطي اليوم، والطلبات خارج الرياض تنتقل أولاً بالشحن البري المجدول.`;
        case "waves":
          return `موجتان أفضل من يوم طويل: ${n(s.baseRoutes)} مسارات أقصر على انطلاقتين تُبقي طلبات نفس اليوم داخل اليوم.`;
        default:
          return `${n(s.baseRoutes)} مسارات تغطي يومك بـ${n(s.baseCouriers)} مناديب، بحجم يطابق طلباتك دون طاقة معطلة.`;
      }
    },
    decision: (d) => {
      switch (d.id) {
        case "routes":
          return { title: `${n(d.routes)} مسارات يومية`, why: `بمعدل ${n(d.drops)} محطة تقريباً لكل مسار حسب نوع الطرود والموعد ونسبة النقد.` };
        case "flex":
          return { title: `${n(d.flex)} مناديب إضافيون لأيام الذروة فقط`, why: `ذروتك تعادل ${x(d.peak)} يومك العادي، وفريق ثابت بهذا الحجم سيبقى معطلاً أغلب السنة.` };
        case "pickup":
          return {
            title: pickupAr[d.pickup],
            why:
              d.pickup === "direct" ? `تحت ${ASSUMPTIONS.pickupDirectMax} طلباً يومياً، المرور بالمحطة يضيف خطوة دون توفير.`
              : d.pickup === "scheduled" ? "استلام واحد مجمّع بدل زيارات متفرقة من عدة مناديب."
              : d.pickup === "dedicated" ? `من ${ASSUMPTIONS.pickupDedicatedMin} طلب يومياً، المركبة المخصصة أكفأ من توزيع الاستلام على مسارات التوصيل.`
              : "الطلبات تُشحن من حيث يوجد المخزون، دون رحلة استلام.",
          };
        case "cadence":
          return {
            title: cadenceAr[d.cadence],
            why:
              d.cadence === "waves" ? "انطلاق صباحي وآخر بعد الظهر يُبقيان طلبات نفس اليوم داخل اليوم."
              : d.cadence === "slots" ? "المسارات تتبع المواعيد التي اختارها عملاؤك، فتقل الزيارات الفائتة."
              : d.cadence === "roundclock" ? "بهذا الحجم يعمل الفريق بورديات على مدار الساعة، كما تعمل MSG ٢٤/٧."
              : "طلبات اليوم التالي تناسب انطلاقاً واحداً مخططاً، وهو الأكثر كثافة.",
          };
        case "linehaul":
          return { title: "شحن بري مجدول بين المدن", why: "نقل الطلبات بين المدن براً أولاً يُبقي كل مسار ميل أخير محلياً وكثيفاً." };
        case "vehicles":
          return {
            title: d.profile === "bulky" ? "شاحنات فان تناسب القطع الكبيرة" : d.profile === "mixed" ? "مزيج من السيارات والفانات" : "مركبات خفيفة لمسارات الطرود",
            why: d.profile === "bulky" ? "القطع الكبيرة تحتاج مساحة تحميل لا سرعة بين المحطات." : d.profile === "mixed" ? "مركبة كل مسار تطابق ما يحمله." : "الطرود الصغيرة تعتمد على عدد المحطات في الساعة لا مساحة التحميل.",
          };
        case "cod":
          return { title: `تحصيل نقدي على ${pct(d.cod)} من الطلبات`, why: "النقد يأخذ وقتاً أطول عند الباب، لذا تُخطط تلك المسارات أقصر. تؤكد MSG شروط التحصيل معك." };
        case "account":
          return { title: "إدارة حساب مخصصة", why: "بهذا الحجم، فريق واحد يعرف عمليتك يخطط الذروات معك." };
        case "scale":
          return d.beyond
            ? { title: "استقطاب على مراحل عبر مسار القوى العاملة في MSG", why: "ذروتك تتجاوز فريقاً واحداً، فتُستقطب الطاقة وتُفحص وتُهيأ وتُدرّب على مراحل." }
            : { title: `نحو ${pct(Math.max(1, d.share * 100))} من قاعدة MSG التي تتجاوز ١٬٠٠٠ مندوب`, why: "ذروتك ضمن الحجم المعلن لـ MSG." };
      }
    },
    assumptionsTitle: "كيف نحسب",
    whyTitle: "لماذا هذا الهيكل",
    servicesTitle: "خدمات MSG في هذه الخطة",
    assumptions: [
      `المحطات لكل مسار: نحو ${ASSUMPTIONS.dropsPerRoute.small} للطرود الصغيرة و${ASSUMPTIONS.dropsPerRoute.mixed} للأحجام المختلفة و${ASSUMPTIONS.dropsPerRoute.bulky} للقطع الكبيرة.`,
      `مسارات نفس اليوم أقصر بنسبة ${Math.round((1 - ASSUMPTIONS.sameDayDensity) * 100)}٪، والدفع عند الاستلام يخفضها حتى ${Math.round(ASSUMPTIONS.codSlowdown * 100)}٪ إضافية.`,
      `المناديب = المسارات + ${Math.round(ASSUMPTIONS.cover * 100)}٪ احتياط لأيام الراحة والغياب.`,
    ],
    disclaimer: "هذه تقديرات تخطيطية من مدخلاتك، وليست عرض سعر أو التزاماً بموعد. تؤكد MSG الأرقام الفعلية معك.",
    summary: (s, i) => [
      `الطلبات يومياً: ${n(i.orders)} (الذروة ${x(i.peak)})`,
      `الهيكل: ${n(s.baseRoutes)} مسارات · ${n(s.baseCouriers)} مناديب · ${n(s.peakCouriers)} في الذروة`,
      `الاستلام: ${pickupAr[s.pickup]}`,
      `الانطلاق: ${cadenceAr[s.cadence]}`,
      ...(s.linehaul ? ["النقل بين المدن: شحن بري"] : []),
      ...(i.cod ? [`الدفع عند الاستلام: ${pct(i.cod)}`] : []),
    ],
  },
};
