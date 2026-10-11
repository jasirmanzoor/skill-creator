"use client";

import { SPRING_SMOOTH } from "@/lib/motion";
import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Dictionary, Locale } from "@/content/i18n";
import { pitchCopy, type PitchRow } from "@/content/pitch";
import { whatsappLink } from "@/content/facts";
import { track } from "@/lib/analytics";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import TrackedLink from "../ui/TrackedLink";
import { CheckIcon, WhatsAppIcon } from "../ui/icons";

/** how far each job sits out of line when nobody is holding the operation together: x px, y px, degrees */
const ADRIFT: [number, number, number][] = [[-7, 5, -1.8], [6, -6, 1.3], [-4, 8, 2.1], [7, 4, -1.5], [-6, -5, 1.9], [5, 7, -2.3]];

/**
 * The pitch, straight after the hero, as a before/after the visitor moves with their own hand. Two drawings of
 * the same operation lie one over the other: the six jobs adrift on your own, and the same six in line and
 * connected to one MSG team. A handle wipes between them. It sweeps across by itself once the section is in
 * view; the visitor can drag it back, use the arrow keys, or jump with the toggle. Behind it, MSG's own Sabya
 * hub turns from grey to colour as the handle crosses the middle.
 */
export default function Pitch({ t, lang }: { t: Dictionary; lang: Locale }) {
  const c = pitchCopy[lang];
  const rtl = lang === "ar";
  const reduce = useReducedMotion();
  /** how much of the picture shows the operation with MSG, 0 to 100 */
  const [pos, setPos] = useState(0);
  const [dragging, setDragging] = useState(false);
  const touched = useRef(false);
  const sec = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const msg = pos > 50;

  // sweep to the answer once the problem has been read
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearTimeout(timer);
      if (e.isIntersecting && !touched.current) timer = window.setTimeout(() => { if (!touched.current) setPos(100); }, reduce ? 0 : 1400);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { window.clearTimeout(timer); io.disconnect(); };
  }, [reduce]);

  const choose = (v: boolean) => {
    touched.current = true;
    setPos(v ? 100 : 0);
    track("cta_click", { cta: v ? "pitch_with_msg" : "pitch_on_own", location: "pitch" });
  };

  // the handle follows the pointer for as long as it is held
  const fromPointer = (e: React.PointerEvent) => {
    const r = stage.current?.getBoundingClientRect();
    if (!r) return;
    const k = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setPos(Math.round((rtl ? 1 - k : k) * 1000) / 10);
  };
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    touched.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    fromPointer(e);
  };
  const onMove = (e: React.PointerEvent) => { if (dragging) fromPointer(e); };
  const onUp = () => setDragging(false);
  const onKey = (e: React.KeyboardEvent) => {
    const step = e.key === "ArrowRight" ? (rtl ? -10 : 10) : e.key === "ArrowLeft" ? (rtl ? 10 : -10) : e.key === "Home" ? -100 : e.key === "End" ? 100 : 0;
    if (!step) return;
    e.preventDefault();
    touched.current = true;
    setPos((p) => Math.min(100, Math.max(0, p + step)));
  };

  // the hub photo drifts slowly behind the copy
  const { scrollYProgress } = useScroll({ target: sec, offset: ["start end", "end start"] });
  const sp = useSpring(scrollYProgress, { ...SPRING_SMOOTH });
  const photoScale = useTransform(sp, [0, 1], [1.18, 1.02]);
  const photoY = useTransform(sp, [0, 1], ["-4%", "4%"]);

  const dir = rtl ? -1 : 1;
  // held: follows the hand exactly. released, toggled or sweeping by itself: one unhurried move
  const glide = dragging || reduce ? "" : "transition-transform duration-[900ms] ease-in-out";

  return (
    <section
      id="why"
      ref={sec}
      data-theme="dark"
      aria-labelledby="why-title"
      className="on-dark relative isolate scroll-mt-16 overflow-hidden bg-pitch sec text-white"
    >
      {/* MSG's own hub, a layer behind the pitch */}
      <motion.div aria-hidden="true" className="absolute inset-0 -z-10" style={reduce ? undefined : { scale: photoScale, y: photoY }}>
        {/* the hub in colour, and a grey copy over it that fades away once MSG takes over */}
        <Image src="/media/msg/facade.jpg" alt="" fill sizes="100vw" className="object-cover opacity-45 [filter:saturate(1.1)_brightness(0.9)]" />
        <Image
          src="/media/msg/facade.jpg"
          alt=""
          fill
          sizes="100vw"
          className={`object-cover transition-opacity duration-[1200ms] ease-out [filter:grayscale(1)_brightness(0.4)] ${msg ? "opacity-0" : "opacity-100"}`}
        />
      </motion.div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#061c20_0%,rgba(6,28,32,0.82)_30%,rgba(6,28,32,0.9)_70%,#061c20_100%)]" />
      <div aria-hidden="true" className={`absolute inset-0 -z-10 transition-opacity duration-[1200ms] ease-out ${msg ? "opacity-100" : "opacity-0"} bg-[radial-gradient(60%_50%_at_75%_30%,rgba(76,201,122,0.18),transparent_70%)]`} />

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div>
            <h2 id="why-title" className="h-scene">
              {c.title}
            </h2>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-white/80 text-pretty lg:justify-self-end">{c.lead}</p>
        </div>

        {/* on your own / with MSG */}
        <div role="radiogroup" aria-label={c.toggleLabel} className="relative mt-10 inline-grid grid-cols-2 rounded-full bg-white/10 p-1.5 ring-1 ring-white/15 backdrop-blur">
          <span
            aria-hidden="true"
            className={`absolute inset-y-1.5 start-1.5 w-[calc(50%-0.375rem)] rounded-full transition-ui duration-[240ms] ease-in-out ${msg ? "translate-x-full bg-brand-bright rtl:-translate-x-full" : "bg-white/85"}`}
          />
          {c.toggle.map((label, i) => {
            const on = (i === 1) === msg;
            return (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => choose(i === 1)}
                className={`relative min-h-11 rounded-full px-5 py-2.5 text-sm font-bold transition-colors sm:px-7 sm:text-base ${on ? "text-pitch" : "text-white/75 hover:text-white"}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* the same operation, drawn twice; the handle wipes from one to the other */}
        <div
          ref={stage}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="relative mt-8 cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-3xl bg-[#0c1b1f] py-6 ring-1 ring-white/10"
        >
          <Operation rows={c.rows} label={c.toggle[0]} hidden={msg} />
          {/* with MSG, uncovered from the start side: the window slides one way and its contents the other, so the drawing stays put */}
          <div className={`pointer-events-none absolute inset-0 overflow-hidden ${glide}`} style={{ transform: `translateX(${dir * (pos - 100)}%)` }}>
            <div className={`h-full bg-[#0a2c22] py-6 ${glide}`} style={{ transform: `translateX(${dir * (100 - pos)}%)` }}>
              <Operation rows={c.rows} label={c.toggle[1]} withMsg hidden={!msg} />
            </div>
          </div>
          {/* the handle */}
          <div className={`pointer-events-none absolute inset-0 ${glide}`} style={{ transform: `translateX(${dir * pos}%)` }}>
            <div className="absolute inset-y-0 start-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_24px_rgba(255,255,255,0.7)] rtl:translate-x-1/2" />
            <div
              role="slider"
              tabIndex={0}
              aria-label={c.toggleLabel}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pos)}
              aria-valuetext={msg ? c.toggle[1] : c.toggle[0]}
              onKeyDown={onKey}
              className="pointer-events-auto absolute start-0 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-pitch shadow-[0_10px_30px_-6px_rgba(0,0,0,0.7)] ring-4 ring-white/25 rtl:translate-x-1/2"
            >
              <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6 3 12l6 6M15 6l6 6-6 6" /></svg>
            </div>
          </div>
        </div>

        <div className={`mt-6 flex flex-col gap-6 rounded-3xl p-6 ring-1 transition-colors duration-500 sm:p-8 lg:flex-row lg:items-center lg:justify-between ${msg ? "bg-white text-teal-deep ring-white" : "bg-white/[0.06] text-white ring-white/10"}`}>
          <div>
            <p className="font-display text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-3xl rtl:tracking-normal">{c.close}</p>
            <p className={`mt-2 ${msg ? "text-teal-deep/75" : "text-white/70"}`}>{c.closeLead}</p>
          </div>
          <TrackedLink href={whatsappLink(t.wa.general)} target="_blank" rel="noopener noreferrer" event="whatsapp_click" props={{ location: "pitch" }}
            className={`inline-flex min-h-12 shrink-0 items-center gap-2 self-start rounded-full px-5 py-3.5 font-semibold ring-1 transition-colors lg:self-auto ${msg ? "text-teal-deep ring-teal/25 hover:bg-sea-50" : "text-white ring-white/30 hover:bg-white/10"}`}>
            <WhatsAppIcon className="size-5 text-whatsapp" /> {c.talk}
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}

/**
 * One drawing of the operation: six jobs around the place where a team should be. Both drawings share exactly the
 * same grid and box sizes, so one can be wiped over the other without anything shifting.
 */
function Operation({ rows, label, withMsg = false, hidden }: { rows: PitchRow[]; label: string; withMsg?: boolean; hidden: boolean }) {
  const job = (i: number) => {
    const r = rows[i];
    const top = i < 3; // on wide screens the first three sit above the team, the rest below it
    const [x, y, deg] = ADRIFT[i];
    return (
      <li key={r.pain} className={`flex ${top ? "flex-col-reverse lg:flex-col" : "flex-col-reverse justify-end"}`}>
        <div
          className={`flex h-32 items-center gap-3.5 overflow-hidden rounded-2xl border px-4 lg:h-[7.5rem] lg:px-5 ${
            withMsg ? "border-brand-bright/50 bg-[#0d3f2a]" : "border-dashed border-[#e5735c]/55 bg-[#14262b]"
          }`}
          style={withMsg ? undefined : { transform: `translate(${x}px, ${y}px) rotate(${deg}deg)` }}
        >
          {withMsg ? (
            <>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-bright text-pitch"><CheckIcon className="size-5" /></span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white/60 line-through decoration-brand-bright decoration-2">{r.pain}</p>
                <p className="mt-1 font-display text-base font-semibold leading-snug text-white sm:text-[1.0625rem]">{r.fix}</p>
              </div>
            </>
          ) : (
            <>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e5735c]/20 text-[#ffb3a3] ring-1 ring-[#e5735c]/40">
                <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M7 7l10 10M17 7 7 17" /></svg>
              </span>
              <p className="font-display text-lg font-semibold leading-snug text-white">{r.pain}</p>
            </>
          )}
        </div>
        {/* the link to the team: broken on your own, solid with MSG */}
        <span aria-hidden="true" className={`mx-auto block h-5 w-0.5 lg:h-8 ${withMsg ? "bg-brand-bright" : "bg-[repeating-linear-gradient(180deg,rgba(229,115,92,0.6)_0_3px,transparent_3px_8px)]"}`} />
      </li>
    );
  };
  return (
    <ul aria-hidden={hidden || undefined} className="grid px-3 lg:grid-cols-3 lg:gap-x-5 lg:px-4">
      {[0, 1, 2].map(job)}
      <li aria-hidden="true" className={`order-first grid h-14 place-items-center rounded-2xl lg:order-none lg:col-span-3 lg:h-16 ${
        withMsg ? "bg-brand-bright font-display text-lg font-semibold text-pitch" : "border border-dashed border-white/25 bg-[#101f23] text-sm font-semibold uppercase tracking-[0.14em] text-white/55 rtl:tracking-normal"
      }`}>
        {label}
      </li>
      {[3, 4, 5].map(job)}
    </ul>
  );
}
