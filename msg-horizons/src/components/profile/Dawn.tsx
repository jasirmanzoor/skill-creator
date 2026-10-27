"use client";

import { useEffect, useRef, useState } from "react";
import type { ProfileCopy } from "@/content/profile";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { clamp, easeInOutCubic, easeOutCubic, isFilm, lerp, onFrame, pinProgress, range } from "./engine";

/**
 * The dawn: HORIZONS, after the template's Earthrise. Seven layers share one 1920 × 1080 stage, stacked and pinned,
 * and one scroll range moves each at its own rate:
 *
 *   0.00 – 0.18  desert dust drifts off the lens
 *   0.04 – 0.50  the sun climbs out from behind the Riyadh skyline
 *   0.08 – 0.50  HORIZONS resolves above the city
 *   0.22 – 0.55  an MSG van rolls up to the door
 *   0.28 – 0.60  the hub's open roller door closes in around the view (you're inside, looking out) and the floor rises
 *   0.70 – 1.00  everything tilts away upward and the floor swallows the frame to black, where the page continues
 *
 * The sky is a photograph; the skyline, the hub and the floor are drawn here, so they stay sharp at every size. A
 * thin HUD rides on top: Riyadh time, the sun's height, the couriers on the network, the headquarters' coordinates.
 */

const STAGE_VH = 440;
const W = 1920;
const H = 1080;
/** the city's ground line, the yard beyond the door, and the door's threshold */
const BASE = 860;
const SILL = 905;

type LayerName = "sky" | "sun" | "skyline" | "van" | "frame" | "ground";

/** a seeded run of low blocks along the base line, for the hazy depth of the city */
function blocks(seed: number, min: number, max: number, from = 0, to = W) {
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  let x = from;
  let d = `M${from} ${BASE}`;
  while (x < to) {
    const w = 18 + r() * 46;
    const h = min + r() * (max - min);
    d += ` V${(BASE - h).toFixed(1)} H${Math.min(to, x + w).toFixed(1)}`;
    x += w;
  }
  return `${d} V${BASE} Z`;
}

const FAR = blocks(7, 14, 54);
const NEAR = blocks(31, 22, 86);

/** Riyadh's landmarks, near enough to read: Kingdom Centre, Al Faisaliah, the TV tower and the KAFD towers. */
const KINGDOM = "M1043 860 C1040 700 1052 600 1062 530 Q1085 750 1108 530 C1118 600 1130 700 1127 860 Z";
const KINGDOM_BRIDGE = "M1067 585 Q1085 592 1103 585 L1103 591 Q1085 598 1067 591 Z";
const FAISALIAH = "M798 860 L835 588 L872 860 Z";
const TOWERS: [number, number, number, number][] = [
  // x, width, height, slant (how far the roof rises to one side)
  [1250, 40, 190, 18], [1298, 54, 252, 30], [1362, 34, 160, 0], [1404, 52, 318, 40], [1466, 40, 214, 16], [1518, 30, 140, 0],
  [372, 44, 142, 0], [440, 30, 182, 14], [516, 50, 122, 0], [598, 34, 164, 10], [660, 46, 108, 0],
];
const towerPath = ([x, w, h, s]: [number, number, number, number]) =>
  `M${x} ${BASE} V${BASE - h + s} L${x + w} ${BASE - h} V${BASE} Z`;

