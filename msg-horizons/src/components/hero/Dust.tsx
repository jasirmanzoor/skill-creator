"use client";

import { useEffect, useRef } from "react";

/**
 * Motes of dust drifting through warm light in front of the warehouse. Purely atmospheric: a few dozen soft
 * points on a canvas, paused whenever `run` says the facade is not on screen.
 */
export default function Dust({ run, className = "" }: { run: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const live = useRef(run);
  useEffect(() => { live.current = run; }, [run]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0, raf = 0, last = 0;
    const size = () => {
      const b = cv.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = b.width; h = b.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    // seeded so the field looks the same on every visit
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const motes = Array.from({ length: 70 }, () => ({
      x: rnd(), y: rnd(), r: 0.6 + rnd() * 1.8, vx: 0.004 + rnd() * 0.012, vy: -0.002 - rnd() * 0.006, ph: rnd() * 6.28, a: 0.25 + rnd() * 0.5,
    }));
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!live.current || document.hidden) { last = now; return; }
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.x += m.vx * dt; m.y += m.vy * dt; m.ph += dt * 0.8;
        if (m.x > 1.02) m.x = -0.02;
        if (m.y < -0.02) m.y = 1.02;
        // brighter in the upper light, fading toward the road
        const glow = m.a * (0.55 + 0.45 * Math.sin(m.ph)) * (1 - m.y * 0.6);
        const px = m.x * w, py = m.y * h;
        const g = ctx.createRadialGradient(px, py, 0, px, py, m.r * 3);
        g.addColorStop(0, `rgba(255,246,222,${glow})`);
        g.addColorStop(1, "rgba(255,246,222,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, m.r * 3, 0, Math.PI * 2); ctx.fill();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 size-full ${className}`} />;
}
