"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { ProfileCopy } from "@/content/profile";
import { whatsappLink } from "@/content/facts";
import { isFilm } from "./engine";
import { useReveals } from "./useReveals";

type Status = "idle" | "invalid" | "sent";

/** Riyadh's own time, ticking (the film holds a fixed morning so every render is the same). */
function useRiyadhClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const film = isFilm();
    const tick = () => setNow(film ? new Date("2026-10-28T03:48:12Z") : new Date());
    const first = window.setTimeout(tick, 0);
    const id = film ? 0 : window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  if (!now) return ["--", "--", "--"];
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Riyadh", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "--";
  return [get("hour"), get("minute"), get("second")];
}

/**
 * The first conversation, after the template's reserve: Riyadh's clock on one side (MSG is running right now), a
 * short form on the other that drafts the message in WhatsApp, and the company's registration details beneath.
 */
export default function Contact({ c, lang }: { c: ProfileCopy; lang: string }) {
  const ref = useReveals<HTMLElement>();
  const [h, m, s] = useRiyadhClock();
  const [status, setStatus] = useState<Status>("idle");
  const ar = lang === "ar";

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setStatus("invalid");
      form.reportValidity();
      return;
    }
    const d = new FormData(form);
    const text = ar
      ? `مرحبًا ام اس جي، معك ${String(d.get("name"))} من ${String(d.get("company"))}. أحتاج: ${String(d.get("service"))}.`
      : `Hello MSG, this is ${String(d.get("name"))} from ${String(d.get("company"))}. I need: ${String(d.get("service"))}.`;
    window.open(whatsappLink(text), "_blank", "noopener");
    setStatus("sent");
  };

  const field =
    "w-full rounded-[4px] bg-white/[0.04] px-4 py-3.5 text-[0.9375rem] text-white ring-1 ring-white/15 outline-none placeholder:text-white/35 focus:ring-[#009df8]";
  const units: [string, string][] = [
    [ar ? "ساعة" : "Hrs", h],
    [ar ? "دقيقة" : "Min", m],
    [ar ? "ثانية" : "Sec", s],
  ];

  return (
    <section ref={ref} id="contact" aria-labelledby="contact-title" className="relative overflow-hidden bg-[#05070c] px-4 pb-28 sm:px-6 md:px-[6vw] md:pb-36">
      {/* a sliver of the sun rising at the bottom edge: the opening, bookended */}
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[74vw] left-1/2 size-[90vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_30%,rgba(255,180,106,0.16),rgba(255,140,61,0.04)_55%,transparent_70%)]" />

      <div className="relative grid gap-12 border-t border-white/10 pt-20 md:grid-cols-2 md:gap-16 md:pt-28">
        <div data-reveal>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#7fcbfb] rtl:tracking-normal">{c.contact.eyebrow}</p>
          <h2 id="contact-title" className="pf-display mt-4 text-white">{c.contact.heading}</h2>
          <p className="mt-5 max-w-[28rem] text-[clamp(0.9375rem,1.05vw,1.0625rem)] leading-relaxed text-white/70">{c.contact.body}</p>

          <div className="mt-10">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-white/50 rtl:tracking-normal">{c.contact.clockLabel}</p>
            <div className="mt-3 flex gap-2 md:gap-3" role="timer" aria-label={`${c.contact.clockLabel} ${h}:${m}`} dir="ltr">
              {units.map(([label, v]) => (
                <div key={label} className="pf-brackets min-w-[4.5rem] px-3 py-3 text-center text-white/25 md:min-w-[5.5rem]">
                  <span className="block font-display text-[1.6rem] font-semibold text-white tabular-nums md:text-[2.25rem]">{v}</span>
                  <span className="mt-1 block font-mono text-[0.625rem] uppercase tracking-[0.14em] text-white/55">{label}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#ffc777] rtl:tracking-normal">{c.contact.clockNote}</p>
          </div>
        </div>

        <form noValidate onSubmit={onSubmit} aria-describedby="pf-status" className="space-y-3" data-reveal>
          <label className="block">
            <span className="mb-1.5 block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-white/60 rtl:tracking-normal">{c.contact.name}</span>
            <input name="name" required autoComplete="name" placeholder={c.contact.namePh} className={field} onInput={() => setStatus("idle")} />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-white/60 rtl:tracking-normal">{c.contact.company}</span>
            <input name="company" required autoComplete="organization" placeholder={c.contact.companyPh} className={field} onInput={() => setStatus("idle")} />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-white/60 rtl:tracking-normal">{c.contact.service}</span>
            <select name="service" defaultValue={c.services[0].name} className={`${field} appearance-none`}>
              {c.services.map((sv) => (
                <option key={sv.id} value={sv.name} className="bg-[#05070c]">{sv.name}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="mt-2 w-full rounded-[4px] bg-[#fff] px-5 py-4 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#05070c] transition-colors hover:bg-[#009df8] rtl:tracking-normal">
            {c.contact.send}
          </button>
          <p id="pf-status" role="status" className="min-h-[1.25rem] text-[0.8125rem] text-white/70">
            {status === "invalid" && c.contact.invalid}
            {status === "sent" && c.contact.sent}
          </p>
          <p className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[0.6875rem] text-white/60" dir="ltr">
            <a href={`mailto:${c.contact.email}`} className="hover:text-white">{c.contact.email}</a>
            <a href={whatsappLink()} target="_blank" rel="noopener" className="hover:text-white">{c.contact.whatsapp}</a>
          </p>
        </form>
      </div>

      <dl className="relative mt-16 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-3" data-reveal>
        {c.contact.corporate.map((row) => (
          <div key={row.label}>
            <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-white/45 rtl:tracking-normal">{row.label}</dt>
            <dd className="mt-1.5 text-[0.9375rem] text-white/85 tabular-nums" dir={row.ltr ? "ltr" : undefined}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
