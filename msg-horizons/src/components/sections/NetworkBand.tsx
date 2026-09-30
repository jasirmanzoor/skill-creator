"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { redSea, PARTNER_TEXT } from "@/content/redsea";
import type { Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon } from "../ui/icons";

/**
 * "1,000+ couriers. 100+ vehicles." in Red Sea daylight.
 * A photo grid of MSG's own operations (doorstep handover, fleet, courier on the street), each carrying one network
 * fact on water-glass, with a slow scroll-linked zoom. Then the partners and the way into the
 * roadmap, where the visitor gets an approximate cost per order. `/public/coast.jpg`, once MSG
 * supplies it, becomes the lead photo.
 */
export default function NetworkBand({ lang, coastPhoto }: { lang: Locale; coastPhoto: boolean }) {
  const c = redSea[lang].network;
  const reduce = useReducedMotion();
  const grid = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: grid, offset: ["start end", "end start"] });
  const zoom = useTransform(scrollYProgress, [0, 1], [1.12, 1]);
  const [couriers, vehicles, ops] = c.stats;

  return (
    <section id="network" aria-labelledby="network-title" className="sea-band relative scroll-mt-16 overflow-hidden py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <span className="label">{c.eyebrow}</span>
            <h2 id="network-title" className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-6xl rtl:tracking-normal">
              {c.title}
            </h2>
          </div>
          <p className="font-display text-2xl font-medium text-teal text-balance lg:justify-self-end lg:text-end">{c.sub}</p>
        </div>

        <div ref={grid} className="mt-10 grid gap-3 sm:gap-4 lg:h-[600px] lg:grid-cols-12 lg:grid-rows-2">
          <Tile
            src={coastPhoto ? "/coast.jpg" : "/photos/clean/doorstep.webp"}
            pos="50% 35%"
            stat={couriers}
            zoom={reduce ? undefined : zoom}
            className="aspect-[4/3] lg:col-span-7 lg:row-span-2 lg:aspect-auto"
            big
          />
          <Tile src="/photos/clean/fleet-car.webp" pos="50% 70%" stat={vehicles} zoom={reduce ? undefined : zoom} className="aspect-[16/10] lg:col-span-5 lg:aspect-auto" />
          <Tile src="/photos/clean/courier-mall.webp" pos="60% 55%" stat={ops} zoom={reduce ? undefined : zoom} className="aspect-[16/10] lg:col-span-5 lg:aspect-auto" />
        </div>

        <div className="mt-4 grid gap-3 sm:gap-4 lg:grid-cols-12">
          <div className="sea-glass rounded-3xl p-6 sm:p-8 lg:col-span-5">
            <p className="text-sm font-semibold text-teal">{c.partners}</p>
            <ul className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 font-display text-2xl font-semibold tracking-[-0.01em] text-teal-deep">
              {PARTNER_TEXT.map((p) => (
                <li key={p} dir="ltr">{p}</li>
              ))}
            </ul>
          </div>

          {/* the way in: the roadmap turns a visitor's numbers into a plan and an approximate cost per order */}
          <div className="flex flex-col gap-5 rounded-3xl bg-teal-deep p-6 text-white sm:p-8 lg:col-span-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-display text-2xl font-semibold text-balance">{c.ctaTitle}</p>
              <p className="mt-2 max-w-xl text-white/75">{c.ctaBody}</p>
            </div>
            <TrackedLink
              href="#journey"
              event="cta_click"
              props={{ cta: "journey", location: "network" }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 font-medium text-teal-deep transition-colors hover:bg-sea-100"
            >
              {c.cta} <ArrowIcon className="size-4 rtl:rotate-180" />
            </TrackedLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function Tile({
  src, pos, stat, zoom, className = "", big = false,
}: { src: string; pos: string; stat: { v: string; l: string }; zoom?: MotionValue<number>; className?: string; big?: boolean }) {
  return (
    <figure className={`relative overflow-hidden rounded-3xl bg-sea-100 shadow-[0_30px_60px_-38px_rgba(11,58,64,0.6)] ${className}`}>
      <motion.img src={src} alt="" loading="lazy" style={{ objectPosition: pos, scale: zoom }} className="absolute inset-0 size-full object-cover" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0b3a40]/45 to-transparent" />
      <figcaption className={`sea-glass absolute bottom-3 start-3 rounded-2xl sm:bottom-5 sm:start-5 ${big ? "px-6 py-4" : "px-5 py-3"}`}>
        <span className={`num block font-display font-semibold tracking-[-0.02em] text-teal-deep ${big ? "text-5xl sm:text-6xl" : "text-3xl sm:text-4xl"}`} dir="ltr">{stat.v}</span>
        <span className="mt-1 block text-sm font-medium text-teal-deep/80">{stat.l}</span>
      </figcaption>
    </figure>
  );
}
