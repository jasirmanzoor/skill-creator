import Reveal from "../ui/Reveal";
import CountUp from "../ui/CountUp";
import type { Dictionary } from "@/content/i18n";

export default function Proof({ t }: { t: Dictionary }) {
  const p = t.proof;
  return (
    <section id="proof" aria-labelledby="proof-title" className="scroll-mt-24 border-t border-line bg-surface/[0.94] sec">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="max-w-2xl">
          <h2 id="proof-title" className="h-section text-ink">
            {p.title}
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-x-16 gap-y-14 lg:grid-cols-[1.1fr_1fr]">
          <dl className="border-t border-line">
            {p.metrics.map((m) => (
              <div key={m.label} className="grid grid-cols-[9.5rem_1fr] items-baseline gap-x-5 border-b border-line py-5 sm:grid-cols-[16rem_1fr] sm:gap-x-6">
                <dd className="order-1">
                  <CountUp value={m.value} className="num block whitespace-nowrap font-display text-[1.75rem] font-semibold tracking-[-0.03em] text-ink sm:text-5xl" />
                </dd>
                <dt className="order-2">
                  <span className="block font-medium text-ink">{m.label}</span>
                  <span className="mt-0.5 block text-sm text-muted">{m.d}</span>
                </dt>
              </div>
            ))}
          </dl>
          <div>
            <h3 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink rtl:tracking-normal">{p.pillarsTitle}</h3>
            <ul className="mt-5 grid gap-x-10 border-t border-line sm:grid-cols-2">
              {p.pillars.map((pl) => (
                <li key={pl} className="border-b border-line py-3 text-ink">{pl}</li>
              ))}
            </ul>
          </div>
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
