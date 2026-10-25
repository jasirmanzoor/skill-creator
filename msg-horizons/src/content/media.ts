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
  fleet: [],
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
