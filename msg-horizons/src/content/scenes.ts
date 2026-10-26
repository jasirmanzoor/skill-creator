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
 * HIACE FLEET — renders of MSG's own Toyota Hiace vans (facts.sabyaHub.fleet) in MSG livery at the Sabya hub, supplied
 * by MSG (26 Oct 2026) and shown without a badge at MSG's request. They stay out of the real-photo gallery in
 * content/media.ts; swap in fleet photography when it arrives.
 */
export const hiaceFleet = {
  title: { en: "MSG’s own Hiace vans, ready at the Sabya hub.", ar: "شاحنات هايس المملوكة لـ ام اس جي، جاهزة في مركز صبيا." },
  badge: dispatchDay.badge,
  note: {
    en: "Illustrative renders of MSG’s Toyota Hiace vans at the Sabya hub, not photographs.",
    ar: "صور توضيحية لشاحنات تويوتا هايس التابعة لـ ام اس جي في مركز صبيا، وليست صوراً فوتوغرافية.",
  },
  scenes: [
    {
      src: "/media/msg/fleet-hiace-dusk.webp",
      pos: "70% 92%",
      alt: { en: "A line of white MSG-branded Toyota Hiace vans outside the Sabya hub at sunset", ar: "صف من شاحنات تويوتا هايس البيضاء بشعار ام اس جي أمام مركز صبيا عند الغروب" },
      caption: { en: "Lined up for the evening run", ar: "مصطفّة لجولة المساء" },
    },
    {
      src: "/media/msg/fleet-hiace-close.webp",
      pos: "68% 84%",
      alt: { en: "An MSG-branded Toyota Hiace van parked in front of the open hub doors", ar: "شاحنة تويوتا هايس بشعار ام اس جي متوقفة أمام أبواب المركز المفتوحة" },
      caption: { en: "MSG-owned, tracked on every run", ar: "مملوكة لـ ام اس جي ومتتبَّعة في كل رحلة" },
    },
    {
      src: "/media/msg/fleet-hiace-row.webp",
      pos: "75% 78%",
      alt: { en: "A row of MSG Hiace vans angled outside the hub", ar: "صف من شاحنات هايس التابعة لـ ام اس جي أمام المركز" },
      caption: { en: "The fleet, parked and ready", ar: "الأسطول متوقف وجاهز" },
    },
    {
      src: "/media/msg/fleet-hiace-line.webp",
      pos: "50% 84%",
      alt: { en: "Five MSG Hiace vans facing out from the hub entrance", ar: "خمس شاحنات هايس تابعة لـ ام اس جي متجهة للخارج عند مدخل المركز" },
      caption: { en: "Facing out, first run of the day", ar: "باتجاه الطريق، أول رحلة في اليوم" },
    },
    {
      src: "/media/msg/fleet-hiace-yard.webp",
      pos: "45% 88%",
      alt: { en: "An MSG Hiace van in the hub yard with the fleet behind it", ar: "شاحنة هايس تابعة لـ ام اس جي في ساحة المركز والأسطول خلفها" },
      caption: { en: "From the yard to the route", ar: "من الساحة إلى المسار" },
    },
  ] satisfies Scene[],
};
