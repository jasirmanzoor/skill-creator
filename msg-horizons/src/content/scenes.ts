/**
 * DISPATCH-DAY SCENES — AI-generated images of an ordinary dispatch day (24 Oct 2026, see docs/CONTENT-NOTES.md).
 * No MSG branding was added to them, and they stay out of the real-photo gallery in content/media.ts. Shown without an
 * "Illustrative" badge at MSG's request (26 Oct 2026). Replace each with MSG's own shot of the same moment when it arrives.
 */
export type Scene = {
  src: string;
  pos?: string;
  alt: { en: string; ar: string };
  caption: { en: string; ar: string };
};

export const dispatchDay = {
  title: { en: "A dispatch day, start to door.", ar: "يوم توزيع، من البداية حتى الباب." },
  badge: { en: "Illustrative", ar: "صورة توضيحية" },
  note: {
    en: "Illustrative images of a typical dispatch day, not photographs of MSG’s fleet or sites.",
    ar: "صور توضيحية ليوم توزيع معتاد، وليست صوراً لأسطول ام اس جي أو مواقعها.",
  },
  scenes: [
    {
      src: "/media/illustrative/fleet-parked.webp",
      pos: "30% 60%",
      alt: { en: "A row of white delivery vans parked outside a warehouse at sunrise", ar: "صف من شاحنات التوصيل البيضاء متوقفة أمام مستودع عند الشروق" },
      caption: { en: "Before the first run: the fleet, parked and ready", ar: "قبل أول رحلة: الأسطول متوقف وجاهز" },
    },
    {
      src: "/media/illustrative/dispatch-loading.webp",
      pos: "55% 50%",
      alt: { en: "Warehouse staff loading parcels from racking into a van at the loading bay", ar: "عمال المستودع يحمّلون الطرود من الرفوف إلى شاحنة عند رصيف التحميل" },
      caption: { en: "Picked, packed and loaded at the bay", ar: "تجهيز وتغليف وتحميل عند الرصيف" },
    },
    {
      src: "/media/illustrative/van-leaving.webp",
      pos: "55% 55%",
      alt: { en: "A white van leaving a logistics yard onto a town road with mountains behind", ar: "شاحنة بيضاء تغادر ساحة لوجستية إلى طريق في المدينة والجبال خلفها" },
      caption: { en: "Out of the gate, onto the route", ar: "خارج البوابة، على المسار" },
    },
    {
      src: "/media/illustrative/handover.webp",
      pos: "50% 50%",
      alt: { en: "A courier handing a parcel to a customer at a villa door", ar: "مندوب يسلّم طرداً لعميل عند باب فيلا" },
      caption: { en: "At the door, into the customer’s hands", ar: "عند الباب، في يد العميل" },
    },
  ] satisfies Scene[],
};

/**
 * FLEET AT WORK: MSG's own fleet (photographs supplied by MSG, 8 Nov 2026; plates blurred), everyday scenes of the
 * fleet at work (generated photographs; vans without livery) and the long-haul truck in MSG's new livery. They stay out of the real-photo gallery in content/media.ts.
 */
export const hiaceFleet = {
  title: { en: "The fleet at work, every day.", ar: "الأسطول في العمل، كل يوم." },
  scenes: [
    {
      src: "/media/msg/fleet-yard.webp",
      pos: "45% 55%",
      alt: { en: "An MSG Horizons Toyota Hiace van in a covered fleet yard, more of the fleet lined up behind it", ar: "مركبة تويوتا هايس من أسطول ام اس جي هورايزونز في ساحة مظللة، وبقية الأسطول مصطفة خلفها" },
      caption: { en: "MSG's own vans, ready before the first run", ar: "مركبات ام اس جي جاهزة قبل أول رحلة" },
    },
    {
      src: "/media/msg/fleet-hub.webp",
      pos: "50% 60%",
      alt: { en: "MSG Horizons refrigerated vans parked in front of the MSG hub", ar: "مركبات ام اس جي هورايزونز المبرّدة أمام مركز ام اس جي" },
      caption: { en: "The fleet at MSG's hub", ar: "الأسطول أمام مركز ام اس جي" },
    },
    {
      src: "/media/photos/dispatch.webp",
      pos: "40% 55%",
      alt: { en: "A worker pulling a pallet jack with a wrapped pallet up to a loaded box truck at the dock", ar: "عامل يسحب رافعة طبالي يدوية عليها طبلية مغلّفة نحو شاحنة صندوقية محمّلة عند الرصيف" },
      caption: { en: "Out for dispatch", ar: "في طريقها للتوزيع" },
    },
    {
      src: "/media/photos/van-road.webp",
      pos: "40% 60%",
      alt: { en: "A white delivery van on a wide Riyadh road at golden hour", ar: "شاحنة توصيل بيضاء على طريق واسع في الرياض وقت الغروب" },
      caption: { en: "On the road across the city", ar: "على الطريق عبر المدينة" },
    },
    {
      src: "/media/msg/land-freight-truck.webp",
      pos: "40% 55%",
      alt: { en: "A long-haul truck in MSG livery on a mountain highway", ar: "شاحنة نقل طويل بشعار ام اس جي على طريق جبلي" },
      caption: { en: "Long haul, between regions", ar: "النقل الطويل بين المناطق" },
    },
  ] satisfies Scene[],
};

