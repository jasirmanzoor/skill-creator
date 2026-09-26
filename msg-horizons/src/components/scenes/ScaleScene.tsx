"use client";

import { useMotionValueEvent, type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { facts } from "@/content/facts";

/**
 * "1,000+ couriers. 100+ vehicles. One network, around the clock." — drawn, not just said.
 *
 * One point per courier (facts.metrics.couriers) emerges from the horizon and spreads into formation
 * across the sand; one bar per vehicle (facts.metrics.vehicles) lights up among them; then a clock
 * hand sweeps the formation once as the last line lands. Everything is scrubbed by scroll, so the
 * visitor controls the pace. Reduced motion renders the finished formation.
 */

const COURIERS = facts.metrics.couriers.value;
const VEHICLES = facts.metrics.vehicles.value;

// deterministic pseudo-random so server/client and every frame agree
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const span = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

type Pt = { sx: number; sy: number; tx: number; ty: number; d: number; v: boolean; r: number };

export default function ScaleScene({ progress, reduce }: { progress: MotionValue<number>; reduce: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pts = useRef<Pt[]>([]);
  const size = useRef({ w: 0, h: 0, dpr: 1 });
  const frame = useRef(0);

  const layout = () => {
    const c = canvas.current;
    if (!c) return;
    const w = c.clientWidth;
    const h = c.clientHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = w * dpr;
    c.height = h * dpr;
    size.current = { w, h, dpr };
    const narrow = w < 640;
    const cols = narrow ? 34 : 50;
    const rows = Math.ceil(COURIERS / cols);
    const x0 = w * (narrow ? 0.06 : 0.1);
    const x1 = w * (narrow ? 0.94 : 0.9);
    const y0 = h * (narrow ? 0.62 : 0.6);
    const y1 = h * 0.9;
    // exactly VEHICLES vehicles, scattered (not in columns) through the formation
    const vehicle = new Set(
      Array.from({ length: COURIERS }, (_, i) => i).sort((a, b) => rand(a + 5) - rand(b + 5)).slice(0, VEHICLES),
    );
    pts.current = Array.from({ length: COURIERS }, (_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      // perspective: rows further back are narrower and closer together, like a formation on the horizon
      const depth = row / Math.max(1, rows - 1);
      const rowY = y0 + (y1 - y0) * Math.pow(depth, 1.35);
      const inset = (1 - depth) * w * 0.08;
      const tx = x0 + inset + ((x1 - x0 - inset * 2) * col) / (cols - 1);
      return {
        // every courier starts on the horizon line, near its vanishing point
        sx: w / 2 + (rand(i) - 0.5) * w * 0.36,
        sy: h * 0.505,
        tx: tx + (rand(i + 3) - 0.5) * 4,
        ty: rowY + (rand(i + 9) - 0.5) * 3,
        d: rand(i + 77) * 0.55, // stagger
        v: vehicle.has(i),
        r: 0.9 + depth * 1.5, // nearer rows are bigger
      };
    });
  };

  const draw = (p: number) => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const { w, h, dpr } = size.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // timeline mirrors the three interlude lines (see Interlude.tsx: lines land at .22, .35, .49)
    const gather = reduce ? 1 : span(p, 0.14, 0.4);
    const vehicles = reduce ? 1 : span(p, 0.35, 0.5);
    const sweep = reduce ? 0 : span(p, 0.49, 0.8);
    const exit = reduce ? 0 : span(p, 0.84, 0.97);
    const alpha = 1 - exit;
    if (alpha <= 0) return;

    const cx = w / 2;
    const cy = h * 0.75;
    const hand = -Math.PI / 2 + sweep * Math.PI * 2;

    for (let i = 0; i < pts.current.length; i++) {
      const q = pts.current[i];
      const t = ease((gather - q.d * 0.6) / 0.6);
      if (t <= 0) continue;
      const x = q.sx + (q.tx - q.sx) * t;
      const y = q.sy + (q.ty - q.sy) * t;
      // clock-hand highlight: points just behind the sweeping hand glow brighter
      let glow = 0;
      if (sweep > 0 && sweep < 1) {
        let a = Math.atan2(y - cy, x - cx) - hand;
        a = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        glow = Math.max(0, 1 - (Math.PI * 2 - a) / 0.9) ;
      }
      if (q.v && vehicles > 0) {
        const vt = ease((vehicles - q.d * 0.5) / 0.5);
        ctx.fillStyle = glow > 0.05 ? `rgba(31,67,224,${alpha})` : `rgba(31,67,224,${(0.45 + 0.55 * vt) * alpha})`;
        const len = (3 + 7 * vt) * (0.7 + q.r * 0.3);
        ctx.fillRect(x - len / 2, y - 1.6, len, 3.2);
      } else {
        // dark figures on the sand; the clock hand turns them brand blue as it passes
        ctx.fillStyle = glow > 0.05
          ? `rgba(31,67,224,${(0.55 + 0.45 * glow) * alpha})`
          : `rgba(12,14,17,${(0.2 + 0.45 * t) * alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, q.r + glow * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // the hand itself: a faint line from the formation's centre
    if (sweep > 0 && sweep < 1) {
      const r = Math.max(w, h) * 0.6;
      const g = ctx.createLinearGradient(cx, cy, cx + Math.cos(hand) * r, cy + Math.sin(hand) * r);
      g.addColorStop(0, `rgba(31,67,224,${0.55 * alpha})`);
      g.addColorStop(1, "rgba(31,67,224,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(hand) * r, cy + Math.sin(hand) * r);
      ctx.stroke();
    }
  };

  const schedule = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => draw(progress.get()));
  };

  useEffect(() => {
    layout();
    schedule();
    const ro = new ResizeObserver(() => { layout(); schedule(); });
    if (canvas.current) ro.observe(canvas.current);
    return () => { ro.disconnect(); cancelAnimationFrame(frame.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- layout/draw read refs only
  }, [reduce]);

  useMotionValueEvent(progress, "change", schedule);

  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
