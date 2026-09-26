import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServicePageView from "@/components/ServicePageView";
import { SITE_URL, facts } from "@/content/facts";
import { getDictionary, isLocale, type Locale } from "@/content/i18n";
import { SERVICE_SLUGS, isServiceSlug, pageChrome, servicePages, type ServiceSlug } from "@/content/servicePages";

type Props = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !isServiceSlug(slug)) return {};
  const pg = servicePages[lang][slug];
  const path = `/${lang}/services/${slug}`;
  return {
    title: pg.metaTitle,
    description: pg.metaDescription,
    keywords: pg.keywords,
    alternates: {
      canonical: path,
      languages: { en: `/en/services/${slug}`, ar: `/ar/services/${slug}`, "x-default": `/en/services/${slug}` },
    },
    openGraph: {
      type: "website",
      siteName: facts.name,
      url: path,
      title: pg.metaTitle,
      description: pg.metaDescription,
      locale: lang === "ar" ? "ar_SA" : "en_SA",
    },
  };
}

function jsonLd(lang: Locale, slug: ServiceSlug) {
  const pg = servicePages[lang][slug];
  const c = pageChrome[lang];
  const url = `${SITE_URL}/${lang}/services/${slug}`;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: pg.h1,
        description: pg.metaDescription,
        serviceType: pg.eyebrow,
        url,
        inLanguage: lang,
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "Country", name: "Saudi Arabia" },
        audience: pg.forWho.map((a) => ({ "@type": "BusinessAudience", name: a })),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: pg.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: c.home, item: `${SITE_URL}/${lang}` },
          { "@type": "ListItem", position: 2, name: c.services, item: `${SITE_URL}/${lang}/services` },
          { "@type": "ListItem", position: 3, name: pg.eyebrow, item: url },
        ],
      },
    ],
  }).replace(/</g, "\\u003c");
}

export default async function ServicePage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !isServiceSlug(slug)) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(lang, slug) }} />
      <ServicePageView t={getDictionary(lang)} lang={lang} slug={slug} />
    </>
  );
}
