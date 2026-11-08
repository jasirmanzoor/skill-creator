"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/content/i18n";
import { heroCopy, type HeroLane } from "@/content/hero";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * The Kingdom on MSG's control screen: a dark console with a glowing coastline and contour echoes, a graticule
 * numbered in degrees, a dot field that heats up around the busy hub with a pulse rolling out of it, and a radar
 * sweep turning over each hub (tagged with its real coordinates). Traffic runs as comets of light in three colours:
 * parcels cyan, cash amber, returns violet; every arrival raises a beacon. A scale bar and north stay true to the
 * camera's zoom.
 * Parcels leave MSG's Riyadh hub and Sabya centre on glowing arcs and land with a delivery ping.
 * The lane chosen in the hero quote card decides which routes are live:
 *   intra → short hops inside Riyadh, Jeddah and Dammam
 *   inter → Riyadh to cities across the Kingdom
 *   sabya → Sabya to Jazan doors and north to the major cities
 *
 * One order's four stages are layered on the same map, and a camera moves between them:
 *   0 set up   → collection points and stock from abroad converge on the hub
 *   1 store    → the camera pushes into Riyadh, where the shelf fills and ships
 *   2 deliver  → line-haul between cities, then couriers to the door, proof on every drop
 *   3 settle   → cash and returns travel back to the hub and on to the seller's account
 * Nothing here is a live count: it shows how an order moves (captioned so), not today's traffic.
 */

type P = { x: number; y: number };
const LON0 = 34, LAT1 = 33, K = 50;
const W = 22 * K, H = 17 * K;
const pr = (lon: number, lat: number): P => ({ x: (lon - LON0) * K, y: (LAT1 - lat) * K });

const KSA = ([
  [34.95, 29.36], [36.5, 29.5], [38, 30.5], [37, 31.5], [39.2, 32.15], [40.4, 31.9], [42, 31.1], [44.7, 29.2], [46.4, 29.1],
  [47.4, 29], [48.4, 28.5], [48.8, 27.6], [49.6, 26.9], [50.1, 26.2], [50.2, 25.6], [50.8, 24.75], [51.6, 24.25], [52, 23],
  [55.2, 22.7], [55.7, 22], [55, 20], [52, 19], [49.1, 18.6], [47.5, 17.1], [46.4, 17.2], [45.2, 17.4], [44, 17.4], [43.2, 16.8],
  [42.78, 16.37], [42.55, 16.9], [42, 17.9], [41.2, 19.1], [40.4, 20.2], [39.6, 20.9], [39.1, 21.7], [38.9, 22.6], [38.1, 24.1],
  [37.2, 25], [36.5, 26], [35.6, 27.4], [34.6, 28.1], [34.8, 28.9],
] as [number, number][]).map(([a, b]) => pr(a, b));

const CITY: Record<string, P> = {
  riyadh: pr(46.72, 24.71), jeddah: pr(39.17, 21.54), makkah: pr(39.83, 21.42), madinah: pr(39.61, 24.47),
  dammam: pr(50.1, 26.43), abha: pr(42.51, 18.22), tabuk: pr(36.57, 28.38), hail: pr(41.69, 27.52),
  buraidah: pr(43.97, 26.33), sabya: pr(42.63, 17.15), najran: pr(44.13, 17.49), ahsa: pr(49.59, 25.38), taif: pr(40.42, 21.27),
};
const LABELLED = ["riyadh", "sabya", "jeddah", "dammam", "madinah", "tabuk", "abha", "hail"];

