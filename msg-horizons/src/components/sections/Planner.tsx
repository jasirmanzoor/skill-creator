"use client";

import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useEffect, useRef, useState } from "react";
import {
  CARGO, PERSONAS, PRIORITIES, VOLUMES, buildPlan, decodePlan, encodePlan,
  type Cargo, type Persona, type PlanInput, type Priority, type Volume,
} from "@/lib/planner";
import { planSummary } from "@/lib/plan-summary";
import { track } from "@/lib/analytics";
import { facts, whatsappLink } from "@/content/facts";
import { fmt, type Dictionary } from "@/content/i18n";
import { usePlan } from "../PlanContext";
import { ArrowIcon, CheckIcon, OptionIcon, ServiceIcon, WhatsAppIcon } from "../ui/icons";

type Step = 0 | 1 | 2 | 3 | 4; // 4 = result
const TOTAL = 4;

export default function Planner({ t }: { t: Dictionary }) {
  const p = t.planner;
  const { setPlan, seed } = usePlan();
  const [step, setStep] = useState<Step>(0);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [cargo, setCargo] = useState<Cargo[]>([]);
  const [volume, setVolume] = useState<Volume | null>(null);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const reduce = useReducedMotion();

  // Restore a shared plan from ?plan=
  useEffect(() => {
    const shared = decodePlan(new URLSearchParams(window.location.search).get("plan"));
    if (shared) {
      /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from the URL */
      setPersona(shared.persona);
      setCargo(shared.cargo);
      setVolume(shared.volume);
      setPriorities(shared.priorities);
      setStep(4);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, []);

  // Hero quick-start: persona chosen outside the planner.
  const [seenSeed, setSeenSeed] = useState(0);
  if (seed && seed.n !== seenSeed) {
    setSeenSeed(seed.n);
    setPersona(seed.persona);
    setStep(1);
    track("planner_step", { step: 1, value: seed.persona });
  }

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const input: PlanInput | null = persona && volume ? { persona, cargo, volume, priorities } : null;
  const plan = input ? buildPlan(input) : null;

  const go = (s: Step, detail?: string) => {
    track("planner_step", { step: s, value: detail ?? "" });
    setStep(s);
  };

  const finish = () => {
    if (!persona || !volume) return;
    const i = { persona, cargo, volume, priorities };
    const built = buildPlan(i);
    track("planner_complete", { model: built.model, modules: built.modules.map((m) => m.id).join(",") });
    const url = new URL(window.location.href);
    url.searchParams.set("plan", encodePlan(i));
    url.hash = "planner";
    window.history.replaceState(null, "", url);
    setStep(4);
  };

  const restart = () => {
    setPersona(null); setCargo([]); setVolume(null); setPriorities([]);
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
  const question = p.steps[stepKeys[Math.min(step, 3) as 0 | 1 | 2 | 3]];
  const anim = reduce
    ? {}
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 }, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const } };

  return (
    <section id="planner" aria-labelledby="planner-title" className="scroll-mt-16 bg-paper/80 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <span className="label">{p.eyebrow}</span>
            <h2 id="planner-title" className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] text-ink text-balance sm:text-5xl rtl:tracking-normal">
              {p.title}
            </h2>
          </div>
          <p className="max-w-xl text-lg text-muted text-pretty lg:justify-self-end">{p.lead}</p>
        </div>

        <div className="mt-12 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(12,14,17,0.04)]">
          {step < 4 ? (
            <div className="grid lg:grid-cols-[1.7fr_1fr]">
              <div className="p-6 sm:p-10">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted" aria-live="polite">{fmt(p.stepOf, { n: step + 1, total: TOTAL })}</p>
                  <div className="flex flex-1 gap-1 sm:max-w-xs" aria-hidden="true">
                    {Array.from({ length: TOTAL }, (_, i) => (
                      <span key={i} className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-ink" : "bg-line"}`} />
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={step} {...anim}>
                    <h3 ref={headingRef} tabIndex={-1} className="mt-8 font-display text-2xl font-semibold tracking-[-0.02em] text-ink outline-none sm:text-3xl rtl:tracking-normal">
                      {question.q}
                    </h3>
                    <p className="mt-2 text-muted">{question.hint}</p>

                    <div className="mt-7">
                      {step === 0 && (
                        <div role="radiogroup" aria-label={p.steps.persona.q} className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                          {PERSONAS.map((k) => (
                            <Option key={k} role="radio" icon={k} checked={persona === k}
                              title={p.steps.persona.options[k].t} desc={p.steps.persona.options[k].d}
                              onClick={() => { setPersona(k); go(1, k); }} />
                          ))}
                        </div>
                      )}
                      {step === 1 && (
                        <div role="group" aria-label={p.steps.cargo.q} className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                          {CARGO.map((k) => (
                            <Option key={k} role="checkbox" icon={k} checked={cargo.includes(k)}
                              title={p.steps.cargo.options[k].t} desc={p.steps.cargo.options[k].d}
                              onClick={() => setCargo((c) => toggle(c, k))} />
                          ))}
                        </div>
                      )}
                      {step === 2 && (
                        <div role="radiogroup" aria-label={p.steps.volume.q} className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                          {VOLUMES.map((k) => (
                            <Option key={k} role="radio" icon={k} checked={volume === k}
                              title={p.steps.volume.options[k].t} desc={p.steps.volume.options[k].d}
                              onClick={() => { setVolume(k); go(3, k); }} />
                          ))}
                        </div>
                      )}
                      {step === 3 && (
                        <div role="group" aria-label={p.steps.priorities.q} className="flex flex-wrap gap-2">
                          {PRIORITIES.map((k) => {
                            const on = priorities.includes(k);
                            const disabled = !on && priorities.length >= 3;
                            return (
                              <button
                                key={k}
                                type="button"
                                role="checkbox"
                                aria-checked={on}
                                aria-disabled={disabled}
                                onClick={() => !disabled && setPriorities((c) => toggle(c, k, 3))}
                                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors ${
                                  on
                                    ? "border-brand bg-brand text-white"
                                    : disabled
                                      ? "cursor-not-allowed border-line text-muted"
                                      : "border-line-strong text-ink hover:border-ink"
                                }`}
                              >
                                {on ? <CheckIcon className="size-4" /> : null}
                                {p.steps.priorities.options[k].t}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className={`mt-10 flex items-center justify-between gap-3 border-t border-line pt-6 ${step === 0 ? "hidden" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))}
                    className="rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
                  >
                    {p.back}
                  </button>
                  {step === 1 && (
                    <button type="button" onClick={() => go(2, cargo.join(".") || "parcels")}
                      className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 font-medium text-white transition-colors hover:bg-ink-3">
                      {p.next} <ArrowIcon />
                    </button>
                  )}
                  {step === 3 && (
                    <button type="button" onClick={finish}
                      className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 font-medium text-white transition-colors hover:bg-brand-strong">
                      {p.build} <ArrowIcon />
                    </button>
                  )}
                </div>
              </div>
              <LivePreview t={t} input={persona ? { persona, cargo, volume: volume ?? "starting", priorities } : null} />
            </div>
          ) : plan && input ? (
            <motion.div {...anim}>
              <Result t={t} input={input} plan={plan} headingRef={headingRef} onRestart={restart} onSend={sendToContact} onCopy={copyLink} copied={copied} />
            </motion.div>
          ) : null}
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
      className={`group flex items-start gap-3.5 rounded-lg border p-4 text-start transition-colors duration-200 ${
        checked ? "border-brand bg-brand-soft" : "border-line hover:border-line-strong hover:bg-paper"
      }`}
    >
      <span className={`mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-md transition-colors ${
        checked ? "bg-brand text-white" : "bg-subtle text-ink"
      }`}>
        <OptionIcon id={icon} className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span className="font-medium text-ink">{title}</span>
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

/** Live configuration preview: modules switch on as the visitor answers. */
function LivePreview({ t, input }: { t: Dictionary; input: PlanInput | null }) {
  const plan = input ? buildPlan(input) : null;
  const byId = new Map(plan?.modules.map((m) => [m.id, m]) ?? []);
  return (
    <aside aria-label={t.planner.preview.title} className="hidden border-s border-line bg-paper p-8 lg:block">
      <p className="text-sm font-semibold text-ink">{t.planner.preview.title}</p>
      <p className="mt-1 text-sm text-muted">{plan ? t.planner.result.models[plan.model].name : t.planner.preview.empty}</p>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {facts.services.map((id) => {
          const m = byId.get(id);
          return (
            <li key={id} className="flex items-center gap-3 py-3 text-sm">
              <span className={`inline-flex size-7 items-center justify-center rounded-md transition-colors duration-300 ${
                m ? (m.core ? "bg-brand text-white" : "bg-brand-soft text-brand") : "bg-subtle text-faint"
              }`}>
                <ServiceIcon id={id} className="size-4" />
              </span>
              <span className={`flex-1 transition-colors duration-300 ${m ? "font-medium text-ink" : "text-muted"}`}>{t.planner.services[id].name}</span>
              {m ? <CheckIcon className="size-4 text-brand" /> : null}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function Result({
  t, input, plan, headingRef, onRestart, onSend, onCopy, copied,
}: {
  t: Dictionary;
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
  const summary = planSummary(t, input);
  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr]">
      <div className="p-6 sm:p-10">
        <span className="label">{r.eyebrow}</span>
        <h3 ref={headingRef} tabIndex={-1} className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-ink outline-none rtl:tracking-normal">
          {model.name}
        </h3>
        <p className="mt-3 max-w-lg text-muted">{model.desc}</p>

        <ol className="mt-8 divide-y divide-line border-y border-line">
          {plan.modules.map((m) => {
            const s = t.planner.services[m.id];
            const reasons = m.reasons.map((k) => t.planner.reasons[k]).filter(Boolean);
            return (
              <li key={m.id} className="flex items-start gap-4 py-5">
                <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-md ${m.core ? "bg-brand text-white" : "bg-brand-soft text-brand"}`}>
                  <ServiceIcon id={m.id} className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-ink">{s.name}</h4>
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${m.core ? "bg-ink text-white" : "bg-subtle text-muted"}`}>
                      {m.core ? r.core : r.addon}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{s.desc}</p>
                  {reasons.length ? (
                    <p className="mt-2 text-sm text-brand">{reasons.join(" · ")}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-6 border-s-2 border-brand ps-4 text-sm text-muted">{r.noPricing}</p>
      </div>

      <aside className="border-t border-line bg-paper p-6 sm:p-10 lg:border-s lg:border-t-0">
        <h4 className="font-display text-xl font-semibold text-ink">{r.nextTitle}</h4>
        <ol className="mt-5 space-y-5">
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
        <div className="mt-8 grid gap-2.5">
          <button type="button" onClick={onSend}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 font-medium text-white transition-colors hover:bg-ink-3">
            {r.send} <ArrowIcon />
          </button>
          <a
            href={whatsappLink(`${t.wa.planIntro}\n\n${summary}`)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { track("plan_share", { channel: "whatsapp" }); track("whatsapp_click", { location: "planner" }); }}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-line-strong bg-surface px-5 py-3 font-medium text-ink transition-colors hover:border-ink"
          >
            <WhatsAppIcon className="size-5 text-whatsapp" /> {r.whatsapp}
          </a>
          <div className="flex items-center justify-between gap-3 pt-2 text-sm">
            <button type="button" onClick={onCopy} className="text-muted underline-offset-4 hover:text-ink hover:underline">
              <span aria-live="polite">{copied ? r.copied : r.copy}</span>
            </button>
            <button type="button" onClick={onRestart} className="text-muted underline-offset-4 hover:text-ink hover:underline">
              {t.planner.restart}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
