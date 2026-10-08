"use client";

import Image from "next/image";
import { MotionConfig, motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Dictionary, Locale } from "@/content/i18n";
import { pitchCopy } from "@/content/pitch";
import { whatsappLink } from "@/content/facts";
import { track } from "@/lib/analytics";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon, CheckIcon, WhatsAppIcon } from "../ui/icons";

/**
 * The pitch, straight after the hero: the six things that stop a new business from selling across the Kingdom,
 * and the same six already handled by MSG. It flips to "With MSG" on its own once it is in view (the visitor can flip
 * it back). Behind it, MSG's own Sabya hub sits grey and dim "on your own" and comes to life "with MSG".
 */
export default function Pitch({ t, lang }: { t: Dictionary; lang: Locale }) {
  const c = pitchCopy[lang];
  const reduce = useReducedMotion();
  const [msg, setMsg] = useState(false);
  const touched = useRef(false);
  const sec = useRef<HTMLElement>(null);

  // flip to the answer once the problem has been read
  useEffect(() => {
    const el = sec.current;
    if (!el) return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearTimeout(timer);
      if (e.isIntersecting && !touched.current) timer = window.setTimeout(() => { if (!touched.current) setMsg(true); }, reduce ? 0 : 1600);
    }, { threshold: 0.45 });
    io.observe(el);
    return () => { window.clearTimeout(timer); io.disconnect(); };
  }, [reduce]);

  const choose = (v: boolean) => {
    touched.current = true;
    setMsg(v);
    track("cta_click", { cta: v ? "pitch_with_msg" : "pitch_on_own", location: "pitch" });
  };

  // the hub photo drifts slowly behind the copy
  const { scrollYProgress } = useScroll({ target: sec, offset: ["start end", "end start"] });
  const sp = useSpring(scrollYProgress, { stiffness: 70, damping: 22 });
  const photoScale = useTransform(sp, [0, 1], [1.18, 1.02]);
  const photoY = useTransform(sp, [0, 1], ["-4%", "4%"]);

  return (
    <section
      id="why"
      ref={sec}
      data-theme="dark"
      aria-labelledby="why-title"
      className="on-dark relative isolate scroll-mt-16 overflow-hidden bg-pitch sec text-white"
    >
      {/* MSG's own hub, a layer behind the pitch */}
      <motion.div aria-hidden="true" className="absolute inset-0 -z-10" style={reduce ? undefined : { scale: photoScale, y: photoY }}>
        {/* the hub in colour, and a grey copy over it that fades away once MSG takes over */}
        <Image src="/media/msg/facade.jpg" alt="" fill sizes="100vw" className="object-cover opacity-45 [filter:saturate(1.1)_brightness(0.9)]" />
        <Image
          src="/media/msg/facade.jpg"
          alt=""
          fill
          sizes="100vw"
          className={`object-cover transition-opacity duration-[1200ms] ease-out [filter:grayscale(1)_brightness(0.4)] ${msg ? "opacity-0" : "opacity-100"}`}
        />
      </motion.div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#061c20_0%,rgba(6,28,32,0.82)_30%,rgba(6,28,32,0.9)_70%,#061c20_100%)]" />
      <div aria-hidden="true" className={`absolute inset-0 -z-10 transition-opacity duration-[1200ms] ease-out ${msg ? "opacity-100" : "opacity-0"} bg-[radial-gradient(60%_50%_at_75%_30%,rgba(76,201,122,0.18),transparent_70%)]`} />

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div>
            <span className="label">{c.eyebrow}</span>
            <h2 id="why-title" className="h-scene mt-3">
              {c.title}
            </h2>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-white/80 text-pretty lg:justify-self-end">{c.lead}</p>
        </div>

        {/* on your own / with MSG */}
        <div role="radiogroup" aria-label={c.toggleLabel} className="relative mt-10 inline-grid grid-cols-2 rounded-full bg-white/10 p-1.5 ring-1 ring-white/15 backdrop-blur">
          <span
            aria-hidden="true"
            className={`absolute inset-y-1.5 start-1.5 w-[calc(50%-0.375rem)] rounded-full transition-ui duration-[240ms] ease-in-out ${msg ? "translate-x-full bg-brand-bright rtl:-translate-x-full" : "bg-white/85"}`}
          />
          {c.toggle.map((label, i) => {
            const on = (i === 1) === msg;
            return (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => choose(i === 1)}
                className={`relative min-h-11 rounded-full px-5 py-2.5 text-sm font-bold transition-colors sm:px-7 sm:text-base ${on ? "text-pitch" : "text-white/75 hover:text-white"}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <MotionConfig reducedMotion="user">
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {c.rows.map((r, i) => {
            const d = reduce ? 0 : i * 60; // the six answers land one after another
            return (
            <li
              key={r.pain}
              className={`relative overflow-hidden rounded-2xl p-5 ring-1 backdrop-blur-md transition-[background-color,box-shadow] duration-500 ${msg ? "bg-[#0b3a26]/70 ring-brand-bright/40 shadow-[0_20px_50px_-30px_rgba(76,201,122,0.6)]" : "bg-white/[0.05] ring-white/10"}`}
              style={{ transitionDelay: `${d}ms` }}
            >
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className={`grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-300 ${msg ? "bg-brand-bright text-pitch" : "bg-[#e5735c]/20 text-[#ffb3a3] ring-1 ring-[#e5735c]/40"}`}
                  style={{ transitionDelay: `${d}ms` }}
                >
                  {msg ? <CheckIcon className="size-5" /> : <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M7 7l10 10M17 7 7 17" /></svg>}
                </span>
                <div className="grid min-w-0 flex-1">
                  {/* holds the height of both lines, so no card changes size when the answer appears */}
                  <div aria-hidden="true" className="invisible col-start-1 row-start-1">
                    <p className="font-semibold">{r.pain}</p>
                    <p className="mt-1.5 font-display text-lg font-semibold leading-snug">{r.fix}</p>
                  </div>
                  <div className={`relative col-start-1 row-start-1 flex flex-col ${msg ? "justify-start" : "justify-center"}`}>
                    {/* the problem: steps up and is crossed out once MSG takes it */}
                    <motion.p
                      layout="position"
                      transition={{ type: "spring", duration: 0.45, bounce: 0, delay: d / 1000 }}
                      className={`self-start font-semibold line-through decoration-2 transition-colors duration-300 ${msg ? "text-white/60 decoration-brand-bright" : "text-white decoration-transparent"}`}
                      style={{ transitionDelay: `${d}ms` }}
                    >
                      {r.pain}
                    </motion.p>
                    <p
                      aria-hidden={!msg}
                      className={`font-display text-lg font-semibold leading-snug text-white transition-opacity duration-300 ${msg ? "mt-1.5 opacity-100" : "absolute inset-x-0 bottom-0 opacity-0"}`}
                      style={{ transitionDelay: msg ? `${d + 120}ms` : "0ms" }}
                    >
                      {r.fix}
                    </p>
                  </div>
                </div>
              </div>
            </li>
            );
          })}
        </ul>
        </MotionConfig>

        <div className={`mt-10 flex flex-col gap-6 rounded-3xl p-6 ring-1 transition-colors duration-500 sm:p-8 lg:flex-row lg:items-center lg:justify-between ${msg ? "bg-white text-teal-deep ring-white" : "bg-white/[0.06] text-white ring-white/10"}`}>
          <div>
            <p className="font-display text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-3xl rtl:tracking-normal">{c.close}</p>
            <p className={`mt-2 ${msg ? "text-teal-deep/75" : "text-white/70"}`}>{c.closeLead}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <TrackedLink href="#planner" event="cta_click" props={{ cta: "plan", location: "pitch" }} className={`btn-primary group shrink-0 px-6 py-3.5 ${msg ? "" : "on-dark"}`}>
              {c.cta} <ArrowIcon className="size-4 rtl:rotate-180" />
            </TrackedLink>
            <TrackedLink href={whatsappLink(t.wa.general)} target="_blank" rel="noopener noreferrer" event="whatsapp_click" props={{ location: "pitch" }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-3.5 font-semibold ring-1 transition-colors ${msg ? "text-teal-deep ring-teal/25 hover:bg-sea-50" : "text-white ring-white/30 hover:bg-white/10"}`}>
              <WhatsAppIcon className="size-5 text-whatsapp" /> {c.talk}
            </TrackedLink>
          </div>
        </div>
      </div>
    </section>
  );
}
