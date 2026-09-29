"use client";

import { useEffect, useRef, useState } from "react";
import { experience, NEED_IDS, type NeedId } from "@/content/experience";
import type { Locale } from "@/content/i18n";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon } from "../ui/icons";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * The nine questions every seller asks, each answered in one line.
 * Cards tilt toward the pointer (spatial depth) and each carries a small living icon
 * that plays once the grid is on screen. Under reduced motion everything is static.
 */
export default function Needs({ lang }: { lang: Locale }) {
  const c = experience[lang].needs;
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="sellers" aria-labelledby="needs-title" className="relative scroll-mt-16 overflow-hidden bg-paper/90 py-24 backdrop-blur lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <span className="label">{c.eyebrow}</span>
            <h2 id="needs-title" className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] text-ink text-balance sm:text-5xl rtl:tracking-normal">
              {c.title}
            </h2>
          </div>
          <p className="max-w-xl text-lg text-muted text-pretty lg:justify-self-end">{c.lead}</p>
        </div>

        <div ref={ref} data-inview={inView || undefined} className="needs-grid mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 [perspective:1400px]">
          {NEED_IDS.map((id, i) => (
            <NeedCard key={id} id={id} q={c.items[id].q} a={c.items[id].a} i={i} />
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm text-muted">{c.note}</p>
          <TrackedLink
            href="#planner"
            event="cta_click"
            props={{ cta: "plan", location: "needs" }}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 font-medium text-white transition-colors hover:bg-ink-3"
          >
            {c.cta} <ArrowIcon className="size-4 rtl:rotate-180" />
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}

function NeedCard({ id, q, a, i }: { id: NeedId; q: string; a: string; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    const el = ref.current!;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };
  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="need-card group relative overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(12,14,17,0.04)] sm:p-7"
      style={{ ["--d" as string]: `${i * 70}ms` }}
    >
      {/* light that follows the pointer */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(420px_circle_at_var(--gx,50%)_var(--gy,50%),rgba(11,125,54,0.08),transparent_60%)]" />
      <div className="relative flex items-start gap-5 [transform:translateZ(30px)]">
        <span className="need-icon inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#0b6b2f] text-white shadow-[0_10px_24px_-10px_rgba(11,125,54,0.7)]">
          <NeedIcon id={id} />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm text-muted">{q}</h3>
          <p className="mt-1.5 font-display text-lg font-semibold leading-snug tracking-[-0.01em] text-ink text-pretty rtl:tracking-normal">{a}</p>
        </div>
      </div>
    </div>
  );
}

const B = "#d9f99d";
function NeedIcon({ id }: { id: NeedId }) {
  const common = { width: 34, height: 34, viewBox: "0 0 34 34", fill: "none", "aria-hidden": true } as const;
  switch (id) {
    case "cod": // coin drops into the wallet
      return (
        <svg {...common}>
          <rect x="5" y="14" width="24" height="15" rx="3" stroke="#fff" strokeWidth="1.8" />
          <path d="M23 21.5h6" stroke="#fff" strokeWidth="1.8" />
          <g className="nd-drop"><circle cx="17" cy="8" r="4.2" fill={B} /><path d="M17 6v4" stroke="#0b0d12" strokeWidth="1.4" /></g>
        </svg>
      );
    case "remittance": // money travels from MSG to the seller, on a cycle
      return (
        <svg {...common}>
          <rect x="3" y="11" width="9" height="12" rx="2" stroke="#fff" strokeWidth="1.6" />
          <rect x="22" y="11" width="9" height="12" rx="2" stroke="#fff" strokeWidth="1.6" />
          <path d="M12 17h10" stroke="rgba(255,255,255,.3)" strokeWidth="1.6" strokeDasharray="2 2.5" />
          <circle className="nd-slide" cx="12" cy="17" r="2.6" fill={B} />
        </svg>
      );
    case "packaging": // tape seals the box
      return (
        <svg {...common}>
          <path d="M5 12l12-5 12 5v14l-12 5-12-5z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M5 12l12 5 12-5M17 17v14" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
          <path className="nd-tape" d="M11 9.5l12 5" stroke={B} strokeWidth="2.4" strokeLinecap="round" pathLength={1} />
        </svg>
      );
    case "storage": // shelves fill
      return (
        <svg {...common}>
          <path d="M5 29V6M29 29V6M5 13h24M5 21h24M5 29h24" stroke="#fff" strokeWidth="1.6" />
          <rect className="nd-pop" x="8" y="15" width="6" height="6" rx="1" fill={B} style={{ animationDelay: "0s" }} />
          <rect className="nd-pop" x="16" y="15" width="6" height="6" rx="1" fill="#fff" style={{ animationDelay: ".35s" }} />
          <rect className="nd-pop" x="11" y="23" width="6" height="6" rx="1" fill="#fff" style={{ animationDelay: ".7s" }} />
          <rect className="nd-pop" x="19" y="23" width="6" height="6" rx="1" fill={B} style={{ animationDelay: "1.05s" }} />
        </svg>
      );
    case "returns": // the parcel comes back round
      return (
        <svg {...common}>
          <g className="nd-spin"><path d="M26 11a11 11 0 1 0 2 9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /><path d="M27 5v7h-7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></g>
          <rect x="13" y="13" width="8" height="8" rx="1.5" fill={B} />
        </svg>
      );
    case "pod": // delivered: tick draws on the phone
      return (
        <svg {...common}>
          <rect x="9" y="3" width="16" height="28" rx="3" stroke="#fff" strokeWidth="1.6" />
          <path className="nd-tick" d="M12.5 17.5l3.2 3.2 6-6.5" stroke={B} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
        </svg>
      );
    case "overseas": // a route arcs in from abroad
      return (
        <svg {...common}>
          <circle cx="17" cy="17" r="12" stroke="rgba(255,255,255,.35)" strokeWidth="1.4" />
          <path d="M5 17h24M17 5c4 3.5 4 20.5 0 24M17 5c-4 3.5-4 20.5 0 24" stroke="rgba(255,255,255,.35)" strokeWidth="1.2" />
          <path className="nd-arc" d="M6 11C12 3 24 5 26 20" stroke={B} strokeWidth="2" strokeLinecap="round" pathLength={1} />
          <circle cx="26" cy="21" r="2.6" fill="#fff" />
        </svg>
      );
    case "pickups": // three origins join one route
      return (
        <svg {...common}>
          <path d="M6 8c6 0 7 9 11 9M6 17h11M6 26c6 0 7-9 11-9M17 17h11" stroke="rgba(255,255,255,.4)" strokeWidth="1.6" />
          <path className="nd-flow" d="M6 8c6 0 7 9 11 9h11" stroke={B} strokeWidth="2" pathLength={1} />
          {[8, 17, 26].map((y) => <circle key={y} cx="6" cy={y} r="2.6" fill="#fff" />)}
          <circle cx="28" cy="17" r="3" fill={B} />
        </svg>
      );
    case "damages": // shield pulses, every scan logged
      return (
        <svg {...common}>
          <path className="nd-pulse" d="M17 4l10 4v8c0 7-4.5 11-10 14C11.5 27 7 23 7 16V8z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12.5 16.5l3 3 6-6" stroke={B} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}
