"use client";

import { SPRING_SMOOTH } from "@/lib/motion";
import NumberFlow from "@number-flow/react";
import Image from "next/image";
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
import Dust from "./Dust";
import { STAGE_COUNT } from "./HeroMap";
import { NeedIcon, StageCard } from "../operation/StageParts";
import QuoteCard from "./QuoteCard";
import { Chip, CommandBackdrop, ConsoleWindow, Depth, fadeUp, OrderTicker, PartnerLine, Strengths, VanIcon } from "./Command";

/*
 * Geometry of MSG's own photos (public/media/msg), as fractions of each image. Everything drawn on top of a
 * photo (the sign's glow, the routes, the lamps, the hotspots) is placed in these coordinates, so it stays on
 * the right pixel at any screen size.
 */
const FACADE = {
  ar: 1448 / 1086,
  door: { x: 0.4354, y: 0.4383, w: 0.2051, h: 0.3425 },
  anchorY: 0.4,
  // the building below the roofline (the sky behind it drifts on its own layer)
  building: "polygon(0% 25.05%, 2.07% 25.05%, 2.14% 18.78%, 42.96% 12.43%, 97.51% 18.69%, 100% 18.32%, 100% 100%, 0% 100%)",
  sign: { x: 469 / 1448, y: 153 / 1086, w: 283 / 1448, h: 101 / 1086 },
  lamp: { x: 0.4365, y: 0.399 },
};
/*
 * The scroll through the hero: the walk-in (facade, inside, out to the network) takes the first WALK of it, the
 * network console holds for HOLD, then one order's four stages (set up, store, deliver, settle) share the rest,
 * played inside the same console. The section's height keeps the walk-in over the distance it always had.
 */
const WALK = 0.36, HOLD = 0.1, STEP = (1 - WALK - HOLD) / STAGE_COUNT;
const stageAt = (v: number) => (v < WALK + HOLD ? -1 : Math.min(STAGE_COUNT - 1, Math.floor((v - WALK - HOLD) / STEP)));
/** the console's resting tilt toward the visitor (degrees); it eases to about half while an order plays */
const TILT = { x: 9, y: 13 };
const RATE_LANE: Record<HeroLane, Lane> = { intra: "intra", inter: "inter", sabya: "sabyaMajor" };
type Pt = { x: number; y: number };
type Inside = { src: string; ar: number; lamps: Pt[]; spots: Record<"storage" | "sorting" | "dispatch", Pt> };
const INSIDE_WIDE: Inside = {
  src: "/media/msg/interior.jpg",
  ar: 1260 / 950,
  lamps: [{ x: 0.37, y: 0.241 }, { x: 0.784, y: 0.253 }, { x: 0.787, y: 0.37 }],
  spots: { storage: { x: 0.33, y: 0.47 }, sorting: { x: 0.45, y: 0.62 }, dispatch: { x: 0.79, y: 0.6 } },
};
const INSIDE_TALL: Inside = {
  src: "/media/msg/interior-portrait.jpg",
  ar: 1086 / 1448,
  lamps: [{ x: 0.2145, y: 0.163 }, { x: 0.5737, y: 0.168 }, { x: 0.812, y: 0.197 }],
  spots: { storage: { x: 0.3, y: 0.32 }, sorting: { x: 0.505, y: 0.4 }, dispatch: { x: 0.7, y: 0.36 } },
};

/** how far the facade is set down in the frame to leave room for sky above the roof, as a share of the frame's height */
const SKY = 0.14;

/** a box with the photo's proportions that always covers the frame, keeping (ax, ay) as central as it can; `drop` sets it lower */
const cover = (ar: number, ax: number, ay: number, drop = 0): React.CSSProperties => ({
  ["--W" as string]: `max(100cqw, calc(100cqh * ${ar}))`,
  width: "var(--W)",
  height: `calc(var(--W) / ${ar})`,
  left: `clamp(calc(100cqw - var(--W)), calc(50cqw - ${ax} * var(--W)), 0px)`,
  top: `calc(clamp(calc(100cqh - var(--W) / ${ar}), calc(50cqh - ${ay} * var(--W) / ${ar}), 0px) + ${drop * 100}cqh)`,
});
const at = (p: Pt) => ({ left: `${p.x * 100}%`, top: `${p.y * 100}%` });

/** how far the camera has to push in for the doorway to fill the frame */
function doorZoom(fw: number, fh: number) {
  const W = Math.max(fw, fh * FACADE.ar), H = W / FACADE.ar;
  const left = Math.min(0, Math.max(fw - W, fw / 2 - FACADE.door.x * W));
  const top = Math.min(0, Math.max(fh - H, fh / 2 - FACADE.anchorY * H)) + SKY * fh;
  const cx = left + FACADE.door.x * W, cy = top + FACADE.door.y * H;
  const zx = (2 * Math.max(cx, fw - cx)) / (FACADE.door.w * W);
  const zy = (2 * Math.max(cy, fh - cy)) / (FACADE.door.h * H);
  return Math.max(zx, zy) * 1.08;
}

