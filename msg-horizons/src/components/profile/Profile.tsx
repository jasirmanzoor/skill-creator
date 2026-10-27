"use client";

import { useEffect } from "react";
import { profileCopy } from "@/content/profile";
import type { Locale } from "@/content/i18n";
import { layerClosed, layerOpened } from "@/lib/rays-store";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Footer, Header } from "./Chrome";
import Contact from "./Contact";
import Dawn from "./Dawn";
import DayReel from "./DayReel";
import Network from "./Network";
import Paths from "./Paths";
import Scale from "./Scale";
import { startScroll } from "./engine";

/**
 * MSG's company profile as one page (app/[lang]/company-profile), built on the "Selene" landing template MSG sent:
 * the dawn (HORIZONS), a day at the hub, the network, three ways to work with MSG, the scale and the first
 * conversation. It brings its own night ground, so the site's light backdrop rests while it is open.
 */
export default function Profile({ lang }: { lang: Locale }) {
  const c = profileCopy[lang];
  const reduced = useReducedMotion();
  useEffect(() => startScroll(reduced), [reduced]);
  useEffect(() => {
    layerOpened();
    document.documentElement.classList.add("pf-page");
    return () => {
      layerClosed();
      document.documentElement.classList.remove("pf-page");
    };
  }, []);

  return (
    <div className="pf-root bg-[#05070c] text-[#c9d1de]">
      <Header c={c} lang={lang} />
      <main>
        <Dawn c={c} lang={lang} />
        <DayReel c={c} rtl={lang === "ar"} />
        <Network c={c} lang={lang} />
        <Paths c={c} lang={lang} />
        <Scale c={c} />
        <Contact c={c} lang={lang} />
      </main>
      <Footer c={c} lang={lang} />
    </div>
  );
}
