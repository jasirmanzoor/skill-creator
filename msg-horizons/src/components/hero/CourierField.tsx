"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { KSA_DOTS, KSA_HEIGHT, KSA_WIDTH, RIYADH } from "@/lib/ksa-geo";

/**
 * CourierField — the opening sequence.
 *
 * Data encoding (deliberately literal, so the visual is also a truthful chart):
 *   • 1,000 dots  = MSG's 1,000+ couriers (they assemble into the Kingdom, radiating from Riyadh HQ)
 *   • 100 trails  = MSG's 100+ vehicles
 *   • rotating sweep lighting the network = 24/7 operations
 *
 * Canvas 2D (no WebGL dependency): ~1,100 primitives per frame is well within budget on
 * mid-range phones. Pauses offscreen / in background tabs; renders a static final frame
 * for prefers-reduced-motion.
 */

const COURIERS = 1000;
const VEHICLES = 100;
const SWEEP_PERIOD = 9; // seconds per revolution
const T_GATHER = 0.35;
const T_VEHICLES = 2.4;

type Dot = {
  sx: number; sy: number; // scattered start
  tx: number; ty: number; // target on map
  nx: number; ny: number; // normalised target (map space)
  delay: number; dur: number; curve: number;
  theta: number; // angle from HQ
  lit: number;
  ox: number; oy: number; // pointer displacement
  x: number; y: number; // last drawn position
  seed: number;
};
type Vehicle = {
  ax: number; ay: number; bx: number; by: number; cx: number; cy: number;
  start: number; dur: number; born: number;
};

type Props = {
  labels: {
    courier: string; vehicle: string; sweep: string; hq: string; replay: string;
    couriersWord: string; vehiclesWord: string; couriersFinal: string; vehiclesFinal: string;
  };
  rtl: boolean;
  ariaLabel: string;
};

// Deterministic PRNG so the layout is stable across renders/resizes.
function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const easeOut = (p: number) => 1 - Math.pow(1 - p, 4);

