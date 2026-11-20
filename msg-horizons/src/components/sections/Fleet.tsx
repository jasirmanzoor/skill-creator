import Reveal from "../ui/Reveal";
import OpsClock from "../fleet/OpsClock";
import { msgFleet } from "@/content/scenes";
import Image from "next/image";
import type { Dictionary, Locale } from "@/content/i18n";

export default function Fleet({ t, lang }: { t: Dictionary; lang: Locale }) {
  const f = t.fleet;
  return (
    <section id="fleet" aria-labelledby="fleet-title" className="scroll-mt-16 border-t border-line bg-paper sec">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <h2 id="fleet-title" className="h-section text-ink">
              {f.title}
            </h2>
            <p className="mt-6 max-w-xl text-lg text-muted text-pretty">{f.lead}</p>
          </Reveal>
          <Reveal delay={100} className="border border-ink/15 bg-surface p-8">
            <OpsClock now={f.clockNow} running={f.clockRunning} sub={f.clockSub} lang={lang} />
          </Reveal>
        </div>

        {/* MSG's own fleet, as captioned plates: one large, two beside it */}
        <div className="mt-16 grid gap-4 lg:grid-cols-12">
          {[0, 4, 6].map((k, i) => {
            const x = msgFleet.scenes[k];
            return (
              <figure key={x.src} className={i === 0 ? "lg:col-span-8 lg:row-span-2" : "lg:col-span-4"}>
                <div className={`plate relative overflow-hidden bg-ink ${i === 0 ? "aspect-[16/10] lg:aspect-auto lg:h-[calc(100%-1.75rem)]" : "aspect-[16/10]"}`}>
                  <Image src={x.src} alt={x.alt[lang]} fill sizes={i === 0 ? "(min-width: 1024px) 860px, 100vw" : "(min-width: 1024px) 420px, 100vw"} className="object-cover" style={{ objectPosition: x.pos }} />
                  <span aria-hidden="true" className="reg reg-ts" />
                  <span aria-hidden="true" className="reg reg-be" />
                </div>
                <figcaption className="lbl mt-2 text-muted">Fig. {String(i + 2).padStart(2, "0")} — {x.caption[lang]}</figcaption>
              </figure>
            );
          })}
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

