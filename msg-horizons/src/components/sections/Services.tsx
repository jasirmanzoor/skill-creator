"use client";

import { facts } from "@/content/facts";
import { SLUG_FOR } from "@/content/servicePages";
import { serviceHud } from "@/content/serviceHud";
import type { Dictionary, Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { ServiceIcon } from "../ui/icons";
import { PHOTO, ServiceHud } from "../services/ServiceView";
import ServicesList from "../services/ServicesList";
import ScrollExpand from "../fx/ScrollExpand";
import MaskWord from "../fx/MaskWord";

const IDS = facts.services;
const N = IDS.length;
/** The seven services. Under reduced motion they are a plain list with one view beside it. */
export default function Services({ t, lang }: { t: Dictionary; lang: Locale }) {
  const reduce = useReducedMotion();
  if (reduce) return <ServicesList t={t} lang={lang} />;
  return <Stages t={t} lang={lang} />;
}

const hintCopy: Record<Locale, string> = { en: "Scroll to open", ar: "مرّر لفتح المشهد" };

/**
 * The seven services as seven stages, one after another (React Bits' ScrollExpand): each service arrives as a framed
 * photograph with its name cut out of the brand film (components/fx/MaskWord), and as the page scrolls the frame opens to the
 * whole screen, the name lifts away and the service's story, key figure and live panel take the stage. The next
 * service waits framed below. Under reduced motion the services are a plain list with one view beside it.
 */
function Stages({ t, lang }: { t: Dictionary; lang: Locale }) {
  const s = t.services;
  const h = serviceHud[lang];
  const n = (k: number) => String(k).padStart(2, "0");
  return (
    <section id="services" aria-labelledby="services-title" data-theme="dark" className="relative scroll-mt-16 bg-deep/[0.88] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-4 pt-24 lg:px-8 lg:pt-28">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-bright rtl:tracking-normal">{s.eyebrow}</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <h2 id="services-title" className="h-section text-balance">{s.title}</h2>
          <p className="max-w-md text-lg text-white/75 text-pretty lg:justify-self-end">{s.lead}</p>
        </div>
      </div>
      {IDS.map((id, i) => {
        const svc = t.planner.services[id];
        const fact = s.facts[id];
        const slug = SLUG_FOR[id];
        return (
          <ScrollExpand
            key={id}
            src={PHOTO[id].src}
            mediaPosition={PHOTO[id].pos}
            scrollHint={i === 0 ? hintCopy[lang] : ""}
            startWidth={46}
            startHeight={56}
            mobileStart={[86, 46]}
            startRadius={28}
            shape="hex"
            mediaZoom={1.3}
            scrollDistance={0.8}
            holdDistance={0.3}
            overlayScrim={0.55}
            title={
              <div className="w-[min(86vw,46rem)] text-center">
                <p className="num mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-mint rtl:tracking-normal">{n(i + 1)} / {n(N)}</p>
                <MaskWord text={svc.name} lang={lang} scale={0.085} className="w-full font-display text-white" fallbackClassName="block font-display text-[clamp(2rem,6vw,4.5rem)] font-semibold leading-[1.25] text-white" />
              </div>
            }
          >
            <div className="mx-auto grid h-full max-w-7xl content-end items-end gap-6 px-5 pb-44 pt-24 lg:pb-28 lg:grid-cols-[1.15fr_0.85fr] lg:content-center lg:px-8">
              <div className="min-w-0">
                <p className="num text-xs font-semibold uppercase tracking-[0.2em] text-brand-mint rtl:tracking-normal">{n(i + 1)} / {n(N)}</p>
                <h3 className="mt-3 flex items-center gap-3 font-display text-[clamp(2rem,4.6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em] rtl:leading-[1.3] rtl:tracking-normal">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-bright/15 text-brand-bright ring-1 ring-brand-bright/30 sm:size-14 [&_svg]:size-6 sm:[&_svg]:size-7"><ServiceIcon id={id} /></span>
                  {svc.name}
                </h3>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 text-pretty sm:text-lg">{svc.desc}</p>
                <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4">
                  <div>
                    <p className="num font-display text-[clamp(2.8rem,6vw,5.2rem)] font-semibold leading-none tracking-[-0.04em] text-brand-mint rtl:tracking-normal">{fact.v}</p>
                    <p className="mt-2 max-w-xs text-sm text-white/80">{fact.l}</p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {slug ? (
                      <a href={`/${lang}/services/${slug}`} className="group/l inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-teal-deep transition-transform duration-200 hover:-translate-y-0.5">
                        {h.details}
                        <svg viewBox="0 0 24 24" className="size-4 transition-transform duration-200 group-hover/l:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/l:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </a>
                    ) : null}
                    <a href="#planner" className="inline-flex items-center rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-white/20">{s.explore}</a>
                  </div>
                </div>
              </div>
              {/* the service at work */}
              <div className="hidden w-[21rem] justify-self-end rounded-3xl bg-white/95 p-4 text-teal-deep shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/50 lg:block [&_p]:text-[13px] [&_svg]:h-16">
                <ServiceHud id={id} lang={lang} />
                <p className="mt-3 border-t border-teal/10 pt-2 text-[10px]! text-teal-deep/70">{h.note}</p>
              </div>
            </div>
          </ScrollExpand>
        );
      })}
    </section>
  );
}

