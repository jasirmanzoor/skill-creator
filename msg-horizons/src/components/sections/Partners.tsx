"use client";

import { useEffect, useRef } from "react";
import { experience, PARTNERS } from "@/content/experience";
import type { Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import PartnerLogo from "../partners/PartnerLogo";
import Logo from "../ui/Logo";

/**
 * Partner constellation: MSG at the centre, partners orbiting on a tilted ring in depth.
 * Nearer tiles are larger and sharper, farther ones recede; light travels along each link to the hub.
 * Positions are computed per frame only while the section is on screen. Reduced motion: a still ring.
 */
export default function Partners({ lang }: { lang: Locale }) {
  const c = experience[lang].partners;
  const stage = useRef<HTMLDivElement>(null);
  const tiles = useRef<(HTMLLIElement | null)[]>([]);
  const links = useRef<(SVGLineElement | null)[]>([]);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let raf = 0;
    let visible = false;
    let t0 = performance.now();
    let offset = 0;
    const n = PARTNERS.length;

    const place = (angle: number) => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const narrow = w < 640;
      const rx = narrow ? w * 0.3 : Math.min(w * 0.4, 460);
      const ry = narrow ? h * 0.36 : Math.min(h * 0.3, 150);
      const cx = w / 2;
      const cy = h / 2;
      for (let i = 0; i < n; i++) {
        const a = angle + (i / n) * Math.PI * 2;
        const x = cx + Math.cos(a) * rx;
        const y = cy + Math.sin(a) * ry;
        const depth = (Math.sin(a) + 1) / 2; // 0 = far (top), 1 = near (bottom)
        const tile = tiles.current[i];
        if (tile) {
          const s = 0.72 + depth * 0.38;
          tile.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${s.toFixed(3)})`;
          tile.style.zIndex = String(Math.round(depth * 100));
          tile.style.opacity = (0.82 + depth * 0.18).toFixed(3);
          tile.style.filter = depth < 0.25 ? `blur(${((0.25 - depth) * 2).toFixed(2)}px)` : "none";
        }
        const line = links.current[i];
        if (line) {
          line.setAttribute("x1", String(cx));
          line.setAttribute("y1", String(cy));
          line.setAttribute("x2", x.toFixed(1));
          line.setAttribute("y2", y.toFixed(1));
          line.style.opacity = (0.25 + depth * 0.6).toFixed(3);
        }
      }
    };

    const tick = (now: number) => {
      offset += ((now - t0) / 1000) * 0.12; // ~52s per orbit: calm, never busy
      t0 = now;
      place(offset);
      if (visible) raf = requestAnimationFrame(tick);
    };

    place(0.35);
    if (reduce) return;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) { t0 = performance.now(); raf = requestAnimationFrame(tick); }
    });
    io.observe(el);
    const onResize = () => place(offset);
    window.addEventListener("resize", onResize);
    return () => { io.disconnect(); cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, [reduce]);

  return (
    <section id="partners" aria-labelledby="partners-title" className="relative scroll-mt-16 overflow-hidden border-y border-line bg-surface/[0.93] sec backdrop-blur">
      <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
        <span className="label">{c.eyebrow}</span>
        <h2 id="partners-title" className="h-section mx-auto mt-4 max-w-3xl text-ink">
          {c.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">{c.lead}</p>
      </div>

      <div ref={stage} className="relative mx-auto mt-6 h-[420px] max-w-6xl sm:h-[480px]" dir="ltr">
        {/* orbit ring */}
        <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[60%] w-[80%] max-w-[920px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-line-strong" />
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full">
          {PARTNERS.map((p, i) => (
            <line key={p.id} ref={(el) => { links.current[i] = el; }} stroke="#0f9641" strokeWidth="1.4" strokeDasharray="3 7" className="partner-link" />
          ))}
        </svg>
        {/* hub */}
        <div className="absolute left-1/2 top-1/2 z-[60] -translate-x-1/2 -translate-y-1/2">
          <span aria-hidden="true" className="absolute inset-0 -m-6 animate-ping rounded-full bg-brand/10 motion-reduce:hidden [animation-duration:2.6s]" />
          <div className="relative flex size-28 items-center justify-center rounded-full bg-[#0c2a1a] shadow-[0_24px_60px_-20px_rgba(12,14,17,0.6)] ring-4 ring-white sm:size-36">
            <Logo inverted className="scale-110" />
          </div>
        </div>
        {/* partner tiles */}
        <ul className="absolute inset-0">
          {PARTNERS.map((p, i) => (
            <li
              key={p.id}
              ref={(el) => { tiles.current[i] = el; }}
              className="absolute left-0 top-0 size-20 overflow-hidden rounded-[22px] shadow-[0_24px_50px_-20px_rgba(12,14,17,0.55)] ring-1 ring-black/5 will-change-transform sm:size-28 sm:rounded-[28px]"
            >
              <PartnerLogo id={p.id} />
            </li>
          ))}
        </ul>
      </div>
      <p className="mx-auto mt-2 max-w-7xl px-5 text-center text-xs text-muted lg:px-8">{c.note}</p>
    </section>
  );
}
