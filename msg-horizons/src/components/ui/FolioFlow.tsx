"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/*
 * Folio Flow, after the Framer component of that name: an open book whose pages turn around the spine while the read
 * and unread pages fan out in 3D on either side. Drag it, click a side, swipe sideways on a trackpad, use the arrow
 * keys or the controls. The geometry (fitBook, slot, leafPose) is the original's; the pages are ours, designed at
 * `designWidth` x `designHeight` and scaled to fit. Below `singleBelow` pixels it turns one page at a time.
 */

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const RAD = Math.PI / 180;

type Leaf = { key: string; order: number; front: number | "end" | null; back: number | "end" | null };
type Geo = { W: number; fold: number; S: number; D: number; angle: number; visible: number; dim: number; turnable: number; single: boolean };
type Fit = { W: number; H: number; k: number; P: number; spineX: number; S: number; D: number; controlsSpace: number };

// the leaves of the book, with a blank endpaper inside each cover
function buildBook(n: number, single: boolean) {
  const leaves: Leaf[] = [{ key: "start", order: -1, front: null, back: "end" }];
  let turnable: number;
  if (single) {
    for (let i = 0; i < n; i++) leaves.push({ key: `p${i}`, order: i, front: i, back: "end" });
    turnable = n - 1;
  } else {
    const count = Math.ceil(n / 2);
    for (let i = 0; i < count; i++) leaves.push({ key: `l${i}`, order: i, front: 2 * i, back: 2 * i + 1 < n ? 2 * i + 1 : "end" });
    leaves.push({ key: "end", order: count, front: "end", back: null });
    turnable = n % 2 === 0 ? count : count - 1;
  }
  return { leaves, turnable, last: Math.max(0, turnable) };
}
// position p shows the back of leaf p - 1 on the left and the front of leaf p on the right
const startPosition = (page: number, n: number, single: boolean, last: number) => {
  const pg = clamp(Math.round(page), 1, n);
  return single ? clamp(pg - 1, 0, last) : clamp(Math.floor(pg / 2), 0, last);
};
const pageLabel = (index: number, n: number, single: boolean) => {
  if (single) return `${index + 1} / ${n}`;
  const a = index >= 1 && 2 * index <= n ? 2 * index : null;
  const b = 2 * index + 1 <= n ? 2 * index + 1 : null;
  return a && b ? `${a}–${b} / ${n}` : `${a ?? b ?? n} / ${n}`;
};

// size the whole book, stacks included, to fit the component; on narrow screens the stacks squeeze instead
function fitBook(o: { w: number; h: number; single: boolean; J: number; designWidth: number; designHeight: number; bookSize: number; showControls: boolean; fanStep: number; fanDepth: number; perspective: number }): Fit {
  const { w, h, single, J } = o;
  const dW = Math.max(1, o.designWidth), dH = Math.max(1, o.designHeight);
  const controlsSpace = o.showControls ? 76 : 0;
  const stageH = Math.max(80, h - controlsSpace);
  const P1 = Math.max(100, o.perspective);
  const reach = J > 0 ? ((dW + o.fanStep * (J + 1)) * P1) / (P1 + o.fanDepth * (J + 1)) : dW;
  const half = Math.max(40, w / 2 - 12);
  const kW = half / (single ? Math.max(1, reach - dW / 2) : reach);
  const kH = (stageH * 0.96) / dH;
  const t = clamp((w - 500) / 700, 0, 1);
  const minPage = single ? mix(0.8, 0.42, t) * w : mix(0.8, 0.3, t) * (w / 2);
  const kMin = Math.min(kH, minPage / dW);
  const k = Math.max(Math.min(kW, kH), kMin) * (clamp(o.bookSize, 20, 100) / 100);
  const W = dW * k, H = dH * k, P = P1 * k;
  const spineX = single ? -W / 2 : 0;
  let S = o.fanStep * k, D = o.fanDepth * k;
  const limit = w / 2 - 8 - spineX;
  const outer = (l: number) => ((W + S * l * (J + 1)) * P) / (P + D * l * (J + 1));
  if (J > 0 && outer(1) > limit) {
    let lo = 0, hi = 1;
    for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; if (outer(m) > limit) hi = m; else lo = m; }
    S *= lo; D *= lo;
  }
  return { W, H, k, P, spineX, S, D, controlsSpace };
}

