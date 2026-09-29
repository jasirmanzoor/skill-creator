"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { experience, STAGE_IDS, type StageId } from "@/content/experience";
import type { Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon } from "../ui/icons";

const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Enquiry → requirements → standard guide → recommendations → agreement → testing → go live.
 *
 * Desktop: the section pins and scroll drives a horizontal camera across seven stage cards while a
 * parcel travels the progress rail; each stage's scene plays as it becomes active.
 * Mobile / reduced motion: a vertical timeline where each scene plays as it scrolls into view.
 */
export default function Journey({ lang }: { lang: Locale }) {
  const c = experience[lang].journey;
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [active, setActive] = useState(0);
  const rtl = lang === "ar";

  useIsoLayout(() => {
    const measure = () => {
      const t = track.current;
      if (!t) return;
      setDistance(Math.max(0, t.scrollWidth - window.innerWidth + 80));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.04, 0.92], [0, (rtl ? 1 : -1) * distance]);
  const rail = useTransform(scrollYProgress, [0.04, 0.92], ["0%", "100%"]);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(STAGE_IDS.length - 1, Math.max(0, Math.floor(((v - 0.04) / 0.88) * STAGE_IDS.length)));
    setActive(i);
  });

  const header = (
    <div className="max-w-3xl">
      <span className="label">{c.eyebrow}</span>
      <h2 id="journey-title" className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-white text-balance sm:text-5xl rtl:tracking-normal">
        {c.title}
      </h2>
      <p className="mt-4 max-w-2xl text-lg text-white/65 text-pretty">{c.lead}</p>
    </div>
  );

  return (
    <section
      id="journey"
      ref={section}
      aria-labelledby="journey-title"
      data-theme="dark"
      className={`on-dark relative scroll-mt-16 bg-[#07090f] text-white ${reduce ? "" : "lg:h-[460vh]"}`}
    >
      {/* Desktop: pinned horizontal journey */}
      <div className={`sticky top-0 hidden h-[100svh] flex-col overflow-hidden ${reduce ? "" : "lg:flex"}`}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-8 pt-24">{header}</div>

        <div className="relative mt-10 flex-1">
          <motion.div ref={track} style={{ x }} className="flex h-full items-start gap-6 px-8 will-change-transform">
            <div aria-hidden="true" className="w-[max(0px,calc((100vw-80rem)/2))] shrink-0" />
            {STAGE_IDS.map((id, i) => (
              <StageCard key={id} id={id} i={i} lang={lang} active={i === active} passed={i < active} />
            ))}
            <div className="flex w-[22rem] shrink-0 flex-col justify-center self-stretch pb-24">
              <TrackedLink
                href="#contact"
                event="cta_click"
                props={{ cta: "enquire", location: "journey" }}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3.5 font-medium text-ink transition-colors hover:bg-white/90"
              >
                {c.cta} <ArrowIcon className="size-4 rtl:rotate-180" />
              </TrackedLink>
            </div>
          </motion.div>
        </div>

        {/* progress rail with a travelling parcel */}
        <div className="relative mx-auto w-full max-w-7xl px-8 pb-10">
          <div className="relative h-px bg-white/15">
            <motion.div style={{ width: rail }} className="absolute inset-y-0 start-0 bg-[#8ea2ff]" />
            <motion.span style={{ insetInlineStart: rail }} className="absolute top-1/2 size-3 -translate-y-1/2 rounded-[3px] bg-white shadow-[0_0_16px_4px_rgba(142,162,255,0.6)] ltr:-translate-x-1/2 rtl:translate-x-1/2" />
          </div>
          <ol className="mt-4 grid grid-cols-7 gap-2 text-xs">
            {STAGE_IDS.map((id, i) => (
              <li key={id} className={`transition-colors duration-300 ${i === active ? "text-white" : i < active ? "text-white/55" : "text-white/35"}`}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>{" "}
                {c.stages[id].t}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Mobile + reduced motion: vertical timeline */}
      <div className={`relative mx-auto max-w-7xl px-5 py-24 ${reduce ? "" : "lg:hidden"}`}>
        {header}
        <ol className="relative mt-12 space-y-5 border-s border-white/15 ps-6">
          {STAGE_IDS.map((id, i) => (
            <InViewStage key={id} id={id} i={i} lang={lang} />
          ))}
        </ol>
        <TrackedLink
          href="#contact"
          event="cta_click"
          props={{ cta: "enquire", location: "journey" }}
          className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-6 py-3.5 font-medium text-ink"
        >
          {c.cta} <ArrowIcon className="size-4 rtl:rotate-180" />
        </TrackedLink>
      </div>
    </section>
  );
}

function StageCard({ id, i, lang, active, passed }: { id: StageId; i: number; lang: Locale; active: boolean; passed: boolean }) {
  const s = experience[lang].journey.stages[id];
  return (
    <article
      data-active={active || undefined}
      className={`journey-card relative w-[min(30rem,36vw)] shrink-0 overflow-hidden rounded-2xl border transition-all duration-500 ${
        active ? "border-[#8ea2ff]/50 bg-white/[0.07] shadow-[0_30px_80px_-30px_rgba(142,162,255,0.45)]" : "border-white/10 bg-white/[0.03]"
      } ${active ? "scale-100 opacity-100" : passed ? "scale-[0.97] opacity-60" : "scale-[0.97] opacity-45"}`}
    >
      <StageScene id={id} />
      <div className="p-6">
        <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-[#8ea2ff] rtl:tracking-normal">
          <span className="num text-white/50">{String(i + 1).padStart(2, "0")}</span>
          {s.tag}
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-white rtl:tracking-normal">{s.t}</h3>
        <p className="mt-2 text-white/65">{s.d}</p>
      </div>
    </article>
  );
}

function InViewStage({ id, i, lang }: { id: StageId; i: number; lang: Locale }) {
  const s = experience[lang].journey.stages[id];
  const ref = useRef<HTMLLIElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <li ref={ref} data-active={on || undefined} className="journey-card relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <span aria-hidden="true" className={`absolute -start-[1.95rem] top-6 size-3 rounded-full border-2 border-[#07090f] transition-colors ${on ? "bg-[#8ea2ff]" : "bg-white/30"}`} />
      <StageScene id={id} />
      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8ea2ff] rtl:tracking-normal">
          <span className="num me-2 text-white/50">{String(i + 1).padStart(2, "0")}</span>
          {s.tag}
        </p>
        <h3 className="mt-1.5 font-display text-xl font-semibold text-white">{s.t}</h3>
        <p className="mt-1.5 text-white/65">{s.d}</p>
      </div>
    </li>
  );
}

const B = "#8ea2ff";
const W = "rgba(255,255,255,0.85)";
const DIM = "rgba(255,255,255,0.18)";

/** One living diagram per stage; animations run only while the card is active (see "js-" in globals.css). */
function StageScene({ id }: { id: StageId }) {
  return (
    <svg viewBox="0 0 320 170" className="block h-auto w-full border-b border-white/10 bg-[#0b0d12]" aria-hidden="true" direction="ltr">
      <g stroke="rgba(255,255,255,0.04)">
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 40} y1="0" x2={i * 40} y2="170" />)}
      </g>
      {scenes[id]}
    </svg>
  );
}

