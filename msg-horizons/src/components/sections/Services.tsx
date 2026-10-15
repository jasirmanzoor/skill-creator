"use client";

import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef, useState } from "react";
import { facts, type ServiceId } from "@/content/facts";
import { SLUG_FOR } from "@/content/servicePages";
import { serviceHud } from "@/content/serviceHud";
import type { Dictionary, Locale } from "@/content/i18n";
import { EASE_OUT, SPRING_SMOOTH } from "@/lib/motion";
import { scrollToY } from "@/lib/scroller";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { ServiceIcon } from "../ui/icons";
import { PHOTO, ServiceHud } from "../services/ServiceView";
import ServicesList from "../services/ServicesList";

const IDS = facts.services;
const N = IDS.length;
/** the wipe every service enters with */
const WIPE = [0.77, 0, 0.175, 1] as const;

/**
 * The seven services as a theatre: the section holds the screen while each service takes it over in turn.
 * MSG's photo wipes up over the last one under a slow push, the service's name and key fact rise out of a mask,
 * and a live panel shows the service at work. A rail along the bottom tracks the scroll through all seven and
 * jumps to any of them. Under reduced motion the services are a plain list with one view beside it.
 */
export default function Services({ t, lang }: { t: Dictionary; lang: Locale }) {
  const reduce = useReducedMotion();
  if (reduce) return <ServicesList t={t} lang={lang} />;
  return <Theatre t={t} lang={lang} />;
}

