"use client";

import NumberFlow from "@number-flow/react";
import { useId, useMemo } from "react";
import type { Locale } from "@/content/i18n";
import { sizerCopy } from "@/content/sizerCopy";
import type { Persona } from "@/lib/planner";
import {
  AREAS, PROFILES, WINDOWS, ordersFromSlider, size, sliderFromOrders,
  type SizerInput, type Structure,
} from "@/lib/sizer";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/* ───────────────────────── Controls ───────────────────────── */

export function SizerControls({
  value, onChange, lang,
}: { value: SizerInput; onChange: (v: SizerInput) => void; lang: Locale }) {
  const c = sizerCopy[lang].inputs;
  const id = useId();
  const set = <K extends keyof SizerInput>(k: K, v: SizerInput[K]) => onChange({ ...value, [k]: v });

  return (
    <div className="grid gap-7">
      <div>
        <div className="flex items-end justify-between gap-4">
          <label htmlFor={`${id}-orders`} className="text-sm font-medium text-ink">{c.orders}</label>
          <span className="num font-display text-3xl font-semibold tracking-[-0.03em] text-ink">
            {value.orders.toLocaleString("en-US")}
            <span className="ms-1.5 text-sm font-normal tracking-normal text-muted">{c.ordersUnit}</span>
          </span>
        </div>
        <input
          id={`${id}-orders`}
          type="range" min={0} max={1000} step={1}
          value={Math.round(sliderFromOrders(value.orders) * 1000)}
          aria-valuetext={`${value.orders.toLocaleString("en-US")} ${c.ordersUnit}`}
          onChange={(e) => set("orders", ordersFromSlider(+e.target.value / 1000))}
          className="sizer-range mt-3 w-full"
        />
      </div>

      <div>
        <div className="flex items-end justify-between gap-4">
          <label htmlFor={`${id}-peak`} className="text-sm font-medium text-ink">{c.peak}</label>
          <span className="num font-display text-2xl font-semibold text-ink">{value.peak}×</span>
        </div>
        <p className="mt-0.5 text-xs text-muted">{c.peakHint}</p>
        <input
          id={`${id}-peak`}
          type="range" min={1} max={5} step={0.5}
          value={value.peak}
          aria-valuetext={`${value.peak}×`}
          onChange={(e) => set("peak", +e.target.value)}
          className="sizer-range mt-3 w-full"
        />
      </div>

      <Segmented label={c.area} options={AREAS} labels={c.areas} value={value.area} onChange={(v) => set("area", v)} />
      <Segmented label={c.window} options={WINDOWS} labels={c.windows} value={value.window} onChange={(v) => set("window", v)} />
      <Segmented label={c.profile} options={PROFILES} labels={c.profiles} value={value.profile} onChange={(v) => set("profile", v)} />
      <Segmented
        label={c.stock}
        options={["no", "yes"] as const}
        labels={{ no: c.stockNo, yes: c.stockYes }}
        value={value.stock ? "yes" : "no"}
        onChange={(v) => set("stock", v === "yes")}
      />

      <div>
        <div className="flex items-end justify-between gap-4">
          <label htmlFor={`${id}-cod`} className="text-sm font-medium text-ink">{c.cod}</label>
          <span className="num font-display text-2xl font-semibold text-ink">{value.cod}%</span>
        </div>
        <input
          id={`${id}-cod`}
          type="range" min={0} max={100} step={5}
          value={value.cod}
          aria-valuetext={`${value.cod}%`}
          onChange={(e) => set("cod", +e.target.value)}
          className="sizer-range mt-3 w-full"
        />
      </div>
    </div>
  );
}

