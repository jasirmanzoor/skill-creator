"use client";

import { facts } from "@/content/facts";
import type { Dictionary } from "@/content/i18n";
import { buildPlan, type PlanInput } from "@/lib/planner";
import { CheckIcon, ServiceIcon } from "@/components/ui/icons";

export default function PlanModules({
  t,
  input,
}: {
  t: Dictionary;
  input: PlanInput | null;
}) {
  const plan = input ? buildPlan(input) : null;
  const byId = new Map(plan?.modules.map((m) => [m.id, m]) ?? []);
  return (
    <aside aria-label={t.planner.preview.title} className="hidden border-s border-line bg-paper p-7 lg:block">
      <p className="text-sm font-semibold text-ink">{t.planner.preview.title}</p>
      <p className="mt-1 text-sm text-muted">
        {plan ? t.planner.result.models[plan.model].name : t.planner.preview.empty}
      </p>
      <ul className="mt-5 divide-y divide-line border-y border-line">
        {facts.services.map((id) => {
          const m = byId.get(id);
          return (
            <li key={id} className="flex items-center gap-3 py-2.5 text-sm">
              <span
                className={`inline-flex size-7 items-center justify-center rounded-md transition-colors duration-300 ${
                  m ? (m.core ? "bg-brand text-white" : "bg-brand-soft text-brand") : "bg-subtle text-faint"
                }`}
              >
                <ServiceIcon id={id} className="size-4" />
              </span>
              <span className={`flex-1 transition-colors duration-300 ${m ? "font-medium text-ink" : "text-muted"}`}>
                {t.planner.services[id].name}
              </span>
              {m ? <CheckIcon className="size-4 text-brand" /> : null}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
