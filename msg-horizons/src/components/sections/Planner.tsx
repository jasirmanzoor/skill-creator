"use client";

import { goTo } from "@/lib/book";
import { EASE_OUT } from "@/lib/motion";
import NumberFlow from "@number-flow/react";
import { motion } from "motion/react";
import { approxCost } from "@/lib/estimate";
import { RiyadhClock } from "../hero/Command";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useEffect, useRef, useState } from "react";
import {
  CARGO, PERSONAS, PRIORITIES, buildPlan, decodePlan, encodePlan,
  type Cargo, type Persona, type PlanInput, type Priority,
} from "@/lib/planner";
import { DEFAULT_SIZER, volumeBand, type SizerInput } from "@/lib/sizer";
import { sizerCopy } from "@/content/sizerCopy";
import { planSummary } from "@/lib/plan-summary";
import { track } from "@/lib/analytics";
import { whatsappLink } from "@/content/facts";
import { fmt, type Dictionary, type Locale } from "@/content/i18n";
import { usePlan } from "../PlanContext";
import { ArrowIcon, CheckIcon, OptionIcon, ServiceIcon, WhatsAppIcon } from "../ui/icons";
import PlanStage from "../planner/PlanStage";
import PlanModules from "../planner/PlanPreview";
import { cockpitCopy } from "@/content/cockpit";
import { coveredCopy } from "@/content/covered";
import { SizerControls } from "../planner/Sizer";
import { MustList, Pillars, QuoteBlock } from "../planner/Covered";

/** Starting numbers per persona, so the sizer opens on a realistic picture instead of a blank. */
const PRESET: Record<Persona, Partial<SizerInput>> = {
  seller: { orders: 15, peak: 2, cod: 40 },
  startup: { orders: 60, peak: 2.5, cod: 30 },
  ecommerce: { orders: 600, peak: 2.5, cod: 25, area: "multi" },
  enterprise: { orders: 3000, peak: 2, cod: 15, area: "kingdom", profile: "mixed" },
  platform: { orders: 5000, peak: 1.5, cod: 20, window: "sameday" },
};

type Step = 0 | 1 | 2 | 3 | 4;
const TOTAL = 4;

