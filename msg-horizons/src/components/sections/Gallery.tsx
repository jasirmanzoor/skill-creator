import Image from "next/image";
import { media, hasGallery } from "@/content/media";
import type { Dictionary, Locale } from "@/content/i18n";

/** Renders only when verified MSG photography has been added to content/media.ts. */
export default function Gallery({ t, lang }: { t: Dictionary; lang: Locale }) {
  if (!hasGallery) return null;
  const items = [...media.warehouse, ...media.operations, ...media.team, ...media.fleet.slice(1)];
  if (!items.length) return null;
  return (
    <section id="gallery" aria-labelledby="gallery-title" className="scroll-mt-24 border-t border-line bg-surface/92 py-24 backdrop-blur">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <span className="label">{t.gallery.eyebrow}</span>
        <h2 id="gallery-title" className="mt-4 font-display text-4xl font-semibold tracking-[-0.025em] text-ink">{t.gallery.title}</h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <li key={m.src} className="overflow-hidden rounded-xl border border-line">
              <Image src={m.src} width={m.width} height={m.height} alt={m.alt[lang]} className="h-full w-full object-cover" sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
