"use client";

/* eslint-disable @next/next/no-img-element -- the Sabya warehouse slot is MSG's own photo, served locally */
import { EASE_OUT, SPRING_SMOOTH } from "@/lib/motion";
import NumberFlow from "@number-flow/react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useId, useRef } from "react";
import { usePlan } from "../PlanContext";
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
  const o = redSea[lang].outlet;
  const reduce = useReducedMotion();
  const id = useId();
  // carries on from the hero's quote: same lane, same monthly orders (this chart tops out at MAX)
  const { quote, setQuote } = usePlan();
  const lane = quote.lane;
  const n = Math.min(quote.orders, MAX);
  const setLane = (l: Lane) => setQuote({ lane: l });
  const setN = (v: number) => setQuote({ orders: v });

  const rate = rateFor(lane, n);
  const monthly = n * rate;
  const x = xFor(n);
  const pos = { left: `${(x / 1000) * 100}%`, top: `${(curveY(x) / 300) * 100}%` };
  const wa = whatsappLink(c.wa.replace("{n}", String(n)).replace("{lane}", c.lanes[lane]));

  return (
    <section id="growth" aria-labelledby="growth-title" className="sea-band relative scroll-mt-16 sec overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
        <h2 id="growth-title" className="h-display">
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
                  className={`tap rounded-full px-4 py-2 text-sm font-medium transition-colors ${lane === l ? "bg-teal text-white shadow-[var(--shadow-teal)]" : "bg-white/70 text-teal-deep hover:bg-white"}`}
                >
                  {c.lanes[l]}
                </button>
              ))}
            </div>

            <div className="relative mt-6 aspect-[1000/300] w-full" dir="ltr" aria-hidden="true">
              <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
                <defs>
                  <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="var(--color-sea-400)" stopOpacity="0.45" />
                    <stop offset="1" stopColor="var(--color-sea-400)" stopOpacity="0" />
                  </linearGradient>
                  <clipPath id={`${id}-clip`}>
                    <motion.rect x="0" y="0" height="300" initial={false} animate={{ width: x }} transition={{ duration: reduce ? 0 : 0.4, ease: EASE_OUT }} />
                  </clipPath>
                </defs>
                <path d={`${CURVE} L${X1} 300 L${X0} 300 Z`} fill="var(--color-sea-200)" opacity="0.35" />
                <path d={`${CURVE} L${X1} 300 L${X0} 300 Z`} fill={`url(#${id}-fill)`} clipPath={`url(#${id}-clip)`} />
                <path d={CURVE} fill="none" stroke="#c3cdd2" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                <path d={CURVE} fill="none" stroke="var(--color-teal)" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" clipPath={`url(#${id}-clip)`} />
              </svg>
              <Milestone at={{ x: X0 + 14, y: curveY(X0 + 14) }} label={c.milestones.first} below />
              <Milestone at={{ x: PEAK_X, y: curveY(PEAK_X) }} label={c.milestones.peak} />
              <motion.span
                className="absolute z-10 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-teal shadow-[0_0_0_6px_rgba(108,195,195,0.35)]"
                initial={false}
                animate={pos}
                transition={{ duration: reduce ? 0 : 0.5, ease: EASE_OUT }}
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
                <p className="num mt-1 font-display text-4xl font-semibold text-teal-deep">
                  <Money cur={c.cur} approx ar={lang === "ar"}><NumberFlow value={rate} locales="en-US" format={fmt} animated={!reduce} /></Money>
                </p>
              </div>
              <div>
                <p className="text-sm text-teal-deep/70">{c.monthly}</p>
                <p data-monthly={monthly} className="num mt-1 font-display text-4xl font-semibold text-teal">
                  <Money cur={c.cur} ar={lang === "ar"}><NumberFlow value={monthly} locales="en-US" format={fmt} animated={!reduce} /></Money>
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
          <div className="relative min-h-[380px] overflow-hidden sm:min-h-[460px]">
            {warehousePhoto ? (
              <SabyaDoor alt={s.title} reduce={reduce} />
            ) : (
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(80%_90%_at_85%_0%,#fff6dc,rgba(255,246,220,0)_60%),linear-gradient(160deg,#f3dfb6,#e6c48b_55%,#d9ae6c)]" />
            )}
            <div aria-hidden="true" className={`absolute inset-0 ${warehousePhoto ? "bg-[linear-gradient(0deg,rgba(40,24,6,0.78),rgba(40,24,6,0.15)_65%)]" : "bg-[linear-gradient(0deg,rgba(90,56,14,0.35),transparent_60%)]"}`} />
            <div className="relative flex h-full flex-col justify-end p-6 sm:p-10">
              <p className={`text-sm font-semibold ${warehousePhoto ? "text-[#ffe3a8]" : "text-sand-700"}`}>{s.eyebrow}</p>
              <h3 className={`mt-2 max-w-xl font-display text-3xl font-semibold leading-tight tracking-[-0.02em] text-balance sm:text-5xl rtl:tracking-normal ${warehousePhoto ? "text-white" : "text-sand-900"}`}>
                {s.title}
              </h3>
              <p className={`mt-3 max-w-lg ${warehousePhoto ? "text-white/85" : "text-[#4a2e0b]"}`}>{s.sub}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {s.points.map((pt) => (
                  <li key={pt} className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 backdrop-blur ${warehousePhoto ? "bg-black/30 text-white ring-white/25" : "bg-white/60 text-sand-900 ring-sand-900/15"}`}>{pt}</li>
                ))}
              </ul>
            </div>
          </div>
          <aside data-rate-card aria-label={s.eyebrow} className="flex flex-col justify-center bg-[linear-gradient(180deg,#fffaf0,#fbf1dc)] p-6 text-sand-900 sm:p-10">
            <p className="text-sm text-sand-700">{s.approx}</p>
            <dl className="mt-4 grid grid-cols-2 gap-4">
              {([["sabyaLocal", s.local], ["sabyaMajor", s.major]] as const).map(([k, label]) => (
                <div key={k} className="rounded-2xl bg-white/70 p-4">
                  <dt className="text-sm text-sand-700">{label}</dt>
                  <dd className="num mt-1 font-display text-4xl font-semibold">
                    <Money cur={c.cur} approx ar={lang === "ar"}>{RATE_CARD[k].t299}</Money>
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
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-sand-900 px-5 py-3 font-medium text-white transition-colors hover:bg-[#2a1905]"
            >
              {s.cta} <ArrowIcon className="size-4 rtl:rotate-180" />
            </TrackedLink>
          </aside>
        </div>

        {/* the outlet: an iMile franchise store MSG owns and runs */}
        <div className="mt-5 grid overflow-hidden rounded-3xl bg-white shadow-[0_30px_60px_-35px_rgba(11,58,64,0.45)] ring-1 ring-teal/10 sm:grid-cols-[0.8fr_1.2fr]">
          <div className="relative min-h-[300px] overflow-hidden">
            <img src="/media/msg/outlet.jpg" alt={o.alt} loading="lazy" className="absolute inset-0 size-full object-cover [object-position:50%_42%]" />
          </div>
          <div className="flex flex-col justify-center gap-5 p-6 sm:p-10 lg:flex-row lg:items-center lg:gap-10">
            <div className="flex-1">
              <p className="text-sm font-semibold text-teal">{o.eyebrow}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-teal-deep text-balance sm:text-3xl rtl:tracking-normal">{o.title}</h3>
              <p className="mt-3 max-w-lg text-teal-deep/80">{o.body}</p>
            </div>
            <RadiusRings label={o.radius} reduce={reduce} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** the outlet at the centre, its delivery district around it */
function RadiusRings({ label, reduce }: { label: string; reduce: boolean }) {
  return (
    <div className="relative mx-auto grid size-44 shrink-0 place-items-center" aria-hidden="true">
      {[1, 0.72, 0.44].map((k, i) => (
        <span key={k} className="absolute rounded-full border border-teal/25 bg-teal/[0.04]" style={{ width: `${k * 100}%`, height: `${k * 100}%` }}>
          {!reduce && i === 0 ? <span className="absolute inset-0 rounded-full border-2 border-brand-bright/60 motion-safe:animate-ping [animation-duration:2.8s]" /> : null}
        </span>
      ))}
      <span className="relative grid size-10 place-items-center rounded-full bg-teal-deep text-white shadow-lg">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h16l-1.5-5h-13zM5 10v9h14v-9M10 19v-5h4v5" /></svg>
      </span>
      <span className="absolute -bottom-3 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">{label}</span>
    </div>
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

/** "≈ SAR 33" in English; "≈ 33 ريال" in Arabic (currency after the amount, read right to left). */
export function Money({ cur, approx = false, ar, children }: { cur: string; approx?: boolean; ar: boolean; children: React.ReactNode }) {
  return (
    <span dir={ar ? "rtl" : "ltr"} className="inline-flex items-baseline gap-1.5">
      {approx ? <span className="text-lg">≈</span> : null}
      {ar ? <>{children}<span className="text-lg">{cur}</span></> : <><span className="text-lg">{cur}</span>{children}</>}
    </span>
  );
}

/**
 * Inside MSG's Sabya hub. The hero already walks through the front door, so here the floor simply settles into
 * place as the card scrolls in.
 */
function SabyaDoor({ alt, reduce }: { alt: string; reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { ...SPRING_SMOOTH });
  const scale = useTransform(p, [0, 1], [1.18, 1]);
  if (reduce) return <img src="/photos/msg/warehouse-floor.webp" alt={alt} className="absolute inset-0 size-full object-cover" loading="lazy" />;
  return (
    <div ref={ref} className="absolute inset-0">
      <motion.img src="/photos/msg/warehouse-floor.webp" alt={alt} loading="lazy" style={{ scale }} className="absolute inset-0 size-full object-cover" />
    </div>
  );
}
