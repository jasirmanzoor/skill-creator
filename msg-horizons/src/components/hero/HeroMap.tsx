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

const ROUTES: Record<HeroLane, Route[]> = {
  intra: [...local("riyadh", 9, 70), ...local("jeddah", 5, 50), ...local("dammam", 4, 45)],
  inter: long("riyadh", ["jeddah", "makkah", "madinah", "dammam", "abha", "tabuk", "hail", "buraidah", "najran", "ahsa", "taif"]),
  sabya: [...long("sabya", ["riyadh", "jeddah", "dammam", "abha", "najran", "makkah"]), ...local("sabya", 5, 40)],
};

type Parcel = { route: Route; t: number; speed: number };
type Ping = { p: P; age: number; label: string };

export default function HeroMap({ lang, lane }: { lang: Locale; lane: HeroLane }) {
  const c = heroCopy[lang];
  const reduce = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const laneRef = useRef(lane);
  useEffect(() => { laneRef.current = lane; }, [lane]);

  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    let view = { w: 0, h: 0, s: 1, ox: 0, oy: 0 };
    const size = () => {
      const b = cv.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(b.width * dpr);
      cv.height = Math.round(b.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const s = Math.min(b.width / W, b.height / H) * 0.96;
      view = { w: b.width, h: b.height, s, ox: (b.width - W * s) / 2, oy: (b.height - H * s) / 2 };
    };
    size();
    const ro = new ResizeObserver(() => { size(); if (reduce) frame(0); });
    ro.observe(cv);
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(cv);

    const S = (p: P) => ({ x: view.ox + p.x * view.s, y: view.oy + p.y * view.s });
    const bez = (rt: Route, t: number): P => {
      const u = 1 - t;
      return { x: u * u * rt.a.x + 2 * u * t * rt.c.x + t * t * rt.b.x, y: u * u * rt.a.y + 2 * u * t * rt.c.y + t * t * rt.b.y };
    };
    const parcels: Parcel[] = [];
    const pings: Ping[] = [];
    const mix: Record<HeroLane, number> = { intra: 0, inter: 0, sabya: 0 };
    mix[laneRef.current] = 1;
    let spawn = 0, clock = 0;

    function frame(dt: number) {
      clock += dt;
      const active = laneRef.current;
      (Object.keys(mix) as HeroLane[]).forEach((k) => { mix[k] += ((k === active ? 1 : 0) - mix[k]) * Math.min(1, dt * 4); });
      ctx.clearRect(0, 0, view.w, view.h);

      // the land: soft fill, outline, dot matrix
      ctx.save();
      ctx.beginPath();
      KSA.forEach((p, i) => { const q = S(p); if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); });
      ctx.closePath();
      const g = ctx.createLinearGradient(0, view.oy, 0, view.oy + H * view.s);
      g.addColorStop(0, "rgba(196,233,231,0.55)");
      g.addColorStop(1, "rgba(226,244,243,0.25)");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "rgba(19,113,121,0.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
      const hub = S(CITY[active === "sabya" ? "sabya" : "riyadh"]);
      for (const d of DOTS) {
        const q = S(d);
        const near = Math.max(0, 1 - Math.hypot(q.x - hub.x, q.y - hub.y) / (view.s * 260));
        ctx.fillStyle = `rgba(19,113,121,${0.16 + near * 0.32})`;
        ctx.beginPath();
        ctx.arc(q.x, q.y, Math.max(0.9, view.s * 1.9), 0, Math.PI * 2);
        ctx.fill();
      }

      // routes, cross-faded by lane
      (Object.keys(ROUTES) as HeroLane[]).forEach((k) => {
        const a = 0.08 + mix[k] * 0.3;
        for (const rt of ROUTES[k]) {
          const A = S(rt.a), B = S(rt.b), C = S(rt.c);
          ctx.strokeStyle = `rgba(19,113,121,${a})`;
          ctx.lineWidth = rt.local ? 1 : 1.4;
          ctx.setLineDash(rt.local ? [] : [3, 5]);
          ctx.beginPath();
          ctx.moveTo(A.x, A.y);
          ctx.quadraticCurveTo(C.x, C.y, B.x, B.y);
          ctx.stroke();
        }
      });
      ctx.setLineDash([]);

      // parcels
      if (!reduce) {
        spawn -= dt;
        if (spawn <= 0) {
          const set = ROUTES[active];
          parcels.push({ route: set[Math.floor(Math.random() * set.length)], t: 0, speed: 0.28 + Math.random() * 0.25 });
          spawn = active === "intra" ? 0.18 : 0.32;
        }
      }
      for (let i = parcels.length - 1; i >= 0; i--) {
        const pc = parcels[i];
        pc.t += dt * pc.speed * (pc.route.local ? 1.8 : 1);
        if (pc.t >= 1) {
          parcels.splice(i, 1);
          const name = c.cities[pc.route.to] ?? "";
          pings.push({ p: pc.route.b, age: 0, label: pc.route.local ? "" : name });
          continue;
        }
        // trail
        for (let k = 0; k < 10; k++) {
          const tt = pc.t - k * 0.018;
          if (tt < 0) break;
          const q = S(bez(pc.route, tt));
          ctx.fillStyle = `rgba(11,125,54,${0.5 * (1 - k / 10)})`;
          ctx.beginPath();
          ctx.arc(q.x, q.y, (2.6 - k * 0.2) * Math.max(0.7, view.s * 1.4), 0, Math.PI * 2);
          ctx.fill();
        }
        const q = S(bez(pc.route, pc.t));
        ctx.shadowColor = "rgba(76,201,122,0.9)";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#0b7d36";
        ctx.beginPath();
        ctx.arc(q.x, q.y, 3.4 * Math.max(0.7, view.s * 1.4), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // cities
      for (const [id, p] of Object.entries(CITY)) {
        const q = S(p);
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
          ctx.font = `${isHub ? 600 : 500} ${isHub ? 12 : 11}px ${lang === "ar" ? "system-ui" : "Inter, system-ui"}, sans-serif`;
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
        ctx.strokeStyle = `rgba(11,125,54,${a})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 4 + pg.age * 18, 0, Math.PI * 2);
        ctx.stroke();
        if (pg.label && pg.age < 1.4 && view.w > 360) {
          const text = `✓ ${c.map.delivered} · ${pg.label}`;
          ctx.font = `600 11px ${lang === "ar" ? "system-ui" : "Inter, system-ui"}, sans-serif`;
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
    }

    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible && !document.hidden) frame(dt);
      raf = requestAnimationFrame(loop);
    };
    if (reduce) frame(1);
    else {
      for (let i = 0; i < 90; i++) frame(1 / 30); // open mid-flow, not empty
      raf = requestAnimationFrame(loop);
    }
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [reduce, lang, c]);

  return <canvas ref={canvas} role="img" aria-label={c.map.label} className="absolute inset-0 size-full" />;
}