function Theatre({ t, lang }: { t: Dictionary; lang: Locale }) {
  const s = t.services;
  const h = serviceHud[lang];
  const rtl = lang === "ar";
  const sec = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const { scrollYProgress } = useScroll({ target: sec, offset: ["start start", "end end"] });
  const prog = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    prog.set(v);
    const i = Math.min(N - 1, Math.floor(v * N));
    setIdx((x) => (x === i ? x : i));
  });
  const go = (i: number) => {
    const el = sec.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + (el.offsetHeight - window.innerHeight) * ((i + 0.35) / N));
  };

  // the whole picture drifts with the scroll, and leans a little toward the pointer
  const drift = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, SPRING_SMOOTH), sy = useSpring(my, SPRING_SMOOTH);
  const px = useTransform(sx, [-0.5, 0.5], [14, -14]);
  const py = useTransform(sy, [-0.5, 0.5], [10, -10]);
  const hx = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !frame.current) return;
    const r = frame.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
    frame.current.style.setProperty("--lx", `${e.clientX - r.left}px`);
    frame.current.style.setProperty("--ly", `${e.clientY - r.top}px`);
  };

  const id: ServiceId = IDS[idx];
  const svc = t.planner.services[id];
  const fact = s.facts[id];
  const slug = SLUG_FOR[id];
  const n = (k: number) => String(k).padStart(2, "0");

  return (
    <section id="services" ref={sec} aria-labelledby="services-title" className="relative scroll-mt-16 bg-deep" style={{ height: `calc(100svh + ${N * 62}svh)` }}>
      <div
        ref={frame}
        data-theme="dark"
        onPointerMove={onMove}
        onPointerLeave={() => { mx.set(0); my.set(0); }}
        className="group/frame sticky top-0 h-[100svh] overflow-hidden text-white"
      >
        {/* the photographs: each service wipes up over the last */}
        <motion.div aria-hidden="true" className="absolute -inset-[4%]" style={{ y: drift, x: px, translateY: py }}>
          <AnimatePresence initial={false}>
            <motion.div
              key={id}
              className="absolute inset-0"
              initial={{ clipPath: "inset(100% 0 0 0)" }}
              animate={{ clipPath: "inset(0% 0 0 0)", transition: { duration: 0.9, ease: WIPE } }}
              exit={{ opacity: 0, transition: { delay: 0.9, duration: 0.01 } }}
            >
              <motion.img
                src={PHOTO[id].src}
                alt=""
                decoding="async"
                className="absolute inset-0 size-full object-cover"
                style={{ objectPosition: PHOTO[id].pos }}
                initial={{ scale: 1.22 }}
                animate={{ scale: 1.04, transition: { duration: 7, ease: EASE_OUT } }}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        {/* night over the photo, heaviest behind the words; a light follows the pointer */}
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,18,21,0.94)_0%,rgba(3,18,21,0.78)_38%,rgba(3,18,21,0.15)_70%,rgba(3,18,21,0.35)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(3,18,21,0.55)_0%,rgba(3,18,21,0.2)_30%,rgba(3,18,21,0.92)_62%,rgba(3,18,21,0.97)_100%)] rtl:lg:bg-[linear-gradient(270deg,rgba(3,18,21,0.94)_0%,rgba(3,18,21,0.78)_38%,rgba(3,18,21,0.15)_70%,rgba(3,18,21,0.35)_100%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,rgba(3,18,21,0.95),transparent)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 [background:radial-gradient(420px_circle_at_var(--lx,70%)_var(--ly,40%),rgba(255,255,255,0.5),transparent_65%)] group-hover/frame:opacity-100" />

        <div className="relative mx-auto grid h-full max-w-7xl grid-rows-[auto_1fr_auto] px-5 pb-24 pt-20 lg:px-8 lg:pb-8 lg:pt-24">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-bright rtl:tracking-normal">{s.eyebrow}</p>
              <h2 id="services-title" className="mt-2 max-w-xl font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-balance sm:text-3xl rtl:tracking-normal">{s.title}</h2>
            </div>
            <p className="hidden max-w-sm text-sm text-white/75 text-pretty lg:block">{s.lead}</p>
          </div>

          <div className="grid content-end items-end gap-6 pb-6 lg:grid-cols-[1.15fr_0.85fr] lg:content-center lg:pb-0">
            <div className="min-w-0">
              {/* the service's number, outlined, behind its name */}
              <div className="relative">
                <span aria-hidden="true" className="num pointer-events-none absolute -top-[0.62em] start-[-0.05em] select-none font-display text-[clamp(6rem,14vw,12rem)] font-semibold leading-none text-transparent [-webkit-text-stroke:1px_rgba(184,245,207,0.28)]" dir="ltr">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={id} className="inline-block" initial={{ y: "40%", opacity: 0 }} animate={{ y: "0%", opacity: 1, transition: { duration: 0.7, ease: EASE_OUT } }} exit={{ y: "-40%", opacity: 0, transition: { duration: 0.25 } }}>{n(idx + 1)}</motion.span>
                  </AnimatePresence>
                </span>
                <Rise k={id} delay={0.1}>
                  <h3 className="relative flex items-center gap-3 pt-8 font-display text-[clamp(2rem,4.6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em] rtl:leading-[1.3] rtl:tracking-normal">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-bright/15 text-brand-bright ring-1 ring-brand-bright/30 sm:size-14 [&_svg]:size-6 sm:[&_svg]:size-7"><ServiceIcon id={id} /></span>
                    {svc.name}
                  </h3>
                </Rise>
              </div>
              <Rise k={id} delay={0.18}>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 text-pretty sm:text-lg">{svc.desc}</p>
              </Rise>
              <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4">
                <div>
                  <Rise k={id} delay={0.26}>
                    <p className="num font-display text-[clamp(2.8rem,6vw,5.2rem)] font-semibold leading-none tracking-[-0.04em] text-brand-mint rtl:tracking-normal">{fact.v}</p>
                  </Rise>
                  <Rise k={id} delay={0.32}><p className="mt-2 max-w-xs text-sm text-white/75">{fact.l}</p></Rise>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {slug ? (
                    <a href={`/${lang}/services/${slug}`} className="group/l inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-teal-deep transition-transform duration-200 hover:-translate-y-0.5">
                      {h.details}
                      <svg viewBox="0 0 24 24" className="size-4 transition-transform duration-200 group-hover/l:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/l:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </a>
                  ) : null}
                  <a href="#planner" className="inline-flex items-center rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/20">{s.explore}</a>
                </div>
              </div>
            </div>

            {/* the service at work */}
            <motion.div style={{ x: hx }} className="hidden justify-self-end lg:block">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 24, scale: 0.94, rotate: rtl ? 1.5 : -1.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: 0, transition: { delay: 0.35, duration: 0.55, ease: EASE_OUT } }}
                  exit={{ opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.18 } }}
                  className="w-[21rem] origin-bottom rounded-3xl bg-white/95 p-4 text-teal-deep shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/50 [&_p]:text-[13px] [&_svg]:h-16"
                >
                  <ServiceHud id={id} lang={lang} />
                  <p className="mt-3 border-t border-teal/10 pt-2 text-[10px]! text-teal-deep/70">{h.note}</p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* all seven: where the scroll is, and a way to any of them */}
          <nav aria-label={s.title}>
            <ol className="grid grid-cols-7 gap-1.5 sm:gap-3">
              {IDS.map((sid, i) => (
                <li key={sid}>
                  <button type="button" onClick={() => go(i)} aria-current={i === idx ? "true" : undefined} aria-label={t.planner.services[sid].name}
                    className="group/r block w-full text-start">
                    <span className="block h-[3px] overflow-hidden rounded-full bg-white/15">
                      <Fill p={prog} i={i} />
                    </span>
                    <span className={`mt-2.5 flex items-center gap-2 text-xs font-semibold transition-colors duration-300 ${i === idx ? "text-white" : "text-white/70 group-hover/r:text-white"}`}>
                      <span className={`grid size-7 shrink-0 place-items-center rounded-lg transition-[background-color,color,transform] duration-300 group-hover/r:-translate-y-0.5 [&_svg]:size-3.5 ${i === idx ? "bg-brand-bright text-teal-deep" : "bg-white/10"}`}><ServiceIcon id={sid} /></span>
                      <span className="line-clamp-2 leading-tight max-xl:hidden">{t.planner.services[sid].name}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
}

/** content that rises out of a mask whenever the service changes */
function Rise({ k, delay, children }: { k: string; delay: number; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden pb-[0.08em]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={k}
          initial={{ y: "110%" }}
          animate={{ y: "0%", transition: { delay, duration: 0.6, ease: EASE_OUT } }}
          exit={{ y: "-110%", transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** one service's share of the scroll: empty before it, filling during it, full after */
function Fill({ p, i }: { p: MotionValue<number>; i: number }) {
  const transform = useTransform(p, (v) => `scaleX(${Math.min(1, Math.max(0, v * N - i)).toFixed(4)})`);
  return <motion.span className="block h-full origin-left rounded-full bg-brand-bright shadow-[0_0_10px_rgba(76,201,122,0.9)] rtl:origin-right" style={{ transform }} />;
}
