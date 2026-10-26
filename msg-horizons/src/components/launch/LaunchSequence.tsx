"use client";

import RaysLayer from "../fx/RaysLayer";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { experience, STAGE_IDS, type StageId } from "@/content/experience";
import { whatsappLink } from "@/content/facts";
import { fmt, type Dictionary, type Locale } from "@/content/i18n";
import { EASE_OUT } from "@/lib/motion";
import { track } from "@/lib/analytics";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon, WhatsAppIcon } from "../ui/icons";

/** how long each step holds while the sequence plays (the step's progress bar runs for exactly this long) */
const HOLD_MS = 4200;

/**
 * The launch sequence: what happens after a seller says hello. MSG's seven onboarding steps, from the first
 * WhatsApp message to go-live, play out on a console: the chat, the requirements, the standard guide, the plan,
 * the signed agreement, the pilot shipments and the first live delivery. It plays on its own while in view;
 * picking a step, hovering or focusing the console pauses it. Under reduced motion nothing plays by itself
 * and steps change without movement.
 */
export default function LaunchSequence({ t, lang }: { t: Dictionary; lang: Locale }) {
  const c = experience[lang].journey;
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false); // the visitor took over
  const [held, setHeld] = useState(false); // hovering or focused: wait for them
  const playing = !reduce && inView && !paused && !held;
  const id: StageId = STAGE_IDS[step];
  const total = STAGE_IDS.length;
  // the lit part of the line runs from the first step's dot to the current one
  const list = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(0);
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const measure = () => {
      const tab = el.querySelector<HTMLElement>(`#launch-tab-${step}`);
      setLit(tab ? tab.offsetTop : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [step]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pick = (i: number) => {
    setPaused(true);
    setStep(i);
    track("cta_click", { cta: "launch_step", location: STAGE_IDS[i] });
  };
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const k = e.key;
    const next = k === "ArrowDown" || k === "ArrowRight" ? i + 1 : k === "ArrowUp" || k === "ArrowLeft" ? i - 1 : k === "Home" ? 0 : k === "End" ? total - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const j = (next + total) % total;
    pick(j);
    document.getElementById(`launch-tab-${j}`)?.focus();
  };

  return (
    <section id="journey" ref={ref} aria-labelledby="launch-title" className="relative isolate scroll-mt-16 overflow-hidden bg-pitch sec text-white" data-theme="dark">
      <RaysLayer className="-z-10" />
      {/* aurora: the sea-glass colours, lit from behind the console */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_20%,rgba(201,150,46,0.20),transparent_70%),radial-gradient(50%_45%_at_10%_90%,rgba(11,125,54,0.16),transparent_70%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(70%_60%_at_70%_40%,#000,transparent)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="text-sm font-semibold text-brand-bright">{c.eyebrow}</p>
            <h2 id="launch-title" className="h-section mt-2 text-balance">{c.title}</h2>
          </div>
          <p className="max-w-xl text-lg text-white/70 text-pretty lg:justify-self-end">{c.lead}</p>
        </div>

        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[5fr_7fr] lg:gap-14">
          {/* the seven steps */}
          <div className="relative">
            <span aria-hidden="true" className="absolute bottom-8 start-[19px] top-8 w-px bg-white/12" />
            <motion.span
              aria-hidden="true"
              className="absolute start-[19px] top-8 w-px bg-gradient-to-b from-sea-400 to-brand-bright"
              initial={false}
              animate={{ height: lit }}
              transition={reduce ? { duration: 0 } : { duration: 0.7, ease: EASE_OUT }}
            />
            <div ref={list} role="tablist" aria-orientation="vertical" aria-label={c.title} className="relative flex flex-col gap-1">
              {STAGE_IDS.map((s, i) => {
                const on = i === step;
                const done = i < step;
                return (
                  <button
                    key={s}
                    id={`launch-tab-${i}`}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls="launch-panel"
                    tabIndex={on ? 0 : -1}
                    onClick={() => pick(i)}
                    onKeyDown={(e) => onKey(e, i)}
                    className={`group relative flex w-full items-start gap-4 rounded-2xl px-0 py-2.5 text-start transition-colors ${on ? "" : "hover:bg-white/[0.03]"}`}
                  >
                    <span
                      className={`relative z-[1] grid size-10 shrink-0 place-items-center rounded-full text-xs font-semibold transition-[background-color,color,box-shadow] duration-500 ${on ? "bg-brand-bright text-pitch shadow-[0_0_0_6px_rgba(76,201,122,0.18),0_0_30px_rgba(76,201,122,0.5)]" : done ? "bg-teal text-white" : "bg-pitch text-white/60 ring-1 ring-white/20"}`}
                    >
                      {done ? (
                        <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      ) : (
                        <span className="num" dir="ltr">{String(i + 1).padStart(2, "0")}</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1 pt-0.5">
                      <span className={`block text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors rtl:tracking-normal ${on ? "text-brand-bright" : "text-white/45"}`}>{c.stages[s].tag}</span>
                      <span className={`mt-0.5 block font-display text-lg font-semibold leading-snug transition-colors sm:text-xl ${on ? "text-white" : "text-white/60 group-hover:text-white/85"}`}>{c.stages[s].t}</span>
                      <span className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <span className="overflow-hidden">
                          <span className="block pt-1 text-white/70 text-pretty">{c.stages[s].d}</span>
                          {!reduce ? (
                            <span aria-hidden="true" className="mt-3 block h-0.5 overflow-hidden rounded-full bg-white/10">
                              {on ? (
                                <span
                                  key={`${step}-${inView}`}
                                  className="block h-full origin-left rounded-full bg-brand-bright animate-[launch-progress_linear_forwards] rtl:origin-right"
                                  style={{ animationDuration: `${HOLD_MS}ms`, animationPlayState: playing ? "running" : "paused" }}
                                  onAnimationEnd={() => setStep((x) => (x + 1) % total)}
                                />
                              ) : null}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* the console the step plays out on */}
          <div
            onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
            onPointerLeave={() => setHeld(false)}
            onFocus={() => setHeld(true)}
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHeld(false); }}
            className="relative lg:sticky lg:top-24 lg:self-start"
          >
            <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03))] p-2 ring-1 ring-white/12 shadow-[0_60px_120px_-50px_rgba(0,0,0,0.9)] backdrop-blur-xl">
              <div className="relative overflow-hidden rounded-[1.6rem] bg-[radial-gradient(120%_90%_at_100%_0%,#2a2416_0%,#131a22_55%,#0b1016_100%)]">
                {/* title bar */}
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
                  <span className="flex items-center gap-2.5 text-sm font-semibold">
                    <span className="relative flex size-2"><span className="absolute inset-0 rounded-full bg-brand-bright/70 motion-safe:animate-ping" /><span className="relative size-2 rounded-full bg-brand-bright" /></span>
                    {c.console.title}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="num text-xs text-white/60" aria-live="polite">{fmt(c.console.stepOf, { n: step + 1, total })}</span>
                    {!reduce ? (
                      <button
                        type="button"
                        onClick={() => setPaused((p) => !p)}
                        aria-label={paused ? c.console.play : c.console.pause}
                        className="tap grid size-8 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition-colors hover:bg-white/20"
                      >
                        {paused ? (
                          <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true"><path d="M5 3.5v9l7-4.5z" fill="currentColor" /></svg>
                        ) : (
                          <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true"><path d="M5 3.5v9M11 3.5v9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                        )}
                      </button>
                    ) : null}
                  </span>
                </div>

                {/* the stage */}
                <div id="launch-panel" role="tabpanel" aria-labelledby={`launch-tab-${step}`} className="relative grid h-[390px] place-items-center overflow-hidden px-5 sm:h-[420px] sm:px-10">
                  {/* go live: MSG's hub with its doors open (own photo), the camera easing toward the door */}
                  <AnimatePresence>
                    {id === "live" ? (
                      <motion.div key="hub" aria-hidden="true" className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.6, ease: EASE_OUT }}>
                        <motion.img
                          src="/media/msg/hub-open.webp"
                          alt=""
                          className="absolute inset-0 size-full object-cover"
                          style={{ transformOrigin: "55% 52%", objectPosition: "55% 52%" }}
                          initial={reduce ? false : { scale: 1 }}
                          animate={{ scale: reduce ? 1 : 1.18 }}
                          transition={{ duration: 6, ease: "linear" }}
                        />
                        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,28,32,0.55),rgba(6,28,32,0.35)_45%,rgba(6,28,32,0.85))]" />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                  <span aria-hidden="true" className="num pointer-events-none absolute -bottom-10 end-4 select-none font-display text-[13rem] font-semibold leading-none text-white/[0.045]" dir="ltr">
                    {String(step + 1).padStart(2, "0")}
                  </span>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={id}
                      className="relative w-full max-w-md"
                      initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -18, filter: "blur(6px)" }}
                      transition={{ duration: reduce ? 0 : 0.5, ease: EASE_OUT }}
                    >
                      <Scene id={id} lang={lang} reduce={reduce} />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* the order's path through the seven steps */}
                <div aria-hidden="true" className="relative border-t border-white/10 px-6 py-4">
                  <div className="relative flex items-center justify-between">
                    <span className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-white/15" />
                    {STAGE_IDS.map((s, i) => (
                      <span key={s} className="relative grid size-3 place-items-center">
                        <span className={`size-2 rounded-full transition-colors duration-500 ${i <= step ? "bg-brand-bright" : "bg-white/25"}`} />
                        {i === step ? (
                          <motion.span layoutId="launch-parcel" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26 }} className="absolute grid size-7 place-items-center rounded-lg bg-white text-teal-deep shadow-[0_8px_24px_-6px_rgba(76,201,122,0.8)]">
                            <svg viewBox="0 0 16 16" className="size-4"><path d="M2.5 5.5L8 3l5.5 2.5v6L8 14l-5.5-2.5z M2.5 5.5L8 8l5.5-2.5M8 8v6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
                          </motion.span>
                        ) : null}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <TrackedLink
                href={whatsappLink(t.wa.general)}
                target="_blank"
                rel="noopener noreferrer"
                event="whatsapp_click"
                props={{ location: "launch" }}
                className="btn-primary on-dark group justify-center px-6 py-3.5"
              >
                <WhatsAppIcon className="size-5" /> {c.cta}
              </TrackedLink>
              <TrackedLink href="#planner" event="cta_click" props={{ cta: "plan", location: "launch" }} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 font-semibold text-white/85 ring-1 ring-white/20 transition-colors hover:bg-white/10 hover:text-white">
                {c.console.plan} <ArrowIcon className="size-4 rtl:rotate-180" />
              </TrackedLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const card = "rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/12 backdrop-blur";
const label = "text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-bright rtl:tracking-normal";
const Tick = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={`size-3 ${className}`} aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/** each step's moment, built from what that step produces */
function Scene({ id, lang, reduce }: { id: StageId; lang: Locale; reduce: boolean }) {
  const u = experience[lang].journey.ui;
  const ex = experience[lang].journey.console.example;
  // entrances inside a scene: staggered unless motion is reduced
  const at = (delay: number, from: { x?: number; y?: number; scale?: number } = { y: 12 }) =>
    reduce ? {} : { initial: { opacity: 0, ...from }, animate: { opacity: 1, x: 0, y: 0, scale: 1 }, transition: { delay, duration: 0.5, ease: EASE_OUT } };

  switch (id) {
    case "enquiry":
      return (
        <div className="flex flex-col gap-3">
          <motion.div {...at(0.1, { x: 20 })} className="ms-auto max-w-[85%] rounded-2xl rounded-ee-md bg-[#d9fdd3] px-4 py-2.5 text-[15px] text-[#0b1f14] shadow-lg">
            {u.chatMsg}
            <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#0b1f14]/75" dir="ltr">09:41 <span className="text-[#34b7f1]"><Tick /></span></span>
          </motion.div>
          {!reduce ? (
            <motion.div className="flex w-16 items-center gap-1 rounded-2xl rounded-es-md bg-white/10 px-3 py-3" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ delay: 0.7, duration: 1.2, times: [0, 0.15, 0.85, 1] }}>
              {[0, 1, 2].map((i) => <span key={i} className="size-1.5 rounded-full bg-white/70 motion-safe:animate-[launch-dot_1s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </motion.div>
          ) : null}
          <motion.div {...at(reduce ? 0 : 1.9, { x: -20 })} className="flex max-w-[85%] items-end gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">MSG</span>
            <span className="rounded-2xl rounded-es-md bg-white px-4 py-2.5 text-[15px] text-teal-deep shadow-lg">
              <span className="block text-[11px] font-semibold text-brand">{u.chatName}</span>
              {u.chatReply}
            </span>
          </motion.div>
        </div>
      );
    case "requirements":
      return (
        <div className={card}>
          <div className="flex items-center justify-between">
            <p className={label}>{u.reqTitle}</p>
            {/* listening */}
            <span aria-hidden="true" className="flex h-5 items-center gap-[3px]">
              {[0, 1, 2, 3, 4].map((i) => <span key={i} className="w-[3px] rounded-full bg-brand-bright motion-safe:animate-[launch-wave_1.1s_ease-in-out_infinite]" style={{ height: "100%", animationDelay: `${i * 0.12}s` }} />)}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {u.reqChips.map((chip, i) => (
              <motion.span key={chip} {...at(0.2 + i * 0.22, { scale: 0.8 })} className="num inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-teal-deep">
                <span className="size-1.5 rounded-full bg-teal" />{chip}
              </motion.span>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/45">{ex}</p>
        </div>
      );
    case "guide":
      return (
        <div className={card}>
          <p className={label}>{u.guideTitle}</p>
          <ul className="mt-3 space-y-2.5">
            {u.guideItems.map((it, i) => (
              <motion.li key={it} {...at(0.15 + i * 0.3, { x: 12 })} className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-2.5 text-[15px] font-medium">
                <motion.span
                  className="grid size-6 shrink-0 place-items-center rounded-md text-pitch"
                  initial={reduce ? false : { backgroundColor: "rgba(255,255,255,0.12)" }}
                  animate={{ backgroundColor: "#4cc97a" }}
                  transition={{ delay: reduce ? 0 : 0.45 + i * 0.3, duration: 0.25 }}
                >
                  <Tick className="size-3.5" />
                </motion.span>
                {it}
              </motion.li>
            ))}
          </ul>
        </div>
      );
    case "recommendations":
      return <PlanScene lang={lang} reduce={reduce} />;
    case "agreement":
      return (
        <div className="relative mx-auto w-full max-w-sm rounded-2xl bg-white p-5 text-teal-deep shadow-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal rtl:tracking-normal">{u.signTitle}</p>
          <div aria-hidden="true" className="mt-4 space-y-2">
            {[92, 78, 86, 60].map((w, i) => <span key={i} className="block h-2 rounded-full bg-teal-deep/10" style={{ width: `${w}%` }} />)}
          </div>
          <svg viewBox="0 0 220 60" className="mt-5 h-14 w-48" aria-hidden="true">
            <motion.path
              d="M6 42c14-18 22-30 30-24s-12 30-2 28 18-34 28-32-6 30 4 30 14-22 22-22 4 18 14 16 12-14 22-14 18 8 30 4 22-10 30-8"
              fill="none" stroke="#0b3a40" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
              initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 1.4, ease: "easeInOut" }}
            />
          </svg>
          <span className="block h-px w-52 bg-teal-deep/20" />
          <motion.span
            {...(reduce ? {} : { initial: { opacity: 0, scale: 1.8, rotate: -24 }, animate: { opacity: 1, scale: 1, rotate: -12 }, transition: { delay: 1.6, type: "spring", stiffness: 300, damping: 16 } })}
            className="absolute bottom-6 end-5 inline-flex rotate-[-12deg] items-center gap-1.5 rounded-lg border-2 border-brand px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-brand rtl:tracking-normal"
          >
            <Tick className="size-3.5" /> {u.signed}
          </motion.span>
        </div>
      );
    case "testing":
      return (
        <div className={card}>
          <p className={label}>{u.testTitle}</p>
          <ul className="mt-4 space-y-3">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10">
                  <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true"><path d="M2.5 5.5L8 3l5.5 2.5v6L8 14l-5.5-2.5z M2.5 5.5L8 8l5.5-2.5M8 8v6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.span className="block h-full origin-left rounded-full bg-brand-bright rtl:origin-right" initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2 + i * 0.55, duration: 0.9, ease: EASE_OUT }} />
                </span>
                <motion.span className="grid size-6 place-items-center rounded-full bg-brand-bright text-pitch" {...at(0.9 + i * 0.55, { scale: 0 })}>
                  <Tick />
                </motion.span>
              </li>
            ))}
          </ul>
          <motion.p {...at(2.2)} className="num mt-4 font-display text-xl font-semibold">{u.testDone}</motion.p>
        </div>
      );
    case "live":
      return (
        <div className="relative grid place-items-center py-6">
          {!reduce ? (
            <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
              {[0, 1, 2].map((i) => <span key={i} className="absolute size-40 rounded-full border border-brand-bright/40 motion-safe:animate-[launch-ring_2.4s_ease-out_infinite]" style={{ animationDelay: `${i * 0.8}s` }} />)}
            </span>
          ) : null}
          <motion.div {...at(0.2, { y: -24 })} className="relative w-full max-w-sm rounded-2xl bg-white p-4 text-teal-deep shadow-[0_30px_60px_-20px_rgba(76,201,122,0.5)]">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-brand-vivid to-brand text-white">
                <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-display text-lg font-semibold">{u.liveTitle}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand rtl:tracking-normal">
                    <span className="size-1.5 rounded-full bg-brand motion-safe:animate-pulse" />24/7
                  </span>
                </span>
                <span className="block text-sm text-teal-deep/70">{u.liveBody}</span>
              </span>
            </div>
          </motion.div>
        </div>
      );
  }
}

