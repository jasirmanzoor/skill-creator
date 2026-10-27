"use client";

import { useEffect, useRef } from "react";
import { PARTNER_LOGOS, type ProfileCopy } from "@/content/profile";
import { easeOutCubic, onFrame, range } from "./engine";
import { useReveals } from "./useReveals";

/**
 * The scale: MSG's four figures from facts.ts, each counting up as it reaches the screen, the valued partners, and
 * the vision. The counters ride the shared frame loop (so the film catches them too) and run once.
 */
export default function Scale({ c }: { c: ProfileCopy }) {
  const ref = useReveals<HTMLElement>();
  const gridRef = useRef<HTMLDListElement>(null);
  const numRefs = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    let start = -1;
    let done = false;
    return onFrame((time) => {
      const grid = gridRef.current;
      if (!grid || done) return;
      const r = grid.getBoundingClientRect();
      if (start < 0) {
        if (r.top > window.innerHeight * 0.85 || r.bottom < 0) return;
        start = time;
      }
      const k = easeOutCubic(range(time - start, 0, 1600));
      c.scale.metrics.forEach((m, i) => {
        const el = numRefs.current[i];
        if (!el) return;
        el.textContent = m.text && k >= 1 ? m.text : `${m.prefix ?? ""}${Math.round(m.value * k).toLocaleString("en-US")}${m.suffix.length > 3 ? "" : m.suffix}`;
      });
      if (k >= 1) done = true;
    });
  }, [c]);

  return (
    <section ref={ref} id="scale" aria-labelledby="scale-title" className="relative overflow-hidden bg-[#05070c] px-4 py-28 sm:px-6 md:px-[6vw] md:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute -top-[40vw] start-1/2 size-[80vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,157,248,0.16),transparent_62%)] rtl:translate-x-1/2" />
      <div className="relative" data-reveal>
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#7fcbfb] rtl:tracking-normal">{c.scale.eyebrow}</p>
        <h2 id="scale-title" className="pf-display mt-4 max-w-[22ch] text-white">{c.scale.heading}</h2>
      </div>

      <dl ref={gridRef} className="relative mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-[8px] bg-white/10 ring-1 ring-white/10 md:mt-20 md:grid-cols-4">
        {c.scale.metrics.map((m, i) => (
          <div key={m.label} className="flex flex-col bg-[#05070c] p-6 md:p-8" data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
            <dt className="order-2 mt-4 text-[0.9375rem] font-medium text-white">{m.label}</dt>
            <dd className={`order-1 font-display font-semibold leading-none tracking-[-0.03em] text-white tabular-nums ${(m.prefix ?? "").length + m.suffix.length > 5 ? "text-[clamp(1.9rem,3.4vw,3.2rem)]" : "text-[clamp(2.4rem,5vw,4.5rem)]"}`} dir="ltr">
              <span
                ref={(el) => {
                  if (el) numRefs.current[i] = el;
                }}
              >
                {m.text ?? `${m.prefix ?? ""}${m.value.toLocaleString("en-US")}${m.suffix.length > 3 ? "" : m.suffix}`}
              </span>
              {/* a long unit (Arabic "million riyals") sits on its own line under the figure */}
              {m.suffix.length > 3 ? <span className="mt-2 block text-[0.45em] tracking-normal text-white/80" dir="auto">{m.suffix.trim()}</span> : null}
            </dd>
            <dd className="order-3 mt-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-white/45 rtl:tracking-normal">{m.d}</dd>
          </div>
        ))}
      </dl>

      <div className="relative mt-16 grid gap-10 md:mt-24 md:grid-cols-[1fr_1.1fr] md:gap-16" data-reveal>
        <div>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-white/50 rtl:tracking-normal">{c.scale.partners}</p>
          <ul className="mt-6 flex flex-wrap gap-4" dir="ltr">
            {PARTNER_LOGOS.map((p) => (
              <li key={p.name} className="flex w-16 flex-col items-center gap-2">
                {p.src ? (
                  // eslint-disable-next-line @next/next/no-img-element -- the partners' own square logo tiles, already sized
                  <img src={p.src} alt={p.name} loading="lazy" className="size-14 rounded-2xl object-cover ring-1 ring-white/10" />
                ) : (
                  <span className="grid size-14 place-items-center rounded-2xl bg-[#fff] text-[0.625rem] font-bold uppercase tracking-wide text-[#1c2c51]">{p.name}</span>
                )}
                <span className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-white/45">{p.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <figure className="pf-brackets self-start p-6 text-white/25 md:p-8">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#ffc777] rtl:tracking-normal">{c.scale.visionTitle}</p>
          <blockquote className="mt-4 font-display text-[clamp(1.25rem,2vw,1.75rem)] font-medium leading-snug text-white">{c.scale.vision}</blockquote>
          <figcaption className="mt-5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-white/50 rtl:tracking-normal">{c.scale.vision2030}</figcaption>
        </figure>
      </div>
    </section>
  );
}
