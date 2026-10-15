"use client";

import NumberFlow from "@number-flow/react";
import Image from "next/image";
import { AnimatePresence, motion, type MotionValue } from "motion/react";
import { useEffect, useState } from "react";
import { heroCopy, type HeroLane } from "@/content/hero";
import { facts } from "@/content/facts";
import type { Locale } from "@/content/i18n";
import { EASE_OUT, SPRING_UI } from "@/lib/motion";
import HeroMap from "./HeroMap";

/*
 * The opening screen's parts: MSG's network shown as the console a seller would run it from.
 * Everything that moves states something true about MSG: the map is the network (captioned illustrative),
 * the order card walks one order through the steps MSG owns end to end, the price is MSG's own rate card.
 */

type C = (typeof heroCopy)["en"];

/** the night the console sits in: MSG's Sabya hub, toned down, and a floor of light receding under it */
export function CommandBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[#03161a]">
      <div className="absolute inset-0 motion-safe:animate-[hero-breathe_24s_var(--ease-ambient)_infinite_alternate]">
        <Image src="/media/msg/hub-aerial.webp" alt="" fill priority sizes="100vw" className="object-cover object-[50%_40%] opacity-[0.22] [filter:grayscale(1)_contrast(1.15)]" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_72%_42%,rgba(19,113,121,0.55),transparent_70%),radial-gradient(50%_40%_at_10%_100%,rgba(11,125,54,0.28),transparent_70%),linear-gradient(180deg,rgba(3,22,26,0.7)_0%,rgba(3,22,26,0.35)_40%,rgba(3,22,26,0.92)_100%)]" />
      {/* the floor: lines run toward the viewer, the network never stops */}
      <div className="absolute inset-x-[-30%] bottom-0 h-[55%] origin-bottom [transform:perspective(520px)_rotateX(62deg)] [mask-image:linear-gradient(0deg,#000_10%,transparent_85%)]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(108,195,195,0.16)_1px,transparent_1px),linear-gradient(0deg,rgba(108,195,195,0.16)_1px,transparent_1px)] bg-[size:64px_64px] motion-safe:animate-[cmd-floor_3.2s_linear_infinite]" />
      </div>
    </div>
  );
}

/** Riyadh time, ticking: the console is live, whatever hour the visitor arrives */
export function RiyadhClock({ label }: { label: string }) {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const f = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Riyadh", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const tick = () => setNow(f.format(new Date()));
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => { window.clearTimeout(first); window.clearInterval(id); };
  }, []);
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/75">
      {label}
      <span className="num tabular-nums text-white" dir="ltr">{now ?? "--:--:--"}</span>
    </span>
  );
}

const STEP_ICON = [
  // driver accepted: a phone with a tick
  <path key="0" d="M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm1.5 9.5 2 2 3.5-4" />,
  // collected: a box
  <path key="1" d="M4 8l8-4 8 4v8l-8 4-8-4V8Zm0 0 8 4 8-4M12 12v8" />,
  // line-haul: a van
  <path key="2" d="M3 7h11v9H3V7Zm11 3h4l3 3v3h-7v-6ZM7 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />,
  // out for delivery: a pin
  <path key="3" d="M12 21s-6-5.4-6-11a6 6 0 1 1 12 0c0 5.6-6 11-6 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
  // delivered: a badge with a tick
  <path key="4" d="M12 3l2.4 1.8 3-.2.9 2.9 2.4 1.8-1 2.7 1 2.7-2.4 1.8-.9 2.9-3-.2L12 21l-2.4-1.8-3 .2-.9-2.9L3.3 14.7l1-2.7-1-2.7 2.4-1.8.9-2.9 3 .2L12 3Zm-3 9 2 2 4-4" />,
  // cash settled: a coin
  <path key="5" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm2.5-11.5c-.4-.9-1.4-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.1 0-2.1-.6-2.5-1.5M12 6.5v11" />,
];
export const ORDER_STEP_MS = 2400;

/**
 * One order, live: the six steps MSG runs for every order, from the driver's yes to the cash back in the
 * seller's account. The newest step slides in on top; the ones before it stay ticked below.
 */
