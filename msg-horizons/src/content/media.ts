/**
 * MEDIA MANIFEST — drop verified MSG photography here; the site adapts automatically.
 *
 * 1. Put optimised images in /public/media/<group>/ (JPG/WebP, ~2400px wide max).
 * 2. Add an entry below with bilingual alt text describing what is actually shown.
 * 3. The "On the ground" gallery appears automatically once any group has items,
 *    and fleet photos replace the illustrative fleet visual.
 *
 * Only use real MSG Horizons photography here — no stock imagery.
 */
export type MediaItem = {
  src: string;
  width: number;
  height: number;
  alt: { en: string; ar: string };
  caption?: { en: string; ar: string };
};

export const media: Record<"fleet" | "warehouse" | "operations" | "team", MediaItem[]> = {
  fleet: [
    {
      src: "/media/msg/van-road.webp", width: 1200, height: 1600,
      alt: { en: "An MSG delivery van on the road under a cloudy sky", ar: "شاحنة توصيل تابعة لـ ام اس جي على الطريق تحت سماء غائمة" },
      caption: { en: "On the road", ar: "على الطريق" },
    },
  ],
  warehouse: [
    {
      src: "/media/msg/hub-open.webp", width: 1448, height: 1086,
      alt: { en: "The MSG Horizons Sabya hub with its doors open and the floor lit", ar: "مركز ام اس جي في صبيا وأبوابه مفتوحة وأرضيته مضاءة" },
      caption: { en: "Sabya hub, open for the day", ar: "مركز صبيا، مفتوح لليوم" },
    },
    {
      src: "/media/msg/hub-floor.webp", width: 1200, height: 900,
      alt: { en: "Inside the Sabya hub: racking and parcels on the warehouse floor", ar: "داخل مركز صبيا: الرفوف والطرود على أرضية المستودع" },
      caption: { en: "Inside the 1,000 m² floor", ar: "داخل مساحة ١٬٠٠٠ م²" },
    },
    {
      src: "/media/msg/hub-aerial.webp", width: 1448, height: 1086,
      alt: { en: "The Sabya hub seen from the air", ar: "مركز صبيا من الجو" },
      caption: { en: "The hub from the air", ar: "المركز من الجو" },
    },
    {
      src: "/media/msg/interior.jpg", width: 1260, height: 950,
      alt: { en: "Storage aisles inside the Sabya hub", ar: "ممرات التخزين داخل مركز صبيا" },
      caption: { en: "Stock, stored and picked here", ar: "المخزون يُخزَّن ويُجهَّز هنا" },
    },
    {
      src: "/media/msg/hub-racks.webp", width: 1200, height: 1600,
      alt: { en: "Rows of racking full of parcels under the warehouse roof", ar: "صفوف من الرفوف المليئة بالطرود تحت سقف المستودع" },
      caption: { en: "Racked, sorted, ready to go", ar: "على الرفوف، مفرزة وجاهزة" },
    },
    {
      src: "/media/msg/hub-sorting.webp", width: 1600, height: 1200,
      alt: { en: "The sorting floor: roll cages of parcels between the racks", ar: "أرضية الفرز: عربات الطرود بين الرفوف" },
      caption: { en: "The sorting floor", ar: "أرضية الفرز" },
    },
    {
      src: "/media/msg/hub-team.webp", width: 1600, height: 1200,
      alt: { en: "MSG staff at work beside pallets and parcel cages", ar: "فريق ام اس جي يعمل بجوار المنصات وعربات الطرود" },
      caption: { en: "The team on the floor", ar: "الفريق في الموقع" },
    },
    {
      src: "/media/msg/hub-cartons.webp", width: 1200, height: 1600,
      alt: { en: "Cartons staged by the dock, ready to be loaded", ar: "كراتين مجهزة عند منطقة التحميل وجاهزة للشحن" },
      caption: { en: "Staged for dispatch", ar: "جاهزة للإرسال" },
    },
  ],
  operations: [
    {
      src: "/media/msg/outlet.jpg", width: 1210, height: 1700,
      alt: { en: "The walk-in parcel outlet MSG runs as an iMile franchise", ar: "منفذ الطرود الذي تديره ام اس جي كامتياز لـ iMile" },
      caption: { en: "Walk-in parcel outlet", ar: "منفذ استلام الطرود" },
    }
  ],
  team: [],
};

export const hasGallery = Object.values(media).some((g) => g.length > 0);
