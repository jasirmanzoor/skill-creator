"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * The constant backdrop: a real desert horizon, fixed behind the whole page.
 * "MSG" stands on the horizon as a distant, sand-toned landmark and resolves like a mirage on load. As the visitor scrolls,
 * the photo pulls out of focus and washes toward paper, so content always stays legible.
 *
 * Alignment trick: the horizon sits at 50.8% of the photo's height; object-position
 * 50% 50.8% pins that exact point to 50.8% of the viewport on every screen size,
 * so the letters can stand precisely on the horizon.
 */
const HORIZON = 50.8; // % of image height

export default function HorizonBackdrop() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  // 0 → first screen crisp; ~1 viewport of scroll → soft haze
  const blurOpacity = useTransform(scrollY, [0, 700], [0, 1]);
  const wash = useTransform(scrollY, [0, 900], [0, 0.45]);
  const lettersOpacity = useTransform(scrollY, [0, 900], [1, 0.55]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#dfe7f3]">
      {/* sharp photo */}
      <picture>
        <source media="(min-width: 1024px)" srcSet="/media/brand/horizon-2400.jpg" />
        { }
        <img
          src="/media/brand/horizon-1280.jpg"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: `50% ${HORIZON}%` }}
        />
      </picture>

      {/* defocused copy crossfades in on scroll (pre-blurred tiny image → cheap on phones) */}
      <motion.img
        src="/media/brand/horizon-blur.jpg"
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
        style={{ objectPosition: `50% ${HORIZON}%`, opacity: blurOpacity }}
      />
      {/* MSG as a distant land-art monument standing on the horizon.
          Composited to belong to the photo: sand-toned fill, horizon haze at the base,
          slight distance blur, film grain and a contact shadow on the sand. */}
      <motion.div
        className="absolute inset-x-0 flex justify-center"
        style={{ top: `${HORIZON}%`, opacity: lettersOpacity }}
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
            {/* sunlit sand, lighter at the top, taking on dune tones toward the ground */}
            <linearGradient id="msg-sand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f6eedd" />
              <stop offset="0.55" stopColor="#eadcbc" />
              <stop offset="1" stopColor="#d8c49c" />
            </linearGradient>
            {/* soft side light from the right, matching the brighter right-hand sky */}
            <linearGradient id="msg-light" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#000" stopOpacity="0.1" />
              <stop offset="0.6" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.12" />
            </linearGradient>
            {/* horizon haze: strongest at the base, like everything else on this horizon */}
            <linearGradient id="msg-haze" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0.45" stopColor="#dfe8f2" stopOpacity="0" />
              <stop offset="1" stopColor="#dfe8f2" stopOpacity="0.75" />
            </linearGradient>
            <filter id="msg-grain" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
              <feColorMatrix in="n" type="saturate" values="0" result="g" />
              <feComponentTransfer in="g" result="g2"><feFuncA type="linear" slope="0.18" /></feComponentTransfer>
              <feComposite in="g2" in2="SourceGraphic" operator="in" result="grain" />
              <feBlend in="SourceGraphic" in2="grain" mode="multiply" />
            </filter>
            <radialGradient id="msg-shadow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#8a7350" stopOpacity="0.28" />
              <stop offset="1" stopColor="#8a7350" stopOpacity="0" />
            </radialGradient>
            <text id="msg-word" x="410" y="222" textAnchor="middle" fontSize="250" fontWeight="600" letterSpacing="18"
              className="font-display">MSG</text>
          </defs>
          {/* contact shadow on the sand, thrown slightly left (light comes from the right) */}
          <ellipse cx="392" cy="226" rx="380" ry="7" fill="url(#msg-shadow)" />
          {/* shallow extruded side faces: gives the letters physical depth, shaded away from the light */}
          <g filter="url(#msg-grain)">
            {[7, 6, 5, 4, 3, 2, 1].map((k) => (
              <use key={k} href="#msg-word" x={-k * 1.1} y={k * 0.25} fill={k > 4 ? "#b9a37a" : "#c7b189"} />
            ))}
          </g>
          <g filter="url(#msg-grain)">
            <use href="#msg-word" fill="url(#msg-sand)" />
            <use href="#msg-word" fill="url(#msg-light)" />
          </g>
          <use href="#msg-word" fill="url(#msg-haze)" />
        </motion.svg>
      </motion.div>

      {/* paper wash for legibility further down the page */}
      <motion.div className="absolute inset-0 bg-paper" style={{ opacity: wash }} />
    </div>
  );
}
