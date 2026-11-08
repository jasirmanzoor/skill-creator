"use client";

import type { Dictionary, Locale } from "@/content/i18n";
import { pitchCopy } from "@/content/pitch";
import { whatsappLink } from "@/content/facts";
import TrackedLink from "../ui/TrackedLink";
import ScrollTimeline, { type TimelinePanel } from "../ui/ScrollTimeline";
import { CheckIcon, WhatsAppIcon } from "../ui/icons";

/** on your own: one charcoal ground; with MSG: the brand's own colours, in turn */
const OWN = { bg: "#16191f", fg: "#ece7e1" };
const WIN = [
  { bg: "#009df8", fg: "#0b1730" },
  { bg: "#e5f3fe", fg: "#142240" },
  { bg: "#1c2c51", fg: "#7fcbfb" },
];

const cross = (
  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#e5735c]/25 text-[#ffb3a3] ring-1 ring-[#e5735c]/50">
    <svg viewBox="0 0 24 24" className="size-3" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M7 7l10 10M17 7 7 17" /></svg>
  </span>
);
const check = (
  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-current/15 ring-1 ring-current/40">
    <CheckIcon className="size-3.5" />
  </span>
);

/**
 * Why MSG, as a scroll timeline (Framer's "Scrolltimeline"): the six hard parts of selling online, each first as it is
 * on your own (charcoal, the problem and one big word) and then wiped over by MSG's answer in the brand's colours, a
 * seam of light running along the wipe. Each side holds still for a moment, so it reads as before and after, not a
 * scrub. The close and the WhatsApp line follow.
 */
export default function Pitch({ t, lang }: { t: Dictionary; lang: Locale }) {
  const c = pitchCopy[lang];
  const total = String(c.rows.length).padStart(2, "0");
  const panels: TimelinePanel[] = c.rows.flatMap((r, i) => {
    // the count stays "01 / 06" in Arabic too (isolated left to right)
    const n = `\u2066${String(i + 1).padStart(2, "0")} / ${total}\u2069`;
    return [
      { eyebrow: `${n} · ${c.toggle[0]}`, mark: cross, desc: r.pain, big: r.own, ...OWN },
      { eyebrow: `${n} · ${c.toggle[1]}`, mark: check, desc: r.fix, big: r.win, glow: true, ...WIN[i % WIN.length] },
    ];
  });

  return (
    <section id="why" data-theme="dark" aria-labelledby="why-title" className="on-dark relative isolate scroll-mt-16 bg-pitch pb-16 pt-24 text-white lg:pb-24 lg:pt-28">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(60%_40%_at_80%_0%,rgba(0,157,248,0.16),transparent_70%)]" />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-bright rtl:tracking-normal">{c.eyebrow}</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <h2 id="why-title" className="h-scene">{c.title}</h2>
          <p className="max-w-xl text-lg leading-relaxed text-white/80 text-pretty lg:justify-self-end">{c.lead}</p>
        </div>
        <p className="mt-8 flex items-center gap-2 text-sm font-semibold text-white/60">
          <svg viewBox="0 0 24 24" className="size-4 animate-bounce" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
          {c.scrollHint}
        </p>
      </div>

      <div className="mx-auto mt-6 max-w-[96rem] px-3 lg:px-6">
        <ScrollTimeline panels={panels} rtl={lang === "ar"} label={c.toggleLabel} />
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
