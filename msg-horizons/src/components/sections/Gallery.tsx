import { media, hasGallery } from "@/content/media";
import type { Dictionary, Locale } from "@/content/i18n";
import PhotoDeck from "@/components/ui/PhotoDeck";

const deckCopy: Record<Locale, { prev: string; next: string; of: string; hint: string }> = {
  en: { prev: "Previous photo", next: "Next photo", of: "{n} / {total}", hint: "Swipe up, tap or use the arrows to deal the next photo." },
  ar: { prev: "الصورة السابقة", next: "الصورة التالية", of: "{n} / {total}", hint: "اسحب للأعلى أو اضغط أو استخدم الأسهم لعرض الصورة التالية." },
};

/** Renders only when verified MSG photography has been added to content/media.ts. */
export default function Gallery({ t, lang }: { t: Dictionary; lang: Locale }) {
  if (!hasGallery) return null;
  const items = [...media.warehouse, ...media.operations, ...media.team, ...media.fleet.slice(1)];
  if (!items.length) return null;
  const c = deckCopy[lang];
  return (
    <section id="gallery" aria-labelledby="gallery-title" className="scroll-mt-24 border-t border-line bg-surface/[0.94] sec">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8">
        <div>
          <p className="text-sm font-semibold text-teal">{t.gallery.eyebrow}</p>
          <h2 id="gallery-title" className="h-section mt-2 text-ink">{t.gallery.title}</h2>
          <p className="mt-5 max-w-md text-lg text-muted">{c.hint}</p>
          <p className="mt-8 text-sm text-ink/60">{t.gallery.note}</p>
        </div>
        <PhotoDeck
          labels={c}
          photos={items.map((m) => ({ src: m.src, alt: m.alt[lang], caption: m.caption?.[lang], width: m.width, height: m.height }))}
        />
      </div>
    </section>
  );
}