/** curated recommendations: an example plan whose numbers count up as it arrives */
function PlanScene({ lang, reduce }: { lang: Locale; reduce: boolean }) {
  const u = experience[lang].journey.ui;
  const [shown, setShown] = useState(reduce);
  useEffect(() => {
    if (reduce) return;
    const id = window.setTimeout(() => setShown(true), 350);
    return () => window.clearTimeout(id);
  }, [reduce]);
  return (
    <div className="rounded-2xl bg-white p-5 text-teal-deep shadow-2xl">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-sea-100 px-2.5 py-1 text-[11px] font-semibold text-teal">{u.planTag}</span>
        <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-teal to-teal-deep text-white">
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true"><path d="M8 2l1.6 3.9L14 6.3l-3.3 2.9 1 4.3L8 11.3l-3.7 2.2 1-4.3L2 6.3l4.4-.4z" fill="currentColor" /></svg>
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold">{u.planName}</p>
      <dl className="mt-4 grid grid-cols-3 gap-2">
        {u.planStats.map(([k, v], i) => {
          const sign = v.startsWith("+") ? "+" : "";
          const n = Number(v.replace(/[^\d]/g, ""));
          return (
            <div key={k} className="rounded-xl bg-sea-50 px-3 py-2.5 ring-1 ring-teal/10">
              <dt className="text-xs text-teal-deep/65">{k}</dt>
              <dd className="num font-display text-2xl font-semibold" dir="ltr">
                {reduce ? v : <NumberFlow value={shown ? n : 0} prefix={sign} transformTiming={{ duration: 900 + i * 200, easing: "ease-out" }} />}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