export default function Planner({ t, lang }: { t: Dictionary; lang: Locale }) {
  const p = t.planner;
  const { setPlan, seed } = usePlan();
  const [step, setStep] = useState<Step>(0);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [cargo, setCargo] = useState<Cargo[]>([]);
  const [net, setNet] = useState<SizerInput>(DEFAULT_SIZER);
  const [netTouched, setNetTouched] = useState(false);
  const volume = step >= 2 || netTouched ? volumeBand(net.orders) : null;
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = decodePlan(params.get("plan"));
    // Service landing pages link here with ?persona=… so the planner opens on the right path.
    const start = params.get("persona");
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from the URL */
    if (shared) {
      setPersona(shared.persona);
      setCargo(shared.cargo);
      if (shared.net) { setNet(shared.net); setNetTouched(true); }
      setPriorities(shared.priorities);
      setStep(4);
    } else if (start && (PERSONAS as readonly string[]).includes(start)) {
      setPersona(start as Persona);
      setNet({ ...DEFAULT_SIZER, ...PRESET[start as Persona] });
      setStep(1);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const [seenSeed, setSeenSeed] = useState(0);
  if (seed && seed.n !== seenSeed) {
    setSeenSeed(seed.n);
    setPersona(seed.persona);
    if (!netTouched) setNet({ ...DEFAULT_SIZER, ...PRESET[seed.persona] });
    setStep(1);
    track("planner_step", { step: 1, value: seed.persona });
  }

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const input: PlanInput | null = persona && volume ? { persona, cargo, volume, priorities, net } : null;
  const liveInput: PlanInput | null = persona
    ? { persona, cargo, volume: volume ?? "starting", priorities, ...(volume ? { net } : {}) }
    : null;
  const plan = input ? buildPlan(input) : null;

  const go = (s: Step, detail?: string) => {
    track("planner_step", { step: s, value: detail ?? "" });
    setStep(s);
  };

  const finish = () => {
    if (!persona) return;
    const i: PlanInput = { persona, cargo, volume: volumeBand(net.orders), priorities, net };
    const built = buildPlan(i);
    track("planner_complete", { model: built.model, modules: built.modules.map((m) => m.id).join(",") });
    const url = new URL(window.location.href);
    url.searchParams.set("plan", encodePlan(i));
    url.hash = "planner";
    window.history.replaceState(null, "", url);
    setStep(4);
  };

  const restart = () => {
    setPersona(null); setCargo([]); setPriorities([]); setNet(DEFAULT_SIZER); setNetTouched(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("plan");
    window.history.replaceState(null, "", url);
    setStep(0);
  };

  const sendToContact = () => {
    if (!input) return;
    setPlan(input);
    track("plan_share", { channel: "form" });
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

  const toggle = <T,>(list: T[], v: T, max = 99) =>
    list.includes(v) ? list.filter((x) => x !== v) : list.length >= max ? list : [...list, v];

  const stepKeys = ["persona", "cargo", "volume", "priorities"] as const;
  const sz = sizerCopy[lang];
  const question = step === 2 ? { q: sz.title, hint: sz.hint } : p.steps[stepKeys[Math.min(step, 3) as 0 | 1 | 2 | 3]];
  const onNet = (v: SizerInput) => { setNet(v); setNetTouched(true); };
  const anim = reduce
    ? {}
    : { initial: { opacity: 0, transform: "translateY(10px)" }, animate: { opacity: 1, transform: "translateY(0px)" }, transition: { duration: 0.24, ease: EASE_OUT } };

  const k = cockpitCopy[lang];
  const cv = coveredCopy[lang];
  const sizing = step === 2;
  // the four answers so far: who you are, what you move (once past it), your numbers, what matters
  const answered = (persona ? 1 : 0) + (step > 1 || cargo.length ? 1 : 0) + (step > 2 || netTouched ? 1 : 0) + (priorities.length ? 1 : 0);

  return (
    <section id="planner" aria-labelledby="planner-title" className="relative scroll-mt-16 py-8 text-white lg:py-10">
      <div className="mx-auto max-w-[88rem] px-5 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <span className="label on-dark">{p.eyebrow}</span>
            <h2 id="planner-title" className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-4xl rtl:leading-[1.3] rtl:tracking-normal">
              {p.title}
            </h2>
          </div>
          <p className="max-w-xl text-lg text-white/75 text-pretty lg:justify-self-end">{p.lead}</p>
        </div>

        {/* the plan builder as MSG's console: a light runs round its edge while it waits for answers */}
        <div className="relative mt-6 rounded-[2.25rem] p-px shadow-[0_50px_140px_-50px_rgba(0,0,0,0.85)]">
          <div aria-hidden="true" className="plan-glow absolute inset-0 rounded-[2.25rem]" />
          <div className="relative rounded-[calc(2.25rem-1px)] bg-[linear-gradient(160deg,#123d44,#0a2629)] p-1.5 ring-1 ring-white/10 sm:p-2">
            <div className="flex items-center gap-3 px-3 pb-2 pt-1 text-white">
              <span aria-hidden="true" className="flex gap-1.5"><span className="size-2.5 rounded-full bg-white/25" /><span className="size-2.5 rounded-full bg-white/25" /><span className="size-2.5 rounded-full bg-brand-bright/80" /></span>
              <span className="truncate text-[12px] font-semibold text-white/85">{k.console}</span>
              <span className="ms-auto hidden items-center gap-2 rounded-full bg-white/[0.08] px-2.5 py-1 text-[11px] font-semibold text-white/85 ring-1 ring-white/10 sm:inline-flex">
                <span className={`size-1.5 rounded-full ${step === 4 ? "bg-brand-bright" : "bg-white/50"}`} />
                {plan && step === 4 ? t.planner.result.models[plan.model].name : k.draft}
              </span>
              <span className="max-sm:ms-auto"><RiyadhClock label={lang === "ar" ? "الرياض" : "Riyadh"} /></span>
            </div>
        <div className="overflow-hidden rounded-[1.75rem] bg-surface text-ink">
          <div className={`grid grid-cols-[minmax(0,1fr)] lg:min-h-[38rem] ${sizing ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"}`}>
            {/* the conversation */}
            <div className="flex min-w-0 flex-col p-5 sm:p-8">
              {step < 4 ? (
                <>
                  {/* the path through the four questions: the line fills to where you are */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="relative min-w-0 flex-1 max-w-md">
                      <span aria-hidden="true" className="absolute inset-x-3 top-3 h-0.5 rounded-full bg-line" />
                      <span aria-hidden="true" className="absolute inset-x-3 top-3 h-0.5 origin-left rounded-full bg-brand transition-transform duration-500 ease-[cubic-bezier(.23,1,.32,1)] rtl:origin-right" style={{ transform: `scaleX(${step / (TOTAL - 1)})` }} />
                      <ol aria-label={p.steps.persona.q} className="relative grid grid-cols-4">
                        {k.steps.map((label, i) => {
                          const done = i < step;
                          const here = i === step;
                          return (
                            <li key={label} className={i === 0 ? "justify-self-start" : i === TOTAL - 1 ? "justify-self-end" : "justify-self-center"}>
                              <button
                                type="button"
                                disabled={!done}
                                onClick={() => go(i as Step)}
                                aria-current={here ? "step" : undefined}
                                className={`group flex flex-col items-center gap-1.5 text-[11px] font-semibold transition-colors duration-300 sm:text-xs ${here ? "text-ink" : done ? "text-brand hover:text-brand-strong" : "text-muted"}`}
                              >
                                <span className={`relative grid size-6 place-items-center rounded-full text-[11px] transition-[background-color,box-shadow,color] duration-300 ${
                                  here ? "bg-ink text-white shadow-[0_0_0_4px_rgba(12,14,17,0.08)]" : done ? "bg-brand text-white" : "bg-surface text-muted ring-2 ring-line"
                                }`}>
                                  {here ? <span aria-hidden="true" className="plan-ping absolute inset-0 rounded-full bg-ink/30" /> : null}
                                  <span className="relative">{done ? <CheckIcon className="size-3" /> : <span className="num">{i + 1}</span>}</span>
                                </span>
                                <span className={here ? "" : "max-sm:sr-only"}>{label}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                    <p className="num hidden pt-1 text-xs text-muted sm:block" aria-live="polite">{fmt(p.stepOf, { n: step + 1, total: TOTAL })}</p>
                  </div>

                  {/* each step simply arrives: nothing waits on the previous one leaving, so quick clicks can never strand the panel */}
                    <motion.div key={step} {...anim} className="flex-1">
                      <h3 ref={headingRef} tabIndex={-1} className="mt-7 font-display text-2xl font-semibold tracking-[-0.02em] text-ink outline-none sm:text-3xl rtl:tracking-normal">
                        {question.q}
                      </h3>
                      <p className="mt-2 text-muted">{question.hint}</p>

                      <div className="mt-6">
                        {step === 0 && (
                          <div role="radiogroup" aria-label={p.steps.persona.q} className="grid grid-cols-2 gap-2">
                            {PERSONAS.map((k2) => (
                              <Option key={k2} role="radio" icon={k2} checked={persona === k2}
                                title={p.steps.persona.options[k2].t} desc={p.steps.persona.options[k2].d}
                                onClick={() => {
                                  setPersona(k2);
                                  if (!netTouched) setNet({ ...DEFAULT_SIZER, ...PRESET[k2] });
                                  go(1, k2);
                                }} />
                            ))}
                          </div>
                        )}
                        {step === 1 && (
                          <div role="group" aria-label={p.steps.cargo.q} className="grid grid-cols-2 gap-2">
                            {CARGO.map((k2) => (
                              <Option key={k2} role="checkbox" icon={k2} checked={cargo.includes(k2)}
                                title={p.steps.cargo.options[k2].t} desc={p.steps.cargo.options[k2].d}
                                onClick={() => setCargo((c) => toggle(c, k2))} />
                            ))}
                          </div>
                        )}
                        {step === 2 && (
                          <>
                            <SizerControls value={net} onChange={onNet} lang={lang} wide />
                            {/* below lg the quote sits under the controls */}
                            <div className="mt-8 border-t border-line pt-6 lg:hidden">
                              <QuoteBlock net={net} lang={lang} />
                            </div>
                          </>
                        )}
                        {step === 3 && (
                          <div role="group" aria-label={p.steps.priorities.q} className="flex flex-wrap gap-2">
                            {PRIORITIES.map((k2) => {
                              const on = priorities.includes(k2);
                              const disabled = !on && priorities.length >= 3;
                              return (
                                <button
                                  key={k2}
                                  type="button"
                                  role="checkbox"
                                  aria-checked={on}
                                  aria-disabled={disabled}
                                  onClick={() => !disabled && setPriorities((c) => toggle(c, k2, 3))}
                                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors ${
                                    on
                                      ? "border-brand bg-brand text-white"
                                      : disabled
                                        ? "cursor-not-allowed border-line text-muted"
                                        : "border-line-strong text-ink hover:border-ink"
                                  }`}
                                >
                                  {on ? <CheckIcon className="size-4" /> : null}
                                  {p.steps.priorities.options[k2].t}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>

                  {/* the plan building itself: how far along it is, the price once the numbers are in, and the services it has switched on */}
                  <div className="mt-8 rounded-2xl border border-line bg-paper/60 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <BuiltRing value={answered / TOTAL} />
                      <p className="text-sm font-semibold text-ink">
                        <span className="num">{fmt(k.built, { n: Math.round((answered / TOTAL) * 100) })}</span>
                      </p>
                      {step === 3 ? <LiveEstimate net={net} lang={lang} label={k.estimate} reduce={reduce} /> : null}
                    </div>
                    <PlanModules t={t} input={liveInput} label={k.setup} />
                  </div>

                  <div className={`mt-6 flex items-center justify-between gap-3 ${step === 0 ? "hidden" : ""}`}>
                    <button type="button" onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))} className="rounded-full px-4 py-2.5 text-sm text-muted transition-colors hover:text-ink">
                      {p.back}
                    </button>
                    {step === 1 && (
                      <button type="button" onClick={() => go(2, cargo.join(".") || "parcels")} className="btn-primary px-6 py-3">
                        {p.next} <ArrowIcon />
                      </button>
                    )}
                    {step === 2 && (
                      <button type="button" onClick={() => go(3, String(net.orders))} className="btn-primary px-6 py-3">
                        {p.next} <ArrowIcon />
                      </button>
                    )}
                    {step === 3 && (
                      <button type="button" onClick={finish} className="btn-primary px-6 py-3">
                        {p.build} <ArrowIcon />
                      </button>
                    )}
                  </div>
                </>
              ) : plan && input ? (
                <motion.div {...anim} className="flex flex-1 flex-col">
                  <Result t={t} lang={lang} input={input} plan={plan} headingRef={headingRef} onRestart={restart} onSend={sendToContact} onCopy={copyLink} copied={copied} />
                </motion.div>
              ) : null}
            </div>

            {/* the evidence: the network that is being configured, running live */}
            {sizing ? (
              <aside aria-label={cv.ui.quoteTitle} className="hidden border-s border-line bg-paper p-8 lg:block">
                <div className="lg:sticky lg:top-24">
                  <QuoteBlock net={net} lang={lang} />
                  <p className="mb-3 mt-7 text-xs font-semibold uppercase tracking-[0.12em] text-muted rtl:tracking-normal">{cv.ui.included}</p>
                  <MustList lang={lang} compact />
                </div>
              </aside>
            ) : (
              <div className="min-h-[24rem] border-t border-line lg:border-s lg:border-t-0">
                <PlanStage locale={lang} input={liveInput} complete={step === 4} compact />
              </div>
            )}
          </div>
        </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Option({
  role, checked, title, desc, icon, onClick,
}: { role: "radio" | "checkbox"; checked: boolean; title: string; desc: string; icon: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={checked}
      onClick={onClick}
      onPointerMove={(e) => {
        // a soft light follows the pointer across the tile
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      data-press="soft"
      title={desc || undefined}
      className={`group relative isolate flex min-h-[3.5rem] items-center gap-2.5 overflow-hidden rounded-xl border bg-surface px-2.5 py-2 text-start transition-ui duration-200 sm:gap-3 sm:px-3 ${
        checked
          ? "border-brand bg-brand-soft/60 shadow-[0_0_0_1px_var(--color-brand),0_16px_32px_-22px_rgba(11,125,54,0.7)]"
          : "border-line-strong/70 hover:-translate-y-0.5 hover:border-ink/40 hover:shadow-[var(--shadow-card)]"
      }`}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 [background:radial-gradient(140px_circle_at_var(--mx,50%)_var(--my,50%),rgba(19,113,121,0.13),transparent_70%)] group-hover:opacity-100" />
      <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
        checked ? "bg-brand text-white" : "bg-subtle text-ink-3 group-hover:bg-ink group-hover:text-white"
      }`}>
        <OptionIcon id={icon} className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-sm font-semibold leading-tight tracking-[-0.01em] text-ink sm:text-[15px] rtl:tracking-normal">{title}</span>
        {/* compact: the description stays for screen readers and as a tooltip */}
        {desc ? <span className="sr-only">{desc}</span> : null}
      </span>
      {/* a square for "pick any", a circle for "pick one" */}
      <span aria-hidden="true" className={`inline-flex size-5 shrink-0 items-center justify-center border-2 transition-colors ${role === "checkbox" ? "rounded-md" : "rounded-full"} ${
        checked ? "border-brand bg-brand text-white" : "border-line-strong bg-surface group-hover:border-ink/50"
      }`}>
        {checked ? <CheckIcon className="size-3.5 motion-safe:animate-[opt-pop_0.35s_var(--ease-out)]" /> : null}
      </span>
    </button>
  );
}

type TabId = "quote" | "handled" | "services" | "next";

function Result({
  t, lang, input, plan, headingRef, onRestart, onSend, onCopy, copied,
}: {
  t: Dictionary;
  lang: Locale;
  input: PlanInput;
  plan: ReturnType<typeof buildPlan>;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onRestart: () => void;
  onSend: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  const r = t.planner.result;
  const model = r.models[plan.model];
  const summary = planSummary(t, input, lang);
  const net = input.net ?? DEFAULT_SIZER;
  const cv = coveredCopy[lang];
  const k = cockpitCopy[lang];
  const [tab, setTab] = useState<TabId>("quote");
  const ids: TabId[] = ["quote", "handled", "services", "next"];
  const onTabKey = (e: React.KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    const rtl = lang === "ar" ? -1 : 1;
    const next = ids[(ids.indexOf(tab) + d * rtl + ids.length) % ids.length];
    setTab(next);
    document.getElementById(`plan-tab-${next}`)?.focus();
    e.preventDefault();
  };
  return (
    <>
      <span className="label">{r.eyebrow}</span>
      <h3 ref={headingRef} tabIndex={-1} className="mt-2 font-display text-4xl font-semibold tracking-[-0.03em] text-ink outline-none rtl:tracking-normal">
        {model.name}
      </h3>
      <p className="mt-2 text-muted">{model.desc}</p>

      <div role="tablist" aria-label={k.tabsLabel} onKeyDown={onTabKey} className="mt-6 flex gap-1 rounded-full bg-subtle p-1">
        {ids.map((id) => (
          <button
            key={id}
            id={`plan-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={tab === id}
            aria-controls="plan-tabpanel"
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}
            className={`relative min-w-0 flex-1 rounded-full px-2 py-2 text-xs font-semibold leading-tight transition-colors sm:text-sm ${tab === id ? "text-ink" : "text-muted hover:text-ink"}`}
          >
            {tab === id ? <motion.span layoutId="plan-tab" transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-0 rounded-full bg-surface shadow-[0_1px_3px_rgba(12,14,17,0.15)]" /> : null}
            <span className="relative">{k.tabs[id]}</span>
          </button>
        ))}
      </div>

      <div id="plan-tabpanel" role="tabpanel" aria-labelledby={`plan-tab-${tab}`} className="mt-5 flex-1">
        {tab === "quote" && (
          <>
            <QuoteBlock net={net} lang={lang} />
            <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-muted rtl:tracking-normal">{cv.ui.included}</p>
            <MustList lang={lang} />
          </>
        )}
        {tab === "handled" && <Pillars lang={lang} />}
        {tab === "services" && (
          <>
            <ol className="divide-y divide-line border-y border-line">
              {plan.modules.map((m) => {
                const s = t.planner.services[m.id];
                const reasons = m.reasons.map((x) => t.planner.reasons[x]).filter(Boolean);
                return (
                  <li key={m.id} className="flex items-start gap-3.5 py-3.5">
                    <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg ${m.core ? "bg-brand text-white" : "bg-brand-soft text-brand"}`}>
                      <ServiceIcon id={m.id} className="size-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-ink">{s.name}</h4>
                        <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${m.core ? "bg-ink text-white" : "bg-subtle text-muted"}`}>
                          {m.core ? r.core : r.addon}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted">{s.desc}</p>
                      {reasons.length ? <p className="mt-1 text-sm text-brand">{reasons.join(" · ")}</p> : null}
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="mt-4 border-s-2 border-brand ps-4 text-sm text-muted">{r.noPricing}</p>
          </>
        )}
        {tab === "next" && (
          <>
            <h4 className="mb-4 font-display text-lg font-semibold text-ink">{r.nextTitle}</h4>
            <ol className="space-y-4">
              {r.next.map((n, i) => (
                <li key={n.t} className="flex gap-4">
                  <span className="num inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line-strong text-sm font-medium text-ink">{i + 1}</span>
                  <div>
                    <p className="font-medium text-ink">{n.t}</p>
                    <p className="text-sm text-muted">{n.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>

      <div className="mt-6 grid gap-2.5 border-t border-line pt-5 sm:grid-cols-2">
        <button type="button" onClick={onSend} className="btn-primary px-5 py-3 sm:col-span-2">
          {r.send} <ArrowIcon />
        </button>
        <a
          href={whatsappLink(`${t.wa.planIntro}\n\n${summary}`)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { track("plan_share", { channel: "whatsapp" }); track("whatsapp_click", { location: "planner" }); }}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-surface px-5 py-3 font-medium text-ink transition-colors hover:border-ink sm:col-span-2"
        >
          <WhatsAppIcon className="size-5 text-whatsapp" /> {r.whatsapp}
        </a>
        <div className="flex items-center justify-between gap-3 text-sm sm:col-span-2">
          <button type="button" onClick={onCopy} className="text-muted underline-offset-4 hover:text-ink hover:underline">
            <span aria-live="polite">{copied ? r.copied : r.copy}</span>
          </button>
          <button type="button" onClick={onRestart} className="text-muted underline-offset-4 hover:text-ink hover:underline">
            {t.planner.restart}
          </button>
        </div>
      </div>
    </>
  );
}

/** how much of the plan is built, as a ring that closes with each answer */
function BuiltRing({ value }: { value: number }) {
  const C = 2 * Math.PI * 15;
  return (
    <svg viewBox="0 0 36 36" className="size-9 shrink-0 -rotate-90" aria-hidden="true">
      <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-line)" strokeWidth="3.5" />
      <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-brand)" strokeWidth="3.5" strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C * (1 - value)} className="transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(.23,1,.32,1)]" />
    </svg>
  );
}

/** the approximate price per order at the visitor's numbers, carried on once the volume step is done */
function LiveEstimate({ net, lang, label, reduce }: { net: SizerInput; lang: Locale; label: string; reduce: boolean }) {
  const cost = approxCost(net);
  const ar = lang === "ar";
  return (
    <aside data-rate-card aria-label={label} className="ms-auto text-end">
      <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-brand rtl:tracking-normal">{label}</span>
      <span className="flex items-baseline justify-end gap-1 font-display font-semibold text-ink">
        <span className="text-xs text-ink/70">≈</span>
        {ar ? null : <span className="text-xs text-ink/70">SAR</span>}
        <span className="num text-xl" dir="ltr">{reduce ? cost.perOrder : <NumberFlow value={cost.perOrder} locales="en-US" />}</span>
        {ar ? <span className="text-xs text-ink/70">ريال</span> : null}
      </span>
    </aside>
  );
}
