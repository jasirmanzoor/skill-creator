"use client";

import { SPRING_SMOOTH } from "@/lib/motion";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { experience, NEED_STAGES, NEEDS_BY_STAGE, type NeedId, type NeedStage } from "@/content/experience";
import type { Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const PHOTO: Record<NeedStage, [string, string]> = {
  setup: ["/photos/clean/team.webp", "50% 40%"],
  store: ["/photos/msg/warehouse-floor.webp", "50% 60%"],
  deliver: ["/photos/clean/courier-mall.webp", "62% 40%"],
  settle: ["/photos/msg/warehouse-front.webp", "50% 45%"],
};

/**
 * One stop, start to finish: one order followed through MSG. On large screens the section pins
 * while a parcel travels a four-station rail (set up, store, deliver, settle); each station brings
 * in its answers in large type beside MSG photography carrying a live card (checklist, shelf,
 * proof of delivery, statement). Phones and reduced motion get the four stages stacked.
 * The support system closes the section.
 */
export default function Needs({ lang }: { lang: Locale }) {
  const c = experience[lang].needs;
  const guide = experience[lang].journey.ui.guideItems;
  const reduce = useReducedMotion();
  const scrub = !reduce;
  const track = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { ...SPRING_SMOOTH, mass: 0.4 });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const s = Math.min(NEED_STAGES.length - 1, Math.max(0, Math.floor(v * NEED_STAGES.length)));
    if (s !== active) setActive(s);
  });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const run = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + run * ((i + 0.5) / NEED_STAGES.length), behavior: reduce ? "auto" : "smooth" });
  };

  let n = 0;
  return (
    <section id="sellers" aria-labelledby="needs-title" className="sea-band relative sec scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <h2 id="needs-title" className="h-section text-teal-deep">
              {c.title}
            </h2>
          </div>
          <p className="max-w-xl text-lg text-teal-deep/75 text-pretty lg:justify-self-end">{c.lead}</p>
        </div>
      </div>

      <div ref={track} className={scrub ? "relative lg:h-[280vh]" : "relative"}>
        <div className={`mx-auto max-w-7xl px-4 sm:px-5 lg:px-8 ${scrub ? "lg:sticky lg:top-16 lg:flex lg:h-[calc(100svh-4rem)] lg:flex-col lg:justify-center" : ""}`}>
          {/* where the order is: four parts, the current one filling as you scroll */}
          {(
            <div className={`sticky top-16 z-10 -mx-4 mt-8 border-y border-teal/12 bg-sea-50/95 px-4 py-3 backdrop-blur sm:-mx-5 sm:px-5 ${scrub ? "lg:static lg:mx-0 lg:mb-7 lg:mt-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none" : "lg:-mx-8 lg:px-8"}`}>
              <ol className="grid grid-cols-4 gap-2 sm:gap-3">
                {NEED_STAGES.map((st, i) => (
                  <li key={st}>
                    <button type="button" onClick={() => goTo(i)} aria-current={i === active ? "step" : undefined} data-press="soft" className="group block w-full text-start">
                      <span className="block h-1.5 overflow-hidden rounded-full bg-teal/15">
                        <StageFill p={p} i={i} />
                      </span>
                      <span className="mt-2 flex items-baseline gap-1.5 sm:gap-3 lg:mt-3">
                        <span className={`num font-display text-xs font-semibold transition-colors sm:text-sm ${i <= active ? "text-teal" : "text-teal-deep/60"}`} dir="ltr">0{i + 1}</span>
                        <span className={`truncate font-display text-sm font-semibold tracking-[-0.02em] transition-colors sm:text-base lg:text-xl rtl:tracking-normal ${i === active ? "text-teal-deep" : "text-teal-deep/60 group-hover:text-teal-deep"}`}>{c.stages[st].t}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div data-inview={inView || undefined} className={`needs-grid mt-8 grid gap-6 ${scrub ? "lg:mt-0 lg:[grid-template-areas:'stage']" : ""}`}>
            {NEED_STAGES.map((st, si) => {
              const on = !scrub || si === active;
              return (
                <article
                  key={st}
                  aria-hidden={scrub && !on ? true : undefined}
                  className={`grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 ${scrub ? "lg:[grid-area:stage] lg:h-[min(560px,calc(100svh-15rem))] lg:transition-[opacity,translate] lg:duration-[450ms] lg:ease-out" : ""} ${scrub && !on ? "lg:pointer-events-none lg:translate-y-10 lg:opacity-0" : "lg:opacity-100"}`}
                >
                  {/* the words */}
                  <div className="flex flex-col justify-center">
                    <p className="flex items-baseline gap-3 text-teal">
                      <span className="num font-display text-sm font-semibold" dir="ltr">0{si + 1} / 0{NEED_STAGES.length}</span>
                      <span className="h-px flex-1 bg-teal/20" />
                    </p>
                    <h3 className="mt-3 font-display text-5xl font-semibold tracking-[-0.035em] text-teal-deep sm:text-6xl rtl:tracking-normal">{c.stages[st].t}</h3>
                    <p className="mt-1 text-lg text-teal-deep/70">{c.stages[st].d}</p>
                    <ul className="mt-6 divide-y divide-teal/10 border-y border-teal/10">
                      {NEEDS_BY_STAGE[st].map((id, k) => (
                        <NeedRow key={id} id={id} q={c.items[id].q} a={c.items[id].a} owner={c.owner} i={n++} k={k} on={on} />
                      ))}
                    </ul>
                  </div>

                  {/* the picture, with a live card */}
                  <div className="relative min-h-[340px] overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-46px_rgba(11,58,64,0.75)] lg:min-h-0">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local, pre-optimised photography */}
                    <img
                      src={PHOTO[st][0]}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      style={{ objectPosition: PHOTO[st][1] }}
                      className={`absolute inset-0 size-full object-cover transition-[scale] duration-700 ease-out ${on ? "scale-100" : "scale-[1.08]"}`}
                    />
                    <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,58,64,0.55)_0%,rgba(11,58,64,0)_32%,rgba(11,58,64,0)_45%,rgba(11,58,64,0.7)_100%)]" />
                    <p aria-hidden="true" className="absolute start-5 top-4 flex items-baseline gap-3 text-white sm:start-7 sm:top-6">
                      <span className="num font-display text-6xl font-semibold tracking-[-0.04em] sm:text-7xl" dir="ltr">0{si + 1}</span>
                      <span className="font-display text-xl font-semibold">{c.stages[st].t}</span>
                    </p>
                    <div className={`absolute inset-x-4 bottom-4 transition-ui delay-150 duration-[450ms] ease-out sm:inset-x-6 sm:bottom-6 ${on ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
                      <StageCard stage={st} c={c} guide={guide} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

        </div>
      </div>

      {/* the support system */}
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
        <div className="mt-10 grid gap-8 overflow-hidden rounded-3xl bg-teal-deep p-6 text-white sm:p-8 lg:grid-cols-[1fr_1.4fr] lg:p-10">
          <div className="flex flex-col">
            <p className="font-display text-2xl font-semibold text-balance sm:text-3xl">{c.support.title}</p>
            <p className="mt-3 max-w-md text-white/75">{c.support.body}</p>
          </div>
          <div>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {c.support.items.map((it, i) => (
                <li key={it} className={`flex items-center gap-3 rounded-2xl bg-white/[0.07] px-4 py-3.5 ring-1 ring-white/10 ${i === c.support.items.length - 1 && c.support.items.length % 2 ? "sm:col-span-2" : ""}`}>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sea-200 text-teal-deep">
                    <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span className="font-medium">{it}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-white/65">{c.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

type NeedsCopy = (typeof experience)["en"]["needs"];

/** the glass card that sits on each stage photo */
function StageCard({ stage, c, guide }: { stage: NeedStage; c: NeedsCopy; guide: string[] }) {
  const shell = "rounded-2xl bg-white/92 p-4 text-teal-deep shadow-[0_20px_40px_-20px_rgba(11,58,64,0.7)] ring-1 ring-white/60 backdrop-blur sm:max-w-sm";
  const tick = (
    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-teal text-white">
      <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
  if (stage === "setup" || stage === "settle") {
    const rows = stage === "setup" ? guide : c.cards.settleRows;
    return (
      <div className={shell}>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal rtl:tracking-normal">{stage === "setup" ? c.cards.setup : c.cards.settle}</p>
        <ul className="mt-2.5 space-y-2">
          {rows.map((r) => <li key={r} className="flex items-center gap-2.5 text-sm font-medium">{tick}{r}</li>)}
        </ul>
      </div>
    );
  }
  if (stage === "store") {
    return (
      <div className={shell}>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal rtl:tracking-normal">{c.cards.store}</p>
        <div aria-hidden="true" className="mt-3 grid grid-cols-6 gap-1.5">
          {Array.from({ length: 18 }, (_, i) => (
            <span key={i} className={`h-4 rounded-[4px] ${[2, 7, 11, 16].includes(i) ? "bg-sea-200" : i % 5 === 3 ? "bg-sand-500/80" : "bg-teal"}`} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className={shell}>
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-teal to-teal-deep text-white">
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <p className="font-display text-base font-semibold">{c.pod}</p>
      </div>
      <ol className="mt-3 grid grid-cols-4 gap-1">
        {c.track.map((t) => (
          <li key={t} className="text-center">
            <span className="block h-1.5 rounded-full bg-teal" />
            <span className="mt-1.5 block text-[10px] font-medium leading-tight text-teal-deep/75">{t}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** one quarter of the scroll: empty before its stage, filling during it, full after */
function StageFill({ p, i }: { p: MotionValue<number>; i: number }) {
  const transform = useTransform(p, (v) => `scaleX(${Math.min(1, Math.max(0, v * NEED_STAGES.length - i)).toFixed(4)})`);
  return <motion.span className="block h-full origin-left rounded-full bg-teal rtl:origin-right" style={{ transform }} />;
}

function NeedRow({ id, q, a, owner, i, k, on }: { id: NeedId; q: string; a: string; owner: string; i: number; k: number; on: boolean }) {
  return (
    <li
      className={`need-card flex items-start gap-4 py-4 transition-ui duration-700 ${on ? "" : "lg:translate-y-3"}`}
      style={{ ["--d" as string]: `${i * 60}ms`, transitionDelay: on ? `${k * 60}ms` : "0ms" }}
    >
      <span className="need-icon inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-teal-deep text-white shadow-[0_10px_20px_-10px_rgba(11,58,64,0.8)] [&_svg]:size-7">
        <NeedIcon id={id} />
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="text-sm text-teal-deep/70">{q}</h4>
        <p className="mt-0.5 font-display text-lg font-semibold leading-snug text-teal-deep text-pretty sm:text-xl">{a}</p>
      </div>
      <span className="mt-1 hidden shrink-0 items-center gap-1.5 rounded-full bg-sea-100 px-2.5 py-1 text-[11px] font-semibold text-teal sm:inline-flex">
        <span className="size-1.5 rounded-full bg-teal" />
        {owner}
      </span>
    </li>
  );
}

const B = "#a7f0e6";
function NeedIcon({ id }: { id: NeedId }) {
  const common = { width: 34, height: 34, viewBox: "0 0 34 34", fill: "none", "aria-hidden": true } as const;
  switch (id) {
    case "cod": // coin drops into the wallet
      return (
        <svg {...common}>
          <rect x="5" y="14" width="24" height="15" rx="3" stroke="#fff" strokeWidth="1.8" />
          <path d="M23 21.5h6" stroke="#fff" strokeWidth="1.8" />
          <g className="nd-drop"><circle cx="17" cy="8" r="4.2" fill={B} /><path d="M17 6v4" stroke="#0b0d12" strokeWidth="1.4" /></g>
        </svg>
      );
    case "remittance": // money travels from MSG to the seller, on a cycle
      return (
        <svg {...common}>
          <rect x="3" y="11" width="9" height="12" rx="2" stroke="#fff" strokeWidth="1.6" />
          <rect x="22" y="11" width="9" height="12" rx="2" stroke="#fff" strokeWidth="1.6" />
          <path d="M12 17h10" stroke="rgba(255,255,255,.3)" strokeWidth="1.6" strokeDasharray="2 2.5" />
          <circle className="nd-slide" cx="12" cy="17" r="2.6" fill={B} />
        </svg>
      );
    case "packaging": // tape seals the box
      return (
        <svg {...common}>
          <path d="M5 12l12-5 12 5v14l-12 5-12-5z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M5 12l12 5 12-5M17 17v14" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
          <path className="nd-tape" d="M11 9.5l12 5" stroke={B} strokeWidth="2.4" strokeLinecap="round" pathLength={1} />
        </svg>
      );
    case "storage": // shelves fill
      return (
        <svg {...common}>
          <path d="M5 29V6M29 29V6M5 13h24M5 21h24M5 29h24" stroke="#fff" strokeWidth="1.6" />
          <rect className="nd-pop" x="8" y="15" width="6" height="6" rx="1" fill={B} style={{ animationDelay: "0s" }} />
          <rect className="nd-pop" x="16" y="15" width="6" height="6" rx="1" fill="#fff" style={{ animationDelay: ".35s" }} />
          <rect className="nd-pop" x="11" y="23" width="6" height="6" rx="1" fill="#fff" style={{ animationDelay: ".7s" }} />
          <rect className="nd-pop" x="19" y="23" width="6" height="6" rx="1" fill={B} style={{ animationDelay: "1.05s" }} />
        </svg>
      );
    case "returns": // the parcel comes back round
      return (
        <svg {...common}>
          <g className="nd-spin"><path d="M26 11a11 11 0 1 0 2 9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /><path d="M27 5v7h-7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></g>
          <rect x="13" y="13" width="8" height="8" rx="1.5" fill={B} />
        </svg>
      );
    case "pod": // delivered: tick draws on the phone
      return (
        <svg {...common}>
          <rect x="9" y="3" width="16" height="28" rx="3" stroke="#fff" strokeWidth="1.6" />
          <path className="nd-tick" d="M12.5 17.5l3.2 3.2 6-6.5" stroke={B} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
        </svg>
      );
    case "overseas": // a route arcs in from abroad
      return (
        <svg {...common}>
          <circle cx="17" cy="17" r="12" stroke="rgba(255,255,255,.35)" strokeWidth="1.4" />
          <path d="M5 17h24M17 5c4 3.5 4 20.5 0 24M17 5c-4 3.5-4 20.5 0 24" stroke="rgba(255,255,255,.35)" strokeWidth="1.2" />
          <path className="nd-arc" d="M6 11C12 3 24 5 26 20" stroke={B} strokeWidth="2" strokeLinecap="round" pathLength={1} />
          <circle cx="26" cy="21" r="2.6" fill="#fff" />
        </svg>
      );
    case "pickups": // three origins join one route
      return (
        <svg {...common}>
          <path d="M6 8c6 0 7 9 11 9M6 17h11M6 26c6 0 7-9 11-9M17 17h11" stroke="rgba(255,255,255,.4)" strokeWidth="1.6" />
          <path className="nd-flow" d="M6 8c6 0 7 9 11 9h11" stroke={B} strokeWidth="2" pathLength={1} />
          {[8, 17, 26].map((y) => <circle key={y} cx="6" cy={y} r="2.6" fill="#fff" />)}
          <circle cx="28" cy="17" r="3" fill={B} />
        </svg>
      );
    case "damages": // shield pulses, every scan logged
      return (
        <svg {...common}>
          <path className="nd-pulse" d="M17 4l10 4v8c0 7-4.5 11-10 14C11.5 27 7 23 7 16V8z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12.5 16.5l3 3 6-6" stroke={B} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}
