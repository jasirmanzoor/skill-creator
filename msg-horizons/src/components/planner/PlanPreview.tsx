"use client";

import { facts } from "@/content/facts";
import type { Dictionary } from "@/content/i18n";
import { buildPlan, type PlanInput } from "@/lib/planner";
import { CheckIcon, ServiceIcon } from "@/components/ui/icons";

/** The services your answers have switched on so far, as chips that light up while you answer. */
export default function PlanModules({ t, input, label }: { t: Dictionary; input: PlanInput | null; label: string }) {
  const plan = input ? buildPlan(input) : null;
  const byId = new Map(plan?.modules.map((m) => [m.id, m]) ?? []);
  return (
    <aside aria-label={t.planner.preview.title}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted rtl:tracking-normal">
        {label}
        <span className="ms-2 font-normal normal-case tracking-normal">{plan ? t.planner.result.models[plan.model].name : t.planner.preview.empty}</span>
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {facts.services.map((id) => {
          const m = byId.get(id);
          return (
            <li
              key={id}
              className={`inline-flex items-center gap-1.5 rounded-full py-1 pe-3 ps-1.5 text-xs transition-ui duration-500 ${
                m ? (m.core ? "bg-brand font-semibold text-white" : "bg-brand-soft font-semibold text-brand") : "bg-subtle text-muted"
              }`}
            >
              <ServiceIcon id={id} className="size-3.5" />
              {t.planner.services[id].name}
              {m ? <CheckIcon className="size-3" /> : null}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
