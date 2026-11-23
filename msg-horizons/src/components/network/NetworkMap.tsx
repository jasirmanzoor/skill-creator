"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { facts } from "@/content/facts";
import type { Locale } from "@/content/i18n";
import { profileCopy } from "@/content/profile";
import { CITY_XY, KSA } from "@/lib/ksaGeo";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/* the Kingdom on the shared projection (lib/ksaGeo: 50 units a degree, longitude from 34°E, latitude from 33°N) */
const X = (lon: number) => (lon - 34) * 50;
const Y = (lat: number) => (33 - lat) * 50;
const R = CITY_XY.riyadh;
const S = CITY_XY.sabya;
const OUTLINE = `M${KSA.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L")} Z`;
/** the area MSG states it reaches from Sabya, drawn as a circle of equal area (about 2.2 km a unit on this map) */
const REACH = Math.sqrt(facts.sabyaHub.coverageKm2 / Math.PI) / 2.22;
const HAUL = `M${R.x} ${R.y} C ${R.x - 40} ${R.y + 190}, ${S.x + 170} ${S.y - 230}, ${S.x} ${S.y}`;

const ui: Record<Locale, { idx: string; title: string; lead: string; hq: string; hub: string; water: [string, string]; note: string; area: string }> = {
  en: {
    idx: "The network",
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

type Part = 0 | 1 | 2 | 3;

/** where each leg of the story sits on the scene's 0 → 1 progress */
const BEAT = { outline: [0, 0.28], hq: [0.22, 0.34], haul: [0.32, 0.7], hub: [0.66, 0.76], reach: [0.74, 0.94] } as const;
const legAt = (v: number): Part | null => (v < 0.22 ? null : v < 0.34 ? 0 : v < 0.7 ? 1 : v < 0.76 ? 2 : 3);

/** a 0 → 1 value for one beat of the scene */
function useBeat(p: MotionValue<number>, [a, b]: readonly [number, number]) {
  return useTransform(p, [a, b], [0, 1], { clamp: true });
}

/**
 * The network, as the page's one cinematic scroll scene. On a navy night ground the story draws itself while the
 * section travels through the screen: the Kingdom's outline, the Riyadh headquarters, the line haul south with a
 * convoy marker riding it, the Sabya hub, then the area MSG states it covers from there. The legend beside it lights
 * the leg being drawn; pointing at or focusing a leg lights that part of the map instead. Nothing is pinned or
 * snapped: the drawing follows the scroll position, eased so it never jumps, and the page keeps moving at the
 * visitor's pace. On phones and tablets it plays once, by time, when the map comes into view; with reduced motion
 * the map is simply complete. Only verified places and the stated coverage are drawn; the note says what is a diagram.
 */
export default function NetworkMap({ lang }: { lang: Locale }) {
  const u = ui[lang];
  const legs = profileCopy[lang].network.legs;
  const reduce = useReducedMotion();
  const fig = useRef<HTMLElement>(null);
  const haulRef = useRef<SVGPathElement>(null);
  const [pointer, setPointer] = useState<Part | null>(null);
  const [auto, setAuto] = useState<Part | null>(null);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // desktop: the drawing follows the scroll, from the map entering to its middle reaching the centre of the screen
  const { scrollYProgress } = useScroll({ target: fig, offset: ["start 0.78", "center 0.5"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 160, damping: 34, mass: 0.5 });
  // phones and tablets: one timed pass when the map is in view
  const timed = useMotionValue(0);
  const seen = useInView(fig, { once: true, amount: 0.35 });
  useEffect(() => {
    if (wide || reduce || !seen) return;
    const c = animate(timed, 1, { duration: 2.6, ease: [0.37, 0, 0.63, 1] });
    return () => c.stop();
  }, [wide, reduce, seen, timed]);

  // the scene's progress, fed from whichever source applies (the closure-free way to switch sources)
  const p = useMotionValue(0);
  useEffect(() => {
    if (reduce) { p.set(1); return; }
    const src = wide ? smooth : timed;
    p.set(src.get());
    return src.on("change", (v) => p.set(v));
  }, [reduce, wide, smooth, timed, p]);

  const outline = useBeat(p, BEAT.outline);
  const hq = useBeat(p, BEAT.hq);
  const haul = useBeat(p, BEAT.haul);
  const hub = useBeat(p, BEAT.hub);
  const reach = useBeat(p, BEAT.reach);
  const grid = useTransform(outline, [0, 1], [0, 1]);
  const hqScale = useTransform(hq, [0, 1], [0.4, 1]);
  const hubScale = useTransform(hub, [0, 1], [0.4, 1]);
  const reachR = useTransform(reach, [0, 1], [0, REACH]);
  const convoyOpacity = useTransform(haul, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  const cx = useMotionValue(R.x);
  const cy = useMotionValue(R.y);

  useMotionValueEvent(haul, "change", (v) => {
    const path = haulRef.current;
    if (!path) return;
    const pt = path.getPointAtLength(v * path.getTotalLength());
    cx.set(pt.x);
    cy.set(pt.y);
  });
  useMotionValueEvent(p, "change", (v) => setAuto(legAt(v)));

  const on = pointer ?? (reduce ? null : auto);
  const dim = (k: Part) => (pointer !== null && pointer !== k ? 0.3 : 1);
  const convoyGlow = useTransform(convoyOpacity, (v) => v * 0.25);
  const bind = (k: Part) => ({
    onPointerEnter: () => setPointer(k),
    onPointerLeave: () => setPointer(null),
    onFocus: () => setPointer(k),
    onBlur: () => setPointer(null),
  });
  const lonLines = [36, 38, 40, 42, 44, 46, 48, 50, 52, 54];
  const latLines = [18, 20, 22, 24, 26, 28, 30, 32];

  return (
    <section id="network" aria-labelledby="network-title" data-theme="dark" className="v3-night relative scroll-mt-16 overflow-hidden text-white">
      <div className="relative mx-auto max-w-[88rem] px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="lbl text-brand-mint">{u.idx}</p>
            <h2 id="network-title" className="mt-5 font-display text-[clamp(2.4rem,5.4vw,5.25rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-balance rtl:leading-[1.25] rtl:tracking-normal">{u.title}</h2>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-white/75 text-pretty lg:col-span-5">{u.lead}</p>
        </div>

        <div className="mt-14 grid gap-x-12 gap-y-10 lg:mt-20 lg:grid-cols-12">
          <ol className="order-2 border-t border-white/25 lg:order-1 lg:col-span-4 lg:self-center">
            {legs.map((leg, i) => {
              const k = i as Part;
              const lit = on === k;
              return (
                <li key={leg.title} className="border-b border-white/12">
                  <button
                    type="button"
                    {...bind(k)}
                    aria-pressed={pointer === k}
                    className="group relative grid w-full grid-cols-[2.25rem_1fr] gap-x-3 py-5 text-start"
                  >
                    <span aria-hidden="true" className={`absolute inset-y-0 start-0 w-0.5 origin-top bg-brand-bright transition-transform duration-300 ${lit ? "scale-y-100" : "scale-y-0"}`} />
                    <span className={`num ps-3 pt-0.5 font-mono text-xs transition-colors duration-300 ${lit ? "text-brand-bright" : "text-white/45"}`} dir="ltr">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="lbl block text-white/55">{leg.tag}</span>
                      <span className={`mt-1 block font-display text-xl font-semibold transition-colors duration-300 ${lit ? "text-white" : "text-white/70 group-hover:text-white"}`}>{leg.title}</span>
                      <span className={`mt-1 block text-sm transition-colors duration-300 ${lit ? "text-white/80" : "text-white/55"}`}>{leg.body}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <figure ref={fig} className="order-1 lg:order-2 lg:col-span-8">
            <div className="relative">
              <svg viewBox="0 10 1110 850" direction="ltr" role="img" aria-label={profileCopy[lang].network.mapLabel} className="block h-auto w-full">
                <defs>
                  <clipPath id="ksa-clip"><path d={OUTLINE} /></clipPath>
                  <pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="9" stroke="#009df8" strokeWidth="1.4" />
                  </pattern>
                  <radialGradient id="hub-glow">
                    <stop offset="0" stopColor="#009df8" stopOpacity="0.55" />
                    <stop offset="1" stopColor="#009df8" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* graticule */}
                <motion.g style={{ opacity: grid }} stroke="rgb(255 255 255 / 0.07)" strokeWidth="1">
                  {lonLines.map((l) => <line key={`x${l}`} x1={X(l)} y1={10} x2={X(l)} y2={860} />)}
                  {latLines.map((l) => <line key={`y${l}`} x1={0} y1={Y(l)} x2={1110} y2={Y(l)} />)}
                </motion.g>
                <motion.g style={{ opacity: grid }} fill="rgb(255 255 255 / 0.4)" className="font-mono" fontSize="13" letterSpacing="0.06em">
                  {lonLines.filter((l) => l % 4 === 0).map((l) => <text key={`tx${l}`} x={X(l) + 5} y={850}>{l}°E</text>)}
                  {latLines.filter((l) => l % 4 === 0).map((l) => <text key={`ty${l}`} x={8} y={Y(l) - 6}>{l}°N</text>)}
                  <text x={X(37.4)} y={Y(20.4)} fontSize="14" fontStyle="italic" letterSpacing="0.2em" transform={`rotate(-52 ${X(37.4)} ${Y(20.4)})`}>{u.water[0]}</text>
                  <text x={X(50.3)} y={Y(28.4)} fontSize="14" fontStyle="italic" letterSpacing="0.2em" transform={`rotate(-38 ${X(50.3)} ${Y(28.4)})`}>{u.water[1]}</text>
                </motion.g>

                {/* the Kingdom, drawn */}
                <motion.path d={OUTLINE} fill="rgb(255 255 255 / 0.035)" stroke="rgb(255 255 255 / 0.75)" strokeWidth="1.5" strokeLinejoin="round" style={{ pathLength: outline }} />

                {/* coverage from Sabya, opening from the hub, inside the border */}
                <motion.g clipPath="url(#ksa-clip)" style={{ opacity: dim(3) }}>
                  <motion.circle cx={S.x} cy={S.y} r={reachR} fill="url(#hatch)" opacity={on === 3 ? 0.9 : 0.6} />
                  <motion.circle cx={S.x} cy={S.y} r={reachR} fill="none" stroke="#009df8" strokeWidth="1.4" strokeDasharray="5 5" />
                </motion.g>

                {/* the line haul, with its convoy */}
                <motion.g style={{ opacity: dim(1) }}>
                  <path d={HAUL} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="6" />
                  <path ref={haulRef} d={HAUL} fill="none" stroke="none" />
                  <motion.path d={HAUL} fill="none" stroke="#009df8" strokeWidth={on === 1 ? 4 : 3} strokeLinecap="round" style={{ pathLength: haul }} />
                  <motion.circle cx={cx} cy={cy} r="16" fill="#009df8" style={{ opacity: convoyGlow }} />
                  <motion.circle cx={cx} cy={cy} r="6" fill="#ffffff" style={{ opacity: convoyOpacity }} />
                </motion.g>

                {/* headquarters */}
                <g opacity={dim(0)}><motion.g style={{ opacity: hq }}>
                  <motion.rect x={R.x - 9} y={R.y - 9} width="18" height="18" fill={on === 0 ? "#009df8" : "#ffffff"} style={{ scale: hqScale, transformBox: "fill-box", transformOrigin: "center" }} />
                  <line x1={R.x + 9} y1={R.y} x2={R.x + 34} y2={R.y} stroke="rgb(255 255 255 / 0.6)" strokeWidth="1" />
                  <text x={R.x + 40} y={R.y - 4} className="net-name font-display" fill="#ffffff" fontSize="19" fontWeight="600">{u.hq}</text>
                  <text x={R.x + 40} y={R.y + 16} className="net-coord font-mono" fill="rgb(255 255 255 / 0.55)" fontSize="12.5" letterSpacing="0.06em" direction="ltr">24.71°N 46.72°E</text>
                </motion.g></g>

                {/* the hub */}
                <g opacity={dim(2)}><motion.g style={{ opacity: hub }}>
                  <motion.circle cx={S.x} cy={S.y} r="46" fill="url(#hub-glow)" style={{ scale: hubScale, transformBox: "fill-box", transformOrigin: "center" }} />
                  <motion.circle cx={S.x} cy={S.y} r="11" fill={on === 2 ? "#009df8" : "#ffffff"} style={{ scale: hubScale, transformBox: "fill-box", transformOrigin: "center" }} />
                  <circle cx={S.x} cy={S.y} r="4" fill="#111b36" />
                  <line x1={S.x + 11} y1={S.y} x2={S.x + 190} y2={S.y} stroke="rgb(255 255 255 / 0.6)" strokeWidth="1" />
                  <text x={S.x + 196} y={S.y - 4} className="net-name font-display" fill="#ffffff" fontSize="19" fontWeight="600">{u.hub}</text>
                  <text x={S.x + 196} y={S.y + 16} className="net-coord font-mono" fill="rgb(255 255 255 / 0.55)" fontSize="12.5" letterSpacing="0.06em" direction="ltr">17.15°N 42.63°E · {facts.sabyaHub.areaM2.toLocaleString("en-US")} m²</text>
                </motion.g></g>
              </svg>

              {/* the stated reach, as a reading */}
              <motion.div style={{ opacity: reach }} className="absolute end-0 top-0 border-s border-white/25 ps-4 sm:ps-5">
                <p className="num font-display text-2xl font-semibold tracking-[-0.02em] sm:text-4xl" dir="ltr">≈ {facts.sabyaHub.coverageKm2.toLocaleString("en-US")} km²</p>
                <p className="lbl mt-1 text-white/60">{u.area}</p>
              </motion.div>
            </div>
            <figcaption className="mt-4 max-w-2xl text-xs leading-relaxed text-white/55">{u.note}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
