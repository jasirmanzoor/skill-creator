"use client";

import { useEffect, useRef, useState } from "react";
import type { ProfileCopy } from "@/content/profile";
import { facts } from "@/content/facts";
import { CITY_XY, KSA, KSA_DOTS, KH, KW } from "@/lib/ksaGeo";
import { clamp, easeOutCubic, onFrame, pinProgress, range } from "./engine";

/**
 * The network, drawn as you scroll, after the template's trajectory: the section pins while four legs ink themselves
 * across the Kingdom, a van riding the leg being drawn. A loop at the Riyadh headquarters, the line haul south, a
 * loop at MSG's Sabya hub, then the last mile fans out and the area it reaches fills in, clipped to the Kingdom,
 * while the covered area counts up to the figure MSG gave (facts.sabyaHub).
 */

const SECTION_VH = 380;
const WINDOW = [0.06, 0.92] as const;
const AREA = facts.sabyaHub.coverageKm2;

const R = CITY_XY.riyadh;
const S = CITY_XY.sabya;
const ring = (p: { x: number; y: number }, r: number, deg: number) => ({ x: p.x + r * Math.sin((deg * Math.PI) / 180), y: p.y - r * Math.cos((deg * Math.PI) / 180) });
const r0 = ring(R, 46, 60);
const s0 = ring(S, 40, 0);
const s1 = ring(S, 40, 70);
/** 300,000 km² as a circle on this map (50 units a degree, about 2.2 km a unit) */
const REACH = Math.sqrt(AREA / Math.PI) / 2.22;

const LEGS = [
  `M${R.x} ${R.y - 46} a46 46 0 1 1 -0.1 0 a46 46 0 0 1 ${(r0.x - R.x).toFixed(1)} ${(r0.y - (R.y - 46)).toFixed(1)}`,
  `M${r0.x.toFixed(1)} ${r0.y.toFixed(1)} C ${R.x + 60} ${R.y + 170}, ${S.x + 150} ${S.y - 210}, ${s0.x} ${s0.y}`,
  `M${s0.x} ${s0.y} a40 40 0 1 1 -0.1 0 a40 40 0 0 1 ${(s1.x - s0.x).toFixed(1)} ${(s1.y - s0.y).toFixed(1)}`,
  [20, 75, 130, 300, 340].map((d) => {
    const a = ring(S, 44, d);
    const b = ring(S, REACH * 0.92, d);
    return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }).join(" "),
];
const OUTLINE = `M${KSA.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L")} Z`;

