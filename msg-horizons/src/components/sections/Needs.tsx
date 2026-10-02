"use client";

/* eslint-disable @next/next/no-img-element -- local, pre-optimised webp of MSG's own warehouse */
import { useEffect, useRef, useState } from "react";
import { experience, NEED_STAGES, NEEDS_BY_STAGE, type NeedId, type NeedStage } from "@/content/experience";
import type { Locale } from "@/content/i18n";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon } from "../ui/icons";

/**
 * One stop, start to finish: the nine seller questions laid out as one structured operation.
 * Four lifecycle stages (set up, store, deliver, settle) sit on a single spine, each answer
 * filed under the stage that owns it, and the support system (one team, written terms, pilots,
 * logged scans, 24/7) closes the section. Columns rise in sequence once on screen; static under
 * reduced motion (the CSS keeps everything visible).
 */
export default function Needs({ lang }: { lang: Locale }) {
  const c = experience[lang].needs;
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  let n = 0;
  return (
    <section id="sellers" aria-labelledby="needs-title" className="sea-band relative scroll-mt-16 overflow-hidden py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <span className="label">{c.eyebrow}</span>
            <h2 id="needs-title" className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] text-teal-deep text-balance sm:text-5xl rtl:tracking-normal">
              {c.title}
            </h2>
          </div>
          <p className="max-w-xl text-lg text-teal-deep/75 text-pretty lg:justify-self-end">{c.lead}</p>
        </div>

        <div ref={ref} data-inview={inView || undefined} className="needs-grid relative mt-14">
          {/* the spine every stage hangs from */}
          <div aria-hidden="true" className="absolute inset-x-[12.5%] top-[22px] hidden h-0.5 overflow-hidden rounded-full bg-teal/15 lg:block">
            <span className="ops-spine absolute inset-y-0 w-1/4 rounded-full bg-gradient-to-r from-transparent via-teal to-transparent" />
          </div>
          <ol className="grid gap-4 lg:grid-cols-4 lg:gap-5">
            {NEED_STAGES.map((st, si) => (
              <li key={st} className="ops-col relative flex flex-col" style={{ ["--d" as string]: `${si * 140}ms` }}>
                <div className="flex items-center gap-3 lg:flex-col lg:items-center lg:text-center">
                  <span className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full bg-teal-deep font-display text-sm font-semibold text-white shadow-[0_0_0_6px_rgba(226,244,243,0.9)]">
                    <span className="num" dir="ltr">0{si + 1}</span>
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-teal-deep">{c.stages[st].t}</h3>
                    <p className="text-sm text-teal-deep/70">{c.stages[st].d}</p>
                  </div>
                </div>
                <div className="sea-glass mt-4 flex flex-1 flex-col gap-2.5 rounded-3xl p-3">
                  {NEEDS_BY_STAGE[st].map((id) => (
                    <NeedCard key={id} id={id} q={c.items[id].q} a={c.items[id].a} owner={c.owner} i={n++} />
                  ))}
                  <StageFill stage={st} track={c.track} pod={c.pod} />
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* the support system */}
        <div className="mt-6 grid gap-8 overflow-hidden rounded-3xl bg-teal-deep p-6 text-white sm:p-8 lg:grid-cols-[1fr_1.4fr] lg:p-10">
          <div className="flex flex-col">
            <p className="font-display text-2xl font-semibold text-balance sm:text-3xl">{c.support.title}</p>
            <p className="mt-3 max-w-md text-white/75">{c.support.body}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-auto lg:pt-8">
              <TrackedLink
                href="#planner"
                event="cta_click"
                props={{ cta: "plan", location: "needs" }}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 font-medium text-teal-deep transition-colors hover:bg-sea-100"
              >
                {c.cta} <ArrowIcon className="size-4 rtl:rotate-180" />
              </TrackedLink>
            </div>
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

/** what fills the rest of each stage: MSG's real warehouse under Store, a closed-out tracker under Deliver */
function StageFill({ stage, track, pod }: { stage: NeedStage; track: string[]; pod: string }) {
  if (stage === "store") {
    return (
      <div className="relative min-h-40 flex-1 overflow-hidden rounded-2xl">
        <img src="/photos/msg/warehouse-floor.webp" alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" style={{ objectPosition: "50% 60%" }} />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0b3a40]/40 to-transparent" />
      </div>
    );
  }
  if (stage === "deliver") {
    return (
      <div className="flex flex-1 flex-col justify-end gap-4 rounded-2xl bg-white/80 p-4 ring-1 ring-teal/10">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4 text-center">
          <span className="ops-pod grid size-16 place-items-center rounded-full bg-gradient-to-br from-teal to-teal-deep text-white shadow-[0_14px_30px_-14px_rgba(11,58,64,0.9)]">
            <svg viewBox="0 0 24 24" className="size-8" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <p className="font-display text-sm font-semibold text-teal-deep">{pod}</p>
        </div>
        <ol className="grid grid-cols-4 gap-1">
          {track.map((t, i) => (
            <li key={t} className="text-center">
              <span className="ops-tick mx-auto block h-1.5 rounded-full bg-teal" style={{ ["--d" as string]: `${600 + i * 220}ms` }} />
              <span className="mt-1.5 block text-[10px] font-medium leading-tight text-teal-deep/75">{t}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  return null;
}

function NeedCard({ id, q, a, owner, i }: { id: NeedId; q: string; a: string; owner: string; i: number }) {
  return (
    <div className="need-card rounded-2xl bg-white p-4 ring-1 ring-teal/10 transition-shadow hover:shadow-[0_20px_40px_-28px_rgba(11,58,64,0.55)]" style={{ ["--d" as string]: `${200 + i * 70}ms` }}>
      <div className="flex items-start gap-3.5">
        <span className="need-icon inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-teal-deep text-white shadow-[0_10px_20px_-10px_rgba(11,58,64,0.8)] [&_svg]:size-7">
          <NeedIcon id={id} />
        </span>
        <div className="min-w-0">
          <h4 className="text-[13px] text-teal-deep/70">{q}</h4>
          <p className="mt-1 font-display text-base font-semibold leading-snug text-teal-deep text-pretty">{a}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal">
            <span className="size-1.5 rounded-full bg-teal" />
            {owner}
          </p>
        </div>
      </div>
    </div>
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
