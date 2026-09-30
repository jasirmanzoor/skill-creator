"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { guideCopy, roadmapCopy, SEGMENT_PERSONA, type Segment } from "@/content/roadmap";
import type { Locale } from "@/content/i18n";
import type { SizerInput } from "@/lib/sizer";
import { size } from "@/lib/sizer";
import { approxCost } from "@/lib/estimate";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/* eslint-disable @next/next/no-img-element -- MSG's logo, local PNG */
const Mark = ({ className = "", inverted = false }: { className?: string; inverted?: boolean }) => (
  <img src="/brand/msg-logo.png" alt="" className={className} style={{ filter: inverted ? "brightness(0) invert(1)" : "none" }} />
);

/**
 * A phone that performs the active roadmap step for this visitor: their segment, their orders a
 * day and their areas flow into the chat, the profile, the plan (real sizing and an approximate
 * cost per order from MSG's rate card), the agreement and the pilot. Every scene plays once when
 * its step opens; under reduced motion it shows the finished state.
 */
export default function GuideDevice({ lang, step, segment, net }: { lang: Locale; step: number; segment: Segment | null; net: SizerInput }) {
  const g = guideCopy[lang].demo;
  const rc = roadmapCopy[lang];
  const seg = rc.gate.segments[segment ?? "social"].t;
  const area = rc.est.areas[net.area];
  return (
    <div className="relative flex h-full min-h-[440px] items-center justify-center overflow-hidden bg-[radial-gradient(80%_70%_at_50%_40%,rgba(15,150,65,0.35),transparent_70%),linear-gradient(160deg,#0a1f14,#050b08)] px-6 py-8">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(70%_60%_at_50%_50%,#000,transparent)]" />
      {/* the phone */}
      <div className="relative w-full max-w-[290px] rounded-[34px] bg-[#0f1411] p-2.5 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08),0_0_60px_-10px_rgba(76,201,122,0.35)]">
        <div className="relative h-[400px] overflow-hidden rounded-[26px] bg-[#f6f7f5] text-ink">
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#0f1411]" />
          <Scene key={`${step}-${segment}-${net.orders}-${net.area}-${lang}`} step={step} g={g} seg={seg} area={area} net={net} segment={segment} lang={lang} />
        </div>
      </div>
    </div>
  );
}

type SceneProps = { step: number; g: (typeof guideCopy)["en"]["demo"]; seg: string; area: string; net: SizerInput; segment: Segment | null; lang: Locale };

function useReveal() {
  const reduce = useReducedMotion();
  return (i: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.25 + i * 0.45, duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } };
}

function Scene(p: SceneProps) {
  switch (p.step) {
    case 0: return <Chat {...p} />;
    case 1: return <Profile {...p} />;
    case 2: return <Guide {...p} />;
    case 3: return <Plan {...p} />;
    case 4: return <Agreement {...p} />;
    default: return <Pilot {...p} />;
  }
}

const Check = ({ className = "" }: { className?: string }) => (
  <span className={`inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-[#0b7d36] text-white ${className}`}>
    <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden="true"><path d="M2.5 6.2l2.2 2.2 4.8-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
);

function AppBar({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-line bg-white px-4 pb-3 pt-9">
      <span className="flex size-8 items-center justify-center rounded-full bg-[#0b3a26]"><Mark inverted className="h-3.5 w-auto" /></span>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold">{title}</p>
        {sub ? <p className="text-[10px] text-[#0b7d36]">{sub}</p> : null}
      </div>
    </div>
  );
}

