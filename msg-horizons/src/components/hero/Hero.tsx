"use client";

import { heroCopy, type HeroLane } from "@/content/hero";
import type { Lane } from "@/content/redsea";
import { facts, whatsappLink } from "@/content/facts";
import type { Dictionary, Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { usePlan } from "../PlanContext";
import TrackedLink from "../ui/TrackedLink";
import { WhatsAppIcon } from "../ui/icons";
import QuoteCard from "./QuoteCard";
import HeroPlate from "./HeroPlate";

const RATE_LANE: Record<HeroLane, Lane> = { intra: "intra", inter: "inter", sabya: "sabyaMajor" };

/**
 * The first screen, set as an editorial page: the promise in large type, the ten-second price beside it as a spec
 * panel (price first, story second), then MSG's own fleet at the Sabya hub as a plate that opens to full width as the
 * page scrolls (HeroPlate), and the verified figures under a hairline.
 *
 * The signature opening runs in CSS (globals.css, "V3 hero"), so it plays before the page hydrates and never holds
 * a control back: (1) the status line arrives, (2) the two clauses of the promise rise through their masks, one after
 * the other, (3) the lead, the actions and the rate card settle in. About 1.6 seconds, once; every link and the rate
 * card work from the first frame. With reduced motion everything is simply there.
 */
export default function Hero({ t, lang }: { t: Dictionary; lang?: Locale }) {
  const L: Locale = lang ?? "en";
  const c = heroCopy[L];
  const ar = L === "ar";
  const reduce = useReducedMotion();
  const { quote, setQuote } = usePlan();
  const lane: HeroLane = quote.lane === "intra" || quote.lane === "inter" ? quote.lane : "sabya";
  const orders = quote.orders;

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative bg-paper text-ink">
      <div className="mx-auto max-w-[88rem] px-5 pt-28 sm:px-8 lg:px-10 lg:pt-36">
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="v3-in lbl flex items-center gap-2.5 text-muted" style={{ ["--d" as string]: "0s" }}>
              <span aria-hidden="true" className="size-1.5 bg-brand" />
              {c.live}
            </p>
            <h1
              id="hero-title"
              className="mt-7 font-display text-[clamp(2.6rem,6.2vw,6rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-ink text-balance rtl:leading-[1.25] rtl:tracking-normal"
            >
              <span className="v3-line"><span style={{ ["--d" as string]: "0.18s" }}>{c.title[0]}</span></span>
              <span className="v3-line font-normal text-ink-3"><span style={{ ["--d" as string]: "0.42s" }}>{c.title[1]}</span></span>
            </h1>
            <p className="v3-in mt-8 max-w-[34rem] text-lg leading-relaxed text-muted text-pretty" style={{ ["--d" as string]: "0.85s" }}>{c.lead}</p>
            <div className="v3-in mt-10 flex flex-wrap items-center gap-x-7 gap-y-4" style={{ ["--d" as string]: "0.98s" }}>
              <a href="#hero-quote" className="btn-ind">
                {c.command.ctaPrice}
                <svg viewBox="0 0 24 24" className="size-4 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
              <TrackedLink
                href={whatsappLink(t.wa.general)}
                target="_blank"
                rel="noopener noreferrer"
                event="whatsapp_click"
                props={{ location: "hero" }}
                className="inline-flex min-h-12 items-center gap-2 font-semibold text-ink underline decoration-line-strong decoration-1 underline-offset-[0.4em] transition-colors hover:decoration-ink"
              >
                <WhatsAppIcon className="size-5 text-whatsapp" /> {c.ctaTalk}
              </TrackedLink>
            </div>
          </div>
          <div id="hero-quote" className="v3-in scroll-mt-24 lg:col-span-5 lg:pt-12" style={{ ["--d" as string]: "1.05s" }}>
            <QuoteCard lang={L} reduce={reduce} lane={lane} onLane={(l) => setQuote({ lane: RATE_LANE[l] })} orders={orders} onOrders={(n) => setQuote({ orders: n })} />
          </div>
        </div>
      </div>

      {/* the plate: MSG's own fleet at its own hub, opening to full width on scroll */}
      <HeroPlate lang={L} />

      {/* the verified figures */}
      <div className="mx-auto max-w-[88rem] px-5 pb-20 pt-12 sm:px-8 lg:px-10 lg:pb-28">
        <dl className="grid grid-cols-2 border-t border-ink sm:grid-cols-3 lg:grid-cols-5">
          {c.command.strengths.map((s, i) => (
            <div key={s.l} className={`border-b border-line py-6 pe-4 lg:border-b-0 lg:pe-6 ${i ? "lg:border-s lg:ps-6" : ""}`}>
              <dd className="font-display text-[clamp(1.9rem,8vw,2.4rem)] font-semibold leading-none whitespace-nowrap tracking-[-0.035em] text-ink lg:text-5xl rtl:tracking-normal" dir={ar ? "rtl" : "ltr"}>
                <span className="num" dir="ltr">{`${s.pre ?? ""}${s.v.toLocaleString("en-US")}${s.suffix}`}</span>
                {s.unit ? <span className="ms-1.5 text-[0.55em] font-medium text-muted">{s.unit}</span> : null}
              </dd>
              <dt className="lbl mt-3 text-muted">{s.l}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2 text-sm">
          <span className="lbl text-muted">{c.command.partners}</span>
          {facts.partners.map((name) => (
            <span key={name} className="font-semibold text-ink-3">{name}</span>
          ))}
        </p>
      </div>
    </section>
  );
}
