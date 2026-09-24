import Reveal from "../ui/Reveal";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon } from "../ui/icons";
import type { Dictionary, Locale } from "@/content/i18n";

/** Approachable, light section: "this is for me" for sellers and small businesses. */
export default function Sellers({ t, lang }: { t: Dictionary; lang: Locale }) {
  const s = t.sellers;
  return (
    <section id="sellers" aria-labelledby="sellers-title" className="scroll-mt-16 bg-paper py-24 text-paper-ink lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <p className="eyebrow text-sun-deep">{s.eyebrow}</p>
            <h2 id="sellers-title" className="mt-4 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl rtl:tracking-normal">
              {s.title}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper-fog text-pretty">{s.lead}</p>
          </Reveal>
          <Reveal delay={120}>
            <div data-lang={lang} />
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-4 md:grid-cols-3">
          {s.cards.map((c, i) => (
            <Reveal as="li" key={c.t} delay={i * 100} className="group relative overflow-hidden rounded-3xl bg-white p-7 shadow-[0_1px_0_rgba(0,0,0,0.04),0_20px_40px_-24px_rgba(60,40,10,0.25)]">
              <span className="inline-flex rounded-full bg-paper px-3 py-1 text-xs font-semibold text-sun-deep">{c.tag}</span>
              <h3 className="mt-6 font-display text-2xl font-semibold">{c.t}</h3>
              <p className="mt-3 leading-relaxed text-paper-fog">{c.d}</p>
              <span aria-hidden="true" className="absolute -bottom-10 -end-10 size-32 rounded-full bg-sun/10 transition-transform duration-700 group-hover:scale-150" />
            </Reveal>
          ))}
        </ul>

        <div className="mt-20">
          <h3 className="font-display text-2xl font-semibold">{s.howTitle}</h3>
          <ol className="relative mt-8 grid gap-8 md:grid-cols-4 md:gap-6">
            <span aria-hidden="true" className="absolute inset-x-4 top-5 hidden h-px bg-gradient-to-r from-sun/0 via-sun/60 to-sun/0 md:block" />
            {s.how.map((h, i) => (
              <Reveal as="li" key={h.t} delay={i * 90} className="relative">
                <span className="num relative inline-flex size-10 items-center justify-center rounded-full bg-paper-ink font-mono text-sm font-semibold text-sun">
                  0{i + 1}
                </span>
                <p className="mt-4 font-semibold">{h.t}</p>
                <p className="mt-1 text-paper-fog">{h.d}</p>
              </Reveal>
            ))}
          </ol>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-3xl bg-paper-ink p-8 text-white sm:flex-row sm:items-center sm:p-10">
          <p className="font-display text-2xl font-semibold text-balance sm:text-3xl">{s.launchpad}</p>
          <TrackedLink
            href="#planner"
            event="cta_click"
            props={{ cta: "plan", location: "sellers" }}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-sun px-6 py-3.5 font-semibold text-ink transition hover:bg-sun-soft"
          >
            {s.cta} <ArrowIcon />
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
