"use client";

import { useEffect, useId, useState } from "react";
import { usePlan } from "../PlanContext";
import { validateLead, type LeadErrors } from "@/lib/lead";
import { encodePlan, operatingModel, type Persona } from "@/lib/planner";
import { planSummary } from "@/lib/plan-summary";
import { track } from "@/lib/analytics";
import { facts, whatsappLink } from "@/content/facts";
import type { Dictionary, Locale } from "@/content/i18n";
import { MailIcon, WhatsAppIcon } from "../ui/icons";

const personaToInterest: Record<Persona, string> = {
  seller: "seller",
  startup: "seller",
  ecommerce: "ecommerce",
  enterprise: "enterprise",
  platform: "manpower",
};

type Status = "idle" | "sending" | "sent" | "handoff" | "error";

export default function ContactForm({ t, lang }: { t: Dictionary; lang: Locale }) {
  const f = t.contact.form;
  const { plan, setPlan } = usePlan();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<LeadErrors>({});
  // Interest: the visitor's explicit pick wins; otherwise it follows the attached plan.
  const [picked, setPicked] = useState<string | null>(null);
  const [prevPlan, setPrevPlan] = useState(plan);
  if (plan !== prevPlan) {
    setPrevPlan(plan);
    setPicked(null);
  }
  const interest = picked ?? (plan ? personaToInterest[plan.persona] : "seller");
  const setInterest = setPicked;
  const [handoffText, setHandoffText] = useState("");
  const uid = useId();

  // Pre-select interest from "[data-interest]" CTAs elsewhere on the page.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-interest]");
      if (el?.dataset.interest) setPicked(el.dataset.interest);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const buildText = (d: Record<string, string>) =>
    [
      t.wa.leadIntro,
      "",
      `${f.name}: ${d.name}`,
      `${f.phone}: ${d.phone}`,
      d.email ? `Email: ${d.email}` : "",
      d.company ? `${f.company.replace(/\s*\(.*\)$/, "")}: ${d.company}` : "",
      `${f.interest}: ${f.interestOptions[d.interest as keyof typeof f.interestOptions] ?? d.interest}`,
      d.message ? `\n${d.message}` : "",
      plan ? `\n${planSummary(t, plan)}` : "",
    ]
      .filter(Boolean)
      .join("\n");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (data.website) return; // honeypot
    const payload = { ...data, interest, lang, plan: plan ? encodePlan(plan) : "", source: "website" };
    const { errors: errs } = validateLead(payload);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = form.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`);
      first?.focus();
      return;
    }
    setStatus("sending");
    setHandoffText(buildText({ ...data, interest }));
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as { delivered?: boolean };
      track("lead_submit", { interest, delivered: !!json.delivered, with_plan: !!plan });
      if (res.ok && json.delivered) {
        setStatus("sent");
        form.reset();
        setPlan(null);
      } else if (res.ok) {
        setStatus("handoff"); // saved nowhere server-side: hand off to WhatsApp / email
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const field =
    "mt-2 block w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-white placeholder:text-fog/60 transition focus:border-sun focus:bg-white/[0.06] focus:outline-none";
  const err = (k: keyof LeadErrors) =>
    errors[k] ? (
      <p id={`${uid}-${k}-err`} className="mt-1.5 text-sm text-[#ff9b8a]">
        {k === "phone" && errors[k] === "invalid" ? f.errors.phone : f.errors[errors[k]!]}
      </p>
    ) : null;

  if (status === "sent") {
    return (
      <div role="status" className="rounded-3xl border border-signal/40 bg-signal/10 p-8">
        <p className="font-display text-2xl font-semibold text-white">{f.successTitle}</p>
        <p className="mt-3 text-mist">{f.successBody}</p>
        <a
          href={whatsappLink(t.wa.general)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_click", { location: "form_success" })}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-ink"
        >
          <WhatsAppIcon className="size-5 text-signal-deep" /> {t.contact.channels.whatsapp}
        </a>
      </div>
    );
  }

  if (status === "handoff" || status === "error") {
    return (
      <div role="status" className="rounded-3xl border border-sun/40 bg-sun/10 p-8">
        <p className="font-display text-2xl font-semibold text-white">{f.fallbackTitle}</p>
        <p className="mt-3 text-mist">{status === "error" ? f.errors.network : f.fallbackBody}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a
            href={whatsappLink(handoffText)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { location: "form_handoff" })}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-sun px-5 py-3.5 font-semibold text-ink"
          >
            <WhatsAppIcon className="size-5" /> {f.sendWhatsapp}
          </a>
          <a
            href={`mailto:${facts.contact.email}?subject=${encodeURIComponent(t.planner.result.summaryTitle)}&body=${encodeURIComponent(handoffText)}`}
            onClick={() => track("cta_click", { cta: "email", location: "form_handoff" })}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3.5 font-semibold text-white"
          >
            <MailIcon className="size-5" /> {f.sendEmail}
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="glass rounded-3xl border border-line bg-ink/60 p-6 sm:p-8" aria-describedby={`${uid}-privacy`}>
      {plan ? (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-signal/30 bg-signal/10 px-4 py-3 text-sm">
          <span className="text-signal">✓ {f.planAttached}: <strong className="text-white">{t.planner.result.models[operatingModel(plan)].name}</strong></span>
          <button type="button" onClick={() => setPlan(null)} className="text-fog underline-offset-4 hover:text-white hover:underline">
            {f.removePlan}
          </button>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-name" className="text-sm font-medium text-mist">{f.name} *</label>
          <input
            id="lead-name" name="name" autoComplete="name" required
            aria-invalid={!!errors.name} aria-describedby={errors.name ? `${uid}-name-err` : undefined}
            className={`${field} ${errors.name ? "border-[#ff9b8a]" : "border-line"}`}
          />
          {err("name")}
        </div>
        <div>
          <label htmlFor="lead-phone" className="text-sm font-medium text-mist">{f.phone} *</label>
          <input
            id="lead-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required dir="ltr"
            placeholder={f.phoneHint}
            aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${uid}-phone-err` : undefined}
            className={`${field} text-start rtl:text-right ${errors.phone ? "border-[#ff9b8a]" : "border-line"}`}
          />
          {err("phone")}
        </div>
        <div>
          <label htmlFor="lead-email" className="text-sm font-medium text-mist">{f.email}</label>
          <input
            id="lead-email" name="email" type="email" autoComplete="email" dir="ltr"
            aria-invalid={!!errors.email} aria-describedby={errors.email ? `${uid}-email-err` : undefined}
            className={`${field} rtl:text-right ${errors.email ? "border-[#ff9b8a]" : "border-line"}`}
          />
          {err("email")}
        </div>
        <div>
          <label htmlFor="lead-company" className="text-sm font-medium text-mist">{f.company}</label>
          <input id="lead-company" name="company" autoComplete="organization" className={`${field} border-line`} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="lead-interest" className="text-sm font-medium text-mist">{f.interest}</label>
          <select
            id="lead-interest" name="interest" value={interest} onChange={(e) => setInterest(e.target.value)}
            className={`${field} border-line [&>option]:bg-ink`}
          >
            {Object.entries(f.interestOptions).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="lead-message" className="text-sm font-medium text-mist">{f.message}</label>
          <textarea id="lead-message" name="message" rows={4} className={`${field} resize-y border-line`} />
        </div>
        {/* honeypot */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p id={`${uid}-privacy`} className="text-xs text-fog">{f.privacy}</p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex w-full items-center justify-center rounded-full bg-sun px-7 py-3.5 font-semibold text-ink transition hover:bg-sun-soft disabled:opacity-60 sm:w-auto"
        >
          {status === "sending" ? f.sending : f.submit}
        </button>
      </div>
    </form>
  );
}
