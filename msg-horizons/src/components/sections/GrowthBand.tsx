"use client";

/* eslint-disable @next/next/no-img-element -- the Sabya warehouse slot is MSG's own photo, served locally */
import NumberFlow from "@number-flow/react";
import { motion } from "motion/react";
import { useId, useState } from "react";
import { redSea, LANES, RATE_CARD, rateFor, type Lane } from "@/content/redsea";
import { whatsappLink } from "@/content/facts";
import type { Locale } from "@/content/i18n";
import { track } from "@/lib/analytics";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon, WhatsAppIcon } from "../ui/icons";

/**
 * "From your first order to your biggest peak season, MSG moves with you." made usable:
 * the visitor slides to their monthly shipments and the price is read live from MSG's 1 kg
 * next-day rate card at their volume, shown as one approximate cost per order. The growth line
 * is illustrative; the prices are not. Then the Sabya contrast beat, with MSG's warehouse photo slot.
 */

const MAX = 1000;
const X0 = 40, X1 = 960, PEAK_X = 640;
const curveY = (x: number) => {
  const t = (x - X0) / (X1 - X0);
  return 262 - 120 * Math.pow(t, 1.25) - 150 * Math.exp(-Math.pow((x - PEAK_X) / 26, 2));
};
const CURVE = Array.from({ length: 241 }, (_, i) => {
  const x = X0 + ((X1 - X0) * i) / 240;
  return `${i ? "L" : "M"}${x.toFixed(1)} ${curveY(x).toFixed(1)}`;
}).join(" ");
const xFor = (n: number) => X0 + (X1 - X0) * (0.02 + 0.96 * Math.sqrt(n / MAX));
const fmt = { useGrouping: true } as const;

