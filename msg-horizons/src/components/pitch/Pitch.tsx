"use client";

import RaysLayer from "../fx/RaysLayer";
import { SPRING_SMOOTH } from "@/lib/motion";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Dictionary, Locale } from "@/content/i18n";
import { pitchCopy, type PitchRow } from "@/content/pitch";
import { whatsappLink } from "@/content/facts";
import { track } from "@/lib/analytics";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import TrackedLink from "../ui/TrackedLink";
import { CheckIcon, WhatsAppIcon } from "../ui/icons";

/** how far each job sits out of line when nobody is holding the operation together: x px, y px, degrees */
const ADRIFT: [number, number, number][] = [[-7, 5, -1.8], [6, -6, 1.3], [-4, 8, 2.1], [7, 4, -1.5], [-6, -5, 1.9], [5, 7, -2.3]];

/** how long each state holds while the scene plays by itself (ms) */
const HOLD_OWN = 2600;
const HOLD_MSG = 5200;
const playCopy: Record<Locale, { pause: string; play: string }> = {
  en: { pause: "Pause the animation", play: "Play the animation" },
  ar: { pause: "إيقاف الحركة مؤقتًا", play: "تشغيل الحركة" },
};

/**
 * The pitch, straight after the hero, as a scene that plays by itself. Six jobs drift loose and out of line around an
 * empty place where a team should be (on your own); then MSG lights up in the middle, a line runs out to each job,
 * and one by one they snap into line and turn from the problem into MSG's answer (with MSG). It holds, lets go, and
 * plays again for as long as it is on screen. The toggle jumps to either state and stops the loop; the button next
 * to it pauses and plays. Behind it, MSG's own Sabya hub turns from grey to colour with MSG. Reduced motion shows
 * the answer, still.
 */