export function Skyline() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden="true">
      <defs>
        <linearGradient id="dw-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b2340" />
          <stop offset="1" stopColor="#353654" />
        </linearGradient>
        <linearGradient id="dw-yard" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2f38" />
          <stop offset="1" stopColor="#15131d" />
        </linearGradient>
        <radialGradient id="dw-sphere">
          <stop offset="0" stopColor="#ffe2a8" />
          <stop offset="1" stopColor="#d98a4a" />
        </radialGradient>
      </defs>
      <path d={FAR} fill="#6b5f7c" opacity="0.45" transform="translate(0 -6)" />
      <path d={NEAR} fill="url(#dw-near)" opacity="0.9" />
      {TOWERS.map((t) => (
        <path key={t[0]} d={towerPath(t)} fill="url(#dw-near)" />
      ))}
      {/* the TV tower: a needle with its pod */}
      <rect x="246" y="610" width="7" height="250" fill="url(#dw-near)" />
      <ellipse cx="249.5" cy="652" rx="16" ry="11" fill="url(#dw-near)" />
      <rect x="248.5" y="560" width="2" height="52" fill="#1b2340" />
      <path d={FAISALIAH} fill="url(#dw-near)" />
      <rect x="834" y="540" width="2" height="50" fill="#1b2340" />
      <circle cx="835" cy="652" r="12" fill="url(#dw-sphere)" />
      <path d={KINGDOM} fill="url(#dw-near)" />
      <path d={KINGDOM_BRIDGE} fill="url(#dw-near)" />
      {/* the yard beyond the door: dust catching the first light */}
      <rect x="0" y={BASE} width={W} height={H - BASE} fill="url(#dw-yard)" />
      <rect x="0" y={BASE} width={W} height="2" fill="#f2b27a" opacity="0.35" />
    </svg>
  );
}

export function Sun() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden="true">
      <defs>
        <radialGradient id="dw-glow">
          <stop offset="0" stopColor="#ffe9c2" stopOpacity="0.95" />
          <stop offset="0.12" stopColor="#ffc98a" stopOpacity="0.5" />
          <stop offset="0.4" stopColor="#ff9f5a" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ff8a3d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="dw-disc">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="0.7" stopColor="#ffe6b5" />
          <stop offset="1" stopColor="#ffc777" />
        </radialGradient>
      </defs>
      <circle cx="960" cy="600" r="620" fill="url(#dw-glow)" />
      <ellipse cx="960" cy="600" rx="520" ry="10" fill="#ffd9a0" opacity="0.28" />
      <circle cx="960" cy="600" r="60" fill="url(#dw-disc)" />
    </svg>
  );
}

/** The opening of the hub's roller door for a stage `vis` units wide (narrower on phones, so the door still frames the view). */
const opening = (vis: number) => {
  const w = Math.min(880, vis * 0.74);
  const top = vis < 1000 ? 236 : 200;
  return { x0: 960 - w / 2, x1: 960 + w / 2, top, w };
};