export default function GrowthBand({ lang, warehousePhoto }: { lang: Locale; warehousePhoto: boolean }) {
  const c = redSea[lang].growth;
  const s = redSea[lang].sabya;
  const reduce = useReducedMotion();
  const id = useId();
  const [lane, setLane] = useState<Lane>("intra");
  const [n, setN] = useState(120);

  const rate = rateFor(lane, n);
  const monthly = n * rate;
  const x = xFor(n);
  const pos = { left: `${(x / 1000) * 100}%`, top: `${(curveY(x) / 300) * 100}%` };
  const wa = whatsappLink(c.wa.replace("{n}", String(n)).replace("{lane}", c.lanes[lane]));

  return (
    <section id="growth" aria-labelledby="growth-title" className="sea-band relative scroll-mt-16 overflow-hidden py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
        <span className="label">{c.eyebrow}</span>
        <h2 id="growth-title" className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-balance sm:text-6xl rtl:leading-[1.3] rtl:tracking-normal">
          <span className="block">{c.title[0]}</span>
          <span className="block">{c.title[1]}</span>
          <span className="block text-teal">{c.title[2]}</span>
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-teal-deep/75">{c.lead}</p>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          {/* the growth line + controls */}
          <div className="sea-glass rounded-3xl p-5 sm:p-8">
            <div role="radiogroup" aria-label={c.lane} className="flex flex-wrap gap-2">
              {LANES.map((l) => (
                <button
                  key={l}
                  type="button"
                  role="radio"
                  aria-checked={lane === l}
                  onClick={() => { setLane(l); track("planner_step", { step: "price", value: l }); }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${lane === l ? "bg-teal text-white shadow-[0_8px_20px_-10px_rgba(19,113,121,0.9)]" : "bg-white/70 text-teal-deep hover:bg-white"}`}
                >
                  {c.lanes[l]}
                </button>
              ))}
            </div>

            <div className="relative mt-6 aspect-[1000/300] w-full" dir="ltr" aria-hidden="true">
              <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
                <defs>
                  <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#6cc3c3" stopOpacity="0.45" />
                    <stop offset="1" stopColor="#6cc3c3" stopOpacity="0" />
                  </linearGradient>
                  <clipPath id={`${id}-clip`}>
                    <motion.rect x="0" y="0" height="300" initial={false} animate={{ width: x }} transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }} />
                  </clipPath>
                </defs>
                <path d={`${CURVE} L${X1} 300 L${X0} 300 Z`} fill="#c4e9e7" opacity="0.35" />
                <path d={`${CURVE} L${X1} 300 L${X0} 300 Z`} fill={`url(#${id}-fill)`} clipPath={`url(#${id}-clip)`} />
                <path d={CURVE} fill="none" stroke="#c3cdd2" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                <path d={CURVE} fill="none" stroke="#137179" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" clipPath={`url(#${id}-clip)`} />
              </svg>
              <Milestone at={{ x: X0 + 14, y: curveY(X0 + 14) }} label={c.milestones.first} below />
              <Milestone at={{ x: PEAK_X, y: curveY(PEAK_X) }} label={c.milestones.peak} />
              <motion.span
                className="absolute z-10 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-teal shadow-[0_0_0_6px_rgba(108,195,195,0.35)]"
                initial={false}
                animate={pos}
                transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            <label htmlFor={`${id}-n`} className="mt-6 flex items-baseline justify-between gap-3 text-sm font-medium text-teal-deep">
              {c.orders}
              <output htmlFor={`${id}-n`} className="num font-display text-2xl font-semibold">{n.toLocaleString("en-US")}</output>
            </label>
            <input
              id={`${id}-n`}
              type="range"
              min={1}
              max={MAX}
              step={1}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              dir="ltr"
              className="sea-range mt-3 w-full"
            />
          </div>

          {/* the price, straight from the rate card */}
          <aside data-rate-card aria-label={c.perShipment} className="sea-glass flex flex-col rounded-3xl p-6 sm:p-8" aria-live="polite">
            <p className="text-sm font-medium text-teal-deep/70">{c.lanes[lane]}</p>

            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-teal/15 pt-6">
              <div>
                <p className="text-sm text-teal-deep/70">{c.perShipment}</p>
                <p className="num mt-1 font-display text-4xl font-semibold text-teal-deep" dir="ltr">
                  <span className="me-1 text-lg">≈ {c.cur}</span>
                  <NumberFlow value={rate} locales="en-US" format={fmt} animated={!reduce} />
                </p>
              </div>
              <div>
                <p className="text-sm text-teal-deep/70">{c.monthly}</p>
                <p data-monthly={monthly} className="num mt-1 font-display text-4xl font-semibold text-teal" dir="ltr">
                  <span className="me-1 text-lg">{c.cur}</span>
                  <NumberFlow value={monthly} locales="en-US" format={fmt} animated={!reduce} />
                </p>
              </div>
            </div>

            <TrackedLink
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              event="whatsapp_click"
              props={{ location: "price-band" }}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-brand px-5 py-3 font-medium text-white transition-colors hover:bg-brand-strong"
            >
              <WhatsAppIcon className="size-5" /> {c.cta}
            </TrackedLink>
            <p className="mt-3 text-xs text-teal-deep/65">{c.note}</p>
          </aside>
        </div>

        {/* Sabya: the contrast beat, in dry Jazan sun */}
        <div className="mt-5 grid overflow-hidden rounded-3xl shadow-[0_30px_60px_-35px_rgba(120,80,20,0.45)] lg:grid-cols-[1.4fr_1fr]">
          <div className="relative min-h-[320px] overflow-hidden sm:min-h-[380px]">
            {warehousePhoto ? (
              <img src="/warehouse.jpg" alt={s.title} className="absolute inset-0 size-full object-cover" loading="lazy" />
            ) : (
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(80%_90%_at_85%_0%,#fff6dc,rgba(255,246,220,0)_60%),linear-gradient(160deg,#f3dfb6,#e6c48b_55%,#d9ae6c)]" />
            )}
            <div aria-hidden="true" className={`absolute inset-0 ${warehousePhoto ? "bg-[linear-gradient(0deg,rgba(40,24,6,0.78),rgba(40,24,6,0.15)_65%)]" : "bg-[linear-gradient(0deg,rgba(90,56,14,0.35),transparent_60%)]"}`} />
            <div className="relative flex h-full flex-col justify-end p-6 sm:p-10">
              <p className={`text-sm font-semibold ${warehousePhoto ? "text-[#ffe3a8]" : "text-[#6b4210]"}`}>{s.eyebrow}</p>
              <h3 className={`mt-2 max-w-xl font-display text-3xl font-semibold leading-tight tracking-[-0.02em] text-balance sm:text-5xl rtl:tracking-normal ${warehousePhoto ? "text-white" : "text-[#3b2408]"}`}>
                {s.title}
              </h3>
              <p className={`mt-3 max-w-lg ${warehousePhoto ? "text-white/85" : "text-[#4a2e0b]"}`}>{s.sub}</p>
            </div>
          </div>
          <aside data-rate-card aria-label={s.eyebrow} className="flex flex-col justify-center bg-[linear-gradient(180deg,#fffaf0,#fbf1dc)] p-6 text-[#3b2408] sm:p-10">
            <p className="text-sm text-[#6b4210]">{s.approx}</p>
            <dl className="mt-4 grid grid-cols-2 gap-4">
              {([["sabyaLocal", s.local], ["sabyaMajor", s.major]] as const).map(([k, label]) => (
                <div key={k} className="rounded-2xl bg-white/70 p-4">
                  <dt className="text-sm text-[#6b4210]">{label}</dt>
                  <dd className="num mt-1 font-display text-4xl font-semibold" dir="ltr">
                    <span className="me-1 text-lg">≈ {c.cur}</span>{RATE_CARD[k].t299}
                  </dd>
                </div>
              ))}
            </dl>
            <TrackedLink
              href={whatsappLink(s.wa)}
              target="_blank"
              rel="noopener noreferrer"
              event="whatsapp_click"
              props={{ location: "sabya" }}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-[#3b2408] px-5 py-3 font-medium text-white transition-colors hover:bg-[#2a1905]"
            >
              {s.cta} <ArrowIcon className="size-4 rtl:rotate-180" />
            </TrackedLink>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Milestone({ at, label, below = false }: { at: { x: number; y: number }; label: string; below?: boolean }) {
  return (
    <span className="absolute -translate-x-1/2" style={{ left: `${(at.x / 1000) * 100}%`, top: `${(at.y / 300) * 100}%` }}>
      <span className={`absolute left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-teal`} />
      <span className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium sm:text-xs ${below ? "top-3" : "-top-9"} bg-white/85 text-teal-deep`}>
        {label}
      </span>
    </span>
  );
}
