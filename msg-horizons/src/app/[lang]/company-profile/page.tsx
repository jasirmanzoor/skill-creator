import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IBM_Plex_Mono } from "next/font/google";
import Profile from "@/components/profile/Profile";
import { facts } from "@/content/facts";
import { isLocale, type Locale } from "@/content/i18n";
import { profileCopy } from "@/content/profile";

/** The HUD's telemetry type: IBM Plex Mono, as in the template MSG supplied (clocks, coordinates, labels). */
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-pf-mono", display: "swap" });

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const c = profileCopy[lang];
  const path = `/${lang}/company-profile`;
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: { canonical: path, languages: { en: "/en/company-profile", ar: "/ar/company-profile", "x-default": "/en/company-profile" } },
    openGraph: { type: "website", siteName: facts.name, url: path, title: `${c.meta.title} | ${facts.name}`, description: c.meta.description, locale: lang === "ar" ? "ar_SA" : "en_SA" },
  };
}

export default async function CompanyProfilePage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <div className={mono.variable}>
      <Profile lang={lang as Locale} />
    </div>
  );
}
