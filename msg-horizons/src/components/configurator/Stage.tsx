"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { fmt, type Locale } from "@/content/i18n";
import { configuratorCopy } from "@/content/configurator";
import { CITY_XY, KSA } from "@/lib/ksaGeo";
import type { Area, DeliveryWindow, SizerInput } from "@/lib/sizer";
import { EASE_OUT } from "@/lib/motion";

/**
 * The configurator's visual stage: the left half on a desktop, the band across the top on a phone. Each chapter
 * answers the visitor's choice with its own visual, so the stage is never the same picture with new words:
 *   - MSG's own photograph for the business profile (it changes with the profile chosen),
 *   - the visitor's own day of orders drawn to scale for the volume,
 *   - the Kingdom, with MSG's two real sites and the visitor's destinations, for the route,
 *   - the order's milestones on a two-day axis for the speed.
 * Nothing here shows an MSG capacity, a coverage claim or a delivery time that MSG has not stated.
 */

const ease = { duration: 0.55, ease: EASE_OUT };

/** a full-bleed MSG photograph that eases in whenever it changes */
export function StagePhoto({ src, pos, reduce, dim = 0.45 }: { src: string; pos: string; reduce: boolean; dim?: number }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[#0b0f17]">
      <AnimatePresence initial={false}>
        <motion.div
          key={src}
          className="absolute inset-0"
          initial={reduce ? false : { opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.9, ease: EASE_OUT }}
        >
          <Image src={src} alt="" fill sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" style={{ objectPosition: pos }} />
        </motion.div>
      </AnimatePresence>
      <span className="absolute inset-0" style={{ background: `rgba(11,15,23,${dim})` }} />
      <span className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#0b0f17] via-[#0b0f17]/70 to-transparent" />
    </div>
  );
}

/* ───────────────────────── Volume: the visitor's own day, to scale ───────────────────────── */

const UNITS = [1, 2, 5, 10, 25, 50, 100, 250, 500];
export function unitFor(orders: number) {
  return UNITS.find((u) => Math.ceil(orders / u) <= 120) ?? 1000;
}

export function VolumeField({ net, lang, reduce }: { net: SizerInput; lang: Locale; reduce: boolean }) {
  const c = configuratorCopy[lang].volume;
  const unit = unitFor(Math.round(net.orders * net.peak));
  const base = Math.max(1, Math.ceil(net.orders / unit));
  const extra = Math.max(0, Math.ceil((net.orders * net.peak) / unit) - base);
  const marks = Array.from({ length: base + extra }, (_, i) => i < base);
  return (
    <div className="relative">
      <div className="flex items-baseline justify-between gap-4">
        <p className="lbl-cfg text-white/60">{c.field}</p>
        <p className="num text-xs text-white/50" dir="ltr">{fmt(c.each, { n: unit.toLocaleString("en-US") })}</p>
      </div>
      <div className="mt-3 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-[3px]" role="img" aria-label={`${net.orders.toLocaleString("en-US")} ${c.perDay}`}>
        {marks.map((on, i) => (
          <motion.span
            key={i}
            initial={reduce ? false : { opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: reduce ? 0 : Math.min(i, 60) * 0.004, ease: EASE_OUT }}
            className={`aspect-square rounded-[2px] ${on ? "bg-white/85" : "bg-[#009df8]/45"}`}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-white/50">{c.fieldNote}</p>
    </div>
  );
}

/* ───────────────────────── Route: the Kingdom, MSG's two sites, the visitor's destinations ───────────────────────── */

const S = 0.62; // shared projection (lib/ksaGeo: 50 units a degree) scaled to the stage
const P = (k: keyof typeof CITY_XY) => ({ x: CITY_XY[k].x * S, y: CITY_XY[k].y * S });
const OUTLINE = `M${KSA.map((p) => `${(p.x * S).toFixed(1)} ${(p.y * S).toFixed(1)}`).join(" L")} Z`;
const DESTS: Record<Area, (keyof typeof CITY_XY)[]> = {
  riyadh: [],
  multi: ["jeddah", "dammam", "buraidah"],
  kingdom: ["jeddah", "makkah", "madinah", "dammam", "abha", "tabuk", "hail", "buraidah", "najran", "taif", "ahsa"],
};
const arc = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y;
  return `M${a.x} ${a.y} Q${mx - dy * 0.18} ${my + dx * 0.18} ${b.x} ${b.y}`;
};

export function RouteMap({ area, lang, reduce }: { area: Area; lang: Locale; reduce: boolean }) {
  const c = configuratorCopy[lang].route;
  const R = P("riyadh");
  const SB = P("sabya");
  return (
    <svg viewBox="0 10 690 520" direction="ltr" role="img" aria-label={`${c.hq}, ${c.hub}. ${c.areaLead[area]}`} className="block h-auto w-full">
      <defs>
        <pattern id="cfg-dots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="1.1" fill="rgba(255,255,255,0.16)" /></pattern>
        <clipPath id="cfg-ksa"><path d={OUTLINE} /></clipPath>
      </defs>
      <rect x="0" y="0" width="700" height="560" fill="url(#cfg-dots)" clipPath="url(#cfg-ksa)" />
      <path d={OUTLINE} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinejoin="round" />
      {/* same-city: a ring of deliveries round Riyadh */}
      <motion.circle cx={R.x} cy={R.y} fill="rgba(0,157,248,0.14)" stroke="#009df8" strokeWidth="1" strokeDasharray="3 4"
        initial={false} animate={{ r: area === "riyadh" ? 34 : 18, opacity: 1 }} transition={reduce ? { duration: 0 } : ease} />
      {/* the visitor's destinations, by road from Riyadh */}
      <AnimatePresence>
        {DESTS[area].map((k, i) => {
          const b = P(k);
          return (
            <motion.g key={k} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <motion.path d={arc(R, b)} fill="none" stroke="#7fcbfb" strokeWidth="1.4" strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduce ? 0 : 0.9, delay: reduce ? 0 : i * 0.05, ease: EASE_OUT }} />
              <circle cx={b.x} cy={b.y} r="3.5" fill="#7fcbfb" />
            </motion.g>
          );
        })}
      </AnimatePresence>
      {/* MSG's own sites: the Riyadh headquarters and the Sabya hub */}
      <path d={arc(R, SB)} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="2 5" />
      <rect x={R.x - 7} y={R.y - 7} width="14" height="14" rx="2" fill="#fff" />
      <circle cx={SB.x} cy={SB.y} r="7" fill="#009df8" stroke="#fff" strokeWidth="2" />
      <g fontFamily="var(--font-sans)" fontSize="14" fontWeight="600" fill="#fff">
        <text x={R.x + 14} y={R.y + 5}>{c.hq}</text>
        <text x={SB.x - 12} y={SB.y + 26} textAnchor="end">{c.hub}</text>
      </g>
    </svg>
  );
}

