"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { accessCopy } from "@/content/access";
import { whatsappLink } from "@/content/facts";
import { fmt, type Dictionary, type Locale } from "@/content/i18n";
import { SEGMENT_ORDERS, SEGMENT_PERSONA, type Segment } from "@/content/roadmap";
import { normalizePhone } from "@/lib/lead";
import { EASE_OUT } from "@/lib/motion";
import { DEFAULT_SIZER, type SizerInput } from "@/lib/sizer";
import { track } from "@/lib/analytics";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { WhatsAppIcon } from "../ui/icons";
import Estimator from "./Estimator";

type Visitor = { name: string; phone: string; company?: string };
const KEY = "msg-estimator-visitor";
const ASKED = "msg-estimator-asked";

/** best effort: storage can be unavailable (private windows, blocked site data) */
const raw = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const parse = <T,>(v: string | null): T | null => { try { return v ? (JSON.parse(v) as T) : null; } catch { return null; } };
const noSubscribe = () => () => {};
/** what this device remembers, read after hydration (the server always renders the gate) */
const useStored = <T,>(k: string) => {
  const v = useSyncExternalStore(noSubscribe, () => raw(k), () => null);
  return useMemo(() => parse<T>(v), [v]);
};
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* the gate simply asks again next visit */ } };

/** sends to the lead route; MSG's team is told by email (and webhook, if configured) */
async function notify(body: Record<string, unknown>) {
  const r = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(String(r.status));
}

/**
 * The live estimator, opened by signing in. The estimator is drawn behind the sign-in, blurred and out of
 * reach, so the visitor sees what they are about to open. Signing in tells MSG who is pricing a delivery;
 * then the visitor is welcomed and asked whether they would like help, and that answer reaches MSG too.
 * A returning visitor on the same device goes straight in.
 */
