"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView, useMotionValueEvent, useScroll } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export type HelixItem = { src: string; pos?: string; alt: string; caption: string };

const mod = (v: number, n: number) => ((v % n) + n) % n;
const wrapped = (i: number, p: number, n: number) => mod(i - p + n / 2, n) - n / 2;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A helix of photographs, after Framer's "Helix Spiral": the photos ride a 3D spiral, the one in front large and
 * sharp, the others turning away behind it, smaller, blurred and faded. The page's own scroll turns the spiral as it
 * passes (the mouse wheel is never taken from the page); a drag, the arrows, the arrow keys or a tap on a photo turn it
 * by hand. Cards are landscape, sized for the fleet photographs. Under reduced motion it only moves when asked.
 */
export default function HelixSpiral({ items, label, labels }: { items: HelixItem[]; label: string; labels: { prev: string; next: string } }) {
  const reduce = useReducedMotion();
  const n = items.length;
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { amount: 0.15 });
  const [w, setW] = useState(1100);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const phone = w < 640;
  const radius = phone ? 150 : 400;
  const cardW = phone ? 210 : 440;
  const cardH = Math.round(cardW * 0.66);
  const vGap = phone ? 30 : 52;
  const angleStep = 360 / n;

  const target = useRef(0);
  const shown = useRef(0);
  const manual = useRef(0); // turns added by hand, on top of the scroll
  const [p, setP] = useState(0);

  // the page's scroll turns the spiral once through all the photos while it passes the screen
  const { scrollYProgress } = useScroll({ target: box, offset: ["start end", "end start"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => { target.current = v * (n - 1) + manual.current; });

  useEffect(() => {
    if (!seen) return;
    let raf = 0, last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, Math.max(0, (t - last) / 1000));
      last = t;
      shown.current += (target.current - shown.current) * (reduce ? 1 : Math.min(1, dt * 6));
      setP(shown.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, reduce]);

  const nudge = useCallback((d: number) => {
    const to = Math.round(target.current) + d;
    manual.current += to - target.current;
    target.current = to;
  }, []);
  const focus = (i: number) => nudge(Math.round(wrapped(i, target.current, n)));

  // a drag turns it, and it settles on a photo when let go
  const drag = useRef<{ x: number } | null>(null);
  const onDown = (e: React.PointerEvent) => { drag.current = { x: e.clientX }; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const d = -(e.clientX - drag.current.x) * (phone ? 0.02 : 0.012);
    drag.current.x = e.clientX;
    manual.current += d;
    target.current += d;
  };
  const onUp = () => { if (!drag.current) return; drag.current = null; nudge(0); };

  const at = mod(Math.round(p), n);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); nudge(1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); nudge(-1); }
      }}
      className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(70%_70%_at_50%_45%,#123059_0%,#081428_60%,#050c18_100%)] outline-none ring-1 ring-white/10"
    >
      <div
        ref={box}
        className="relative cursor-grab touch-pan-y select-none active:cursor-grabbing [mask-image:linear-gradient(180deg,transparent,#000_14%,#000_86%,transparent)]"
        style={{ height: phone ? 440 : 700, perspective: 1600 }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="absolute left-1/2 top-1/2 size-0">
          {items.map((it, i) => {
            const wr = wrapped(i, p, n);
            const a = (wr * angleStep * Math.PI) / 180;
            const x = Math.sin(a) * radius;
            const z = Math.cos(a) * radius - radius;
            const y = wr * vGap;
            const tilt = Math.max(-35, Math.min(35, -wr * angleStep * 0.55));
            const dist = Math.abs(wr);
            const scale = Math.max(0.35, 1.2 - (dist * 0.7) / 3);
            const opacity = Math.max(0.08, 1 - (dist * 0.9) / 3);
            const blur = Math.min(6, (dist / 3) * 6);
            const front = dist < 0.5;
            return (
              <button
                key={it.src}
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                onClick={() => focus(i)}
                className="absolute left-0 top-0 overflow-hidden rounded-2xl bg-[#12203a]"
                style={{
                  width: cardW,
                  height: cardH,
                  zIndex: Math.round(1000 - dist * 10),
                  transform: `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${tilt.toFixed(1)}deg) scale(${scale.toFixed(3)})`,
                  opacity,
                  filter: blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : undefined,
                  boxShadow: front ? "0 0 0 2px #009df8, 0 30px 60px -20px rgba(0,0,0,0.8)" : "0 20px 40px -20px rgba(0,0,0,0.7)",
                  willChange: "transform, opacity, filter",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- transformed every frame; next/image adds nothing here */}
                <img src={it.src} alt="" draggable={false} loading="lazy" decoding="async" className="size-full object-cover" style={{ objectPosition: it.pos ?? "50% 50%" }} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-4 sm:px-7">
        <p aria-live="polite" className="flex min-w-0 items-baseline gap-3 font-mono text-xs uppercase tracking-[0.14em] text-white/75 rtl:font-sans rtl:tracking-normal">
          <span className="shrink-0 tabular-nums text-brand-bright" dir="ltr">{pad(at + 1)} / {pad(n)}</span>
          <span className="truncate">{items[at]?.caption}</span>
        </p>
        <div className="flex shrink-0 gap-2">
          {([[-1, labels.prev], [1, labels.next]] as const).map(([d, l]) => (
            <button key={l} type="button" onClick={() => nudge(d)} aria-label={l}
              className="grid size-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-white/20">
              <svg viewBox="0 0 24 24" className={`size-4 ${d < 0 ? "rotate-180" : ""} rtl:-scale-x-100`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          ))}
        </div>
      </div>
      <ul className="sr-only">{items.map((x) => <li key={x.src}>{x.alt}</li>)}</ul>
    </div>
  );
}