/* ───────────────────────── Speed: an order's milestones on a two-day axis ───────────────────────── */

const AT: Record<DeliveryWindow, [number, number, number, number]> = {
  // positions on the axis (0 = start of day 1, 1 = end of day 2): order in, picked up, hub scan, delivered
  sameday: [0.06, 0.18, 0.28, 0.42],
  nextday: [0.06, 0.3, 0.44, 0.74],
  scheduled: [0.06, 0.3, 0.44, 0.88],
};

export function SpeedTimeline({ window: w, lang, reduce }: { window: DeliveryWindow; lang: Locale; reduce: boolean }) {
  const c = configuratorCopy[lang].speed;
  const at = AT[w];
  const t = reduce ? { duration: 0 } : { duration: 0.7, ease: EASE_OUT };
  return (
    <div className="relative" role="img" aria-label={`${c.milestones.join(", ")}. ${c.lead[w]}`}>
      <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50 rtl:tracking-normal">
        <span>{c.day0}</span>
        <span>{c.day1}</span>
      </div>
      <div className="relative mt-4 h-24" dir="ltr">
        <span className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
        <span className="absolute left-1/2 top-[30%] h-[40%] w-px bg-white/20" />
        <motion.span className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-[#009df8]" initial={false} animate={{ width: `${at[3] * 100}%` }} transition={t} />
        {w === "scheduled" ? (
          <motion.span className="absolute top-1/2 h-6 -translate-y-1/2 rounded-md border border-dashed border-[#7fcbfb]/60" initial={false} animate={{ left: "80%", width: "16%" }} transition={t} />
        ) : null}
        {c.milestones.map((m, i) => (
          <motion.div key={m} className="absolute top-1/2" initial={false} animate={{ left: `${at[i] * 100}%` }} transition={t}>
            <span className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${i === 3 ? "size-3.5 bg-white ring-4 ring-[#009df8]/40" : "size-2.5 bg-[#7fcbfb]"}`} />
            <span className={`absolute -translate-x-1/2 whitespace-nowrap text-[11px] font-medium text-white/75 ${i % 2 ? "top-4" : "-top-8"}`}>{m}</span>
          </motion.div>
        ))}
      </div>
      {w === "scheduled" ? <p className="mt-1 text-end text-[11px] text-[#7fcbfb]">{c.slot}</p> : null}
    </div>
  );
}
