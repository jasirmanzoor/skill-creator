"use client";

/* eslint-disable @next/next/no-img-element -- local, pre-optimised webp photography */
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { redSea, PARTNER_TEXT } from "@/content/redsea";
import type { Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon } from "../ui/icons";

const HOLD_MS = 5200;

/**
 * "1,000+ couriers. 100+ vehicles." in Red Sea daylight.
 * A stat rail beside one photo stage: each network fact owns a photo (a courier handing over an
 * order, the fleet, MSG's own warehouse floor) and the stage dissolves between them, advancing on
 * its own while in view or on hover/focus. A partner ribbon and the way into the roadmap follow.
 * `/public/coast.jpg`, once MSG supplies it, becomes the fleet photo.
 */
export default function NetworkBand({ lang, coastPhoto }: { lang: Locale; coastPhoto: boolean }) {
  const c = redSea[lang].network;
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { amount: 0.4 });
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], [1.14, 1]);
  const playing = !reduce && inView && !held;

  const frames = [
    { src: "/photos/clean/courier-mall.webp", pos: "62% 40%" },
    { src: coastPhoto ? "/coast.jpg" : "/photos/clean/fleet-car.webp", pos: "50% 72%" },
    { src: "/photos/msg/warehouse-floor.webp", pos: "50% 58%" },
  ];

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % frames.length), HOLD_MS);
    return () => clearTimeout(t);
  }, [playing, active, frames.length]);

  return (
    <section id="network" aria-labelledby="network-title" className="sea-band relative scroll-mt-16 sec overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-14">
          {/* rail */}
          <div className="flex flex-col">
            <span className="label">{c.eyebrow}</span>
            <h2 id="network-title" className="h-section mt-3">
              {c.title}
            </h2>
            <p className="mt-3 font-display text-xl font-medium text-teal text-balance">{c.sub}</p>

            <ul
              className="mt-8 grid grid-cols-3 gap-2 lg:mt-auto lg:grid-cols-1 lg:gap-0 lg:pt-10"
              onMouseLeave={() => setHeld(false)}
            >
              {c.stats.map((s, i) => {
                const on = i === active;
                return (
                  <li key={s.l} className="lg:border-t lg:border-teal-deep/12 last:lg:border-b">
                    <button
                      type="button"
                      aria-pressed={on}
                      onMouseEnter={() => { setActive(i); setHeld(true); }}
                      onFocus={() => { setActive(i); setHeld(true); }}
                      onBlur={() => setHeld(false)}
                      onClick={() => setActive(i)}
                      className={`group relative block w-full rounded-2xl px-3 py-4 text-start transition-colors lg:rounded-none lg:px-1 lg:py-6 ${on ? "bg-white/70 lg:bg-transparent" : "hover:bg-white/40 lg:hover:bg-transparent"}`}
                    >
                      <span className="flex flex-col gap-1 lg:flex-row lg:items-baseline lg:justify-between lg:gap-6">
                        <span
                          dir="ltr"
                          className={`num font-display text-3xl font-semibold tracking-[-0.03em] transition-colors duration-500 sm:text-4xl lg:text-7xl ${on ? "text-teal-deep" : "text-teal-deep/45"}`}
                        >
                          {s.v}
                        </span>
                        <span className={`text-sm font-medium transition-colors duration-500 sm:text-base lg:text-end ${on ? "text-teal" : "text-teal-deep/60"}`}>{s.l}</span>
                      </span>
                      {/* progress: fills while this fact holds the stage */}
                      <span aria-hidden="true" className="absolute inset-x-3 bottom-1.5 h-0.5 overflow-hidden rounded-full bg-teal-deep/10 lg:inset-x-0 lg:-bottom-px">
                        {on && (
                          <span
                            key={`${active}-${playing}`}
                            className="block h-full origin-left bg-teal rtl:origin-right"
                            style={playing ? { animation: `nb-fill ${HOLD_MS}ms linear forwards` } : undefined}
                          />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* stage */}
          <div
            ref={stage}
            className="relative order-first aspect-[4/3] overflow-hidden rounded-[2rem] bg-sea-100 shadow-[0_40px_80px_-46px_rgba(11,58,64,0.7)] lg:order-none lg:aspect-auto lg:min-h-[600px]"
          >
            <motion.div className="absolute inset-0" style={reduce ? undefined : { scale: drift }}>
              {frames.map((f, i) => (
                <img
                  key={f.src}
                  src={f.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: f.pos }}
                  className={`absolute inset-0 size-full object-cover transition-[opacity,transform,filter] duration-[1100ms] ease-[cubic-bezier(.2,.7,.2,1)] ${
                    i === active ? "scale-100 opacity-100 blur-0" : "scale-[1.06] opacity-0 blur-[6px]"
                  }`}
                />
              ))}
            </motion.div>
            {/* sea wash: ties the photo into the band */}
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,rgba(226,244,243,0.35),transparent_55%)]" />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-teal-deep/55 to-transparent" />

            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 sm:inset-x-6 sm:bottom-6">
              <div aria-live="polite" className="sea-glass rounded-2xl px-5 py-3 sm:px-6 sm:py-4">
                <span key={active} className="feed-in block">
                  <span dir="ltr" className="num block font-display text-3xl font-semibold tracking-[-0.02em] text-teal-deep sm:text-5xl">{c.stats[active].v}</span>
                  <span className="mt-0.5 block text-sm font-medium text-teal-deep/80">{c.stats[active].l}</span>
                </span>
              </div>
              <span aria-hidden="true" dir="ltr" className="num hidden rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-teal-deep sm:block">
                0{active + 1} / 0{frames.length}
              </span>
            </div>
          </div>
        </div>

        {/* partner ribbon */}
        <div className="sea-glass mt-6 flex flex-col gap-3 overflow-hidden rounded-3xl py-5 sm:flex-row sm:items-center sm:gap-0 sm:py-0">
          <p className="shrink-0 px-6 text-sm font-semibold text-teal sm:border-e sm:border-teal-deep/10 sm:py-6">{c.partners}</p>
          <div dir="ltr" className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
            <ul className="sr-only">
              {PARTNER_TEXT.map((p) => <li key={p}>{p}</li>)}
            </ul>
            <div aria-hidden="true" className="nb-ribbon flex w-max" style={{ animation: "nb-ribbon 32s linear infinite" }}>
              {[0, 1].map((k) => (
                <div key={k} className="flex shrink-0 items-center">
                  {[...PARTNER_TEXT, ...PARTNER_TEXT].map((p, i) => (
                    <span key={`${k}-${i}`} className="flex items-center font-display text-2xl font-semibold tracking-[-0.01em] text-teal-deep sm:text-3xl">
                      <span className="px-7">{p}</span>
                      <span className="size-1.5 rounded-full bg-teal/40" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* the way in: the roadmap turns a visitor's numbers into a plan and an approximate cost per order */}
        <div className="mt-4 flex flex-col gap-5 rounded-3xl bg-teal-deep p-6 text-white sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-display text-2xl font-semibold text-balance">{c.ctaTitle}</p>
            <p className="mt-2 max-w-2xl text-white/75">{c.ctaBody}</p>
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
    </section>
  );
}
