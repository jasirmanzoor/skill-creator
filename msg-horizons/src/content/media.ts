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
  warehouse: [],
  operations: [],
  team: [],
};

export const hasGallery = Object.values(media).some((g) => g.length > 0);
