import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/content/i18n";
import { PlanProvider } from "@/components/PlanContext";
import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/hero/Hero";
import Planner from "@/components/sections/Planner";
import Sellers from "@/components/sections/Sellers";
import Services from "@/components/sections/Services";
import Fleet from "@/components/sections/Fleet";
import Enterprise from "@/components/sections/Enterprise";
import Proof from "@/components/sections/Proof";
import Gallery from "@/components/sections/Gallery";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  // Narrative order: feel the scale → "what are you moving?" → this is for me →
  // what MSG does → how it runs → proof → act.
  return (
    <PlanProvider>
      <SiteHeader t={t} lang={lang} />
      <main id="main">
        <Hero t={t} lang={lang} />
        <Planner t={t} />
        <Sellers t={t} />
        <Services t={t} />
        <Fleet t={t} lang={lang} />
        <Enterprise t={t} />
        <Proof t={t} />
        <Gallery t={t} lang={lang} />
        <Contact t={t} lang={lang} />
      </main>
      <Footer t={t} lang={lang} />
      <MobileBar t={t} />
    </PlanProvider>
  );
}
