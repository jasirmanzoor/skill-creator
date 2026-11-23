"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { facts } from "@/content/facts";
import type { Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const plate: Record<Locale, { alt: string; where: string; what: string; fig: string }> = {
  en: {
    alt: "MSG Horizons vans in MSG livery parked in front of the Sabya hub, its Arabic sign above the open door",
    where: "Sabya hub · Jazan",
    what: "MSG-owned Toyota Hiace vans · in-house drivers",
    fig: "MSG's own photograph",
  },
  ar: {
    alt: "مركبات ام اس جي هورايزونز أمام مركز صبيا، ولوحة الشركة فوق الباب المفتوح",
    where: "مركز صبيا · جازان",
    what: "مركبات تويوتا هايس مملوكة لام اس جي · سائقون من فريقنا",
    fig: "صورة من ام اس جي",
  },
};

/**
 * MSG's own fleet at the Sabya hub, as the hero's third beat. It arrives as a rounded plate inside the page margins
 * and, as the visitor scrolls past it, opens out to the full width of the screen while the photograph settles from a
 * slight zoom (the "--p" variable, 0 → 1, read by .v3-plate in globals.css). Nothing is pinned: the plate opens while
 * it travels up the screen and the page keeps scrolling at its own pace. With reduced motion it stays as the plate.
 */
export default function HeroPlate({ lang }: { lang: Locale }) {
  const p = plate[lang];
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.92", "start 0.12"] });
  const eased = useSpring(scrollYProgress, { stiffness: 220, damping: 38, mass: 0.4 });
  const prog = useTransform(eased, (v) => (reduce ? 0 : Math.min(1, Math.max(0, v))));
  const zoom = useTransform(prog, [0, 1], [1.14, 1]);

  return (
    <figure ref={ref} className="mt-16 lg:mt-24">
      <motion.div style={{ ["--p" as string]: prog }} className="v3-plate plate relative h-[min(78vw,30rem)] overflow-hidden sm:h-[min(56vw,36rem)] lg:h-[min(44vw,44rem)]">
        <div className="v3-plate-in absolute inset-0">
          <motion.div style={{ scale: zoom }} className="absolute inset-0">
            <Image src="/media/msg/fleet-hub.webp" alt={p.alt} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: "50% 64%" }} />
          </motion.div>
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/55 to-transparent" />
        </div>
        <div className="v3-plate-ui absolute inset-y-0">
          <span className="lbl absolute start-5 top-5 bg-graphite px-2 py-1 text-white sm:start-7 sm:top-7">{p.where}</span>
          <span className="lbl absolute bottom-5 start-5 max-w-[70%] text-white sm:bottom-7 sm:start-7">{p.what}</span>
          <span className="lbl absolute bottom-5 end-5 hidden text-white/80 sm:bottom-7 sm:end-7 sm:block">
            {p.fig} · <span className="num normal-case" dir="ltr">{facts.sabyaHub.areaM2.toLocaleString("en-US")} m²</span>
          </span>
        </div>
      </motion.div>
    </figure>
  );
}