export function OrderTicker({ c, run, reduce, className = "" }: { c: C; run: boolean; reduce: boolean; className?: string }) {
  const steps = c.command.order.steps;
  const [i, setI] = useState(reduce ? steps.length - 1 : 0);
  useEffect(() => {
    if (!run || reduce) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % steps.length), ORDER_STEP_MS);
    return () => window.clearInterval(id);
  }, [run, reduce, steps.length]);
  const shown = steps.slice(Math.max(0, i - 2), i + 1).map((s, k, a) => ({ ...s, n: i - (a.length - 1 - k) })).reverse();
  return (
    <div className={`w-[17.5rem] rounded-2xl bg-white p-3.5 text-teal-deep shadow-[0_30px_60px_-20px_rgba(0,0,0,0.65)] ring-1 ring-black/5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-2 text-[13px] font-semibold">
          <span className="relative flex size-2"><span className="absolute inset-0 rounded-full bg-brand-vivid/60 motion-safe:animate-ping" /><span className="relative size-2 rounded-full bg-brand-vivid" /></span>
          {c.command.order.label}
        </p>
        <span className="text-[10px] text-teal-deep/70">{c.command.order.note}</span>
      </div>
      {/* where this order is, out of six */}
      <ol aria-hidden="true" className="mt-2.5 grid grid-cols-6 gap-1">
        {steps.map((s, k) => (
          <li key={s.t} className="h-1 overflow-hidden rounded-full bg-sea-100">
            <span className={`block h-full origin-left rounded-full bg-brand-vivid transition-transform ease-out rtl:origin-right ${k <= i ? "scale-x-100" : "scale-x-0"}`} style={{ transitionDuration: k === i ? `${ORDER_STEP_MS * 0.6}ms` : "200ms" }} />
          </li>
        ))}
      </ol>
      <ul aria-live="off" className="relative mt-2.5 h-[8.6rem] overflow-hidden">
        <AnimatePresence initial={false}>
          {shown.map((s, k) => (
            <motion.li
              key={s.n}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: -14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ type: "spring", ...SPRING_UI }}
              className={`flex items-start gap-2.5 rounded-xl px-2 py-2 ${k === 0 ? "bg-sea-50" : "text-teal-deep/70"}`}
            >
              <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${k === 0 ? "bg-teal-deep text-white" : "bg-sea-50 text-teal/70"}`}>
                <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{STEP_ICON[s.n]}</svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold">{s.t}</span>
                  <span className="num shrink-0 text-[10px] tabular-nums text-teal-deep/70" dir="ltr">{s.at}</span>
                </span>
                {k === 0 ? <span className="mt-0.5 block text-[11px] leading-snug text-teal-deep/75">{s.d}</span> : null}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/** the console: MSG's network on a screen, tilted toward the visitor, with the lane switch under it */
export function ConsoleWindow({
  c, lang, lane, onLane, map, title,
}: { c: C; lang: Locale; lane: HeroLane; onLane: (l: HeroLane) => void; map: boolean; title: string }) {
  return (
    <div className="rounded-[26px] bg-[linear-gradient(160deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))] p-2 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.25)] ring-1 ring-white/15">
      <div className="flex items-center gap-3 px-3 pb-2 pt-1.5">
        <span aria-hidden="true" className="flex gap-1.5"><span className="size-2.5 rounded-full bg-white/25" /><span className="size-2.5 rounded-full bg-white/25" /><span className="size-2.5 rounded-full bg-brand-bright/80" /></span>
        <span className="truncate text-[12px] font-semibold text-white/85">{title}</span>
        <span className="ms-auto"><RiyadhClock label={c.command.clock} /></span>
      </div>
      <div className="relative overflow-hidden rounded-[20px] bg-[radial-gradient(80%_70%_at_70%_20%,#d6f0ee_0%,rgba(214,240,238,0)_70%),linear-gradient(180deg,#f3fbfb,#e6f5f4)]">
        <div className="relative aspect-[1100/850]">
          {map ? <HeroMap lang={lang} lane={lane} /> : null}
          {/* the scan: the picture is refreshed, not printed */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-[linear-gradient(180deg,transparent,rgba(19,113,121,0.08)_70%,rgba(19,113,121,0.22))] motion-safe:animate-[cmd-scan_6s_var(--ease-in-out)_infinite] motion-reduce:hidden" />
          <p className="absolute bottom-2 start-3 text-[10px] text-teal-deep/70">{c.map.caption}</p>
        </div>
      </div>
      {/* the lane switch sits clear of the order card that overlaps the console's lower corner */}
      <div role="radiogroup" aria-label={c.command.lanes} className="mt-2 ms-auto grid w-[60%] grid-cols-3 gap-1 rounded-full bg-black/25 p-1 ring-1 ring-white/10 max-lg:hidden">
        {(["intra", "inter", "sabya"] as const).map((k) => (
          <button key={k} type="button" role="radio" aria-checked={lane === k} onClick={() => onLane(k)} className="tap relative whitespace-nowrap rounded-full px-1.5 py-1.5 text-[11px] font-semibold xl:text-[12px]">
            {lane === k ? <motion.span layoutId="cmd-lane" transition={{ type: "spring", ...SPRING_UI }} className="absolute inset-0 rounded-full bg-white" /> : null}
            <span className={`relative ${lane === k ? "text-teal-deep" : "text-white/75"}`}>{c.quote.lanes[k]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** the network's size, counted up from MSG's verified figures (content/facts.ts) */
export function Strengths({ c, go, reduce, ar }: { c: C; go: boolean; reduce: boolean; ar: boolean }) {
  return (
    <dl className="grid grid-cols-3 gap-y-3 sm:grid-cols-5">
      {c.command.strengths.map((s, i) => (
        <div key={s.l} className={`px-3 first:ps-0 sm:border-s sm:border-white/12 sm:first:border-0 ${i > 2 ? "max-sm:hidden" : ""}`}>
          <dd className="font-display text-[1.35rem] font-semibold leading-none tracking-[-0.02em] text-white sm:text-[1.7rem] rtl:tracking-normal" dir={ar ? "rtl" : "ltr"}>
            <span className="num" dir="ltr">
              {reduce ? `${s.pre ?? ""}${s.v.toLocaleString("en-US")}${s.suffix}` : (
                <>
                  <NumberFlow value={go ? s.v : 0} prefix={s.pre} suffix={s.suffix} locales="en-US" format={{ useGrouping: true }} transformTiming={{ duration: 1400, easing: "cubic-bezier(.23,1,.32,1)" }} aria-hidden="true" />
                  <span className="sr-only">{`${s.pre ?? ""}${s.v.toLocaleString("en-US")}${s.suffix}`}</span>
                </>
              )}
            </span>
            {s.unit ? <span className="ms-1 text-base text-white/85">{s.unit}</span> : null}
          </dd>
          <dt className="mt-1.5 text-[11px] leading-tight text-white/70 sm:text-xs">{s.l}</dt>
        </div>
      ))}
    </dl>
  );
}

/** the partner networks MSG runs alongside, as text (no third-party logos here) */
export function PartnerLine({ c }: { c: C }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-white/70">
      <span className="font-semibold text-white/85">{c.command.partners}</span>
      {facts.partners.map((p, i) => (
        <span key={p} className="inline-flex items-center gap-2.5">{i ? <span aria-hidden="true" className="size-1 rounded-full bg-white/30" /> : null}{p}</span>
      ))}
    </p>
  );
}

/** a small fact pinned to the console */
export function Chip({ icon, t, d, className = "" }: { icon: React.ReactNode; t: string; d: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 rounded-2xl bg-[#0c3238]/95 px-3 py-2.5 text-white shadow-[0_24px_50px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/15 ${className}`}>
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-bright/15 text-brand-bright">{icon}</span>
      <span>
        <span className="block text-[13px] font-semibold leading-tight">{t}</span>
        <span className="block text-[11px] leading-tight text-white/70">{d}</span>
      </span>
    </div>
  );
}

export const VanIcon = (
  <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{STEP_ICON[2]}</svg>
);

/** layers of the tilted console sit at different depths, so the pointer's tilt separates them */
export function Depth({ z, children, className = "", style }: { z: number; children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={className} style={{ transform: `translateZ(${z}px)`, transformStyle: "preserve-3d", ...style }}>{children}</div>;
}

export const fadeUp = { initial: { opacity: 0, y: 8, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 8, scale: 0.98 }, transition: { duration: 0.22, ease: EASE_OUT } };

export type Tilt = { rx: MotionValue<number>; ry: MotionValue<number> };
