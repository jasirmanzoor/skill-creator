import type { Dictionary, Locale } from "@/content/i18n";
import { sizerCopy } from "@/content/sizerCopy";
import { size } from "./sizer";
import { buildPlan, type PlanInput } from "./planner";

/** Human-readable plan summary for WhatsApp / email / the lead record. */
export function planSummary(t: Dictionary, input: PlanInput, lang: Locale = "en"): string {
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
  if (input.net) {
    const c = sizerCopy[lang];
    const st = size(input.net, input.persona);
    lines.push("", ...c.summary(st, input.net).map((l) => `• ${l}`), c.headline(st, input.net));
  }
  lines.push("", ...plan.modules.map((m) => `✓ ${t.planner.services[m.id].name}`));
  return lines.join("\n");
}
