import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/content/i18n";
import { PlanProvider } from "@/components/PlanContext";
import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/hero/Hero";
import NetworkPanel from "@/components/hero/NetworkPanel";
import HorizonBackdrop from "@/components/HorizonBackdrop";
import Planner from "@/components/sections/Planner";
import TrustBar from "@/components/sections/TrustBar";
import NetworkBand from "@/components/sections/NetworkBand";
import GrowthBand from "@/components/sections/GrowthBand";
import { hasPublicFile } from "@/lib/photo-slot";
import Needs from "@/components/sections/Needs";
import RoadmapSection from "@/components/roadmap/RoadmapSection";
import Partners from "@/components/sections/Partners";
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

  // First 20s is the product: decide who you are, see the live network, finish the plan.
  // Story sections come after the visitor already has a named setup in motion.
  return (
    <PlanProvider>
      <HorizonBackdrop />
      <SiteHeader t={t} lang={lang} />
      <main id="main">
        <Hero t={t} lang={lang} />
        <NetworkPanel t={t} />
        <TrustBar t={t} lang={lang} />
        <Needs lang={lang} />
        <Planner t={t} lang={lang} />
        <NetworkBand lang={lang} coastPhoto={hasPublicFile("coast.jpg")} />
        <RoadmapSection t={t} lang={lang} />
        <Services t={t} lang={lang} />
        <Fleet t={t} lang={lang} />
        <Partners lang={lang} />
        <Proof t={t} />
        <Gallery t={t} lang={lang} />
        <GrowthBand lang={lang} warehousePhoto={hasPublicFile("warehouse.jpg")} />
        <Enterprise t={t} />
        <Contact t={t} lang={lang} />
      </main>
      <Footer t={t} lang={lang} />
      <MobileBar t={t} />
    </PlanProvider>
  );
}
