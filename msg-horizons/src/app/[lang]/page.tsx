import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/content/i18n";
import { PlanProvider } from "@/components/PlanContext";
import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/hero/Hero";
import HorizonBackdrop from "@/components/HorizonBackdrop";
import Planner from "@/components/sections/Planner";
import TrustBar from "@/components/sections/TrustBar";
import LiveTracking from "@/components/live/LiveTracking";
import Pitch from "@/components/pitch/Pitch";
import NetworkBand from "@/components/sections/NetworkBand";
import GrowthBand from "@/components/sections/GrowthBand";
import { hasPublicFile } from "@/lib/photo-slot";
import LaunchSequence from "@/components/launch/LaunchSequence";
import EstimatorSection from "@/components/estimator/EstimatorSection";
import Partners from "@/components/sections/Partners";
import Services from "@/components/sections/Services";
import Fleet from "@/components/sections/Fleet";
import Enterprise from "@/components/sections/Enterprise";
import Proof from "@/components/sections/Proof";
import Gallery from "@/components/sections/Gallery";
import ProfileBook from "@/components/sections/ProfileBook";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import SmoothScroll from "@/components/spatial/SmoothScroll";
import Depth from "@/components/spatial/Depth";
import Chapter from "@/components/book/Chapter";
import RouteBook from "@/components/book/RouteBook";
import RouteRail from "@/components/book/RouteRail";
import Stage from "@/components/book/Stage";
import TechHeadings from "@/components/fx/TechHeadings";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  // The page is a book of chapters (content/chapters.ts): one open at a time, turned like pages and steered from the
  // route rail. The order follows the visitor's decision: who MSG is, the price, the plan, then the proof, then MSG.
  const c = (n: number, children: React.ReactNode) => <Chapter n={n} lang={lang}>{children}</Chapter>;
  return (
    <PlanProvider>
      <SmoothScroll />
      <HorizonBackdrop />
      <SiteHeader t={t} lang={lang} />
      <main id="main" className="push-shift overflow-x-clip">
        {c(0, <>
          <Hero t={t} lang={lang} />
          <TrustBar t={t} lang={lang} />
        </>)}
        {c(1, <>
          <Pitch t={t} lang={lang} />
          <Depth><Services t={t} lang={lang} /></Depth>
        </>)}
        {c(2, <Depth><EstimatorSection t={t} lang={lang} /></Depth>)}
        {c(3, <Stage><Planner t={t} lang={lang} /></Stage>)}
        {c(4, <>
          <Stage><LiveTracking lang={lang} /></Stage>
          <Depth><NetworkBand lang={lang} coastPhoto={hasPublicFile("coast.jpg")} /></Depth>
          <Depth><LaunchSequence t={t} lang={lang} /></Depth>
        </>)}
        {c(5, <>
          <Depth><Fleet t={t} lang={lang} /></Depth>
          <Depth><GrowthBand lang={lang} warehousePhoto={hasPublicFile("warehouse.jpg")} /></Depth>
          <Depth><Gallery t={t} lang={lang} /></Depth>
        </>)}
        {c(6, <>
          <Depth><Proof t={t} /></Depth>
          <Depth><ProfileBook t={t} lang={lang} /></Depth>
          <Depth><Partners lang={lang} /></Depth>
        </>)}
        {c(7, <Depth><Enterprise t={t} lang={lang} /></Depth>)}
        {c(8, <Depth><Contact t={t} lang={lang} /></Depth>)}
      </main>
      <div className="book-footer">
        <Footer t={t} lang={lang} />
      </div>
      <MobileBar t={t} />
      <RouteRail lang={lang} />
      <RouteBook lang={lang} />
      <TechHeadings lang={lang} />
    </PlanProvider>
  );
}
