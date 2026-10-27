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
 * FLEET AT WORK: everyday scenes of a delivery fleet in Riyadh (generated photographs, 27 Oct 2026; vans without
 * livery) and the long-haul truck in MSG's new livery. They stay out of the real-photo gallery in content/media.ts.
 */
export const hiaceFleet = {
  title: { en: "The fleet at work, every day.", ar: "الأسطول في العمل، كل يوم." },
  scenes: [
    {
      src: "/media/photos/fleet-depot.webp",
      pos: "55% 62%",
      alt: { en: "A row of white delivery vans at a depot yard, a driver loading the nearest one", ar: "صف من شاحنات التوصيل البيضاء في ساحة المستودع، وسائق يحمّل أقربها" },
      caption: { en: "Loaded at the depot before the first run", ar: "التحميل في المستودع قبل أول رحلة" },
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