// hinge position and angle of a page j places out from the open spread, on the right side
function slot(j: number, g: Geo) {
  const { W, fold, S, D, angle } = g;
  const place = (q: number) => {
    const xo = W + S * (q + 1), zo = -D * (q + 1);
    const a = Math.min(angle, Math.asin(clamp((-2 - zo) / W, 0, 1)) / RAD);
    return { x: xo - W * Math.cos(a * RAD), z: zo + W * Math.sin(a * RAD), a };
  };
  if (j >= 1) return place(j);
  const one = place(1), t = smooth(clamp(j, 0, 1));
  return { x: one.x * t, z: one.z * t, a: mix(-fold, one.a, t) };
}
// where a leaf sits for a given book position: a hinge point (x, z) and a turn around it
function leafPose(order: number, p: number, g: Geo) {
  const u = order < 0 ? 1 : order >= g.turnable ? 0 : clamp(p - order, 0, 1);
  if (u > 0 && u < 1) return { x: 0, z: 0, rot: -g.fold - u * (180 - 2 * g.fold), opacity: g.single ? clamp((1 - u) / 0.3, 0, 1) : 1, shade: Math.sin(u * Math.PI) * 0.3, zIndex: 3000 };
  const right = u === 0;
  const dist = right ? order - p : p - 1 - order;
  const j = dist < 1 ? clamp((dist - 0.55) / 0.45, 0, 1) : dist;
  const s = slot(j, g);
  return { x: right ? s.x : -s.x, z: s.z, rot: right ? s.a : -180 - s.a, opacity: g.single && !right ? 0 : clamp(g.visible + 1 - j, 0, 1), shade: clamp(g.dim * Math.min(j, 1) + Math.max(0, j - 1) * g.dim * 0.3, 0, 0.85), zIndex: 1000 - Math.round(j * 20) };
}

