"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/content/i18n";
import { routeCopy, MODELS, CITIES, SITES, areasFor, type City, type Model, type Site } from "@/content/routeConsole";
import { planRoute, beatSeconds, type Beat, type Place } from "@/lib/routePlan";
import { KSA, KSA_DOTS, CITY_XY, type P } from "@/lib/ksaGeo";
import { W, H, ROWS, COLS, rowY, colX, node, type SimConfig } from "@/lib/networkSim";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { Timeline } from "./FlyoverMap";

// The real-map flyover (MapLibre) loads on demand; the flat canvas below is the fallback.
const FlyoverMap = dynamic(() => import("./FlyoverMap"), { ssr: false });
const REAL_MAP = process.env.NEXT_PUBLIC_REAL_MAP !== "0";
const STYLE_STREET = process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://tiles.openfreemap.org/styles/liberty";
const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || "";
const STYLE_SAT = MAPTILER_KEY ? `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}` : "";
/** read once per page: can this browser run the real map? ("pending" while rendering on the server) */
let capability: "real" | "canvas" | null = null;
const readCapability = (): "real" | "canvas" => {
  if (capability) return capability;
  let ok = false;
  try {
    const cv = document.createElement("canvas");
    ok = !!(cv.getContext("webgl2") || cv.getContext("webgl"));
  } catch { /* no WebGL */ }
  return (capability = REAL_MAP && ok ? "real" : "canvas");
};
const noopSubscribe = () => () => {};

const TEAL = "#137179";
const DEEP = "#0b3a40";
const GREEN = "#0b7d36";
const GOLD = "#c9962e";
const CORAL = "#d0573f";

/** the planner's answers suggest a starting model until the visitor picks one */
const suggest = (cfg: SimConfig): Model => (cfg.storage ? "e2e" : cfg.freight ? "b2b" : "door");

/**
 * Route console: the visitor picks one of MSG's working models (door to door, one-point B2B drop,
 * drop at an MSG site, or end to end) and the two ends of a shipment. The map plays that route
 * beat by beat: on the city map when both ends share a city, on the Kingdom map otherwise. Cash
 * remittance and failed-delivery returns can be added. Illustrative only; captioned as such.
 */