function inside(p: P) {
  let c = false;
  for (let i = 0, j = KSA.length - 1; i < KSA.length; j = i++) {
    const a = KSA[i], b = KSA[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}
const DOTS: P[] = [];
for (let y = 6; y < H; y += 15) for (let x = 6; x < W; x += 15) if (inside({ x, y })) DOTS.push({ x, y });

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}
type Route = { a: P; b: P; c: P; to: string; local: boolean };
const arc = (a: P, b: P, lift: number): P => {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  return { x: mx - (dy / len) * len * lift, y: my + (dx / len) * len * lift - len * 0.12 };
};
const r = rng(11);
const local = (hub: string, n: number, rad: number): Route[] =>
  Array.from({ length: n }, () => {
    const a = CITY[hub];
    const t = r() * Math.PI * 2, d = rad * (0.35 + r() * 0.65);
    const b = { x: a.x + Math.cos(t) * d, y: a.y + Math.sin(t) * d };
    return { a, b, c: arc(a, b, 0.25), to: hub, local: true };
  });
const long = (from: string, tos: string[]): Route[] => tos.map((to) => ({ a: CITY[from], b: CITY[to], c: arc(CITY[from], CITY[to], 0.18), to, local: false }));
const back = (rt: Route): Route => ({ a: rt.b, b: rt.a, c: rt.c, to: rt.to, local: rt.local });

const ROUTES: Record<HeroLane, Route[]> = {
  intra: [...local("riyadh", 9, 70), ...local("jeddah", 5, 50), ...local("dammam", 4, 45)],
  inter: long("riyadh", ["jeddah", "makkah", "madinah", "dammam", "abha", "tabuk", "hail", "buraidah", "najran", "ahsa", "taif"]),
  sabya: [...long("sabya", ["riyadh", "jeddah", "dammam", "abha", "najran", "makkah"]), ...local("sabya", 5, 40)],
};

/* ---- the four stages of one order ---- */
export const STAGE_COUNT = 4;
const HUB = CITY.riyadh;
// set up: a seller's collection points around Riyadh, and stock arriving from abroad through Jeddah
const ORIGINS: P[] = [{ x: -78, y: -36 }, { x: -30, y: -84 }, { x: 70, y: -58 }, { x: 84, y: 40 }, { x: -58, y: 62 }].map((o) => ({ x: HUB.x + o.x, y: HUB.y + o.y }));
const PICKUPS: Route[] = ORIGINS.map((o) => ({ a: o, b: HUB, c: arc(o, HUB, 0.2), to: "riyadh", local: true }));
const ABROAD_FROM: P = { x: -30, y: 470 };
const ABROAD: Route = { a: ABROAD_FROM, b: CITY.jeddah, c: arc(ABROAD_FROM, CITY.jeddah, -0.16), to: "jeddah", local: false };
const INBOUND: Route = back(long("riyadh", ["jeddah"])[0]);
// store: the shelf ships to doors around the hub
const FROM_SHELF = local("riyadh", 7, 60);
// deliver: line-haul out of both hubs, then couriers to the door in each city
const HAUL = [...ROUTES.inter, ...ROUTES.sabya.filter((x) => !x.local)];
const DOORS = (["riyadh", "jeddah", "dammam", "madinah", "abha", "makkah"] as const).flatMap((c) => local(c, 3, 34));
// settle: cash and returns come back to the hub, and the money goes on to the seller
const YOU: P = { x: HUB.x + 92, y: HUB.y - 86 };
const PAYOUT: Route = { a: HUB, b: YOU, c: arc(HUB, YOU, 0.22), to: "you", local: true };
const CASH_BACK = ROUTES.inter.map(back);

/** where the camera looks for each view: overview, then the four stages (map units, zoom) */
const CAMERA: { x: number; y: number; z: number }[] = [
  { x: W / 2, y: H / 2, z: 1 },
  { x: 470, y: 470, z: 1.16 },
  { x: HUB.x + 18, y: HUB.y - 6, z: 2.15 },
  { x: W / 2, y: 450, z: 1 },
  { x: 600, y: 440, z: 1.06 },
];

type Kind = "parcel" | "coin" | "return";
type Parcel = { route: Route; t: number; speed: number; kind: Kind; ping: boolean; then?: Route };
type Ping = { p: P; age: number; label: string; tone: Kind };

/** three kinds of traffic, three colours: parcels in MSG cyan, cash in amber, returns in violet */
const TONE: Record<Kind, { core: string; rgb: string }> = {
  parcel: { core: "#eafcff", rgb: "56,206,255" },
  coin: { core: "#fff5da", rgb: "255,190,72" },
  return: { core: "#f1ebff", rgb: "167,139,250" },
};
export const TONE_CSS: Record<Kind, string> = { parcel: "rgb(56,206,255)", coin: "rgb(255,190,72)", return: "rgb(167,139,250)" };

/** the Kingdom's centre, for the contour echoes inside the coastline */
const MID: P = KSA.reduce((a, p) => ({ x: a.x + p.x / KSA.length, y: a.y + p.y / KSA.length }), { x: 0, y: 0 });
/** 200 km in map units at the Kingdom's middle latitude (1° of longitude ≈ 101.6 km at 24° N) */
const KM200 = (200 / 101.6) * K;

/** a soft round glow, drawn once per colour and stamped wherever light is needed */
const sprites = new Map<string, HTMLCanvasElement>();
function glow(rgb: string) {
  let c = sprites.get(rgb);
  if (c) return c;
  c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, `rgba(${rgb},0.9)`);
  g.addColorStop(0.25, `rgba(${rgb},0.35)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  sprites.set(rgb, c);
  return c;
}

export default function HeroMap({ lang, lane, stage = -1 }: { lang: Locale; lane: HeroLane; stage?: number }) {
  const c = heroCopy[lang];
  const reduce = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const laneRef = useRef(lane);
  const stageRef = useRef(stage);
  const redraw = useRef<(() => void) | null>(null);
  useEffect(() => { laneRef.current = lane; }, [lane]);
  useEffect(() => { stageRef.current = stage; redraw.current?.(); }, [stage]);

  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const ar = lang === "ar";
    let view = { w: 0, h: 0, s: 1 };
    const size = () => {
      const b = cv.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(b.width * dpr);
      cv.height = Math.round(b.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      view = { w: b.width, h: b.height, s: Math.min(b.width / W, b.height / H) * 0.96 };
    };
    size();
    const ro = new ResizeObserver(() => { size(); if (reduce) frame(0); });
    ro.observe(cv);
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(cv);

    // the camera eases toward the view the current stage asks for
    const cam = { ...CAMERA[stageRef.current + 1] };
    const S = (p: P) => ({ x: view.w / 2 + (p.x - cam.x) * view.s * cam.z, y: view.h / 2 + (p.y - cam.y) * view.s * cam.z });
    const bez = (rt: Route, t: number): P => {
      const u = 1 - t;
      return { x: u * u * rt.a.x + 2 * u * t * rt.c.x + t * t * rt.b.x, y: u * u * rt.a.y + 2 * u * t * rt.c.y + t * t * rt.b.y };
    };
    const parcels: Parcel[] = [];
    const pings: Ping[] = [];
    const mix: Record<HeroLane, number> = { intra: 0, inter: 0, sabya: 0 };
    mix[laneRef.current] = 1;
    // how present each view is: overview, then the four stages
    const on = [0, 0, 0, 0, 0];
    on[stageRef.current + 1] = 1;
    let spawn = 0, spawn2 = 0, clock = 0;
    const mono = (w: number, px: number) => (ar ? `${w} ${px}px system-ui, sans-serif` : `${w} ${px}px ui-monospace, SFMono-Regular, Menlo, monospace`);
    const sans = (w: number, px: number) => `${w} ${px}px ${ar ? "system-ui" : "Inter, system-ui"}, sans-serif`;
    const up = (t: string) => (ar ? t : t.toUpperCase());
    const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
    const send = (route: Route, kind: Kind, speed: number, ping = true, then?: Route) => parcels.push({ route, t: 0, speed, kind, ping, then });
    const stamp = (rgb: string, x: number, y: number, r: number, a = 1) => {
      ctx.globalAlpha = a;
      ctx.drawImage(glow(rgb), x - r, y - r, r * 2, r * 2);
      ctx.globalAlpha = 1;
    };

    /** a route: a faint rail, and light flowing along it */
    const curve = (rt: Route, alpha: number, width: number, rgb = "0,157,248", flow = true) => {
      if (alpha < 0.01) return;
      const A = S(rt.a), B = S(rt.b), C = S(rt.c);
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.quadraticCurveTo(C.x, C.y, B.x, B.y);
      ctx.strokeStyle = `rgba(${rgb},${alpha * 0.45})`;
      ctx.lineWidth = width;
      ctx.stroke();
      if (flow && !reduce) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.setLineDash([3, 11]);
        ctx.lineDashOffset = -clock * 26;
        ctx.strokeStyle = `rgba(${rgb},${Math.min(1, alpha * 1.6)})`;
        ctx.lineWidth = width + 0.4;
        ctx.stroke();
        ctx.restore();
      }
    };
    /** a dark glass tag pinned to a point on the map, kept inside the frame */
    const pill = (text: string, at: { x: number; y: number }, alpha: number, rgb = "56,206,255", dy = -24) => {
      if (alpha < 0.02 || view.w < 300) return;
      ctx.font = sans(600, 11);
      const tw = ctx.measureText(text).width + 30;
      const x = Math.min(view.w - tw / 2 - 6, Math.max(tw / 2 + 6, at.x));
      const y = Math.min(view.h - 16, Math.max(16, at.y + dy));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(5,16,32,0.86)";
      ctx.strokeStyle = `rgba(${rgb},0.55)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x - tw / 2, y - 11, tw, 22, 6);
      ctx.fill();
      ctx.stroke();
      stamp(rgb, x - tw / 2 + 12, y, 9, alpha);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(${rgb})`;
      ctx.beginPath();
      ctx.arc(x - tw / 2 + 12, y, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e6f6ff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x + 7, y + 0.5);
      ctx.textBaseline = "alphabetic";
      ctx.globalAlpha = 1;
    };
    const coast = (k = 1) => {
      ctx.beginPath();
      KSA.forEach((p, i) => {
        const q = S({ x: MID.x + (p.x - MID.x) * k, y: MID.y + (p.y - MID.y) * k });
        if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y);
      });
      ctx.closePath();
    };
    /** a hub: a hexagon on a ticked ring, with a radar sweep turning over it */
    const hubMark = (p: P, label: string, coords: string, strength: number, sweep: boolean, phase: number, side: 1 | -1 = 1) => {
      const q = S(p);
      const zs = Math.min(1.6, Math.sqrt(cam.z));
      const R = 24 * zs;
      // the radar: a wedge of light trailing the turning beam
      if (sweep && strength > 0.05) {
        const a = clock * 1.1 + phase;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const reach = R * 3.2;
        if ("createConicGradient" in ctx) {
          const g = ctx.createConicGradient(a - 1.2, q.x, q.y);
          g.addColorStop(0, "rgba(0,157,248,0)");
          g.addColorStop(0.19, `rgba(0,190,255,${0.22 * strength})`);
          g.addColorStop(0.191, "rgba(0,157,248,0)");
          g.addColorStop(1, "rgba(0,157,248,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(q.x, q.y, reach, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.strokeStyle = `rgba(120,225,255,${0.55 * strength})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(q.x, q.y);
        ctx.lineTo(q.x + Math.cos(a) * reach, q.y + Math.sin(a) * reach);
        ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = `rgba(0,157,248,${0.18 * strength})`;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.arc(q.x, q.y, reach, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      // the ticked ring, turning slowly the other way
      ctx.save();
      ctx.translate(q.x, q.y);
      ctx.rotate(-clock * 0.25 + phase);
      ctx.strokeStyle = `rgba(120,215,255,${0.55 * strength})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 36; i++) {
        const t = (i / 36) * Math.PI * 2, long = i % 9 === 0;
        ctx.beginPath();
        ctx.moveTo(Math.cos(t) * R, Math.sin(t) * R);
        ctx.lineTo(Math.cos(t) * (R + (long ? 6 : 3)), Math.sin(t) * (R + (long ? 6 : 3)));
        ctx.stroke();
      }
      ctx.restore();
      stamp("0,180,255", q.x, q.y, 30 * zs, 0.75 * strength + 0.25);
      // the hexagon
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const t = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const x = q.x + Math.cos(t) * 8.5 * zs, y = q.y + Math.sin(t) * 8.5 * zs;
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = "#04182e";
      ctx.fill();
      ctx.strokeStyle = "#5fd6ff";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.fillStyle = "#eafcff";
      ctx.beginPath();
      ctx.arc(q.x, q.y, 2.6 * zs, 0, Math.PI * 2);
      ctx.fill();
      // its tag, on a leader line
      if (view.w > 360) {
        // the tag sits to the right (side 1) or the left (side -1) of the hub, up a short leader line
        const lx = q.x + side * (R + 10), ly = q.y - R - 6;
        ctx.strokeStyle = "rgba(95,214,255,0.6)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(q.x + side * R * 0.7, q.y - R * 0.7);
        ctx.lineTo(lx, ly);
        ctx.lineTo(lx + side * 8, ly);
        ctx.stroke();
        ctx.textAlign = side > 0 ? "left" : "right";
        const tx = lx + side * 11;
        ctx.font = mono(700, 10.5);
        ctx.fillStyle = "#eafcff";
        ctx.fillText(up(label), tx, ly + 3.5);
        ctx.font = `500 9px ui-monospace, SFMono-Regular, Menlo, monospace`;
        ctx.fillStyle = "rgba(140,210,245,0.7)";
        ctx.fillText(coords, tx, ly + 15);
      }
    };

    function frame(dt: number, real = dt) {
      clock += dt;
      const active = laneRef.current;
      const st = stageRef.current;
      // cross-fades and the camera follow real time, so a slow frame rate never leaves a stage half-faded
      const k = 1 - Math.exp(-real * 4);
      (Object.keys(mix) as HeroLane[]).forEach((l) => { mix[l] += ((l === active ? 1 : 0) - mix[l]) * k; });
      on.forEach((v, i) => { on[i] += ((i === st + 1 ? 1 : 0) - v) * k; });
      const target = CAMERA[st + 1];
      const ck = reduce ? 1 : 1 - Math.exp(-real * 2.2);
      cam.x += (target.x - cam.x) * ck;
      cam.y += (target.y - cam.y) * ck;
      cam.z += (target.z - cam.z) * ck;
      const [oView, oSetup, oStore, oDeliver, oSettle] = on;
      const zs = Math.sqrt(cam.z);
      ctx.clearRect(0, 0, view.w, view.h);

      // the graticule: every two degrees, numbered along the frame's edges
      ctx.lineWidth = 1;
      ctx.font = `500 9px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textBaseline = "middle";
      for (let lon = 34; lon <= 56; lon += 2) {
        const x = S(pr(lon, 0)).x;
        if (x < 0 || x > view.w) continue;
        ctx.strokeStyle = "rgba(90,170,230,0.07)";
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, view.h); ctx.stroke();
        if (view.w > 360) { ctx.fillStyle = "rgba(130,200,240,0.4)"; ctx.textAlign = "center"; ctx.fillText(`${lon}°E`, x, 11); }
      }
      for (let lat = 16; lat <= 34; lat += 2) {
        const y = S(pr(0, lat)).y;
        if (y < 18 || y > view.h) continue;
        ctx.strokeStyle = "rgba(90,170,230,0.07)";
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(view.w, y); ctx.stroke();
        if (view.w > 360) { ctx.fillStyle = "rgba(130,200,240,0.4)"; ctx.textAlign = "left"; ctx.fillText(`${lat}°N`, 6, y); }
      }
      ctx.textBaseline = "alphabetic";

      // the land: a deep glass fill, contour echoes inside the coast, and a coastline that glows
      const top = S({ x: 0, y: 0 }).y, bottom = S({ x: 0, y: H }).y;
      const g = ctx.createLinearGradient(0, top, 0, bottom);
      g.addColorStop(0, "rgba(0,120,220,0.16)");
      g.addColorStop(1, "rgba(0,60,140,0.08)");
      coast();
      ctx.fillStyle = g;
      ctx.fill();
      [0.9, 0.78, 0.64].forEach((kk, i) => {
        coast(kk);
        ctx.setLineDash([2, 6]);
        ctx.strokeStyle = `rgba(80,180,240,${0.16 - i * 0.04})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      ctx.setLineDash([]);
      coast();
      ctx.save();
      ctx.shadowColor = "rgba(0,170,255,0.9)";
      ctx.shadowBlur = 14;
      ctx.strokeStyle = "rgba(90,205,255,0.85)";
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.restore();

      // the dot field: brighter near the busy hub, and a pulse rolling out from it
      const hubP = st < 0 && active === "sabya" ? CITY.sabya : HUB;
      const hub = S(hubP);
      const reach = view.s * cam.z * (st === 1 ? 120 : 260);
      const wave = reduce ? -1 : ((clock % 3.4) / 3.4) * reach * 1.9;
      const dr = Math.max(0.8, view.s * 1.6 * zs);
      for (const d of DOTS) {
        const q = S(d);
        if (q.x < -4 || q.y < -4 || q.x > view.w + 4 || q.y > view.h + 4) continue;
        const dist = Math.hypot(q.x - hub.x, q.y - hub.y);
        const near = Math.max(0, 1 - dist / reach);
        const ring = wave < 0 ? 0 : Math.max(0, 1 - Math.abs(dist - wave) / 16) * (1 - wave / (reach * 1.9));
        const heat = Math.min(1, near * 0.85 + ring);
        ctx.fillStyle = `rgba(${Math.round(60 + heat * 60)},${Math.round(140 + heat * 90)},255,${0.2 + heat * 0.65})`;
        ctx.fillRect(q.x - dr, q.y - dr, dr * 2, dr * 2);
      }

      // the lane's routes (overview), the line-haul web (deliver) and the money's way home (settle)
      (Object.keys(ROUTES) as HeroLane[]).forEach((l) => {
        const a = 0.06 + mix[l] * 0.42 * oView + 0.28 * oDeliver + (l === "inter" ? 0.14 * oSettle : 0);
        for (const rt of ROUTES[l]) curve(rt, a, rt.local ? 1 : 1.3, "0,157,248", a > 0.15);
      });
      for (const rt of PICKUPS) curve(rt, 0.6 * oSetup, 1.3);
      curve(ABROAD, 0.65 * oSetup, 1.5);
      curve(INBOUND, 0.5 * oSetup, 1.3);
      for (const rt of FROM_SHELF) curve(rt, 0.4 * oStore, 1);
      for (const rt of DOORS) curve(rt, 0.3 * oDeliver, 1);
      for (const rt of CASH_BACK) curve(rt, 0.25 * oSettle, 1, TONE.coin.rgb);
      curve(PAYOUT, 0.85 * oSettle, 1.8, TONE.coin.rgb);

      // traffic for whatever is on screen now
      if (!reduce) {
        spawn -= dt;
        spawn2 -= dt;
        if (spawn <= 0) {
          if (st < 0) {
            const set = ROUTES[active];
            send(pick(set), "parcel", 0.28 + Math.random() * 0.25);
            spawn = active === "intra" ? 0.18 : 0.32;
          } else if (st === 0) {
            send(pick(PICKUPS), "parcel", 0.5 + Math.random() * 0.25, false);
            spawn = 0.34;
          } else if (st === 1) {
            send(pick(FROM_SHELF), "parcel", 0.45 + Math.random() * 0.2, false);
            spawn = 0.42;
          } else if (st === 2) {
            send(pick(HAUL), "parcel", 0.3 + Math.random() * 0.2, true, undefined);
            spawn = 0.3;
          } else {
            send(pick(CASH_BACK), "coin", 0.32 + Math.random() * 0.2, false, PAYOUT);
            spawn = 0.36;
          }
        }
        if (spawn2 <= 0) {
          if (st === 0) { send(ABROAD, "parcel", 0.36, false, INBOUND); spawn2 = 1.8; }
          else if (st === 2) { send(pick(DOORS), "parcel", 0.55 + Math.random() * 0.3, true); spawn2 = 0.14; }
          else if (st === 3) { send(pick(CASH_BACK), "return", 0.26, false); spawn2 = 1.3; }
          else spawn2 = 0.5;
        }
      }
      // each one a comet: a fading tail of light and a bright head
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      for (let i = parcels.length - 1; i >= 0; i--) {
        const pc = parcels[i];
        pc.t += dt * pc.speed * (pc.route.local ? 1.8 : 1);
        if (pc.t >= 1) {
          parcels.splice(i, 1);
          if (pc.then) parcels.push({ route: pc.then, t: 0, speed: pc.speed, kind: pc.kind, ping: pc.kind === "coin" });
          else if (pc.ping) pings.push({ p: pc.route.b, age: 0, label: pc.route.local || pc.route.to === "you" ? "" : c.cities[pc.route.to] ?? "", tone: pc.kind });
          else pings.push({ p: pc.route.b, age: 0.6, label: "", tone: pc.kind });
          continue;
        }
        const tone = TONE[pc.kind];
        const size = Math.max(0.8, view.s * 1.4) * Math.min(1.5, zs);
        let prev = S(bez(pc.route, pc.t));
        for (let j = 1; j <= 14; j++) {
          const tt = pc.t - j * 0.012;
          if (tt < 0) break;
          const q = S(bez(pc.route, tt));
          ctx.strokeStyle = `rgba(${tone.rgb},${0.7 * (1 - j / 14)})`;
          ctx.lineWidth = (3.2 - j * 0.18) * size;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
          prev = q;
        }
        const q = S(bez(pc.route, pc.t));
        ctx.drawImage(glow(tone.rgb), q.x - 13 * size, q.y - 13 * size, 26 * size, 26 * size);
        ctx.fillStyle = tone.core;
        ctx.beginPath();
        if (pc.kind === "return") ctx.rect(q.x - 2.6 * size, q.y - 2.6 * size, 5.2 * size, 5.2 * size);
        else ctx.arc(q.x, q.y, (pc.kind === "coin" ? 3 : 2.4) * size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // set up: the collection points, each a small shop
      if (oSetup > 0.02) {
        ctx.globalAlpha = oSetup;
        for (const o of ORIGINS) {
          const q = S(o);
          stamp(TONE.parcel.rgb, q.x, q.y, 14, oSetup * 0.6);
          ctx.globalAlpha = oSetup;
          ctx.fillStyle = "#04182e";
          ctx.strokeStyle = "#5fd6ff";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.roundRect(q.x - 6, q.y - 6, 12, 12, 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#5fd6ff";
          ctx.fillRect(q.x - 3, q.y - 1, 6, 1.6);
        }
        const from = S(ABROAD_FROM);
        stamp(TONE.parcel.rgb, Math.max(10, from.x), from.y, 12, oSetup);
        ctx.globalAlpha = 1;
      }

      // store: a rack beside the hub, its cells lighting as stock comes and goes
      if (oStore > 0.02) {
        const q = S(HUB);
        const cell = 11, gap = 3, cols = 6, rows = 3;
        const rw = cols * (cell + gap) - gap, rh = rows * (cell + gap) - gap;
        const x0 = Math.min(view.w - rw - 18, q.x + 40), y0 = Math.max(44, q.y - rh - 46);
        ctx.globalAlpha = oStore;
        ctx.fillStyle = "rgba(4,16,32,0.88)";
        ctx.strokeStyle = "rgba(95,214,255,0.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x0 - 9, y0 - 9, rw + 18, rh + 18, 6);
        ctx.fill();
        ctx.stroke();
        for (let i = 0; i < cols * rows; i++) {
          const cx = x0 + (i % cols) * (cell + gap), cy = y0 + Math.floor(i / cols) * (cell + gap);
          const full = (clock * 1.3 + i * 0.83) % 7 < 5.4;
          ctx.fillStyle = !full ? "rgba(95,214,255,0.12)" : i % 5 === 3 ? "rgb(255,190,72)" : "rgb(56,206,255)";
          ctx.beginPath();
          ctx.roundRect(cx, cy, cell, cell, 2);
          ctx.fill();
        }
        ctx.strokeStyle = "rgba(95,214,255,0.45)";
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(q.x, q.y);
        ctx.lineTo(x0 - 9, y0 + rh / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        pill(c.kingdom.callouts.shelf, { x: x0 + rw / 2, y: y0 }, oStore, TONE.parcel.rgb, -26);
      }

      // settle: the seller's account, glowing amber
      if (oSettle > 0.02) {
        const q = S(YOU);
        const pulse = (Math.sin(clock * 3) + 1) / 2;
        stamp(TONE.coin.rgb, q.x, q.y, 22 + pulse * 8, oSettle);
        ctx.globalAlpha = oSettle;
        ctx.strokeStyle = `rgba(255,190,72,${0.4 + pulse * 0.4})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 12 + pulse * 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#fff5da";
        ctx.beginPath();
        ctx.arc(q.x, q.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // cities: small diamonds with their names
      for (const [id, p] of Object.entries(CITY)) {
        if (id === "riyadh" || id === "sabya") continue;
        const q = S(p);
        if (q.x < -30 || q.y < -30 || q.x > view.w + 30 || q.y > view.h + 30) continue;
        stamp("90,200,255", q.x, q.y, 9, 0.55);
        ctx.fillStyle = "#d6f3ff";
        ctx.beginPath();
        ctx.moveTo(q.x, q.y - 4); ctx.lineTo(q.x + 4, q.y); ctx.lineTo(q.x, q.y + 4); ctx.lineTo(q.x - 4, q.y);
        ctx.closePath();
        ctx.fill();
        if (LABELLED.includes(id) && view.w > 360) {
          ctx.font = mono(600, 9.5);
          ctx.textAlign = "center";
          ctx.fillStyle = "rgba(190,230,250,0.72)";
          ctx.fillText(up(c.cities[id]), q.x, q.y + 16);
        }
      }
      // the two hubs
      const sab = st < 0 ? 0.35 + mix.sabya * 0.65 : 0.4;
      hubMark(CITY.sabya, c.map.sabya, "17.15°N 42.63°E", sab, st < 0 && mix.sabya > 0.3, 1.7);
      hubMark(HUB, c.map.hub, "24.71°N 46.72°E", 1, true, 0, -1);

      // arrivals: rings, and a beacon rising from the door
      for (let i = pings.length - 1; i >= 0; i--) {
        const pg = pings[i];
        pg.age += dt;
        if (pg.age > 1.8) { pings.splice(i, 1); continue; }
        const q = S(pg.p);
        const a = 1 - pg.age / 1.8;
        const rgb = TONE[pg.tone].rgb;
        ctx.strokeStyle = `rgba(${rgb},${a})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 4 + pg.age * 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(${rgb},${a * 0.5})`;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 2 + pg.age * 9, 0, Math.PI * 2);
        ctx.stroke();
        const bh = 26 * Math.min(1, pg.age * 4);
        const beam = ctx.createLinearGradient(q.x, q.y, q.x, q.y - bh);
        beam.addColorStop(0, `rgba(${rgb},${a})`);
        beam.addColorStop(1, `rgba(${rgb},0)`);
        ctx.strokeStyle = beam;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(q.x, q.y);
        ctx.lineTo(q.x, q.y - bh);
        ctx.stroke();
        if (pg.label && pg.age < 1.4 && view.w > 360) {
          const text = `✓ ${up(c.map.delivered)} · ${up(pg.label)}`;
          ctx.font = mono(700, 10);
          const tw = ctx.measureText(text).width + 18;
          const y = q.y - 38 - pg.age * 8;
          ctx.globalAlpha = Math.min(1, (1.4 - pg.age) * 2.5);
          ctx.fillStyle = "rgba(5,16,32,0.88)";
          ctx.strokeStyle = "rgba(62,240,176,0.7)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(q.x - tw / 2, y - 10, tw, 20, 5);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#7ff5c8";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, q.x, y + 0.5);
          ctx.textBaseline = "alphabetic";
          ctx.globalAlpha = 1;
        }
      }

      // what each stage is doing, pinned where it happens
      const k1 = c.kingdom.callouts;
      pill(k1.pickups, S(ORIGINS[0]), oSetup, TONE.parcel.rgb, -22);
      pill(k1.abroad, S(bez(ABROAD, 0.35)), oSetup, TONE.parcel.rgb, -20);
      pill(k1.packed, S(HUB), oSetup, TONE.parcel.rgb, 40);
      pill(k1.haul, S(bez(ROUTES.inter[2], 0.5)), oDeliver, TONE.parcel.rgb, -18);
      pill(k1.pod, S(CITY.dammam), oDeliver, "62,240,176", 30);
      pill(k1.you, S(YOU), oSettle, TONE.coin.rgb, -24);
      pill(k1.cash, S(HUB), oSettle, TONE.coin.rgb, 42);
      pill(k1.returns, S(CITY.jeddah), oSettle, TONE.return.rgb, -22);

      // the scale bar and north, true to the camera's zoom
      if (view.w > 300) {
        const len = KM200 * view.s * cam.z;
        const x1 = view.w - 16, x0 = x1 - len, y = view.h - 16;
        ctx.strokeStyle = "rgba(150,215,245,0.75)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x0, y - 4); ctx.lineTo(x0, y); ctx.lineTo(x1, y); ctx.lineTo(x1, y - 4);
        ctx.moveTo((x0 + x1) / 2, y); ctx.lineTo((x0 + x1) / 2, y - 2.5);
        ctx.stroke();
        ctx.font = `600 9px ui-monospace, SFMono-Regular, Menlo, monospace`;
        ctx.fillStyle = "rgba(170,225,250,0.85)";
        ctx.textAlign = "center";
        ctx.fillText(`200 ${c.map.hud.km}`, (x0 + x1) / 2, y - 7);
        const nx = x1 - 6, ny = y - 40;
        ctx.beginPath();
        ctx.moveTo(nx, ny - 9); ctx.lineTo(nx + 4.5, ny + 5); ctx.lineTo(nx, ny + 2); ctx.lineTo(nx - 4.5, ny + 5);
        ctx.closePath();
        ctx.fillStyle = "rgba(170,225,250,0.85)";
        ctx.fill();
        ctx.fillText("N", nx, ny - 13);
      }
    }

    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      // a frame's timestamp can precede the mount's performance.now(): never step time backwards
      const real = Math.max(0, Math.min(1, (now - last) / 1000));
      last = now;
      if (visible && !document.hidden) frame(Math.min(0.05, real), real);
      raf = requestAnimationFrame(loop);
    };
    if (reduce) {
      frame(1);
      redraw.current = () => frame(1);
    } else {
      for (let i = 0; i < 90; i++) frame(1 / 30); // open mid-flow, not empty
      raf = requestAnimationFrame(loop);
      redraw.current = null;
    }
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); redraw.current = null; };
  }, [reduce, lang, c]);

  return <canvas ref={canvas} role="img" aria-label={c.map.label} className="absolute inset-0 size-full" />;
}