function useSize(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ w: 1200, h: 760 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => { const w = el.offsetWidth || 1200, h = el.offsetHeight || 760; setSize((s) => (s.w === w && s.h === h ? s : { w, h })); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

export type FolioLabels = { region: string; prev: string; next: string };

export default function FolioFlow({
  pages,
  labels,
  designWidth = 420,
  designHeight = 560,
  bookSize = 92,
  radius = 16,
  fold = 12,
  fanStep = 72,
  fanDepth = 120,
  fanAngle = 35,
  visible = 5,
  perspective = 2000,
  dim = 0.18,
  singleBelow = 640,
  startPage = 1,
  endpaper = "#E7ECF4",
  className = "",
}: {
  pages: React.ReactNode[];
  labels: FolioLabels;
  designWidth?: number; designHeight?: number; bookSize?: number; radius?: number; fold?: number; fanStep?: number; fanDepth?: number;
  fanAngle?: number; visible?: number; perspective?: number; dim?: number; singleBelow?: number; startPage?: number; endpaper?: string; className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const size = useSize(root);
  const reduced = useReducedMotion();
  const counterId = useId();
  const n = Math.max(1, pages.length);
  const single = size.w < singleBelow;
  const { leaves, turnable, last } = buildBook(n, single);
  const J = Math.min(Math.max(0, Math.floor(visible)), leaves.length - 2);
  const fit = fitBook({ w: size.w, h: size.h, designWidth, designHeight, bookSize, showControls: true, single, fanStep, fanDepth, perspective, J });
  const geo: Geo = { W: fit.W, fold, S: fit.S, D: fit.D, angle: fanAngle, visible, dim, turnable, single };

  const pos = useMotionValue(startPosition(startPage, n, single, last));
  const [index, setIndex] = useState(() => Math.round(pos.get()));
  useEffect(() => pos.on("change", (v) => { const r = clamp(Math.round(v), 0, last); setIndex((c) => (c === r ? c : r)); }), [pos, last]);
  const go = useCallback((target: number) => {
    const t = clamp(Math.round(target), 0, last);
    if (reduced) pos.set(t);
    else animate(pos, t, { type: "spring", stiffness: 170, damping: 26, mass: 1 });
  }, [last, reduced, pos]);
  // keep the same page open when switching between single pages and spreads
  const mode = useRef(single);
  useEffect(() => {
    if (mode.current === single) return;
    mode.current = single;
    const p = Math.round(pos.get());
    pos.set(clamp(single ? 2 * p : Math.floor((p + 1) / 2), 0, last));
  }, [single, last, pos]);

  // drag: about one page width of travel turns one leaf; a flick finishes the turn
  const drag = useRef({ x: 0, start: 0, lastX: 0, lastT: 0, v: 0, moved: false, id: -1, on: false });
  const span = Math.max(220, fit.W * 0.9);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const d = drag.current;
    Object.assign(d, { x: e.clientX, lastX: e.clientX, lastT: performance.now(), v: 0, start: pos.get(), moved: false, id: e.pointerId, on: true });
    pos.stop();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.on || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) { d.moved = true; (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); }
    if (!d.moved) return;
    let v = d.start - dx / span;
    if (v < 0) v *= 0.3;
    if (v > last) v = last + (v - last) * 0.3;
    pos.set(v);
    const now = performance.now();
    d.v = d.v * 0.5 + ((e.clientX - d.lastX) / Math.max(1, now - d.lastT)) * 0.5;
    d.lastX = e.clientX; d.lastT = now;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.on || e.pointerId !== d.id) return;
    d.on = false;
    if (!d.moved) return;
    const velocity = performance.now() - d.lastT > 80 ? 0 : d.v, cur = pos.get();
    go(velocity < -0.3 ? Math.ceil(cur) : velocity > 0.3 ? Math.floor(cur) : Math.round(cur));
  };
  // clicks: the right side turns forward, the left side back
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) return;
    const el = e.currentTarget, r = el.getBoundingClientRect();
    const x = e.clientX - r.left - el.offsetWidth / 2 - fit.spineX;
    go(index + (x >= 0 ? 1 : -1));
  };
  // a sideways trackpad swipe turns a page; an up-and-down one keeps scrolling the site
  const wheelAcc = useRef(0), wheelLock = useRef(0);
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    wheelAcc.current += e.deltaX;
    const now = performance.now();
    if (now < wheelLock.current) return;
    if (Math.abs(wheelAcc.current) > 40) { go(Math.round(pos.get()) + Math.sign(wheelAcc.current)); wheelAcc.current = 0; wheelLock.current = now + 420; }
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(last);
  };

  const scale = fit.H / designHeight;
  const renderPage = (p: number | "end" | null) => {
    if (p === null) return null;
    if (p === "end") {
      const dot = Math.max(8, 16 * fit.k);
      return <div style={{ position: "absolute", inset: 0, backgroundColor: endpaper, backgroundImage: "radial-gradient(rgba(28,44,81,0.16) 1px, transparent 1.4px)", backgroundSize: `${dot}px ${dot}px`, backgroundPosition: `${dot / 2}px ${dot / 2}px` }} />;
    }
    return (
      <div style={{ position: "absolute", left: 0, top: 0, width: designWidth, height: designHeight, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
        {pages[p]}
      </div>
    );
  };

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="book"
      aria-label={labels.region}
      aria-describedby={counterId}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={`relative h-full w-full select-none overflow-x-clip outline-none ${className}`}
      dir="ltr"
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onClick={onClick}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: fit.controlsSpace, perspective: fit.P, perspectiveOrigin: `calc(50% + ${fit.spineX}px) 50%`, touchAction: "pan-y", cursor: "grab" }}
      >
        {/* the book's shadow on the table */}
        <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", width: fit.W * 2.6, height: fit.H * 0.16, marginLeft: -fit.W * 1.3 + fit.spineX, marginTop: fit.H / 2 - fit.H * 0.06, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,0.5), rgba(0,0,0,0))", filter: "blur(8px)", pointerEvents: "none" }} />
        {leaves.map((leaf) => (
          <LeafView key={leaf.key} order={leaf.order} pos={pos} geo={geo} fit={fit} radius={radius * fit.k} active={leaf.order === index || leaf.order === index - 1} front={renderPage(leaf.front)} back={renderPage(leaf.back)} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-white/10 p-1.5 text-white ring-1 ring-white/15 backdrop-blur-xl">
          <RoundButton label={labels.prev} disabled={index <= 0} onClick={() => go(index - 1)} dir={-1} />
          <span id={counterId} aria-live="polite" className="min-w-[5.5rem] text-center text-sm font-semibold tabular-nums tracking-wide">{pageLabel(index, n, single)}</span>
          <RoundButton label={labels.next} disabled={index >= last} onClick={() => go(index + 1)} dir={1} />
        </div>
      </div>
    </div>
  );
}

const faceStyle = (side: "front" | "back", r: number): React.CSSProperties => ({
  position: "absolute", inset: 0, overflow: "hidden", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
  borderRadius: side === "front" ? `0 ${r}px ${r}px 0` : `${r}px 0 0 ${r}px`, transform: side === "back" ? "rotateY(180deg)" : undefined,
  boxShadow: "0 18px 40px -24px rgba(0,0,0,0.6)",
});
const gutterStyle = (side: "front" | "back"): React.CSSProperties => ({ position: "absolute", inset: 0, pointerEvents: "none", background: `linear-gradient(${side === "front" ? 90 : 270}deg, rgba(10,16,34,0.3) 0%, rgba(10,16,34,0.1) 5%, rgba(10,16,34,0) 15%)` });
const rimStyle = (side: "front" | "back", r: number): React.CSSProperties => {
  const base: React.CSSProperties = { position: "absolute", inset: 0, pointerEvents: "none", border: "1px solid rgba(255,255,255,0.55)", borderRadius: side === "front" ? `0 ${r}px ${r}px 0` : `${r}px 0 0 ${r}px` };
  return side === "front" ? { ...base, borderLeft: "none" } : { ...base, borderRight: "none" };
};

function LeafView({ order, pos, geo, fit, radius, active, front, back }: { order: number; pos: MotionValue<number>; geo: Geo; fit: Fit; radius: number; active: boolean; front: React.ReactNode; back: React.ReactNode }) {
  const pose = (p: number) => leafPose(order, p, geo);
  const x = useTransform(pos, (p) => pose(p).x + fit.spineX);
  const z = useTransform(pos, (p) => pose(p).z);
  const rotateY = useTransform(pos, (p) => pose(p).rot);
  const opacity = useTransform(pos, (p) => pose(p).opacity);
  const shade = useTransform(pos, (p) => pose(p).shade);
  const zIndex = useTransform(pos, (p) => pose(p).zIndex);
  const display = useTransform(pos, (p) => (pose(p).opacity <= 0 ? "none" : "block"));
  // opacity sits on the faces: on the leaf it would flatten the 3D faces
  const face = (side: "front" | "back", node: React.ReactNode) =>
    node === null ? null : (
      <motion.div style={{ ...faceStyle(side, radius), opacity }}>
        {node}
        <div style={gutterStyle(side)} />
        <div style={rimStyle(side, radius)} />
        <motion.div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "#070b16", pointerEvents: "none", opacity: shade }} />
      </motion.div>
    );
  return (
    <motion.div
      role="group"
      aria-roledescription="leaf"
      aria-hidden={!active}
      style={{ position: "absolute", left: "50%", top: "50%", width: fit.W, height: fit.H, marginTop: -fit.H / 2, transformStyle: "preserve-3d", x, z, rotateY, zIndex, display, originX: 0, originY: 0.5, willChange: "transform" }}
    >
      {face("front", front)}
      {face("back", back)}
    </motion.div>
  );
}

function RoundButton({ label, disabled, onClick, dir }: { label: string; disabled: boolean; onClick: () => void; dir: 1 | -1 }) {
  return (
    <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="grid size-10 place-items-center rounded-full bg-white/10 transition-[opacity,background-color] hover:bg-white/20 disabled:cursor-default disabled:opacity-35">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {dir < 0 ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
      </svg>
    </button>
  );
}
