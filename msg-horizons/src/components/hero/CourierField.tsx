"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { KSA_DOTS, KSA_HEIGHT, KSA_WIDTH, RIYADH } from "@/lib/ksa-geo";

/**
 * CourierField — a data graphic, not decoration.
 *   • 1,000 dots  = MSG's 1,000+ couriers; they settle into the Kingdom outward from Riyadh HQ
 *   • 100 lines   = MSG's 100+ vehicles in motion
 *   • a pale ping where a vehicle arrives = a delivery completed
 * Canvas 2D; pauses offscreen and in background tabs; static final frame for reduced motion.
 */

const COURIERS = 1000;
const VEHICLES = 100;
const T_GATHER = 0.2;
const T_VEHICLES = 2.2;

const INK_DOT = "rgba(28,31,36,0.34)";
const BRAND = [31, 67, 224] as const; // --color-brand

type Dot = {
  sx: number; sy: number; tx: number; ty: number; nx: number; ny: number;
  delay: number; dur: number; lit: number; x: number; y: number;
};
type Vehicle = { ax: number; ay: number; bx: number; by: number; cx: number; cy: number; start: number; dur: number; dest: number };
type Ping = { x: number; y: number; t0: number };

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
    }));
    const seeds = dots.map(() => [rand(), rand()] as const);
    const vehicles: Vehicle[] = [];
    const pings: Ping[] = [];
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
      const dest = (rand() * dots.length) | 0;
      const B = dots[dest];
      const len = Math.hypot(B.tx - A[0], B.ty - A[1]) || 1;
      const k = (rand() - 0.5) * 0.5;
      return {
        ax: A[0], ay: A[1], bx: B.tx, by: B.ty,
        cx: (A[0] + B.tx) / 2 - ((B.ty - A[1]) / len) * len * k,
        cy: (A[1] + B.ty) / 2 + ((B.tx - A[0]) / len) * len * k,
        start: t, dur: 2.6 + (len / (KSA_WIDTH * S)) * 6 + rand(), dest,
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
      ctx.fillStyle = INK_DOT;
      ctx.beginPath();
      const lit: Dot[] = [];
      for (const d of dots) {
        const p = Math.min(1, Math.max(0, (t - T_GATHER - d.delay) / d.dur));
        const e = easeOut(p);
        d.x = d.sx + (d.tx - d.sx) * e; d.y = d.sy + (d.ty - d.sy) * e;
        if (p === 0) continue; // not yet deployed: still at HQ
        d.lit *= 0.97;
        ctx.moveTo(d.x + R, d.y); ctx.arc(d.x, d.y, R, 0, Math.PI * 2);
        if (d.lit > 0.05) lit.push(d);
      }
      ctx.fill();
      for (const d of lit) {
        ctx.fillStyle = `rgba(${BRAND[0]},${BRAND[1]},${BRAND[2]},${Math.min(1, d.lit) * 0.4})`; // pale: never mistaken for a vehicle
        ctx.beginPath(); ctx.arc(d.x, d.y, R, 0, Math.PI * 2); ctx.fill();
      }

      // vehicles: a tracking marker gliding along its route, with the remaining route shown ahead
      if (t > T_VEHICLES) {
        const due = Math.min(VEHICLES, Math.floor((t - T_VEHICLES) / 0.025));
        while (vehicles.length < due) vehicles.push(leg(null, t));
        const brand = BRAND.join(",");
        // routes ahead (one batched dashed stroke)
        ctx.setLineDash([1.5, 3.5]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(${brand},0.28)`;
        ctx.beginPath();
        const heads: [number, number][] = [];
        for (let i = 0; i < vehicles.length; i++) {
          let v = vehicles[i];
          let u = (t - v.start) / v.dur;
          if (u >= 1) {
            pings.push({ x: v.bx, y: v.by, t0: t });
            dots[v.dest].lit = 1;
            v = vehicles[i] = leg([v.bx, v.by], t);
            u = 0;
          }
          const ue = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
          const [hx, hy] = bez(v, ue);
          heads.push([hx, hy]);
          // remaining path from the marker to the destination
          const [mx, my] = bez(v, (ue + 1) / 2);
          const cx2 = 2 * mx - (hx + v.bx) / 2, cy2 = 2 * my - (hy + v.by) / 2;
          ctx.moveTo(hx, hy);
          ctx.quadraticCurveTo(cx2, cy2, v.bx, v.by);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        // delivery pings
        for (let i = pings.length - 1; i >= 0; i--) {
          const k = (t - pings[i].t0) / 0.9;
          if (k >= 1) { pings.splice(i, 1); continue; }
          ctx.strokeStyle = `rgba(${brand},${0.55 * (1 - k)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(pings[i].x, pings[i].y, 2 + k * 9, 0, Math.PI * 2); ctx.stroke();
        }
        // markers
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#ffffff";
        ctx.fillStyle = `rgb(${brand})`;
        for (const [hx, hy] of heads) {
          ctx.beginPath(); ctx.arc(hx, hy, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
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
      const legs = Array.from({ length: VEHICLES }, () => leg(null, 0));
      ctx.setLineDash([1.5, 3.5]); ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${BRAND.join(",")},0.28)`;
      ctx.beginPath();
      for (const v of legs) { ctx.moveTo(v.ax, v.ay); ctx.quadraticCurveTo(v.cx, v.cy, v.bx, v.by); }
      ctx.stroke(); ctx.setLineDash([]);
      ctx.lineWidth = 1.5; ctx.strokeStyle = "#ffffff"; ctx.fillStyle = `rgb(${BRAND.join(",")})`;
      for (const v of legs) {
        const [hx, hy] = bez(v, 0.35);
        ctx.beginPath(); ctx.arc(hx, hy, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
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
