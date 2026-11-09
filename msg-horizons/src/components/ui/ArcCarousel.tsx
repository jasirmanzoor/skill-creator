"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export type ArcCard = { src: string; pos?: string; alt: string; title: string; tag?: string; back: string; href?: string; cta?: string };

/**
 * A fanned arc of cards, after Framer's "Flip Arc Carousel": the cards sit on a large circle and drift slowly round
 * it, tilting with the curve and shrinking toward the edges. Drag it (it carries on with the flick), use the arrows or
 * the arrow keys. Click a card and it glides to the middle and flips over to show its back; click it again, press
 * Escape or click elsewhere to flip it back. It drifts only while on screen and nothing is flipped; under reduced
 * motion it stays still until moved. Every card's text stays in the page.
 */
export default function ArcCarousel({ cards, label, labels, rtl = false }: { cards: ArcCard[]; label: string; labels: { prev: string; next: string; flip: string; back: string }; rtl?: boolean }) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [w, setW] = useState(1200);
  const [flipped, setFlipped] = useState<number | null>(null);
  const flippedRef = useRef<number | null>(null);
  useEffect(() => { flippedRef.current = flipped; }, [flipped]);

  // short lists repeat so the arc is always full
  const ring = cards.length ? Array.from({ length: Math.max(cards.length, Math.ceil(14 / cards.length) * cards.length) }, (_, i) => cards[i % cards.length]) : [];
  const count = ring.length;
  const phone = w < 640;
  const cardW = phone ? 200 : 270;
  const cardH = Math.round(cardW * 1.36);
  const gap = phone ? 14 : 24;
  const R = phone ? 900 : 1700;
  const step = cardW + gap;

  const offset = useRef(0), vel = useRef(0), target = useRef<number | null>(null);
  const drag = useRef<{ x: number; t: number; moved: number } | null>(null);
  const seen = useRef(false), hover = useRef(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { seen.current = e.isIntersecting; });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, []);

  useEffect(() => {
    if (!count) return;
    let raf = 0, last = performance.now();
    const total = step * count;
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (!drag.current) {
        if (target.current !== null) {
          const d = target.current - offset.current;
          offset.current += d * Math.min(1, dt * 7);
          if (Math.abs(d) < 0.5) { offset.current = target.current; target.current = null; }
        } else if (Math.abs(vel.current) > 0.5) {
          offset.current += vel.current * dt;
          vel.current *= Math.pow(0.05, dt);
        } else if (!reduce && seen.current && !hover.current && flippedRef.current === null) {
          offset.current += 28 * dt * (rtl ? -1 : 1);
        }
      }
      for (let i = 0; i < count; i++) {
        const el = refs.current[i];
        if (!el) continue;
        let a = (((i * step - offset.current) % total) + total) % total;
        if (a > total / 2) a -= total;
        const th = a / R;
        const X = R * Math.sin(th);
        const Y = R * (1 - Math.cos(th));
        const rot = (th * 180) / Math.PI;
        const s = Math.max(0.5, 1 - Math.abs(X / (w / 2 || 1)) * 0.12);
        el.style.transform = `translate3d(${X.toFixed(1)}px, ${Y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(3)})`;
        const side = Math.PI / 2 - Math.abs(th);
        el.style.opacity = String(Math.abs(X) > w / 2 + cardW ? 0 : side >= 0.35 ? 1 : Math.max(0, side / 0.35));
        el.style.zIndex = String(Math.round(1000 - Math.abs(a)));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count, step, R, w, cardW, reduce, rtl]);

  // a flipped card flips back on Escape or a click elsewhere
  useEffect(() => {
    if (flipped === null) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setFlipped(null); };
    const down = (e: PointerEvent) => { const el = refs.current[flipped]; if (el && !el.contains(e.target as Node)) setFlipped(null); };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", down);
    return () => { document.removeEventListener("keydown", key); document.removeEventListener("pointerdown", down); };
  }, [flipped]);

  const glideTo = (i: number) => {
    const total = step * count;
    let a = (((i * step - offset.current) % total) + total) % total;
    if (a > total / 2) a -= total;
    vel.current = 0;
    target.current = offset.current + a;
  };
  const nudge = (d: number) => { setFlipped(null); vel.current = 0; target.current = (target.current ?? offset.current) + d * step; };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); nudge(rtl ? -1 : 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); nudge(rtl ? 1 : -1); }
      }}
      className="relative outline-none"
    >
      <div
        ref={box}
        className="relative cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]"
        style={{ height: cardH + (phone ? 90 : 130) }}
        onPointerEnter={(e) => { if (e.pointerType === "mouse") hover.current = true; }}
        onPointerLeave={() => { hover.current = false; }}
        onPointerDown={(e) => { drag.current = { x: e.clientX, t: performance.now(), moved: 0 }; vel.current = 0; target.current = null; }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x, now = performance.now();
          d.moved += Math.abs(dx);
          offset.current -= dx;
          vel.current = (-dx / Math.max(1, now - d.t)) * 1000;
          d.x = e.clientX; d.t = now;
          if (d.moved > 6) (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
        onPointerUp={() => { const d = drag.current; drag.current = null; if (d && d.moved <= 6) vel.current = 0; }}
        onPointerCancel={() => { drag.current = null; }}
      >
        <div className="absolute left-1/2 top-6" style={{ width: 0, height: 0 }}>
          {ring.map((c, i) => {
            const on = flipped === i;
            return (
              <div key={i} ref={(el) => { refs.current[i] = el; }} className="absolute" style={{ left: -cardW / 2, top: 0, width: cardW, height: cardH, perspective: 1200 }}>
                <button
                  type="button"
                  onClick={() => { if (drag.current?.moved) return; if (on) setFlipped(null); else { glideTo(i); setFlipped(i); } }}
                  aria-label={`${c.title}: ${on ? labels.back : labels.flip}`}
                  aria-pressed={on}
                  tabIndex={i < cards.length ? 0 : -1}
                  className="relative size-full text-start transition-transform duration-[600ms] [transform-style:preserve-3d] ease-[cubic-bezier(0.4,0.1,0.2,1)]"
                  style={{ transform: on ? "rotateY(180deg)" : "none" }}
                >
                  {/* front */}
                  <span className="absolute inset-0 overflow-hidden rounded-[1.4rem] bg-[#1c2c51] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)] [backface-visibility:hidden]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- moved every frame; next/image adds nothing here */}
                    <img src={c.src} alt="" draggable={false} loading="lazy" className="absolute inset-0 size-full object-cover" style={{ objectPosition: c.pos ?? "50% 50%" }} />
                    <span className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgba(8,14,28,0.9),transparent)]" />
                    <span className="absolute inset-x-4 bottom-4 text-white">
                      {c.tag ? <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7fcbfb] rtl:tracking-normal">{c.tag}</span> : null}
                      <span className="mt-1 block font-display text-lg font-semibold leading-tight">{c.title}</span>
                    </span>
                    <span aria-hidden="true" className="absolute end-3 top-3 grid size-8 place-items-center rounded-full bg-white/85 text-[#1c2c51]">
                      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" /></svg>
                    </span>
                  </span>
                  {/* back */}
                  <span className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[1.4rem] bg-[#0f1f3d] p-5 text-white ring-1 ring-white/15 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <span>
                      {c.tag ? <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7fcbfb] rtl:tracking-normal">{c.tag}</span> : null}
                      <span className="mt-1 block font-display text-lg font-semibold leading-tight">{c.title}</span>
                      <span className="mt-3 block text-sm leading-relaxed text-white/80">{c.back}</span>
                    </span>
                    {c.href ? (
                      <a href={c.href} target="_blank" rel="noopener" tabIndex={on ? 0 : -1} onClick={(e) => e.stopPropagation()}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#1c2c51]">
                        {c.cta}
                        <svg viewBox="0 0 24 24" className="size-4 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
                      </a>
                    ) : null}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-2">
        {([[-1, labels.prev], [1, labels.next]] as const).map(([d, l]) => (
          <button key={l} type="button" onClick={() => nudge(rtl ? -d : d)} aria-label={l}
            className="grid size-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-white/20">
            <svg viewBox="0 0 24 24" className={`size-4 ${d < 0 ? "rotate-180" : ""} rtl:-scale-x-100`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        ))}
      </div>
    </div>
  );
}
