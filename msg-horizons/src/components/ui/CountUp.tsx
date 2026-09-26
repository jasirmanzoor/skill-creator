"use client";

import { useEffect, useRef } from "react";

/**
 * Counts the first number in `value` up from 0 when scrolled into view ("1,000+", "SAR 20M+", "+100").
 * Server-renders the final value (SEO / no-JS / reduced motion). Values with "/" (e.g. 24/7) are left static.
 */
export default function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    const m = value.match(/\d[\d,]*/);
    if (!el || !m || value.includes("/")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = Number(m[0].replace(/,/g, ""));
    const fmt = (n: number) => value.replace(m[0], m[0].includes(",") ? n.toLocaleString("en-US") : String(n));
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / 1400);
        el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  return <span ref={ref} className={className}>{value}</span>;
}
