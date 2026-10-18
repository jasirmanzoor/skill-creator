import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/content/i18n";
import Demo from "@/components/demos/starfield-hero-demo";

/** A stand-alone preview of the interactive starfield hero. Unlinked, not in the sitemap, and kept out of search. */
export const metadata: Metadata = { title: "Starfield hero preview", robots: { index: false, follow: false } };

export default async function StarfieldPreview({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <Demo />;
}
