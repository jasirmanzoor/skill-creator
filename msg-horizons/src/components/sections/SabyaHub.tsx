"use client";

/* eslint-disable @next/next/no-img-element -- MSG's own warehouse photography, local webp */
import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { sabyaCopy, SABYA_RATES } from "@/content/sabya";
import { whatsappLink } from "@/content/facts";
import type { Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon } from "../ui/icons";

/**
 * Sabya Hub: the one geography most networks price as a penalty, pitched as MSG's advantage.
 * A full-width navy band. The map shows the Kingdom with the Sabya floor at the bottom; when the
 * visitor reaches the rate band, a truck leaves Sabya and runs north into the RUH / JED / DMM triangle.
 * Reduced motion: the lane is drawn and the truck is parked in Riyadh.
 */

const GOLD = "#d8b25a";

// Kingdom outline, coarse, in lon/lat. Projected into a 880×680 viewBox (lon 34–56, lat 16–33).
const KSA: [number, number][] = [
  [34.95, 29.36], [36.5, 29.5], [38, 30.5], [37, 31.5], [39.2, 32.15], [40.4, 31.9], [42, 31.1], [44.7, 29.2], [46.4, 29.1],
  [47.4, 29], [48.4, 28.5], [48.8, 27.6], [49.6, 26.9], [50.1, 26.2], [50.2, 25.6], [50.8, 24.75], [51.6, 24.25], [52, 23],
  [55.2, 22.7], [55.7, 22], [55, 20], [52, 19], [49.1, 18.6], [47.5, 17.1], [46.4, 17.2], [45.2, 17.4], [44, 17.4], [43.2, 16.8],
  [42.78, 16.37], [42.55, 16.9], [42, 17.9], [41.2, 19.1], [40.4, 20.2], [39.6, 20.9], [39.1, 21.7], [38.9, 22.6], [38.1, 24.1],
  [37.2, 25], [36.5, 26], [35.6, 27.4], [34.6, 28.1], [34.8, 28.9],
];
const px = ([lon, lat]: [number, number]) => ({ x: (lon - 34) * 40, y: (33 - lat) * 40 });
const OUTLINE = "M" + KSA.map((p) => { const q = px(p); return `${q.x.toFixed(1)} ${q.y.toFixed(1)}`; }).join(" L") + " Z";

const CITY = {
  sabya: px([42.63, 17.15]),
  riyadh: px([46.72, 24.71]),
  jeddah: px([39.17, 21.54]),
  dammam: px([50.1, 26.43]),
};
const S = CITY.sabya, R = CITY.riyadh, J = CITY.jeddah, D = CITY.dammam;
const LANE = `M ${S.x} ${S.y} C ${S.x + 10} ${S.y - 120}, ${R.x - 60} ${R.y + 150}, ${R.x} ${R.y}`;
const TRI = `M ${R.x} ${R.y} L ${J.x} ${J.y} M ${R.x} ${R.y} L ${D.x} ${D.y}`;
const pct = (p: { x: number; y: number }) => ({ left: `${(p.x / 880) * 100}%`, top: `${(p.y / 680) * 100}%` });

