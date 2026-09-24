"use client";

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
import { ArrowIcon, CheckIcon, ServiceIcon, WhatsAppIcon } from "../ui/icons";

type Step = 0 | 1 | 2 | 3 | 4; // 4 = result
const TOTAL = 4;

export default function Planner({ t }: { t: Dictionary }) {
  const p = t.planner;
  const { setPlan } = usePlan();
  const [step, setStep] = useState<Step>(0);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [cargo, setCargo] = useState<Cargo[]>([]);
  const [volume, setVolume] = useState<Volume | null>(null);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

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

  // Move focus to the new question for keyboard & screen-reader users.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const input: PlanInput | null =
    persona && volume ? { persona, cargo, volume, priorities } : null;
  const plan = input ? buildPlan(input) : null; // pure and cheap: no memo needed

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

  return (
    <section id="planner" aria-labelledby="planner-title" className="relative scroll-mt-16 overflow-hidden bg-ink-2 py-24 lg:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 start-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-sun/10 blur-3xl rtl:translate-x-1/2" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow text-sun">{p.eyebrow}</p>
          <h2 id="planner-title" className="mt-4 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl rtl:tracking-normal">
            {p.title}
          </h2>
          <p className="mt-5 text-lg text-mist text-pretty">{p.lead}</p>
        </div>

        <div className="mt-12 overflow-hidden rounded-[28px] border border-line bg-ink/60 shadow-2xl shadow-black/40 backdrop-blur">
          {step < 4 ? (
            <div className="grid lg:grid-cols-[1.7fr_1fr]">
            <div className="p-6 sm:p-10">
              {/* progress */}
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-fog" aria-live="polite">
                  {fmt(p.stepOf, { n: step + 1, total: TOTAL })}
                </p>
                <div className="flex flex-1 gap-1.5 sm:max-w-xs" aria-hidden="true">
                  {Array.from({ length: TOTAL }, (_, i) => (
                    <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-sun" : "bg-white/10"}`} />
                  ))}
                </div>
              </div>

              <h3 ref={headingRef} tabIndex={-1} className="mt-8 font-display text-2xl font-semibold outline-none sm:text-3xl">
                {question.q}
              </h3>
              <p className="mt-2 text-fog">{question.hint}</p>

              <div key={step} className="mt-8 animate-rise">
                {step === 0 && (
                  <div role="radiogroup" aria-label={p.steps.persona.q} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {PERSONAS.map((k) => (
                      <Option
                        key={k}
                        role="radio"
                        checked={persona === k}
                        title={p.steps.persona.options[k].t}
                        desc={p.steps.persona.options[k].d}
                        onClick={() => { setPersona(k); go(1, k); }}
                      />
                    ))}
                  </div>
                )}
                {step === 1 && (
                  <div role="group" aria-label={p.steps.cargo.q} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {CARGO.map((k) => (
                      <Option
                        key={k}
                        role="checkbox"
                        checked={cargo.includes(k)}
                        title={p.steps.cargo.options[k].t}
                        desc={p.steps.cargo.options[k].d}
                        onClick={() => setCargo((c) => toggle(c, k))}
                      />
                    ))}
                  </div>
                )}
                {step === 2 && (
                  <div role="radiogroup" aria-label={p.steps.volume.q} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {VOLUMES.map((k) => (
                      <Option
                        key={k}
                        role="radio"
                        checked={volume === k}
                        title={p.steps.volume.options[k].t}
                        desc={p.steps.volume.options[k].d}
                        onClick={() => { setVolume(k); go(3, k); }}
                      />
                    ))}
                  </div>
                )}
                {step === 3 && (
                  <div role="group" aria-label={p.steps.priorities.q} className="flex flex-wrap gap-2.5">
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
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                            on
                              ? "border-sun bg-sun text-ink"
                              : disabled
                                ? "cursor-not-allowed border-line text-fog/70"
                                : "border-line text-mist hover:border-white/30 hover:text-white"
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

              <div className={`mt-10 flex items-center justify-between gap-3 border-t border-line pt-6 ${step === 0 ? "hidden" : ""}`}>
                <button
                  type="button"
                  onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))}
                  className={`rounded-full px-4 py-2.5 text-sm text-fog transition hover:text-white ${step === 0 ? "invisible" : ""}`}
                >
                  {p.back}
                </button>
                {step === 1 && (
                  <button
                    type="button"
                    onClick={() => go(2, cargo.join(".") || "parcels")}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-ink transition hover:bg-sun"
                  >
                    {p.next} <ArrowIcon />
                  </button>
                )}
                {step === 3 && (
                  <button
                    type="button"
                    onClick={finish}
                    className="inline-flex items-center gap-2 rounded-full bg-sun px-6 py-3 font-semibold text-ink shadow-[0_0_40px_-8px_rgba(246,166,35,0.7)] transition hover:bg-sun-soft"
                  >
                    {p.build} <ArrowIcon />
                  </button>
                )}
              </div>
            </div>
            <LivePreview t={t} input={persona ? { persona, cargo, volume: volume ?? "starting", priorities } : null} />
            </div>
          ) : plan && input ? (
            <Result t={t} input={input} plan={plan} headingRef={headingRef} onRestart={restart} onSend={sendToContact} onCopy={copyLink} copied={copied} />
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Option({
  role, checked, title, desc, onClick,
}: { role: "radio" | "checkbox"; checked: boolean; title: string; desc: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={checked}
      onClick={onClick}
      className={`group relative flex min-h-24 flex-col items-start rounded-2xl border p-5 text-start transition duration-300 ${
        checked
          ? "border-sun bg-sun/10 shadow-[inset_0_0_0_1px_rgba(246,166,35,0.5)]"
          : "border-line bg-white/[0.02] hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.05]"
      }`}
    >
      <span className="flex w-full items-start justify-between gap-3">
        <span className="font-semibold text-white">{title}</span>
        <span
          aria-hidden="true"
          className={`mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border transition ${
            checked ? "border-sun bg-sun text-ink" : "border-white/25"
          }`}
        >
          {checked ? <CheckIcon className="size-3" /> : null}
        </span>
      </span>
      {desc ? <span className="mt-1.5 text-sm text-fog">{desc}</span> : null}
    </button>
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
    <div className="grid lg:grid-cols-[1.35fr_1fr]">
      <div className="p-6 sm:p-10">
        <p className="eyebrow text-signal">{r.eyebrow}</p>
        <h3 ref={headingRef} tabIndex={-1} className="mt-3 font-display text-4xl font-semibold tracking-tight outline-none sm:text-5xl rtl:tracking-normal">
          {model.name}
        </h3>
        <p className="mt-3 max-w-lg text-mist">{model.desc}</p>

        <ol className="mt-8 space-y-3">
          {plan.modules.map((m, i) => {
            const s = t.planner.services[m.id];
            const reasons = m.reasons.map((k) => t.planner.reasons[k]).filter(Boolean);
            return (
              <li
                key={m.id}
                className="animate-rise rounded-2xl border border-line bg-white/[0.03] p-4 sm:p-5"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl ${
                      m.core ? "bg-sun text-ink" : "bg-white/5 text-signal"
                    }`}
                  >
                    <ServiceIcon id={m.id} className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-white">{s.name}</h4>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide rtl:tracking-normal ${
                          m.core ? "bg-sun/15 text-sun" : "bg-signal/10 text-signal"
                        }`}
                      >
                        {m.core ? r.core : r.addon}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-fog">{s.desc}</p>
                    {reasons.length ? (
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {reasons.map((x) => (
                          <li key={x} className="rounded-full border border-line px-2.5 py-1 text-xs text-mist">
                            {x}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-6 rounded-2xl border border-sun/20 bg-sun/5 p-4 text-sm text-sun-soft">{r.noPricing}</p>
      </div>

      <aside className="border-t border-line bg-white/[0.02] p-6 sm:p-10 lg:border-s lg:border-t-0">
        <h4 className="font-display text-xl font-semibold">{r.nextTitle}</h4>
        <ol className="mt-5 space-y-5">
          {r.next.map((n, i) => (
            <li key={n.t} className="flex gap-4">
              <span className="num inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-line font-mono text-sm text-sun">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-white">{n.t}</p>
                <p className="text-sm text-fog">{n.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8 grid gap-3">
          <button
            type="button"
            onClick={onSend}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-sun px-6 py-3.5 font-semibold text-ink transition hover:bg-sun-soft"
          >
            {r.send} <ArrowIcon />
          </button>
          <a
            href={whatsappLink(`${t.wa.planIntro}\n\n${summary}`)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { track("plan_share", { channel: "whatsapp" }); track("whatsapp_click", { location: "planner" }); }}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 font-semibold text-white transition hover:border-signal/60"
          >
            <WhatsAppIcon className="size-5 text-signal" /> {r.whatsapp}
          </a>
          <div className="flex items-center justify-between gap-3 pt-2 text-sm">
            <button type="button" onClick={onCopy} className="text-fog underline-offset-4 transition hover:text-white hover:underline">
              <span aria-live="polite">{copied ? r.copied : r.copy}</span>
            </button>
            <button type="button" onClick={onRestart} className="text-fog underline-offset-4 transition hover:text-white hover:underline">
              {t.planner.restart}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

/** Live configuration preview: modules light up as the visitor answers. */
function LivePreview({ t, input }: { t: Dictionary; input: PlanInput | null }) {
  const plan = input ? buildPlan(input) : null;
  const byId = new Map(plan?.modules.map((m) => [m.id, m]) ?? []);
  return (
    <aside aria-label={t.planner.preview.title} className="hidden border-s border-line bg-white/[0.02] p-8 lg:block">
      <p className="eyebrow text-signal">{t.planner.preview.title}</p>
      {plan ? (
        <p className="mt-3 font-display text-2xl font-semibold">{t.planner.result.models[plan.model].name}</p>
      ) : (
        <p className="mt-3 text-sm text-fog">{t.planner.preview.empty}</p>
      )}
      <ul className="mt-6 space-y-2">
        {facts.services.map((id) => {
          const m = byId.get(id);
          return (
            <li
              key={id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all duration-500 ${
                m ? (m.core ? "border-sun/50 bg-sun/10 text-white" : "border-signal/40 bg-signal/5 text-white") : "border-line text-fog"
              }`}
            >
              <span className={`inline-flex size-7 items-center justify-center rounded-lg transition-colors duration-500 ${m ? (m.core ? "bg-sun text-ink" : "bg-signal/15 text-signal") : "bg-white/5"}`}>
                <ServiceIcon id={id} className="size-4" />
              </span>
              <span className="flex-1">{t.planner.services[id].name}</span>
              {m ? <CheckIcon className={`size-4 ${m.core ? "text-sun" : "text-signal"}`} /> : null}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
