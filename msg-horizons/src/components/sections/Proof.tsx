import Reveal from "../ui/Reveal";
import CountUp from "../ui/CountUp";
import type { Dictionary } from "@/content/i18n";

export default function Proof({ t }: { t: Dictionary }) {
  const p = t.proof;
  return (
    <section aria-labelledby="proof-title" className="border-t border-line bg-surface/92 py-24 backdrop-blur lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="max-w-2xl">
          <span className="label">{p.eyebrow}</span>
          <h2 id="proof-title" className="mt-4 font-display text-4xl font-semibold tracking-[-0.025em] text-ink text-balance sm:text-5xl rtl:tracking-normal">
            {p.title}
          </h2>
        </Reveal>

        <dl className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {p.metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 70} className="bg-surface p-8">
              <dt className="text-sm text-muted">{m.label}</dt>
              <dd className="mt-3">
                <CountUp value={m.value} className="num block font-display text-5xl font-semibold tracking-[-0.03em] text-ink" />
                <span className="mt-2 block text-sm text-muted">{m.d}</span>
              </dd>
            </Reveal>
          ))}
        </dl>

        <div className="mt-24 grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <h3 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink rtl:tracking-normal">{p.pillarsTitle}</h3>
          <ol className="grid gap-x-10 sm:grid-cols-2">
            {p.pillars.map((pl, i) => (
              <li key={pl} className="flex items-baseline gap-4 border-b border-line py-4">
                <span className="num w-6 shrink-0 text-sm text-brand">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-ink">{pl}</span>
              </li>
            ))}
          </ol>
        </div>

        <Reveal className="mt-24 border-t border-line pt-12">
          <span className="label">{p.visionTitle}</span>
          <blockquote className="mt-5 max-w-4xl font-display text-3xl font-medium leading-snug tracking-[-0.02em] text-ink text-balance sm:text-4xl rtl:tracking-normal">
            “{p.vision}”
          </blockquote>
          <p className="mt-6 text-sm text-muted">{p.vision2030}</p>
        </Reveal>
      </div>
    </section>
  );
}