export default function Network({ c, lang }: { c: ProfileCopy; lang: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const legRefs = useRef<SVGPathElement[]>([]);
  const vanRef = useRef<SVGGElement>(null);
  const reachRef = useRef<SVGCircleElement>(null);
  const kmRef = useRef<HTMLSpanElement>(null);
  const [leg, setLeg] = useState(0);

  useEffect(() => {
    let lastP = -1;
    let current = 0;
    return onFrame(() => {
      const root = rootRef.current;
      if (!root) return;
      const { p, rect, vh } = pinProgress(root);
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const u = range(p, ...WINDOW) * LEGS.length;
      const s = clamp(Math.floor(u), 0, LEGS.length - 1);
      if (s !== current) {
        current = s;
        setLeg(s);
      }
      legRefs.current.forEach((path, i) => {
        const k = easeOutCubic(clamp(u - i));
        path.style.strokeDashoffset = String(1 - k);
        if (i === s && i < 3) {
          const pt = path.getPointAtLength(path.getTotalLength() * k);
          vanRef.current!.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
        }
      });
      const fill = easeOutCubic(clamp(u - 3));
      reachRef.current!.setAttribute("r", (REACH * fill).toFixed(1));
      reachRef.current!.style.opacity = String(0.2 + fill * 0.5);
      kmRef.current!.textContent = Math.round(fill * AREA).toLocaleString("en-US");
    });
  }, []);

  const current = c.network.legs[leg];
  const ar = lang === "ar";

  return (
    <section ref={rootRef} id="network" aria-labelledby="network-title" className="relative bg-[#05070c]" style={{ height: `${SECTION_VH}svh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden px-4 pb-8 pt-20 sm:px-6 md:px-[6vw] md:pt-24">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#7fcbfb] rtl:tracking-normal">{c.network.eyebrow}</p>
            <h2 id="network-title" className="pf-display mt-3 max-w-[22ch] text-white">{c.network.heading}</h2>
          </div>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-white/60 rtl:tracking-normal" aria-live="off">
            {c.network.counterLabel} <span ref={kmRef} className="text-white tabular-nums" dir="ltr">0</span> {c.network.counterUnit}
          </p>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center">
          <svg viewBox={`-40 -20 ${KW + 80} ${KH + 40}`} className="h-full max-h-full w-auto max-w-full" role="img" aria-label={c.network.mapLabel}>
            <defs>
              <clipPath id="nw-ksa">
                <path d={OUTLINE} />
              </clipPath>
              <radialGradient id="nw-reach">
                <stop offset="0" stopColor="#009df8" stopOpacity="0.55" />
                <stop offset="1" stopColor="#009df8" stopOpacity="0.05" />
              </radialGradient>
              <radialGradient id="nw-glow">
                <stop offset="0" stopColor="#7fcbfb" stopOpacity="0.6" />
                <stop offset="1" stopColor="#7fcbfb" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path d={OUTLINE} fill="#0b1326" stroke="#7fcbfb" strokeOpacity="0.35" strokeWidth="1.5" />
            <g fill="#c9d6ea" clipPath="url(#nw-ksa)">
              {KSA_DOTS.map((d, i) => (
                <circle key={i} cx={d.x} cy={d.y} r="1.6" opacity={0.12 + ((i * 37) % 40) / 200} />
              ))}
            </g>
            <circle ref={reachRef} cx={S.x} cy={S.y} r="0" fill="url(#nw-reach)" clipPath="url(#nw-ksa)" style={{ opacity: 0 }} />

            {LEGS.map((d, i) => (
              <path key={`g${i}`} d={d} fill="none" stroke="#fff" strokeOpacity="0.08" strokeWidth="1.5" strokeDasharray="3 6" />
            ))}
            {LEGS.map((d, i) => (
              <path
                key={i}
                ref={(el) => {
                  if (el) legRefs.current[i] = el;
                }}
                d={d}
                pathLength={1}
                fill="none"
                stroke={i === 1 ? "#009df8" : "#ffd28a"}
                strokeWidth={i === 3 ? 1.5 : 2.5}
                strokeLinecap="round"
                strokeDasharray="1 1"
                strokeDashoffset="1"
              />
            ))}

            {[R, S].map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="26" fill="url(#nw-glow)" />
                <circle cx={p.x} cy={p.y} r="6" fill="#fff" />
              </g>
            ))}

            <g ref={vanRef} transform={`translate(${R.x} ${R.y - 46})`}>
              <circle r="12" fill="#009df8" opacity="0.3" />
              <circle r="5" fill="#fff" />
            </g>

            <g fontFamily="var(--font-pf-mono), ui-monospace, monospace" fontSize="15" letterSpacing={ar ? 0 : 2} fill="#9fb0c9" textAnchor="middle">
              <text x={R.x} y={R.y + 82}>{c.network.riyadh}</text>
              <text x={S.x + 80} y={S.y + 8}>{c.network.sabya}</text>
            </g>
          </svg>
        </div>

        <div className="grid gap-4 border-t border-white/10 pt-5 md:grid-cols-[auto_1fr_auto] md:items-end md:gap-10">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#7fcbfb] rtl:tracking-normal">
            {current.tag} · {c.network.legWord} <span dir="ltr">{leg + 1}/{c.network.legs.length}</span>
          </p>
          <div key={leg} className="animate-[pf-leg-in_0.6s_cubic-bezier(0.2,0.7,0.1,1)]" aria-live="polite">
            <h3 className="font-display text-[1.125rem] font-semibold uppercase tracking-[0.08em] text-white md:text-[1.375rem] rtl:tracking-normal">{current.title}</h3>
            <p className="mt-1.5 max-w-[40rem] text-[clamp(0.9375rem,1.05vw,1.0625rem)] text-white/70">{current.body}</p>
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            {c.network.legs.map((_, i) => (
              <span key={i} className={`h-1 w-8 rounded-full transition-colors duration-500 ${i <= leg ? "bg-[#009df8]" : "bg-white/15"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
