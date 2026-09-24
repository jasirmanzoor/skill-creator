import Reveal from "../ui/Reveal";
import TrackedLink from "../ui/TrackedLink";
import WorkforcePipeline from "../enterprise/WorkforcePipeline";
import PeakFlow from "../enterprise/PeakFlow";
import { ArrowIcon } from "../ui/icons";
import { facts } from "@/content/facts";
import type { Dictionary } from "@/content/i18n";

export default function Enterprise({ t }: { t: Dictionary }) {
  const e = t.enterprise;
  const wf = e.workforce;
  return (
    <section id="enterprise" aria-labelledby="enterprise-title" className="section-glow relative scroll-mt-16 bg-ink py-24 lg:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 end-0 h-96 w-96 rounded-full bg-signal/[0.06] blur-3xl" />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="max-w-3xl">
          <p className="eyebrow text-signal">{e.eyebrow}</p>
          <h2 id="enterprise-title" className="mt-4 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl rtl:tracking-normal">
            {e.title}
          </h2>
          <p className="mt-6 text-lg text-mist text-pretty">{e.lead}</p>
        </Reveal>

        {/* Workforce: source → site */}
        <div className="mt-20">
          <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h3 className="font-display text-3xl font-semibold">{wf.title}</h3>
              <p className="mt-2 max-w-xl text-fog">{wf.lead}</p>
            </div>
            <p className="num font-display text-5xl font-semibold text-sun">{facts.metrics.couriers.display}</p>
          </Reveal>
          <div className="mt-8">
            <WorkforcePipeline stages={facts.workforceStages.map((k) => wf.stages[k])} site={wf.site} />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-line p-6">
              <p className="text-sm font-semibold text-white">{wf.rolesTitle}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {wf.roles.map((r) => (
                  <li key={r} className="rounded-full bg-white/5 px-3 py-1.5 text-sm text-mist">{r}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-line p-6">
              <p className="text-sm font-semibold text-white">{wf.disciplineTitle}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {wf.discipline.map((r) => (
                  <li key={r} className="rounded-full border border-signal/30 px-3 py-1.5 text-sm text-signal">{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Peak demand: forecast → demobilise (scroll-driven) */}
        <div className="mt-28">
          <Reveal className="max-w-2xl">
            <h3 className="font-display text-3xl font-semibold sm:text-4xl">{e.peak.title}</h3>
            <p className="mt-3 text-lg text-fog">{e.peak.lead}</p>
          </Reveal>
          <div className="mt-6">
            <PeakFlow
              stages={facts.peakStages.map((k) => e.peak.stages[k])}
              labels={{ demand: e.peak.demand, capacity: e.peak.capacity, standby: e.peak.standby, illustrative: e.peak.illustrative }}
            />
          </div>
        </div>

        {/* Governance */}
        <div className="mt-20">
          <Reveal className="max-w-2xl">
            <h3 className="font-display text-3xl font-semibold sm:text-4xl">{e.governance.title}</h3>
            <p className="mt-3 text-lg text-fog">{e.governance.lead}</p>
          </Reveal>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
            {e.governance.items.map((g, i) => (
              <Reveal as="li" key={g.t} delay={i * 70} className="bg-ink p-6">
                <span className="num font-mono text-xs text-sun">0{i + 1}</span>
                <p className="mt-3 font-semibold text-white">{g.t}</p>
                <p className="mt-1 text-sm text-fog">{g.d}</p>
              </Reveal>
            ))}
          </ol>
          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {e.governance.outcomes.map((o) => (
              <li key={o} className="flex items-center gap-2 text-mist">
                <span className="size-1.5 rounded-full bg-signal" /> {o}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 flex flex-col gap-3 sm:flex-row">
          <TrackedLink
            href="#contact"
            event="cta_click"
            props={{ cta: "enterprise", location: "enterprise" }}
            data-interest="enterprise"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-sun px-6 py-3.5 font-semibold text-ink transition hover:bg-sun-soft"
          >
            {e.cta} <ArrowIcon />
          </TrackedLink>
          <TrackedLink
            href="#contact"
            event="cta_click"
            props={{ cta: "manpower", location: "enterprise" }}
            data-interest="manpower"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 font-semibold text-white transition hover:border-white/40"
          >
            {e.ctaManpower}
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
