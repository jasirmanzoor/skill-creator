import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/content/i18n";
import { PlanProvider } from "@/components/PlanContext";
import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/hero/Hero";
import Planner from "@/components/sections/Planner";
import LiveTracking from "@/components/live/LiveTracking";
import Pitch from "@/components/pitch/Pitch";
import EstimatorSection from "@/components/estimator/EstimatorSection";
import Services from "@/components/sections/Services";
import Fleet from "@/components/sections/Fleet";
import Enterprise from "@/components/sections/Enterprise";
import Proof from "@/components/sections/Proof";
import Gallery from "@/components/sections/Gallery";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import Perfmix from "@/components/sections/Perfmix";
import Chapter from "@/components/book/Chapter";
import NetworkMap from "@/components/network/NetworkMap";
import OrderSequence from "@/components/operation/OrderSequence";
import RouteBook from "@/components/book/RouteBook";
import DirectorOutro from "@/components/sections/DirectorOutro";
import RouteRail from "@/components/book/RouteRail";
import Stage from "@/components/book/Stage";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  // Six chapters (content/chapters.ts) down one page, steered from the route rail: Start, Scale, Solutions, Network,
  // Infrastructure, Configure. The company's longer story lives on its own page (/company-profile).
  const c = (n: number, children: React.ReactNode) => <Chapter n={n} lang={lang}>{children}</Chapter>;
  return (
    <PlanProvider>
      <SiteHeader t={t} lang={lang} />
      <main id="main" className="push-shift overflow-x-clip">
        {c(0, <Hero t={t} lang={lang} />)}
        {c(1, <Proof t={t} lang={lang} />)}
        {c(2, <>
          <Pitch t={t} lang={lang} />
          <Services t={t} lang={lang} />
        </>)}
        {c(3, <>
          <NetworkMap lang={lang} />
          <OrderSequence lang={lang} />
          <Stage><LiveTracking lang={lang} /></Stage>
        </>)}
        {c(4, <>
          <Fleet t={t} lang={lang} />
          <Gallery t={t} lang={lang} />
          <Perfmix lang={lang} />
          <Enterprise t={t} lang={lang} />
        </>)}
        {c(5, <>
          <EstimatorSection t={t} lang={lang} />
          <Stage><Planner t={t} lang={lang} /></Stage>
          <Contact t={t} lang={lang} />
          <DirectorOutro lang={lang} />
        </>)}
      </main>
      <div className="book-footer">
        <Footer t={t} lang={lang} />
      </div>
      <MobileBar t={t} />
      <RouteRail lang={lang} />
      <RouteBook lang={lang} />
    </PlanProvider>
  );
}
