"use client";

import NumberFlow from "@number-flow/react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useId, useRef, useState } from "react";
import { heroCopy, type HeroLane } from "@/content/hero";
import { rateFor, type Lane } from "@/content/redsea";
import { whatsappLink } from "@/content/facts";
import type { Dictionary, Locale } from "@/content/i18n";
import { track } from "@/lib/analytics";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon, WhatsAppIcon } from "../ui/icons";
import HeroMap from "./HeroMap";

const RATE_LANE: Record<HeroLane, Lane> = { intra: "intra", inter: "inter", sabya: "sabyaMajor" };
const MIN = 20, MAX = 3000;
const toOrders = (v: number) => Math.round(MIN * Math.pow(MAX / MIN, v / 1000) / 10) * 10 || MIN;
const toSlider = (n: number) => Math.round((Math.log(n / MIN) / Math.log(MAX / MIN)) * 1000);
const ease = [0.16, 1, 0.3, 1] as const;

/**
 * First screen. Built like the best fintech landing pages: a bold promise that reveals word by
 * word, proof in live counters, and a working calculator in the fold (Wise) beside a living network
 * visual (Stripe). The calculator drives the map: pick a lane and those routes light up.
 * The whole stage tilts toward the pointer in 3D and drifts back into depth as you scroll.
 */
