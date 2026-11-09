import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/content/i18n";
import { PlanProvider } from "@/components/PlanContext";
import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/hero/Hero";
import Planner from "@/components/sections/Planner";
import TrustBar from "@/components/sections/TrustBar";
import LiveTracking from "@/components/live/LiveTracking";
import Pitch from "@/components/pitch/Pitch";
import EstimatorSection from "@/components/estimator/EstimatorSection";
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
import Perfmix from "@/components/sections/Perfmix";
import Chapter from "@/components/book/Chapter";
import RouteBook from "@/components/book/RouteBook";
import SideMap from "@/components/SideMap";
import RouteRail from "@/components/book/RouteRail";
import Stage from "@/components/book/Stage";
import MaskedHeadings from "@/components/fx/MaskedHeadings";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  // The page is a run of chapters (content/chapters.ts), one after another down a single page, steered from the route
  // rail. The order follows the visitor's decision: who MSG is, live tracking (MSG's difference), why MSG, the price,
  // the plan, the fleet and hubs, the proof, then MSG.
  const c = (n: number, children: React.ReactNode) => <Chapter n={n} lang={lang}>{children}</Chapter>;
  return (
    <PlanProvider>
      <SmoothScroll />
      <SiteHeader t={t} lang={lang} />
      <main id="main" className="push-shift overflow-x-clip">
        {c(0, <>
          <Hero t={t} lang={lang} />
          <TrustBar t={t} lang={lang} />
        </>)}
        {c(1, <ProfileBook t={t} lang={lang} />)}
        {c(2, <Stage><LiveTracking lang={lang} /></Stage>)}
        {c(3, <>
          <Pitch t={t} lang={lang} />
          <Depth><Services t={t} lang={lang} /></Depth>
          <Perfmix lang={lang} />
        </>)}
        {c(4, <Depth><EstimatorSection t={t} lang={lang} /></Depth>)}
        {c(5, <Stage><Planner t={t} lang={lang} /></Stage>)}
        {c(6, <>
          <Depth><Fleet t={t} lang={lang} /></Depth>
          <Depth><Gallery t={t} lang={lang} /></Depth>
        </>)}
        {c(7, <>
          <Depth><Proof t={t} /></Depth>
        </>)}
        {c(8, <Depth><Enterprise t={t} lang={lang} /></Depth>)}
        {c(9, <Depth><Contact t={t} lang={lang} /></Depth>)}
      </main>
      <div className="book-footer">
        <Footer t={t} lang={lang} />
      </div>
      <MobileBar t={t} />
      <RouteRail lang={lang} />
      <SideMap lang={lang} />
      <RouteBook lang={lang} />
      <MaskedHeadings lang={lang} />
    </PlanProvider>
  );
}
