"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * A staff pass on a lanyard, after Kern's "Lanyard Pass" for Framer, drawn with plain DOM and a small pendulum
 * simulation instead of a 3D engine: the strap hangs from the top of its box and the pass swings on it under gravity.
 * Grab the pass and throw it; it swings back and settles. Click (without dragging) to turn it over. It drops in once
 * when it first comes into view. Under reduced motion it simply hangs still and still turns over.
 */
export default function LanyardPass({ front, back, strapText, label, flipLabel }: {
  front: React.ReactNode; back: React.ReactNode; strapText: string; label: string; flipLabel: string;
}) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const strap = useRef<SVGPathElement>(null);
  const strapText1 = useRef<SVGTextPathElement>(null);
  const [flipped, setFlipped] = useState(false);
  const st = useRef({ x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, L: 260, drag: null as null | { dx: number; dy: number; moved: number; lx: number; ly: number; t: number }, dropped: false });

  useEffect(() => {
    const el = box.current, c = card.current, path = strap.current;
    if (!el || !c || !path) return;
    const s = st.current;
    const size = () => { const h = el.clientHeight; s.L = Math.max(160, h * 0.44); };
    size();
    // start hanging straight down; drop in from above the first time it is seen
    s.x = 0; s.y = reduce ? s.L : s.L * 0.15;
    const ro = new ResizeObserver(size); ro.observe(el);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !s.dropped) { s.dropped = true; s.vx = 140; } }, { threshold: 0.3 });
    io.observe(el);
    let raf = 0, last = performance.now();
    const G = 2400, AIR = 0.985;
    const tick = (t: number) => {
      const dt = Math.min(1 / 30, (t - last) / 1000);
      last = t;
      if (!s.drag && !reduce) {
        s.vy += G * dt;
        s.vx *= AIR; s.vy *= AIR;
        s.x += s.vx * dt; s.y += s.vy * dt;
        // the strap does not stretch: pull the pass back onto the circle and keep only the sideways speed
        const d = Math.hypot(s.x, s.y);
        if (d > s.L) {
          const nx = s.x / d, ny = s.y / d;
          s.x = nx * s.L; s.y = ny * s.L;
          const vn = s.vx * nx + s.vy * ny;
          if (vn > 0) { s.vx -= vn * nx; s.vy -= vn * ny; }
        }
      } else if (reduce && !s.drag) { s.x = 0; s.y = s.L; s.vx = s.vy = 0; }
      // the pass turns with the strap's angle and a little of its swing
      const ang = Math.atan2(s.x, s.y);
      const target = (-ang * 180) / Math.PI * 0.9 + (s.drag ? 0 : -s.vx * 0.01);
      s.vr += (target - s.rot) * 60 * dt; s.vr *= 0.82; s.rot += s.vr * dt * 10;
      c.style.transform = `translate(-50%, 0) translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px) rotate(${s.rot.toFixed(2)}deg)`;
      // the strap: from the anchor to the clip on top of the pass, sagging a little when slack
      const slack = Math.max(0, s.L - Math.hypot(s.x, s.y));
      const mx = s.x / 2, my = s.y / 2 + slack * 0.6;
      path.setAttribute("d", `M 0 -20 Q ${mx.toFixed(1)} ${my.toFixed(1)} ${s.x.toFixed(1)} ${s.y.toFixed(1)}`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [reduce]);

  const toLocal = (e: React.PointerEvent) => { const r = box.current!.getBoundingClientRect(); return { x: e.clientX - (r.left + r.width / 2), y: e.clientY - r.top - 24 }; };
  const onDown = (e: React.PointerEvent) => {
    const s = st.current, p = toLocal(e);
    s.drag = { dx: p.x - s.x, dy: p.y - s.y, moved: 0, lx: p.x, ly: p.y, t: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const s = st.current, d = s.drag;
    if (!d) return;
    const p = toLocal(e), now = performance.now();
    d.moved += Math.hypot(p.x - d.lx, p.y - d.ly);
    let nx = p.x - d.dx, ny = p.y - d.dy;
    const dist = Math.hypot(nx, ny);
    if (dist > s.L * 1.15) { nx = (nx / dist) * s.L * 1.15; ny = (ny / dist) * s.L * 1.15; }
    const k = 1000 / Math.max(8, now - d.t);
    s.vx = (nx - s.x) * k * 0.6; s.vy = (ny - s.y) * k * 0.6;
    s.x = nx; s.y = ny;
    d.lx = p.x; d.ly = p.y; d.t = now;
  };
  const onUp = () => {
    const s = st.current, d = s.drag;
    s.drag = null;
    if (d && d.moved < 6) setFlipped((f) => !f);
  };

  return (
    <div ref={box} className="relative h-full w-full touch-pan-y select-none" aria-label={label} role="group">
      {/* the anchor and the strap */}
      <svg aria-hidden="true" className="pointer-events-none absolute left-1/2 top-6 overflow-visible" width="1" height="1">
        <defs>
          <linearGradient id="lanyard-strap" x1="0" x2="1">
            <stop offset="0" stopColor="#0a3b8f" /><stop offset="0.5" stopColor="#009df8" /><stop offset="1" stopColor="#0a3b8f" />
          </linearGradient>
        </defs>
        <path ref={strap} id="lanyard-path" d="M 0 -20 L 0 200" fill="none" stroke="url(#lanyard-strap)" strokeWidth="30" strokeLinecap="round" />
        <text fontSize="11.5" fontWeight="800" letterSpacing="2" fill="#ffffff" fillOpacity="0.9" dy="4">
          <textPath ref={strapText1} href="#lanyard-path" startOffset="4%">{`${strapText}   ·   ${strapText}`}</textPath>
        </text>
      </svg>
      {/* the pass */}
      <div ref={card} className="absolute left-1/2 top-6 cursor-grab active:cursor-grabbing" style={{ transformOrigin: "50% 0" }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        {/* the clip */}
        <span aria-hidden="true" className="absolute left-1/2 top-[-14px] z-10 h-6 w-9 -translate-x-1/2 rounded-md bg-gradient-to-b from-[#d9dee7] to-[#8d96a6] shadow-md ring-1 ring-black/20" />
        <button type="button" aria-label={flipLabel} aria-pressed={flipped}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped((f) => !f); } }}
          className="relative block h-[25rem] w-[17.5rem] [perspective:1400px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-bright sm:h-[27rem] sm:w-[19rem]"
          tabIndex={0}>
          <span className="relative block size-full transition-transform duration-700 [transform-style:preserve-3d] ease-[cubic-bezier(0.4,0.1,0.2,1)]" style={{ transform: flipped ? "rotateY(180deg)" : "none" }}>
            <span aria-hidden={flipped} className="absolute inset-0 overflow-hidden rounded-[1.4rem] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/15 [backface-visibility:hidden]">{front}</span>
            <span aria-hidden={!flipped} className="absolute inset-0 overflow-hidden rounded-[1.4rem] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/15 [backface-visibility:hidden] [transform:rotateY(180deg)]">{back}</span>
          </span>
        </button>
      </div>
    </div>
  );
}