const scenes: Record<StageId, React.ReactNode> = {
  enquiry: (
    <g>
      <rect x="112" y="18" width="96" height="140" rx="14" fill="none" stroke={W} strokeWidth="1.6" />
      <rect className="js-bubble" x="124" y="44" width="58" height="16" rx="8" fill={DIM} style={{ animationDelay: "0s" }} />
      <rect className="js-bubble" x="138" y="68" width="58" height="16" rx="8" fill={B} style={{ animationDelay: ".45s" }} />
      <rect className="js-bubble" x="124" y="92" width="44" height="16" rx="8" fill={DIM} style={{ animationDelay: ".9s" }} />
      <path className="js-plane" d="M0 0l16 6-16 6 4-6z" fill="#fff" />
    </g>
  ),
  requirements: (
    <g>
      {[0, 1, 2, 3].map((r) => (
        <g key={r} transform={`translate(60 ${34 + r * 30})`}>
          <line x1="0" y1="0" x2="200" y2="0" stroke={DIM} strokeWidth="3" strokeLinecap="round" />
          <line className="js-grow" x1="0" y1="0" x2={[150, 90, 170, 60][r]} y2="0" stroke={B} strokeWidth="3" strokeLinecap="round" pathLength={1} style={{ animationDelay: `${r * 0.25}s` }} />
          <circle className="js-knob" cx={[150, 90, 170, 60][r]} cy="0" r="6" fill="#fff" style={{ animationDelay: `${r * 0.25}s` }} />
        </g>
      ))}
    </g>
  ),
  guide: (
    <g>
      <rect x="54" y="22" width="92" height="126" rx="6" fill="none" stroke={W} strokeWidth="1.6" />
      {[46, 62, 78, 94, 110].map((y, i) => <rect key={y} x="68" y={y} width={[64, 50, 58, 40, 54][i]} height="5" rx="2.5" fill={DIM} />)}
      <path d="M180 70l44-18 44 18v52l-44 18-44-18z" fill="none" stroke={W} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M180 70l44 18 44-18M224 88v52" fill="none" stroke={W} strokeWidth="1.6" strokeLinejoin="round" />
      <rect className="js-stamp" x="236" y="96" width="24" height="16" rx="2" fill={B} />
    </g>
  ),
  recommendations: (
    <g>
      {Array.from({ length: 48 }, (_, i) => (
        <circle key={i} className="js-dot" cx={52 + (i % 12) * 20} cy={46 + Math.floor(i / 12) * 22} r="4" fill={i % 12 > 7 ? B : "#fff"} style={{ animationDelay: `${(i % 12) * 0.05 + Math.floor(i / 12) * 0.08}s` }} />
      ))}
      <path className="js-draw" d="M52 150 C 120 150 150 120 290 120" fill="none" stroke={B} strokeWidth="2" pathLength={1} />
    </g>
  ),
  agreement: (
    <g>
      <rect x="84" y="16" width="152" height="140" rx="6" fill="none" stroke={W} strokeWidth="1.6" />
      {[36, 50, 64, 78].map((y, i) => <rect key={y} x="100" y={y} width={[110, 96, 118, 80][i]} height="5" rx="2.5" fill={DIM} />)}
      <path className="js-draw" d="M104 126c10-18 18 8 26-6s12 10 22 0 10-8 18 2" fill="none" stroke={B} strokeWidth="2.4" strokeLinecap="round" pathLength={1} />
      <circle className="js-seal" cx="206" cy="124" r="14" fill="none" stroke="#fff" strokeWidth="2" />
    </g>
  ),
  testing: (
    <g>
      <line x1="40" y1="100" x2="280" y2="100" stroke={DIM} strokeWidth="2" strokeDasharray="4 6" />
      {[80, 160, 240].map((cx, i) => (
        <g key={cx}>
          <rect x={cx - 18} y="64" width="36" height="36" rx="4" fill="none" stroke={W} strokeWidth="1.6" />
          <circle className="js-check" cx={cx} cy="128" r="11" fill={B} style={{ animationDelay: `${0.3 + i * 0.6}s` }} />
          <path className="js-check" d={`M${cx - 5} 128l3.5 3.5 6.5-7`} stroke="#0b0d12" strokeWidth="2.2" fill="none" strokeLinecap="round" style={{ animationDelay: `${0.3 + i * 0.6}s` }} />
        </g>
      ))}
    </g>
  ),
  live: (
    <g>
      <path d="M30 130 C 90 130 100 60 160 60 S 240 110 290 40" fill="none" stroke={DIM} strokeWidth="8" strokeLinecap="round" />
      <path className="js-draw" d="M30 130 C 90 130 100 60 160 60 S 240 110 290 40" fill="none" stroke={B} strokeWidth="2" pathLength={1} />
      <rect className="js-van" x="-8" y="-5" width="16" height="10" rx="2" fill="#fff" style={{ offsetPath: "path('M30 130 C 90 130 100 60 160 60 S 240 110 290 40')" }} />
      <g transform="translate(236 128)">
        <circle className="js-live" r="5" fill="#34d399" />
        <text x="12" y="4" fill="#fff" fontSize="12" fontWeight="600" fontFamily="inherit">LIVE</text>
      </g>
    </g>
  ),
};
