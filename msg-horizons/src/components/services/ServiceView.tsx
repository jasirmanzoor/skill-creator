"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import type { ServiceId } from "@/content/facts";
import type { Locale } from "@/content/i18n";
import { serviceHud } from "@/content/serviceHud";
import { EASE_OUT, SPRING_SMOOTH } from "@/lib/motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/** MSG's own photography for each service (2026 company profile) */
export const PHOTO: Record<ServiceId, { src: string; pos: string }> = {
  "last-mile": { src: "/media/msg/van-road-wide.webp", pos: "90% 62%" },
  warehousing: { src: "/media/msg/hub-racks.webp", pos: "50% 52%" },
  "land-freight": { src: "/media/msg/hub-cartons.webp", pos: "50% 58%" },
  fleet: { src: "/photos/clean/fleet-car.webp", pos: "50% 62%" },
  manpower: { src: "/media/msg/hub-team.webp", pos: "60% 55%" },
  tracking: { src: "/media/msg/hub-aisles.webp", pos: "50% 52%" },
  account: { src: "/media/msg/hub-room.webp", pos: "45% 58%" },
};

type Props = {
  id: ServiceId; index: number; total: number; lang: Locale;
  name: string; fact: { v: string; l: string }; href?: string;
};

/**
 * The side view of one service: MSG's photo wipes in under a slow push, a small live panel over it shows what
 * the service actually does, and the service's key fact rises in beneath. The card leans toward the pointer and
 * a soft light follows it, so the view feels held, not printed.
 */