export default function NetworkConsole({ locale, cfg, compact = false }: { locale: Locale; cfg: SimConfig; statusIdle?: boolean; complete?: boolean; compact?: boolean }) {
  const c = routeCopy[locale];
  const reduce = useReducedMotion();
  const [picked, setPicked] = useState<Model | null>(null);
  const model = picked ?? suggest(cfg);
  const [fromCity, setFromCity] = useState<City>("riyadh");
  const [fromArea, setFromArea] = useState("olaya");
  const [toCity, setToCity] = useState<City>("riyadh");
  const [toArea, setToArea] = useState("rawdah");
  const [site, setSite] = useState<Site>("riyadh");
  const [cod, setCod] = useState(true);
  const [returns, setReturns] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [active, setActive] = useState(0);
  const [mapFailed, setMapFailed] = useState(false);
  const capable = useSyncExternalStore(noopSubscribe, readCapability, () => "pending" as const);
  const mode: "pending" | "real" | "canvas" = mapFailed ? "canvas" : capable;
  const [near, setNear] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [sat, setSat] = useState(false);
  const [rt, setRt] = useState<Timeline | null>(null);

  const plan = useMemo(() => {
    const area = (city: City, id: string) => areasFor(city).find((a) => a.id === id) ?? areasFor(city)[0];
    return planRoute({
      model,
      from: { city: fromCity, area: area(fromCity, fromArea) },
      to: { city: toCity, area: area(toCity, toArea) },
      site, cod, returns,
    });
  }, [model, fromCity, fromArea, toCity, toArea, site, cod, returns]);
  const baseStarts = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < plan.beats.length; i++) out.push(i ? out[i - 1] + beatSeconds(plan.beats[i - 1]) : 0);
    return out;
  }, [plan]);
  const baseTotal = baseStarts.length ? baseStarts[baseStarts.length - 1] + beatSeconds(plan.beats[plan.beats.length - 1]) : 0;
  // on the real map every step lasts as long as its road is long, so the timeline comes from the map
  const live = mode === "real" && rt && rt.plan === plan ? rt : null;
  const starts = live ? live.starts : baseStarts;
  const total = live ? live.total : baseTotal;
  const durOf = (i: number) => (live ? live.durs[i] : beatSeconds(plan.beats[i]));

  const canvas = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const clock = useRef(0);
  const progBar = useRef<HTMLSpanElement>(null);
  const playRef = useRef(playing);
  useEffect(() => { playRef.current = playing && !reduce; }, [playing, reduce]);

  // the map engine is a sizeable download: fetch it only when the console is about to be seen
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: "700px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cityName = (k: string) => c.cities[k as City] ?? k;
  const fmt = (b: Beat) => {
    let s = c.steps[b.step];
    if (b.vars.back === "you") s = locale === "ar" ? s.replace("إلى {back}", "إليك") : s.replace("{back}", "you");
    return s
      .replace("{from}", cityName(b.vars.from ?? ""))
      .replace("{to}", cityName(b.vars.to ?? ""))
      .replace("{a}", cityName(b.vars.a ?? ""))
      .replace("{b}", cityName(b.vars.b ?? ""))
      .replace("{site}", c.siteName[(b.vars.site as Site) ?? "riyadh"])
      .replace("{back}", c.siteName[(b.vars.back as Site) ?? "riyadh"] ?? "");
  };

  const jump = (i: number) => {
    clock.current = reduce ? starts[i] + durOf(i) - 0.001 : starts[i];
    setActive(i);
    setPlaying(true);
  };

  // ---- canvas ----
  useEffect(() => {
    if (mode !== "canvas") return;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const font = locale === "ar" ? "system-ui, sans-serif" : "Inter, system-ui, sans-serif";
    const city = plan.view === "city";
    const homeCity = plan.places[0]?.city ?? "riyadh";
    clock.current = reduce ? total - 0.001 : 0;
    let raf = 0;
    let last = performance.now();
    let shownBeat = -1;
    let visible = true;

    // world positions
    const world = (p: Place): P => {
      if (city) return { x: p.fx * W, y: p.fy * H };
      // on the Kingdom map a site sits on its city; other spots are pushed clear of it so pins never stack
      const o = CITY_XY[p.city];
      if (p.pin === "site" || !p.pin) return o; // sites and line-haul arrival points sit on the city
      let vx = p.fx - 0.5, vy = p.fy - 0.5;
      const n = Math.hypot(vx, vy);
      if (n < 0.05) { vx = p.pin === "you" ? -0.6 : 0.6; vy = 0.8; } else { vx /= n; vy /= n; }
      return { x: o.x + vx * 46, y: o.y + vy * 40 };
    };
    // city streets: a route leaves the pin for the nearest street, runs along it, turns onto the street
    // nearest the destination and stops at the door, so it always sits on a road that is drawn
    const streets = (a: P, z: P): P[] => {
      let r1 = 0, bd = Infinity;
      for (let r = 0; r <= ROWS; r++) { const d = Math.abs(rowY(r, a.x) - a.y); if (d < bd) { bd = d; r1 = r; } }
      let c2 = 0; bd = Infinity;
      for (let cc = 0; cc <= COLS; cc++) { const d = Math.abs(colX(cc, z.y) - z.x); if (d < bd) { bd = d; c2 = cc; } }
      const pts: P[] = [a, { x: a.x, y: rowY(r1, a.x) }];
      let xc = a.x;
      for (let k = 0; k < 3; k++) xc = colX(c2, rowY(r1, xc));
      const nx = Math.max(1, Math.ceil(Math.abs(xc - a.x) / 10));
      for (let k = 1; k <= nx; k++) { const x = a.x + ((xc - a.x) * k) / nx; pts.push({ x, y: rowY(r1, x) }); }
      const y0 = rowY(r1, xc), ny = Math.max(1, Math.ceil(Math.abs(z.y - y0) / 10));
      for (let k = 1; k <= ny; k++) { const y = y0 + ((z.y - y0) * k) / ny; pts.push({ x: colX(c2, y), y }); }
      pts.push(z);
      return pts.filter((q, k, arr) => !k || Math.hypot(q.x - arr[k - 1].x, q.y - arr[k - 1].y) > 0.5);
    };
    // cash and returns ride beside the parcel (not on top of it) so every flow stays readable
    const LANE: Record<string, number> = { cash: 5.5, return: -5.5 };
    const shift = (pts: P[], off: number) => pts.map((q, k) => {
      const a = pts[Math.max(0, k - 1)], b = pts[Math.min(pts.length - 1, k + 1)];
      const tx = b.x - a.x, ty = b.y - a.y, n = Math.hypot(tx, ty) || 1;
      return { x: q.x - (ty / n) * off, y: q.y + (tx / n) * off };
    });
    // on the Kingdom map each flow arcs on its own side so they fan out instead of overlapping
    const LIFT: Record<string, number> = { parcel: 0.16, order: 0.16, cash: -0.12, return: -0.26 };
    // each moving beat as a polyline in world space
    const paths = plan.beats.map((b) => {
      const a = world(b.from), z = world(b.to);
      let pts: P[];
      if (b.from === b.to) pts = [a];
      else if (city) {
        pts = streets(a, z);
        if (LANE[b.flow]) pts = shift(pts, LANE[b.flow]);
      } else if (b.from.city === b.to.city) {
        pts = [];
        for (let k = 0; k <= 12; k++) pts.push({ x: a.x + (z.x - a.x) * (k / 12), y: a.y });
        for (let k = 1; k <= 12; k++) pts.push({ x: z.x, y: a.y + (z.y - a.y) * (k / 12) });
      } else {
        const mx = (a.x + z.x) / 2, my = (a.y + z.y) / 2, dx = z.x - a.x, dy = z.y - a.y;
        const lift = LIFT[b.flow] ?? 0.16;
        const cp = { x: mx - dy * lift, y: my + dx * lift };
        pts = [];
        for (let k = 0; k <= 40; k++) {
          const t = k / 40;
          pts.push({ x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * cp.x + t * t * z.x, y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * cp.y + t * t * z.y });
        }
      }
      const lens = [0];
      for (let k = 1; k < pts.length; k++) lens.push(lens[k - 1] + Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y));
      return { pts, lens };
    });
    const at = (i: number, f: number) => {
      const { pts, lens } = paths[i];
      const L = lens[lens.length - 1] * f;
      let k = 1;
      while (k < lens.length - 1 && lens[k] < L) k++;
      const a = pts[k - 1] ?? pts[0], b = pts[k] ?? pts[0];
      const seg = Math.max(0.001, (lens[k] ?? 0) - (lens[k - 1] ?? 0));
      const u = Math.min(1, Math.max(0, (L - (lens[k - 1] ?? 0)) / seg));
      return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, ang: Math.atan2(b.y - a.y, b.x - a.x) };
    };

    // camera: the whole city, or the part of the Kingdom the route touches
    const wp = plan.places.map(world);
    let bx0 = Math.min(...wp.map((p) => p.x)), bx1 = Math.max(...wp.map((p) => p.x));
    let by0 = Math.min(...wp.map((p) => p.y)), by1 = Math.max(...wp.map((p) => p.y));
    const minW = 340, minH = 230;
    if (bx1 - bx0 < minW) { const m = (bx0 + bx1) / 2; bx0 = m - minW / 2; bx1 = m + minW / 2; }
    if (by1 - by0 < minH) { const m = (by0 + by1) / 2; by0 = m - minH / 2; by1 = m + minH / 2; }
    const target = city
      ? { x: (bx0 + bx1) / 2, y: (by0 + by1) / 2 + 24, w: Math.max(620, bx1 - bx0 + 300), h: Math.max(340, by1 - by0 + 250) }
      : { x: (bx0 + bx1) / 2, y: (by0 + by1) / 2 + 30, w: bx1 - bx0 + 200, h: by1 - by0 + 230 }; // extra room below, where the step card sits
    let cam = { ...target };

    // city blocks: calm ground, a few parks and plazas, and faint building footprints so the map reads as a city
    const hash = (x: number, y: number) => Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
    const blocks: { pts: P[]; fill: string; tex: { x: number; y: number; w: number; h: number }[]; tree: boolean }[] = [];
    if (city) {
      for (let r = -2; r < ROWS + 1; r++) for (let cc = -2; cc < COLS + 1; cc++) {
        const k = hash(r + 3, cc + 3);
        const park = k < 0.12, plaza = !park && k < 0.2;
        const fill = park ? "#cfe8d6" : plaza ? "#f3ead2" : "#f9faf6";
        const a = node(cc, r), b = node(cc + 1, r), d = node(cc + 1, r + 1), e = node(cc, r + 1);
        const ctr = { x: (a.x + b.x + d.x + e.x) / 4, y: (a.y + b.y + d.y + e.y) / 4 };
        const ins = (p: P) => ({ x: p.x + (ctr.x - p.x) * 0.1, y: p.y + (ctr.y - p.y) * 0.1 });
        const tex: { x: number; y: number; w: number; h: number }[] = [];
        if (!park) {
          const n = plaza ? 1 : 2 + Math.floor(hash(r, cc) * 3);
          for (let i = 0; i < n; i++) {
            const w = 11 + hash(r + i, cc * 3) * 15, h = 8 + hash(cc + i, r * 5) * 10;
            tex.push({ x: ctr.x + (hash(r * 7 + i, cc) - 0.5) * 34 - w / 2, y: ctr.y + (hash(cc * 7 + i, r) - 0.5) * 22 - h / 2, w, h });
          }
        }
        blocks.push({ pts: [ins(a), ins(b), ins(d), ins(e)], fill, tex, tree: park });
      }
    }

    let view = { w: 0, h: 0 };
    const size = () => {
      const r = box.current!.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      view = { w: r.width, h: r.height };
    };
    size();

    const scale = () => Math.min(view.w / cam.w, view.h / cam.h); // contain: every pin on the route stays in frame
    const toScreen = (p: P) => { const z = scale(); return { x: view.w / 2 + (p.x - cam.x) * z, y: view.h / 2 + (p.y - cam.y) * z }; };

    function pill(text: string, x: number, y: number, bg: string, fg: string) {
      ctx.font = `600 11px ${font}`;
      const w = ctx.measureText(text).width + 14;
      const cx = Math.min(view.w - w / 2 - 4, Math.max(w / 2 + 4, x));
      ctx.save();
      ctx.shadowColor = "rgba(11,58,64,0.2)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.roundRect(cx - w / 2, y - 10, w, 20, 10); ctx.fill();
      ctx.restore();
      ctx.fillStyle = fg;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, cx, y + 0.5);
    }
    function pin(x: number, y: number, fill: string, r: number, glyph: (gx: number, gy: number) => void) {
      ctx.save();
      ctx.shadowColor = "rgba(11,58,64,0.35)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(x, y - r - 6, r, Math.PI * 0.85, Math.PI * 0.15);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#fff";
      ctx.stroke();
      ctx.restore();
      glyph(x, y - r - 6);
    }
    const flowColor = (b: Beat) => (b.flow === "cash" ? GOLD : b.flow === "return" ? CORAL : b.flow === "order" ? DEEP : b.who === "you" ? DEEP : TEAL);

    function draw() {
      const t = clock.current;
      let cur = 0;
      for (let i = 0; i < starts.length; i++) if (t >= starts[i]) cur = i;
      const prog = plan.beats.length ? Math.min(1, Math.max(0, (t - starts[cur]) / beatSeconds(plan.beats[cur]))) : 0;
      if (cur !== shownBeat) { shownBeat = cur; setActive(cur); }
      if (progBar.current) progBar.current.style.transform = `scaleX(${prog})`;

      const k = reduce ? 1 : 0.08;
      cam = { x: cam.x + (target.x - cam.x) * k, y: cam.y + (target.y - cam.y) * k, w: cam.w + (target.w - cam.w) * k, h: cam.h + (target.h - cam.h) * k };
      const z = scale();
      const lw = (px: number) => px / z;

      ctx.clearRect(0, 0, view.w, view.h);
      ctx.fillStyle = city ? "#e3eae6" : "#eef7f7";
      ctx.fillRect(0, 0, view.w, view.h);
      ctx.save();
      ctx.translate(view.w / 2, view.h / 2);
      ctx.scale(z, z);
      ctx.translate(-cam.x, -cam.y);

      if (city) {
        for (const b of blocks) {
          ctx.fillStyle = b.fill;
          ctx.beginPath();
          b.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = b.fill === "#f3ead2" ? "#e8dcb8" : "#e9ece4";
          for (const t of b.tex) ctx.fillRect(t.x, t.y, t.w, t.h);
          if (b.tree) {
            ctx.fillStyle = "#b5d9c0";
            const m = b.pts;
            const cx = (m[0].x + m[2].x) / 2, cy = (m[0].y + m[2].y) / 2;
            for (const [dx, dy] of [[-16, -8], [0, 5], [15, -4], [-6, 12], [9, 11]]) { ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 4.2, 0, Math.PI * 2); ctx.fill(); }
          }
        }
        const art = { r: [1, 4, 6], c: [2, 6, 9] };
        for (const pass of ["case", "fill"] as const) {
          for (let r = -3; r < ROWS + 3; r++) {
            const wide = art.r.includes(r);
            ctx.strokeStyle = pass === "case" ? (wide ? "#dccf9f" : "#c9d6d2") : wide ? "#fff1c4" : "#ffffff";
            ctx.lineWidth = wide ? (pass === "case" ? 10 : 7.5) : pass === "case" ? 5 : 3.2;
            ctx.beginPath();
            for (let x = -500; x <= W + 500; x += 12) (x === -500 ? ctx.moveTo : ctx.lineTo).call(ctx, x, rowY(r, x));
            ctx.stroke();
          }
          for (let cc = -6; cc < COLS + 6; cc++) {
            const wide = art.c.includes(cc);
            ctx.strokeStyle = pass === "case" ? (wide ? "#dccf9f" : "#c9d6d2") : wide ? "#fff1c4" : "#ffffff";
            ctx.lineWidth = wide ? (pass === "case" ? 10 : 7.5) : pass === "case" ? 5 : 3.2;
            ctx.beginPath();
            for (let y = -300; y <= H + 300; y += 12) (y === -300 ? ctx.moveTo : ctx.lineTo).call(ctx, colX(cc, y), y);
            ctx.stroke();
          }
        }
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "rgba(19,113,121,0.25)";
        ctx.lineWidth = lw(1.5);
        ctx.beginPath();
        KSA.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(19,113,121,0.16)";
        for (const d of KSA_DOTS) ctx.fillRect(d.x - 1.6, d.y - 1.6, 3.2, 3.2);
      }

      // the route: upcoming legs are dotted, finished legs are solid with direction arrows
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const trace = (i: number, upto: number) => {
        const { pts, lens } = paths[i];
        const L = lens[lens.length - 1] * upto;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let j = 1; j < pts.length && lens[j] <= L; j++) ctx.lineTo(pts[j].x, pts[j].y);
        const end = at(i, upto);
        ctx.lineTo(end.x, end.y);
      };
      plan.beats.forEach((b, i) => {
        const { pts, lens } = paths[i];
        if (pts.length < 2) return;
        const col = flowColor(b);
        const len = lens[lens.length - 1];
        if (i >= cur) {
          ctx.setLineDash([lw(0.1), lw(7.5)]);
          ctx.strokeStyle = col + "aa";
          ctx.lineWidth = lw(3.6);
          trace(i, 1);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        const upto = i < cur ? 1 : i === cur ? prog : 0;
        if (upto > 0.002) {
          const wd = b.vehicle === "truck" ? 6.5 : 5.5;
          trace(i, upto);
          ctx.strokeStyle = "rgba(255,255,255,0.96)";
          ctx.lineWidth = lw(wd + 4);
          ctx.stroke();
          ctx.strokeStyle = col;
          ctx.lineWidth = lw(wd);
          ctx.stroke();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = lw(2);
          const gap = lw(36), sz = lw(3.3), reach = len * upto;
          for (let d = gap * 0.6; d < reach - lw(8); d += gap) {
            const q = at(i, d / len);
            ctx.save();
            ctx.translate(q.x, q.y);
            ctx.rotate(q.ang);
            ctx.beginPath(); ctx.moveTo(-sz, -sz); ctx.lineTo(sz * 0.6, 0); ctx.lineTo(-sz, sz); ctx.stroke();
            ctx.restore();
          }
        }
      });
      ctx.setLineDash([]);
      ctx.restore();

      // ---- screen space ----
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      const halo = (txt: string, x: number, y: number, fill: string) => {
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = "rgba(255,255,255,0.92)";
        ctx.strokeText(txt, x, y);
        ctx.fillStyle = fill;
        ctx.fillText(txt, x, y);
      };
      const spots = plan.places.map((pl) => toScreen(world(pl)));
      if (city) {
        const ends = plan.places.filter((pl) => pl.pin);
        for (const a of areasFor(homeCity)) {
          const q = toScreen({ x: a.fx * W, y: a.fy * H + 26 });
          const on = ends.some((pl) => pl.fx === a.fx && pl.fy === a.fy);
          ctx.font = `${on ? 800 : 700} ${on ? 12 : 11}px ${font}`;
          halo((c.areas[a.id] ?? a.id).toUpperCase(), q.x, q.y, on ? DEEP : "rgba(11,58,64,0.6)");
        }
      } else {
        const used = new Set(plan.places.map((pl) => pl.city));
        const named = new Set(plan.places.filter((pl) => pl.pin === "site").map((pl) => pl.city)); // a site pill already names its city
        const placed: P[] = [];
        for (const k of [...CITIES].sort((x, y) => Number(used.has(y)) - Number(used.has(x)))) {
          const q = toScreen(CITY_XY[k]);
          if (q.x < -20 || q.y < -20 || q.x > view.w + 20 || q.y > view.h + 20) continue;
          if (named.has(k)) continue;
          const on = used.has(k);
          if (!on && spots.some((sp) => Math.hypot(sp.x - q.x, sp.y - q.y) < 64)) continue;
          if (placed.some((pp) => Math.abs(pp.x - q.x) < 74 && Math.abs(pp.y - q.y) < 15)) continue;
          placed.push(q);
          ctx.fillStyle = on ? DEEP : "rgba(11,58,64,0.45)";
          ctx.beginPath(); ctx.arc(q.x, q.y, on ? 4 : 2.8, 0, Math.PI * 2); ctx.fill();
          ctx.font = `${on ? 800 : 600} ${on ? 13 : 11}px ${font}`;
          const ar = locale === "ar";
          ctx.textAlign = ar ? "right" : "left";
          halo(cityName(k), q.x + (ar ? -9 : 9), q.y + 1, on ? DEEP : "rgba(11,58,64,0.62)");
          ctx.textAlign = "center";
        }
      }

      // step numbers on the route, so a leg on the map matches its card below
      plan.beats.forEach((b, i) => {
        const pl = paths[i];
        if (pl.pts.length < 2 || pl.lens[pl.lens.length - 1] * z < 46) return;
        const m = toScreen(at(i, 0.5));
        const col = flowColor(b);
        const now = i === cur, next = i > cur;
        const r = now ? 12 : 10.5;
        ctx.save();
        if (next) ctx.globalAlpha = 0.75;
        ctx.shadowColor = "rgba(11,58,64,0.3)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(m.x, m.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.beginPath(); ctx.arc(m.x, m.y, r - 2.2, 0, Math.PI * 2);
        if (next) { ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.stroke(); } else { ctx.fillStyle = col; ctx.fill(); }
        ctx.fillStyle = next ? col : "#fff";
        ctx.font = `800 ${now ? 12 : 11}px ${font}`;
        ctx.fillText(String(i + 1), m.x, m.y + 0.5);
        ctx.restore();
      });

      // the current beat: a vehicle, a flow token, or handling at one place (under the pins, so it arrives at them)
      const b = plan.beats[cur];
      if (b) {
        if (b.from === b.to) {
          const q = toScreen(world(b.from));
          const pulse = reduce ? 0.5 : (Math.sin(t * 6) + 1) / 2;
          ctx.strokeStyle = TEAL;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(q.x, q.y - 18, 20 + pulse * 6, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = "rgba(19,113,121,0.35)";
          ctx.beginPath(); ctx.arc(q.x, q.y - 18, 30 + pulse * 8, 0, Math.PI * 2); ctx.stroke();
        } else {
          const h = at(cur, prog);
          const q = toScreen(h);
          ctx.save();
          ctx.translate(q.x, q.y);
          ctx.scale(1.25, 1.25);
          ctx.shadowColor = "rgba(11,58,64,0.35)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 2;
          ctx.fillStyle = "rgba(255,255,255,0.92)";
          ctx.beginPath(); ctx.arc(0, 0, b.vehicle === "truck" ? 15 : 12, 0, Math.PI * 2); ctx.fill();
          if (b.flow === "cash") {
            ctx.fillStyle = GOLD;
            ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, Math.PI * 2); ctx.stroke();
          } else if (b.flow === "order") {
            ctx.fillStyle = "#fff";
            ctx.beginPath(); ctx.roundRect(-8, -6, 16, 12, 3); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = TEAL; ctx.fillRect(-5, -3, 10, 1.6); ctx.fillRect(-5, 0, 7, 1.6);
          } else if (b.vehicle === "courier" || b.vehicle === "you") {
            ctx.fillStyle = b.flow === "return" ? CORAL : b.vehicle === "you" ? DEEP : "#fff";
            ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.rotate(h.ang);
            ctx.fillStyle = b.flow === "return" || b.vehicle === "you" ? "#fff" : TEAL;
            ctx.beginPath(); ctx.moveTo(5.5, 0); ctx.lineTo(-3.5, -4.5); ctx.lineTo(-1.2, 0); ctx.lineTo(-3.5, 4.5); ctx.closePath(); ctx.fill();
          } else {
            ctx.rotate(h.ang);
            const L = b.vehicle === "truck" ? 24 : 17;
            ctx.fillStyle = b.flow === "return" ? CORAL : b.vehicle === "truck" ? DEEP : GREEN;
            ctx.beginPath(); ctx.roundRect(-L / 2, -6, L, 12, 3); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.fillRect(L / 2 - 5, -4, 3, 8);
          }
          ctx.restore();
        }
      }
      // pins
      const drawn = new Set<string>();
      for (const p of plan.places) {
        if (!p.pin) continue;
        const key = `${p.pin}:${p.city}:${p.fx}:${p.fy}`;
        if (drawn.has(key)) continue;
        drawn.add(key);
        const q = toScreen(world(p));
        const ring = p.pin === "site" ? DEEP : p.pin === "you" ? TEAL : GREEN;
        // when another pin sits just below, the label goes above this pin so neither hides the other
        const crowded = plan.places.some((o) => {
          if (!o.pin || o === p || (o.city === p.city && o.fx === p.fx && o.fy === p.fy)) return false;
          const oq = toScreen(world(o));
          return oq.y > q.y - 6 && oq.y - q.y < 46 && Math.abs(oq.x - q.x) < 56;
        });
        const lblY = crowded ? q.y - 42 : q.y + 13;
        const pulse = reduce ? 0.35 : (Math.sin(t * 3 + q.x * 0.05) + 1) / 2;
        ctx.save();
        ctx.globalAlpha = 0.4 - pulse * 0.28;
        ctx.strokeStyle = ring;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(q.x, q.y, 13 + pulse * 10, (13 + pulse * 10) * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        if (p.pin === "site") {
          pin(q.x, q.y, DEEP, 13, (x, y) => { ctx.fillStyle = "#fff"; ctx.fillRect(x - 6.5, y - 4.5, 13, 10); ctx.fillStyle = DEEP; ctx.fillRect(x - 2, y + 1, 4, 4.5); });
          pill(c.siteName[p.city as Site], q.x, q.y + 14, DEEP, "#fff");
        } else if (p.pin === "you") {
          pin(q.x, q.y, DEEP, 11, (x, y) => { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y - 2.5, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - 5, y + 1.5, 10, 3.6); });
          pill(c.pins.you, q.x, lblY, "#fff", DEEP);
        } else {
          const drop = p.pin === "drop";
          pin(q.x, q.y, GREEN, 11, (x, y) => {
            ctx.fillStyle = "#fff";
            if (drop) { ctx.fillRect(x - 5, y - 5, 10, 10); ctx.fillStyle = GREEN; ctx.fillRect(x - 2, y - 2, 4, 7); }
            else { ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x, y - 6); ctx.lineTo(x + 6, y); ctx.closePath(); ctx.fill(); ctx.fillRect(x - 4.5, y, 9, 5.5); }
          });
          pill(drop ? c.pins.drop : c.pins.door, q.x, lblY, GREEN, "#fff");
        }
      }

    }

    const ro = new ResizeObserver(() => { size(); if (reduce) draw(); });
    ro.observe(box.current!);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.05 });
    io.observe(cv);
    const onJump = () => draw();
    window.addEventListener("route-redraw", onJump);

    const loop = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      if (visible && !document.hidden) {
        if (playRef.current) {
          clock.current += dt;
          if (clock.current > total + 1.8) clock.current = 0;
        }
        draw();
      }
      raf = requestAnimationFrame(loop);
    };
    if (reduce) draw();
    else raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener("route-redraw", onJump); };
  }, [mode, plan, starts, total, reduce, locale, c]); // eslint-disable-line react-hooks/exhaustive-deps

  // under reduced motion there is no loop, so a chosen step redraws one still frame
  useEffect(() => { if (reduce) window.dispatchEvent(new Event("route-redraw")); }, [active, reduce]);

  // keep the playing step in view inside the strip (without moving the page)
  const strip = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const ol = strip.current;
    const li = ol?.children[active] as HTMLElement | undefined;
    if (!ol || !li) return;
    let left = li.offsetLeft - ol.offsetLeft - (ol.clientWidth - li.clientWidth) / 2;
    if (getComputedStyle(ol).direction === "rtl") left -= ol.scrollWidth - ol.clientWidth; // RTL scrolls in negatives
    ol.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  }, [active, reduce]);

  const beat = plan.beats[Math.min(active, plan.beats.length - 1)];
  const vehicles = [...new Set(plan.beats.map((b) => b.vehicle).filter((v): v is "courier" | "van" | "truck" => v === "courier" || v === "van" || v === "truck"))];
  const legs = plan.beats.filter((b) => b.from !== b.to).length;
  const viewLabel = plan.view === "city" ? `${c.view.city} · ${c.cities[plan.places[0]?.city ?? "riyadh"]}` : c.view.kingdom;
  const fromLabel = model === "dropoff" || model === "e2e" ? c.fromFor[model] : c.from;
  const toLabel = model === "b2b" ? c.toB2b : c.to;
  const running = playing && !reduce;

  return (
    <div className={`relative overflow-hidden bg-[linear-gradient(180deg,#f3fbfb,#ffffff)] text-teal-deep ${compact ? "flex h-full flex-col" : ""}`}>
      {/* working models */}
      <div role="radiogroup" aria-label={c.title} className={compact ? "flex gap-1.5 overflow-x-auto border-b border-teal/10 p-2.5" : "flex snap-x gap-2 overflow-x-auto border-b border-teal/10 p-3 sm:grid sm:grid-cols-2 sm:overflow-visible sm:p-4 xl:grid-cols-4"}>
        {MODELS.map((m) => {
          const on = m === model;
          return (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => { setPicked(m); setPlaying(true); }}
              className={`flex shrink-0 snap-start items-start gap-3 text-start ring-1 transition-ui ${compact ? "items-center gap-2 rounded-full py-1.5 pe-3.5 ps-1.5" : "min-w-[220px] rounded-2xl p-3 sm:min-w-0"} ${on ? "bg-teal-deep text-white shadow-[0_16px_30px_-18px_rgba(11,58,64,0.8)] ring-teal-deep" : "bg-white ring-teal/15 hover:ring-teal/40"}`}
            >
              <span className={`grid shrink-0 place-items-center ${compact ? "size-7 rounded-full" : "size-9 rounded-xl"} ${on ? "bg-white/15" : "bg-sea-50 text-teal"}`}>
                <ModelIcon m={m} />
              </span>
              <span>
                <span className="block text-sm font-semibold">{c.models[m].t}</span>
                {compact ? null : <span className={`mt-0.5 block text-xs leading-snug ${on ? "text-white/80" : "text-teal-deep/70"}`}>{c.models[m].d}</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div className={compact ? "flex min-h-0 flex-1 flex-col" : "grid lg:grid-cols-[1fr_340px]"}>
        {/* map */}
        <div ref={box} className={compact ? "relative min-h-[340px] w-full flex-1 overflow-hidden" : "relative h-[360px] w-full overflow-hidden sm:h-[440px] lg:h-auto lg:min-h-[520px]"}>
          {mode === "canvas" ? <canvas ref={canvas} className="absolute inset-0 size-full" role="img" aria-label={c.canvasLabel} /> : null}
          {mode === "real" && near ? (
            <FlyoverMap
              key={sat && STYLE_SAT ? STYLE_SAT : STYLE_STREET}
              plan={plan}
              c={c}
              locale={locale}
              styleUrl={sat && STYLE_SAT ? STYLE_SAT : STYLE_STREET}
              playing={playing}
              reduce={reduce}
              clock={clock}
              progBar={progBar}
              onTimeline={setRt}
              onBeat={setActive}
              onStatus={(s) => (s === "failed" ? setMapFailed(true) : setMapReady(true))}
            />
          ) : null}
          {mode !== "canvas" && !mapReady ? (
            <div aria-hidden="true" className="absolute inset-0 grid place-items-center bg-[radial-gradient(70%_60%_at_50%_40%,#d6ebe9,#e9f3f2)]">
              <span className="size-9 animate-spin rounded-full border-[3px] border-teal/20 border-t-teal motion-reduce:animate-none" />
            </div>
          ) : null}
          <div className="absolute start-3 top-3 flex flex-wrap items-center gap-2 sm:start-4 sm:top-4">
            <button
              type="button"
              onClick={() => { if (clock.current >= total) clock.current = 0; setPlaying((p) => !p); }}
              className="inline-flex items-center gap-1.5 rounded-full bg-teal-deep px-3 py-1.5 text-xs font-semibold text-white shadow-[0_10px_24px_-14px_rgba(11,58,64,0.9)]"
            >
              {running ? <PauseGlyph /> : <PlayGlyph />}
              {running ? c.pause : c.play}
            </button>
            <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-teal-deep ring-1 ring-teal/10 backdrop-blur">{viewLabel}</span>
            {mode === "real" && STYLE_SAT ? (
              <button
                type="button"
                aria-pressed={sat}
                onClick={() => { setSat((v) => !v); setMapReady(false); }}
                className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-teal-deep ring-1 ring-teal/10 backdrop-blur"
              >
                {sat ? c.view.street : c.view.satellite}
              </button>
            ) : null}
          </div>
          <Legend c={c} className="absolute end-4 top-4 hidden sm:block" />
          {beat ? (
            <div className="absolute bottom-4 start-4 hidden w-[min(24rem,60%)] overflow-hidden rounded-2xl bg-white/95 px-3.5 pb-3 pt-2.5 shadow-[0_12px_30px_-16px_rgba(11,58,64,0.6)] ring-1 ring-teal/10 backdrop-blur sm:block sm:px-4 sm:pt-3">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand rtl:tracking-normal">
                <span className="relative inline-flex size-2">
                  <span className="plan-ping absolute inset-0 rounded-full bg-brand" />
                  <span className="relative size-2 rounded-full bg-brand" />
                </span>
                <span className="num" dir="ltr">{active + 1}/{plan.beats.length}</span> · {c.who[beat.who]}
              </p>
              <p className="mt-0.5 font-display text-sm font-semibold leading-snug sm:text-base" aria-live="polite">{fmt(beat)}</p>
              <span aria-hidden="true" className="mt-2.5 block h-1 overflow-hidden rounded-full bg-teal/15">
                <span ref={progBar} className="block h-full origin-left rounded-full bg-brand rtl:origin-right" style={{ transform: "scaleX(0)" }} />
              </span>
            </div>
          ) : null}
          <p className={`pointer-events-none absolute end-4 hidden max-w-[34%] ${mode === "real" ? "bottom-10" : "bottom-4"} rounded-xl bg-white/85 px-2.5 py-1 text-end text-[10px] text-teal-deep/75 backdrop-blur lg:block`}>{c.note}</p>
        </div>

        {beat ? (
          <p className="flex items-start gap-2 border-t border-teal/10 bg-white px-4 py-2.5 text-sm font-semibold sm:hidden">
            <span className="num mt-0.5 shrink-0 rounded-full bg-teal-deep px-2 py-0.5 text-[10px] text-white" dir="ltr">{active + 1}/{plan.beats.length}</span>
            <span>{fmt(beat)}</span>
          </p>
        ) : null}

        {/* controls */}
        {compact ? null : <aside className="flex flex-col gap-4 border-t border-teal/10 bg-white/75 p-4 lg:border-s lg:border-t-0">
          <EndPicker
            label={fromLabel} c={c} city={fromCity} area={fromArea}
            onCity={(v) => { setFromCity(v); setFromArea(areasFor(v)[0].id); }} onArea={setFromArea}
          />
          {model === "dropoff" || model === "e2e" ? (
            <fieldset>
              <legend className="text-xs font-semibold text-teal-deep/80">{c.siteFor[model]}</legend>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {SITES.map((s) => (
                  <label key={s} className={`cursor-pointer rounded-xl px-3 py-2 text-center text-xs font-semibold ring-1 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal ${site === s ? "bg-teal-deep text-white ring-teal-deep" : "bg-white ring-teal/20 hover:ring-teal/40"}`}>
                    <input type="radio" name="msg-site" value={s} checked={site === s} onChange={() => setSite(s)} className="sr-only" />
                    {c.siteName[s]}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          <EndPicker
            label={toLabel} c={c} city={toCity} area={toArea}
            onCity={(v) => { setToCity(v); setToArea(areasFor(v)[1]?.id ?? areasFor(v)[0].id); }} onArea={setToArea}
          />

          <div>
            <p className="text-xs font-semibold text-teal-deep/80">{c.options}</p>
            <div className="mt-1.5 space-y-1.5">
              <Toggle on={cod && model !== "b2b"} disabled={model === "b2b"} onClick={() => setCod((v) => !v)} label={c.cod} hint={model === "b2b" ? c.codOff : undefined} dot={GOLD} />
              <Toggle on={returns} onClick={() => setReturns((v) => !v)} label={c.returns} dot={CORAL} />
            </div>
          </div>

          <Legend c={c} className="sm:hidden" flat />

          <dl className="grid grid-cols-2 gap-2">
            {([[c.legs, legs], [c.handovers, plan.beats.length]] as const).map(([k, v]) => (
              <div key={k} className="rounded-xl bg-sea-50 px-2.5 py-2 ring-1 ring-teal/10">
                <dt className="text-[10px] text-teal-deep/75">{k}</dt>
                <dd className="num font-display text-xl font-semibold leading-tight">{v}</dd>
              </div>
            ))}
            <div className="col-span-2 rounded-xl bg-sea-50 px-2.5 py-2 ring-1 ring-teal/10">
              <dt className="text-[10px] text-teal-deep/75">{c.vehicles}</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {vehicles.map((v) => (
                  <span key={v} className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold ring-1 ring-teal/10">
                    <span className={`size-2 rounded-full ${v === "truck" ? "bg-teal-deep" : v === "van" ? "bg-brand" : "bg-teal"}`} />
                    {c.kinds[v]}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </aside>}
      </div>

      {/* the route, step by step */}
      {<div className="border-t border-teal/10 bg-white/80 px-3 py-3 sm:px-4">
        <p className="sr-only">{c.route}</p>
        <ol ref={strip} data-beats className="flex snap-x gap-2 overflow-x-auto pb-1">
          {plan.beats.map((b, i) => {
            const now = i === active;
            const done = i < active;
            const tone = b.flow === "cash" ? "bg-[#a87a1f]" : b.flow === "return" ? "bg-[#b9472f]" : b.who === "you" ? "bg-teal-deep" : "bg-teal";
            return (
              <li key={`${b.step}-${i}`} className="shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => jump(i)}
                  aria-current={now ? "step" : undefined}
                  className={`flex h-full w-[170px] flex-col gap-1 rounded-xl p-2 text-start ring-1 transition-ui duration-300 ${now ? "bg-teal-deep text-white ring-teal-deep" : done ? "bg-sea-50 ring-teal/20" : "bg-white ring-teal/10 hover:ring-teal/30"}`}
                >
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] rtl:tracking-normal">
                    <span className={`grid size-4 place-items-center rounded-full text-[9px] text-white ${now ? "bg-white/25" : tone}`}>
                      {done ? "✓" : <span className="num">{i + 1}</span>}
                    </span>
                    <span className={now ? "text-white/85" : "text-teal-deep/75"}>{c.who[b.who]}</span>
                  </span>
                  <span className="text-xs font-medium leading-snug">{fmt(b)}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-[10px] text-teal-deep/75 lg:hidden">{c.note}</p>
      </div>}
    </div>
  );
}

/** colour key for the route lines; sits on the map from sm up, in the sidebar below that */
function Legend({ c, className = "", flat = false }: { c: (typeof routeCopy)["en"]; className?: string; flat?: boolean }) {
  return (
    <ul className={`${className} grid gap-x-4 gap-y-1.5 rounded-xl p-2.5 text-[11px] font-medium text-teal-deep/85 ${flat ? "grid-cols-2 bg-sea-50/70 ring-1 ring-teal/10" : "bg-white/92 shadow-[0_10px_26px_-16px_rgba(11,58,64,0.6)] ring-1 ring-teal/10 backdrop-blur"}`}>
      {([["parcel", TEAL], ["you", DEEP], ["cash", GOLD], ["back", CORAL]] as const).map(([k, col]) => (
        <li key={k} className="flex items-center gap-2">
          <span aria-hidden="true" className="h-1.5 w-5 shrink-0 rounded-full" style={{ background: col }} />
          {c.legend[k]}
        </li>
      ))}
    </ul>
  );
}

function EndPicker({
  label, c, city, area, onCity, onArea,
}: { label: string; c: (typeof routeCopy)["en"]; city: City; area: string; onCity: (v: City) => void; onArea: (v: string) => void }) {
  return (
    <fieldset>
      <legend className="text-xs font-semibold text-teal-deep/80">{label}</legend>
      <div className="mt-1.5 grid grid-cols-2 gap-1.5">
        <label className="block">
          <span className="sr-only">{`${label}: ${c.city}`}</span>
          <select value={city} onChange={(e) => onCity(e.target.value as City)} className="w-full rounded-xl bg-white px-2.5 py-2 text-sm font-medium text-teal-deep ring-1 ring-teal/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal">
            {CITIES.map((k) => <option key={k} value={k}>{c.cities[k]}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">{`${label}: ${c.area}`}</span>
          <select value={area} onChange={(e) => onArea(e.target.value)} className="w-full rounded-xl bg-white px-2.5 py-2 text-sm font-medium text-teal-deep ring-1 ring-teal/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal">
            {areasFor(city).map((a) => <option key={a.id} value={a.id}>{c.areas[a.id]}</option>)}
          </select>
        </label>
      </div>
    </fieldset>
  );
}

function Toggle({ on, onClick, label, hint, dot, disabled = false }: { on: boolean; onClick: () => void; label: string; hint?: string; dot: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-start ring-1 ring-teal/15 transition-colors enabled:hover:ring-teal/35 disabled:opacity-60"
    >
      <span className="flex items-center gap-2">
        <span className="size-2 shrink-0 rounded-full" style={{ background: dot }} />
        <span>
          <span className="block text-xs font-semibold">{label}</span>
          {hint ? <span className="block text-[10px] text-teal-deep/75">{hint}</span> : null}
        </span>
      </span>
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-teal" : "bg-teal-deep/20"}`}>
        <span className={`absolute start-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4 rtl:-translate-x-4" : ""}`} />
      </span>
    </button>
  );
}

function ModelIcon({ m }: { m: Model }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      {m === "door" && <><path {...p} d="M4 11l8-6 8 6v8H4z" /><path {...p} d="M10 19v-5h4v5" /></>}
      {m === "b2b" && <><path {...p} d="M5 20V6l7-3 7 3v14" /><path {...p} d="M9 9h1M14 9h1M9 13h1M14 13h1M10 20v-3h4v3" /></>}
      {m === "dropoff" && <><path {...p} d="M3 10l9-5 9 5v9H3z" /><path {...p} d="M12 9v6M9 12l3 3 3-3" /></>}
      {m === "e2e" && <><path {...p} d="M20 12a8 8 0 0 1-14 5.3" /><path {...p} d="M4 12a8 8 0 0 1 14-5.3" /><path {...p} d="M18 3v4h-4M6 21v-4h4" /></>}
    </svg>
  );
}
const PlayGlyph = () => <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true"><path d="M3 2l7 4-7 4z" fill="currentColor" /></svg>;
const PauseGlyph = () => <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true"><path d="M3 2h2v8H3zM7 2h2v8H7z" fill="currentColor" /></svg>;
