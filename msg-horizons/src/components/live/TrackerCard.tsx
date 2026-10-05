"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { LiveCopy } from "@/content/liveTracking";
import { CheckIcon } from "../ui/icons";
import { VanGlyph } from "./glyphs";

const VB = { w: 480, h: 300 };
const START = { x: 62, y: 236 };
const END = { x: 420, y: 64 };
const ROUTE = "M 62 236 C 148 236, 140 152, 232 148 S 358 98, 420 64";

/** a calm, stylised district: soft ground, a few parks, curved roads. Not a real place. */
const ROADS: { d: string; w: number; art?: boolean }[] = [
  { d: "M -20 118 C 90 150, 190 62, 320 98 S 470 142, 520 116", w: 11, art: true },
  { d: "M -20 276 C 80 236, 170 282, 276 236 S 440 196, 520 222", w: 8 },
  { d: "M 24 -20 C 76 78, 36 170, 118 320", w: 8 },
  { d: "M 156 -20 C 196 66, 338 40, 338 142 S 306 266, 364 320", w: 8 },
  { d: "M 430 -20 C 400 70, 452 150, 500 190", w: 7 },
  { d: "M -20 190 C 60 176, 120 200, 190 188", w: 4 },
  { d: "M 200 190 C 250 184, 300 214, 330 250", w: 4 },
  { d: "M 250 -10 C 262 28, 250 60, 270 96", w: 4 },
  { d: "M 340 140 C 380 128, 420 150, 470 140", w: 4 },
  { d: "M 60 -10 C 90 20, 100 60, 150 70", w: 4 },
  { d: "M 120 250 C 150 300, 200 290, 230 310", w: 4 },
];
const PARKS = [
  "M 372 210 c 20 -22 56 -18 66 6 c 8 22 -14 40 -40 36 c -26 -4 -38 -24 -26 -42 z",
  "M 20 40 c 14 -18 50 -22 62 -2 c 10 18 -4 38 -28 42 c -26 4 -48 -22 -34 -40 z",
  "M 214 232 c 16 -12 40 -8 46 8 c 4 14 -12 26 -30 24 c -18 -2 -28 -20 -16 -32 z",
];
const BLOCKS = [
  [176, 172, 64, 28], [264, 170, 46, 30], [366, 150, 60, 26], [90, 96, 52, 30], [190, 22, 58, 30],
  [356, 14, 52, 28], [40, 190, 48, 26], [286, 262, 56, 22], [150, 266, 40, 24], [420, 100, 40, 30],
];

const pct = (n: number, of: number) => `${(n / of) * 100}%`;

/**
 * What the seller and their customer see. Before the driver approves there is no location at all;
 * once they do, the driver's dot moves along the route and the page says so. The movement is a
 * demonstration along a sample route, never real data.
 */