function Frame({ vis }: { vis: number }) {
  const o = opening(vis);
  const racks = (side: -1 | 1) => {
    const edge = side < 0 ? o.x0 - 40 : o.x1 + 40;
    const ups = [edge + side * 70, edge + side * 290, edge + side * 510];
    return (
      <g fill="#0c1222">
        {ups.map((x) => <rect key={x} x={x - 6} y="300" width="12" height={SILL - 300} />)}
        {[430, 640, 850].map((y) => (
          <rect key={y} x={Math.min(ups[0], ups[2]) - 6} y={y} width={Math.abs(ups[2] - ups[0]) + 12} height="10" />
        ))}
        {[430, 640].map((y, i) =>
          [0, 1, 2, 3].map((k) => {
            const x = Math.min(ups[0], ups[2]) + 14 + k * 110 + (i ? 30 : 0);
            const h = 60 + ((k * 37 + i * 19) % 50);
            return (
              <g key={`${y}-${k}`}>
                <rect x={x} y={y - h} width="92" height={h} fill="#0a0f1c" />
                <rect x={x} y={y - h} width="92" height="1.5" fill="#26314c" />
              </g>
            );
          }),
        )}
      </g>
    );
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden="true">
      <defs>
        <radialGradient id="dw-bay">
          <stop offset="0" stopColor="#cfe4ff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#cfe4ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="dw-warm" cx="960" cy={SILL} r="1000" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f3a86b" stopOpacity="0.16" />
          <stop offset="0.55" stopColor="#7d5a6a" stopOpacity="0.06" />
          <stop offset="1" stopColor="#05070c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dw-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4b77f" stopOpacity="0.15" />
          <stop offset="1" stopColor="#f4b77f" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <path fillRule="evenodd" fill="#070b16" d={`M0 0H${W}V${H}H0Z M${o.x0} ${o.top}V${SILL}H${o.x1}V${o.top}Z`} />
      <path fillRule="evenodd" fill="url(#dw-warm)" d={`M0 0H${W}V${H}H0Z M${o.x0} ${o.top}V${SILL}H${o.x1}V${o.top}Z`} />
      {/* the roof: a truss, picked out by the dawn */}
      <g stroke="#192239" strokeWidth="3" fill="none">
        <path d={`M0 46H${W}M0 124H${W}`} />
        {Array.from({ length: 17 }, (_, i) => i * 120).map((x) => (
          <path key={x} d={`M${x} 46V124M${x} 124L${x + 120} 46`} />
        ))}
      </g>
      {[300, 700, 1220, 1620].map((x) => (
        <g key={x}>
          <circle cx={x} cy="150" r="70" fill="url(#dw-bay)" />
          <ellipse cx={x} cy="146" rx="22" ry="6" fill="#dcebff" opacity="0.85" />
        </g>
      ))}
      {racks(-1)}
      {racks(1)}
      {/* the shutter, rolled up into its box */}
      <rect x={o.x0 - 34} y={o.top - 60} width={o.w + 68} height="60" fill="#0c1322" />
      {[14, 28, 42].map((y) => <rect key={y} x={o.x0 - 34} y={o.top - 60 + y} width={o.w + 68} height="1.5" fill="#1a243c" />)}
      <rect x={o.x0} y={o.top} width={o.w} height="18" fill="#0e1626" />
      {[6, 12].map((y) => <rect key={y} x={o.x0} y={o.top + y} width={o.w} height="1" fill="#1d2840" />)}
      {/* the guides either side, with the light spilling round their inner edge */}
      <rect x={o.x0 - 20} y={o.top - 2} width="20" height={SILL - o.top + 2} fill="#0f1728" />
      <rect x={o.x1} y={o.top - 2} width="20" height={SILL - o.top + 2} fill="#0f1728" />
      <rect x={o.x0 - 2} y={o.top + 18} width="2" height={SILL - o.top - 18} fill="url(#dw-rim)" />
      <rect x={o.x1} y={o.top + 18} width="2" height={SILL - o.top - 18} fill="url(#dw-rim)" />
    </svg>
  );
}

