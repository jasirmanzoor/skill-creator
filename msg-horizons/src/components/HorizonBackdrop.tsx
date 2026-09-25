"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useEffect, useState } from "react";

/**
 * The cinematic backdrop: one real desert horizon, fixed behind the whole page.
 *
 *  • Dolly: during the first screen of scroll the camera pushes in toward the horizon.
 *  • A day in one scroll: the scene moves from bright day (top) through golden hour and dusk
 *    to night (bottom, where visitors contact MSG). It tells the 24/7 story without words.
 *  • "MSG" stands on the horizon as a sand-toned landmark; at night it is softly lit.
 *
 * Alignment: the horizon sits at 50.8% of the photo; object-position 50% 50.8% pins that point
 * to 50.8% of the viewport on every screen, and all scaling uses it as the origin.
 */
const HORIZON = 50.8;
const ORIGIN = `50% ${HORIZON}%`;

// Deterministic star field (upper sky only)
const STARS = Array.from({ length: 140 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return { x: r(1) * 100, y: r(2) * 46, s: r(3) < 0.12 ? 1.6 : r(3) < 0.5 ? 1.1 : 0.7, o: 0.35 + r(4) * 0.65 };
});

export default function HorizonBackdrop() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const k = useSceneKeyframes();

  // camera
  const dolly = useTransform(scrollY, [0, 900], [1, reduce ? 1 : 1.14]);
  const blurOpacity = useTransform(scrollY, [0, 900], [0, 0.55]);

  // time of day, anchored to real section positions (robust to content length, language and screen size)
  const golden = useTransform(scrollY, [k.goldenIn, k.goldenPeak, k.duskIn], [0, 1, 0.35]);
  const dusk = useTransform(scrollY, [k.duskIn, k.duskFull], [0, 1]);
  const night = useTransform(scrollY, [k.nightIn, k.nightFull], [0, 1]);
  const litLetters = useTransform(scrollY, [k.nightIn, k.nightFull], [0, 0.5]); // ambient, never competing with content
  const dayLetters = useTransform(scrollY, [k.nightIn, k.nightFull], [1, 0.4]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#dfe7f3]">
      <motion.div className="absolute inset-0" style={{ scale: dolly, transformOrigin: ORIGIN }}>
        <picture>
          <source media="(min-width: 1024px)" srcSet="/media/brand/horizon-2400.jpg" />
          { }
          <img
            src="/media/brand/horizon-1280.jpg"
            alt=""
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: ORIGIN }}
          />
        </picture>
        <motion.img
          src="/media/brand/horizon-blur.jpg"
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
          style={{ objectPosition: ORIGIN, opacity: blurOpacity }}
        />
        <div className="msg-landmark absolute inset-0">
          <Letters opacity={dayLetters} reduce={!!reduce} />
        </div>
      </motion.div>

      {/* golden hour: warm, low light raking across the sand */}
      <motion.div
        className="absolute inset-0 mix-blend-soft-light"
        style={{
          opacity: golden,
          background: "linear-gradient(to bottom, rgba(255,190,120,0.35) 0%, rgba(255,150,70,0.9) 48%, rgba(255,140,60,0.8) 56%, rgba(190,110,50,0.6) 100%)",
        }}
      />
      {/* dusk: indigo sky, rose at the horizon */}
      <motion.div
        className="absolute inset-0 mix-blend-multiply"
        style={{
          opacity: dusk,
          background: `linear-gradient(to bottom, #3b3f86 0%, #7c6aa6 30%, #d9929a ${HORIZON - 2}%, #b98a7c ${HORIZON + 2}%, #6f5a62 100%)`,
        }}
      />
      {/* night */}
      <motion.div className="absolute inset-0" style={{ opacity: night, background: `linear-gradient(to bottom, #050a1c 0%, #0b1433 ${HORIZON}%, #0d1120 ${HORIZON + 0.5}%, #07090f 100%)` }}>
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {STARS.map((st, i) => (
            <circle key={i} cx={`${st.x}%`} cy={`${st.y}%`} r={st.s} fill="#fff" opacity={st.o} />
          ))}
        </svg>
        {/* faint glow of the horizon: operations still running */}
        <div className="absolute inset-x-0" style={{ top: `${HORIZON - 6}%`, height: "12%", background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(142,162,255,0.18), transparent 70%)" }} />
      </motion.div>
      {/* the landmark, softly lit at night */}
      <motion.div className="absolute inset-0" style={{ scale: dolly, transformOrigin: ORIGIN, opacity: litLetters }}>
        <div className="msg-landmark absolute inset-0">
          <Letters lit reduce />
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Scroll positions (px) where the light changes, measured from the live sections:
 * golden hour peaks at #fleet, dusk arrives with #enterprise, night is complete before #contact.
 */
function useSceneKeyframes() {
  const [k, setK] = useState({ goldenIn: 1e6, goldenPeak: 1e6 + 1, duskIn: 1e6 + 2, duskFull: 1e6 + 3, nightIn: 1e6 + 4, nightFull: 1e6 + 5 });
  useEffect(() => {
    const measure = () => {
      const top = (id: string) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : NaN;
      };
      const vh = window.innerHeight;
      const fleet = top("fleet"), ent = top("enterprise"), contact = top("contact");
      if ([fleet, ent, contact].some(Number.isNaN)) return;
      const inc = (a: number[]) => a.map((v, i) => Math.max(v, (a[i - 1] ?? -Infinity) + 1)); // keep strictly increasing
      const [goldenIn, goldenPeak, duskIn, duskFull, nightIn, nightFull] = inc([
        fleet - vh * 1.5, fleet, ent - vh, ent + vh * 0.4, contact - vh * 2.2, contact - vh * 0.6,
      ]);
      setK({ goldenIn, goldenPeak, duskIn, duskFull, nightIn, nightFull });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  return k;
}

/**
 * MSG as a distant land-art monument standing on the horizon: sand-toned fill, right-side light,
 * shallow extruded side faces, horizon haze, film grain, distance blur and a contact shadow.
 */
function Letters({ opacity, lit = false, reduce }: { opacity?: MotionValue<number>; lit?: boolean; reduce: boolean }) {
  const id = lit ? "n" : "d";
  return (
    <motion.div
      className="absolute inset-x-0 flex justify-center"
      style={{ top: `${HORIZON}%`, opacity, filter: lit ? "drop-shadow(0 0 10px rgba(255,214,160,0.25))" : undefined }}
    >
      <motion.svg
        viewBox="0 0 820 230"
        className="w-[64vw] max-w-[60vh] -translate-y-[95.8%] lg:w-[36vw]"
        initial={reduce ? false : { opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0.45px)" }}
        transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}-sand`} x1="0" y1="0" x2="0" y2="1">
            {lit ? (
              <>
                <stop offset="0" stopColor="#fff1d6" />
                <stop offset="1" stopColor="#e9c992" />
              </>
            ) : (
              <>
                <stop offset="0" stopColor="#f6eedd" />
                <stop offset="0.55" stopColor="#eadcbc" />
                <stop offset="1" stopColor="#d8c49c" />
              </>
            )}
          </linearGradient>
          <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0.1" />
            <stop offset="0.6" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.45" stopColor={lit ? "#0b1433" : "#dfe8f2"} stopOpacity="0" />
            <stop offset="1" stopColor={lit ? "#0b1433" : "#dfe8f2"} stopOpacity={lit ? 0.5 : 0.75} />
          </linearGradient>
          <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
            <feColorMatrix in="n" type="saturate" values="0" result="g" />
            <feComponentTransfer in="g" result="g2"><feFuncA type="linear" slope="0.18" /></feComponentTransfer>
            <feComposite in="g2" in2="SourceGraphic" operator="in" result="grain" />
            <feBlend in="SourceGraphic" in2="grain" mode="multiply" />
          </filter>
          <radialGradient id={`${id}-shadow`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#8a7350" stopOpacity={lit ? 0 : 0.28} />
            <stop offset="1" stopColor="#8a7350" stopOpacity="0" />
          </radialGradient>
          <text id={`${id}-word`} x="410" y="222" textAnchor="middle" fontSize="250" fontWeight="600" letterSpacing="18" className="font-display">MSG</text>
        </defs>
        <ellipse cx="392" cy="226" rx="380" ry="7" fill={`url(#${id}-shadow)`} />
        <g filter={`url(#${id}-grain)`}>
          {[7, 6, 5, 4, 3, 2, 1].map((k) => (
            <use key={k} href={`#${id}-word`} x={-k * 1.1} y={k * 0.25} fill={lit ? (k > 4 ? "#8f7550" : "#a88a5e") : k > 4 ? "#b9a37a" : "#c7b189"} />
          ))}
        </g>
        <g filter={`url(#${id}-grain)`}>
          <use href={`#${id}-word`} fill={`url(#${id}-sand)`} />
          <use href={`#${id}-word`} fill={`url(#${id}-light)`} />
        </g>
        <use href={`#${id}-word`} fill={`url(#${id}-haze)`} />
      </motion.svg>
    </motion.div>
  );
}