/**
 * First screen: MSG's real warehouse. The facade breathes in warm light; scrolling walks the visitor through the
 * doorway, the lights come on inside, and the view pulls out to MSG's network as a control console: the network
 * live on the map, one order walking through every step MSG owns, the price from MSG's own rate card and the
 * verified figures under it. Scrolling on, the same console plays one order through set up, store, deliver and
 * settle: the map's camera goes where each stage happens, the stage's card comes forward, its answers take the
 * copy column and a rail under it tracks the order. Under reduced motion the scenes simply stack.
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
  const inStage = staged && beat === 3 && stage >= 0;
  const n = experience[L].needs;
  const guide = experience[L].journey.ui.guideItems;

  // the walk-in is driven by scroll through the (tall) section
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  // copied into plain motion values so every layer reads the same progress
  const p = useMotionValue(0);
  // how far through the four stages the scroll is (0 → 1), for the stage rail's fill
  const sp = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const w = Math.min(1, v / WALK);
    p.set(w);
    const b = w < 0.2 ? 1 : w < 0.8 ? 2 : 3;
    setBeat((x) => (x === b ? x : b));
    const s = stageAt(v);
    setStage((x) => (x === s ? x : s));
    if (b !== 3 || s >= 0) setPriceOpen(false); // the quote belongs to the network view
    sp.set(Math.max(0, (v - WALK - HOLD) / (1 - WALK - HOLD)));
  });
  // the stage rail jumps to the middle of a stage's stretch of scroll
  const goStage = (i: number) => {
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + (el.offsetHeight - window.innerHeight) * (WALK + HOLD + (i + 0.5) * STEP));
  };

  // the opening (see "Hero opening" in globals.css) yields to the first scroll, touch or key press
  useEffect(() => {
    const el = section.current;
    if (!el || !staged || el.dataset.intro === "skip") return;
    const skip = () => { el.dataset.intro = "skip"; off(); };
    const onScroll = () => { if (window.scrollY > 24) skip(); };
    const off = () => {
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(done);
    };
    const done = window.setTimeout(skip, 4200); // it has finished: later re-renders must never replay it
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    window.addEventListener("keydown", skip);
    window.addEventListener("scroll", onScroll, { passive: true });
    return off;
  }, [staged]);

  // the header picks its colours from the section under it; tell it when the scene changes
  useEffect(() => { window.dispatchEvent(new Event("scroll")); }, [beat]);

  useEffect(() => {
    if (!priceOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPriceOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [priceOpen]);

  // pointer parallax: the sky moves more than the building, and the console leans toward the pointer
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { ...SPRING_SMOOTH }), sy = useSpring(my, { ...SPRING_SMOOTH });
  const skyX = useTransform(sx, [-0.5, 0.5], [22, -22]);
  const bldX = useTransform(sx, [-0.5, 0.5], [9, -9]);
  const bldY = useTransform(sy, [-0.5, 0.5], [5, -5]);
  const onMove = (e: React.PointerEvent) => {
    if (!staged || e.pointerType !== "mouse" || !frame.current) return;
    const r = frame.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  // the push through the doorway
  const zmax = useMotionValue(5);
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(() => zmax.set(doorZoom(el.clientWidth, el.clientHeight)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [zmax]);
  const zk = useTransform(p, [0.1, 0.43], [0, 1], { clamp: true });
  const zoom = useTransform(() => 1 + (zmax.get() - 1) * zk.get() ** 3);
  const facadeFx = useTransform(p, [0.3, 0.43], ["blur(0px) brightness(1)", "blur(10px) brightness(0.3)"]);
  const veil = useTransform(p, [0.33, 0.43], [0, 1]);
  const uiOut = useTransform(p, [0, 0.08, 0.18], [1, 1, 0]);
  const uiY = useTransform(p, [0, 0.18], [0, -70]);
  const hint = useTransform(p, [0, 0.05], [1, 0]);

  // inside: the lights flicker on, then the camera settles
  const inOpacity = useTransform(p, [0.42, 0.46, 0.77, 0.85], [0, 1, 1, 0]);
  const inDark = useTransform(p, [0.44, 0.465, 0.48, 0.5, 0.53], [0.94, 0.4, 0.78, 0.15, 0]);
  const inScale = useTransform(p, [0.43, 0.8, 0.86], [1.22, 1, 0.92]);
  const lamps = useTransform(p, [0.465, 0.49, 0.53], [0, 1, 0.8]);
  const inCopy = useTransform(p, [0.52, 0.57, 0.72, 0.78], [0, 1, 1, 0]);
  const inCopyY = useTransform(p, [0.52, 0.57], [30, 0]);

  // out to the network: the console rises out of the night and settles, tilted toward the visitor
  const cO = useTransform(p, [0.78, 0.9], [0, 1]);
  const cBack = useTransform(p, [0.76, 0.86], [0, 1]);
  const cLift = useTransform(p, [0.78, 1], [70, 0]);
  const cScale = useTransform(p, [0.78, 1], [0.9, 1]);
  const tiltTo = useMotionValue(1);
  useEffect(() => { tiltTo.set(inStage ? 0.45 : 1); }, [inStage, tiltTo]);
  const tiltK = useSpring(tiltTo, { stiffness: 60, damping: 18 });
  const rise = useTransform(p, [0.78, 1], [1.8, 1]); // the console comes in steeper and settles to its lean
  const dir = rtl ? -1 : 1;
  const ry = useTransform(() => (-TILT.y * dir + sx.get() * 7) * tiltK.get());
  const rx = useTransform(() => (TILT.x * rise.get() - sy.get() * 6) * tiltK.get());

  // "Price a delivery": the quote opens over the console on wide screens; phones go to the card below the hero
  const openPrice = (e: React.MouseEvent) => {
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    e.preventDefault();
    setPriceOpen(true);
  };

  const facade = (
    <Facade
      c={c}
      staged={staged}
      idle={staged && beat !== 1}
      zoom={staged ? zoom : undefined}
      fx={staged ? facadeFx : undefined}
      skyX={staged ? skyX : undefined}
      bldX={staged ? bldX : undefined}
      bldY={staged ? bldY : undefined}
    />
  );

  const promise = (
    <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 text-white sm:px-5 lg:px-8 lg:pb-14">
      <div>
        <p className="hi hi-fade inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur" style={{ ["--hi" as string]: "1.0s" }}>
          <span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-brand-bright/70 motion-reduce:hidden" /><span className="relative size-2 rounded-full bg-brand-bright" /></span>
          {c.live}
        </p>
        <h1 id="hero-title" className="mt-4 font-display text-[clamp(2.3rem,4.6vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.03em] [word-spacing:0.06em] text-balance [text-shadow:0_2px_30px_rgba(0,0,0,0.45)] rtl:[word-spacing:normal] rtl:leading-[1.25] rtl:tracking-normal">
          <span className="-mb-[0.16em] block overflow-hidden pb-[0.16em] lg:whitespace-nowrap"><span className="hi hi-line block" style={{ ["--hi" as string]: "1.25s" }}>{c.title[0]}</span></span>
          <span className="-mb-[0.16em] block overflow-hidden pb-[0.16em] text-brand-mint lg:whitespace-nowrap"><span className="hi hi-line block" style={{ ["--hi" as string]: "1.4s" }}>{c.title[1]}</span></span>
        </h1>
      </div>
      <div className="lg:mt-2 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-10">
      <div>
        <p className="hi hi-rise mt-4 max-w-xl text-base leading-relaxed text-white/85 text-pretty sm:text-lg" style={{ ["--hi" as string]: "1.8s" }}>{c.lead}</p>
        {/* phones: the price is on the first screen; the full card waits below the hero */}
        <aside data-rate-card aria-label={c.quote.title} className="hi hi-rise mt-4 lg:hidden" style={{ ["--hi" as string]: "1.95s" }}>
          <a href="#hero-quote" className="inline-flex max-w-full flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-2xl bg-white/95 px-4 py-2.5 text-sm text-teal-deep shadow-[var(--shadow-float)]">
            <span className="text-teal-deep/75">{c.quote.perOrder}</span>
            <span className="num font-display text-lg font-semibold" dir="ltr">≈ {c.quote.cur} {rate}</span>
            <span className="flex basis-full items-center gap-1.5 text-teal-deep/75">
              {c.quote.lanes[lane]} · <span className="num" dir="ltr">{orders.toLocaleString("en-US")}</span> {c.quote.perMonth}
              <svg viewBox="0 0 24 24" className="size-3.5 text-teal" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
            </span>
          </a>
        </aside>
        <div className="hi hi-rise mt-6 flex flex-wrap items-center gap-3" style={{ ["--hi" as string]: "2.05s" }}>
          <TrackedLink href={whatsappLink(t.wa.general)} target="_blank" rel="noopener noreferrer" event="whatsapp_click" props={{ location: "hero" }}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3.5 font-semibold text-white ring-1 ring-white/30 backdrop-blur transition-colors hover:bg-white/20">
            <WhatsAppIcon className="size-5 text-brand-bright" /> {c.ctaTalk}
          </TrackedLink>
        </div>
        <p className="hi hi-fade mt-5 text-xs text-white/70 max-lg:pe-16" style={{ ["--hi" as string]: "2.4s" }}>{c.facade.caption}</p>
      </div>
      <QuoteCard lang={L} reduce={reduce} lane={lane} onLane={setLane} orders={orders} onOrders={setOrders} className="hi hi-rise hidden [--hi:2.15s] lg:block" />
      </div>
    </div>
  );

  const inside = (
    <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-12 text-white sm:px-5 lg:px-8 lg:pb-16">
      <p className="text-sm font-semibold text-brand-mint">{c.inside.eyebrow}</p>
      <h2 className="h-scene mt-2 max-w-2xl [text-shadow:0_2px_30px_rgba(0,0,0,0.5)]">{c.inside.title}</h2>
      <p className="mt-3 max-w-xl text-white/85 text-pretty sm:text-lg">{c.inside.lead}</p>
    </div>
  );

  /* ---- the network console ---- */

  const overview = (
    <div className="text-white">
      <p className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold text-white/85 ring-1 ring-white/15 sm:text-xs">
        <span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-brand-bright/70 motion-reduce:hidden" /><span className="relative size-2 rounded-full bg-brand-bright" /></span>
        {c.command.eyebrow}
      </p>
      <h2 className="mt-3 font-display text-[clamp(1.9rem,min(4vw,7svh),3.7rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-balance sm:mt-4 rtl:leading-[1.25] rtl:tracking-normal">
        <span className="block">{c.command.title[0]}</span>
        <span className="block bg-[linear-gradient(90deg,#b8f5cf,#6cc3c3)] bg-clip-text text-transparent rtl:bg-[linear-gradient(270deg,#b8f5cf,#6cc3c3)]">{c.command.title[1]}</span>
      </h2>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/80 text-pretty sm:mt-4 sm:text-lg">
        <span className="sm:hidden">{c.command.leadShort}</span><span className="max-sm:hidden">{c.command.lead}</span>
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-6 sm:gap-3">
        <a href="#hero-quote" onClick={openPrice} aria-haspopup="dialog" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-teal-deep shadow-[0_10px_40px_-10px_rgba(184,245,207,0.6)] transition-transform hover:-translate-y-0.5 sm:py-3.5">
          {c.command.ctaPrice}
          <svg viewBox="0 0 24 24" className="size-4 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </a>
        <TrackedLink href={whatsappLink(t.wa.general)} target="_blank" rel="noopener noreferrer" event="whatsapp_click" props={{ location: "hero_console" }}
          aria-label={c.ctaTalk}
          className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-5 py-3 font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/15 sm:py-3.5">
          <WhatsAppIcon className="size-5 text-brand-bright" /> <span className="max-sm:hidden">{c.ctaTalk}</span><span className="sm:hidden">{c.command.waShort}</span>
        </TrackedLink>
      </div>
      <div className="mt-7 max-lg:hidden"><PartnerLine c={c} /></div>
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

  // a layer pinned to the console that comes and goes with the view: in, it settles; out, it drops back and tips
  const swap = (on: boolean) =>
    `transition-[opacity,translate,rotate] duration-500 ease-[cubic-bezier(.23,1,.32,1)] ${on ? "translate-y-0 rotate-0 opacity-100" : "pointer-events-none translate-y-4 rotate-[-2deg] opacity-0"}`;

  const console3d = (
    <div className="relative mx-auto w-full max-w-[640px] max-lg:w-[min(100%,calc(29svh*1100/850+1rem))] lg:my-12 lg:w-[min(100%,calc((100svh-25rem)*1100/850))] [perspective:1700px]">
      <motion.div style={staged ? { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" } : undefined} className="relative">
        <ConsoleWindow c={c} lang={L} lane={lane} onLane={setLane} map={!staged || beat >= 2} title={c.command.console} stage={inStage ? stage : -1} />
        {/* front, lower corner: the order card over the network; each stage's own card while the order plays */}
        <Depth z={90} className="absolute -bottom-12 -start-10 hidden h-0 w-[17.5rem] lg:block xl:-start-14">
          <div aria-hidden={inStage || undefined} className={`absolute inset-x-0 bottom-0 ${swap(!inStage)}`}>
            <OrderTicker c={c} run={staged && beat === 3 && !inStage} reduce={reduce} />
          </div>
          {staged
            ? NEED_STAGES.map((st, i) => (
                <div key={st} aria-hidden={stage !== i || !inStage || undefined} className={`absolute inset-x-0 bottom-0 ${swap(inStage && stage === i)}`}>
                  <div className="motion-safe:animate-[op-float_6s_var(--ease-ambient)_infinite_alternate] [&>div]:p-3.5 [&>div]:text-[13px] [&>div]:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]">
                    <StageCard stage={st} c={n} guide={guide} />
                  </div>
                </div>
              ))
            : null}
        </Depth>
        <Depth z={120} className={`absolute -top-10 end-3 hidden transition-opacity duration-200 lg:block ${priceOpen ? "opacity-0" : ""}`}>{priceChip}</Depth>
        <Depth z={60} className="absolute -bottom-14 end-2 hidden lg:block">
          <div aria-hidden={(inStage && stage !== 2) || undefined} className={swap(!inStage || stage === 2)}>
            <Chip icon={VanIcon} t={c.command.fleet.t} d={c.command.fleet.d} />
          </div>
        </Depth>
      </motion.div>
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

  const scene = (
    <div className="relative mx-auto grid h-full max-w-7xl grid-rows-[1fr_auto] px-4 pb-4 pt-[4.5rem] sm:px-5 lg:px-8 lg:pb-6 lg:pt-20">
      <div className="grid content-center items-center gap-4 lg:grid-cols-[0.92fr_1.08fr] lg:gap-6 xl:gap-10">
        <div className="order-2 grid [grid-template-areas:'s'] lg:order-1">
          <Panel on={!inStage}>{overview}</Panel>
          {staged
            ? NEED_STAGES.map((st, i) => (
                <Panel key={st} on={inStage && stage === i}>
                  <p className="mb-3 text-sm font-semibold text-brand-mint max-lg:hidden">{c.kingdom.title}</p>
                  <StageCopy n={n} st={st} i={i} on={inStage && stage === i} dark />
                </Panel>
              ))
            : null}
        </div>
        <div className="order-1 lg:order-2 lg:ps-6 xl:ps-10">{console3d}</div>
      </div>
      <div className="mt-4 grid border-t border-white/12 pt-3.5 [grid-template-areas:'s'] lg:mt-6 lg:pt-5">
        <Panel on={!inStage}><Strengths c={c} go={!staged || beat === 3} reduce={reduce} ar={rtl} /></Panel>
        {staged ? <Panel on={inStage}><StageRail n={n} label={c.kingdom.rail} stage={inStage ? stage : -1} onStage={goStage} progress={sp} dark /></Panel> : null}
      </div>
    </div>
  );

  if (!staged) {
    return (
      <section id="hero" ref={section} aria-labelledby="hero-title" className="relative bg-deep">
        <div ref={frame} data-theme="dark" className="relative h-[100svh] min-h-[640px] overflow-hidden [container-type:size]">
          {facade}
          <Scrim />
          <div className="absolute inset-0 pt-20">{promise}</div>
        </div>
        <div data-theme="dark" className="relative h-[85svh] min-h-[520px] overflow-hidden [container-type:size]">
          <Interior c={c} />
          <Scrim />
          <div className="absolute inset-0">{inside}</div>
        </div>
        <div data-theme="dark" className="relative min-h-[100svh] overflow-hidden">
          <CommandBackdrop />
          <div className="relative">{scene}</div>
        </div>
        <div id="sellers" className="relative scroll-mt-16 bg-white py-16"><StagesStacked lang={L} /></div>
        <div id="hero-quote" className="scroll-mt-20 px-4 pb-12 pt-2 lg:hidden"><QuoteCard lang={L} reduce={reduce} lane={lane} onLane={setLane} orders={orders} onOrders={setOrders} /></div>
      </section>
    );
  }

  return (
    <>
    <section id="hero" ref={section} suppressHydrationWarning aria-labelledby="hero-title" className="relative h-[460svh] bg-deep lg:h-[620svh]">
      {/* runs before first paint: a returning visitor, or a page restored part-way down, skips the opening */}
      <script dangerouslySetInnerHTML={{ __html: INTRO_GATE }} />
      {/* where "one order through MSG" begins: the first of the four stages, to the end of the hero */}
      <div id="sellers" aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 top-[176svh] lg:top-[255svh]" />
      <div
        ref={frame}
        data-theme="dark"
        onPointerMove={onMove}
        onPointerLeave={() => { mx.set(0); my.set(0); }}
        className="sticky top-0 h-[100svh] overflow-hidden [container-type:size]"
      >
        {facade}
        <Dust run={beat === 1} className="z-[1]" />
        <motion.div aria-hidden="true" style={{ opacity: veil }} className="absolute inset-0 z-[2] bg-[#030a0b]" />

        <motion.div style={{ opacity: inOpacity }} className="absolute inset-0 z-[3]">
          <Interior c={c} dark={inDark} scale={inScale} lamps={lamps} copy={inCopy} />
        </motion.div>

        <motion.div style={{ opacity: cBack }} className="absolute inset-0 z-[4]"><CommandBackdrop stars={beat >= 2} /></motion.div>

        {/* scene copy */}
        <motion.div style={{ opacity: uiOut, y: uiY }} inert={beat !== 1} className="absolute inset-0 z-[5] pt-20">
          <Scrim />
          {promise}
        </motion.div>
        <motion.div style={{ opacity: inCopy, y: inCopyY }} className="pointer-events-none absolute inset-0 z-[5]">
          <Scrim />
          {inside}
        </motion.div>
        <motion.div style={{ opacity: cO, y: cLift, scale: cScale }} inert={beat !== 3} className="absolute inset-0 z-[6]">
          {scene}
        </motion.div>

        <motion.p aria-hidden="true" style={{ opacity: hint }} className="pointer-events-none absolute inset-x-0 bottom-3 z-[7] hidden flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 lg:flex rtl:tracking-normal">
          <span className="hi hi-fade" style={{ ["--hi" as string]: "2.9s" }}>{c.facade.hint}</span>
          <span className="hi hi-fade block h-7 w-px overflow-hidden bg-white/25" style={{ ["--hi" as string]: "2.9s" }}><span className="block h-3 w-px animate-[hero-drip_1.6s_var(--ease-ambient)_infinite] bg-white" /></span>
        </motion.p>
      </div>
    </section>
    {/* on phones the ten-second price follows the hero */}
    <div id="hero-quote" className="relative scroll-mt-20 bg-white px-4 pb-12 pt-8 lg:hidden">
      <QuoteCard lang={L} reduce={reduce} lane={lane} onLane={setLane} orders={orders} onOrders={setOrders} />
    </div>
    </>
  );
}

/** darkens the lower part of a photo so the copy over it stays readable */
function Scrim() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,14,16,0.55)_0%,rgba(3,14,16,0)_22%,rgba(3,14,16,0)_42%,rgba(3,14,16,0.82)_100%)] lg:bg-[linear-gradient(180deg,rgba(3,14,16,0.5)_0%,rgba(3,14,16,0)_20%,rgba(3,14,16,0)_45%,rgba(3,14,16,0.85)_100%)]" />
  );
}

