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
    <section id="fleet" aria-labelledby="fleet-title" className="relative scroll-mt-16 overflow-hidden bg-ink-2 py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 lg:grid-cols-2 lg:px-8">
        <div>
          <Reveal>
            <p className="eyebrow text-sun">{f.eyebrow}</p>
            <h2 id="fleet-title" className="mt-4 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl rtl:tracking-normal">
              {f.title}
            </h2>
            <p className="mt-6 max-w-xl text-lg text-mist text-pretty">{f.lead}</p>
          </Reveal>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
            {f.features.map((x, i) => (
              <Reveal as="li" key={x.t} delay={i * 80} className="bg-ink-2 p-6">
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