export default function Pitch({ t, lang }: { t: Dictionary; lang: Locale }) {
  const c = pitchCopy[lang];
  const p = playCopy[lang];
  const reduce = useReducedMotion();
  const [msg, setMsg] = useState(false);
  const [playing, setPlaying] = useState(true);
  const sec = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { amount: 0.3 });
  const auto = playing && inView && !reduce;

  // the scene's own loop: on your own, then with MSG, then again
  useEffect(() => {
    if (reduce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced motion goes straight to the answer
      setMsg(true);
      return;
    }
    if (!auto) return;
    const id = window.setTimeout(() => setMsg((m) => !m), msg ? HOLD_MSG : HOLD_OWN);
    return () => window.clearTimeout(id);
  }, [msg, auto, reduce]);

  const choose = (v: boolean) => {
    setPlaying(false);
    setMsg(v);
    track("cta_click", { cta: v ? "pitch_with_msg" : "pitch_on_own", location: "pitch" });
  };

  // the hub photo drifts slowly behind the copy
  const { scrollYProgress } = useScroll({ target: sec, offset: ["start end", "end start"] });
  const sp = useSpring(scrollYProgress, { ...SPRING_SMOOTH });
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
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#0b1016_0%,rgba(11,16,22,0.82)_30%,rgba(11,16,22,0.9)_70%,#0b1016_100%)]" />
      <div aria-hidden="true" className={`absolute inset-0 -z-10 transition-opacity duration-[1200ms] ease-out ${msg ? "opacity-100" : "opacity-0"} bg-[radial-gradient(60%_50%_at_75%_30%,rgba(0,157,248,0.18),transparent_70%)]`} />
      <RaysLayer className="-z-10" />

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div>
            <h2 id="why-title" className="h-scene">
              {c.title}
            </h2>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-white/80 text-pretty lg:justify-self-end">{c.lead}</p>
        </div>

        {/* on your own / with MSG, and the scene's play/pause */}
        <div className="mt-10 flex items-center gap-3">
          <div role="radiogroup" aria-label={c.toggleLabel} className="relative inline-grid grid-cols-2 overflow-hidden rounded-full bg-white/10 p-1.5 ring-1 ring-white/15 backdrop-blur">
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
            {/* how long until the scene turns over by itself */}
            {auto ? (
              <span
                key={String(msg)}
                aria-hidden="true"
                className="pitch-timer absolute inset-x-5 bottom-0.5 h-0.5 origin-left rounded-full bg-white/50 rtl:origin-right"
                style={{ animationDuration: `${msg ? HOLD_MSG : HOLD_OWN}ms` }}
              />
            ) : null}
          </div>
          {!reduce ? (
            <button
              type="button"
              onClick={() => setPlaying((v) => !v)}
              aria-label={playing ? p.pause : p.play}
              title={playing ? p.pause : p.play}
              className="grid size-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-white/20"
            >
              {playing ? (
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" className="size-4 rtl:-scale-x-100" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
              )}
            </button>
          ) : null}
        </div>

        {/* the operation: loose and adrift on your own, in line around one team with MSG */}
        <div
          ref={stage}
          className={`relative mt-8 overflow-hidden rounded-3xl py-6 ring-1 transition-colors duration-[900ms] ${msg ? "bg-[#0a2c22] ring-brand-bright/25" : "bg-[#111720] ring-white/10"}`}
        >
          {/* light sweeping across as MSG takes over */}
          <AnimatePresence>
            {msg && !reduce ? (
              <motion.span
                key="sweep"
                aria-hidden="true"
                initial={{ x: "-110%", opacity: 0.9 }}
                animate={{ x: "110%", opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
                className="pointer-events-none absolute inset-y-0 z-10 w-2/3 bg-[linear-gradient(100deg,transparent,rgba(0,157,248,0.22),transparent)] rtl:-scale-x-100"
              />
            ) : null}
          </AnimatePresence>
          <Operation rows={c.rows} labels={c.toggle} withMsg={msg} reduce={reduce} />
        </div>

        <div className={`mt-6 flex flex-col gap-6 rounded-3xl p-6 ring-1 transition-colors duration-500 sm:p-8 lg:flex-row lg:items-center lg:justify-between ${msg ? "bg-white text-teal-deep ring-white" : "bg-white/[0.06] text-white ring-white/10"}`}>
          <div>
            <p className="font-display text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-3xl rtl:tracking-normal">{c.close}</p>
            <p className={`mt-2 ${msg ? "text-teal-deep/75" : "text-white/70"}`}>{c.closeLead}</p>
          </div>
          <TrackedLink href={whatsappLink(t.wa.general)} target="_blank" rel="noopener noreferrer" event="whatsapp_click" props={{ location: "pitch" }}
            className={`inline-flex min-h-12 shrink-0 items-center gap-2 self-start rounded-full px-5 py-3.5 font-semibold ring-1 transition-colors lg:self-auto ${msg ? "text-teal-deep ring-teal/25 hover:bg-sea-50" : "text-white ring-white/30 hover:bg-white/10"}`}>
            <WhatsAppIcon className="size-5 text-whatsapp" /> {c.talk}
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}

/**
 * The operation: six jobs around the place where a team should be. On your own they drift loose and out of line,
 * dashed and red, linked to nothing; with MSG the team lights up, a line runs out to each job, and each one snaps
 * into line and turns into MSG's answer, one after another. Boxes keep one size in both states, so nothing shifts.
 */
function Operation({ rows, labels, withMsg, reduce }: { rows: PitchRow[]; labels: [string, string]; withMsg: boolean; reduce: boolean }) {
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 170, damping: 18, mass: 0.9 };
  const job = (i: number) => {
    const r = rows[i];
    const top = i < 3; // on wide screens the first three sit above the team, the rest below it
    const [x, y, deg] = ADRIFT[i];
    // one after another as MSG takes over; all at once as they let go
    const delay = withMsg && !reduce ? 0.35 + i * 0.16 : 0;
    const drift = reduce
      ? { x, y, rotate: deg }
      : { x: [x, x * -0.6, x], y: [y, y * -0.8, y], rotate: [deg, -deg * 0.7, deg] };
    return (
      <li key={r.pain} className={`flex ${top ? "flex-col-reverse lg:flex-col" : "flex-col-reverse justify-end"}`}>
        <motion.div
          initial={false}
          animate={withMsg ? { x: 0, y: 0, rotate: 0, scale: 1 } : { ...drift, scale: 0.98 }}
          transition={withMsg ? { ...spring, delay } : reduce ? { duration: 0 } : { duration: 5 + i * 0.6, repeat: Infinity, ease: "easeInOut" }}
          className={`relative flex h-32 items-center gap-3.5 overflow-hidden rounded-2xl border px-4 transition-[background-color,border-color] duration-500 lg:h-[7.5rem] lg:px-5 ${
            withMsg ? "border-brand-bright/50 bg-[#0d3f2a]" : "border-dashed border-[#e5735c]/55 bg-[#172029]"
          }`}
          style={{ transitionDelay: `${delay}s` }}
        >
          {/* the problem leaves only when MSG reaches its card (custom: that card's delay) */}
          <AnimatePresence mode="popLayout" initial={false} custom={delay}>
            {withMsg ? (
              <motion.div
                key="fix"
                className="flex min-w-0 items-center gap-3.5"
                initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.25 } }}
                transition={{ duration: 0.5, delay: delay + 0.16, ease: [0.23, 1, 0.32, 1] }}
              >
                <motion.span
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-bright text-pitch"
                  initial={reduce ? false : { scale: 0.3, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ ...spring, delay: delay + 0.1 }}
                >
                  <CheckIcon className="size-5" />
                </motion.span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white/60 line-through decoration-brand-bright decoration-2">{r.pain}</p>
                  <p className="mt-1 font-display text-base font-semibold leading-snug text-white sm:text-[1.0625rem]">{r.fix}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="pain"
                className="flex min-w-0 items-center gap-3.5"
                variants={{ exit: (d: number) => ({ opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.22, delay: d } }) }}
                initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit="exit"
                transition={{ duration: 0.4 }}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e5735c]/20 text-[#ffb3a3] ring-1 ring-[#e5735c]/40">
                  <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M7 7l10 10M17 7 7 17" /></svg>
                </span>
                <p className="font-display text-lg font-semibold leading-snug text-white">{r.pain}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        {/* the link to the team: broken on your own; with MSG a solid line runs out to the job and a signal travels it */}
        <span aria-hidden="true" className="relative mx-auto block h-5 w-0.5 lg:h-8">
          <span className={`absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(229,115,92,0.6)_0_3px,transparent_3px_8px)] transition-opacity duration-300 ${withMsg ? "opacity-0" : "opacity-100"}`} />
          <motion.span
            className={`absolute inset-0 bg-brand-bright ${top ? "origin-bottom" : "origin-top"} max-lg:origin-top`}
            initial={false}
            animate={{ scaleY: withMsg ? 1 : 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.35, delay: withMsg ? delay - 0.2 : 0, ease: "easeOut" }}
          />
          {withMsg && !reduce ? (
            <motion.span
              className="absolute start-1/2 size-1.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_8px_2px_rgba(0,157,248,0.9)] rtl:translate-x-1/2"
              initial={{ top: top ? "100%" : "0%", opacity: 0 }}
              animate={{ top: top ? ["100%", "0%"] : ["0%", "100%"], opacity: [0, 1, 0] }}
              transition={{ duration: 1.1, delay: delay + 0.6, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
            />
          ) : null}
        </span>
      </li>
    );
  };
  return (
    <ul className="grid px-3 lg:grid-cols-3 lg:gap-x-5 lg:px-4">
      {[0, 1, 2].map(job)}
      <li className="relative order-first lg:order-none lg:col-span-3">
        <motion.div
          initial={false}
          animate={withMsg ? { scale: [0.96, 1.03, 1] } : { scale: 1 }}
          transition={reduce ? { duration: 0 } : { duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className={`relative grid h-14 place-items-center overflow-hidden rounded-2xl transition-colors duration-500 lg:h-16 ${
            withMsg ? "bg-brand-bright font-display text-lg font-semibold text-pitch" : "border border-dashed border-white/25 bg-[#16233f] text-sm font-semibold uppercase tracking-[0.14em] text-white/55 rtl:tracking-normal"
          }`}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={withMsg ? "msg" : "own"}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              {withMsg ? labels[1] : labels[0]}
            </motion.span>
          </AnimatePresence>
          {/* the team's pulse, once it is there */}
          {withMsg && !reduce ? (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-white/60"
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0, scale: 1.08 }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.6, ease: "easeOut" }}
            />
          ) : null}
        </motion.div>
      </li>
      {[3, 4, 5].map(job)}
    </ul>
  );
}
