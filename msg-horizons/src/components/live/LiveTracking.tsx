"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/i18n";
import { liveCopy } from "@/content/liveTracking";
import { track } from "@/lib/analytics";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import Reveal from "../ui/Reveal";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon, CheckIcon } from "../ui/icons";
import DriverPhone from "./DriverPhone";
import ScanVsLive from "./ScanVsLive";
import TrackerCard from "./TrackerCard";

/**
 * Live tracking, shown as the handshake it is: the driver gets a request and approves it on their phone,
 * and only then does the seller's side light up with the driver's real location. The visitor can tap
 * Approve themselves; if they do nothing it plays once on its own (never under reduced motion).
 * Sits straight after the hero and the partner logos.
 */
export default function LiveTracking({ lang }: { lang: Locale }) {
  const c = liveCopy[lang];
  const reduce = useReducedMotion();
  const [live, setLive] = useState(false);
  const touched = useRef(false);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce || !stage.current) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        window.clearTimeout(timer);
        if (e.isIntersecting && !touched.current) {
          timer = window.setTimeout(() => {
            if (touched.current) return;
            touched.current = true;
            setLive(true);
          }, 6500);
        }
      },
      { threshold: 0.55 },
    );
    io.observe(stage.current);
    return () => { window.clearTimeout(timer); io.disconnect(); };
  }, [reduce]);

  const approve = () => { touched.current = true; setLive(true); track("cta_click", { cta: "live_tracking_approve", location: "live_tracking" }); };
  const replay = () => { touched.current = true; setLive(false); };

  const stepState = (i: number): "done" | "active" | "todo" => (i === 0 ? "done" : i === 1 ? (live ? "done" : "active") : live ? "active" : "todo");

  return (
    <section
      id="live-tracking"
      data-theme="dark"
      aria-labelledby="live-title"
      className="on-dark relative scroll-mt-16 overflow-hidden bg-[#08262b] py-24 text-white lg:py-32"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_85%_0%,rgba(19,113,121,0.55),transparent_70%),radial-gradient(50%_45%_at_0%_100%,rgba(11,125,54,0.28),transparent_70%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(80%_70%_at_50%_30%,#000,transparent)]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-end">
          <div>
            <span className="label">{c.eyebrow}</span>
            <h2 id="live-title" className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl lg:text-6xl rtl:leading-[1.3] rtl:tracking-normal">
              {c.title}
            </h2>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-white/75 text-pretty lg:justify-self-end">{c.lead}</p>
        </Reveal>

        <Reveal delay={120} className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm sm:p-8 lg:mt-16 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[17rem_1fr] lg:gap-14">
            <ol aria-label={c.stepsLabel} className="space-y-7 self-center">
              {c.steps.map((s, i) => {
                const st = stepState(i);
                return (
                  <li
                    key={s.t}
                    aria-current={st === "active" ? "step" : undefined}
                    className="relative flex gap-4 before:absolute before:start-[17px] before:top-11 before:-bottom-7 before:w-px before:bg-white/15 last:before:hidden"
                  >
                    <span
                      className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold transition-colors duration-500 ${
                        st === "done" ? "bg-[#4cc97a] text-[#08262b]" : st === "active" ? "border-2 border-[#4cc97a] bg-[#08262b] text-[#4cc97a]" : "border border-white/25 bg-[#08262b] text-white/60"
                      }`}
                    >
                      {st === "active" ? <span className="plan-ping absolute inset-0 rounded-full bg-[#4cc97a]/40 motion-reduce:hidden" aria-hidden="true" /> : null}
                      {st === "done" ? <CheckIcon className="relative size-4" /> : <span className="num relative">{i + 1}</span>}
                    </span>
                    <span>
                      <span className={`block font-display text-lg font-semibold leading-snug transition-colors duration-500 ${st === "todo" ? "text-white/60" : "text-white"}`}>{s.t}</span>
                      <span className={`mt-1 block text-sm leading-relaxed transition-colors duration-500 ${st === "todo" ? "text-white/55" : "text-white/75"}`}>{s.d}</span>
                    </span>
                  </li>
                );
              })}
            </ol>

            <div ref={stage} className="flex flex-col items-center lg:flex-row lg:justify-center">
              <div className="relative pb-10 lg:pb-0">
                <DriverPhone c={c} live={live} reduce={reduce} onApprove={approve} onReplay={replay} />
                <p
                  aria-hidden={live}
                  className={`absolute inset-x-0 top-[calc(100%-1.75rem)] text-center text-[13px] font-semibold text-[#4cc97a] transition-opacity duration-500 lg:top-full lg:mt-3 ${live ? "opacity-0" : "opacity-100"}`}
                >
                  {c.tryIt}
                </p>
              </div>

              {/* the signal: nothing travels until the driver approves */}
              <div aria-hidden="true" className="relative hidden h-px w-[4.5rem] shrink-0 lg:block">
                <span className={`absolute inset-0 border-t-2 border-dashed transition-colors duration-700 ${live ? "border-[#4cc97a]" : "border-white/25"}`} />
                {live ? [0, 1, 2].map((i) => <span key={i} className="sig-x absolute -top-[3px] start-0 size-2 rounded-full bg-[#4cc97a] motion-reduce:hidden" style={{ animationDelay: `${i * 0.5}s` }} />) : null}
              </div>
              <div aria-hidden="true" className="relative h-14 w-px shrink-0 lg:hidden">
                <span className={`absolute inset-0 border-s-2 border-dashed transition-colors duration-700 ${live ? "border-[#4cc97a]" : "border-white/25"}`} />
                {live ? [0, 1, 2].map((i) => <span key={i} className="sig-y absolute -start-[3px] top-0 size-2 rounded-full bg-[#4cc97a] motion-reduce:hidden" style={{ animationDelay: `${i * 0.45}s` }} />) : null}
              </div>

              <div className="w-full max-w-[34rem] lg:max-w-none lg:flex-1">
                <TrackerCard c={c} live={live} reduce={reduce} />
              </div>
            </div>
          </div>
          <p className="sr-only" aria-live="polite">{live ? c.announce.live : c.announce.waiting}</p>
        </Reveal>

        <Reveal delay={80} className="mt-6">
          <ScanVsLive c={c} />
        </Reveal>

        <Reveal className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-relaxed text-white/65">{c.note}</p>
          <TrackedLink href="#planner" event="cta_click" props={{ cta: "plan", location: "live_tracking" }} className="btn-primary on-dark group shrink-0 self-start px-6 py-3.5 sm:self-auto">
            {c.cta}
            <ArrowIcon className="size-4" />
          </TrackedLink>
        </Reveal>
      </div>
    </section>
  );
}