export default function EstimatorSection({ t, lang }: { t: Dictionary; lang: Locale }) {
  const c = accessCopy[lang];
  const reduce = useReducedMotion();
  const [segment, setSegment] = useState<Segment>("social");
  const [net, setNet] = useState<SizerInput>({ ...DEFAULT_SIZER, orders: SEGMENT_ORDERS.social });
  // a visitor who already signed in on this device is let straight in
  const storedWho = useStored<Visitor>(KEY);
  const storedAnswer = useStored<"yes" | "no">(ASKED);
  const [signed, setWho] = useState<Visitor | null>(null);
  const [answered, setAnswer] = useState<"yes" | "no" | null>(null);
  const who = signed ?? storedWho;
  const answer = answered ?? storedAnswer;

  const chooseSegment = (s: Segment) => {
    setSegment(s);
    setNet((n) => ({ ...n, orders: SEGMENT_ORDERS[s], window: SEGMENT_PERSONA[s] === "platform" ? "sameday" : n.window }));
  };

  const reply = (a: "yes" | "no") => {
    if (!who) return;
    setAnswer(a);
    save(ASKED, a);
    track("cta_click", { cta: `estimator_help_${a}`, location: "estimator" });
    notify({
      name: who.name, phone: who.phone, company: who.company, lang, source: "estimator",
      interest: a === "yes" ? "estimator_help_yes" : "estimator_help_no",
      message: `${a === "yes" ? "Replied 1: would like help." : "Replied 0: browsing on their own."} Estimator: ${segment}, ${net.orders} orders/day, ${net.cod}% cash, ${net.area}, storage ${net.stock ? "yes" : "no"}.`,
    }).catch(() => { /* the team still has the sign-in */ });
  };

  return (
    <section id="estimate" aria-labelledby="estimate-title" className="sea-band relative scroll-mt-16 overflow-hidden sec text-teal-deep">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="text-sm font-semibold text-teal">{c.eyebrow}</p>
            <h2 id="estimate-title" className="h-section mt-2 text-balance">{c.title}</h2>
          </div>
          <p className="max-w-xl text-lg text-teal-deep/75 text-pretty lg:justify-self-end">{c.lead}</p>
        </div>

        {/* welcome, and the one question */}
        <AnimatePresence initial={false}>
          {who ? (
            <motion.div
              key="welcome"
              initial={reduce ? false : { opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              className="overflow-hidden"
            >
              <div role="status" className="mt-8 flex flex-col gap-4 rounded-2xl bg-teal-deep p-5 text-white shadow-[0_30px_60px_-30px_rgba(11,58,64,0.8)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-bright text-sm font-bold text-pitch">MSG</span>
                  <div>
                    <p className="font-display text-lg font-semibold">{fmt(c.welcome.hello, { name: who.name.split(" ")[0] })}</p>
                    <p className="mt-0.5 text-white/75">{answer === "yes" ? c.welcome.thanks : answer === "no" ? c.welcome.later : c.welcome.ask}</p>
                  </div>
                </div>
                {answer === null ? (
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <a
                      href={whatsappLink(fmt(c.welcome.wa, { name: who.name, orders: net.orders.toLocaleString("en-US") }))}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => reply("yes")}
                      className="inline-flex items-center gap-2 rounded-full bg-brand-bright px-5 py-3 font-semibold text-pitch transition-transform hover:-translate-y-0.5"
                    >
                      <WhatsAppIcon className="size-5" /> {c.welcome.yes}
                    </a>
                    <button type="button" onClick={() => reply("no")} className="rounded-full px-5 py-3 font-semibold text-white/85 ring-1 ring-white/25 transition-colors hover:bg-white/10">
                      {c.welcome.no}
                    </button>
                  </div>
                ) : answer === "no" ? (
                  <a href={whatsappLink(fmt(c.welcome.wa, { name: who.name, orders: net.orders.toLocaleString("en-US") }))} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-3 font-semibold text-white ring-1 ring-white/25 hover:bg-white/10">
                    <WhatsAppIcon className="size-5 text-brand-bright" /> WhatsApp
                  </a>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="relative mt-8">
          <div
            inert={!who}
            aria-hidden={who ? undefined : true}
            className={`transition-opacity duration-700 ${who ? "" : "pointer-events-none select-none opacity-60"}`}
          >
            <Estimator t={t} lang={lang} segment={segment} onSegment={chooseSegment} net={net} onNet={setNet} />
          </div>
          {/* a frosted veil, not a live blur filter: a blur this large repaints on every scroll frame */}
          <div aria-hidden="true" className={`pointer-events-none absolute inset-0 rounded-3xl bg-[linear-gradient(180deg,rgba(243,251,251,0.55),rgba(243,251,251,0.85))] transition-opacity duration-700 ${who ? "opacity-0" : "opacity-100"}`} />
          <AnimatePresence>
            {!who ? (
              <motion.div
                key="gate"
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, filter: "blur(6px)" }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
                className="absolute inset-0 z-10 grid place-items-center p-3 sm:p-6"
              >
                <Gate lang={lang} onIn={(v) => { save(KEY, v); setWho(v); }} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Gate({ lang, onIn }: { lang: Locale; onIn: (v: Visitor) => void }) {
  const c = accessCopy[lang].gate;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState(""); // honeypot: people never see it
  const [errors, setErrors] = useState<Partial<Record<"name" | "phone" | "consent" | "form", string>>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    const p = normalizePhone(phone);
    if (!name.trim()) err.name = c.errors.required;
    if (!phone.trim()) err.phone = c.errors.required;
    else if (!p) err.phone = c.errors.phone;
    if (!consent) err.consent = c.errors.consent;
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(err.name ? "est-name" : err.phone ? "est-phone" : "est-consent")?.focus();
      return;
    }
    setBusy(true);
    const v: Visitor = { name: name.trim(), phone: p!, company: company.trim() || undefined };
    try {
      await notify({ ...v, lang, website: trap, source: "estimator", interest: "estimator_signin", message: "Signed in to the live estimator. Consented to WhatsApp / phone follow-up." });
      track("lead_submit", { location: "estimator" });
      onIn(v);
    } catch {
      setErrors({ form: c.errors.network });
    } finally {
      setBusy(false);
    }
  };

  const field = "mt-1.5 w-full rounded-xl border border-teal/20 bg-white px-4 py-3 text-teal-deep placeholder:text-teal-deep/40 focus:border-teal focus:outline-none";
  const err = (k: keyof typeof errors) => (errors[k] ? <p id={`est-${k}-err`} className="mt-1.5 text-sm text-danger">{errors[k]}</p> : null);
  return (
    <form
      onSubmit={submit}
      noValidate
      aria-labelledby="est-gate-title"
      className="w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_50px_100px_-40px_rgba(11,58,64,0.75)] ring-1 ring-teal/10 sm:p-8"
    >
      <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-teal to-teal-deep text-white">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
      </span>
      <h3 id="est-gate-title" className="mt-4 font-display text-2xl font-semibold text-teal-deep">{c.title}</h3>
      <p className="mt-2 text-teal-deep/75 text-pretty">{c.body}</p>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="est-name" className="text-sm font-medium text-teal-deep">{c.name}</label>
          <input id="est-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "est-name-err" : undefined} className={field} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="est-phone" className="text-sm font-medium text-teal-deep">{c.phone}</label>
          <input id="est-phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder={c.phoneHint} value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "est-phone-err" : undefined} className={`${field} text-start rtl:text-right`} />
          {err("phone")}
        </div>
        <div>
          <label htmlFor="est-company" className="text-sm font-medium text-teal-deep">{c.company} <span className="font-normal text-teal-deep/70">({c.optional})</span></label>
          <input id="est-company" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} className={field} />
        </div>
        <input type="text" name="est-website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} className="absolute -start-[9999px] size-px opacity-0" />
        <div>
          <label className="flex items-start gap-3 text-sm text-teal-deep/80">
            <input id="est-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "est-consent-err" : undefined} className="mt-0.5 size-5 shrink-0 accent-teal" />
            {c.consent}
          </label>
          {err("consent")}
        </div>
      </div>

      {err("form")}
      <button type="submit" disabled={busy} className="btn-primary mt-6 w-full justify-center px-6 py-3.5 disabled:opacity-60">
        {busy ? c.sending : c.submit}
      </button>
      <p className="mt-3 text-center text-xs text-teal-deep/70">{c.privacy}</p>
    </form>
  );
}
