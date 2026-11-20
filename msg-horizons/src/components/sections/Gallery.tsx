import Image from "next/image";
import { media, hasGallery } from "@/content/media";
import type { Dictionary, Locale } from "@/content/i18n";

/**
 * Renders only when verified MSG photography has been added to content/media.ts.
 * The photos are laid out as a plain grid, all visible at once: nothing to drag, swipe or learn, and every caption
 * reads without opening anything. The first photo leads at double size.
 */
export default function Gallery({ t, lang }: { t: Dictionary; lang: Locale }) {
  if (!hasGallery) return null;
  const items = [...media.warehouse, ...media.operations, ...media.team, ...media.fleet.slice(1)];
  if (!items.length) return null;
  return (
    <section id="gallery" aria-labelledby="gallery-title" className="scroll-mt-24 border-t border-line bg-surface/[0.62] sec">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <p className="lbl idx text-brand">{t.gallery.eyebrow}</p>
          <h2 id="gallery-title" className="h-section mt-2 text-ink">{t.gallery.title}</h2>
          <p className="mt-4 text-sm text-ink/75">{t.gallery.note}</p>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {items.map((m, i) => (
            <li key={m.src} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              <figure className="relative h-full overflow-hidden rounded-2xl bg-deep ring-1 ring-line">
                <div className={`relative ${i === 0 ? "aspect-[4/3] h-full" : "aspect-[4/3]"}`}>
                  <Image
                    src={m.src}
                    alt={m.alt[lang]}
                    fill
                    sizes={i === 0 ? "(min-width: 1024px) 640px, 100vw" : "(min-width: 1024px) 320px, 50vw"}
                    className="object-cover"
                  />
                </div>
                {m.caption?.[lang] ? (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10 text-xs font-medium text-white sm:text-sm">
                    {m.caption[lang]}
                  </figcaption>
                ) : null}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
