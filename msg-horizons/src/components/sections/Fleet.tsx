import Image from "next/image";
import Reveal from "../ui/Reveal";
import OpsClock from "../fleet/OpsClock";
import { media } from "@/content/media";
import type { Dictionary, Locale } from "@/content/i18n";

export default function Fleet({ t, lang }: { t: Dictionary; lang: Locale }) {
  const f = t.fleet;
  const photo = media.fleet[0];
  return (
    <section id="fleet" aria-labelledby="fleet-title" className="scroll-mt-16 border-t border-line bg-surface/90 py-24 backdrop-blur lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="label">{f.eyebrow}</span>
            <h2 id="fleet-title" className="mt-4 font-display text-4xl font-semibold tracking-[-0.025em] text-ink text-balance sm:text-5xl rtl:tracking-normal">
              {f.title}
            </h2>
            <p className="mt-6 max-w-xl text-lg text-muted text-pretty">{f.lead}</p>
          </Reveal>
          <Reveal delay={100} className="rounded-xl border border-line bg-paper p-8">
            <OpsClock now={f.clockNow} running={f.clockRunning} sub={f.clockSub} lang={lang} />
          </Reveal>
        </div>

        {photo ? (
          <figure className="mt-16 overflow-hidden rounded-xl border border-line">
            <Image src={photo.src} width={photo.width} height={photo.height} alt={photo.alt[lang]} className="h-auto w-full object-cover" sizes="(min-width:1280px) 1216px, 100vw" />
            {photo.caption ? <figcaption className="p-4 text-sm text-muted">{photo.caption[lang]}</figcaption> : null}
          </figure>
        ) : null}

        <ul className="mt-16 grid gap-x-10 gap-y-10 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {f.features.map((x, i) => (
            <Reveal as="li" key={x.t} delay={i * 70}>
              <span className="inline-flex size-9 items-center justify-center rounded-md bg-subtle text-ink">
                <FeatureIcon i={i} />
              </span>
              <p className="mt-4 font-semibold text-ink">{x.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{x.d}</p>
            </Reveal>
          ))}
        </ul>
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
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true" {...common}>
      {d}
    </svg>
  );
}
