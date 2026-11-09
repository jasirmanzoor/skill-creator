import Image from "next/image";
import type { Locale } from "@/content/i18n";

const copy: Record<Locale, { alt: string; role: string }> = {
  en: { alt: "Jasir Manzoor, Operations Director of MSG Horizons: “Turning strategy into action. Delivering excellence every day.”", role: "Operations Director, MSG Horizons" },
  ar: { alt: "Jasir Manzoor، مدير العمليات في ام اس جي هورايزونز: «نحوّل الاستراتيجية إلى عمل، ونقدّم التميّز كل يوم.»", role: "مدير العمليات، ام اس جي هورايزونز" },
};

/** A short outro before the footer: MSG's Operations Director, on his own card (supplied by MSG, 9 Nov 2026). */
export default function DirectorOutro({ lang }: { lang: Locale }) {
  const c = copy[lang];
  return (
    <section aria-label={c.role} data-theme="dark" className="bg-[#0b1326] px-5 py-16 lg:px-8 lg:py-20">
      <figure className="mx-auto max-w-6xl">
        <div className="relative aspect-[1672/941] overflow-hidden rounded-[1.75rem] ring-1 ring-white/10 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)]">
          <Image src="/leadership/director-banner.webp" alt={c.alt} fill sizes="(min-width:1200px) 1152px, 92vw" className="object-cover" />
        </div>
        <figcaption className="mt-5 flex flex-wrap items-baseline justify-between gap-3 text-white">
          <span className="font-display text-xl font-semibold" dir="ltr">Jasir Manzoor</span>
          <span className="text-sm text-white/65">{c.role}</span>
        </figcaption>
      </figure>
    </section>
  );
}
