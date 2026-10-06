"use client";

import NumberFlow from "@number-flow/react";
import Image from "next/image";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { heroCopy, type HeroLane } from "@/content/hero";
import { whatsappLink } from "@/content/facts";
import type { Dictionary, Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon, WhatsAppIcon } from "../ui/icons";
import Dust from "./Dust";
import HeroMap from "./HeroMap";
import QuoteCard from "./QuoteCard";

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

/** a box with the photo's proportions that always covers the frame, keeping (ax, ay) as central as it can */
const cover = (ar: number, ax: number, ay: number): React.CSSProperties => ({
  ["--W" as string]: `max(100cqw, calc(100cqh * ${ar}))`,
  width: "var(--W)",
  height: `calc(var(--W) / ${ar})`,
  left: `clamp(calc(100cqw - var(--W)), calc(50cqw - ${ax} * var(--W)), 0px)`,
  top: `clamp(calc(100cqh - var(--W) / ${ar}), calc(50cqh - ${ay} * var(--W) / ${ar}), 0px)`,
});
const at = (p: Pt) => ({ left: `${p.x * 100}%`, top: `${p.y * 100}%` });

/** how far the camera has to push in for the doorway to fill the frame */
function doorZoom(fw: number, fh: number) {
  const W = Math.max(fw, fh * FACADE.ar), H = W / FACADE.ar;
  const left = Math.min(0, Math.max(fw - W, fw / 2 - FACADE.door.x * W));
  const top = Math.min(0, Math.max(fh - H, fh / 2 - FACADE.anchorY * H));
  const cx = left + FACADE.door.x * W, cy = top + FACADE.door.y * H;
  const zx = (2 * Math.max(cx, fw - cx)) / (FACADE.door.w * W);
  const zy = (2 * Math.max(cy, fh - cy)) / (FACADE.door.h * H);
  return Math.max(zx, zy) * 1.08;
}

/**
 * First screen: MSG's real warehouse. The facade breathes in warm light (drifting sky, a light sweep, the sign
 * glowing, deliveries flowing out of the door); scrolling walks the visitor through the doorway, the lights
 * come on inside, and the view pulls out to the network across the Kingdom. Under reduced motion the same three
 * scenes simply stack.
 */
