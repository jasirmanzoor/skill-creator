"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/content/i18n";
import { heroCopy, type HeroLane } from "@/content/hero";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * The Kingdom as a living dot-matrix map (Stripe-globe style, in Red Sea glass colours).
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
 * Illustrative only (captioned as such); nothing here is a live count.
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

const TONE: Record<Kind, { fill: string; glow: string; trail: string }> = {
  parcel: { fill: "#0b7d36", glow: "rgba(76,201,122,0.9)", trail: "11,125,54" },
  coin: { fill: "#c9962e", glow: "rgba(232,190,96,0.95)", trail: "201,150,46" },
  return: { fill: "#137179", glow: "rgba(108,195,195,0.9)", trail: "19,113,121" },
};

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
    const font = (w: number, px: number) => `${w} ${px}px ${lang === "ar" ? "system-ui" : "Inter, system-ui"}, sans-serif`;
    const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
    const send = (route: Route, kind: Kind, speed: number, ping = true, then?: Route) => parcels.push({ route, t: 0, speed, kind, ping, then });

    const curve = (rt: Route, alpha: number, width: number, dash: number[] = [], color = "19,113,121") => {
      if (alpha < 0.01) return;
      const A = S(rt.a), B = S(rt.b), C = S(rt.c);
      ctx.strokeStyle = `rgba(${color},${alpha})`;
      ctx.lineWidth = width;
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.quadraticCurveTo(C.x, C.y, B.x, B.y);
      ctx.stroke();
      ctx.setLineDash([]);
    };
    /** a white label pill pinned to a point on the map, kept inside the frame */
    const pill = (text: string, at: { x: number; y: number }, alpha: number, dot = "#137179", dy = -24) => {
      if (alpha < 0.02 || view.w < 300) return;
      ctx.font = font(600, 11);
      const tw = ctx.measureText(text).width + 30;
      const x = Math.min(view.w - tw / 2 - 6, Math.max(tw / 2 + 6, at.x));
      const y = Math.min(view.h - 16, Math.max(16, at.y + dy));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.shadowColor = "rgba(11,58,64,0.22)";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(x - tw / 2, y - 11, tw, 22, 11);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = dot;
      ctx.beginPath();
      ctx.arc(x - tw / 2 + 12, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0b3a40";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x + 7, y + 0.5);
      ctx.textBaseline = "alphabetic";
      ctx.globalAlpha = 1;
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

      // the land: soft fill, outline, dot matrix
      ctx.save();
      ctx.beginPath();
      KSA.forEach((p, i) => { const q = S(p); if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); });
      ctx.closePath();
      const top = S({ x: 0, y: 0 }).y, bottom = S({ x: 0, y: H }).y;
      const g = ctx.createLinearGradient(0, top, 0, bottom);
      g.addColorStop(0, "rgba(196,233,231,0.55)");
      g.addColorStop(1, "rgba(226,244,243,0.25)");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "rgba(19,113,121,0.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
      const hub = S(st < 0 && active === "sabya" ? CITY.sabya : HUB);
      const reach = view.s * cam.z * (st === 1 ? 120 : 260);
      for (const d of DOTS) {
        const q = S(d);
        if (q.x < -4 || q.y < -4 || q.x > view.w + 4 || q.y > view.h + 4) continue;
        const near = Math.max(0, 1 - Math.hypot(q.x - hub.x, q.y - hub.y) / reach);
        ctx.fillStyle = `rgba(19,113,121,${0.16 + near * 0.32})`;
        ctx.beginPath();
        ctx.arc(q.x, q.y, Math.max(0.9, view.s * 1.9 * zs), 0, Math.PI * 2);
        ctx.fill();
      }

      // the lane's routes (overview), the line-haul web (deliver) and the money's way home (settle)
      (Object.keys(ROUTES) as HeroLane[]).forEach((l) => {
        const a = 0.05 + mix[l] * 0.3 * oView + 0.22 * oDeliver + (l === "inter" ? 0.12 * oSettle : 0);
        for (const rt of ROUTES[l]) curve(rt, a, rt.local ? 1 : 1.4, rt.local ? [] : [3, 5]);
      });
      for (const rt of PICKUPS) curve(rt, 0.5 * oSetup, 1.4, [2, 4]);
      curve(ABROAD, 0.55 * oSetup, 1.6, [5, 5]);
      curve(INBOUND, 0.4 * oSetup, 1.4, [3, 5]);
      for (const rt of FROM_SHELF) curve(rt, 0.3 * oStore, 1);
      for (const rt of DOORS) curve(rt, 0.22 * oDeliver, 1);
      curve(PAYOUT, 0.7 * oSettle, 2, [4, 4], "201,150,46");

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
        const size = Math.max(0.7, view.s * 1.4) * Math.min(1.5, zs);
        for (let j = 0; j < 10; j++) {
          const tt = pc.t - j * 0.018;
          if (tt < 0) break;
          const q = S(bez(pc.route, tt));
          ctx.fillStyle = `rgba(${tone.trail},${0.5 * (1 - j / 10)})`;
          ctx.beginPath();
          ctx.arc(q.x, q.y, (2.6 - j * 0.2) * size, 0, Math.PI * 2);
          ctx.fill();
        }
        const q = S(bez(pc.route, pc.t));
        ctx.shadowColor = tone.glow;
        ctx.shadowBlur = 12;
        ctx.fillStyle = tone.fill;
        ctx.beginPath();
        if (pc.kind === "return") ctx.roundRect(q.x - 3.6 * size, q.y - 3.6 * size, 7.2 * size, 7.2 * size, 1.6 * size);
        else ctx.arc(q.x, q.y, (pc.kind === "coin" ? 4 : 3.4) * size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (pc.kind === "coin") {
          ctx.strokeStyle = "rgba(255,240,200,0.9)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(q.x, q.y, 2.2 * size, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // set up: the collection points, each a small shop
      if (oSetup > 0.02) {
        ctx.globalAlpha = oSetup;
        for (const o of ORIGINS) {
          const q = S(o);
          ctx.fillStyle = "#fff";
          ctx.strokeStyle = "#137179";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.roundRect(q.x - 6, q.y - 6, 12, 12, 3);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#137179";
          ctx.fillRect(q.x - 3, q.y - 1, 6, 1.6);
        }
        const from = S(ABROAD_FROM);
        ctx.fillStyle = "#137179";
        ctx.beginPath();
        ctx.arc(Math.max(10, from.x), from.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // store: a rack beside the hub, filling and emptying as stock comes and goes
      if (oStore > 0.02) {
        const q = S(HUB);
        const cell = 11, gap = 3, cols = 6, rows = 3;
        const rw = cols * (cell + gap) - gap, rh = rows * (cell + gap) - gap;
        const x0 = Math.min(view.w - rw - 18, q.x + 26), y0 = Math.max(40, q.y - rh - 34);
        ctx.globalAlpha = oStore;
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.shadowColor = "rgba(11,58,64,0.25)";
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.roundRect(x0 - 9, y0 - 9, rw + 18, rh + 18, 10);
        ctx.fill();
        ctx.shadowBlur = 0;
        for (let i = 0; i < cols * rows; i++) {
          const cx = x0 + (i % cols) * (cell + gap), cy = y0 + Math.floor(i / cols) * (cell + gap);
          const full = (clock * 1.3 + i * 0.83) % 7 < 5.4;
          ctx.fillStyle = !full ? "#c4e9e7" : i % 5 === 3 ? "rgba(201,150,46,0.85)" : "#137179";
          ctx.beginPath();
          ctx.roundRect(cx, cy, cell, cell, 2.5);
          ctx.fill();
        }
        ctx.strokeStyle = "rgba(19,113,121,0.35)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(q.x, q.y);
        ctx.lineTo(x0 - 9, y0 + rh / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        const pulse = (Math.sin(clock * 2) + 1) / 2;
        ctx.strokeStyle = `rgba(19,113,121,${0.25 + pulse * 0.2})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 26 + pulse * 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        pill(c.kingdom.callouts.shelf, { x: x0 + rw / 2, y: y0 }, oStore, "#137179", -26);
      }

      // settle: the seller's account
      if (oSettle > 0.02) {
        const q = S(YOU);
        const pulse = (Math.sin(clock * 3) + 1) / 2;
        ctx.globalAlpha = oSettle;
        ctx.fillStyle = `rgba(201,150,46,${0.15 + pulse * 0.15})`;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 14 + pulse * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#c9962e";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // cities
      for (const [id, p] of Object.entries(CITY)) {
        const q = S(p);
        if (q.x < -30 || q.y < -30 || q.x > view.w + 30 || q.y > view.h + 30) continue;
        const isHub = id === "riyadh" || id === "sabya";
        if (isHub) {
          const pulse = (Math.sin(clock * 2.4 + (id === "sabya" ? 1.5 : 0)) + 1) / 2;
          ctx.fillStyle = `rgba(19,113,121,${0.12 + pulse * 0.1})`;
          ctx.beginPath();
          ctx.arc(q.x, q.y, 14 + pulse * 8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = isHub ? "#137179" : "#fff";
        ctx.strokeStyle = "#137179";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(q.x, q.y, isHub ? 6 : 3.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (LABELLED.includes(id) && view.w > 360) {
          const label = id === "riyadh" ? c.map.hub : id === "sabya" ? c.map.sabya : c.cities[id];
          ctx.font = font(isHub ? 600 : 500, isHub ? 12 : 11);
          ctx.textAlign = "center";
          ctx.fillStyle = isHub ? "#0b3a40" : "rgba(11,58,64,0.7)";
          ctx.fillText(label, q.x, q.y + (isHub ? 22 : 17));
        }
      }

      // delivery pings + labels
      for (let i = pings.length - 1; i >= 0; i--) {
        const pg = pings[i];
        pg.age += dt;
        if (pg.age > 1.8) { pings.splice(i, 1); continue; }
        const q = S(pg.p);
        const a = 1 - pg.age / 1.8;
        ctx.strokeStyle = `rgba(${TONE[pg.tone].trail},${a})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 4 + pg.age * 18, 0, Math.PI * 2);
        ctx.stroke();
        if (pg.label && pg.age < 1.4 && view.w > 360) {
          const text = `✓ ${c.map.delivered} · ${pg.label}`;
          ctx.font = font(600, 11);
          const tw = ctx.measureText(text).width + 16;
          const y = q.y - 22 - pg.age * 10;
          ctx.globalAlpha = Math.min(1, (1.4 - pg.age) * 2.5);
          ctx.fillStyle = "rgba(255,255,255,0.95)";
          ctx.shadowColor = "rgba(11,58,64,0.2)";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.roundRect(q.x - tw / 2, y - 10, tw, 20, 10);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#0b7d36";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, q.x, y);
          ctx.textBaseline = "alphabetic";
          ctx.globalAlpha = 1;
        }
      }

      // what each stage is doing, pinned where it happens
      const k1 = c.kingdom.callouts;
      pill(k1.pickups, S(ORIGINS[0]), oSetup, "#137179", -22);
      pill(k1.abroad, S(bez(ABROAD, 0.35)), oSetup, "#137179", -20);
      pill(k1.packed, S(HUB), oSetup, "#0b7d36", 34);
      pill(k1.haul, S(bez(ROUTES.inter[2], 0.5)), oDeliver, "#137179", -18);
      pill(k1.pod, S(CITY.dammam), oDeliver, "#0b7d36", 30);
      pill(k1.you, S(YOU), oSettle, "#c9962e", -22);
      pill(k1.cash, S(HUB), oSettle, "#c9962e", 34);
      pill(k1.returns, S(CITY.jeddah), oSettle, "#137179", -22);
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
