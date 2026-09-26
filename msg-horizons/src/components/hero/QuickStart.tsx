"use client";

import { PERSONAS, type Persona } from "@/lib/planner";
import { track } from "@/lib/analytics";
import { usePlan } from "../PlanContext";

/** The planner's first question, asked right in the hero. One tap opens the planner at step 2. */
export default function QuickStart({ options }: { options: Record<Persona, { t: string; d: string }> }) {
  const { startWith } = usePlan();
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {PERSONAS.map((k) => (
        <li key={k}>
          <button
            type="button"
            onClick={() => {
              track("cta_click", { cta: `quickstart_${k}`, location: "hero" });
              startWith(k);
            }}
            className="rounded-full border border-line-strong bg-surface px-3.5 py-2 text-sm text-ink transition-colors hover:border-ink"
          >
            {options[k].t}
          </button>
        </li>
      ))}
    </ul>
  );
}
