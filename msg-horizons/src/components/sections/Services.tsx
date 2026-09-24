import Reveal from "../ui/Reveal";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon, CheckIcon, ServiceIcon } from "../ui/icons";
import { facts } from "@/content/facts";
import type { Dictionary } from "@/content/i18n";

export default function Services({ t }: { t: Dictionary }) {
  const s = t.services;
  return (
    <section id="services" aria-labelledby="services-title" className="scroll-mt-16 bg-ink py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-sun">{s.eyebrow}</p>
            <h2 id="services-title" className="mt-4 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl rtl:tracking-normal">
              {s.title}
            </h2>
            <p className="mt-5 text-lg text-mist text-pretty">{s.lead}</p>
          </Reveal>
          <TrackedLink
            href="#planner"
            event="cta_click"
            props={{ cta: "plan", location: "services" }}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-white/15 px-5 py-3 font-semibold text-white transition hover:border-sun hover:text-sun lg:self-auto"
          >
            {t.nav.cta} <ArrowIcon />
          </TrackedLink>
        </div>

        <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {facts.services.map((id, i) => {
            const svc = t.planner.services[id];
            const featured = i === 0;
            // 4-col bento: featured 2×2, four singles, then the last two span 2 → no empty cells.
            const span = featured ? "sm:col-span-2 lg:row-span-2" : i >= 5 ? "lg:col-span-2" : "";
            return (
              <Reveal
                as="li"
                key={id}
                delay={(i % 4) * 70}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border border-line p-7 transition-colors duration-500 hover:border-white/20 ${span} ${
                  featured ? "bg-gradient-to-br from-sun/[0.14] to-transparent" : "bg-white/[0.02]"
                }`}
              >
                <span
                  className={`inline-flex size-12 items-center justify-center rounded-2xl ${
                    featured ? "bg-sun text-ink" : "bg-white/5 text-signal"
                  }`}
                >
                  <ServiceIcon id={id} className="size-6" />
                </span>
                <h3 className={`mt-6 font-display font-semibold ${featured ? "text-3xl sm:text-4xl" : "text-xl"}`}>{svc.name}</h3>
                <p className={`mt-3 text-fog ${featured ? "max-w-md text-lg" : ""}`}>{svc.desc}</p>
                {featured ? (
                  <>
                    <ul className="mt-8 grid gap-3">
                      {s.featuredPoints.map((pt) => (
                        <li key={pt} className="flex items-center gap-3 text-mist">
                          <CheckIcon className="size-4 shrink-0 text-sun" /> {pt}
                        </li>
                      ))}
                    </ul>
                    <div aria-hidden="true" className="mt-auto hidden items-center gap-3 pt-10 lg:flex">
                      {[0, 1, 2, 3, 4, 5, 6].map((k) => (
                        <span key={k} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                          <span
                            className="route-pulse block h-full w-1/3 rounded-full bg-sun"
                            style={{ animationDelay: `${k * 160}ms` }}
                          />
                        </span>
                      ))}
                    </div>
                  </>
                ) : null}
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
