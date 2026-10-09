import Reveal from "../ui/Reveal";
import TrackedLink from "../ui/TrackedLink";
import WorkforcePipeline from "../enterprise/WorkforcePipeline";
import PeakControl from "../enterprise/PeakControl";
import { ArrowIcon } from "../ui/icons";
import { facts } from "@/content/facts";
import type { Dictionary } from "@/content/i18n";

/** Enterprise evaluators, in Red Sea daylight glass. */
export default function Enterprise({ t }: { t: Dictionary }) {
  const e = t.enterprise;
  const wf = e.workforce;
  return (
    <section id="enterprise" aria-labelledby="enterprise-title" className="sea-band sec scroll-mt-16">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <h2 id="enterprise-title" className="h-section">
              {e.title}
            </h2>
          </div>
          <p className="max-w-xl text-lg text-teal-deep/75 text-pretty lg:justify-self-end">{e.lead}</p>
        </Reveal>

        {/* Workforce: source → site */}
        <div className="mt-24">
          <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h3 className="font-display text-3xl font-semibold tracking-[-0.02em] rtl:tracking-normal">{wf.title}</h3>
              <p className="mt-2 max-w-xl text-teal-deep/75">{wf.lead}</p>
            </div>
            <p className="num font-display text-6xl font-semibold tracking-[-0.03em]">{facts.metrics.couriers.display}</p>
          </Reveal>
          <div className="mt-8">
            <WorkforcePipeline stages={facts.workforceStages.map((k) => wf.stages[k])} site={wf.site} />
          </div>
          <div className="mt-8 grid gap-8 border-t border-teal/15 pt-8 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-teal-deep">{wf.rolesTitle}</p>
              <p className="mt-3 leading-relaxed text-teal-deep/75">{wf.roles.join(" · ")}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-teal-deep">{wf.disciplineTitle}</p>
              <p className="mt-3 leading-relaxed text-teal-deep/75">{wf.discipline.join(" · ")}</p>
            </div>
          </div>
        </div>

        {/* Peak demand: forecast → demobilise (scroll-driven) */}
        <div className="mt-32">
          <Reveal className="max-w-2xl">
            <h3 className="font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl rtl:tracking-normal">{e.peak.title}</h3>
            <p className="mt-3 text-lg text-teal-deep/75">{e.peak.lead}</p>
          </Reveal>
          <div className="mt-6">
            <PeakControl
              stages={facts.peakStages.map((k) => e.peak.stages[k])}
              labels={{ demand: e.peak.demand, capacity: e.peak.capacity, standby: e.peak.standby, illustrative: e.peak.illustrative }}
            />
          </div>
        </div>

        {/* Governance */}
        <div className="mt-24">
          <Reveal className="max-w-2xl">
            <h3 className="font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl rtl:tracking-normal">{e.governance.title}</h3>
            <p className="mt-3 text-lg text-teal-deep/75">{e.governance.lead}</p>
          </Reveal>
          <div className="mt-10 grid gap-x-16 gap-y-10 lg:grid-cols-[1.5fr_1fr]">
            <dl className="border-t border-teal/15">
              {e.governance.items.map((g) => (
                <div key={g.t} className="grid gap-1 border-b border-teal/15 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
                  <dt className="font-semibold">{g.t}</dt>
                  <dd className="text-teal-deep/75">{g.d}</dd>
                </div>
              ))}
            </dl>
            <ul className="grid content-start gap-3 text-teal-deep/85 lg:border-s lg:border-teal/15 lg:ps-10">
              {e.governance.outcomes.map((o) => (
                <li key={o} className="flex items-center gap-3 font-medium"><span className="size-1.5 shrink-0 rounded-full bg-teal" /> {o}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 sm:flex-row">
          <TrackedLink href="#contact" event="cta_click" props={{ cta: "enterprise", location: "enterprise" }} data-interest="enterprise"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-teal px-5 py-3 font-medium text-white transition-colors hover:bg-teal-deep">
            {e.cta} <ArrowIcon className="size-4 rtl:rotate-180" />
          </TrackedLink>
          <TrackedLink href="#contact" event="cta_click" props={{ cta: "manpower", location: "enterprise" }} data-interest="manpower"
            className="inline-flex items-center justify-center rounded-md border border-teal/30 px-5 py-3 font-medium text-teal-deep transition-colors hover:border-teal">
            {e.ctaManpower}
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
