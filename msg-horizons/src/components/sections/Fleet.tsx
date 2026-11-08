import Reveal from "../ui/Reveal";
import OpsClock from "../fleet/OpsClock";
import { dispatchDay, hiaceFleet } from "@/content/scenes";
import ScrollSync from "../ui/ScrollSync";
import type { Dictionary, Locale } from "@/content/i18n";

export default function Fleet({ t, lang }: { t: Dictionary; lang: Locale }) {
  const f = t.fleet;
  return (
    <section id="fleet" aria-labelledby="fleet-title" className="scroll-mt-16 border-t border-line bg-surface/[0.62] sec">
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

        {/* the fleet and a dispatch day, one sharp photo at a time, in step with the captions (ui/ScrollSync) */}
        <div className="mt-16">
          <ScrollSync
            label={`${hiaceFleet.title[lang]} ${dispatchDay.title[lang]}`}
            items={[
              ...hiaceFleet.scenes.map((x) => ({ src: x.src, pos: x.pos, alt: x.alt[lang], title: x.caption[lang], group: hiaceFleet.title[lang] })),
              ...dispatchDay.scenes.map((x) => ({ src: x.src, pos: x.pos, alt: x.alt[lang], title: x.caption[lang], group: dispatchDay.title[lang] })),
            ]}
          />
        </div>

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

