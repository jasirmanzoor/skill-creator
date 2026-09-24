import Reveal from "../ui/Reveal";
import CountUp from "../ui/CountUp";
import { facts } from "@/content/facts";
import type { Dictionary } from "@/content/i18n";

export default function Proof({ t }: { t: Dictionary }) {
  const p = t.proof;
  return (
    <section aria-labelledby="proof-title" className="section-glow relative overflow-hidden bg-ink-2 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-sun">{p.eyebrow}</p>
          <h2 id="proof-title" className="mt-4 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl rtl:tracking-normal">
            {p.title}
          </h2>
        </Reveal>

        <dl className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {p.metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 80} className="bg-ink-2 p-8 transition-colors hover:bg-ink-3">
              <dt className="text-sm text-fog">{m.label}</dt>
              <dd className="mt-3">
                <CountUp value={m.value} className={`num block font-display text-5xl font-semibold tracking-tight ${i % 2 === 0 ? "text-sun-gradient" : "text-white"}`} />
                <span className="mt-2 block text-sm text-mist">{m.d}</span>
              </dd>
            </Reveal>
          ))}
        </dl>

        <div className="mt-20 grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <h3 className="font-display text-2xl font-semibold">{p.partnersTitle}</h3>
            <p className="mt-3 max-w-md text-fog">{p.partnersNote}</p>
          </div>
          <ul className="flex flex-wrap gap-3" dir="ltr">
            {facts.partners.map((name) => (
              <li
                key={name}
                className="flex h-20 flex-[1_1_30%] items-center justify-center rounded-2xl border border-line bg-white/[0.02] font-display text-xl font-semibold tracking-tight text-mist transition hover:border-white/20 hover:text-white"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>

        {/* 10 pillars as a slow marquee (duplicated for a seamless loop; the copy is hidden from AT) */}
        <div className="mt-24">
          <h3 className="font-display text-2xl font-semibold">{p.pillarsTitle}</h3>
          <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
            <div dir="ltr" className="marquee-track flex w-max motion-safe:animate-marquee hover:[animation-play-state:paused]">
              {[0, 1].map((copy) => (
                <ol key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-3 pe-3">
                  {p.pillars.map((pl, i) => (
                    <li key={pl} dir="auto" className="flex items-center gap-3 whitespace-nowrap rounded-full border border-line px-5 py-3 text-mist">
                      <span className="num font-mono text-xs text-sun">{String(i + 1).padStart(2, "0")}</span>
                      {pl}
                    </li>
                  ))}
                </ol>
              ))}
            </div>
          </div>
        </div>

        <Reveal className="mt-24 rounded-3xl border border-line bg-gradient-to-br from-sun/[0.08] via-transparent to-signal/[0.06] p-8 sm:p-12">
          <p className="eyebrow text-sun">{p.visionTitle}</p>
          <blockquote className="mt-4 max-w-4xl font-display text-2xl font-medium leading-snug text-balance sm:text-3xl">
            “{p.vision}”
          </blockquote>
          <p className="mt-6 text-sm text-fog">{p.vision2030}</p>
        </Reveal>
      </div>
    </section>
  );
}
