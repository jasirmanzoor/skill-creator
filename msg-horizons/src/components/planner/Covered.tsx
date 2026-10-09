import { coveredCopy, PILLARS } from "@/content/covered";
import { roadmapCopy } from "@/content/roadmap";
import type { Locale } from "@/content/i18n";
import { approxCost } from "@/lib/estimate";
import type { SizerInput } from "@/lib/sizer";
import { CheckIcon } from "../ui/icons";
import { CoverIcon } from "../ui/coverIcons";

/**
 * The client's view of a plan: a price they can plan around, and what is covered. It deliberately says nothing
 * about routes, courier counts or other operating detail; that stays with MSG's team.
 */

/** the approximate price per order, from MSG's rate card at the visitor's own volume */
export function QuoteBlock({ net, lang, tone = "light" }: { net: SizerInput; lang: Locale; tone?: "light" | "tint" }) {
  const c = roadmapCopy[lang].plan;
  const k = coveredCopy[lang].ui;
  const cost = approxCost(net);
  const n = (v: number) => v.toLocaleString("en-US");
  return (
    <aside data-rate-card className={`rounded-2xl p-5 ${tone === "tint" ? "border border-white bg-sea-100/80" : "border border-brand/20 bg-brand-soft"}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand rtl:tracking-normal">{k.quoteTitle}</p>
      <p className="mt-3">
        <span className="num block font-display text-5xl font-semibold tracking-[-0.03em] text-ink" dir={lang === "ar" ? "rtl" : "ltr"}>
          <span className="text-2xl text-ink/70">≈ </span>
          {lang === "ar" ? <>{n(cost.perOrder)} <span className="text-2xl text-ink/70">ريال</span></> : <><span className="text-2xl text-ink/70">SAR</span> {n(cost.perOrder)}</>}
          <span className="ms-2 text-base font-normal tracking-normal text-ink/70">{k.unit}</span>
        </span>
        <span className="mt-2 block text-sm text-ink/80">
          {c.costMonthly.replace("{total}", n(cost.monthly)).replace("{n}", n(cost.orders))}
        </span>
      </p>
      <p className="mt-3 text-sm text-ink/70">{c.costNote}</p>
    </aside>
  );
}

/** the four checkpoints every plan includes */
export function MustList({ lang, compact = false }: { lang: Locale; compact?: boolean }) {
  const c = coveredCopy[lang];
  return (
    <ul className={compact ? "grid gap-2" : "grid gap-3 sm:grid-cols-2"}>
      {c.musts.map((m) => (
        <li key={m.id} className={`flex items-start gap-3 rounded-xl border border-line bg-surface ${compact ? "p-2.5" : "p-3.5"}`}>
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
            <CoverIcon id={m.id} className="size-[18px]" />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 font-semibold text-ink">
              {m.t}
              <CheckIcon className="size-3.5 text-brand" />
            </span>
            {compact ? null : <span className="mt-0.5 block text-sm leading-snug text-muted">{m.d}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** the six areas MSG already has in place */
export function Pillars({ lang }: { lang: Locale }) {
  const c = coveredCopy[lang];
  return (
    <>
      <h4 className="font-display text-xl font-semibold text-ink">{c.ui.handled}</h4>
      <p className="mt-1 text-sm text-muted">{c.ui.handledLead}</p>
      <ul className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {PILLARS.map((id) => {
          const p = c.pillars.find((x) => x.id === id)!;
          return (
            <li key={id} className="flex items-start gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <CoverIcon id={id} className="size-[18px]" />
              </span>
              <span>
                <span className="block font-semibold text-ink">{p.t}</span>
                <span className="mt-0.5 block text-sm leading-snug text-muted">{p.d}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

