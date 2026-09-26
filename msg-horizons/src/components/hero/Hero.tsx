import QuickStart from "./QuickStart";
import HeroLift from "./HeroLift";
import TrackedLink from "../ui/TrackedLink";
import { WhatsAppIcon } from "../ui/icons";
import { facts, whatsappLink } from "@/content/facts";
import type { Dictionary } from "@/content/i18n";

/**
 * First 10 seconds: problem, who it is for, what happens next.
 * The courier field behind this copy is the product preview — not decoration.
 */
export default function Hero({ t }: { t: Dictionary }) {
  const h = t.hero;
  return (
    <section aria-labelledby="hero-title" className="relative min-h-[100svh] pt-[48svh]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[46svh] bg-gradient-to-b from-paper/0 via-paper/60 to-paper/85"
      />
      <HeroLift>
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 pb-16 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:px-8">
          <h1 id="hero-title" className="animate-rise [animation-delay:500ms]">
            <span className="label">{h.eyebrow}</span>
            <span className="mt-4 block font-display text-[clamp(2.2rem,4.4vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-ink text-balance rtl:leading-[1.3] rtl:tracking-normal">
              {h.title}
            </span>
          </h1>
          <div className="animate-rise [animation-delay:650ms] lg:pt-9">
            <p className="max-w-xl text-lg leading-relaxed text-ink-3 text-pretty">{h.lead}</p>
            <p className="mt-4 text-sm font-medium text-ink">{h.forWhom}</p>
            <p className="mt-6 text-sm font-semibold text-ink">{h.quickStart}</p>
            <QuickStart options={t.planner.steps.persona.options} />
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <TrackedLink
                href="#planner"
                event="cta_click"
                props={{ cta: "plan", location: "hero" }}
                className="inline-flex items-center justify-center rounded-md bg-ink px-5 py-3.5 font-medium text-white transition-colors hover:bg-ink-3"
              >
                {h.ctaPlan}
              </TrackedLink>
              <TrackedLink
                href={whatsappLink(t.wa.general)}
                target="_blank"
                rel="noopener noreferrer"
                event="whatsapp_click"
                props={{ location: "hero" }}
                className="inline-flex items-center gap-2 font-medium text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink"
              >
                <WhatsAppIcon className="size-5 text-whatsapp" />
                {h.ctaTalk}
              </TrackedLink>
            </div>
            <p className="mt-3 text-xs text-muted">{h.nextStep} {h.ctaMicro}</p>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted" aria-label={h.proofBeside}>
              {h.stats.map((s) => (
                <li key={s.label}>
                  <span className="num font-semibold text-ink">{s.value}</span> {s.label}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-faint">
              {h.partnersLead} {facts.partners.join(" · ")}
            </p>
          </div>
        </div>
      </HeroLift>
    </section>
  );
}
