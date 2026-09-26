"use client";

import { PERSONAS, type Persona } from "@/lib/planner";
import { track } from "@/lib/analytics";
import { usePlan } from "../PlanContext";

type Option = { t: string; d: string };

/**
 * First decision on the page. Large enough to tap in 15 seconds.
 * One choice seeds the planner and scrolls to the product.
 */
export default function PersonaGate({
  options,
  promises,
}: {
  options: Record<Persona, Option>;
  promises: Record<Persona, string>;
}) {
  const { startWith } = usePlan();

  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {PERSONAS.map((k, i) => {
        const featured = k === "ecommerce";
        return (
          <li key={k} className={featured ? "sm:col-span-2 lg:col-span-1" : undefined}>
            <button
              type="button"
              onClick={() => {
                track("cta_click", { cta: `quickstart_${k}`, location: "hero_gate" });
                startWith(k);
              }}
              className="animate-rise group flex h-full w-full flex-col rounded-xl border border-line-strong/80 bg-surface/90 px-4 py-4 text-start shadow-[0_12px_40px_-28px_rgba(12,14,17,0.45)] backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:border-ink hover:shadow-[0_18px_50px_-24px_rgba(12,14,17,0.5)] focus-visible:border-brand"
              style={{ animationDelay: `${900 + i * 80}ms` }}
            >
              <span className="font-display text-base font-semibold tracking-[-0.02em] text-ink rtl:tracking-normal">
                {options[k].t}
              </span>
              <span className="mt-1.5 text-sm leading-snug text-ink-3">{promises[k]}</span>
              <span className="mt-3 text-xs font-medium text-brand transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
                →
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
