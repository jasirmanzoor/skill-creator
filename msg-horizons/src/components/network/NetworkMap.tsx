"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { facts } from "@/content/facts";
import type { Locale } from "@/content/i18n";
import { profileCopy } from "@/content/profile";
import { CITY_XY, KSA } from "@/lib/ksaGeo";

/* the Kingdom on the shared projection (lib/ksaGeo: 50 units a degree, longitude from 34°E, latitude from 33°N) */
const X = (lon: number) => (lon - 34) * 50;
const Y = (lat: number) => (33 - lat) * 50;
const R = CITY_XY.riyadh;
const S = CITY_XY.sabya;
const OUTLINE = `M${KSA.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L")} Z`;
/** the area MSG states it reaches from Sabya, drawn as a circle of equal area (about 2.2 km a unit on this map) */
const REACH = Math.sqrt(facts.sabyaHub.coverageKm2 / Math.PI) / 2.22;
const HAUL = `M${R.x} ${R.y} C ${R.x - 40} ${R.y + 190}, ${S.x + 170} ${S.y - 230}, ${S.x} ${S.y}`;
/** the last mile, fanning out from the hub across the area MSG states it reaches (the company profile draws the same five) */
const ring = (deg: number, r: number) => ({ x: S.x + r * Math.sin((deg * Math.PI) / 180), y: S.y - r * Math.cos((deg * Math.PI) / 180) });
const FAN = [20, 75, 130, 300, 340].map((d) => { const a = ring(d, 16), b = ring(d, REACH * 0.92); return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${b.x.toFixed(1)} ${b.y.toFixed(1)}`; });
/** one stretch of the map's scroll: 0 before it, rising to 1 across it */
const useStep = (p: MotionValue<number>, from: number, to: number, still: boolean) => useTransform(p, (v) => (still ? 1 : Math.min(1, Math.max(0, (v - from) / (to - from)))));

const ui: Record<Locale, { idx: string; title: string; lead: string; hq: string; hub: string; water: [string, string]; note: string; area: string }> = {
  en: {
    idx: "Network",
    title: "From Riyadh to the far south.",
    lead: "Planning and dispatch control sit at the Riyadh headquarters. Line haul runs south to MSG's own hub in Sabya, and the last mile goes out from there, to city streets, mountain passes and far-off villages.",
    hq: "HQ · Al Malaz, Riyadh",
    hub: "Sabya hub",
    water: ["Red Sea", "Arabian Gulf"],
    note: "Diagram. Positions of Riyadh and Sabya are true; the line-haul route is drawn, not surveyed; the hatched area is the coverage MSG states, shown as a circle of equal area.",
    area: "covered from Sabya",
  },
  ar: {
    idx: "الشبكة",
    title: "من الرياض إلى أقصى الجنوب.",
    lead: "التخطيط والتحكم في الإرسال في المقر الرئيسي بالرياض. والشحن بين المدن يتجه جنوبًا إلى مركز ام اس جي في صبيا، ومنه ينطلق الميل الأخير إلى شوارع المدن والطرق الجبلية والقرى البعيدة.",
    hq: "المقر · الملز، الرياض",
    hub: "مركز صبيا",
    water: ["البحر الأحمر", "الخليج العربي"],
    note: "رسم توضيحي. موقعا الرياض وصبيا حقيقيان؛ مسار الشحن مرسوم وليس مسحًا؛ والمنطقة المظللة هي التغطية التي تذكرها ام اس جي، مرسومة كدائرة بالمساحة نفسها.",
    area: "مغطاة من صبيا",
  },
};

type Part = 0 | 1 | 2 | 3 | null;

/**
 * The network as a survey sheet: a graticule, the Kingdom's outline, the headquarters and the hub at their true
 * coordinates, the line haul between them, and the area MSG states it reaches from Sabya, hatched and clipped to the
 * border. The legend and the drawing are one instrument: pointing at (or focusing) a leg lights its part of the map,
 * and the reverse. The line haul draws itself as the sheet comes into view (CSS scroll-driven; still where that is
 * unsupported or motion is reduced).
 */
export default function NetworkMap({ lang }: { lang: Locale }) {
  const u = ui[lang];
  const legs = profileCopy[lang].network.legs;
  const [on, setOn] = useState<Part>(null);
  // NARRATIVE: as the sheet crosses the screen the operation draws itself in order: headquarters, the line haul south,
  // the hub, the last mile fanning out, then the area it reaches. Scrolling back undraws it; nothing is pinned.
  const sheet = useRef<HTMLElement>(null);
  const still = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: sheet, offset: ["start end", "end start"] });
  const hq = useStep(p, 0.2, 0.28, still), haul = useStep(p, 0.27, 0.43, still), hub = useStep(p, 0.42, 0.48, still);
  const fan = useStep(p, 0.47, 0.56, still), reach = useStep(p, 0.54, 0.66, still);
  const reachR = useTransform(reach, (v) => REACH * (0.04 + 0.96 * v));
  const dim = (k: Exclude<Part, null>) => (on !== null && on !== k ? "opacity-35" : "opacity-100");
  const hot = (k: Exclude<Part, null>) => on === k;
  const bind = (k: Exclude<Part, null>) => ({
    onPointerEnter: () => setOn(k),
    onPointerLeave: () => setOn(null),
    onFocus: () => setOn(k),
    onBlur: () => setOn(null),
  });
  const lonLines = [36, 38, 40, 42, 44, 46, 48, 50, 52, 54];
  const latLines = [18, 20, 22, 24, 26, 28, 30, 32];

  return (
    <section ref={sheet} id="network" aria-labelledby="network-title" className="scroll-mt-16 border-t border-line bg-paper text-ink">
      <div className="mx-auto grid max-w-[88rem] gap-x-12 gap-y-12 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:px-10 lg:py-28">
        <div className="lg:col-span-4">
          <h2 id="network-title" className="font-display text-[clamp(2rem,3.4vw,3.1rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-balance rtl:leading-[1.3] rtl:tracking-normal">{u.title}</h2>
          <p className="mt-5 max-w-md text-muted text-pretty">{u.lead}</p>
          <ol className="mt-10 border-t border-ink">
            {legs.map((leg, i) => (
              <li key={leg.title} className="border-b border-line">
                <button
                  type="button"
                  {...bind(i as 0 | 1 | 2 | 3)}
                  aria-pressed={on === i}
                  className={`grid w-full grid-cols-[2.25rem_1fr] gap-x-3 py-4 text-start transition-colors ${on === i ? "bg-surface" : "hover:bg-surface"}`}
                >
                  <span className="num pt-0.5 font-mono text-xs text-brand" dir="ltr">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="lbl block text-muted">{leg.tag}</span>
                    <span className="mt-1 block font-display text-lg font-semibold">{leg.title}</span>
                    <span className="mt-1 block text-sm text-muted">{leg.body}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <figure className="lg:col-span-8">
          <div className="relative border border-ink/15 bg-surface">
            <svg viewBox="0 10 1110 850" direction="ltr" role="img" aria-label={profileCopy[lang].network.mapLabel} className="block h-auto w-full">
              <defs>
                <clipPath id="ksa-clip"><path d={OUTLINE} /></clipPath>
                <pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="9" stroke="currentColor" strokeWidth="1.4" />
                </pattern>
              </defs>
              {/* graticule */}
              <g className="text-ink/10" stroke="currentColor" strokeWidth="1">
                {lonLines.map((l) => <line key={`x${l}`} x1={X(l)} y1={10} x2={X(l)} y2={860} />)}
                {latLines.map((l) => <line key={`y${l}`} x1={0} y1={Y(l)} x2={1110} y2={Y(l)} />)}
              </g>
              <g className="fill-muted font-mono" fontSize="13" letterSpacing="0.06em">
                {lonLines.filter((l) => l % 4 === 0).map((l) => <text key={`tx${l}`} x={X(l) + 5} y={850}>{l}°E</text>)}
                {latLines.filter((l) => l % 4 === 0).map((l) => <text key={`ty${l}`} x={8} y={Y(l) - 6}>{l}°N</text>)}
              </g>
              {/* water, for orientation only */}
              <g className="fill-muted" fontSize="14" fontStyle="italic" letterSpacing="0.2em">
                <text x={X(37.4)} y={Y(20.4)} transform={`rotate(-52 ${X(37.4)} ${Y(20.4)})`}>{u.water[0]}</text>
                <text x={X(50.3)} y={Y(28.4)} transform={`rotate(-38 ${X(50.3)} ${Y(28.4)})`}>{u.water[1]}</text>
              </g>
              {/* the Kingdom */}
              <path d={OUTLINE} className="fill-paper stroke-ink" strokeWidth="1.6" strokeLinejoin="round" />
              {/* coverage from Sabya, hatched, inside the border */}
              <g clipPath="url(#ksa-clip)" className={`transition-opacity duration-200 ${dim(3)} ${hot(3) ? "text-brand" : "text-brand/45"}`}>
                <motion.circle cx={S.x} cy={S.y} r={reachR} fill="url(#hatch)" />
                <motion.circle cx={S.x} cy={S.y} r={reachR} fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="5 5" />
              </g>
              {/* the last mile, fanning out from the hub */}
              <g className={`transition-opacity duration-200 ${dim(3)}`}>
                {FAN.map((d) => <motion.path key={d} d={d} fill="none" className="stroke-brand" strokeWidth="1.6" strokeDasharray="1 0" style={{ pathLength: fan }} />)}
              </g>
              {/* the line haul */}
              <g className={`transition-opacity duration-200 ${dim(1)}`}>
                <path d={HAUL} fill="none" className="stroke-ink/15" strokeWidth="5" />
                <motion.path d={HAUL} fill="none" className={hot(1) ? "stroke-brand" : "stroke-ink"} strokeWidth={hot(1) ? 3.5 : 2.5} style={{ pathLength: haul }} />
                {/* AMBIENT: one vehicle on the line haul, all the time: the network is running */}
                {still ? null : (
                  <motion.g style={{ opacity: haul }} className="net-van">
                    <circle r="6" className="fill-brand"><animateMotion dur="7s" repeatCount="indefinite" path={HAUL} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1" /></circle>
                  </motion.g>
                )}
              </g>
              {/* headquarters */}
              <motion.g style={{ opacity: hq }} className={`transition-opacity duration-200 ${dim(0)}`}>
                <rect x={R.x - 9} y={R.y - 9} width="18" height="18" className={hot(0) ? "fill-brand" : "fill-ink"} />
                <line x1={R.x + 9} y1={R.y} x2={R.x + 34} y2={R.y} className="stroke-ink" strokeWidth="1" />
                <text x={R.x + 40} y={R.y - 4} className="net-name fill-ink font-display" fontSize="19" fontWeight="600">{u.hq}</text>
                <text x={R.x + 40} y={R.y + 16} className="net-coord fill-muted font-mono" fontSize="12.5" letterSpacing="0.06em" direction="ltr">24.71°N 46.72°E</text>
              </motion.g>
              {/* the hub */}
              <motion.g style={{ opacity: hub }} className={`transition-opacity duration-200 ${dim(2)}`}>
                {/* AMBIENT: the hub breathes */}
                <circle cx={S.x} cy={S.y} r="11" className="hub-ring fill-none stroke-brand" strokeWidth="1.5" />
                <circle cx={S.x} cy={S.y} r="11" className="hub-ring hub-ring-2 fill-none stroke-brand" strokeWidth="1.5" />
                <circle cx={S.x} cy={S.y} r="11" className={hot(2) ? "fill-brand" : "fill-ink"} />
                <circle cx={S.x} cy={S.y} r="4" className="fill-paper" />
                <line x1={S.x + 11} y1={S.y} x2={S.x + 190} y2={S.y} className="stroke-ink" strokeWidth="1" />
                <text x={S.x + 196} y={S.y - 4} className="net-name fill-ink font-display" fontSize="19" fontWeight="600">{u.hub}</text>
                <text x={S.x + 196} y={S.y + 16} className="net-coord fill-muted font-mono" fontSize="12.5" letterSpacing="0.06em" direction="ltr">17.15°N 42.63°E · {facts.sabyaHub.areaM2.toLocaleString("en-US")} m²</text>
              </motion.g>
            </svg>
            {/* the stated reach, as a reading */}
            <div className="absolute end-4 top-4 border border-ink/15 bg-paper px-4 py-3 sm:end-6 sm:top-6">
              <p className="num font-display text-2xl font-semibold tracking-[-0.02em] sm:text-3xl" dir="ltr">≈ {facts.sabyaHub.coverageKm2.toLocaleString("en-US")} km²</p>
              <p className="lbl mt-1 text-muted">{u.area}</p>
            </div>
          </div>
          <figcaption className="mt-3 text-xs text-muted">{u.note}</figcaption>
        </figure>
      </div>
    </section>
  );
}
