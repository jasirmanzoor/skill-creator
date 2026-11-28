"use client";

/* eslint-disable @next/next/no-img-element -- MSG's own photographs, sized by fit() */

import { goTo } from "@/lib/book";
import { EASE_OUT } from "@/lib/motion";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { lockScroll } from "@/lib/scroller";
import { PLAN_OPEN } from "@/lib/deck";
import {
  PERSONAS, buildPlan, decodePlan, encodePlan,
  type Cargo, type Persona, type PlanInput, type Priority,
} from "@/lib/planner";
import { DEFAULT_SIZER, volumeBand, type SizerInput } from "@/lib/sizer";
import { track } from "@/lib/analytics";
import { fit } from "@/lib/img";
import type { Dictionary, Locale } from "@/content/i18n";
import { usePlan } from "../PlanContext";
import { ArrowIcon } from "../ui/icons";
import { cockpitCopy } from "@/content/cockpit";
import { configuratorCopy, CHAPTER_IDS, CHAPTER_PHOTO, PERSONA_PHOTO } from "@/content/configurator";
import Configurator, { type Step } from "../configurator/Configurator";

/** Starting numbers per persona, so the sizer opens on a realistic picture instead of a blank. */
const PRESET: Record<Persona, Partial<SizerInput>> = {
  seller: { orders: 15, peak: 2, cod: 40 },
  startup: { orders: 60, peak: 2.5, cod: 30 },
  ecommerce: { orders: 600, peak: 2.5, cod: 25, area: "multi" },
  enterprise: { orders: 3000, peak: 2, cod: 15, area: "kingdom", profile: "mixed" },
  platform: { orders: 5000, peak: 1.5, cod: 20, window: "sameday" },
};

/**
 * Build My Plan. The section on the page is the launcher; the configurator itself (components/configurator) opens
 * in its own window over the page: five chapters (business, volume, route, speed, services) and a blueprint.
 * Everything that already worked is kept here unchanged: the answers and their URL (?plan=…, ?persona=…, ?build),
 * the "Build my plan" buttons across the site, the plan engine, the rate card and the hand-off to the contact form.
 */