export default function Hero({ t, lang }: { t: Dictionary; lang?: Locale }) {
  const L: Locale = lang ?? "en";
  const c = heroCopy[L];
  const reduce = useReducedMotion();
  const staged = !reduce;
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [lane, setLane] = useState<HeroLane>("intra");
  const [orders, setOrders] = useState(300);
  const [beat, setBeat] = useState(1);

  // the walk-in is driven by scroll through the (tall) section
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  // copied into a plain motion value so every layer reads the same progress (no per-layer native scroll timelines)
  const p = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    p.set(v);
    const b = v < 0.2 ? 1 : v < 0.8 ? 2 : 3;
    setBeat((x) => (x === b ? x : b));
  });

  // the header picks its colours from the section under it; tell it when the scene changes
  useEffect(() => { window.dispatchEvent(new Event("scroll")); }, [beat]);

  // pointer parallax: the sky moves more than the building
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 }), sy = useSpring(my, { stiffness: 60, damping: 18 });
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
  const inLight = useTransform(p, [0.44, 0.465, 0.48, 0.5, 0.53], ["brightness(0.06)", "brightness(0.6)", "brightness(0.22)", "brightness(0.85)", "brightness(1)"]);
  const inScale = useTransform(p, [0.43, 0.8, 0.86], [1.22, 1, 0.92]);
  const lamps = useTransform(p, [0.465, 0.49, 0.53], [0, 1, 0.8]);
  const inCopy = useTransform(p, [0.52, 0.57, 0.72, 0.78], [0, 1, 1, 0]);
  const inCopyY = useTransform(p, [0.52, 0.57], [30, 0]);

  // out to the Kingdom
  const kOpacity = useTransform(p, [0.78, 0.86], [0, 1]);
  const kMap = useTransform(p, [0.78, 0.95], [1.3, 1]);
  const kCopy = useTransform(p, [0.84, 0.9], [0, 1]);

  const facade = (
    <Facade
      c={c}
      staged={staged}
      zoom={staged ? zoom : undefined}
      fx={staged ? facadeFx : undefined}
      skyX={staged ? skyX : undefined}
      bldX={staged ? bldX : undefined}
      bldY={staged ? bldY : undefined}
    />
  );

  const promise = (
    <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 sm:px-5 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-10 lg:px-8 lg:pb-14">
      <div className="text-white">
        <p className="inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur">
          <span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-[#4cc97a]/70 motion-reduce:hidden" /><span className="relative size-2 rounded-full bg-[#4cc97a]" /></span>
          {c.live}
        </p>
        <h1 id="hero-title" className="mt-4 font-display text-[clamp(2.3rem,4.6vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-balance [text-shadow:0_2px_30px_rgba(0,0,0,0.45)] rtl:leading-[1.25] rtl:tracking-normal">
          <span className="block">{c.title[0]}</span>
          <span className="block bg-gradient-to-r from-[#b8f5cf] via-white to-[#b8f5cf] bg-[length:200%_auto] bg-clip-text text-transparent motion-safe:animate-[hero-sheen_6s_linear_infinite]">{c.title[1]}</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 text-pretty sm:text-lg">{c.lead}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <TrackedLink href="#planner" event="cta_click" props={{ cta: "plan", location: "hero" }} className="btn-primary on-dark group px-6 py-3.5">
            {c.ctaPlan} <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </TrackedLink>
          <TrackedLink href={whatsappLink(t.wa.general)} target="_blank" rel="noopener noreferrer" event="whatsapp_click" props={{ location: "hero" }}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3.5 font-semibold text-white ring-1 ring-white/30 backdrop-blur transition-colors hover:bg-white/20">
            <WhatsAppIcon className="size-5 text-[#4cc97a]" /> {c.ctaTalk}
          </TrackedLink>
        </div>
        <p className="mt-5 text-[11px] text-white/65">{c.facade.caption}</p>
      </div>
      <QuoteCard lang={L} reduce={reduce} lane={lane} onLane={setLane} orders={orders} onOrders={setOrders} className="hidden lg:block" />
    </div>
  );

  const inside = (
    <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-12 text-white sm:px-5 lg:px-8 lg:pb-16">
      <p className="text-sm font-semibold text-[#9be7b8]">{c.inside.eyebrow}</p>
      <h2 className="mt-2 max-w-2xl font-display text-[clamp(2rem,4.2vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-balance [text-shadow:0_2px_30px_rgba(0,0,0,0.5)] rtl:leading-[1.3] rtl:tracking-normal">{c.inside.title}</h2>
      <p className="mt-3 max-w-xl text-white/85 text-pretty sm:text-lg">{c.inside.lead}</p>
    </div>
  );

  const kingdom = <Kingdom c={c} lang={L} lane={lane} go={!staged || beat === 3} map={!staged || beat >= 2} reduce={reduce} />;

  if (!staged) {
    return (
      <section id="hero" ref={section} aria-labelledby="hero-title" className="relative bg-[#08262b]">
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
        <div className="relative bg-[linear-gradient(180deg,#f3fbfb,#ffffff)] py-16">{kingdom}</div>
        <div className="px-4 pb-12 pt-2 lg:hidden"><QuoteCard lang={L} reduce={reduce} lane={lane} onLane={setLane} orders={orders} onOrders={setOrders} /></div>
      </section>
    );
  }

  return (
    <>
    <section id="hero" ref={section} aria-labelledby="hero-title" className="relative h-[290svh] bg-[#08262b]">
      <div
        ref={frame}
        data-theme={beat < 3 ? "dark" : undefined}
        onPointerMove={onMove}
        onPointerLeave={() => { mx.set(0); my.set(0); }}
        className="sticky top-0 h-[100svh] overflow-hidden [container-type:size]"
      >
        {facade}
        <Dust run={beat === 1} className="z-[1]" />
        <motion.div aria-hidden="true" style={{ opacity: veil }} className="absolute inset-0 z-[2] bg-[#030a0b]" />

        <motion.div style={{ opacity: inOpacity }} className="absolute inset-0 z-[3]">
          <Interior c={c} light={inLight} scale={inScale} lamps={lamps} copy={inCopy} />
        </motion.div>

        <motion.div style={{ opacity: kOpacity }} className="absolute inset-0 z-[4] bg-[radial-gradient(90%_70%_at_80%_10%,#c4e9e7_0%,rgba(196,233,231,0)_60%),radial-gradient(70%_60%_at_0%_100%,#e2f4f3_0%,rgba(226,244,243,0)_60%),linear-gradient(180deg,#f3fbfb,#ffffff)]" />

        {/* scene copy */}
        <motion.div style={{ opacity: uiOut, y: uiY }} inert={beat !== 1} className="absolute inset-0 z-[5] pt-20">
          <Scrim />
          {promise}
        </motion.div>
        <motion.div style={{ opacity: inCopy, y: inCopyY }} className="pointer-events-none absolute inset-0 z-[5]">
          <Scrim />
          {inside}
        </motion.div>
        <motion.div style={{ opacity: kCopy }} inert={beat !== 3} className="absolute inset-0 z-[6] flex items-center pt-16">
          <motion.div style={{ scale: kMap }} className="w-full">{kingdom}</motion.div>
        </motion.div>

        <motion.p aria-hidden="true" style={{ opacity: hint }} className="pointer-events-none absolute inset-x-0 bottom-3 z-[7] hidden flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 lg:flex rtl:tracking-normal">
          {c.facade.hint}
          <span className="block h-7 w-px overflow-hidden bg-white/25"><span className="block h-3 w-px animate-[hero-drip_1.6s_ease-in-out_infinite] bg-white" /></span>
        </motion.p>
      </div>
    </section>
    {/* on phones the ten-second price follows the walk-in */}
    <div className="relative bg-white px-4 pb-12 pt-8 lg:hidden">
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
  c, staged, zoom, fx, skyX, bldX, bldY,
}: {
  c: C; staged: boolean; zoom?: MotionValue<number>; fx?: MotionValue<string>; skyX?: MotionValue<number>; bldX?: MotionValue<number>; bldY?: MotionValue<number>;
}) {
  const d = FACADE.door;
  return (
    <motion.div
      className="absolute"
      style={{ ...cover(FACADE.ar, d.x, FACADE.anchorY), scale: zoom, filter: fx, transformOrigin: `${d.x * 100}% ${d.y * 100}%` }}
    >
      <div className={`absolute inset-0 ${staged ? "motion-safe:animate-[hero-breathe_22s_ease-in-out_infinite_alternate]" : ""}`} style={{ transformOrigin: `${d.x * 100}% ${d.y * 100}%` }}>
        {/* the sky, on its own layer behind the roof */}
        <motion.div aria-hidden="true" className="absolute inset-x-0 top-0 h-[30.39%] scale-[1.06]" style={{ x: skyX }}>
          <div className="absolute inset-0 motion-safe:animate-[hero-sky_46s_ease-in-out_infinite_alternate]">
            <Image src="/media/msg/facade-sky.jpg" alt="" fill sizes="100vw" className="object-cover object-top" />
          </div>
        </motion.div>

        {/* the building */}
        <motion.div className="absolute inset-0 scale-[1.02]" style={{ x: bldX, y: bldY, clipPath: FACADE.building }}>
          <Image src="/media/msg/facade.jpg" alt={c.facade.alt} fill priority sizes="(max-aspect-ratio: 4/3) 134vh, 100vw" className="object-cover" />
          {/* light passing over the walls */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden mix-blend-soft-light">
            <div className="absolute inset-y-0 -left-1/2 w-1/2 bg-[linear-gradient(100deg,transparent_0%,rgba(255,244,214,0.75)_50%,transparent_100%)] motion-safe:animate-[hero-sweep_9s_ease-in-out_infinite]" />
          </div>
          {/* the sign, lit */}
          <div aria-hidden="true" className="absolute" style={{ left: `${FACADE.sign.x * 100}%`, top: `${FACADE.sign.y * 100}%`, width: `${FACADE.sign.w * 100}%`, height: `${FACADE.sign.h * 100}%` }}>
            <span className="absolute inset-[-40%_-12%] rounded-[40%] bg-[radial-gradient(closest-side,rgba(255,252,240,0.35),transparent)] mix-blend-screen motion-safe:animate-[hero-sign_4.5s_ease-in-out_infinite]" />
            <Image src="/media/msg/sign-glow.png" alt="" fill sizes="20vw" className="object-fill opacity-90 mix-blend-screen blur-[3px] motion-safe:animate-[hero-sign_4.5s_ease-in-out_infinite]" />
            <Image src="/media/msg/sign-glow.png" alt="" fill sizes="20vw" className="object-fill opacity-40 mix-blend-screen" />
          </div>
          {/* a lamp glimmering inside the doorway */}
          <span aria-hidden="true" className="absolute size-[3.4%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,240,0.6),rgba(255,255,240,0))] mix-blend-screen motion-safe:animate-[hero-lamp_3.2s_ease-in-out_infinite]" style={at(FACADE.lamp)} />
          {/* deliveries leaving the door */}
          <svg aria-hidden="true" viewBox="0 0 1448 1086" preserveAspectRatio="none" className="absolute inset-0 size-full">
            <defs>
              <radialGradient id="hero-threshold"><stop offset="0" stopColor="#4cc97a" stopOpacity="0.55" /><stop offset="1" stopColor="#4cc97a" stopOpacity="0" /></radialGradient>
            </defs>
            <ellipse cx="630" cy="700" rx="240" ry="34" fill="url(#hero-threshold)" className="motion-safe:animate-[hero-lamp_3.2s_ease-in-out_infinite]" />
            {ROUTES.map((d, i) => (
              <g key={i}>
                <path d={d} fill="none" stroke="#4cc97a" strokeOpacity="0.25" strokeWidth="9" strokeLinecap="round" />
                <path d={d} fill="none" stroke="#b8f5cf" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 22" className={staged ? "motion-safe:animate-[hero-flow_1.4s_linear_infinite]" : ""} />
                {staged ? (
                  <circle r="7" fill="#eafff1" className="motion-reduce:hidden" style={{ filter: "drop-shadow(0 0 8px #4cc97a)" }}>
                    <animateMotion dur={`${3.2 + i * 0.6}s`} begin={`${i * 0.9}s`} repeatCount="indefinite" path={d} />
                  </circle>
                ) : null}
              </g>
            ))}
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}

const ROUTES = [
  "M630 702 C 520 738 300 762 -40 792",
  "M630 702 C 760 738 1040 766 1490 792",
  "M630 702 C 640 800 600 930 560 1120",
];

function Interior({
  c, light, scale, lamps, copy,
}: {
  c: C; light?: MotionValue<string>; scale?: MotionValue<number>; lamps?: MotionValue<number>; copy?: MotionValue<number>;
}) {
  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ scale }}>
      {([["hidden landscape:block", INSIDE_WIDE], ["hidden portrait:block", INSIDE_TALL]] as const).map(([vis, v]) => (
        <div key={v.src} className={`absolute inset-0 ${vis}`}>
          <motion.div className="absolute" style={{ ...cover(v.ar, 0.5, 0.5), filter: light }}>
            <Image src={v.src} alt={c.inside.alt} fill sizes="(max-aspect-ratio: 4/3) 134vh, 100vw" className="object-cover" />
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
                    <span className="absolute inset-0 rounded-full bg-[#4cc97a]/50 motion-safe:animate-ping" />
                    <span className="relative size-2.5 rounded-full bg-[#4cc97a] ring-2 ring-white" />
                  </span>
                  <span dir="auto" className="whitespace-nowrap rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur">{c.inside.spots[k]}</span>
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      ))}
    </motion.div>
  );
}

