"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Six milestones on a flowing path. A soft green glow follows the pointer across the panel and,
 * within reach of a milestone, snaps onto it (spring physics, no re-render per frame).
 * Nodes are real buttons (arrow keys move between them); the path fills up to the active step.
 */

// node positions in the 1000×220 viewBox (a gentle wave)
const NODES = [0, 1, 2, 3, 4, 5].map((i) => ({ x: 70 + i * 172, y: 110 + Math.sin(i * 1.15 + 0.4) * 48 }));

function pathThrough(pts: { x: number; y: number }[]) {
  // Catmull-Rom → cubic Bézier, for a smooth line through every node
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function RoadmapPath({
  labels,
  active,
  onSelect,
  stepLabel,
  rtl = false,
}: {
  labels: string[];
  active: number;
  onSelect: (i: number) => void;
  stepLabel: string;
  rtl?: boolean;
}) {
  // Arabic reads right-to-left: mirror the route so step 01 starts on the right
  const nodes = useMemo(() => (rtl ? NODES.map((n) => ({ x: 1000 - n.x, y: n.y })) : NODES), [rtl]);
  const PATH = useMemo(() => pathThrough(nodes), [nodes]);
  const box = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const sx = useSpring(gx, { stiffness: 260, damping: 26, mass: 0.6 });
  const sy = useSpring(gy, { stiffness: 260, damping: 26, mass: 0.6 });
  const scale = useSpring(1, { stiffness: 300, damping: 22 });

  const nodePx = useCallback((i: number) => {
    const r = box.current!.getBoundingClientRect();
    return { x: (nodes[i].x / 1000) * r.width, y: (nodes[i].y / 220) * r.height };
  }, [nodes]);

  // rest on the active node
  useEffect(() => {
    if (!box.current) return;
    const p = nodePx(active);
    gx.set(p.x);
    gy.set(p.y);
  }, [active, nodePx, gx, gy]);

  const onMove = (e: React.PointerEvent) => {
    if (reduce || !box.current) return;
    const r = box.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < NODES.length; i++) {
      const p = nodePx(i);
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) { bestD = d; best = i; }
    }
    if (bestD < 80) {
      const p = nodePx(best);
      gx.set(p.x); gy.set(p.y); scale.set(1.35);
      if (hover !== best) setHover(best);
    } else {
      gx.set(x); gy.set(y); scale.set(0.85);
      if (hover !== null) setHover(null);
    }
  };
  const onLeave = () => {
    const p = nodePx(active);
    gx.set(p.x); gy.set(p.y); scale.set(1);
    setHover(null);
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const rtl = document.documentElement.dir === "rtl";
    const fwd = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    if (e.key === fwd && i < NODES.length - 1) { onSelect(i + 1); (e.currentTarget.parentElement?.children[i + 1] as HTMLElement)?.focus(); }
    if (e.key === back && i > 0) { onSelect(i - 1); (e.currentTarget.parentElement?.children[i - 1] as HTMLElement)?.focus(); }
  };

  return (
    <div ref={box} onPointerMove={onMove} onPointerLeave={onLeave} className="relative hidden aspect-[1000/220] w-full select-none md:block" dir="ltr">
      {/* the animatronic glow */}
      {!reduce ? (
        <motion.div
          aria-hidden="true"
          style={{ x: sx, y: sy, scale }}
          className="pointer-events-none absolute left-0 top-0 -ml-24 -mt-24 size-48 rounded-full bg-[radial-gradient(circle,rgba(108,195,195,0.5),rgba(19,113,121,0.12)_45%,transparent_70%)] blur-xl"
        />
      ) : null}

      <svg viewBox="0 0 1000 220" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <path d={PATH} fill="none" stroke="rgba(19,113,121,0.25)" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
        <motion.path
          d={PATH}
          fill="none"
          stroke="url(#roadmap-fill)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: Math.max(0.001, active / (NODES.length - 1)) }}
          transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
        <defs>
          <linearGradient id="roadmap-fill" x1={rtl ? "1" : "0"} x2={rtl ? "0" : "1"}>
            <stop offset="0" stopColor="#137179" />
            <stop offset="1" stopColor="#6cc3c3" />
          </linearGradient>
        </defs>
      </svg>

      <div role="tablist" aria-label={stepLabel} className="absolute inset-0">
        {nodes.map((n, i) => {
          const on = i === active;
          const done = i < active;
          const lit = on || hover === i;
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls="roadmap-stage"
              tabIndex={on ? 0 : -1}
              onClick={() => onSelect(i)}
              onKeyDown={(e) => onKey(e, i)}
              className="group absolute -translate-x-1/2 -translate-y-1/2 outline-none"
              style={{ left: `${n.x / 10}%`, top: `${(n.y / 220) * 100}%` }}
            >
              <motion.span
                animate={{ scale: lit ? 1.12 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 24 }}
                className={`relative flex size-14 items-center justify-center rounded-2xl border font-display text-lg font-semibold backdrop-blur-md transition-colors duration-300 group-focus-visible:ring-2 group-focus-visible:ring-brand-bright ${
                  on
                    ? "border-teal bg-teal text-white shadow-[0_10px_30px_-8px_rgba(19,113,121,0.8)]"
                    : done
                      ? "border-teal/40 bg-sea-100 text-teal-deep"
                      : "border-teal/25 bg-white/75 text-teal-deep/80"
                }`}
              >
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                {on ? <span aria-hidden="true" className="absolute -inset-2 animate-ping rounded-2xl border border-teal/40 [animation-duration:2.4s] motion-reduce:hidden" /> : null}
              </motion.span>
              <span
                className={`absolute left-1/2 top-full mt-3 w-36 -translate-x-1/2 text-center text-[13px] leading-tight transition-colors ${lit ? "text-teal-deep" : "text-teal-deep/70"}`}
                dir="auto"
              >
                {labels[i]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