export default function SabyaHub({ lang }: { lang: Locale }) {
  const c = sabyaCopy[lang];
  const reduce = useReducedMotion();
  const rates = useRef<HTMLDivElement>(null);
  // first run when the rate band is read; hovering a northbound price sends the truck again
  const ratesSeen = useInView(rates, { amount: 0.5, once: true });
  const [replays, setReplays] = useState(0);
  const runs = ratesSeen ? 1 + replays : 0;
  const replay = () => setReplays((n) => n + 1);
  const wa = whatsappLink(c.waText);

  return (
    <section id="sabya" aria-labelledby="sabya-title" data-theme="dark" className="on-dark relative scroll-mt-16 overflow-hidden bg-[#061226] py-24 text-white lg:py-32">
      {/* backdrop: MSG's own warehouse floor, sunk into navy, with Saudi green and gold light */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden [contain:paint]">
        <img src="/photos/warehouse.webp" alt="" className="absolute inset-0 size-full object-cover opacity-[0.16]" loading="lazy" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#061226_0%,rgba(6,18,38,0.82)_35%,#061226_100%)]" />
        <div className="absolute -left-40 top-1/3 size-[640px] rounded-full bg-[radial-gradient(circle,rgba(11,125,54,0.32),transparent_65%)]" />
        <div className="absolute -right-32 -top-24 size-[560px] rounded-full bg-[radial-gradient(circle,rgba(216,178,90,0.16),transparent_65%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
        {/* 1–3 · the argument */}
        <div className="max-w-4xl">
          <p className="text-sm font-medium" style={{ color: GOLD }}>{c.eyebrow}</p>
          <h2 id="sabya-title" className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-6xl rtl:tracking-normal">
            {c.title}
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-white/75 text-pretty">{c.sub}</p>
        </div>

        {/* 4 · proof tiles */}
        <ul className="mt-12 grid gap-3 sm:grid-cols-3">
          {c.tiles.map((tile, i) => (
            <li key={i} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
              {i === 0 ? (
                <>
                  <img src="/photos/warehouse.webp" alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover opacity-35" loading="lazy" />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#061226] via-[#061226]/70 to-[#061226]/20" />
                </>
              ) : null}
              <div className="relative">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-3xl font-semibold tracking-[-0.02em] rtl:tracking-normal" dir="auto">{tile.value}</span>
                  <span className="text-sm font-medium" style={{ color: GOLD }} dir="auto">{tile.ar}</span>
                </div>
                <p className="mt-6 text-[15px] text-white/80">{tile.label}</p>
                <span aria-hidden="true" className="mt-4 block h-0.5 w-10 rounded-full" style={{ background: i === 1 ? "#4cc97a" : GOLD }} />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* 5 · body, then why the geography is hard, then the rate band */}
          <div className="order-1 min-w-0">
            {c.body.map((p, i) => <p key={i} className="text-lg leading-relaxed text-white/85 text-pretty">{p}</p>)}
            <p className="mt-6 text-white/85">{c.doIntro}</p>
            <ul className="mt-4 space-y-3">
              {c.does.map((d, i) => (
                <li key={i} className="flex gap-3 text-white/85">
                  <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full" style={{ background: GOLD }} />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 border-s-2 ps-4 font-display text-lg font-medium text-white" style={{ borderColor: GOLD }}>{c.bodyClose}</p>

            <h3 className="mt-14 font-display text-2xl font-semibold">{c.hardTitle}</h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {c.hard.map((h, i) => (
                <li key={i} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                  <p className="font-medium text-white">{h.t}</p>
                  <p className="mt-1 text-sm text-white/65">{h.d}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-xl border border-[#4cc97a]/30 bg-[#0b7d36]/20 p-4 text-white">{c.turn}</p>
          </div>

          {/* the map, then the rate band right under it: the truck runs while the prices are read */}
          <div className="order-2 min-w-0 space-y-4">
            <LaneMap c={c.map} runs={runs} reduce={reduce} />
            <div ref={rates}>
              <RateBand c={c.rates} onNorth={replay} />
            </div>
          </div>
        </div>

        {/* 7 · who this is for */}
        <div className="mt-16">
          <h3 className="font-display text-2xl font-semibold">{c.whoTitle}</h3>
          <ul className="mt-5 flex flex-wrap gap-2">
            {c.who.map((w, i) => (
              <li key={i} className="rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-[15px] text-white/90">{w}</li>
            ))}
          </ul>
        </div>

        {/* 8 · CTA */}
        <div className="mt-16 flex flex-col gap-6 rounded-3xl border p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: `${GOLD}55`, background: "linear-gradient(120deg, rgba(11,125,54,0.28), rgba(216,178,90,0.10))" }}>
          <div>
            <p className="font-display text-2xl font-semibold text-balance sm:text-3xl">{c.cta}</p>
            <p className="mt-2 text-white/70">{c.closer}</p>
          </div>
          <TrackedLink
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            event="whatsapp_click"
            props={{ location: "sabya" }}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md px-6 py-3.5 font-semibold text-[#061226] transition-transform hover:-translate-y-0.5"
            style={{ background: GOLD }}
          >
            {c.button} <ArrowIcon className="size-4 rtl:rotate-180" />
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}

function RateBand({ c, onNorth }: { c: (typeof sabyaCopy)["en"]["rates"]; onNorth: () => void }) {
  const cell = "px-4 py-3 text-end tabular-nums";
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a1a33]/80 p-5 backdrop-blur-md sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-xl font-semibold">{c.title}</h3>
        <p className="text-sm text-white/60">{c.unit}</p>
      </div>
      {/* owner-supplied rate card: the only place on the site that states prices */}
      <aside data-rate-card className="-mx-5 mt-4 overflow-x-auto px-5 sm:mx-0 sm:px-0" tabIndex={0} aria-label={c.title}>
        <table className="w-full min-w-[420px] border-collapse text-[15px]">
          <thead>
            <tr className="text-xs text-white/60">
              <th scope="col" className="px-4 py-2 text-start font-medium">{c.tier}</th>
              <th scope="col" className="px-4 py-2 text-end font-medium">{c.local}</th>
              <th scope="col" className="px-4 py-2 text-end font-medium" style={{ color: GOLD }}>{c.north}</th>
            </tr>
          </thead>
          <tbody>
            {SABYA_RATES.tiers.map((t) => (
              <tr key={t.id} className="border-t border-white/10">
                <th scope="row" className="px-4 py-3 text-start font-medium text-white/85">{c.tiers[t.id]}</th>
                <td className={cell}><span className="font-display text-xl font-semibold">{t.local}</span></td>
                <td className={cell} onPointerEnter={onNorth}><span className="font-display text-xl font-semibold" style={{ color: GOLD }}>{t.north}</span></td>
              </tr>
            ))}
            <tr className="border-t border-white/10">
              <th scope="row" className="px-4 py-3 text-start font-medium text-white/85">{c.sameDay}</th>
              <td className={cell}>+{SABYA_RATES.sameDay.local}</td>
              <td className={cell} style={{ color: GOLD }}>+{SABYA_RATES.sameDay.north}</td>
            </tr>
          </tbody>
        </table>
        <dl className="mt-4 grid gap-3 border-t border-white/10 pt-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-white">{c.cod}</dt>
            <dd className="mt-1 text-white/70">{c.codLow}</dd>
            <dd className="text-white/70">{c.codHigh}</dd>
          </div>
          <div>
            <dt className="font-medium text-white">{c.returns}</dt>
            <dd className="mt-1 text-white/70">{c.returnsFlat}</dd>
            <dd className="text-white/70">{c.returnsElse}</dd>
          </div>
        </dl>
      </aside>
      <p className="mt-3 text-xs text-white/50 sm:hidden" aria-hidden="true">{c.scroll} →</p>
    </div>
  );
}

function LaneMap({ c, runs, reduce }: { c: (typeof sabyaCopy)["en"]["map"]; runs: number; reduce: boolean }) {
  const lane = useRef<SVGPathElement>(null);
  const truck = useRef<HTMLDivElement>(null);
  const t = useMotionValue(reduce ? 1 : 0);
  const drawn = useTransform(t, [0, 1], [0, 1]);
  const branch = useTransform(t, [0.88, 1], [0, 1]);
  const cityGlow = useTransform(t, [0.9, 1], [0.35, 1]);

  const place = (v: number) => {
    const path = lane.current, el = truck.current;
    if (!path || !el) return;
    const p = path.getPointAtLength(v * path.getTotalLength());
    el.style.left = `${(p.x / 880) * 100}%`;
    el.style.top = `${(p.y / 680) * 100}%`;
  };
  useMotionValueEvent(t, "change", place);
  useEffect(() => {
    if (reduce) { t.set(1); place(1); return; }
    place(t.get());
    if (!runs) return;
    t.set(0);
    const a = animate(t, 1, { duration: 3.4, ease: [0.45, 0, 0.2, 1] });
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runs, reduce]);

  return (
    <figure className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(120%_90%_at_30%_100%,#0d2748,#071630_60%,#050f22)] p-3 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)]">
      <div className="relative aspect-[880/680] w-full" dir="ltr">
        <svg viewBox="0 0 880 680" className="absolute inset-0 size-full" aria-hidden="true">
          <defs>
            <linearGradient id="ksa-fill" x1="0" y1="1" x2="0.4" y2="0">
              <stop offset="0" stopColor="#0f3b2a" />
              <stop offset="1" stopColor="#12264a" />
            </linearGradient>
            <filter id="ksa-grain" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
              <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.08 0" />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
            <radialGradient id="sabya-heat" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={GOLD} stopOpacity="0.55" />
              <stop offset="1" stopColor={GOLD} stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d={OUTLINE} fill="url(#ksa-fill)" stroke={GOLD} strokeOpacity="0.45" strokeWidth="1.6" strokeLinejoin="round" />
          <path d={OUTLINE} fill="#fff" filter="url(#ksa-grain)" />
          <circle cx={S.x} cy={S.y} r="70" fill="url(#sabya-heat)" />
          {/* the city triangle */}
          <path d={`M ${J.x} ${J.y} L ${D.x} ${D.y}`} stroke="#fff" strokeOpacity="0.12" strokeDasharray="3 7" strokeWidth="1.5" fill="none" />
          <path d={TRI} stroke="#fff" strokeOpacity="0.15" strokeDasharray="3 7" strokeWidth="1.5" fill="none" />
          <motion.path d={TRI} stroke="#4cc97a" strokeWidth="2.5" strokeLinecap="round" fill="none" style={{ pathLength: branch }} />
          {/* the northbound lane */}
          <path ref={lane} d={LANE} stroke="#fff" strokeOpacity="0.18" strokeWidth="2" strokeDasharray="4 7" fill="none" />
          <motion.path d={LANE} stroke={GOLD} strokeWidth="3.5" strokeLinecap="round" fill="none" style={{ pathLength: drawn }} />
          {[R, J, D].map((p, i) => (
            <motion.circle key={i} cx={p.x} cy={p.y} r="7" fill="#4cc97a" stroke="#061226" strokeWidth="3" style={{ opacity: cityGlow }} />
          ))}
          <circle cx={S.x} cy={S.y} r="9" fill={GOLD} stroke="#061226" strokeWidth="3" />
        </svg>

        {/* labels (HTML, so Arabic shapes properly) */}
        <MapLabel at={R} text={c.riyadh} code="RUH" below />
        <MapLabel at={J} text={c.jeddah} code="JED" side="left" />
        <MapLabel at={D} text={c.dammam} code="DMM" />

        {/* the Sabya floor, with its photo, sitting in the Red Sea margin beside the pin */}
        <div className="absolute flex -translate-x-full -translate-y-[85%] items-center gap-2 rounded-xl border bg-[#061226]/90 p-1.5 pe-3 backdrop-blur" style={{ ...pct({ x: S.x - 18, y: S.y }), borderColor: `${GOLD}66` }}>
          <img src="/photos/warehouse.webp" alt="" className="size-9 rounded-lg object-cover sm:size-11" loading="lazy" />
          <span className="leading-tight">
            <span className="block text-[11px] font-semibold sm:text-sm" style={{ color: GOLD }} dir="auto">{c.sabya}</span>
            <span className="block text-[10px] text-white/75 sm:text-xs" dir="auto">{c.hub}</span>
          </span>
        </div>

        {/* the truck */}
        <div ref={truck} data-truck className="absolute -translate-x-1/2 -translate-y-[calc(100%+2px)]" style={pct(S)}>
          <span className="flex items-center justify-center rounded-lg bg-white px-1.5 py-1 shadow-[0_6px_18px_rgba(0,0,0,0.45)] ring-2" style={{ ["--tw-ring-color" as string]: GOLD }}>
            <TruckIcon />
          </span>
        </div>
      </div>
      <figcaption className="flex items-center justify-between gap-3 px-2 pb-1 pt-3 text-xs text-white/65">
        <span className="flex items-center gap-2"><span aria-hidden="true" className="h-0.5 w-6 rounded-full" style={{ background: GOLD }} />{c.lane}</span>
        <span dir="ltr">RUH · JED · DMM</span>
      </figcaption>
    </figure>
  );
}

function MapLabel({ at, text, code, side = "right", below = false }: { at: { x: number; y: number }; text: string; code: string; side?: "left" | "right"; below?: boolean }) {
  return (
    <span
      className={`absolute ${below ? "translate-y-2.5" : "-translate-y-1/2"} whitespace-nowrap rounded-md bg-[#061226]/80 px-1.5 py-0.5 text-[10px] text-white sm:text-xs ${side === "left" ? "-translate-x-[calc(100%+12px)]" : "translate-x-3"}`}
      style={pct(at)}
    >
      <span dir="auto">{text}</span> <span className="text-white/55">{code}</span>
    </span>
  );
}

function TruckIcon() {
  return (
    <svg width="30" height="16" viewBox="0 0 30 16" aria-hidden="true">
      <rect x="0.5" y="1" width="18" height="10.5" rx="1.5" fill="#0b7d36" />
      <text x="9.5" y="8.6" textAnchor="middle" fontSize="5.6" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">MSG</text>
      <path d="M19.5 4h5l3.5 4v3.5h-8.5z" fill="#061226" />
      <path d="M21 5.2h3.1l2.2 2.6H21z" fill="#9cc3ff" />
      <circle cx="5" cy="13" r="2.2" fill="#061226" /><circle cx="13" cy="13" r="2.2" fill="#061226" /><circle cx="24" cy="13" r="2.2" fill="#061226" />
    </svg>
  );
}
