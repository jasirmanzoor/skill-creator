"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/i18n";
import { liveCopy } from "@/content/liveTracking";
import { track } from "@/lib/analytics";
import { useReducedMotion } from "@/lib/use-reduced-motion";
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
      aria-labelledby="live-title"
      className="relative scroll-mt-16 py-8 text-white lg:py-10"
    >

      <div className="relative mx-auto max-w-[88rem] px-5 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12">
          <div>
            <span className="label on-dark">{c.eyebrow}</span>
            <h2 id="live-title" className="h-section mt-3">
              {c.title}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/75 text-pretty">{c.lead}</p>

            <ol aria-label={c.stepsLabel} className="mt-7 space-y-5">
              {c.steps.map((s, i) => {
                const st = stepState(i);
                return (
                  <li
                    key={s.t}
                    aria-current={st === "active" ? "step" : undefined}
                    className="relative flex gap-4 before:absolute before:start-[17px] before:top-11 before:-bottom-5 before:w-px before:bg-white/15 last:before:hidden"
                  >
                    <span
                      className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold transition-colors duration-500 ${
                        st === "done" ? "bg-brand-bright text-deep" : st === "active" ? "border-2 border-brand-bright bg-deep text-brand-bright" : "border border-white/25 bg-deep text-white/60"
                      }`}
                    >
                      {st === "active" ? <span className="plan-ping absolute inset-0 rounded-full bg-brand-bright/40 motion-reduce:hidden" aria-hidden="true" /> : null}
                      {st === "done" ? <CheckIcon className="relative size-4" /> : <span className="num relative">{i + 1}</span>}
                    </span>
                    <span>
                      <span className={`block font-display text-lg font-semibold leading-snug transition-colors duration-500 ${st === "todo" ? "text-white/60" : "text-white"}`}>{s.t}</span>
                      <span className={`mt-0.5 block text-sm leading-relaxed transition-colors duration-500 ${st === "todo" ? "text-white/55" : "text-white/75"}`}>{s.d}</span>
                    </span>
                  </li>
                );
              })}
            </ol>

            <TrackedLink href="#planner" event="cta_click" props={{ cta: "plan", location: "live_tracking" }} className="btn-primary on-dark group mt-8 inline-flex px-6 py-3.5">
              {c.cta}
              <ArrowIcon className="size-4" />
            </TrackedLink>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm sm:p-8">
            <div ref={stage} className="flex flex-col items-center xl:flex-row xl:justify-center">
              <div className="relative pb-10">
                <DriverPhone c={c} live={live} reduce={reduce} onApprove={approve} onReplay={replay} />
                <p
                  aria-hidden={live}
                  className={`absolute inset-x-0 top-[calc(100%-1.75rem)] text-center text-[13px] font-semibold text-brand-bright transition-opacity duration-500 ${live ? "opacity-0" : "opacity-100"}`}
                >
                  {c.tryIt}
                </p>
              </div>

              {/* the signal: nothing travels until the driver approves */}
              <div aria-hidden="true" className="relative hidden h-px w-[3.5rem] shrink-0 xl:block">
                <span className={`absolute inset-0 border-t-2 border-dashed transition-colors duration-700 ${live ? "border-brand-bright" : "border-white/25"}`} />
                {live ? [0, 1, 2].map((i) => <span key={i} className="sig-x absolute -top-[3px] start-0 size-2 rounded-full bg-brand-bright motion-reduce:hidden" style={{ animationDelay: `${i * 0.5}s` }} />) : null}
              </div>
              <div aria-hidden="true" className="relative h-14 w-px shrink-0 xl:hidden">
                <span className={`absolute inset-0 border-s-2 border-dashed transition-colors duration-700 ${live ? "border-brand-bright" : "border-white/25"}`} />
                {live ? [0, 1, 2].map((i) => <span key={i} className="sig-y absolute -start-[3px] top-0 size-2 rounded-full bg-brand-bright motion-reduce:hidden" style={{ animationDelay: `${i * 0.45}s` }} />) : null}
              </div>

              <div className="w-full max-w-[34rem] xl:max-w-none xl:flex-1">
                <TrackerCard c={c} live={live} reduce={reduce} />
              </div>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-white/65">{c.note}</p>
            <p className="sr-only" aria-live="polite">{live ? c.announce.live : c.announce.waiting}</p>
          </div>
        </div>

        <div className="mt-8">
          <ScanVsLive c={c} />
        </div>
      </div>
    </section>
  );
}
