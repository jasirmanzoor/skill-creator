/**
 * ILLUSTRATIVE SCENES — AI-generated images of an ordinary dispatch day (24 Oct 2026, see docs/CONTENT-NOTES.md).
 * They are not MSG photographs: no MSG branding was added, every tile carries an "Illustrative" badge, and they stay
 * out of the real-photo gallery in content/media.ts. Replace each with MSG's own shot of the same moment when it arrives.
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