/** MSG's own fleet and sites, photographed by MSG (supplied 8 Nov 2026; number plates blurred). For the fleet helix. */
export const msgFleet = {
  title: { en: "MSG's fleet and sites", ar: "أسطول ام اس جي ومواقعها" },
  prev: { en: "Previous photo", ar: "الصورة السابقة" },
  next: { en: "Next photo", ar: "الصورة التالية" },
  scenes: [
    { src: "/media/msg/fleet-hub-front.webp", pos: "50% 60%", alt: { en: "Five MSG Horizons refrigerated vans lined up in front of the MSG hub", ar: "خمس مركبات مبرّدة من ام اس جي هورايزونز أمام مركز ام اس جي" }, caption: { en: "Five vans, ready at the hub", ar: "خمس مركبات جاهزة أمام المركز" } },
    { src: "/media/msg/fleet-hub-side.webp", pos: "45% 60%", alt: { en: "An MSG Horizons van at the hub entrance with the fleet lined up behind it", ar: "مركبة ام اس جي هورايزونز عند مدخل المركز والأسطول مصطف خلفها" }, caption: { en: "At the hub entrance", ar: "عند مدخل المركز" } },
    { src: "/media/msg/fleet-hub-row.webp", pos: "55% 60%", alt: { en: "An MSG Horizons van in front of a row of MSG vans at the hub", ar: "مركبة ام اس جي هورايزونز أمام صف من مركبات ام اس جي عند المركز" }, caption: { en: "The fleet, lined up", ar: "الأسطول مصطفاً" } },
    { src: "/media/msg/fleet-hub.webp", pos: "50% 60%", alt: { en: "MSG Horizons refrigerated vans parked at the MSG hub", ar: "مركبات ام اس جي هورايزونز المبرّدة عند مركز ام اس جي" }, caption: { en: "Refrigerated vans at the hub", ar: "المركبات المبرّدة عند المركز" } },
    { src: "/media/msg/fleet-yard.webp", pos: "45% 55%", alt: { en: "An MSG Horizons Toyota Hiace in a covered yard, the fleet behind it", ar: "مركبة تويوتا هايس من ام اس جي هورايزونز في ساحة مظللة والأسطول خلفها" }, caption: { en: "In the covered yard", ar: "في الساحة المظللة" } },
    { src: "/media/msg/hub-facade-day.webp", pos: "50% 50%", alt: { en: "The front of the MSG Horizons hub in Sabya", ar: "واجهة مركز ام اس جي هورايزونز في صبيا" }, caption: { en: "The Sabya hub", ar: "مركز صبيا" } },
    { src: "/media/msg/hub-team-scan.webp", pos: "50% 45%", alt: { en: "MSG Horizons staff scanning parcels between the racks", ar: "فريق ام اس جي هورايزونز يمسح الطرود بين الرفوف" }, caption: { en: "Scanned on the racks", ar: "المسح على الرفوف" } },
    { src: "/media/msg/outlet-counter.webp", pos: "50% 50%", alt: { en: "The MSG Horizons outlet counter with its framed licences", ar: "كاونتر منفذ ام اس جي هورايزونز وتراخيصه المؤطرة" }, caption: { en: "The MSG outlet", ar: "منفذ ام اس جي" } },
  ],
};