export default function ServiceView({ id, index, total, lang, name, fact, href }: Props) {
  const reduce = useReducedMotion();
  const h = serviceHud[lang];
  const card = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, SPRING_SMOOTH), sy = useSpring(my, SPRING_SMOOTH);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-5, 5]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [4, -4]);
  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !card.current) return;
    const r = card.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
    card.current.style.setProperty("--sx", `${e.clientX - r.left}px`);
    card.current.style.setProperty("--sy", `${e.clientY - r.top}px`);
  };
  const p = PHOTO[id];
  const n = (k: number) => String(k).padStart(2, "0");

  return (
    <div className="[perspective:1400px]">
      <motion.div
        ref={card}
        onPointerMove={onMove}
        onPointerLeave={() => { mx.set(0); my.set(0); }}
        style={reduce ? undefined : { rotateX, rotateY }}
        className="group/card relative overflow-hidden rounded-[1.4rem] bg-surface shadow-[0_40px_80px_-40px_rgba(11,58,64,0.55)] ring-1 ring-line"
      >
        {/* the photo: each service wipes in over the last, under a slow push */}
        <div className="relative aspect-[4/3] overflow-hidden bg-deep">
          <AnimatePresence initial={false}>
            <motion.div
              key={id}
              className="absolute inset-0"
              initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 0 100%)" }}
              animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0 0%)", transition: { duration: 0.7, ease: [0.77, 0, 0.175, 1] } }}
              exit={{ opacity: 0, transition: { delay: 0.7, duration: 0.01 } }}
            >
              <motion.img
                src={p.src}
                alt=""
                decoding="async"
                className="absolute inset-0 size-full object-cover"
                style={{ objectPosition: p.pos }}
                initial={reduce ? false : { scale: 1.18 }}
                animate={{ scale: 1.02, transition: { duration: 6, ease: EASE_OUT } }}
              />
            </motion.div>
          </AnimatePresence>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,14,16,0.45)_0%,rgba(3,14,16,0)_28%,rgba(3,14,16,0)_50%,rgba(3,14,16,0.7)_100%)]" />
          {/* light that follows the pointer */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300 [background:radial-gradient(320px_circle_at_var(--sx,50%)_var(--sy,30%),rgba(255,255,255,0.55),transparent_65%)] group-hover/card:opacity-100" />

          <div className="absolute inset-x-4 top-4 flex items-center justify-between text-white">
            <span className="num rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold ring-1 ring-white/20 backdrop-blur" dir="ltr">
              {n(index + 1)} <span className="text-white/60">/ {n(total)}</span>
            </span>
            <span className="rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-semibold text-white/85 ring-1 ring-white/20 backdrop-blur">{h.note}</span>
          </div>

          {/* what the service does, live */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={id}
              initial={reduce ? false : { opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: reduce ? 0 : 0.35, duration: 0.4, ease: EASE_OUT } }}
              exit={{ opacity: 0, y: 6, transition: { duration: 0.15 } }}
              className="absolute bottom-4 start-4 w-[min(17rem,calc(100%-2rem))] rounded-2xl bg-white/[0.94] p-3 text-teal-deep shadow-[0_20px_40px_-18px_rgba(0,0,0,0.6)] ring-1 ring-white/60"
            >
              <Hud id={id} c={h.hud[id]} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* the fact, rising out of a mask */}
        <div className="relative p-6 sm:p-7">
          <p className="text-sm font-semibold text-brand">{name}</p>
          <div className="mt-3 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={id}
                initial={reduce ? false : { y: "105%" }}
                animate={{ y: "0%", transition: { duration: 0.55, ease: EASE_OUT, delay: reduce ? 0 : 0.15 } }}
                exit={{ y: "-105%", transition: { duration: 0.18 } }}
                className="num pb-1 font-display text-5xl font-semibold tracking-[-0.035em] text-ink sm:text-6xl rtl:tracking-normal"
              >
                {fact.v}
              </motion.p>
            </AnimatePresence>
          </div>
          <p className="mt-2 text-lg text-ink/75">{fact.l}</p>
          {href ? (
            <a href={href} className="group/link mt-4 flex w-full border-t border-line pt-3 min-h-11 items-center gap-1.5 text-sm font-semibold text-brand">
              {h.details}
              <svg viewBox="0 0 24 24" className="size-4 transition-transform duration-200 group-hover/link:translate-x-1 rtl:-scale-x-100 rtl:group-hover/link:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

type H = { title: string; a: string; b: string; c?: string };

function Head({ title }: { title: string }) {
  return (
    <p className="flex items-center gap-2 text-[12px] font-semibold">
      <span className="relative flex size-2"><span className="absolute inset-0 rounded-full bg-brand-vivid/60 motion-safe:animate-ping" /><span className="relative size-2 rounded-full bg-brand-vivid" /></span>
      {title}
    </p>
  );
}

/** two lines of status that hand over to each other, on a loop */
function Swap({ a, b }: { a: string; b: string }) {
  return (
    <span className="relative mt-1 block h-4 overflow-hidden text-[11px] text-teal-deep/75">
      <span className="absolute inset-0 motion-safe:animate-[svc-swap-a_4s_var(--ease-in-out)_infinite]">{a}</span>
      <span className="absolute inset-0 font-semibold text-brand opacity-0 motion-safe:animate-[svc-swap-b_4s_var(--ease-in-out)_infinite] motion-reduce:opacity-100">✓ {b}</span>
    </span>
  );
}

const ROUTE = "M14 52 C 60 10, 120 70, 196 24";

/** the live panel of one service at work, for use outside the card */
export function ServiceHud({ id, lang }: { id: ServiceId; lang: Locale }) {
  return <Hud id={id} c={serviceHud[lang].hud[id]} />;
}

function Hud({ id, c }: { id: ServiceId; c: H }) {
  switch (id) {
    case "last-mile":
      return (
        <>
          <Head title={c.title} />
          <svg viewBox="0 0 210 64" className="mt-2 h-12 w-full" aria-hidden="true">
            <path d={ROUTE} fill="none" stroke="#c4e9e7" strokeWidth="3" strokeLinecap="round" />
            <path d={ROUTE} pathLength={1} fill="none" stroke="#0f9641" strokeWidth="3" strokeLinecap="round" className="svc-draw" />
            <circle cx="14" cy="52" r="5" fill="#0b3a40" />
            <g transform="translate(196 24)"><circle r="9" fill="#0f9641" className="svc-land" /><path d="M-3.5 0l2.5 2.5 4.5-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></g>
            <circle r="4" fill="#0f9641" className="motion-reduce:hidden"><animateMotion dur="4s" repeatCount="indefinite" path={ROUTE} keyPoints="0;1;1" keyTimes="0;0.55;1" calcMode="linear" /></circle>
          </svg>
          <Swap a={c.a} b={c.b} />
        </>
      );
    case "warehousing":
      return (
        <>
          <Head title={c.title} />
          <div aria-hidden="true" className="mt-2.5 grid grid-cols-8 gap-1">
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i} className={`h-3 rounded-[3px] ${[3, 10, 21].includes(i) ? "bg-sea-200" : i % 7 === 5 ? "bg-sand-500/80" : "bg-teal"} ${[6, 13, 17].includes(i) ? "motion-safe:animate-[svc-pick_3.6s_var(--ease-in-out)_infinite]" : ""}`} style={{ animationDelay: `${(i % 3) * 1.2}s` }} />
            ))}
          </div>
          <Swap a={c.a} b={c.b} />
        </>
      );
    case "land-freight":
      return (
        <>
          <Head title={c.title} />
          <svg viewBox="0 0 210 60" className="mt-1 h-12 w-full" aria-hidden="true">
            <path d="M18 44 Q 105 -6 192 40" fill="none" stroke="#c4e9e7" strokeWidth="3" strokeDasharray="4 5" strokeLinecap="round" className="motion-safe:animate-[hero-flow_1.2s_linear_infinite]" />
            <circle cx="18" cy="44" r="6" fill="#0b3a40" />
            <circle cx="192" cy="40" r="6" fill="#fff" stroke="#0b3a40" strokeWidth="2.5" />
            <rect x="-7" y="-5" width="14" height="10" rx="2.5" fill="#0f9641" className="motion-reduce:hidden"><animateMotion dur="3.6s" repeatCount="indefinite" rotate="auto" path="M18 44 Q 105 -6 192 40" /></rect>
          </svg>
          <p className="flex justify-between text-[11px] font-semibold text-teal-deep/80" dir="ltr"><span>{c.a}</span><span>{c.b}</span></p>
        </>
      );
    case "fleet":
      return (
        <>
          <Head title={c.title} />
          <div className="mt-2 flex items-center gap-3">
            <svg viewBox="0 0 48 30" className="h-10 w-16 shrink-0" aria-hidden="true">
              <path d="M6 26 A18 18 0 0 1 42 26" fill="none" stroke="#e2f4f3" strokeWidth="5" strokeLinecap="round" />
              <path d="M6 26 A18 18 0 0 1 42 26" pathLength={1} fill="none" stroke="#0f9641" strokeWidth="5" strokeLinecap="round" className="svc-gauge" />
            </svg>
            <ul className="space-y-1 text-[11px]">
              {[c.a, c.b].map((x, i) => (
                <li key={x} className="flex items-center gap-1.5 opacity-0 motion-safe:animate-[svc-tick_4s_var(--ease-out)_infinite] motion-reduce:opacity-100" style={{ animationDelay: `${0.6 + i * 0.8}s` }}>
                  <span className="grid size-3.5 place-items-center rounded-full bg-brand-vivid text-[8px] text-white">✓</span>{x}
                </li>
              ))}
            </ul>
          </div>
        </>
      );
    case "manpower":
      return (
        <>
          <Head title={c.title} />
          <div aria-hidden="true" className="mt-2.5 space-y-1.5 text-[10px] font-semibold">
            {[[c.a, "w-full", "0s"], [c.b, "w-2/3", "0.25s"], [c.c ?? "", "w-full", "0.5s"]].map(([l, w, d], i) => (
              <div key={l} className="grid grid-cols-[5.5rem_1fr] items-center gap-2">
                <span className={`truncate ${i === 2 ? "text-brand" : "text-teal-deep/75"}`}>{l}</span>
                <span className="h-2 overflow-hidden rounded-full bg-sea-100">
                  <span className={`block h-full origin-left rounded-full ${i === 2 ? "bg-brand-vivid" : "bg-teal"} ${w} motion-safe:animate-[svc-bar_4s_var(--ease-in-out)_infinite] rtl:origin-right`} style={{ animationDelay: d }} />
                </span>
              </div>
            ))}
          </div>
        </>
      );
    case "tracking":
      return (
        <>
          <Head title={c.title} />
          <ol aria-hidden="true" className="mt-3 grid grid-cols-3 text-center text-[10px] font-semibold">
            {[c.a, c.b, c.c ?? ""].map((l, i) => (
              <li key={l} className="relative flex flex-col items-center gap-1.5">
                {i ? <span className="absolute end-1/2 top-[7px] h-0.5 w-full bg-sea-100"><span className="block h-full origin-left bg-brand-vivid motion-safe:animate-[svc-bar_4.5s_var(--ease-in-out)_infinite] rtl:origin-right" style={{ animationDelay: `${i * 0.9}s` }} /></span> : null}
                <span className="relative size-4 rounded-full bg-sea-100 ring-2 ring-white"><span className="absolute inset-0 rounded-full bg-brand-vivid opacity-0 motion-safe:animate-[svc-tick_4.5s_var(--ease-out)_infinite] motion-reduce:opacity-100" style={{ animationDelay: `${0.3 + i * 0.9}s` }} /></span>
                <span className="leading-tight text-teal-deep/80">{l}</span>
              </li>
            ))}
          </ol>
        </>
      );
    case "account":
      return (
        <>
          <Head title={c.title} />
          <div className="mt-2 space-y-1.5 text-[11px]">
            <p className="w-fit max-w-full rounded-2xl rounded-ss-sm bg-sea-50 px-3 py-1.5 opacity-0 ring-1 ring-sea-100 motion-safe:animate-[svc-tick_5s_var(--ease-out)_infinite] motion-reduce:opacity-100">{c.a}</p>
            <p className="ms-auto w-fit rounded-2xl rounded-se-sm bg-teal-deep px-3 py-1.5 font-semibold text-white opacity-0 motion-safe:animate-[svc-tick_5s_var(--ease-out)_infinite] motion-reduce:opacity-100" style={{ animationDelay: "1.1s" }}>✓ {c.b}</p>
          </div>
        </>
      );
  }
}