function Segmented<T extends string>({
  label, options, labels, value, onChange,
}: { label: string; options: readonly T[]; labels: Record<T, string>; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{label}</legend>
      <div role="radiogroup" aria-label={label} className="mt-2.5 grid gap-1 rounded-lg bg-subtle p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={value === o}
            onClick={() => onChange(o)}
            className={`rounded-md px-2 py-2 text-sm leading-tight transition-all duration-200 ${
              value === o ? "bg-surface font-medium text-ink shadow-[0_1px_3px_rgba(12,14,17,0.12)]" : "text-muted hover:text-ink"
            }`}
          >
            {labels[o]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/* ───────────────────────── Live readout ───────────────────────── */

export function useStructure(input: SizerInput, persona: Persona | null | undefined) {
  return useMemo(() => size(input, persona), [input, persona]);
}

export function SizerLive({
  input, structure: s, lang, compact = false,
}: { input: SizerInput; structure: Structure; lang: Locale; compact?: boolean }) {
  const c = sizerCopy[lang];
  const reduce = useReducedMotion();
  const flow = reduce ? { animated: false } : {};
  const kpis = [
    { k: c.kpis.routes, v: s.baseRoutes },
    { k: c.kpis.couriers, v: s.baseCouriers },
    { k: c.kpis.peak, v: s.peakCouriers, accent: true },
    { k: c.kpis.flex, v: s.flex },
  ];
  return (
    <div>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand rtl:tracking-normal">
        <span className="relative inline-flex size-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-brand/50 motion-reduce:hidden" />
          <span className="relative inline-flex size-2 rounded-full bg-brand" />
        </span>
        {c.live}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line">
        {kpis.map((x) => (
          <div key={x.k} className="bg-surface p-4">
            <dt className="text-xs text-muted">{x.k}</dt>
            <dd className={`num mt-1 font-display text-3xl font-semibold tracking-[-0.03em] ${x.accent ? "text-brand" : "text-ink"}`}>
              <NumberFlow value={x.v} locales="en-US" format={{ useGrouping: true }} {...flow} />
            </dd>
          </div>
        ))}
      </dl>
      <CourierField structure={s} legend={c.legend} />
      <p aria-live="polite" className={`mt-5 border-s-2 border-brand ps-4 font-medium text-ink text-pretty ${compact ? "text-sm" : "text-base"}`}>
        {c.headline(s, input)}
      </p>
    </div>
  );
}

/**
 * One dot per courier (or per ten, at scale): ink for the everyday team, brand blue for peak-only
 * capacity. It is the calculation made visible — the flex pool literally lights up as the peak grows.
 */
function CourierField({ structure: s, legend }: { structure: Structure; legend: { base: (per: number) => string; peak: string } }) {
  const per = s.peakCouriers > 400 ? 10 : 1;
  const base = Math.ceil(s.baseCouriers / per);
  const total = Math.max(base, Math.ceil(s.peakCouriers / per));
  const shown = Math.min(total, 240);
  return (
    <div aria-hidden="true" className="mt-4">
      {/* capped at 240 dots so the field stays calm at enterprise volumes */}
      <div className="flex flex-wrap gap-[3px]">
        {Array.from({ length: shown }, (_, i) => (
          <span
            key={i}
            className={`size-[7px] rounded-full transition-all duration-500 ${i < base ? "bg-ink" : "bg-brand"}`}
            style={{ transitionDelay: `${Math.min(i, 60) * 6}ms` }}
          />
        ))}
      </div>
      <p className="mt-2 flex items-center gap-4 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5"><span className="size-[7px] rounded-full bg-ink" />{legend.base(per)}</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-[7px] rounded-full bg-brand" />{legend.peak}</span>
      </p>
    </div>
  );
}

/* ───────────────────────── Decisions (result) ───────────────────────── */

export function SizerDecisions({ input, structure: s, lang }: { input: SizerInput; structure: Structure; lang: Locale }) {
  const c = sizerCopy[lang];
  return (
    <div>
      <ol className="divide-y divide-line border-y border-line">
        {s.decisions.map((d, i) => {
          const x = c.decision(d);
          return (
            <li key={d.id} className="flex gap-4 py-4">
              <span className="num mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-medium text-white">{i + 1}</span>
              <div className="min-w-0">
                <p className="font-semibold text-ink">{x.title}</p>
                <p className="mt-0.5 text-sm text-muted">{x.why}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <details className="group mt-5 text-sm">
        <summary className="cursor-pointer list-none font-medium text-ink underline-offset-4 hover:underline">
          <span className="me-1 inline-block transition-transform group-open:rotate-90 rtl:group-open:-rotate-90">›</span>
          {c.assumptionsTitle}
        </summary>
        <ul className="mt-3 space-y-1.5 ps-4 text-muted">
          {c.assumptions.map((a) => <li key={a} className="list-disc">{a}</li>)}
        </ul>
      </details>
      <p className="mt-4 text-xs text-muted">{c.disclaimer}</p>
      <span className="sr-only">{c.summary(s, input).join(". ")}</span>
    </div>
  );
}
