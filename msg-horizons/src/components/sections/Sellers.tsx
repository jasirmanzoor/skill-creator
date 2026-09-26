import Reveal from "../ui/Reveal";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon } from "../ui/icons";
import type { Dictionary } from "@/content/i18n";

/** "This is for me": sellers, startups and growing stores. */
export default function Sellers({ t }: { t: Dictionary }) {
  const s = t.sellers;
  return (
    <section id="sellers" aria-labelledby="sellers-title" className="scroll-mt-16 border-t border-line bg-surface/90 py-24 backdrop-blur lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 lg:grid-cols-[1fr_1fr] lg:px-8">
        <Reveal>
          <span className="label">{s.eyebrow}</span>
          <h2 id="sellers-title" className="mt-4 font-display text-4xl font-semibold tracking-[-0.025em] text-ink text-balance sm:text-5xl rtl:tracking-normal">
            {s.title}
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty">{s.lead}</p>
          <TrackedLink
            href="#planner"
            event="cta_click"
            props={{ cta: "plan", location: "sellers" }}
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 font-medium text-white transition-colors hover:bg-ink-3"
          >
            {s.cta} <ArrowIcon />
          </TrackedLink>
          <p className="mt-10 border-s-2 border-brand ps-4 font-display text-xl font-medium text-ink text-balance">{s.launchpad}</p>
        </Reveal>

        <Reveal delay={100}>
          <h3 className="text-sm font-semibold text-ink">{s.howTitle}</h3>
          <ol className="relative mt-6">
            <span aria-hidden="true" className="absolute inset-y-4 start-[15px] w-px bg-line-strong" />
            {s.how.map((h, i) => (
              <li key={h.t} className="relative flex gap-5 pb-9 last:pb-0">
                <span className="num relative z-10 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-sm font-semibold text-ink">
                  {i + 1}
                </span>
                <div className="pt-1">
                  <p className="font-semibold text-ink">{h.t}</p>
                  <p className="mt-1 text-muted">{h.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      <ul className="mx-auto mt-20 grid max-w-7xl gap-px overflow-hidden border-y border-line bg-line px-0 md:grid-cols-3 lg:rounded-xl lg:border-x">
        {s.cards.map((c, i) => (
          <Reveal as="li" key={c.t} delay={i * 80} className="bg-surface p-8">
            <span className="text-sm font-medium text-brand">{c.tag}</span>
            <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.02em] text-ink rtl:tracking-normal">{c.t}</h3>
            <p className="mt-3 leading-relaxed text-muted">{c.d}</p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
