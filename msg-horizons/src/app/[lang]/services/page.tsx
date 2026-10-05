import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Logo from "@/components/ui/Logo";
import Footer from "@/components/Footer";
import ServiceScene from "@/components/scenes/ServiceScene";
import { ArrowIcon } from "@/components/ui/icons";
import { getDictionary, isLocale } from "@/content/i18n";
import { SERVICE_SLUGS, pageChrome, servicePages } from "@/content/servicePages";

type Props = { params: Promise<{ lang: string }> };

const copy = {
  en: {
    title: "Logistics Services in Saudi Arabia",
    description: "Last-mile delivery, e-commerce delivery, warehousing, land freight, fleet management and delivery manpower across Saudi Arabia from MSG Horizons, Riyadh.",
    h1: "Logistics services across Saudi Arabia",
    lead: "One accountable partner for delivery, storage, freight, fleet and people — run from Riyadh with 1,000+ couriers, 100+ vehicles and 24/7 operations.",
  },
  ar: {
    title: "خدمات لوجستية في السعودية",
    description: "توصيل الميل الأخير وتوصيل طلبات المتاجر والتخزين والشحن البري وإدارة الأساطيل وتوفير مناديب التوصيل في السعودية من MSG Horizons بالرياض.",
    h1: "خدمات لوجستية في أنحاء السعودية",
    lead: "شريك واحد مسؤول عن التوصيل والتخزين والشحن والأسطول والقوى العاملة، من الرياض بأكثر من 1,000 مندوب و100 مركبة وتشغيل على مدار الساعة.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: copy[lang].title,
    description: copy[lang].description,
    alternates: { canonical: `/${lang}/services`, languages: { en: "/en/services", ar: "/ar/services", "x-default": "/en/services" } },
  };
}

export default async function ServicesIndex({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const c = pageChrome[lang];
  const other = lang === "en" ? "ar" : "en";
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
          <a href={`/${lang}`} className="rounded" aria-label="MSG Horizons"><Logo /></a>
          <nav className="flex items-center gap-2 sm:gap-4">
            <a href={`/${other}/services`} hrefLang={other} className="rounded px-2 py-1 text-sm text-muted hover:text-ink">{c.langSwitch}</a>
            <a href={`/${lang}#planner`} className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-3">{t.nav.cta}</a>
          </nav>
        </div>
      </header>
      <main id="main" className="bg-paper">
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-16 lg:px-8">
          <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-6xl rtl:tracking-normal">{copy[lang].h1}</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">{copy[lang].lead}</p>
        </section>
        <ul className="mx-auto grid max-w-7xl gap-5 px-5 pb-24 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">
          {SERVICE_SLUGS.map((slug) => {
            const pg = servicePages[lang][slug];
            return (
              <li key={slug}>
                <a href={`/${lang}/services/${slug}`} className="group block h-full overflow-hidden rounded-xl border border-line bg-surface hover:border-ink">
                  <ServiceScene id={pg.scene} />
                  <div className="p-6">
                    <p className="text-sm font-medium text-brand">{pg.eyebrow}</p>
                    <h2 className="mt-2 font-display text-xl font-semibold text-ink">{pg.h1}</h2>
                    <p className="mt-2 text-sm text-muted">{pg.metaDescription}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                      {lang === "ar" ? "اعرف المزيد" : "Learn more"} <ArrowIcon className="size-4 rtl:rotate-180" />
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </main>
      <Footer t={t} lang={lang} />
    </>
  );
}
