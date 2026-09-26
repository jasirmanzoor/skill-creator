import PersonaGate from "./PersonaGate";
import HeroLift from "./HeroLift";
import TrackedLink from "../ui/TrackedLink";
import { WhatsAppIcon } from "../ui/icons";
import { facts, whatsappLink } from "@/content/facts";
import type { Dictionary } from "@/content/i18n";

/**
 * First 15–20 seconds: horizon presence, problem, proof, then a decision.
 * The visitor should leave this fold knowing MSG already runs the door —
 * and which door is theirs.
 */
export default function Hero({ t }: { t: Dictionary }) {
  const h = t.hero;
  return (
    <section aria-labelledby="hero-title" className="relative min-h-[100svh] pt-[22svh] sm:pt-[26svh] lg:pt-[28svh]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[18svh] bg-gradient-to-b from-paper/0 via-paper/55 to-paper/90"
      />
      <HeroLift>
        <div className="relative mx-auto max-w-7xl px-5 pb-12 lg:px-8">
          <h1 id="hero-title" className="animate-rise max-w-4xl [animation-delay:160ms]">
            <span className="label">{h.eyebrow}</span>
            <span className="mt-3 block font-display text-[clamp(2.15rem,5vw,4.15rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-ink text-balance rtl:leading-[1.28] rtl:tracking-normal">
              {h.title}
            </span>
          </h1>

          <p className="animate-rise mt-5 max-w-2xl text-lg font-medium text-ink [animation-delay:320ms] sm:text-xl">
            {h.certainty}
          </p>
          <p className="animate-rise mt-2 max-w-2xl text-base text-ink-3 [animation-delay:400ms]">{h.forWhom}</p>

          <ul
            className="animate-rise mt-8 flex flex-wrap gap-x-8 gap-y-3 [animation-delay:520ms]"
            aria-label={h.proofBeside}
          >
            {h.stats.map((s) => (
              <li key={s.label} className="min-w-[5.5rem]">
                <span className="num block font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
                  {s.value}
                </span>
                <span className="text-sm text-muted">{s.label}</span>
              </li>
            ))}
          </ul>

          <div className="animate-rise mt-10 max-w-4xl [animation-delay:700ms]">
            <p className="text-sm font-semibold text-ink">{h.whoPrompt}</p>
            <PersonaGate options={t.planner.steps.persona.options} promises={h.personas} />
          </div>

          <div className="animate-rise mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 [animation-delay:1100ms]">
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
            <p className="text-xs text-muted">
              {h.nextStep} {h.ctaMicro}
            </p>
          </div>

          <p className="animate-rise mt-6 text-xs text-faint [animation-delay:1200ms]">
            {h.partnersLead} {facts.partners.join(" · ")}
          </p>
        </div>
      </HeroLift>
    </section>
  );
}