export default function Hero({ t, lang }: { t: Dictionary; lang?: Locale }) {
  const L: Locale = lang ?? "en";
  const c = heroCopy[L];
  const reduce = useReducedMotion();
  const id = useId();
  const stage = useRef<HTMLElement>(null);
  const [lane, setLane] = useState<HeroLane>("intra");
  const [orders, setOrders] = useState(300);

  // pointer tilt (springy, subtle)
  const mx = useMotionValue(0), my = useMotionValue(0);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 120, damping: 20 });
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 120, damping: 20 });
  const cardX = useSpring(useTransform(mx, [-0.5, 0.5], [10, -10]), { stiffness: 120, damping: 20 });
  const cardY = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 20 });
  const glowX = useTransform(mx, [-0.5, 0.5], ["20%", "80%"]);
  const glowY = useTransform(my, [-0.5, 0.5], ["20%", "80%"]);
  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = stage.current!.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  // scroll: the stage recedes into depth
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start start", "end start"] });
  const sp = useSpring(scrollYProgress, { stiffness: 100, damping: 24 });
  const mapScale = useTransform(sp, [0, 1], [1, reduce ? 1 : 1.18]);
  const mapOpacity = useTransform(sp, [0, 0.8], [1, reduce ? 1 : 0.2]);
  const textY = useTransform(sp, [0, 1], [0, reduce ? 0 : -120]);
  const textOpacity = useTransform(sp, [0, 0.7], [1, reduce ? 1 : 0]);

  const rate = rateFor(RATE_LANE[lane], orders);
  const monthly = rate * orders;
  const wa = whatsappLink(c.quote.wa.replace("{lane}", c.quote.lanes[lane]).replace("{n}", String(orders)));
  const words = (line: string, li: number) =>
    line.split(" ").map((w, i) => (
      <span key={`${li}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
        <motion.span
          className="inline-block"
          initial={reduce ? false : { y: "105%" }}
          animate={{ y: "0%" }}
          transition={{ delay: 0.15 + li * 0.35 + i * 0.06, duration: 0.8, ease }}
        >
          {w}
        </motion.span>
        {" "}
      </span>
    ));
  const rise = (d: number) => (reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.7, ease } });

  return (
    <section
      id="hero"
      ref={stage}
      aria-labelledby="hero-title"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative isolate overflow-hidden bg-[radial-gradient(90%_70%_at_80%_10%,#c4e9e7_0%,rgba(196,233,231,0)_60%),radial-gradient(70%_60%_at_0%_100%,#e2f4f3_0%,rgba(226,244,243,0)_60%),linear-gradient(180deg,#f3fbfb,#ffffff)] pb-16 pt-24 text-teal-deep lg:min-h-[100svh] lg:pb-10 lg:pt-28"
    >
      {/* fine survey grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(19,113,121,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(19,113,121,0.06)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(80%_70%_at_60%_40%,#000,transparent)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-5 lg:grid-cols-[1fr_1.05fr] lg:gap-6 lg:px-8">
        {/* the promise */}
        <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-10">
          <motion.p {...rise(0)} className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-teal shadow-[0_6px_20px_-12px_rgba(19,113,121,0.6)] ring-1 ring-teal/15 backdrop-blur">
            <span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-[#0b7d36]/60 motion-reduce:hidden" /><span className="relative size-2 rounded-full bg-[#0b7d36]" /></span>
            {c.live}
          </motion.p>
          <h1 id="hero-title" className="mt-5 font-display text-[clamp(2.4rem,5.6vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-balance rtl:leading-[1.25] rtl:tracking-normal">
            <span className="block">{words(c.title[0], 0)}</span>
            <span className="block bg-gradient-to-r from-[#137179] via-[#0b7d36] to-[#137179] bg-[length:200%_auto] bg-clip-text text-transparent motion-safe:animate-[hero-sheen_6s_linear_infinite]">{words(c.title[1], 1)}</span>
          </h1>
          <motion.p {...rise(0.9)} className="mt-6 max-w-xl text-lg leading-relaxed text-teal-deep/80 text-pretty">{c.lead}</motion.p>

          <motion.div {...rise(1.05)} className="mt-8 flex flex-wrap items-center gap-3">
            <TrackedLink href="#planner" event="cta_click" props={{ cta: "plan", location: "hero" }}
              className="btn-primary group px-6 py-3.5">
              {c.ctaPlan} <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </TrackedLink>
            <TrackedLink href={whatsappLink(t.wa.general)} target="_blank" rel="noopener noreferrer" event="whatsapp_click" props={{ location: "hero" }}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3.5 font-semibold text-teal-deep ring-1 ring-teal/20 transition-colors hover:bg-sea-50">
              <WhatsAppIcon className="size-5 text-whatsapp" /> {c.ctaTalk}
            </TrackedLink>
          </motion.div>

          {/* proof */}
          <motion.dl {...rise(1.2)} className="mt-10 grid max-w-md grid-cols-3 divide-x divide-teal/15 rtl:divide-x-reverse">
            {c.stats.map((s, i) => (
              <div key={s.l} className={i ? "ps-5" : "pe-5"}>
                <dd className="num font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                  {reduce ? `${s.v.toLocaleString("en-US")}${s.suffix}` : <Counter v={s.v} suffix={s.suffix} delay={1.3 + i * 0.15} />}
                </dd>
                <dt className="mt-1 text-sm text-teal-deep/70">{s.l}</dt>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* the living network + the calculator */}
        <div className="relative [perspective:1400px]">
          <motion.div
            style={reduce ? undefined : { rotateX: rotX, rotateY: rotY, scale: mapScale, opacity: mapOpacity }}
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1.2, ease }}
            className="relative mx-auto aspect-[1100/850] w-full max-w-[600px] [transform-style:preserve-3d] lg:max-h-[50svh] lg:w-auto"
          >
            <div aria-hidden="true" className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(108,195,195,0.35),transparent_70%)] blur-2xl" />
            <HeroMap lang={L} lane={lane} />
            <p className="absolute bottom-1 start-2 text-[11px] text-teal-deep/60">{c.map.caption}</p>
          </motion.div>

          <motion.aside
            data-rate-card
            aria-labelledby={`${id}-q`}
            style={reduce ? undefined : { x: cardX, y: cardY }}
            initial={reduce ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.9, ease }}
            className="group/card relative z-10 mx-auto mt-3 w-full max-w-[600px] overflow-hidden rounded-3xl border border-white bg-white/85 p-5 shadow-[0_40px_80px_-30px_rgba(11,58,64,0.55)] backdrop-blur-xl"
          >
            {!reduce ? (
              <motion.span aria-hidden="true" className="pointer-events-none absolute size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(108,195,195,0.35),transparent_70%)]" style={{ left: glowX, top: glowY }} />
            ) : null}
            <div className="relative grid gap-4 sm:grid-cols-[1.1fr_1fr] sm:items-start">
              <div>
              <p id={`${id}-q`} className="font-display text-lg font-semibold">{c.quote.title}</p>
              <div role="radiogroup" aria-label={c.quote.title} className="mt-3 grid grid-cols-3 gap-1 rounded-full bg-sea-100 p-1">
                {(["intra", "inter", "sabya"] as const).map((k) => (
                  <button key={k} type="button" role="radio" aria-checked={lane === k}
                    onClick={() => { setLane(k); track("planner_step", { step: "hero_quote", value: k }); }}
                    className="relative rounded-full px-2 py-2 text-[12px] font-semibold leading-tight">
                    {lane === k ? <motion.span layoutId={`${id}-lane`} transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-0 rounded-full bg-white shadow-[0_4px_14px_-6px_rgba(11,58,64,0.5)]" /> : null}
                    <span className={`relative ${lane === k ? "text-teal-deep" : "text-teal-deep/70"}`}>{c.quote.lanes[k]}</span>
                  </button>
                ))}
              </div>

              <label htmlFor={`${id}-n`} className="mt-4 flex items-baseline justify-between text-sm text-teal-deep/80">
                {c.quote.orders}
                <output htmlFor={`${id}-n`} className="num font-display text-lg font-semibold text-teal-deep">{orders.toLocaleString("en-US")}</output>
              </label>
              <input id={`${id}-n`} type="range" min={0} max={1000} value={toSlider(orders)} dir="ltr"
                onChange={(e) => setOrders(toOrders(Number(e.target.value)))} className="est-range mt-1 w-full" />
              </div>

              <div>
              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-teal-deep p-4 text-white">
                <div>
                  <p className="text-[11px] text-white/70">{c.quote.perOrder}</p>
                  <p data-hero-rate={rate} className="num mt-0.5 font-display text-3xl font-semibold">
                    <Money cur={c.quote.cur} ar={L === "ar"} approx>{reduce ? rate : <NumberFlow value={rate} locales="en-US" />}</Money>
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-white/70">{c.quote.monthly}</p>
                  <p className="num mt-1.5 font-display text-xl font-semibold text-[#9be7b8]">
                    <Money cur={c.quote.cur} ar={L === "ar"}>{reduce ? monthly.toLocaleString("en-US") : <NumberFlow value={monthly} locales="en-US" format={{ useGrouping: true }} />}</Money>
                  </p>
                </div>
              </div>
              <TrackedLink href={wa} target="_blank" rel="noopener noreferrer" event="whatsapp_click" props={{ location: "hero_quote" }}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#0b7d36] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#086a2d]">
                <WhatsAppIcon className="size-4" /> {c.quote.cta}
              </TrackedLink>
              </div>
              <p className="text-[11px] leading-snug text-teal-deep/65 sm:col-span-2">{c.quote.note}</p>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}

function Counter({ v, suffix, delay }: { v: number; suffix: string; delay: number }) {
  const [n, setN] = useState(0);
  return (
    <motion.span onViewportEnter={() => setTimeout(() => setN(v), delay * 1000)} viewport={{ once: true }}>
      <NumberFlow value={n} suffix={suffix} locales="en-US" format={{ useGrouping: true }} />
      <span className="sr-only">{`${v.toLocaleString("en-US")}${suffix}`}</span>
    </motion.span>
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
