import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IBM_Plex_Mono } from "next/font/google";
import Deck from "@/components/profile/deck/Deck";
import { facts } from "@/content/facts";
import { isLocale, type Locale } from "@/content/i18n";
import { profileCopy } from "@/content/profile";

const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-pf-mono", display: "swap" });

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const c = profileCopy[lang];
  const path = `/${lang}/company-profile/deck`;
  return {
    title: `${c.meta.title} · ${lang === "ar" ? "الكتيّب" : "Deck"}`,
    description: c.meta.description,
    alternates: { canonical: path, languages: { en: "/en/company-profile/deck", ar: "/ar/company-profile/deck" } },
    openGraph: { type: "website", siteName: facts.name, url: path, title: `${c.meta.title} | ${facts.name}`, description: c.meta.description },
  };
}

export default async function DeckPage({ params, searchParams }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const print = "print" in (await searchParams);
  return (
    <div className={mono.variable}>
      <Deck lang={lang as Locale} print={print} />
    </div>
  );
}
