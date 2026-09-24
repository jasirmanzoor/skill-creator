"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { KSA_DOTS, KSA_HEIGHT, KSA_WIDTH, RIYADH } from "@/lib/ksa-geo";

/**
 * CourierField — a data graphic, not decoration.
 *   • 1,000 dots  = MSG's 1,000+ couriers; they settle into the Kingdom outward from Riyadh HQ
 *   • 100 lines   = MSG's 100+ vehicles in motion
 *   • a slow wave of brand colour around HQ = operations that never stop (24/7)
 * Canvas 2D; pauses offscreen and in background tabs; static final frame for reduced motion.
 */

const COURIERS = 1000;
const VEHICLES = 100;
const WAVE_PERIOD = 10;
const T_GATHER = 0.2;
const T_VEHICLES = 2.2;

const INK_DOT = "rgba(28,31,36,0.34)";
const BRAND = [31, 67, 224] as const; // --color-brand

type Dot = {
  sx: number; sy: number; tx: number; ty: number; nx: number; ny: number;
  delay: number; dur: number; theta: number; lit: number; x: number; y: number;
};
type Vehicle = { ax: number; ay: number; bx: number; by: number; cx: number; cy: number; start: number; dur: number };

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

export default function CourierField({ ariaLabel, hqLabel }: { ariaLabel: string; hqLabel: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hq, setHq] = useState<{ x: number; y: number } | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const ctx = canvas.getContext("2d")!;
    const rand = mulberry32(20260101);
    const pts = KSA_DOTS.slice(0, COURIERS);
    const maxD = Math.max(...pts.map(([x, y]) => Math.hypot(x - RIYADH[0], y - RIYADH[1])));
    const dots: Dot[] = pts.map(([x, y]) => ({
      sx: 0, sy: 0, tx: 0, ty: 0, nx: x, ny: y, x: 0, y: 0, lit: 0,
      delay: (Math.hypot(x - RIYADH[0], y - RIYADH[1]) / maxD) * 1.4 + rand() * 0.25,
      dur: 0.9 + rand() * 0.4,
      theta: Math.atan2(y - RIYADH[1], x - RIYADH[0]),
    }));
    const seeds = dots.map(() => [rand(), rand()] as const);
    const vehicles: Vehicle[] = [];
    let W = 0, H = 0, S = 1, MX = 0, MY = 0, R = 2, hqX = 0, hqY = 0;
    const start = performance.now();

    function layout() {
      const rect = wrap.getBoundingClientRect();
      W = rect.width; H = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = Math.min((W * 0.96) / KSA_WIDTH, (H * 0.96) / KSA_HEIGHT);
      MX = (W - KSA_WIDTH * S) / 2; MY = (H - KSA_HEIGHT * S) / 2;
      R = Math.max(1, Math.min(2.4, 22 * S * 0.2));
      hqX = MX + RIYADH[0] * S; hqY = MY + RIYADH[1] * S;
      setHq({ x: hqX, y: hqY });
      dots.forEach((d, i) => {
        d.tx = MX + d.nx * S; d.ty = MY + d.ny * S;
        // start: a loose ring around HQ, so the network visibly "deploys" from Riyadh
        const a = seeds[i][0] * Math.PI * 2, r = 6 + seeds[i][1] * 30;
        d.sx = hqX + Math.cos(a) * r; d.sy = hqY + Math.sin(a) * r;
      });
      vehicles.length = 0;
    }

    function leg(from: [number, number] | null, t: number): Vehicle {
      const A = from ?? (rand() < 0.45 ? [hqX, hqY] : [dots[(rand() * dots.length) | 0].tx, dots[(rand() * dots.length) | 0].ty]);
      const B = dots[(rand() * dots.length) | 0];
      const len = Math.hypot(B.tx - A[0], B.ty - A[1]) || 1;
      const k = (rand() - 0.5) * 0.5;
      return {
        ax: A[0], ay: A[1], bx: B.tx, by: B.ty,
        cx: (A[0] + B.tx) / 2 - ((B.ty - A[1]) / len) * len * k,
        cy: (A[1] + B.ty) / 2 + ((B.tx - A[0]) / len) * len * k,
        start: t, dur: 2.4 + (len / (KSA_WIDTH * S)) * 5 + rand(),
      };
    }
    const bez = (v: Vehicle, u: number) => {
      const m = 1 - u;
      return [m * m * v.ax + 2 * m * u * v.cx + u * u * v.bx, m * m * v.ay + 2 * m * u * v.cy + u * u * v.by] as const;
    };

    function drawHQ() {
      ctx.fillStyle = "#0c0e11";
      ctx.beginPath(); ctx.arc(hqX, hqY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(12,14,17,0.35)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(hqX, hqY, 9, 0, Math.PI * 2); ctx.stroke();
    }

    function frame(now: number) {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, W, H);

      // couriers
      const waveOn = t > T_VEHICLES;
      const waveA = ((t / WAVE_PERIOD) * Math.PI * 2) % (Math.PI * 2) - Math.PI;
      ctx.fillStyle = INK_DOT;
      ctx.beginPath();
      const lit: Dot[] = [];
      for (const d of dots) {
        const p = Math.min(1, Math.max(0, (t - T_GATHER - d.delay) / d.dur));
        const e = easeOut(p);
        d.x = d.sx + (d.tx - d.sx) * e; d.y = d.sy + (d.ty - d.sy) * e;
        if (p === 0) continue; // not yet deployed: still at HQ
        if (waveOn && p >= 1) {
          let diff = waveA - d.theta;
          diff = Math.atan2(Math.sin(diff), Math.cos(diff));
          if (diff > 0 && diff < 0.6) d.lit = Math.max(d.lit, 1 - diff / 0.6);
        }
        d.lit *= 0.975;
        ctx.moveTo(d.x + R, d.y); ctx.arc(d.x, d.y, R, 0, Math.PI * 2);
        if (d.lit > 0.05) lit.push(d);
      }
      ctx.fill();
      for (const d of lit) {
        ctx.fillStyle = `rgba(${BRAND[0]},${BRAND[1]},${BRAND[2]},${Math.min(1, d.lit) * 0.9})`;
        ctx.beginPath(); ctx.arc(d.x, d.y, R, 0, Math.PI * 2); ctx.fill();
      }

      // vehicles
      if (t > T_VEHICLES) {
        const due = Math.min(VEHICLES, Math.floor((t - T_VEHICLES) / 0.025));
        while (vehicles.length < due) vehicles.push(leg(null, t));
        ctx.lineCap = "round";
        for (let i = 0; i < vehicles.length; i++) {
          let v = vehicles[i];
          let u = (t - v.start) / v.dur;
          if (u >= 1) { v = vehicles[i] = leg([v.bx, v.by], t); u = 0; }
          const ue = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
          const tail = Math.max(0, ue - 0.12);
          const [ax, ay] = bez(v, tail);
          const [mx, my] = bez(v, (tail + ue) / 2);
          const [bx, by] = bez(v, ue);
          const g = ctx.createLinearGradient(ax, ay, bx, by);
          g.addColorStop(0, `rgba(${BRAND.join(",")},0)`);
          g.addColorStop(1, `rgba(${BRAND.join(",")},0.85)`);
          ctx.strokeStyle = g; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(mx, my, bx, by); ctx.stroke();
          ctx.fillStyle = `rgb(${BRAND.join(",")})`;
          ctx.beginPath(); ctx.arc(bx, by, 1.8, 0, Math.PI * 2); ctx.fill();
        }
      }
      drawHQ();
      if (visible) raf = requestAnimationFrame(frame);
    }

    function staticFrame() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = INK_DOT;
      ctx.beginPath();
      for (const d of dots) { ctx.moveTo(d.tx + R, d.ty); ctx.arc(d.tx, d.ty, R, 0, Math.PI * 2); }
      ctx.fill();
      ctx.strokeStyle = `rgba(${BRAND.join(",")},0.5)`; ctx.lineWidth = 1;
      for (let i = 0; i < VEHICLES; i++) {
        const v = leg(null, 0);
        ctx.beginPath(); ctx.moveTo(v.ax, v.ay); ctx.quadraticCurveTo(v.cx, v.cy, v.bx, v.by); ctx.stroke();
      }
      drawHQ();
    }

    let raf = 0, visible = true;
    layout();
    const ro = new ResizeObserver(() => { layout(); if (reduced) staticFrame(); });
    ro.observe(wrap);
    if (reduced) staticFrame(); else raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([e]) => {
      if (reduced) return;
      const on = e.isIntersecting && document.visibilityState === "visible";
      if (on && !visible) { visible = true; raf = requestAnimationFrame(frame); }
      if (!on) { visible = false; cancelAnimationFrame(raf); }
    });
    io.observe(wrap);
    const onVis = () => {
      if (reduced) return;
      if (document.visibilityState === "hidden") { visible = false; cancelAnimationFrame(raf); }
      else if (!visible) { visible = true; raf = requestAnimationFrame(frame); }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduced]);

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      <canvas ref={canvasRef} role="img" aria-label={ariaLabel} className="absolute inset-0 h-full w-full" />
      {hq ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute translate-x-3 translate-y-2.5 whitespace-nowrap rounded bg-surface/95 px-1.5 py-0.5 text-xs font-semibold text-ink shadow-[0_0_0_1px_rgba(12,14,17,0.08)]"
          style={{ left: hq.x, top: hq.y - 8 }}
        >
          {hqLabel}
        </span>
      ) : null}
    </div>
  );
}