export default function TrackerCard({ c, live, reduce }: { c: LiveCopy; live: boolean; reduce: boolean }) {
  const tr = c.tracker;
  const route = useRef<SVGPathElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const dot = useRef<SVGGElement>(null);
  const arrow = useRef<SVGGElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const path = route.current, tl = trail.current, g = dot.current, ar = arrow.current;
    if (!path || !tl || !g || !ar) return;
    const L = path.getTotalLength();
    const place = (p: number, alpha: number) => {
      const a = path.getPointAtLength(p * L);
      const b = path.getPointAtLength(Math.min(L, p * L + 3));
      g.setAttribute("transform", `translate(${a.x.toFixed(2)} ${a.y.toFixed(2)})`);
      ar.setAttribute("transform", `rotate(${((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI + 90).toFixed(1)})`);
      g.style.opacity = String(alpha);
      tl.style.opacity = String(alpha);
      tl.style.strokeDasharray = `${(p * L).toFixed(1)} ${L.toFixed(1)}`;
    };
    if (!live) { place(0, 0); return; }
    if (reduce) { place(0.46, 1); return; }

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.05 });
    if (box.current) io.observe(box.current);
    const DUR = 15000, HOLD = 1700, t0 = performance.now();
    const tick = (now: number) => {
      if (visible && !document.hidden) {
        const e = ((now - t0) % (DUR + HOLD)) / DUR; // 0..1 along the route, then a short hold
        const alpha = e < 0.04 ? e / 0.04 : e > 1 ? Math.max(0, 1 - (e - 1) / 0.07) : 1;
        place(Math.min(1, e), alpha);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [live, reduce]);

  const state: ("done" | "active" | "todo")[] = live ? ["done", "active", "todo"] : ["done", "todo", "todo"];
  const swap = reduce ? { duration: 0 } : { duration: 0.5 };

  return (
    <div role="group" aria-label={tr.label} className="w-full overflow-hidden rounded-[1.75rem] bg-white text-ink shadow-[0_50px_100px_-40px_rgba(0,0,0,0.7)] ring-1 ring-white/20">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
        <p className="font-display text-[15px] font-semibold text-teal-deep">{tr.title}</p>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors duration-500 ${live ? "bg-[#e8f5ec] text-[#086a2d]" : "bg-subtle text-muted"}`}
        >
          <span className="relative flex size-2">
            {live ? <span className="plan-ping absolute inset-0 rounded-full bg-[#0b7d36] motion-reduce:hidden" aria-hidden="true" /> : null}
            <span className={`relative size-2 rounded-full ${live ? "bg-[#0b7d36]" : "bg-faint"}`} />
          </span>
          {live ? tr.chipLive : tr.chipWaiting}
        </span>
      </div>

      {/* map */}
      <div ref={box} className="relative aspect-[16/10] w-full overflow-hidden bg-[#e6f1ef]">
        <svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className={`absolute inset-0 size-full transition-[filter] duration-700 ${live ? "" : "saturate-[0.55]"}`}
          aria-hidden="true"
        >
          <rect width={VB.w} height={VB.h} fill="#e6f1ef" />
          {PARKS.map((d, i) => <path key={i} d={d} fill="#cfe8d8" />)}
          {BLOCKS.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} rx="7" fill="#f4faf9" opacity="0.8" />)}
          {ROADS.map((r, i) => <path key={`c${i}`} d={r.d} fill="none" stroke={r.art ? "#e3d6a8" : "#cddcd9"} strokeWidth={r.w + 3} strokeLinecap="round" />)}
          {ROADS.map((r, i) => <path key={`f${i}`} d={r.d} fill="none" stroke={r.art ? "#fff3c8" : "#ffffff"} strokeWidth={r.w} strokeLinecap="round" />)}

          {/* the route: dotted ahead, solid behind the driver */}
          <path d={ROUTE} fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
          <path ref={route} d={ROUTE} fill="none" stroke="#137179" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round" strokeDasharray="0.1 9" />
          <path
            ref={trail}
            d={ROUTE}
            fill="none"
            stroke="#0b7d36"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray="0 9999"
            style={{ opacity: 0, filter: "drop-shadow(0 0 5px rgba(11,125,54,0.55))" }}
          />

          {/* pickup and delivery */}
          <g transform={`translate(${START.x} ${START.y})`}>
            <circle r="13" fill="#fff" />
            <circle r="9.5" fill="#0b3a40" />
            <rect x="-3.5" y="-3.5" width="7" height="7" rx="1.4" fill="#fff" />
          </g>
          <g transform={`translate(${END.x} ${END.y})`}>
            <circle r="15" fill="#0b7d36" opacity="0.18" />
            <circle r="12" fill="#fff" />
            <circle r="9" fill="#0b7d36" />
            <path d="M-4.2 0.6 0 -3.4l4.2 4v3.6h-8.4z" fill="#fff" />
          </g>

          {/* the driver */}
          <g ref={dot} style={{ opacity: 0 }}>
            <circle r="30" fill="#0b7d36" opacity="0.16" className="plan-ping motion-reduce:hidden" />
            <circle r="18" fill="#0b7d36" opacity="0.2" />
            <circle r="12" fill="#fff" />
            <circle r="8.4" fill="#0b3a40" />
            <g ref={arrow}><path d="M0 -4.8 L4 3.4 L0 1.3 L-4 3.4 Z" fill="#fff" /></g>
          </g>
        </svg>

        <span
          className="absolute -translate-x-1/2 translate-y-3 whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-teal-deep shadow-[0_6px_16px_-8px_rgba(11,58,64,0.6)]"
          style={{ left: pct(START.x, VB.w), top: pct(START.y, VB.h) }}
        >
          {tr.mapPickup}
        </span>
        <span
          className="absolute -translate-x-1/2 translate-y-3.5 whitespace-nowrap rounded-full bg-[#0b7d36] px-2 py-0.5 text-[11px] font-semibold text-white shadow-[0_6px_16px_-8px_rgba(11,125,54,0.8)]"
          style={{ left: pct(END.x, VB.w), top: pct(END.y, VB.h) }}
        >
          {tr.mapDrop}
        </span>

        <AnimatePresence>
          {!live ? (
            <motion.div
              key="waiting"
              className="absolute inset-0 grid place-items-center bg-white/55 p-4 backdrop-blur-[3px]"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={swap}
            >
              <div className="max-w-[17rem] text-center">
                <span className="relative mx-auto grid size-11 place-items-center rounded-full bg-white text-teal shadow-[0_10px_24px_-12px_rgba(11,58,64,0.6)]">
                  <span className="plan-ping absolute inset-0 rounded-full bg-teal/30 motion-reduce:hidden" aria-hidden="true" />
                  <VanGlyph className="relative size-5" />
                </span>
                <p className="mt-3 font-display text-[15px] font-semibold leading-snug text-teal-deep">{tr.waitingTitle}</p>
                <p className="mt-1 text-[12px] text-muted">{tr.waitingHint}</p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* driver */}
      <div className="flex items-center gap-3 border-t border-line px-4 py-3 sm:px-5">
        <span className={`grid size-10 shrink-0 place-items-center rounded-full text-white transition-colors duration-500 ${live ? "bg-teal-deep" : "bg-faint"}`}>
          <VanGlyph className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{tr.driverName}</span>
          <span className="block text-xs text-muted">{live ? tr.subLive : tr.subWaiting}</span>
        </span>
      </div>

      {/* stages */}
      <ol className="flex items-start border-t border-line px-3 pb-4 pt-3.5 sm:px-5">
        {tr.rail.map((label, i) => {
          const s = state[i];
          const bar = (on: boolean) => `h-0.5 flex-1 rounded-full transition-colors duration-500 ${on ? "bg-[#0b7d36]" : "bg-line-strong"}`;
          return (
            <li key={label} aria-current={s === "active" ? "step" : undefined} className="flex flex-1 flex-col items-center gap-2 text-center">
              <span className="flex w-full items-center">
                <span className={i === 0 ? "h-0.5 flex-1 opacity-0" : bar(s !== "todo")} />
                <span
                  className={`relative grid size-6 shrink-0 place-items-center rounded-full text-white transition-colors duration-500 ${s === "todo" ? "border-2 border-line-strong bg-white" : "bg-[#0b7d36]"}`}
                >
                  {s === "done" ? <CheckIcon className="size-3.5" /> : null}
                  {s === "active" ? (
                    <>
                      <span className="absolute inset-0 animate-ping rounded-full bg-[#0b7d36]/45 motion-reduce:hidden" aria-hidden="true" />
                      <span className="relative size-2 rounded-full bg-white" />
                    </>
                  ) : null}
                </span>
                <span className={i === tr.rail.length - 1 ? "h-0.5 flex-1 opacity-0" : bar(state[i + 1] !== "todo")} />
              </span>
              <span className={`text-[12px] font-medium leading-tight transition-colors duration-500 ${s === "todo" ? "text-muted" : "text-teal-deep"}`}>{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

