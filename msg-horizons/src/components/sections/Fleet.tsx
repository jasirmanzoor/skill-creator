import Image from "next/image";
import Reveal from "../ui/Reveal";
import OpsClock from "../fleet/OpsClock";
import FleetIllustration from "../fleet/FleetIllustration";
import { media } from "@/content/media";
import type { Dictionary, Locale } from "@/content/i18n";

export default function Fleet({ t, lang }: { t: Dictionary; lang: Locale }) {
  const f = t.fleet;
  const photo = media.fleet[0];
  return (
    <section id="fleet" aria-labelledby="fleet-title" className="section-glow relative scroll-mt-16 overflow-hidden bg-ink-2 py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 lg:grid-cols-2 lg:px-8">
        <div>
          <Reveal>
            <p className="eyebrow text-sun">{f.eyebrow}</p>
            <h2 id="fleet-title" className="mt-4 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl rtl:tracking-normal">
              {f.title.split(". ")[0]}.{" "}
              <span className="text-sun-gradient">{f.title.split(". ").slice(1).join(". ")}</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg text-mist text-pretty">{f.lead}</p>
          </Reveal>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
            {f.features.map((x, i) => (
              <Reveal as="li" key={x.t} delay={i * 80} className="group bg-ink-2 p-6 transition-colors hover:bg-ink-3">
                <span className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-sun/10 text-sun transition-colors group-hover:bg-sun group-hover:text-ink">
                  <FeatureIcon i={i} />
                </span>
                <p className="font-semibold text-white">{x.t}</p>
                <p className="mt-2 text-sm leading-relaxed text-fog">{x.d}</p>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <Reveal className="rounded-3xl border border-line bg-ink/60 p-6 sm:p-8">
            <OpsClock now={f.clockNow} running={f.clockRunning} sub={f.clockSub} lang={lang} />
          </Reveal>
          <Reveal delay={120}>
            {photo ? (
              <figure className="overflow-hidden rounded-3xl border border-line">
                <Image src={photo.src} width={photo.width} height={photo.height} alt={photo.alt[lang]} className="h-auto w-full object-cover" sizes="(min-width:1024px) 50vw, 100vw" />
                {photo.caption ? <figcaption className="p-4 text-sm text-fog">{photo.caption[lang]}</figcaption> : null}
              </figure>
            ) : (
              <FleetIllustration vans={f.vans} trucks={f.trucks} caption={f.fleetCaption} />
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FeatureIcon({ i }: { i: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const d = [
    <><circle cx="12" cy="13" r="8" /><path d="M12 13l4-3M12 5V3M8 3h8" /></>,
    <><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="m9 12 2 2 4-4" /></>,
    <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    <><path d="M2 6h12v10H2zM14 9h5l3 4v3h-8" /><circle cx="6" cy="17.5" r="1.8" /><circle cx="18" cy="17.5" r="1.8" /></>,
  ][i];
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" {...common}>
      {d}
    </svg>
  );
}
