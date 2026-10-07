"use client";

import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
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
      className="on-dark relative isolate scroll-mt-16 overflow-hidden bg-[#061c20] py-20 text-white lg:py-28"
    >
      {/* MSG's own hub, a layer behind the pitch */}
      <motion.div aria-hidden="true" className="absolute inset-0 -z-10" style={reduce ? undefined : { scale: photoScale, y: photoY }}>
        <Image
          src="/media/msg/facade.jpg"
          alt=""
          fill
          sizes="100vw"
          className={`object-cover transition-[filter,opacity] duration-[1400ms] ease-out ${msg ? "opacity-45 [filter:saturate(1.1)_brightness(0.9)]" : "opacity-25 [filter:grayscale(1)_brightness(0.55)]"}`}
        />
      </motion.div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#061c20_0%,rgba(6,28,32,0.82)_30%,rgba(6,28,32,0.9)_70%,#061c20_100%)]" />
      <div aria-hidden="true" className={`absolute inset-0 -z-10 transition-opacity duration-[1400ms] ${msg ? "opacity-100" : "opacity-0"} bg-[radial-gradient(60%_50%_at_75%_30%,rgba(76,201,122,0.18),transparent_70%)]`} />

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div>
            <span className="label">{c.eyebrow}</span>
            <h2 id="why-title" className="mt-3 font-display text-[clamp(2rem,4.4vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-balance rtl:leading-[1.3] rtl:tracking-normal">
              {c.title}
            </h2>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-white/80 text-pretty lg:justify-self-end">{c.lead}</p>
        </div>

        {/* on your own / with MSG */}
        <div role="radiogroup" aria-label={c.toggleLabel} className="relative mt-10 inline-grid grid-cols-2 rounded-full bg-white/10 p-1.5 ring-1 ring-white/15 backdrop-blur">
          <span
            aria-hidden="true"
            className={`absolute inset-y-1.5 w-[calc(50%-0.375rem)] rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${msg ? "start-1/2 bg-[#4cc97a]" : "start-1.5 bg-white/85"}`}
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
                className={`relative rounded-full px-5 py-2.5 text-sm font-bold transition-colors duration-300 sm:px-7 sm:text-base ${on ? "text-[#061c20]" : "text-white/75 hover:text-white"}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {c.rows.map((r, i) => (
            <li
              key={r.pain}
              className={`relative overflow-hidden rounded-2xl p-5 ring-1 backdrop-blur-md transition-[background-color,box-shadow] duration-700 ${msg ? "bg-[#0b3a26]/70 ring-[#4cc97a]/40 shadow-[0_20px_50px_-30px_rgba(76,201,122,0.6)]" : "bg-white/[0.05] ring-white/10"}`}
              style={{ transitionDelay: reduce ? undefined : `${i * 90}ms` }}
            >
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className={`grid size-10 shrink-0 place-items-center rounded-full transition-all duration-500 ${msg ? "scale-100 bg-[#4cc97a] text-[#061c20]" : "bg-[#e5735c]/20 text-[#ffb3a3] ring-1 ring-[#e5735c]/40"}`}
                  style={{ transitionDelay: reduce ? undefined : `${i * 90 + 150}ms` }}
                >
                  {msg ? <CheckIcon className="size-5" /> : <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M7 7l10 10M17 7 7 17" /></svg>}
                </span>
                <div className="min-w-0">
                  {/* the problem: crossed out once MSG takes it */}
                  <p className={`relative inline font-semibold transition-all duration-500 ${msg ? "text-sm text-white/55" : "text-lg text-white"}`}>
                    {r.pain}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 top-1/2 h-0.5 origin-left bg-[#4cc97a] transition-transform duration-500 rtl:origin-right ${msg ? "scale-x-100" : "scale-x-0"}`}
                      style={{ transitionDelay: reduce ? undefined : `${i * 90 + 100}ms` }}
                    />
                  </p>
                  <p
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ${msg ? "mt-1.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                    style={{ transitionDelay: reduce ? undefined : `${i * 90 + 220}ms` }}
                  >
                    <span className="overflow-hidden font-display text-lg font-semibold leading-snug text-white">{r.fix}</span>
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className={`mt-10 flex flex-col gap-6 rounded-3xl p-6 ring-1 transition-all duration-700 sm:p-8 lg:flex-row lg:items-center lg:justify-between ${msg ? "bg-white text-teal-deep ring-white" : "bg-white/[0.06] text-white ring-white/10"}`}>
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