export default function CourierField({ labels, rtl, ariaLabel }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const courierCountRef = useRef<HTMLSpanElement>(null);
  const vehicleCountRef = useRef<HTMLSpanElement>(null);
  const startRef = useRef(0);
  const [hq, setHq] = useState<{ x: number; y: number } | null>(null);
  const [done, setDone] = useState(false);
  const reducedMotion = useReducedMotion();

  const replay = useCallback(() => {
    startRef.current = performance.now();
    setDone(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const reduced = reducedMotion;
    const rand = mulberry32(20260101);

    // Take exactly 1,000 grid points (one per courier), evenly thinned.
    const pts = KSA_DOTS.slice(0, COURIERS);

    const maxD = Math.max(...pts.map(([x, y]) => Math.hypot(x - RIYADH[0], y - RIYADH[1])));
    const dots: Dot[] = pts.map(([x, y]) => {
      const d = Math.hypot(x - RIYADH[0], y - RIYADH[1]) / maxD;
      return {
        sx: 0, sy: 0, tx: 0, ty: 0, nx: x, ny: y,
        delay: d * 1.5 + rand() * 0.35,
        dur: 1.0 + rand() * 0.5,
        curve: (rand() - 0.5) * 0.5,
        theta: Math.atan2(y - RIYADH[1], x - RIYADH[0]),
        lit: 0, ox: 0, oy: 0, x: 0, y: 0, seed: rand() * Math.PI * 2,
      };
    });
    const startSeeds = dots.map(() => [rand(), rand()] as const);

    let W = 0, H = 0, S = 1, MX = 0, MY = 0, R = 2, DPR = 1;
    let hqX = 0, hqY = 0;
    const vehicles: Vehicle[] = [];

    const toScreen = (nx: number, ny: number) => [MX + nx * S, MY + ny * S] as const;

    function layout() {
      const rect = wrap.getBoundingClientRect();
      W = rect.width; H = rect.height;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      // Map region: beside the copy on wide screens, above it on narrow ones.
      let rx: number, ry: number, rw: number, rh: number;
      if (W >= 1024) {
        rw = W * 0.5; rh = H * 0.74; ry = H * 0.13;
        rx = rtl ? W * 0.04 : W * 0.46;
      } else {
        rw = W * 0.94; rh = H * 0.46; ry = H * 0.09; rx = W * 0.03;
      }
      S = Math.min(rw / KSA_WIDTH, rh / KSA_HEIGHT);
      MX = rx + (rw - KSA_WIDTH * S) / 2;
      MY = ry + (rh - KSA_HEIGHT * S) / 2;
      R = Math.max(1, Math.min(2.6, 22 * S * 0.21));
      [hqX, hqY] = toScreen(RIYADH[0], RIYADH[1]);
      setHq({ x: hqX, y: hqY });

      dots.forEach((d, i) => {
        [d.tx, d.ty] = toScreen(d.nx, d.ny);
        d.sx = startSeeds[i][0] * W * 1.1 - W * 0.05;
        d.sy = startSeeds[i][1] * H * 1.1 - H * 0.05;
      });
      vehicles.length = 0;
    }

    function newLeg(v: Vehicle | null, now: number, born: number): Vehicle {
      const fromHQ = rand() < 0.4;
      const a = v ? [v.bx, v.by] : fromHQ ? [hqX, hqY] : [dots[(rand() * dots.length) | 0].tx, dots[(rand() * dots.length) | 0].ty];
      const target = dots[(rand() * dots.length) | 0];
      const bx = target.tx, by = target.ty;
      const mx = (a[0] + bx) / 2, my = (a[1] + by) / 2;
      const len = Math.hypot(bx - a[0], by - a[1]);
      const k = (rand() - 0.5) * 0.6;
      return {
        ax: a[0], ay: a[1], bx, by,
        cx: mx - ((by - a[1]) / (len || 1)) * len * k,
        cy: my + ((bx - a[0]) / (len || 1)) * len * k,
        start: now, dur: 1.8 + (len / (KSA_WIDTH * S)) * 4 + rand() * 1.2, born,
      };
    }

    const bez = (v: Vehicle, u: number) => {
      const m = 1 - u;
      return [m * m * v.ax + 2 * m * u * v.cx + u * u * v.bx, m * m * v.ay + 2 * m * u * v.cy + u * u * v.by] as const;
    };

    let pointerX = -9999, pointerY = -9999;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointerX = e.clientX - r.left; pointerY = e.clientY - r.top;
    };
    const onLeave = () => { pointerX = pointerY = -9999; };
    wrap.addEventListener("pointermove", onMove, { passive: true });
    wrap.addEventListener("pointerleave", onLeave);

    let raf = 0, visible = true, lastCourier = -1, lastVehicle = -1, finished = false;

    function setCounters(c: number, v: number) {
      if (c !== lastCourier && courierCountRef.current) {
        courierCountRef.current.textContent = c >= COURIERS ? labels.couriersFinal : c.toLocaleString("en-US");
        lastCourier = c;
      }
      if (v !== lastVehicle && vehicleCountRef.current) {
        vehicleCountRef.current.textContent = v >= VEHICLES ? labels.vehiclesFinal : String(v);
        lastVehicle = v;
      }
    }

    function frame(nowMs: number) {
      const t = (nowMs - startRef.current) / 1000;
      ctx.clearRect(0, 0, W, H);

      // --- HQ glow ---
      const g = ctx.createRadialGradient(hqX, hqY, 0, hqX, hqY, 260 * S + 40);
      g.addColorStop(0, "rgba(246,166,35,0.16)");
      g.addColorStop(1, "rgba(246,166,35,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // --- sweep (24/7) ---
      const sweepOn = t > T_VEHICLES;
      const sweepA = ((t / SWEEP_PERIOD) * Math.PI * 2) % (Math.PI * 2) - Math.PI;
      if (sweepOn) {
        const fade = Math.min(1, (t - T_VEHICLES) / 1.5);
        const len = KSA_WIDTH * S * 0.42;
        const grad = ctx.createLinearGradient(hqX, hqY, hqX + Math.cos(sweepA) * len, hqY + Math.sin(sweepA) * len);
        grad.addColorStop(0, `rgba(246,166,35,${0.45 * fade})`);
        grad.addColorStop(1, "rgba(246,166,35,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hqX, hqY);
        ctx.lineTo(hqX + Math.cos(sweepA) * len, hqY + Math.sin(sweepA) * len);
        ctx.stroke();
      }

      // --- couriers ---
      let landed = 0;
      ctx.fillStyle = "rgba(196,206,226,0.62)";
      ctx.beginPath();
      const litList: Dot[] = [];
      for (const d of dots) {
        const p = Math.min(1, Math.max(0, (t - T_GATHER - d.delay) / d.dur));
        let x: number, y: number;
        if (p <= 0) {
          x = d.sx + Math.sin(t * 0.7 + d.seed) * 6;
          y = d.sy + Math.cos(t * 0.6 + d.seed) * 6;
        } else {
          const e = easeOut(p);
          const dx = d.tx - d.sx, dy = d.ty - d.sy;
          const bow = Math.sin(e * Math.PI) * d.curve;
          x = d.sx + dx * e - dy * bow;
          y = d.sy + dy * e + dx * bow;
          if (p >= 1) landed++;
        }
        // pointer: gentle displacement, springs back
        let tox = 0, toy = 0;
        const px = x - pointerX, py = y - pointerY, pd = px * px + py * py;
        if (pd < 8100) {
          const f = (1 - Math.sqrt(pd) / 90) * 14;
          const inv = 1 / (Math.sqrt(pd) || 1);
          tox = px * inv * f; toy = py * inv * f;
          d.lit = Math.max(d.lit, 0.5);
        }
        d.ox += (tox - d.ox) * 0.12; d.oy += (toy - d.oy) * 0.12;
        x += d.ox; y += d.oy;

        if (sweepOn && p >= 1) {
          let diff = sweepA - d.theta;
          diff = Math.atan2(Math.sin(diff), Math.cos(diff));
          if (diff > 0 && diff < 0.5) d.lit = Math.max(d.lit, 1 - diff / 0.5);
        }
        d.lit *= 0.965;
        const r = p > 0 && p < 1 ? R * 0.9 : p <= 0 ? R * 0.75 : R;
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
        d.x = x; d.y = y;
        if (d.lit > 0.04) litList.push(d);
      }
      ctx.fill();

      ctx.fillStyle = "#f6a623";
      for (const d of litList) {
        ctx.globalAlpha = Math.min(1, d.lit);
        ctx.beginPath();
        ctx.arc(d.x, d.y, R * (1 + d.lit * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // --- vehicles ---
      let spawned = 0;
      if (t < T_VEHICLES && vehicles.length) vehicles.length = 0; // replay
      if (t > T_VEHICLES) {
        const due = Math.min(VEHICLES, Math.floor((t - T_VEHICLES) / 0.018));
        while (vehicles.length < due) vehicles.push(newLeg(null, t, t));
        spawned = vehicles.length;
        ctx.lineCap = "round";
        for (let i = 0; i < vehicles.length; i++) {
          let v = vehicles[i];
          let u = (t - v.start) / v.dur;
          if (u >= 1) { v = vehicles[i] = newLeg(v, t, v.born); u = 0; }
          const ue = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
          const tail = Math.max(0, ue - 0.16);
          const steps = 6;
          let [px, py] = bez(v, tail);
          for (let s = 1; s <= steps; s++) {
            const [qx, qy] = bez(v, tail + ((ue - tail) * s) / steps);
            ctx.strokeStyle = `rgba(79,227,193,${(s / steps) * 0.75})`;
            ctx.lineWidth = 0.6 + (s / steps) * 1.1;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(qx, qy); ctx.stroke();
            px = qx; py = qy;
          }
          ctx.fillStyle = "#dffcf4";
          ctx.beginPath(); ctx.arc(px, py, 1.7, 0, Math.PI * 2); ctx.fill();
        }
      }

      // --- HQ pulse ---
      const pulse = (t % 2.4) / 2.4;
      ctx.strokeStyle = `rgba(246,166,35,${0.7 * (1 - pulse)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(hqX, hqY, 5 + pulse * 22, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#f6a623";
      ctx.beginPath(); ctx.arc(hqX, hqY, 4, 0, Math.PI * 2); ctx.fill();

      setCounters(landed, spawned);
      if (!finished && landed >= COURIERS && spawned >= VEHICLES) { finished = true; setDone(true); }
      if (finished && landed < COURIERS) finished = false; // replay

      if (visible) raf = requestAnimationFrame(frame);
    }

    function staticFrame() {
      // Reduced motion: final composed state, no animation.
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(196,206,226,0.62)";
      ctx.beginPath();
      for (const d of dots) { ctx.moveTo(d.tx + R, d.ty); ctx.arc(d.tx, d.ty, R, 0, Math.PI * 2); }
      ctx.fill();
      ctx.lineWidth = 1.2;
      for (let i = 0; i < VEHICLES; i++) {
        const v = newLeg(null, 0, 0);
        ctx.strokeStyle = "rgba(79,227,193,0.35)";
        ctx.beginPath(); ctx.moveTo(v.ax, v.ay); ctx.quadraticCurveTo(v.cx, v.cy, v.bx, v.by); ctx.stroke();
      }
      ctx.fillStyle = "#f6a623";
      ctx.beginPath(); ctx.arc(hqX, hqY, 4.5, 0, Math.PI * 2); ctx.fill();
      setCounters(COURIERS, VEHICLES);
      setDone(true);
    }

    layout();
    startRef.current = performance.now();

    const ro = new ResizeObserver(() => { layout(); if (reduced) staticFrame(); });
    ro.observe(wrap);

    if (reduced) {
      staticFrame();
    } else {
      raf = requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(([entry]) => {
      if (reduced) return;
      const nowVisible = entry.isIntersecting && document.visibilityState === "visible";
      if (nowVisible && !visible) { visible = true; raf = requestAnimationFrame(frame); }
      if (!nowVisible) { visible = false; cancelAnimationFrame(raf); }
    });
    io.observe(wrap);
    const onVis = () => {
      if (reduced) return;
      if (document.visibilityState === "hidden") { visible = false; cancelAnimationFrame(raf); }
      else if (!visible) { visible = true; raf = requestAnimationFrame(frame); }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [rtl, reducedMotion, labels.couriersFinal, labels.vehiclesFinal]);

  return (
    <div ref={wrapRef} className="absolute inset-0" >
      <canvas ref={canvasRef} role="img" aria-label={ariaLabel} className="absolute inset-0 h-full w-full" />
      {hq ? (
        <div
          className="pointer-events-none absolute -translate-x-1/2 translate-y-3 whitespace-nowrap rounded-full border border-sun/40 bg-ink/70 px-2.5 py-1 text-[11px] font-medium text-sun-soft backdrop-blur-sm"
          style={{ left: hq.x, top: hq.y }}
          aria-hidden="true"
        >
          {labels.hq}
        </div>
      ) : null}

      {/* Live counters + legend: the "chart key" that makes the visual literal. */}
      <div
        className={`pointer-events-none absolute bottom-6 hidden gap-6 lg:flex ${rtl ? "left-[6%]" : "right-[4%]"}`}
        aria-hidden="true"
      >
        <div className="rounded-2xl border border-line bg-ink/60 px-4 py-3 backdrop-blur-md">
          <div className="flex items-baseline gap-2">
            <span ref={courierCountRef} className="num font-display text-3xl font-semibold text-white">0</span>
            <span className="text-sm text-fog">{labels.couriersWord}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-fog">
            <span className="inline-block size-2 rounded-full bg-[#c4cee2]" /> {labels.courier}
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-ink/60 px-4 py-3 backdrop-blur-md">
          <div className="flex items-baseline gap-2">
            <span ref={vehicleCountRef} className="num font-display text-3xl font-semibold text-white">0</span>
            <span className="text-sm text-fog">{labels.vehiclesWord}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-fog">
            <span className="inline-block h-0.5 w-4 rounded bg-signal" /> {labels.vehicle}
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-ink/60 px-4 py-3 backdrop-blur-md">
          <div className="num font-display text-3xl font-semibold text-white">24/7</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-fog">
            <span className="inline-block size-2 rounded-full bg-sun" /> {labels.sweep}
          </div>
        </div>
      </div>

      {reducedMotion ? null : <button
        type="button"
        onClick={replay}
        className={`absolute top-24 z-10 rounded-full border border-line bg-ink/50 px-3 py-1.5 text-xs text-fog backdrop-blur transition hover:border-sun/50 hover:text-white ${
          rtl ? "left-4 lg:left-[6%]" : "right-4 lg:right-[4%]"
        } ${done ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-label={labels.replay}
        tabIndex={done ? 0 : -1}
      >
        ↻ {labels.replay}
      </button>}
    </div>
  );
}
