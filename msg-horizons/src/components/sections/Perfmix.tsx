import Image from "next/image";
import { facts } from "@/content/facts";
import type { Locale } from "@/content/i18n";
import Reveal from "../ui/Reveal";

const copy: Record<Locale, { eyebrow: string; title: string; lead: string; visit: string; newTab: string; separate: string; cards: { key: "mens" | "unisex" | "alternatives"; label: string; alt: string }[] }> = {
  en: {
    eyebrow: "Also from MSG Horizons",
    title: "We run an online store too.",
    lead: "Perfmix is our own e-commerce store, for perfumes and beauty. We sell online ourselves, so we know what a seller needs.",
    visit: "Visit Perfmix",
    newTab: "opens perfmix.com in a new tab",
    separate: "Perfmix is a separate store at perfmix.com. The pictures are its own.",
    cards: [
      { key: "mens", label: "Men’s perfumes", alt: "Perfmix men’s perfumes: a bottle wrapped in the store’s ribbon" },
      { key: "unisex", label: "Unisex perfumes", alt: "Perfmix unisex perfumes: three bottles with the store’s red ribbon" },
      { key: "alternatives", label: "Perfume alternatives", alt: "Perfmix perfume alternatives: bottles wrapped in the store’s ribbon" },
    ],
  },
  ar: {
    eyebrow: "أيضاً من ام اس جي هورايزونز",
    title: "نحن نبيع عبر الإنترنت أيضاً.",
    lead: "بيرفمكس هو متجرنا الإلكتروني الخاص للعطور ومنتجات التجميل. نبيع أونلاين بأنفسنا، فنعرف ما يحتاجه البائع.",
    visit: "زيارة بيرفمكس",
    newTab: "يفتح perfmix.com في تبويب جديد",
    separate: "بيرفمكس متجر مستقل على perfmix.com، والصور من المتجر نفسه.",
    cards: [
      { key: "mens", label: "عطور رجالية", alt: "عطور رجالية من بيرفمكس: زجاجة ملفوفة بشريط المتجر" },
      { key: "unisex", label: "عطور للجنسين", alt: "عطور للجنسين من بيرفمكس: ثلاث زجاجات مع شريط المتجر الأحمر" },
      { key: "alternatives", label: "بدائل العطور", alt: "بدائل العطور من بيرفمكس: زجاجات ملفوفة بشريط المتجر" },
    ],
  },
};

const IMG = { mens: "/media/perfmix/mens.webp", unisex: "/media/perfmix/unisex.webp", alternatives: "/media/perfmix/alternatives.webp" } as const;

/**
 * MSG's own e-commerce store, Perfmix (facts.ownStore), shown as three of its category banners that open the store.
 * perfmix.com cannot be framed (it only allows Salla to), so this is a native card set with links out. The store's
 * own pictures and category links are used as they are; no price, promotion or shipping claim of the store is repeated.
 */
export default function Perfmix({ lang }: { lang: Locale }) {
  const c = copy[lang];
  const store = facts.ownStore;
  return (
    <section id="perfmix" aria-labelledby="perfmix-title" className="relative border-t border-line bg-surface/[0.62] sec">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <Reveal>
            <p className="text-sm font-semibold text-teal">{c.eyebrow}</p>
            <h2 id="perfmix-title" className="h-section mt-2 text-ink">{c.title}</h2>
            <p className="mt-5 max-w-xl text-lg text-muted text-pretty">{c.lead}</p>
          </Reveal>
          <Reveal delay={100} className="lg:justify-self-end">
            <a
              href={store.url}
              target="_blank"
              rel="noopener"
              className="group inline-flex min-h-14 items-center gap-4 rounded-full border border-line-strong bg-surface px-6 py-3 text-ink shadow-[var(--shadow-card)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              <Image src="/media/perfmix/wordmark.png" alt={store.name} width={500} height={78} className="h-5 w-auto dark:invert" />
              <span className="h-5 w-px bg-line-strong" aria-hidden="true" />
              <span className="font-semibold">{c.visit}</span>
              <span className="sr-only"> ({c.newTab})</span>
              <svg viewBox="0 0 24 24" className="size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17 17 7M8 7h9v9" />
              </svg>
            </a>
          </Reveal>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {c.cards.map((card, i) => (
            <Reveal as="li" key={card.key} delay={i * 90} className={i === 1 ? "sm:translate-y-6" : ""}>
              <a
                href={store.categories[card.key]}
                target="_blank"
                rel="noopener"
                className="group block overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)]"
              >
                <span className="block overflow-hidden bg-white">
                  <Image src={IMG[card.key]} alt={card.alt} width={1440} height={685} sizes="(min-width:1280px) 384px, (min-width:640px) 30vw, 92vw" className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.04]" />
                </span>
                <span className="flex items-center justify-between gap-3 px-4 py-3.5 font-semibold text-ink">
                  {card.label}
                  <span className="sr-only"> ({c.newTab})</span>
                  <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-brand transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M7 17 17 7M8 7h9v9" />
                  </svg>
                </span>
              </a>
            </Reveal>
          ))}
        </ul>
        <p className="mt-12 text-sm text-ink/60 sm:mt-14">{c.separate}</p>
      </div>
    </section>
  );
}