function Kingdom({ c, lang, lane, go, map, reduce }: { c: C; lang: Locale; lane: HeroLane; go: boolean; map: boolean; reduce: boolean }) {
  return (
    <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 text-teal-deep sm:px-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:px-8">
      <div className="order-2 lg:order-1">
        <p className="text-sm font-semibold text-teal">{c.kingdom.eyebrow}</p>
        <h2 className="mt-2 font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-balance rtl:leading-[1.3] rtl:tracking-normal">{c.kingdom.title}</h2>
        <p className="mt-3 max-w-lg text-teal-deep/80 text-pretty sm:text-lg">{c.kingdom.lead}</p>
        <dl className="mt-6 grid max-w-md grid-cols-3 divide-x divide-teal/15 rtl:divide-x-reverse">
          {c.stats.map((s, i) => (
            <div key={s.l} className={i ? "ps-5" : "pe-5"}>
              <dd className="num font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                {reduce ? `${s.v.toLocaleString("en-US")}${s.suffix}` : <Counter v={s.v} suffix={s.suffix} go={go} delay={i * 0.15} />}
              </dd>
              <dt className="mt-1 text-sm text-teal-deep/70">{s.l}</dt>
            </div>
          ))}
        </dl>
        <TrackedLink href="#planner" event="cta_click" props={{ cta: "plan", location: "hero_kingdom" }} className="btn-primary group mt-7 inline-flex px-6 py-3.5">
          {c.ctaPlan} <ArrowIcon className="size-4 rtl:rotate-180" />
        </TrackedLink>
      </div>
      <div className="relative order-1 mx-auto aspect-[1100/850] w-full max-w-[640px] lg:order-2 lg:w-[min(100%,calc(62svh*1100/850))]">
        <div aria-hidden="true" className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(108,195,195,0.35),transparent_70%)] blur-2xl" />
        {map ? <HeroMap lang={lang} lane={lane} /> : null}
        <p className="absolute bottom-1 start-2 text-[11px] text-teal-deep/60">{c.map.caption}</p>
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
