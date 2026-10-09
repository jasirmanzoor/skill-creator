"use client";

import { SPRING_UI } from "@/lib/motion";
import NumberFlow from "@number-flow/react";
import { motion } from "motion/react";
import { useId } from "react";
import { heroCopy, type HeroLane } from "@/content/hero";
import { rateFor, type Lane } from "@/content/redsea";
import { whatsappLink } from "@/content/facts";
import type { Locale } from "@/content/i18n";
import { track } from "@/lib/analytics";
import TrackedLink from "../ui/TrackedLink";
import { WhatsAppIcon } from "../ui/icons";

const RATE_LANE: Record<HeroLane, Lane> = { intra: "intra", inter: "inter", sabya: "sabyaMajor" };
const MIN = 20, MAX = 3000;
const toOrders = (v: number) => Math.round(MIN * Math.pow(MAX / MIN, v / 1000) / 10) * 10 || MIN;
const toSlider = (n: number) => Math.round((Math.log(n / MIN) / Math.log(MAX / MIN)) * 1000);

/** The ten-second price: pick a lane and a monthly volume, read the approximate rate from MSG's rate card. */
export default function QuoteCard({
  lang, reduce, lane, onLane, orders, onOrders, className = "",
}: {
  lang: Locale; reduce: boolean; lane: HeroLane; onLane: (l: HeroLane) => void; orders: number; onOrders: (n: number) => void; className?: string;
}) {
  const c = heroCopy[lang];
  const id = useId();
  const rate = rateFor(RATE_LANE[lane], orders);
  const monthly = rate * orders;
  const wa = whatsappLink(c.quote.wa.replace("{lane}", c.quote.lanes[lane]).replace("{n}", String(orders)));
  return (
    <aside
      data-rate-card
      aria-labelledby={`${id}-q`}
      className={`relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-5 text-teal-deep shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-xl ${className}`}
    >
      <div className="relative grid gap-4 sm:grid-cols-[1.1fr_1fr] sm:items-start">
        <div>
          <p id={`${id}-q`} className="font-display text-lg font-semibold">{c.quote.title}</p>
          <div role="radiogroup" aria-label={c.quote.title} className="mt-3 grid grid-cols-3 gap-1 rounded-full bg-sea-100 p-1">
            {(["intra", "inter", "sabya"] as const).map((k) => (
              <button key={k} type="button" role="radio" aria-checked={lane === k}
                onClick={() => { onLane(k); track("planner_step", { step: "hero_quote", value: k }); }}
                className="tap relative rounded-full px-2 py-2 text-[12px] font-semibold leading-tight">
                {lane === k ? <motion.span layoutId={`${id}-lane`} transition={{ type: "spring", ...SPRING_UI }} className="absolute inset-0 rounded-full bg-white shadow-[0_4px_14px_-6px_rgba(11,58,64,0.5)]" /> : null}
                <span className={`relative ${lane === k ? "text-teal-deep" : "text-teal-deep/70"}`}>{c.quote.lanes[k]}</span>
              </button>
            ))}
          </div>
          <label htmlFor={`${id}-n`} className="mt-4 flex items-baseline justify-between text-sm text-teal-deep/80">
            {c.quote.orders}
            <output htmlFor={`${id}-n`} className="num font-display text-lg font-semibold text-teal-deep">{orders.toLocaleString("en-US")}</output>
          </label>
          <input id={`${id}-n`} type="range" min={0} max={1000} value={toSlider(orders)} dir="ltr"
            onChange={(e) => onOrders(toOrders(Number(e.target.value)))} className="est-range mt-1 w-full" />
        </div>

        <div>
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-teal-deep p-4 text-white">
            <div>
              <p className="text-[11px] text-white/70">{c.quote.perOrder}</p>
              <p data-hero-rate={rate} className="num mt-0.5 font-display text-3xl font-semibold">
                <Money cur={c.quote.cur} ar={lang === "ar"} approx>{reduce ? rate : <NumberFlow value={rate} locales="en-US" />}</Money>
              </p>
            </div>
            <div>
              <p className="text-[11px] text-white/70">{c.quote.monthly}</p>
              <p className="num mt-1.5 font-display text-xl font-semibold text-brand-mint">
                <Money cur={c.quote.cur} ar={lang === "ar"}>{reduce ? monthly.toLocaleString("en-US") : <NumberFlow value={monthly} locales="en-US" format={{ useGrouping: true }} />}</Money>
              </p>
            </div>
          </div>
          <TrackedLink href={wa} target="_blank" rel="noopener noreferrer" event="whatsapp_click" props={{ location: "hero_quote" }}
            className="mt-3 flex items-center justify-center gap-2 min-h-11 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong">
            <WhatsAppIcon className="size-4" /> {c.quote.cta}
          </TrackedLink>
        </div>
        <p className="text-[11px] leading-snug text-teal-deep/70 sm:col-span-2">{c.quote.note}</p>
      </div>
    </aside>
  );
}

function Money({ cur, ar, approx = false, children }: { cur: string; ar: boolean; approx?: boolean; children: React.ReactNode }) {
  return (
    <span dir={ar ? "rtl" : "ltr"} className="inline-flex items-baseline gap-1">
      {approx ? <span className="text-base opacity-80">≈</span> : null}
      {ar ? <>{children}<span className="text-sm opacity-80">{cur}</span></> : <><span className="text-sm opacity-80">{cur}</span>{children}</>}
    </span>
  );
}
