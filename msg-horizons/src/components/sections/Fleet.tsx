import Image from "next/image";
import Reveal from "../ui/Reveal";
import OpsClock from "../fleet/OpsClock";
import { media } from "@/content/media";
import { dispatchDay } from "@/content/scenes";
import HoverExpand from "../ui/hover-expand";
import type { Dictionary, Locale } from "@/content/i18n";

export default function Fleet({ t, lang }: { t: Dictionary; lang: Locale }) {
  const f = t.fleet;
  const photo = media.fleet[0];
  return (
    <section id="fleet" aria-labelledby="fleet-title" className="scroll-mt-16 border-t border-line bg-surface/[0.94] sec">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <h2 id="fleet-title" className="h-section text-ink">
              {f.title}
            </h2>
            <p className="mt-6 max-w-xl text-lg text-muted text-pretty">{f.lead}</p>
          </Reveal>
          <Reveal delay={100} className="rounded-xl border border-line bg-paper p-8">
            <OpsClock now={f.clockNow} running={f.clockRunning} sub={f.clockSub} lang={lang} />
          </Reveal>
        </div>

        <div className="mt-16">
          <h3 className="text-xl font-semibold text-ink">{dispatchDay.title[lang]}</h3>
          <HoverExpand
            className="mt-6"
            badge={dispatchDay.badge[lang]}
            items={dispatchDay.scenes.map((x) => ({ src: x.src, pos: x.pos, alt: x.alt[lang], caption: x.caption[lang] }))}
          />
          <p className="mt-4 text-sm text-ink/60">{dispatchDay.note[lang]}</p>
        </div>

        {photo ? (
          <figure className="mt-16 overflow-hidden rounded-xl border border-line">
            <Image src={photo.src} width={photo.width} height={photo.height} alt={photo.alt[lang]} className="aspect-[4/5] w-full object-cover sm:aspect-[21/9]" style={{ objectPosition: "72% 64%" }} sizes="(min-width:1280px) 1216px, 100vw" />
            {photo.caption ? <figcaption className="p-4 text-sm text-muted">{photo.caption[lang]}</figcaption> : null}
          </figure>
        ) : null}

        <dl className="mt-16 grid border-t border-line lg:grid-cols-2 lg:gap-x-16">
          {f.features.map((x) => (
            <div key={x.t} className="grid gap-1 border-b border-line py-5 sm:grid-cols-[13rem_1fr] sm:gap-6">
              <dt className="font-semibold text-ink">{x.t}</dt>
              <dd className="text-sm leading-relaxed text-muted">{x.d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