type C = (typeof heroCopy)["en"];

function Facade({
  c, staged, idle, zoom, fx, skyX, bldX, bldY,
}: {
  c: C; staged: boolean; idle?: boolean; zoom?: MotionValue<number>; fx?: MotionValue<string>; skyX?: MotionValue<number>; bldX?: MotionValue<number>; bldY?: MotionValue<number>;
}) {
  const d = FACADE.door;
  return (
    <motion.div
      className="absolute"
      data-idle={idle || undefined}
      style={{ ...cover(FACADE.ar, d.x, FACADE.anchorY, SKY), scale: zoom, filter: fx, transformOrigin: `${d.x * 100}% ${d.y * 100}%` }}
    >
      <div className={staged ? "hi hi-push absolute inset-0" : "absolute inset-0"} style={{ transformOrigin: `${d.x * 100}% ${d.y * 100}%` }}>
      <div className={`absolute inset-0 ${staged ? "motion-safe:animate-[hero-breathe_22s_var(--ease-ambient)_infinite_alternate]" : ""}`} style={{ transformOrigin: `${d.x * 100}% ${d.y * 100}%` }}>
        {/* the sky, on its own layer behind the roof */}
        {/* it reaches above the photograph, so the frame holds more sky than the camera did */}
        <motion.div aria-hidden="true" className="absolute inset-x-0 scale-[1.12]" style={{ x: skyX, top: `-${SKY * 100}cqh`, height: `calc(30.39% + ${SKY * 100}cqh)` }}>
          <div className="absolute inset-0 motion-safe:animate-[hero-sky_70s_var(--ease-ambient)_infinite_alternate]">
            <Image src="/media/msg/facade-sky.jpg" alt="" fill sizes="100vw" className="object-cover object-bottom" />
          </div>
          {/* a second pass of the same clouds, mirrored and brighter, crossing the other way */}
          <div className="absolute inset-0 opacity-50 mix-blend-screen motion-safe:animate-[hero-clouds_95s_linear_infinite_alternate]">
            <Image src="/media/msg/facade-sky.jpg" alt="" fill sizes="100vw" className="-scale-x-100 object-cover object-bottom" />
          </div>
          {staged ? <div className="hi hi-night absolute inset-0 bg-[#02070a]" /> : null}
        </motion.div>

        {/* the building */}
        <motion.div className="absolute inset-0 scale-[1.02]" style={{ x: bldX, y: bldY, clipPath: FACADE.building }}>
          <Image src="/media/msg/facade.jpg" alt={c.facade.alt} fill priority sizes="(max-aspect-ratio: 4/3) 134vh, 100vw" className="object-cover" />
          {/* night over the building; the sign, the doorway and the routes glow above it */}
          {staged ? <div aria-hidden="true" className="hi hi-night absolute inset-0 bg-[#02070a]" /> : null}
          {/* light passing over the walls */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden mix-blend-soft-light">
            <div className="absolute inset-y-0 -left-1/2 w-1/2 bg-[linear-gradient(100deg,transparent_0%,rgba(255,244,214,0.75)_50%,transparent_100%)] motion-safe:animate-[hero-sweep_9s_var(--ease-ambient)_infinite]" />
          </div>
          {/* the sign, lit */}
          <div aria-hidden="true" className={staged ? "hi hi-sign absolute" : "absolute"} style={{ left: `${FACADE.sign.x * 100}%`, top: `${FACADE.sign.y * 100}%`, width: `${FACADE.sign.w * 100}%`, height: `${FACADE.sign.h * 100}%` }}>
            <span className="absolute inset-[-40%_-12%] rounded-[40%] bg-[radial-gradient(closest-side,rgba(255,252,240,0.35),transparent)] mix-blend-screen motion-safe:animate-[hero-sign_4.5s_var(--ease-ambient)_infinite]" />
            <Image src="/media/msg/sign-glow.png" alt="" fill sizes="20vw" className="object-fill opacity-90 mix-blend-screen blur-[3px] motion-safe:animate-[hero-sign_4.5s_var(--ease-ambient)_infinite]" />
            <Image src="/media/msg/sign-glow.png" alt="" fill sizes="20vw" className="object-fill opacity-40 mix-blend-screen" />
          </div>
          {/* a lamp glimmering inside the doorway */}
          <span aria-hidden="true" className="absolute size-[3.4%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,240,0.6),rgba(255,255,240,0))] mix-blend-screen motion-safe:animate-[hero-lamp_3.2s_var(--ease-ambient)_infinite]" style={at(FACADE.lamp)} />
          {/* the doorway: warm light inside, and the shutter that rolls up to open the day */}
          {staged ? (
            <div aria-hidden="true" className="absolute overflow-hidden" style={{ left: `${(d.x - d.w / 2) * 100}%`, top: `${(d.y - d.h / 2) * 100}%`, width: `${d.w * 100}%`, height: `${d.h * 100}%` }}>
              <span className="hi hi-spill absolute inset-0 bg-[radial-gradient(85%_75%_at_50%_72%,rgba(255,232,180,0.8),rgba(255,232,180,0)_78%)] mix-blend-screen" />
              <span className="hi hi-shutter absolute inset-0 bg-[#10181a] bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.08)_0_2px,rgba(0,0,0,0.3)_2px_10px)] shadow-[0_8px_16px_rgba(0,0,0,0.65)]" />
            </div>
          ) : null}
          {/* deliveries leaving the door */}
          <svg aria-hidden="true" viewBox="0 0 1448 1086" preserveAspectRatio="none" className="absolute inset-0 size-full">
            <defs>
              <radialGradient id="hero-threshold"><stop offset="0" stopColor="var(--color-brand-bright)" stopOpacity="0.55" /><stop offset="1" stopColor="var(--color-brand-bright)" stopOpacity="0" /></radialGradient>
            </defs>
            <ellipse cx="630" cy="700" rx="240" ry="34" fill="url(#hero-threshold)" className="motion-safe:animate-[hero-lamp_3.2s_var(--ease-ambient)_infinite]" />
            {ROUTES.map((d, i) => (
              <g key={i}>
                <path d={d} pathLength={1} fill="none" stroke="var(--color-brand-bright)" strokeOpacity="0.25" strokeWidth="9" strokeLinecap="round" className={staged ? "hi hi-draw" : undefined} style={{ ["--hi" as string]: `${1.9 + i * 0.12}s` }} />
                <g className={staged ? "hi hi-fade" : undefined} style={{ ["--hi" as string]: "2.5s" }}>
                <path d={d} fill="none" stroke="#b8f5cf" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 22" className={staged ? "motion-safe:animate-[hero-flow_1.4s_linear_infinite]" : ""} />
                {staged ? (
                  <circle r="7" fill="#eafff1" className="motion-reduce:hidden" style={{ filter: "drop-shadow(0 0 8px #4cc97a)" }}>
                    <animateMotion dur={`${3.2 + i * 0.6}s`} begin={`${2.6 + i * 0.9}s`} repeatCount="indefinite" path={d} />
                  </circle>
                ) : null}
                </g>
              </g>
            ))}
          </svg>
        </motion.div>
      </div>
      </div>
    </motion.div>
  );
}

const INTRO_GATE = `try{var s=document.currentScript.parentElement;if(sessionStorage.getItem("msg-intro")||window.scrollY>40)s.dataset.intro="skip";else sessionStorage.setItem("msg-intro","1")}catch(e){}`;

const ROUTES = [
  "M630 702 C 520 738 300 762 -40 792",
  "M630 702 C 760 738 1040 766 1490 792",
  "M630 702 C 640 800 600 930 560 1120",
];

function Interior({
  c, dark, scale, lamps, copy,
}: {
  c: C; dark?: MotionValue<number>; scale?: MotionValue<number>; lamps?: MotionValue<number>; copy?: MotionValue<number>;
}) {
  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ scale }}>
      {([["hidden landscape:block", INSIDE_WIDE], ["hidden portrait:block", INSIDE_TALL]] as const).map(([vis, v]) => (
        <div key={v.src} className={`absolute inset-0 ${vis}`}>
          <div className="absolute" style={cover(v.ar, 0.5, 0.5)}>
            <Image src={v.src} alt={c.inside.alt} fill sizes="(max-aspect-ratio: 4/3) 134vh, 100vw" className="object-cover" />
            {dark ? <motion.div aria-hidden="true" className="absolute inset-0 bg-[#020607]" style={{ opacity: dark }} /> : null}
            {/* the overhead lights and the light they throw */}
            <motion.div aria-hidden="true" className="absolute inset-0 mix-blend-screen" style={{ opacity: lamps }}>
              {v.lamps.map((l, i) => (
                <span key={i}>
                  <span className="absolute size-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,245,0.95),rgba(220,240,255,0.25)_45%,transparent)]" style={at(l)} />
                  <span className="absolute h-[55%] w-[26%] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(235,245,255,0.28),transparent_85%)] [clip-path:polygon(44%_0,56%_0,100%_100%,0_100%)]" style={at(l)} />
                </span>
              ))}
            </motion.div>
            {/* what happens where */}
            <motion.div className="absolute inset-0" style={{ opacity: copy }}>
              {(["storage", "sorting", "dispatch"] as const).map((k) => (
                // labels open toward the middle of the picture so they never run off its edge
                <span key={k} className={`absolute flex -translate-y-1/2 items-center gap-2 ${v.spots[k].x > 0.55 ? "-translate-x-[calc(100%-10px)] flex-row-reverse" : "-translate-x-[10px]"}`} style={at(v.spots[k])} dir="ltr">
                  <span className="relative grid size-5 place-items-center">
                    <span className="absolute inset-0 rounded-full bg-brand-bright/50 motion-safe:animate-ping" />
                    <span className="relative size-2.5 rounded-full bg-brand-bright ring-2 ring-white" />
                  </span>
                  <span dir="auto" className="whitespace-nowrap rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur">{c.inside.spots[k]}</span>
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      ))}
    </motion.div>
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

/** one stage's answers; `dark` sets them on the network console's night */
function StageCopy({ n, st, i, on, dark = false }: { n: NeedsC; st: Stage; i: number; on: boolean; dark?: boolean }) {
  return (
    <div className={dark ? "text-white" : undefined}>
      <p className={`flex items-baseline gap-3 ${dark ? "text-brand-bright" : "text-teal"}`}>
        <span className="num font-display text-sm font-semibold" dir="ltr">0{i + 1} / 0{NEED_STAGES.length}</span>
        <span className={`h-px flex-1 ${dark ? "bg-white/15" : "bg-teal/20"}`} />
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${dark ? "bg-white/10 text-white/90" : "bg-sea-100"}`}>
          <span className={`size-1.5 rounded-full ${dark ? "bg-brand-bright" : "bg-teal"}`} />
          {n.owner}
        </span>
      </p>
      <h3 className="mt-2 font-display text-4xl font-semibold tracking-[-0.035em] sm:text-5xl rtl:tracking-normal">{n.stages[st].t}</h3>
      <p className={`mt-1 sm:text-lg ${dark ? "text-white/75" : "text-teal-deep/70"}`}>{n.stages[st].d}</p>
      <ul data-stage-answers data-inview={on || undefined} className={`needs-grid mt-3 divide-y border-y lg:mt-5 ${dark ? "divide-white/10 border-white/10" : "divide-teal/10 border-teal/10"}`}>
        {NEEDS_BY_STAGE[st].map((id, k) => (
          <li
            key={id}
            className={`flex items-start gap-3 py-2.5 transition-[opacity,translate] duration-700 lg:gap-4 lg:py-3.5 ${on ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
            style={{ transitionDelay: on ? `${150 + k * 90}ms` : "0ms" }}
          >
            <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-white lg:size-11 [&_svg]:size-6 lg:[&_svg]:size-7 ${dark ? "bg-white/[0.08] text-brand-bright ring-1 ring-white/15" : "bg-gradient-to-br from-teal to-teal-deep shadow-[0_10px_20px_-10px_rgba(11,58,64,0.8)]"}`}>
              <NeedIcon id={id} />
            </span>
            <div className="min-w-0 flex-1">
              <h4 className={`text-sm max-lg:hidden ${dark ? "text-white/70" : "text-teal-deep/70"}`}>{n.items[id].q}</h4>
              <p className="font-display text-[15px] font-semibold leading-snug text-pretty sm:text-lg lg:mt-0.5 xl:text-xl">{n.items[id].a}</p>
            </div>
          </li>
        ))}
      </ul>
      {st === "settle" ? <p className={`mt-3 text-xs max-lg:hidden ${dark ? "text-white/70" : "text-teal-deep/75"}`}>{n.note}</p> : null}
    </div>
  );
}

/** the four stages under the map: where the order is now, and a way to jump to any stage */
function StageRail({ n, label, stage, onStage, progress, dark = false }: { n: NeedsC; label: string; stage: number; onStage: (i: number) => void; progress: MotionValue<number>; dark?: boolean }) {
  return (
    <nav aria-label={label}>
      <ol className="grid grid-cols-4 gap-2">
        {NEED_STAGES.map((st, i) => (
          <li key={st}>
            <button type="button" onClick={() => onStage(i)} aria-current={i === stage ? "step" : undefined} className="group tap block w-full text-start">
              <span className={`block h-1 overflow-hidden rounded-full ${dark ? "bg-white/15" : "bg-teal/15"}`}>
                <StageFill p={progress} i={i} dark={dark} />
              </span>
              <span className={`mt-2 flex items-baseline gap-1.5 text-xs font-semibold transition-colors sm:text-sm ${dark ? (i === stage ? "text-white" : "text-white/70 group-hover:text-white") : i === stage ? "text-teal-deep" : "text-teal-deep/60 group-hover:text-teal-deep"}`}>
                <span className={`num text-[11px] ${dark ? "text-brand-bright" : "text-teal"}`} dir="ltr">0{i + 1}</span>
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
function StageFill({ p, i, dark = false }: { p: MotionValue<number>; i: number; dark?: boolean }) {
  const transform = useTransform(p, (v) => `scaleX(${Math.min(1, Math.max(0, v * NEED_STAGES.length - i)).toFixed(4)})`);
  return <motion.span className={`block h-full origin-left rounded-full rtl:origin-right ${dark ? "bg-brand-bright shadow-[0_0_12px_rgba(76,201,122,0.8)]" : "bg-teal"}`} style={{ transform }} />;
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
