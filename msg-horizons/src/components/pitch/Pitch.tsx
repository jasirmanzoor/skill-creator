"use client";

import type { Dictionary, Locale } from "@/content/i18n";
import { pitchCopy } from "@/content/pitch";
import { whatsappLink } from "@/content/facts";
import TrackedLink from "../ui/TrackedLink";
import { WhatsAppIcon } from "../ui/icons";

/**
 * Why MSG, as one comparison read in a single pass: the six hard parts of selling online, each as it is on your own
 * (muted) and, across a leg of the route that draws in as the row arrives, as it is with MSG (the answer, led by its
 * one word). Nothing to scrub through; the close and the WhatsApp line follow.
 */
export default function Pitch({ t, lang }: { t: Dictionary; lang: Locale }) {
  const c = pitchCopy[lang];
  return (
    <section id="why" data-theme="dark" aria-labelledby="why-title" className="on-dark relative isolate scroll-mt-16 bg-pitch pb-16 pt-24 text-white lg:pb-24 lg:pt-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-bright rtl:tracking-normal">{c.eyebrow}</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <h2 id="why-title" className="h-scene">{c.title}</h2>
          <p className="max-w-xl text-lg leading-relaxed text-white/80 text-pretty lg:justify-self-end">{c.lead}</p>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl px-5 lg:mt-16 lg:px-8">
        <div aria-hidden="true" className="hidden grid-cols-[3.5rem_1fr_5rem_1.25fr] border-b border-white/15 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/50 md:grid rtl:tracking-normal">
          <span />
          <span>{c.toggle[0]}</span>
          <span />
          <span className="text-brand-bright">{c.toggle[1]}</span>
        </div>
        <ol aria-label={c.toggleLabel}>
          {c.rows.map((r, i) => (
            <li key={r.win} className="grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-3 border-b border-white/10 py-6 md:grid-cols-[3.5rem_1fr_5rem_1.25fr] md:items-center md:gap-x-0 md:py-7">
              <span className="num pt-0.5 font-mono text-sm text-white/55 md:pt-0" dir="ltr">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-white/55">
                <span className="sr-only">{c.toggle[0]}: </span>
                {r.pain}
              </p>
              {/* the leg from the problem to MSG's answer */}
              <span aria-hidden="true" className="relative col-start-2 hidden h-px md:col-start-auto md:mx-3 md:block">
                <span className="absolute inset-0 bg-white/15" />
                <span className="route-leg absolute inset-0 bg-brand-bright" />
                <span className="absolute -end-0.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-brand-bright" />
              </span>
              <div className="col-start-2 md:col-start-auto">
                <p className="font-display text-2xl font-semibold leading-none tracking-[-0.02em] text-white rtl:leading-snug rtl:tracking-normal">
                  <span className="sr-only">{c.toggle[1]}: </span>
                  {r.win}
                </p>
                <p className="mt-2 text-white/80">{r.fix}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mx-auto mt-10 max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col gap-6 rounded-3xl bg-white p-6 text-teal-deep ring-1 ring-white sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-display text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-3xl rtl:tracking-normal">{c.close}</p>
            <p className="mt-2 text-teal-deep/75">{c.closeLead}</p>
          </div>
          <TrackedLink href={whatsappLink(t.wa.general)} target="_blank" rel="noopener noreferrer" event="whatsapp_click" props={{ location: "pitch" }}
            className="inline-flex min-h-12 shrink-0 items-center gap-2 self-start rounded-full px-5 py-3.5 font-semibold text-teal-deep ring-1 ring-teal/25 transition-colors hover:bg-sea-50 lg:self-auto">
            <WhatsAppIcon className="size-5 text-whatsapp" /> {c.talk}
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
