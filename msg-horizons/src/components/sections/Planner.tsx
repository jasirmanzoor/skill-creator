"use client";

import { AnimatePresence, motion } from "motion/react";
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
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 }, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const } };

  const k = cockpitCopy[lang];
  const cv = coveredCopy[lang];
  const sizing = step === 2;

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

        <div className="mt-6 overflow-hidden rounded-[2rem] bg-surface text-ink shadow-[0_40px_120px_-40px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
          <div className={`grid grid-cols-[minmax(0,1fr)] lg:min-h-[38rem] ${sizing ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"}`}>
            {/* the conversation */}
            <div className="flex min-w-0 flex-col p-5 sm:p-8">
              {step < 4 ? (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <ol aria-label={p.steps.persona.q} className="flex items-center gap-1.5">
                      {k.steps.map((label, i) => {
                        const done = i < step;
                        const here = i === step;
                        return (
                          <li key={label}>
                            <button
                              type="button"
                              disabled={!done}
                              onClick={() => go(i as Step)}
                              aria-current={here ? "step" : undefined}
                              className={`inline-flex items-center gap-2 rounded-full py-1 pe-3 ps-1 text-xs font-semibold transition-colors duration-300 ${
                                here ? "bg-ink text-white" : done ? "bg-brand-soft text-brand hover:bg-brand/15" : "bg-subtle text-muted"
                              }`}
                            >
                              <span className={`grid size-6 place-items-center rounded-full text-[11px] ${here ? "bg-white/20" : done ? "bg-brand text-white" : "bg-line"}`}>
                                {done ? <CheckIcon className="size-3" /> : <span className="num">{i + 1}</span>}
                              </span>
                              <span className={here ? "" : "hidden sm:inline"}>{label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                    <p className="num hidden text-xs text-muted sm:block" aria-live="polite">{fmt(p.stepOf, { n: step + 1, total: TOTAL })}</p>
                  </div>

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={step} {...anim} className="flex-1">
                      <h3 ref={headingRef} tabIndex={-1} className="mt-7 font-display text-2xl font-semibold tracking-[-0.02em] text-ink outline-none sm:text-3xl rtl:tracking-normal">
                        {question.q}
                      </h3>
                      <p className="mt-2 text-muted">{question.hint}</p>

                      <div className="mt-6">
                        {step === 0 && (
                          <div role="radiogroup" aria-label={p.steps.persona.q} className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
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
                          <div role="group" aria-label={p.steps.cargo.q} className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
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
                  </AnimatePresence>

                  <div className="mt-8">
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
      className={`group flex items-start gap-3.5 rounded-2xl border p-4 text-start transition-ui duration-200 ${
        checked ? "border-brand bg-brand-soft shadow-[0_14px_30px_-20px_rgba(19,113,121,0.8)]" : "border-line hover:-translate-y-0.5 hover:border-line-strong hover:bg-paper hover:shadow-[0_14px_30px_-22px_rgba(12,14,17,0.5)]"
      }`}
    >
      <span className={`mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
        checked ? "bg-brand text-white" : "bg-subtle text-ink group-hover:bg-brand-soft group-hover:text-brand"
      }`}>
        <OptionIcon id={icon} className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span className="font-semibold leading-snug text-ink">{title}</span>
          <span aria-hidden="true" className={`mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors ${
            checked ? "border-brand bg-brand text-white" : "border-line-strong"
          }`}>
            {checked ? <CheckIcon className="size-3" /> : null}
          </span>
        </span>
        {desc ? <span className="mt-1 block text-sm leading-snug text-muted">{desc}</span> : null}
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
            className={`min-w-0 flex-1 rounded-full px-2 py-2 text-xs font-semibold leading-tight transition-ui sm:text-sm ${tab === id ? "bg-surface text-ink shadow-[0_1px_3px_rgba(12,14,17,0.15)]" : "text-muted hover:text-ink"}`}
          >
            {k.tabs[id]}
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
