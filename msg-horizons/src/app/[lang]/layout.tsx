import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { IBM_Plex_Sans_Arabic, Inter, Inter_Tight } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { LOCALES, dirOf, getDictionary, isLocale, type Locale } from "@/content/i18n";
import { SITE_URL, facts } from "@/content/facts";
import "../globals.css";

const display = Inter_Tight({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display-latin", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans-latin", display: "swap" });
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}
export const dynamicParams = false;

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.title, template: `%s | ${facts.name}` },
    description: t.meta.description,
    applicationName: facts.name,
    keywords:
      lang === "ar"
        ? ["شركة توصيل في السعودية", "توصيل الميل الأخير", "شركة لوجستية الرياض", "شحن المتاجر الإلكترونية", "خدمات لوجستية السعودية", "توفير مناديب توصيل", "تخزين ومستودعات الرياض", "إدارة أساطيل"]
        : ["last mile delivery Saudi Arabia", "logistics company Riyadh", "e-commerce delivery KSA", "courier company Saudi Arabia", "3PL Saudi Arabia", "delivery partner for online stores", "warehousing Riyadh", "fleet management KSA", "logistics manpower Saudi Arabia"],
    alternates: {
      canonical: `/${lang}`,
      languages: { en: "/en", ar: "/ar", "x-default": "/en" },
    },
    openGraph: {
      type: "website",
      siteName: facts.name,
      url: `/${lang}`,
      title: t.meta.title,
      description: t.meta.description,
      locale: lang === "ar" ? "ar_SA" : "en_SA",
      alternateLocale: lang === "ar" ? ["en_SA"] : ["ar_SA"],
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description },
    robots: { index: true, follow: true },
    formatDetection: { telephone: true, email: true, address: true },
    category: "logistics",
  };
}

export const viewport: Viewport = {
  themeColor: "#fafaf7",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

function jsonLd(lang: Locale) {
  const t = getDictionary(lang);
  const services = Object.values(t.planner.services);
  const org = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: facts.name,
        legalName: facts.legalName,
        alternateName: facts.nameAr,
        url: SITE_URL,
        logo: `${SITE_URL}/icon.svg`,
        email: facts.contact.email,
        telephone: facts.contact.phoneE164,
        taxID: facts.corporate.taxId,
        numberOfEmployees: { "@type": "QuantitativeValue", minValue: facts.metrics.couriers.value },
        address: {
          "@type": "PostalAddress",
          streetAddress: facts.contact.street,
          addressLocality: facts.contact.city,
          postalCode: facts.contact.postalCode,
          addressCountry: facts.contact.country,
        },
        areaServed: { "@type": "Country", name: "Saudi Arabia" },
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: facts.contact.phoneE164,
            email: facts.contact.email,
            contactType: "sales",
            areaServed: "SA",
            availableLanguage: ["en", "ar"],
          },
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: lang === "ar" ? "الخدمات اللوجستية" : "Logistics services",
          itemListElement: services.map((s) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: s.name, description: s.desc, areaServed: "SA" },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: facts.name,
        inLanguage: ["en", "ar"],
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/${lang}#webpage`,
        url: `${SITE_URL}/${lang}`,
        name: t.meta.title,
        description: t.meta.description,
        inLanguage: lang,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
  return JSON.stringify(org).replace(/</g, "\\u003c");
}

export default async function RootLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html
      lang={lang}
      dir={dirOf(lang)}
      className={`${display.variable} ${sans.variable} ${arabic.variable}`}
    >
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(lang) }} />
        {children}
        {/* Enable Web Analytics + Speed Insights in the Vercel dashboard, then set NEXT_PUBLIC_VERCEL_ANALYTICS=1. */}
        {process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === "1" ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
        {gaId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