function Ground({ vis }: { vis: number }) {
  const o = opening(vis);
  const px = vis < 1000 ? o.x0 - 60 : o.x0 + 40;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden="true">
      <defs>
        <linearGradient id="dw-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d1424" />
          <stop offset="1" stopColor="#05070c" />
        </linearGradient>
        <linearGradient id="dw-spill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3a86b" stopOpacity="0.3" />
          <stop offset="1" stopColor="#f3a86b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y={SILL} width={W} height={H - SILL} fill="url(#dw-floor)" />
      <path d={`M${o.x0} ${SILL}H${o.x1}L${o.x1 + 280} ${H}H${o.x0 - 280}Z`} fill="url(#dw-spill)" />
      <rect x={o.x0} y={SILL - 2} width={o.w} height="3" fill="#f6c38f" opacity="0.75" />
      <path d={`M955 ${SILL}H965L986 ${H}H934Z`} fill="#d8a13a" opacity="0.5" />
      {/* a pallet of the day's parcels, and its jack, just inside the door */}
      <g transform={`translate(${px} 0)`}>
        <rect x="0" y="1046" width="226" height="16" fill="#0a0f1b" />
        <rect x="8" y="956" width="104" height="90" fill="#0b111f" />
        <rect x="116" y="976" width="102" height="70" fill="#0b111f" />
        <rect x="30" y="884" width="92" height="72" fill="#0b111f" />
        {[[8, 956, 104, 90], [116, 976, 102, 70], [30, 884, 92, 72]].map(([x, y, w, h]) => (
          <g key={x}>
            <rect x={x} y={y} width={w} height="2" fill="#f2b27a" opacity="0.55" />
            <rect x={x + w - 2} y={y} width="2" height={h} fill="#f2b27a" opacity="0.28" />
            <rect x={x} y={y + h * 0.42} width={w} height="10" fill="#141c2e" />
          </g>
        ))}
        <rect x="0" y="1046" width="226" height="2" fill="#f2b27a" opacity="0.4" />
        <path d="M226 1052 L282 936" stroke="#0b111f" strokeWidth="9" strokeLinecap="round" />
        <path d="M268 930 Q282 912 296 930" stroke="#0b111f" strokeWidth="8" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

type Mote = { x: number; y: number; r: number; s: number; a: number };

export default function Dawn({ c, lang }: { c: ProfileCopy; lang: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const layerRefs = useRef<Partial<Record<LayerName, HTMLDivElement>>>({});
  const vanRef = useRef<SVGGElement>(null);
  const vanImgRef = useRef<SVGImageElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLParagraphElement>(null);
  const elevRef = useRef<HTMLSpanElement>(null);
  const crewRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  // how many stage units are on screen across (the stage is cropped to fill, so phones see a narrow slice)
  const [vis, setVis] = useState(W);
  useEffect(() => {
    const sync = () => setVis(Math.min(W, (H * window.innerWidth) / Math.max(1, window.innerHeight)));
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);
  const o = opening(vis);
  const vanW = Math.min(430, o.w * 0.62);
  const vanH = vanW * (368 / 670);
  const vanX = o.x1 + 36 - vanW; // the cut end of the photo tucks behind the right-hand guide
  const visRef = useRef(vis);
  useEffect(() => {
    visRef.current = vis;
  }, [vis]);

  useEffect(() => {
    const c = dustRef.current!;
    const sync = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = dustRef.current!;
    const ctx = canvas.getContext("2d")!;
    let seed = 11;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const motes: Mote[] = Array.from({ length: 150 }, () => ({ x: rand(), y: rand(), r: 0.4 + rand() * 1.7, s: 0.3 + rand(), a: 0.2 + rand() * 0.6 }));
    let lastP = -1;
    let lastTime = 0;
    const film = isFilm();
    const riyadh = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Riyadh", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    let lastClock = "";

    const set = (name: LayerName, y: number, scale = 1, opacity = 1) => {
      const el = layerRefs.current[name];
      if (!el) return;
      el.style.transform = `translate3d(0, ${y}vh, 0) scale(${scale})`;
      el.style.opacity = String(opacity);
    };

    return onFrame((time) => {
      const dt = lastTime ? Math.min(0.1, (time - lastTime) / 1000) : 1 / 60;
      lastTime = time;
      const root = rootRef.current;
      if (!root) return;
      const { p, rect } = pinProgress(root);
      if (rect.bottom < 0) return;

      // the clock is Riyadh's own (in the film, a fixed dawn that runs with the scroll)
      const clock = film ? `05:${String(41 + Math.floor(p * 14)).padStart(2, "0")}:${String(Math.floor((p * 840) % 60)).padStart(2, "0")}` : riyadh.format(new Date());
      if (clock !== lastClock && clockRef.current) {
        clockRef.current.textContent = clock;
        lastClock = clock;
      }

      // the dust drifts every frame while it is on screen
      const veil = 1 - range(p, 0, 0.18);
      if (veil > 0.001) {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const dpr = canvas.width / Math.max(1, w);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#f3dcc0";
        for (const m of motes) {
          if (!reducedRef.current) {
            m.x += 0.006 * m.s * dt;
            m.y -= 0.004 * m.s * dt;
            if (m.x > 1) m.x -= 1;
            if (m.y < 0) m.y += 1;
          }
          ctx.globalAlpha = m.a * veil;
          ctx.beginPath();
          ctx.arc(m.x * w, (m.y - p * 0.6) * h, m.r * (1 + p * 4), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const exit = range(p, 0.7, 1);
      const settle = easeOutCubic(range(p, 0, 0.5));

      veilRef.current!.style.opacity = String(veil);
      const words = veilRef.current!.firstElementChild as HTMLElement | null;
      if (words) words.style.opacity = String(1 - range(p, 0, 0.07));
      veilRef.current!.style.transform = `translate3d(0, ${-range(p, 0, 0.18) * 24}vh, 0) scale(${1 + range(p, 0, 0.18) * 0.25})`;
      canvas.style.opacity = String(veil);

      // far → near, each faster than the one behind it
      set("sky", lerp(0, -6, p), lerp(1.14, 1, settle));
      const rise = easeOutCubic(range(p, 0.04, 0.5));
      set("sun", lerp(36, 0, rise) - exit * 14, lerp(0.9, 1, rise));
      set("skyline", lerp(9, 0, settle) - exit * 26);
      set("van", lerp(9, 0, settle) - exit * 30);
      const drive = easeInOutCubic(range(p, 0.22, 0.55));
      vanRef.current?.setAttribute("transform", `translate(${((1 - drive) * 680).toFixed(1)} 0)`);
      if (vanImgRef.current) vanImgRef.current.style.filter = `brightness(${(0.42 + rise * 0.3).toFixed(3)}) saturate(0.85)`;
      const rim = easeOutCubic(range(p, 0.28, 0.58));
      set("frame", -exit * 44, lerp(1.7, 1, rim), rim);
      const ground = easeOutCubic(range(p, 0.34, 0.6));
      set("ground", lerp(36, 0, ground) - exit * 78);

      // the title resolves (its tracking closes in), then yields to the door
      const tIn = easeOutCubic(range(p, 0.08, 0.24));
      const tOut = range(p, 0.42, 0.52);
      const title = titleRef.current!;
      title.style.opacity = String(tIn * (1 - tOut));
      title.style.letterSpacing = `${lerp(0.62, 0.26, tIn)}em`;
      title.style.transform = `translate3d(0, ${-p * 6}vh, 0)`;
      title.style.filter = tIn < 0.99 ? `blur(${(1 - tIn) * 10}px)` : "";

      hudRef.current!.style.opacity = String(range(p, 0.02, 0.1) * (1 - range(p, 0.62, 0.72)));
      elevRef.current!.textContent = `${(rise * 14.2).toFixed(1)}°`;
      crewRef.current!.textContent = `${Math.round(clamp(rise * 1.05) * 1000).toLocaleString("en-US")}${rise > 0.95 ? "+" : ""}`;
    });
  }, []);

  const layer = (name: LayerName, children: React.ReactNode, extra = "") => (
    <div
      key={name}
      ref={(el) => {
        if (el) layerRefs.current[name] = el;
      }}
      className={`absolute inset-0 will-change-transform ${extra}`}
    >
      {children}
      {name === "ground" && <div className="absolute inset-x-0 top-full h-[110vh] bg-[#05070c]" />}
    </div>
  );

  return (
    <section id="top" ref={rootRef} aria-label={c.hero.kicker} className="relative" style={{ height: `${STAGE_VH}svh` }} dir="ltr">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#05070c]">
        {layer(
          "sky",
          <picture>
            <source media="(max-width: 767px)" srcSet="/media/profile/sky-m.webp" />
            <img src="/media/profile/sky.webp" alt="" aria-hidden="true" className="absolute inset-x-0 top-[-16%] h-[104%] w-full object-cover object-bottom" fetchPriority="high" decoding="async" />
          </picture>,
        )}
        {layer("sun", <Sun />, "origin-[50%_56%]")}
        {layer("skyline", <Skyline />)}
        {layer(
          "van",
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden="true">
            <defs>
              <radialGradient id="dw-shadow">
                <stop offset="0" stopColor="#000" stopOpacity="0.55" />
                <stop offset="1" stopColor="#000" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g ref={vanRef} transform="translate(680 0)">
              <ellipse cx={vanX + vanW * 0.5} cy={SILL - 6} rx={vanW * 0.58} ry="14" fill="url(#dw-shadow)" />
              <image ref={vanImgRef} href="/media/profile/van.webp" x={vanX} y={SILL - 4 - vanH} width={vanW} height={vanH} preserveAspectRatio="xMidYMax meet" style={{ filter: "brightness(0.42) saturate(0.85)" }} />
            </g>
          </svg>,
        )}

        {/* the title sits above the city, under the door */}
        <div ref={titleRef} className="pointer-events-none absolute inset-x-0 top-[22%] text-center md:top-[24%]" style={{ opacity: 0 }}>
          <h1 className="font-display text-[clamp(2.4rem,9vw,9.5rem)] font-semibold leading-none text-white [text-shadow:0_6px_50px_rgb(20_10_0/0.45)]" style={{ marginRight: "-0.26em" }}>
            <span aria-hidden="true">{c.hero.title}</span>
            <span className="sr-only">MSG Horizons</span>
          </h1>
          <p className="mt-5 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-white/80 rtl:tracking-normal" dir={lang === "ar" ? "rtl" : "ltr"}>
            {c.hero.kicker}
          </p>
        </div>

        {layer("frame", <Frame vis={vis} />, "origin-[50%_51%]")}
        {layer("ground", <Ground vis={vis} />)}

        {/* desert dust on the lens */}
        <div
          ref={veilRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 30% 40%, rgba(214,180,140,0.5), transparent 70%), radial-gradient(50% 60% at 75% 60%, rgba(160,130,110,0.45), transparent 70%), radial-gradient(80% 80% at 50% 50%, rgba(28,24,30,0.86), rgba(5,7,12,0.96))",
          }}
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center" dir={lang === "ar" ? "rtl" : "ltr"}>
            {/* eslint-disable-next-line @next/next/no-img-element -- the brand mark, already sized */}
            <img src="/brand/msg-mark-white.svg" alt="" className="mx-auto h-9 w-auto opacity-90" />
            <p className="mt-5 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-white/75 rtl:tracking-normal">{c.hero.kicker}</p>
            <p className="mt-3 font-display text-[0.8125rem] font-semibold uppercase tracking-[0.5em] text-white/90 rtl:tracking-normal">{c.hero.dust}</p>
            <span aria-hidden="true" className="mt-6 inline-block animate-bounce text-white/70 motion-reduce:animate-none">↓</span>
          </div>
        </div>
        <canvas ref={dustRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />

        {/* the HUD */}
        <div ref={hudRef} aria-hidden="true" className="pointer-events-none absolute inset-4 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-white/75 sm:inset-6 md:text-[0.6875rem]" style={{ opacity: 0 }}>
          <div className="pf-brackets absolute inset-0 text-white/35" />
          <div className="absolute left-3 top-16 space-y-1 md:left-4 md:top-20">
            <p ref={clockRef} className="tabular-nums">--:--:--</p>
            <p className="text-white/50">{c.hero.clockLabel}</p>
          </div>
          <div className="absolute right-3 top-16 space-y-1 text-right md:right-4 md:top-20">
            <p>
              {c.hero.sunLabel} <span ref={elevRef} className="text-[#ffc777]">0.0°</span>
            </p>
            <p className="text-white/50">{c.hero.sunUnit}</p>
          </div>
          <div className="absolute bottom-3 left-3 space-y-1 md:bottom-4 md:left-4">
            <p>
              <span ref={crewRef} className="text-[#7fcbfb] tabular-nums">0</span> · {c.hero.crewLabel}
            </p>
            <p className="text-white/50">{c.hero.site}</p>
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-2 md:bottom-4 md:right-4">
            {c.hero.scroll} <span className="inline-block animate-bounce motion-reduce:animate-none">↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
