import type { Dictionary } from "@/content/i18n";
import { buildPlan, type PlanInput } from "./planner";

/** Human-readable plan summary for WhatsApp / email / the lead record. */
export function planSummary(t: Dictionary, input: PlanInput): string {
  const plan = buildPlan(input);
  const s = t.planner.steps;
  const model = t.planner.result.models[plan.model];
  const lines = [
    `${t.planner.result.summaryTitle}: ${model.name}`,
    `• ${s.persona.q} ${s.persona.options[input.persona].t}`,
    `• ${s.cargo.q} ${(input.cargo.length ? input.cargo : ["parcels" as const]).map((c) => s.cargo.options[c].t).join(", ")}`,
    `• ${s.volume.q} ${s.volume.options[input.volume].t} (${s.volume.options[input.volume].d})`,
  ];
  if (input.priorities.length)
    lines.push(`• ${s.priorities.q} ${input.priorities.map((p) => s.priorities.options[p].t).join(", ")}`);
  lines.push("", ...plan.modules.map((m) => `✓ ${t.planner.services[m.id].name}`));
  return lines.join("\n");
}