export default function Planner({ t, lang }: { t: Dictionary; lang: Locale }) {
  const p = t.planner;
  const c = configuratorCopy[lang];
  const { setPlan, seed } = usePlan();
  const [step, setStepRaw] = useState<Step>(0);
  const [reached, setReached] = useState(0);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [cargo, setCargo] = useState<Cargo[]>(["parcels"]);
  const [net, setNet] = useState<SizerInput>(DEFAULT_SIZER);
  const [netTouched, setNetTouched] = useState(false);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const show = () => { opener.current = document.activeElement as HTMLElement | null; setOpen(true); };
  const setStep = (s: Step) => { setStepRaw(s); setReached((r) => Math.max(r, Math.min(s, 4))); };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = decodePlan(params.get("plan"));
    // Service landing pages link here with ?persona=… so the planner opens on the right path.
    const start = params.get("persona");
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from the URL */
    if (shared) {
      setPersona(shared.persona);
      setCargo(shared.cargo.length ? shared.cargo : ["parcels"]);
      if (shared.net) { setNet(shared.net); setNetTouched(true); }
      setPriorities(shared.priorities);
      setStepRaw(5);
      setReached(4);
      setOpen(true);
    } else if (start && (PERSONAS as readonly string[]).includes(start)) {
      setPersona(start as Persona);
      setNet({ ...DEFAULT_SIZER, ...PRESET[start as Persona] });
      setStepRaw(1);
      setReached(1);
      setOpen(true);
    } else if (params.has("build")) {
      setOpen(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const [seenSeed, setSeenSeed] = useState(0);
  if (seed && seed.n !== seenSeed) {
    setSeenSeed(seed.n);
    setPersona(seed.persona);
    if (!netTouched) setNet({ ...DEFAULT_SIZER, ...PRESET[seed.persona] });
    setStepRaw(1);
    setReached((r) => Math.max(r, 1));
    setOpen(true);
    track("planner_step", { step: 1, value: seed.persona });
  }

  // "Build my plan" anywhere on the page opens the window (buttons marked data-plan-open, or the PLAN_OPEN signal)
  useEffect(() => {
    const onSignal = () => show();
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("[data-plan-open]");
      if (!a) return;
      e.preventDefault();
      e.stopPropagation();
      show();
    };
    window.addEventListener(PLAN_OPEN, onSignal);
    document.addEventListener("click", onClick, true);
    return () => { window.removeEventListener(PLAN_OPEN, onSignal); document.removeEventListener("click", onClick, true); };
  }, []);

  // while the window is open the page behind it stays still; Escape closes it and focus goes back where it was
  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    window.setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 50);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
      opener.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  // every chapter, and the blueprint, starts at the top: nothing arrives out of sight
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    scroller.current?.scrollTo({ top: 0, behavior: "auto" });
    window.setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 60);
  }, [step]);

  const volume = volumeBand(net.orders);
  const input: PlanInput | null = persona ? { persona, cargo, volume, priorities, net } : null;
  const liveInput: PlanInput | null = persona
    ? { persona, cargo, volume: step >= 2 || netTouched ? volume : "starting", priorities, ...(step >= 2 || netTouched ? { net } : {}) }
    : null;

  const onPersona = (k: Persona) => {
    setPersona(k);
    if (!netTouched) setNet({ ...DEFAULT_SIZER, ...PRESET[k] });
    track("planner_step", { step: 1, value: k });
  };
  const onNet = (v: SizerInput) => { setNet(v); setNetTouched(true); };

  const finish = () => {
    if (!persona) return;
    const i: PlanInput = { persona, cargo, volume: volumeBand(net.orders), priorities, net };
    const built = buildPlan(i);
    track("planner_complete", { model: built.model, modules: built.modules.map((m) => m.id).join(",") });
    const url = new URL(window.location.href);
    url.searchParams.set("plan", encodePlan(i));
    url.hash = "planner";
    window.history.replaceState(null, "", url);
    setStep(5);
  };

  const restart = () => {
    setPersona(null); setCargo(["parcels"]); setPriorities([]); setNet(DEFAULT_SIZER); setNetTouched(false); setReached(0);
    const url = new URL(window.location.href);
    url.searchParams.delete("plan");
    window.history.replaceState(null, "", url);
    setStepRaw(0);
  };

  const sendToContact = () => {
    if (!input) return;
    setPlan(input);
    track("plan_share", { channel: "form" });
    setOpen(false);
    goTo("contact");
    window.setTimeout(() => document.getElementById("lead-name")?.focus({ preventScroll: true }), 700);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      track("plan_share", { channel: "copy" });
      window.setTimeout(() => setCopied(false), 2200);
    } catch { /* clipboard unavailable */ }
  };

  const plan = input && step === 5 ? buildPlan(input) : null;
  const hero = CHAPTER_PHOTO.profile;

  return (
    <section id="planner" aria-labelledby="planner-title" className="relative scroll-mt-16 py-8 text-white lg:py-10">
      <div className="mx-auto max-w-[88rem] px-5 lg:px-8">
        {/* the launcher: MSG's hub, the promise, the five chapters and two ways in */}
        <div className="grid overflow-hidden rounded-[1.75rem] bg-[#0b0f17] ring-1 ring-white/10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="relative min-h-[18rem] lg:min-h-[34rem]">
            <img src={hero.src} {...fit(hero.src, "(min-width: 1024px) 45vw, 100vw")} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" style={{ objectPosition: hero.pos }} />
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-[#0b0f17]/55 to-[#0b0f17]/10" />
            <div className="relative flex h-full flex-col justify-end p-6 sm:p-10">
              <p className="lbl-cfg flex items-center gap-2.5 text-white/80"><span aria-hidden="true" className="h-3 w-px rotate-[20deg] bg-[#009df8]" />{c.eyebrow}</p>
              <h2 id="planner-title" className="mt-4 font-display text-[clamp(2rem,4.2vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-balance rtl:leading-[1.3] rtl:tracking-normal">{c.launchTitle}</h2>
            </div>
          </div>
          <div className="flex flex-col p-6 sm:p-10">
            <p className="max-w-xl text-lg text-white/75 text-pretty">{c.launchLead}</p>
            <ol className="mt-7 grid grid-cols-5 gap-1.5" aria-label={c.product}>
              {CHAPTER_IDS.map((cid, i) => (
                <li key={cid} className="min-w-0">
                  <span aria-hidden="true" className="block h-[3px] rounded-full bg-white/15" />
                  <span className="mt-2.5 block text-[11px] font-semibold leading-tight text-white/70"><span className="num text-[#7fcbfb]">0{i + 1}</span><span className="block truncate max-sm:hidden">{c.chapters[cid].label}</span></span>
                </li>
              ))}
            </ol>
            <button type="button" onClick={() => { track("cta_click", { cta: "plan", location: "planner_launch" }); show(); }}
              className="mt-8 inline-flex h-13 items-center justify-center gap-2 self-start rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-[#0b0f17] transition-colors hover:bg-[#dff1ff]">
              {plan ? t.planner.result.models[plan.model].name : c.start} <ArrowIcon className="size-4 rtl:-scale-x-100" />
            </button>
            <p className="mt-9 text-sm font-semibold text-white/70">{cockpitCopy[lang].launch}</p>
            <div role="group" aria-label={p.steps.persona.q} className="mt-3 grid gap-2 sm:grid-cols-2">
              {PERSONAS.map((k2) => {
                const ph = PERSONA_PHOTO[k2];
                return (
                  <button key={k2} type="button"
                    onClick={() => { onPersona(k2); setStep(1); show(); }}
                    className="group flex items-center gap-3 rounded-xl p-2 pe-3 text-start ring-1 ring-white/12 transition-colors hover:bg-white/[0.05] hover:ring-white/30">
                    <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">
                      <img src={ph.src} {...fit(ph.src, "56px")} alt="" loading="lazy" decoding="async" className="size-full object-cover" style={{ objectPosition: ph.pos }} />
                    </span>
                    <span className="min-w-0 text-sm font-semibold leading-tight">{p.steps.persona.options[k2].t}</span>
                    <ArrowIcon className="ms-auto size-3.5 shrink-0 text-white/40 transition-colors group-hover:text-white rtl:-scale-x-100" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {open && typeof document !== "undefined"
        ? createPortal(
            <motion.div id="plan-window" role="dialog" aria-modal="true" aria-labelledby="plan-window-title" className="fixed inset-0 z-[100]"
              initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, ease: EASE_OUT }}>
              <Configurator
                t={t} lang={lang} reduce={reduce} step={step} setStep={setStep} reached={reached}
                persona={persona} onPersona={onPersona} cargo={cargo} setCargo={setCargo} net={net} onNet={onNet}
                priorities={priorities} setPriorities={setPriorities} input={input} liveInput={liveInput}
                onFinish={finish} onClose={() => setOpen(false)} onRestart={restart} onSend={sendToContact} onCopy={copyLink} copied={copied}
                headingRef={headingRef} scroller={scroller}
              />
            </motion.div>,
            document.body,
          )
        : null}
    </section>
  );
}

