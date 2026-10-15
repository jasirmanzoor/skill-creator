"use client";

import { SPRING_SMOOTH } from "@/lib/motion";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { heroCopy, type HeroLane } from "@/content/hero";
import { experience, NEED_STAGES, NEEDS_BY_STAGE } from "@/content/experience";
import { scrollToY } from "@/lib/scroller";
import { whatsappLink } from "@/content/facts";
import { rateFor, type Lane } from "@/content/redsea";
import type { Dictionary, Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { usePlan } from "../PlanContext";
import TrackedLink from "../ui/TrackedLink";
import { WhatsAppIcon } from "../ui/icons";
import HeroMap, { STAGE_COUNT } from "./HeroMap";
import { NeedIcon, StageCard } from "../operation/StageParts";
import QuoteCard from "./QuoteCard";
import { Chip, CommandBackdrop, ConsoleWindow, Depth, fadeUp, OrderTicker, PartnerLine, Strengths, VanIcon } from "./Command";

/*
 * The scroll through the hero: the dive from the console into the network takes the first INTRO of it, the
 * network holds for HOLD, then one order's four stages (set up, store, deliver, settle) share the rest.
 */
const INTRO = 0.14, HOLD = 0.06, STEP = (1 - INTRO - HOLD) / STAGE_COUNT;
const stageAt = (v: number) => (v < INTRO + HOLD ? -1 : Math.min(STAGE_COUNT - 1, Math.floor((v - INTRO - HOLD) / STEP)));
const RATE_LANE: Record<HeroLane, Lane> = { intra: "intra", inter: "inter", sabya: "sabyaMajor" };
/** the console's resting tilt toward the visitor (degrees) */
const TILT = { x: 9, y: 13 };

/**
 * First screen: MSG's network as the console a seller runs it from. The headline states the position (the
 * Kingdom's delivery network, already running); the console proves it: the network live on the map, one order
 * walking through every step MSG owns, the price from MSG's own rate card, and the verified figures under it.
 * Scrolling dives into the console: it turns flat, the night lifts, and the same map carries one order through
 * set up, store, deliver and settle. Under reduced motion the scenes simply stack.
 */
export default function Hero({ t, lang }: { t: Dictionary; lang?: Locale }) {
  const L: Locale = lang ?? "en";
  const c = heroCopy[L];
  const rtl = L === "ar";
  const reduce = useReducedMotion();
  const staged = !reduce;
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  // the price being built is shared with the rest of the page (PlanContext)
  const { quote, setQuote } = usePlan();
  const lane: HeroLane = quote.lane === "intra" || quote.lane === "inter" ? quote.lane : "sabya";
  const orders = quote.orders;
  const rate = rateFor(RATE_LANE[lane], orders);
  const setLane = (l: HeroLane) => setQuote({ lane: RATE_LANE[l] });
  const setOrders = (n: number) => setQuote({ orders: n });
  const [beat, setBeat] = useState(1);
  const [stage, setStage] = useState(-1);
  const [priceOpen, setPriceOpen] = useState(false);
  const [counted, setCounted] = useState(false);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  // copied into plain motion values so every layer reads the same progress
  const p = useMotionValue(0);
  // how far through the four stages the scroll is (0 → 1), for the stage rail's fill
  const sp = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const w = Math.min(1, v / INTRO);
    p.set(w);
    const b = w < 0.4 ? 1 : w < 0.75 ? 2 : 3;
    setBeat((x) => (x === b ? x : b));
    if (b !== 1) setPriceOpen(false); // the quote belongs to the console; it closes when the dive begins
    const s = stageAt(v);
    setStage((x) => (x === s ? x : s));
    sp.set(Math.max(0, (v - INTRO - HOLD) / (1 - INTRO - HOLD)));
  });
  // the stage rail jumps to the middle of a stage's stretch of scroll
  const goStage = (i: number) => {
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + (el.offsetHeight - window.innerHeight) * (INTRO + HOLD + (i + 0.5) * STEP));
  };

  // the opening (see "Hero opening" in globals.css) yields to the first scroll, touch or key press
  useEffect(() => {
    const el = section.current;
    if (!el || !staged) return;
    const skipped = el.dataset.intro === "skip";
    const count = window.setTimeout(() => setCounted(true), skipped ? 0 : 1300);
    if (skipped) return () => window.clearTimeout(count);
    const skip = () => { el.dataset.intro = "skip"; off(); };
    const onScroll = () => { if (window.scrollY > 24) skip(); };
    const off = () => {
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(done);
    };
    const done = window.setTimeout(skip, 3600); // it has finished: later re-renders must never replay it
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    window.addEventListener("keydown", skip);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { off(); window.clearTimeout(count); };
  }, [staged]);

  // the header picks its colours from the section under it; tell it when the scene changes
  useEffect(() => { window.dispatchEvent(new Event("scroll")); }, [beat]);

  // the console leans toward the pointer
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { ...SPRING_SMOOTH }), sy = useSpring(my, { ...SPRING_SMOOTH });
  const onMove = (e: React.PointerEvent) => {
    if (!staged || e.pointerType !== "mouse" || !frame.current) return;
    const r = frame.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  // the dive: the copy steps aside, the console turns flat and comes forward, the night lifts
  const flat = useTransform(p, [0.05, 0.6], [1, 0], { clamp: true });
  const dir = rtl ? -1 : 1;
  const ry = useTransform(() => (-TILT.y * dir + sx.get() * 7) * flat.get());
  const rx = useTransform(() => (TILT.x - sy.get() * 6) * flat.get());
  const copyO = useTransform(p, [0.04, 0.36], [1, 0]);
  const copyY = useTransform(p, [0, 0.4], [0, -50]);
  const conScale = useTransform(p, [0.05, 0.85], [1, 1.08]);
  const chipsO = useTransform(p, [0.04, 0.3], [1, 0]);
  const conO = useTransform(p, [0.6, 0.9], [1, 0]);
  const night = useTransform(p, [0.4, 0.85], [1, 0]);
  const kO = useTransform(p, [0.68, 1], [0, 1]);
  const kScale = useTransform(p, [0.6, 1], [1.1, 1]);

  // "Price a delivery": the quote opens over the console on wide screens; phones go to the card below the hero
  const openPrice = (e: React.MouseEvent) => {
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    e.preventDefault();
    setPriceOpen(true);
  };
  useEffect(() => {
    if (!priceOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPriceOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [priceOpen]);

  const copy = (
    <div className="text-white">
      <p className="hi hi-fade inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold text-white/85 ring-1 ring-white/15 sm:text-xs" style={{ ["--hi" as string]: "0.2s" }}>
        <span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-brand-bright/70 motion-reduce:hidden" /><span className="relative size-2 rounded-full bg-brand-bright" /></span>
        {c.command.eyebrow}
      </p>
      <h1 id="hero-title" className="mt-3 font-display text-[clamp(2rem,min(4.4vw,7.6svh),4.1rem)] sm:mt-4 font-semibold leading-[1.02] tracking-[-0.035em] text-balance rtl:leading-[1.25] rtl:tracking-normal">
        <span className="-mb-[0.16em] block overflow-hidden pb-[0.16em]"><span className="hi hi-line block" style={{ ["--hi" as string]: "0.35s" }}>{c.title[0]}</span></span>
        <span className="-mb-[0.16em] block overflow-hidden pb-[0.16em]">
          <span className="hi hi-line block bg-[linear-gradient(90deg,#b8f5cf,#6cc3c3)] bg-clip-text text-transparent rtl:bg-[linear-gradient(270deg,#b8f5cf,#6cc3c3)]" style={{ ["--hi" as string]: "0.5s" }}>{c.title[1]}</span>
        </span>
      </h1>
      <p className="hi hi-rise mt-3 max-w-xl text-[15px] leading-relaxed text-white/80 text-pretty sm:mt-4 sm:text-lg" style={{ ["--hi" as string]: "0.8s" }}>
        <span className="sm:hidden">{c.command.leadShort}</span><span className="max-sm:hidden">{c.lead}</span>
      </p>
      <div className="hi hi-rise mt-4 flex flex-wrap items-center gap-2.5 sm:mt-6 sm:gap-3" style={{ ["--hi" as string]: "0.95s" }}>
        <a href="#hero-quote" onClick={openPrice} aria-haspopup="dialog" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 sm:py-3.5 font-semibold text-teal-deep shadow-[0_10px_40px_-10px_rgba(184,245,207,0.6)] transition-transform hover:-translate-y-0.5">
          {c.command.ctaPrice}
          <svg viewBox="0 0 24 24" className="size-4 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </a>
        <TrackedLink href={whatsappLink(t.wa.general)} target="_blank" rel="noopener noreferrer" event="whatsapp_click" props={{ location: "hero" }}
          aria-label={c.ctaTalk}
          className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-5 py-3 font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/15 sm:py-3.5">
          <WhatsAppIcon className="size-5 text-brand-bright" /> <span className="max-sm:hidden">{c.ctaTalk}</span><span className="sm:hidden">{c.command.waShort}</span>
        </TrackedLink>
      </div>
      <div className="hi hi-fade mt-7 max-lg:hidden" style={{ ["--hi" as string]: "1.3s" }}><PartnerLine c={c} /></div>
    </div>
  );

  const priceChip = (
    <aside data-rate-card aria-label={c.command.price.t}>
      <button type="button" onClick={() => setPriceOpen(true)} aria-haspopup="dialog" aria-expanded={priceOpen}
        className="group block w-[15.5rem] rounded-2xl bg-white p-3.5 text-start text-teal-deep shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] ring-1 ring-black/5 transition-transform hover:-translate-y-0.5">
        <span className="block text-[11px] font-semibold text-teal">{c.command.price.t}</span>
        <span className="mt-1 flex items-baseline gap-1.5 font-display font-semibold">
          <span className="text-base opacity-80">≈</span>
          {rtl ? null : <span className="text-sm opacity-80">{c.quote.cur}</span>}
          <span className="num text-3xl" dir="ltr">{reduce ? rate : <NumberFlow value={rate} locales="en-US" />}</span>
          {rtl ? <span className="text-sm opacity-80">{c.quote.cur}</span> : null}
          <span className="font-sans text-xs font-normal text-teal-deep/70">{c.command.price.per}</span>
        </span>
        <span className="mt-0.5 block text-[11px] text-teal-deep/70">{c.quote.lanes[lane]} · <span className="num" dir="ltr">{orders.toLocaleString("en-US")}</span> {c.quote.perMonth}</span>
        <span className="mt-2.5 flex items-center justify-between border-t border-teal/10 pt-2 text-[12px] font-semibold text-teal">
          {c.command.price.open}
          <svg viewBox="0 0 24 24" className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </span>
      </button>
    </aside>
  );

  const console3d = (
    <div className="relative mx-auto w-full max-w-[640px] max-lg:w-[min(100%,calc(29svh*1100/850+1rem))] lg:my-12 lg:w-[min(100%,calc((100svh-25rem)*1100/850))] [perspective:1700px]">
      <div className={`${staged ? "hi hi-console" : ""} [transform-style:preserve-3d]`} style={{ ["--hi" as string]: "0.45s" }}>
        <motion.div style={staged ? { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" } : undefined} className="relative">
          <ConsoleWindow c={c} lang={L} lane={lane} onLane={setLane} map={!staged || beat < 3} title={c.command.console} />
          <Depth z={90} className="absolute -bottom-12 -start-10 hidden lg:block xl:-start-14">
            <motion.div style={staged ? { opacity: chipsO } : undefined}><div className={staged ? "hi hi-rise" : ""} style={{ ["--hi" as string]: "1.25s" }}>
              <OrderTicker c={c} run={staged && beat === 1} reduce={reduce} />
            </div></motion.div>
          </Depth>
          <Depth z={120} className={`absolute -top-10 end-3 hidden transition-opacity duration-200 lg:block ${priceOpen ? "opacity-0" : ""}`}>
            <motion.div style={staged ? { opacity: chipsO } : undefined}><div className={staged ? "hi hi-rise" : ""} style={{ ["--hi" as string]: "1.45s" }}>{priceChip}</div></motion.div>
          </Depth>
          <Depth z={60} className="absolute -bottom-14 end-2 hidden lg:block">
            <motion.div style={staged ? { opacity: chipsO } : undefined}><div className={staged ? "hi hi-rise" : ""} style={{ ["--hi" as string]: "1.6s" }}>
              <Chip icon={VanIcon} t={c.command.fleet.t} d={c.command.fleet.d} />
            </div></motion.div>
          </Depth>
        </motion.div>
      </div>
      {/* the ten-second price, opened over the console */}
      <AnimatePresence>
        {priceOpen ? (
          <motion.div {...fadeUp} role="dialog" aria-modal="false" aria-label={c.quote.title} className="absolute inset-x-0 top-4 z-20 hidden lg:block">
            <div className="relative">
              <QuoteCard lang={L} reduce={reduce} lane={lane} onLane={setLane} orders={orders} onOrders={setOrders} />
              <button type="button" onClick={() => setPriceOpen(false)} aria-label={c.command.price.close} autoFocus
                className="absolute -end-3 -top-3 grid size-9 place-items-center rounded-full bg-white text-teal-deep shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)] ring-1 ring-black/5 transition-colors hover:bg-sea-100">
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );

  const command = (
    <div className="relative mx-auto grid h-full max-w-7xl grid-rows-[1fr_auto] px-4 pb-4 pt-[4.5rem] sm:px-5 lg:px-8 lg:pb-6 lg:pt-20">
      <div className="grid content-center items-center gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:gap-6 xl:gap-10">
        <motion.div style={staged ? { opacity: copyO, y: copyY } : undefined}>{copy}</motion.div>
        <motion.div style={staged ? { scale: conScale, opacity: conO } : undefined} className="lg:ps-6 xl:ps-10">{console3d}</motion.div>
      </div>
      <motion.div style={staged ? { opacity: copyO } : undefined} className="hi hi-fade mt-4 border-t border-white/12 pt-3.5 lg:mt-6 lg:pt-5" >
        <Strengths c={c} go={!staged || counted} reduce={reduce} ar={rtl} />
      </motion.div>
    </div>
  );

  const kingdom = (
    <Kingdom c={c} lang={L} lane={lane} go={!staged || beat === 3} map={!staged || beat >= 2} reduce={reduce} stage={staged && beat === 3 ? stage : -1} onStage={staged ? goStage : undefined} progress={sp} />
  );

  if (!staged) {
    return (
      <section id="hero" ref={section} aria-labelledby="hero-title" className="relative bg-white">
        <div data-theme="dark" className="relative min-h-[100svh] overflow-hidden">
          <CommandBackdrop />
          <div className="relative">{command}</div>
        </div>
        <div className="relative bg-[linear-gradient(180deg,#f3fbfb,#ffffff)] py-16">{kingdom}</div>
        <div id="sellers" className="relative scroll-mt-16 bg-white pb-16"><StagesStacked lang={L} /></div>
        <div id="hero-quote" className="scroll-mt-20 px-4 pb-12 pt-2 lg:hidden"><QuoteCard lang={L} reduce={reduce} lane={lane} onLane={setLane} orders={orders} onOrders={setOrders} /></div>
      </section>
    );
  }

  return (
    <>
    <section id="hero" ref={section} suppressHydrationWarning aria-labelledby="hero-title" className="relative h-[400svh] bg-white lg:h-[480svh]">
      {/* runs before first paint: a returning visitor, or a page restored part-way down, skips the opening */}
      <script dangerouslySetInnerHTML={{ __html: INTRO_GATE }} />
      {/* where "one order through MSG" begins: the first of the four stages, to the end of the hero */}
      <div id="sellers" aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 top-[72svh] lg:top-[92svh]" />
      <div
        ref={frame}
        data-theme={beat < 3 ? "dark" : undefined}
        onPointerMove={onMove}
        onPointerLeave={() => { mx.set(0); my.set(0); }}
        className="sticky top-0 h-[100svh] overflow-hidden"
      >
        {/* the day the network opens onto */}
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(90%_70%_at_80%_10%,#c4e9e7_0%,rgba(196,233,231,0)_60%),radial-gradient(70%_60%_at_0%_100%,#e2f4f3_0%,rgba(226,244,243,0)_60%),linear-gradient(180deg,#f3fbfb,#ffffff)]" />
        <motion.div style={{ opacity: night }} className="absolute inset-0"><CommandBackdrop /></motion.div>

        <div inert={beat !== 1} className="absolute inset-0 z-[5]">{command}</div>
        <motion.div style={{ opacity: kO }} inert={beat !== 3} className="absolute inset-0 z-[6] flex items-center pt-14 lg:pt-16">
          <motion.div style={{ scale: kScale }} className="w-full">{kingdom}</motion.div>
        </motion.div>

      </div>
    </section>
    {/* on phones the ten-second price follows the hero */}
    <div id="hero-quote" className="relative scroll-mt-20 bg-white px-4 pb-12 pt-8 lg:hidden">
      <QuoteCard lang={L} reduce={reduce} lane={lane} onLane={setLane} orders={orders} onOrders={setOrders} />
    </div>
    </>
  );
}

const INTRO_GATE = `try{var s=document.currentScript.parentElement;if(sessionStorage.getItem("msg-intro")||window.scrollY>40)s.dataset.intro="skip";else sessionStorage.setItem("msg-intro","1")}catch(e){}`;

type C = (typeof heroCopy)["en"];

/**
 * Out across the Kingdom, then one order through MSG. The network map carries the four stages of the operation
 * (set up, store, deliver, settle): the camera moves to where each one happens and draws it there, the stage's
 * answers take over the copy column, and the stage's card floats over the map. A rail under the map jumps
 * between stages. Without `onStage` (reduced motion) the map shows the network and the stages stack below.
 */
function Kingdom({
  c, lang, lane, go, map, reduce, stage = -1, onStage, progress,
}: { c: C; lang: Locale; lane: HeroLane; go: boolean; map: boolean; reduce: boolean; stage?: number; onStage?: (i: number) => void; progress?: MotionValue<number> }) {
  const n = experience[lang].needs;
  const guide = experience[lang].journey.ui.guideItems;
  const inStage = stage >= 0;
  return (
    <div className="mx-auto grid max-w-7xl items-center gap-4 px-4 text-teal-deep sm:px-5 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10 lg:px-8">
      <div className="order-2 lg:order-1">
        <div className={inStage ? "max-lg:hidden" : undefined}>
          <p className="text-sm font-semibold text-teal">{c.kingdom.eyebrow}</p>
          <h2 className="h-scene mt-2">{c.kingdom.title}</h2>
          <p className={`mt-3 max-w-lg text-teal-deep/80 text-pretty sm:text-lg ${inStage ? "hidden" : onStage ? "max-lg:hidden" : ""}`}>{c.kingdom.lead}</p>
        </div>
        <div className="relative mt-4 grid [grid-template-areas:'s'] lg:mt-7">
          {/* the network in numbers */}
          <Panel on={!inStage}>
            <dl className="grid max-w-md grid-cols-3 divide-x divide-teal/15 rtl:divide-x-reverse">
              {c.stats.map((s, i) => (
                <div key={s.l} className={i ? "ps-5" : "pe-5"}>
                  <dd className="num font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                    {reduce ? `${s.v.toLocaleString("en-US")}${s.suffix}` : <Counter v={s.v} suffix={s.suffix} go={go} delay={i * 0.15} />}
                  </dd>
                  <dt className="mt-1 text-sm text-teal-deep/70">{s.l}</dt>
                </div>
              ))}
            </dl>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              {onStage ? (
                <span className="hidden items-center gap-2 text-sm text-teal-deep/70 lg:inline-flex">
                  <span aria-hidden="true" className="block h-5 w-px overflow-hidden bg-teal/20"><span className="block h-2 w-px animate-[hero-drip_1.6s_var(--ease-ambient)_infinite] bg-teal" /></span>
                  {c.kingdom.hint}
                </span>
              ) : null}
            </div>
          </Panel>
          {/* one order, stage by stage */}
          {onStage
            ? NEED_STAGES.map((st, i) => (
                <Panel key={st} on={stage === i}>
                  <StageCopy n={n} st={st} i={i} on={stage === i} />
                </Panel>
              ))
            : null}
        </div>
      </div>

      <div className="relative order-1 mx-auto w-full max-w-[640px] max-lg:w-[min(100%,calc(38svh*1100/850))] lg:order-2 lg:w-[min(100%,calc(58svh*1100/850))]">
        <div className="relative aspect-[1100/850]">
          <div aria-hidden="true" className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(108,195,195,0.35),transparent_70%)] blur-2xl" />
          <div className="absolute inset-0 [mask-composite:intersect] [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent),linear-gradient(180deg,transparent,#000_7%,#000_93%,transparent)]">
            {map ? <HeroMap lang={lang} lane={lane} stage={stage} /> : null}
          </div>
          {/* the stage's card, floating over the map */}
          {onStage ? (
            <div aria-hidden={!inStage || undefined} className="pointer-events-none absolute -end-2 bottom-[10%] hidden w-[15.5rem] lg:block xl:-end-5">
              {NEED_STAGES.map((st, i) => (
                <div
                  key={st}
                  className={`absolute inset-x-0 bottom-0 transition-[opacity,translate,rotate] duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${stage === i ? "translate-y-0 rotate-0 opacity-100" : "translate-y-5 rotate-[-2deg] opacity-0"}`}
                >
                  <div className="motion-safe:animate-[op-float_6s_var(--ease-ambient)_infinite_alternate] [&>div]:p-3.5 [&>div]:text-[13px]">
                    <StageCard stage={st} c={n} guide={guide} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <p className="absolute start-2 top-0 text-[11px] text-teal-deep/60 lg:bottom-1 lg:top-auto">{c.map.caption}</p>
        </div>
        {onStage && progress ? <StageRail n={n} label={c.kingdom.rail} stage={stage} onStage={onStage} progress={progress} /> : null}
      </div>
    </div>
  );
}

/** one layer of the copy column; the others wait, hidden and inert, in the same grid cell */
function Panel({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <div
      aria-hidden={on ? undefined : true}
      inert={!on}
      className={`[grid-area:s] transition-[opacity,translate] duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${on ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
    >
      {children}
    </div>
  );
}

type NeedsC = (typeof experience)["en"]["needs"];
type Stage = (typeof NEED_STAGES)[number];

function StageCopy({ n, st, i, on }: { n: NeedsC; st: Stage; i: number; on: boolean }) {
  return (
    <div>
      <p className="flex items-baseline gap-3 text-teal">
        <span className="num font-display text-sm font-semibold" dir="ltr">0{i + 1} / 0{NEED_STAGES.length}</span>
        <span className="h-px flex-1 bg-teal/20" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sea-100 px-2.5 py-1 text-[11px] font-semibold">
          <span className="size-1.5 rounded-full bg-teal" />
          {n.owner}
        </span>
      </p>
      <h3 className="mt-2 font-display text-4xl font-semibold tracking-[-0.035em] sm:text-5xl rtl:tracking-normal">{n.stages[st].t}</h3>
      <p className="mt-1 text-teal-deep/70 sm:text-lg">{n.stages[st].d}</p>
      <ul data-stage-answers data-inview={on || undefined} className="needs-grid mt-3 divide-y divide-teal/10 border-y border-teal/10 lg:mt-5">
        {NEEDS_BY_STAGE[st].map((id, k) => (
          <li
            key={id}
            className={`flex items-start gap-3 py-2.5 transition-[opacity,translate] duration-700 lg:gap-4 lg:py-3.5 ${on ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
            style={{ transitionDelay: on ? `${150 + k * 90}ms` : "0ms" }}
          >
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-teal-deep text-white shadow-[0_10px_20px_-10px_rgba(11,58,64,0.8)] lg:size-11 [&_svg]:size-6 lg:[&_svg]:size-7">
              <NeedIcon id={id} />
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm text-teal-deep/70 max-lg:hidden">{n.items[id].q}</h4>
              <p className="font-display text-[15px] font-semibold leading-snug text-pretty sm:text-lg lg:mt-0.5 xl:text-xl">{n.items[id].a}</p>
            </div>
          </li>
        ))}
      </ul>
      {st === "settle" ? <p className="mt-3 text-xs text-teal-deep/75 max-lg:hidden">{n.note}</p> : null}
    </div>
  );
}

/** the four stages under the map: where the order is now, and a way to jump to any stage */
function StageRail({ n, label, stage, onStage, progress }: { n: NeedsC; label: string; stage: number; onStage: (i: number) => void; progress: MotionValue<number> }) {
  return (
    <nav aria-label={label} className="mt-3 lg:mt-4">
      <ol className="grid grid-cols-4 gap-2">
        {NEED_STAGES.map((st, i) => (
          <li key={st}>
            <button type="button" onClick={() => onStage(i)} aria-current={i === stage ? "step" : undefined} className="group tap block w-full text-start">
              <span className="block h-1 overflow-hidden rounded-full bg-teal/15">
                <StageFill p={progress} i={i} />
              </span>
              <span className={`mt-2 flex items-baseline gap-1.5 text-xs font-semibold transition-colors sm:text-sm ${i === stage ? "text-teal-deep" : "text-teal-deep/60 group-hover:text-teal-deep"}`}>
                <span className="num text-[11px] text-teal" dir="ltr">0{i + 1}</span>
                {n.stages[st].t}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** one quarter of the stages' scroll: empty before its stage, filling during it, full after */
function StageFill({ p, i }: { p: MotionValue<number>; i: number }) {
  const transform = useTransform(p, (v) => `scaleX(${Math.min(1, Math.max(0, v * NEED_STAGES.length - i)).toFixed(4)})`);
  return <motion.span className="block h-full origin-left rounded-full bg-teal rtl:origin-right" style={{ transform }} />;
}

/** reduced motion: the same four stages, one after another */
function StagesStacked({ lang }: { lang: Locale }) {
  const n = experience[lang].needs;
  const guide = experience[lang].journey.ui.guideItems;
  return (
    <div className="mx-auto max-w-7xl px-4 text-teal-deep sm:px-5 lg:px-8">
      <h2 className="h-section">{n.title}</h2>
      <p className="mt-3 max-w-2xl text-lg text-teal-deep/75 text-pretty">{n.lead}</p>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        {NEED_STAGES.map((st, i) => (
          <article key={st} className="flex flex-col gap-5">
            <StageCopy n={n} st={st} i={i} on />
            <StageCard stage={st} c={n} guide={guide} />
          </article>
        ))}
      </div>
    </div>
  );
}

/** counts up once its scene is on screen */
function Counter({ v, suffix, go, delay }: { v: number; suffix: string; go: boolean; delay: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!go) return;
    const id = window.setTimeout(() => setN(v), delay * 1000);
    return () => window.clearTimeout(id);
  }, [go, v, delay]);
  return (
    <>
      <NumberFlow value={n} suffix={suffix} locales="en-US" format={{ useGrouping: true }} aria-hidden="true" />
      <span className="sr-only">{`${v.toLocaleString("en-US")}${suffix}`}</span>
    </>
  );
}
