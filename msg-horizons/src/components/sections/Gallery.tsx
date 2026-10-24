import { media, hasGallery } from "@/content/media";
import type { Dictionary, Locale } from "@/content/i18n";
import HoverExpand from "@/components/ui/hover-expand";

/** Renders only when verified MSG photography has been added to content/media.ts. */
export default function Gallery({ t, lang }: { t: Dictionary; lang: Locale }) {
  if (!hasGallery) return null;
  const items = [...media.warehouse, ...media.operations, ...media.team, ...media.fleet.slice(1)];
  if (!items.length) return null;
  return (
    <section id="gallery" aria-labelledby="gallery-title" className="scroll-mt-24 border-t border-line bg-surface/[0.94] sec">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <p className="text-sm font-semibold text-teal">{t.gallery.eyebrow}</p>
        <h2 id="gallery-title" className="h-section mt-2 text-ink">{t.gallery.title}</h2>
        <HoverExpand
          className="mt-10"
          items={items.map((m) => ({ src: m.src, alt: m.alt[lang], caption: m.caption?.[lang] }))}
        />
        <p className="mt-4 text-sm text-ink/60">{t.gallery.note}</p>
      </div>
    </section>
  );
}
