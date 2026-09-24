"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * The constant backdrop: a real desert horizon, fixed behind the whole page.
 * "MSG" rises on the horizon line like the sun (once, on load). As the visitor scrolls,
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
  const lettersOpacity = useTransform(scrollY, [0, 900], [0.95, 0.6]);

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
      {/* MSG, rising from the horizon: clipped exactly at the horizon line */}
      <motion.div className="absolute inset-x-0 top-0 flex items-end justify-center overflow-hidden" style={{ height: `${HORIZON}%`, opacity: lettersOpacity }}>
        <motion.span
          className="block select-none font-display font-bold leading-[0.74] tracking-[-0.045em] text-white"
          style={{ fontSize: "min(44vw, 44vh)", textShadow: "0 0 60px rgba(255,255,255,0.35)" }}
          initial={reduce ? false : { y: "55%" }}
          animate={{ y: "9%" }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          dir="ltr"
        >
          MSG
        </motion.span>
      </motion.div>

      {/* paper wash for legibility further down the page */}
      <motion.div className="absolute inset-0 bg-paper" style={{ opacity: wash }} />
    </div>
  );
}
