"use client";

/* eslint-disable @next/next/no-img-element -- MSG's branded car cut-out, served as a local PNG */
import { motion, useTransform, type MotionValue } from "motion/react";

/**
 * "1,000+ couriers. 100+ vehicles. One network, around the clock."
 * An MSG-branded car (from the company profile) drives across the sand as the visitor scrolls,
 * coming slightly toward the camera, with a soft contact shadow. Reduced motion: parked in frame.
 */
export default function ScaleScene({ progress, reduce }: { progress: MotionValue<number>; reduce: boolean }) {
  const x = useTransform(progress, [0.12, 0.86], ["100vw", "-50vw"]);
  const scale = useTransform(progress, [0.12, 0.86], [0.78, 1.08]);
  const opacity = useTransform(progress, [0.1, 0.18, 0.8, 0.9], [0, 1, 1, 0]);

  return (
    <div aria-hidden="true" dir="ltr" className="pointer-events-none absolute inset-x-0 bottom-[9%] h-[34%]">
      <motion.div
        style={reduce ? { left: "58%" } : { x, scale, opacity }}
        className="absolute bottom-0 w-[min(46vw,560px)] origin-bottom"
      >
        <div className="absolute bottom-[1%] left-[3%] right-[4%] h-[12%] rounded-[50%] bg-black/55 blur-[7px]" />
        <div className="absolute bottom-[3%] left-[10%] right-[12%] h-[6%] rounded-[50%] bg-black/60 blur-[3px]" />
        <img src="/photos/msg-car.png" alt="" width={619} height={271} className="relative block h-auto w-full" />
      </motion.div>
    </div>
  );
}
