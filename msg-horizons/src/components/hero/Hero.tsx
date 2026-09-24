import CourierField from "./CourierField";
import NetworkStats from "./NetworkStats";
import QuickStart from "./QuickStart";
import TrackedLink from "../ui/TrackedLink";
import { WhatsAppIcon } from "../ui/icons";
import { whatsappLink } from "@/content/facts";
import type { Dictionary } from "@/content/i18n";

export default function Hero({ t }: { t: Dictionary }) {
  const h = t.hero;
  return (
    <section aria-labelledby="hero-title" className="relative bg-paper pt-28 pb-16 lg:pt-36 lg:pb-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:px-8">
        <div>
          <h1 id="hero-title" className="animate-rise">
            <span className="label">{h.eyebrow}</span>
            <span className="mt-5 block font-display text-[clamp(2.4rem,5.2vw,4.25rem)] font-semibold leading-[1.04] tracking-[-0.022em] text-ink text-balance rtl:leading-[1.25] rtl:tracking-normal">
              {h.title}
            </span>
          </h1>
          <p className="mt-6 max-w-xl animate-rise text-lg leading-relaxed text-muted text-pretty [animation-delay:100ms]">{h.lead}</p>

          <div className="mt-9 animate-rise [animation-delay:200ms]">
            <p className="text-sm font-semibold text-ink">{h.quickStart}</p>
            <QuickStart options={t.planner.steps.persona.options} />
          </div>

          <div className="mt-7 flex animate-rise flex-wrap items-center gap-x-6 gap-y-3 [animation-delay:300ms]">
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
              className="inline-flex items-center gap-2 font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
            >
              <WhatsAppIcon className="size-5 text-whatsapp" />
              {h.ctaTalk}
            </TrackedLink>
          </div>
        </div>

        {/* Network panel — a product-style view of MSG's real scale */}
        <figure className="animate-rise overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(12,14,17,0.04),0_24px_48px_-24px_rgba(12,14,17,0.18)] [animation-delay:150ms]">
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
            <span className="text-sm font-semibold text-ink">{h.panelTitle}</span>
            <span className="flex items-center gap-2 text-sm text-muted">
              <span className="relative flex size-2">
                <span className="absolute inset-0 rounded-full bg-brand opacity-60 motion-safe:animate-ping" />
                <span className="relative size-2 rounded-full bg-brand" />
              </span>
              {h.panelLive}
            </span>
          </div>
          <div className="relative aspect-[1000/860] bg-[radial-gradient(circle_at_58%_48%,rgba(31,67,224,0.05),transparent_60%)] p-4 sm:p-6">
            <CourierField ariaLabel={h.canvasLabel} hqLabel={h.hq} />
          </div>
          <NetworkStats labels={{ couriers: h.stats[0].label, vehicles: h.stats[1].label, operations: h.stats[2].label }} />
          <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line bg-paper px-5 py-3 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-ink/50" />{h.legend.courier}</span>
            <span className="flex items-center gap-1.5"><span className="h-px w-3 bg-brand" />{h.legend.vehicle}</span>
            <span className="text-faint">{h.caption}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
