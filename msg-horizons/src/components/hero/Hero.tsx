import CourierField from "./CourierField";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon, WhatsAppIcon } from "../ui/icons";
import { whatsappLink } from "@/content/facts";
import type { Dictionary, Locale } from "@/content/i18n";

export default function Hero({ t, lang }: { t: Dictionary; lang: Locale }) {
  const h = t.hero;
  const rtl = lang === "ar";
  return (
    <section aria-labelledby="hero-title" className="grain relative isolate min-h-[100svh] overflow-hidden bg-ink">
      {/* horizon glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[45%] bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(246,166,35,0.20),transparent_70%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_70%_40%,rgba(79,227,193,0.06),transparent_70%)]" />

      <CourierField
        rtl={rtl}
        ariaLabel={h.canvasLabel}
        labels={{
          ...h.legend,
          hq: h.hq,
          replay: h.replay,
          couriersWord: h.stats[0].label,
          vehiclesWord: h.stats[1].label,
          couriersFinal: h.stats[0].value,
          vehiclesFinal: h.stats[1].value,
        }}
      />

      {/* readability scrims behind the copy (mobile: from below; desktop: from the text side) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{ background: "linear-gradient(to top, #05070d 0%, #05070d 38%, rgba(5,7,13,0.72) 52%, rgba(5,7,13,0) 68%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background: `linear-gradient(${rtl ? "to left" : "to right"}, rgba(5,7,13,0.94) 0%, rgba(5,7,13,0.78) 30%, rgba(5,7,13,0.35) 46%, rgba(5,7,13,0) 60%)`,
        }}
      />

      <div className="pointer-events-none relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-10 pt-[52svh] lg:justify-center lg:px-8 lg:pb-16 lg:pt-24">
        <div className="pointer-events-auto max-w-xl">
          <h1 id="hero-title">
            <span className="eyebrow block animate-rise text-sun">{h.eyebrow}</span>
            <span className="mt-4 block animate-rise font-display text-[clamp(2.6rem,7vw,5.6rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-balance [animation-delay:120ms] rtl:leading-[1.15] rtl:tracking-normal">
              {h.title}
            </span>
          </h1>
          <p className="mt-6 max-w-lg animate-rise text-lg leading-relaxed text-mist text-pretty [animation-delay:240ms]">{h.lead}</p>

          <div className="mt-8 flex animate-rise flex-col gap-3 [animation-delay:360ms] sm:flex-row">
            <TrackedLink
              href="#planner"
              event="cta_click"
              props={{ cta: "plan", location: "hero" }}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-sun px-6 py-3.5 font-semibold text-ink shadow-[0_0_40px_-8px_rgba(246,166,35,0.7)] transition hover:bg-sun-soft"
            >
              {h.ctaPlan}
              <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </TrackedLink>
            <TrackedLink
              href={whatsappLink(t.wa.general)}
              target="_blank"
              rel="noopener noreferrer"
              event="whatsapp_click"
              props={{ location: "hero" }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:border-white/30 hover:bg-white/10"
            >
              <WhatsAppIcon className="size-5 text-signal" />
              {h.ctaTalk}
            </TrackedLink>
          </div>

          {/* Stats as real text (SEO, screen readers, no-JS). Visual counters live beside the map on desktop. */}
          <dl className="mt-10 grid animate-rise grid-cols-3 gap-4 border-t border-line pt-6 [animation-delay:480ms] lg:hidden">
            {h.stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="num block font-display text-2xl font-semibold text-white">{s.value}</span>
                  <span className="text-sm text-fog">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
          {/* Desktop: the stats are drawn beside the map (aria-hidden), so expose them to assistive tech here. */}
          <p className="sr-only hidden lg:block">{h.stats.map((s) => `${s.value} ${s.label}`).join(" · ")}</p>
        </div>
      </div>
    </section>
  );
}
