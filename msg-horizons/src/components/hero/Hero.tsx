import QuickStart from "./QuickStart";
import TrackedLink from "../ui/TrackedLink";
import { WhatsAppIcon } from "../ui/icons";
import { whatsappLink } from "@/content/facts";
import type { Dictionary } from "@/content/i18n";

/**
 * Poster composition over the fixed HorizonBackdrop:
 * the sky above holds the rising "MSG"; the message sits on the sand below the horizon.
 */
export default function Hero({ t }: { t: Dictionary }) {
  const h = t.hero;
  return (
    <section aria-labelledby="hero-title" className="relative min-h-[100svh] pt-[54svh]">
      {/* soft paper lift on the sand for legibility (keeps the tyre-track texture visible) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 top-[50.8svh] bg-gradient-to-b from-paper/0 via-paper/55 to-paper/80" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-5 pb-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8">
        <h1 id="hero-title" className="animate-rise [animation-delay:500ms]">
          <span className="label">{h.eyebrow}</span>
          <span className="mt-4 block font-display text-[clamp(2.2rem,4.4vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-ink text-balance rtl:leading-[1.3] rtl:tracking-normal">
            {h.title}
          </span>
        </h1>
        <div className="animate-rise [animation-delay:650ms] lg:pt-9">
          <p className="max-w-xl text-lg leading-relaxed text-ink-3 text-pretty">{h.lead}</p>
          <p className="mt-7 text-sm font-semibold text-ink">{h.quickStart}</p>
          <QuickStart options={t.planner.steps.persona.options} />
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <TrackedLink
              href="#planner"
              event="cta_click"
              props={{ cta: "plan", location: "hero" }}
              className="inline-flex items-center justify-center rounded-md bg-ink px-5 py-3 font-medium text-white transition-colors hover:bg-ink-3"
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
        </div>
      </div>
    </section>
  );
}