function Chat({ g, net, segment }: SceneProps) {
  const reduce = useReducedMotion();
  const text = g.hello(g.who[segment ?? "social"], net.orders, g.where[net.area]);
  const [n, setN] = useState(reduce ? text.length : 0);
  const [replied, setReplied] = useState(reduce);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setN((k) => (k >= text.length ? k : k + 2)), 28);
    const done = window.setTimeout(() => setReplied(true), 28 * (text.length / 2) + 1400);
    return () => { window.clearInterval(id); window.clearTimeout(done); };
  }, [text, reduce]);
  const typed = n >= text.length;
  return (
    <div className="flex h-full flex-col bg-[#ece5dd]">
      <AppBar title={g.chatHead} sub={typed && !replied ? g.typing : "WhatsApp"} />
      <div className="flex flex-1 flex-col justify-end gap-2 p-3 text-[12.5px] leading-snug">
        <p className="ms-auto max-w-[85%] rounded-xl rounded-se-sm bg-[#dcf8c6] px-3 py-2 shadow-sm">{text.slice(0, n)}{!typed ? <span className="ms-0.5 inline-block h-3 w-px animate-pulse bg-ink align-middle" /> : null}</p>
        {typed && !replied ? (
          <span className="flex w-fit gap-1 rounded-xl bg-white px-3 py-2.5 shadow-sm">
            {[0, 1, 2].map((i) => <span key={i} className="size-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${i * 0.15}s` }} />)}
          </span>
        ) : null}
        {replied ? (
          <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <p className="max-w-[85%] rounded-xl rounded-ss-sm bg-white px-3 py-2 shadow-sm">{g.reply}</p>
            <span className="inline-block rounded-full border border-[#0f9641] bg-white px-3 py-1 text-[11px] font-semibold text-[#0b7d36]">{g.quick}</span>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

function Profile({ g, seg, area, net }: SceneProps) {
  const r = useReveal();
  const rows: [string, string][] = [
    [g.fields.profile, seg],
    [g.fields.orders, `${net.orders.toLocaleString("en-US")} ${g.perDay}`],
    [g.fields.cod, `${net.cod}%`],
    [g.fields.area, area],
    [g.fields.stock, net.stock ? g.yes : g.no],
  ];
  return (
    <div className="flex h-full flex-col">
      <AppBar title={g.formTitle} />
      <div className="flex-1 space-y-1.5 p-3">
        {rows.map(([k, v], i) => (
          <motion.div key={k} {...r(i)} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-white px-3 py-2">
            <div className="min-w-0">
              <p className="text-[10px] text-muted">{k}</p>
              <p className="truncate text-[13px] font-semibold">{v}</p>
            </div>
            <Check />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Guide({ g, area }: SceneProps) {
  const r = useReveal();
  return (
    <div className="flex h-full flex-col">
      <AppBar title={g.guideTitle} />
      <div className="flex-1 p-3">
        {/* a real-looking MSG shipping label */}
        <motion.div {...r(0)} className="rounded-xl border-2 border-dashed border-line bg-white p-3">
          <div className="flex items-center justify-between">
            <Mark className="h-4 w-auto" />
            <span className="rounded bg-ink px-1.5 py-0.5 text-[9px] font-bold text-white">1 KG</span>
          </div>
          <p className="mt-2 text-[9px] uppercase tracking-wide text-muted">{g.label.to}</p>
          <p className="text-[12px] font-semibold">{area}</p>
          <div className="mt-2 flex h-8 items-end gap-[2px]" aria-hidden="true">
            {Array.from({ length: 38 }, (_, i) => <span key={i} className="bg-ink" style={{ width: i % 3 ? 1.5 : 3, height: `${60 + ((i * 37) % 40)}%` }} />)}
          </div>
          <div className="mt-2 flex justify-between text-[9px] font-semibold">
            <span className="text-[#0b7d36]">{g.label.cod}</span>
            <span className="text-muted">{g.label.handle}</span>
          </div>
        </motion.div>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {g.guideItems.map((it, i) => (
            <motion.li key={it} {...r(i + 1)} className="flex items-center gap-1.5 rounded-lg bg-white px-2 py-2 text-[11.5px] font-medium shadow-sm">
              <Check />{it}
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Plan({ g, net, segment, lang }: SceneProps) {
  const r = useReveal();
  const s = size(net, SEGMENT_PERSONA[segment ?? "social"]);
  const cost = approxCost(net);
  const chips = [g.services.lastMile, ...(net.cod > 0 ? [g.services.cod] : []), ...(net.stock ? [g.services.storage] : []), g.services.tracking];
  return (
    <div className="flex h-full flex-col">
      <AppBar title={g.planTitle} />
      <div className="flex-1 space-y-2.5 p-3">
        <motion.div {...r(0)} className="grid grid-cols-2 gap-2">
          {([[g.routes, s.baseRoutes], [g.couriers, s.baseCouriers]] as const).map(([k, v]) => (
            <div key={k} className="rounded-xl bg-white p-3 shadow-sm">
              <p className="text-[10px] text-muted">{k}</p>
              <p className="num font-display text-2xl font-semibold">{v}</p>
            </div>
          ))}
        </motion.div>
        <motion.div {...r(1)} className="rounded-xl bg-[#0b3a26] p-3 text-white">
          <p className="text-[10px] text-white/70">{g.perOrder}</p>
          <p className="num font-display text-3xl font-semibold" dir={lang === "ar" ? "rtl" : "ltr"}>
            ≈ {lang === "ar" ? <>{cost.perOrder} <span className="text-base">ريال</span></> : <><span className="text-base">SAR</span> {cost.perOrder}</>}
          </p>
        </motion.div>
        <motion.dl {...r(2)} className="divide-y divide-line rounded-xl bg-white px-3 shadow-sm">
          {([[g.peak, s.peakCouriers], [g.flex, `+${s.flex}`]] as const).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-2 py-2">
              <dt className="text-[11px] text-muted">{k}</dt>
              <dd className="num text-[13px] font-semibold">{v}</dd>
            </div>
          ))}
        </motion.dl>
        <motion.div {...r(3)} className="flex flex-wrap gap-1.5">
          {chips.map((c) => <span key={c} className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand-strong">{c}</span>)}
        </motion.div>
      </div>
    </div>
  );
}

function Agreement({ g }: SceneProps) {
  const r = useReveal();
  const reduce = useReducedMotion();
  return (
    <div className="flex h-full flex-col">
      <AppBar title={g.docTitle} />
      <div className="flex-1 p-3">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          {g.docItems.map((d, i) => (
            <motion.div key={d} {...r(i)} className="flex items-center gap-2 border-b border-line py-2 last:border-0">
              <Check />
              <span className="text-[12px] font-semibold">{d}</span>
              <span className="ms-auto h-1.5 w-16 rounded-full bg-subtle" />
            </motion.div>
          ))}
        </div>
        <div className="mt-3 flex items-end justify-between rounded-xl bg-white p-3 shadow-sm">
          <svg viewBox="0 0 120 34" className="h-9 w-32" aria-hidden="true">
            <motion.path
              d="M4 24c8-14 14 8 22-4s10 10 18 0 9-8 16 2 12-12 20-4 10 6 18-2"
              fill="none" stroke="#0c2a8a" strokeWidth="2.2" strokeLinecap="round"
              initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.1, duration: 1.2 }}
            />
          </svg>
          <motion.span {...r(5)} className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-bold text-brand-strong"><Check />{g.signed}</motion.span>
        </div>
      </div>
    </div>
  );
}

function Pilot({ g }: SceneProps) {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(reduce ? 3 : 0);
  useEffect(() => {
    if (reduce) return;
    const ids = [1, 2, 3].map((k) => window.setTimeout(() => setDone(k), 700 + k * 900));
    return () => ids.forEach(window.clearTimeout);
  }, [reduce]);
  const live = done >= 3;
  return (
    <div className="flex h-full flex-col">
      <AppBar title={g.pilotTitle} sub={`${done}/3 · ${g.pod}`} />
      <div className="flex-1 space-y-2 p-3">
        {[0, 1, 2].map((k) => (
          <div key={k} className="rounded-xl bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between text-[11px]">
              <span className="num font-semibold">MSG-P{k + 1}</span>
              {done > k ? <span className="inline-flex items-center gap-1 font-semibold text-[#0b7d36]"><Check />{g.pod}</span> : <span className="text-muted">…</span>}
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-subtle">
              <motion.div className="h-full rounded-full bg-[#0b7d36]" initial={reduce ? false : { width: "0%" }} animate={{ width: done > k ? "100%" : "35%" }} transition={{ duration: 0.8 }} />
            </div>
          </div>
        ))}
        {live ? (
          <motion.div initial={reduce ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 rounded-xl bg-[#0b3a26] p-3 text-white">
            <span className="relative flex size-3"><span className="absolute inset-0 animate-ping rounded-full bg-[#4cc97a] motion-reduce:hidden" /><span className="relative size-3 rounded-full bg-[#4cc97a]" /></span>
            <div>
              <p className="text-[13px] font-semibold">{g.live}</p>
              <p className="text-[10.5px] text-white/70">{g.liveBody}</p>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
