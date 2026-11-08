"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export type OrbitItem = { id: string; image: string; pos?: string; label: string; figure: string; text: string; note?: string };

const DELAY = 6.2; // seconds each stop holds while it plays by itself
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * An orbit, after Framer's "Orbit Testimonials": round photos ride a dashed ring, the ring turns to bring the chosen
 * one to the top (a progress ring counts down to the next), and the card in the middle tells that stop's story.
 * It plays by itself while on screen and the pointer is away; arrows, a drag or a swipe, the arrow keys, or a tap on
 * a photo move it by hand. On a phone the card sits under the ring. Every stop's text stays in the page.
 */
export default function OrbitShowcase({ items, label, labels, rtl = false }: { items: OrbitItem[]; label: string; labels: { prev: string; next: string }; rtl?: boolean }) {
  const reduce = useReducedMotion();
  const n = items.length;
  const [i, setI] = useState(0);
  const [turns, setTurns] = useState(0); // the ring's total turn, so it always takes the short way round
  const [dir, setDir] = useState(1);
  const [hover, setHover] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const seen = useInView(root, { amount: 0.4 });
  const play = !reduce && seen && !hover;

  const to = (k: number) => {
    const next = ((k % n) + n) % n;
    let d = next - i;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    if (!d) return;
    setDir(Math.sign(d));
    setTurns((t) => t + d);
    setI(next);
  };
  const step = (d: number) => to(i + d);

  useEffect(() => {
    if (!play) return;
    const id = window.setTimeout(() => step(1), DELAY * 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, play]);

  // a drag or a swipe across the ring
  const drag = useRef<{ x: number } | null>(null);
  const onDown = (e: React.PointerEvent) => { drag.current = { x: e.clientX }; };
  const onUp = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    drag.current = null;
    if (Math.abs(dx) > 42) step((dx < 0 ? 1 : -1) * (rtl ? -1 : 1));
  };

  const angle = -turns * (360 / n);
  const it = items[i];

  const card = (
    <div className="relative mx-auto w-full max-w-[24rem] overflow-hidden rounded-[1.75rem] bg-[#0c1830]/90 p-6 text-white shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/12 backdrop-blur sm:p-7">
      <div aria-live="polite" className="relative min-h-[11rem]">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={it.id}
            custom={dir}
            initial={reduce ? false : { opacity: 0, x: (rtl ? -1 : 1) * dir * 28, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: (rtl ? 1 : -1) * dir * 28, filter: "blur(6px)", transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          >
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/60 rtl:font-sans rtl:tracking-normal">
              <span dir="ltr" className="tabular-nums text-brand-bright">{pad(i + 1)} / {pad(n)}</span>
              <span aria-hidden="true">·</span>
              {it.label}
            </p>
            <p className="num mt-4 font-display text-[clamp(2.4rem,5vw,3.4rem)] font-semibold leading-none tracking-[-0.04em] text-brand-mint rtl:tracking-normal" dir="ltr">{it.figure}</p>
            <p className="mt-4 font-display text-lg font-medium leading-snug text-white text-pretty">{it.text}</p>
            {it.note ? <p className="mt-4 inline-flex rounded-full bg-brand-bright px-3 py-1 text-[11px] font-bold text-[#0b1730]">{it.note}</p> : null}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex gap-1.5" aria-hidden="true">
          {items.map((x, k) => (
            <span key={x.id} className={`h-1 rounded-full transition-all duration-300 ${k === i ? "w-6 bg-brand-bright" : "w-1.5 bg-white/25"}`} />
          ))}
        </div>
        <div className="flex gap-2">
          {([[-1, labels.prev], [1, labels.next]] as const).map(([d, l]) => (
            <button key={l} type="button" onClick={() => step(d)} aria-label={l}
              className="grid size-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition-colors hover:bg-white/20">
              <svg viewBox="0 0 24 24" className={`size-4 ${d < 0 ? "rotate-180" : ""} rtl:-scale-x-100`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(rtl ? -1 : 1);
        if (e.key === "ArrowLeft") step(rtl ? 1 : -1);
      }}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") setHover(true); }}
      onPointerLeave={() => setHover(false)}
      className="relative outline-none"
    >
      <div
        className="relative mx-auto aspect-square w-[min(82%,20rem)] touch-pan-y select-none [container-type:inline-size] sm:w-[min(100%,40rem)]"
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => { drag.current = null; }}
      >
        {/* the dashed ring, and the glow at its top where the chosen stop rests */}
        <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 size-full">
          <circle cx="50" cy="50" r="46.5" fill="none" stroke="rgba(95,214,255,0.35)" strokeWidth="0.25" strokeDasharray="1 1.6" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(95,214,255,0.12)" strokeWidth="0.2" />
        </svg>
        <span aria-hidden="true" className="absolute start-1/2 top-0 size-24 -translate-x-1/2 -translate-y-1/3 rounded-full bg-brand-bright/25 blur-2xl rtl:translate-x-1/2" />
        {/* the ring of photos, turning */}
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ rotate: angle }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 18 }}
        >
          {items.map((x, k) => {
            const a = (k * 360) / n;
            const on = k === i;
            return (
              <div key={x.id} className="absolute left-1/2 top-1/2" style={{ transform: `rotate(${a}deg) translateY(-46.5cqw)` }}>
                <motion.button
                  type="button"
                  onClick={() => to(k)}
                  aria-label={x.label}
                  aria-current={on || undefined}
                  className="relative -ml-7 -mt-7 block size-14 sm:-ml-8 sm:-mt-8 sm:size-16"
                  initial={false}
                  animate={{ rotate: -a - angle, scale: on ? 1.25 : 1 }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 18 }}
                >
                  <span className={`absolute inset-0 overflow-hidden rounded-full ring-2 transition-[box-shadow,filter] duration-300 ${on ? "ring-brand-bright shadow-[0_0_24px_rgba(0,157,248,0.7)]" : "ring-white/25 grayscale-[0.6] hover:grayscale-0"}`}>
                    <Image src={x.image} alt="" fill sizes="80px" className="object-cover" style={{ objectPosition: x.pos ?? "50% 50%" }} />
                  </span>
                  {/* how long until the next stop */}
                  {on && play ? (
                    <svg key={`p${i}`} viewBox="0 0 40 40" aria-hidden="true" className="absolute -inset-1.5 size-[calc(100%+0.75rem)] -rotate-90">
                      <circle cx="20" cy="20" r="18.5" fill="none" stroke="rgba(0,157,248,0.95)" strokeWidth="1.6" strokeLinecap="round" pathLength={1}
                        strokeDasharray="1" strokeDashoffset="1" style={{ animation: `orbit-progress ${DELAY}s linear forwards` }} />
                    </svg>
                  ) : null}
                </motion.button>
              </div>
            );
          })}
        </motion.div>
        {/* the card, in the middle of the ring on wider screens */}
        <div className="absolute inset-[17%] hidden items-center justify-center sm:flex">{card}</div>
      </div>
      <div className="mt-6 sm:hidden">{card}</div>
      {/* every stop, for search and screen readers */}
      <ul className="sr-only">
        {items.map((x) => <li key={x.id}>{x.label}: {x.figure}. {x.text} {x.note ?? ""}</li>)}
      </ul>
    </div>
  );
}
