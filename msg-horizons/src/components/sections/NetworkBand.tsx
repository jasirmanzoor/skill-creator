"use client";

/* eslint-disable @next/next/no-img-element -- MSG's branded car cut-out and optional coast photo, local files */
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { redSea, PARTNER_TEXT, RATE_CARD } from "@/content/redsea";
import type { Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * "1,000+ couriers. 100+ vehicles." in Red Sea daylight.
 * A Corniche scene (painted sky, sparkling water and a wet silver road, or MSG's own coast photo
 * once `/public/coast.jpg` exists) with MSG's branded car driving through it as the visitor scrolls.
 * Glass panels carry the network facts, the partners and the 1 kg next-day rate card.
 */
export default function NetworkBand({ lang, coastPhoto }: { lang: Locale; coastPhoto: boolean }) {
  const c = redSea[lang].network;
  const reduce = useReducedMotion();
  const scene = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scene, offset: ["start end", "end start"] });
  const carLeft = useTransform(scrollYProgress, [0.1, 0.9], ["68%", "4%"]);

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
          <p className="font-display text-2xl font-medium text-teal lg:justify-self-end lg:text-end">{c.sub}</p>
        </div>

        {/* the Corniche */}
        <div ref={scene} dir="ltr" className="relative mt-10 aspect-[4/3] overflow-hidden rounded-[28px] shadow-[0_40px_80px_-40px_rgba(19,113,121,0.55)] sm:aspect-[16/9] lg:aspect-[21/9]">
          {coastPhoto ? (
            <img src="/coast.jpg" alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <div aria-hidden="true" className="absolute inset-0">
              <div className="corniche-sky absolute inset-x-0 top-0 h-[48%]" />
              <div className="absolute -right-[10%] -top-[30%] size-[70%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.95),rgba(255,255,255,0)_65%)]" />
              <div className="absolute inset-x-0 top-[44%] h-[5%] bg-[linear-gradient(180deg,rgba(163,208,212,0),#a9d6d9)] blur-[2px]" />
              <div className="corniche-sea absolute inset-x-0 top-[48%] h-[20%]" />
              <div className="corniche-sparkle absolute inset-x-0 top-[48%] h-[20%] mix-blend-screen" />
              <div className="absolute inset-x-0 top-[48%] h-[20%] bg-[linear-gradient(180deg,rgba(255,255,255,0.35),transparent_40%)]" />
              <div className="absolute inset-x-0 top-[68%] h-[2.5%] bg-[linear-gradient(180deg,#f7fafa,#dfe6e8)]" />
              <div className="corniche-road absolute inset-x-0 bottom-0 h-[29.5%]" />
              <div className="absolute inset-x-0 bottom-0 h-[29.5%] bg-[linear-gradient(180deg,rgba(255,255,255,0.35),transparent_30%,rgba(255,255,255,0.12)_70%,transparent)]" />
              <div className={`${reduce ? "" : "corniche-lane"} absolute inset-x-0 bottom-[7%] h-[1.2%] opacity-80`} />
            </div>
          )}

          {/* MSG's own car, with its reflection on the wet road */}
          <motion.div aria-hidden="true" style={reduce ? { left: "30%" } : { left: carLeft }} className="absolute bottom-[4%] w-[min(62%,560px)] sm:w-[min(44%,560px)]">
            <img src="/photos/msg-car.png" alt="" width={619} height={271} className="relative z-10 block h-auto w-full" />
            <div className="absolute inset-x-[6%] bottom-[2%] z-0 h-[10%] rounded-[50%] bg-[#0b3a40]/45 blur-[6px]" />
            <img src="/photos/msg-car.png" alt="" width={619} height={271} className="absolute left-0 top-[96%] block h-auto w-full -scale-y-100 opacity-25 blur-[1.5px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.9),transparent_45%)]" />
          </motion.div>

          {/* network facts on water-glass */}
          <ul className="absolute inset-x-3 top-3 grid grid-cols-3 gap-2 sm:inset-x-5 sm:top-5 sm:max-w-xl sm:gap-3" dir={lang === "ar" ? "rtl" : "ltr"}>
            {c.stats.map((s) => (
              <li key={s.l} className="sea-glass rounded-2xl px-3 py-3 sm:px-5 sm:py-4">
                <p className="num font-display text-2xl font-semibold tracking-[-0.02em] text-teal-deep sm:text-4xl" dir="ltr">{s.v}</p>
                <p className="mt-1 text-[11px] leading-tight text-teal-deep/75 sm:text-sm">{s.l}</p>
              </li>
            ))}
          </ul>
          {/* partners, on the glass above the water (desktop); below the scene on phones */}
          <div className="sea-glass absolute right-5 top-5 hidden max-w-md rounded-2xl px-6 py-4 lg:block" dir={lang === "ar" ? "rtl" : "ltr"}>
            <Partners label={c.partners} />
          </div>
        </div>

        <div className="sea-glass mt-5 rounded-3xl p-6 lg:hidden">
          <Partners label={c.partners} />
        </div>

        <div className="mt-5">
          <aside data-rate-card aria-labelledby="network-rates" className="sea-glass rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 id="network-rates" className="font-display text-xl font-semibold text-teal-deep">{c.rateTitle}</h3>
              <p className="text-sm text-teal-deep/65">{c.rateUnit}</p>
            </div>
            <table className="mt-4 w-full border-collapse">
              <thead>
                <tr className="text-sm text-teal-deep/65">
                  <th scope="col" className="pb-2 text-start font-medium"><span className="sr-only">{c.rateTitle}</span></th>
                  <th scope="col" className="pb-2 text-end font-medium">{c.intra}</th>
                  <th scope="col" className="pb-2 text-end font-medium">{c.inter}</th>
                </tr>
              </thead>
              <tbody>
                {(["walkin", "t299"] as const).map((k) => (
                  <tr key={k} className="border-t border-teal/15">
                    <th scope="row" className="py-3 text-start font-medium text-teal-deep">{k === "walkin" ? c.walkin : c.t299}</th>
                    <td className="py-3 text-end"><span className="num font-display text-3xl font-semibold text-teal-deep">{RATE_CARD.intra[k]}</span></td>
                    <td className="py-3 text-end"><span className="num font-display text-3xl font-semibold text-teal">{RATE_CARD.inter[k]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Partners({ label }: { label: string }) {
  return (
    <>
      <p className="text-sm font-semibold text-teal">{label}</p>
      <p className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] text-teal-deep sm:text-2xl" dir="ltr">
        {PARTNER_TEXT.map((p, i) => (
          <span key={p}>
            {i ? <span aria-hidden="true" className="mx-2 text-sea-400">·</span> : null}
            {p}
          </span>
        ))}
      </p>
    </>
  );
}
