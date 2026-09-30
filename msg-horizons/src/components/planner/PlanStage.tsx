"use client";

import { useMemo } from "react";
import type { Locale } from "@/content/i18n";
import { buildPlan, type PlanInput } from "@/lib/planner";
import NetworkConsole from "./NetworkConsole";

type Props = {
  locale: Locale;
  input: PlanInput | null;
  complete?: boolean;
};

/**
 * The planner's operating canvas. The visitor's answers reshape a live network simulation:
 * who they are sets the pickup points, volume sets the courier count, and what they move adds
 * a warehouse, line-haul or shift teams. Nothing resets: features shift in on the running map.
 */
export default function PlanStage({ locale, input, complete = false }: Props) {
  const plan = input ? buildPlan(input) : null;
  const origins =
    input?.persona === "platform" ? 5 : input?.persona === "enterprise" ? 3 : input?.persona === "ecommerce" ? 2 : 1;
  const couriers =
    input?.volume === "high" ? 16 : input?.volume === "scaling" ? 11 : input?.volume === "steady" ? 7 : input ? 4 : 3;
  const storage = Boolean(input?.cargo.includes("storage") || plan?.modules.some((m) => m.id === "warehousing"));
  const freight = Boolean(input?.cargo.includes("freight") || input?.cargo.includes("b2b"));
  const people = Boolean(input?.cargo.includes("people") || plan?.modules.some((m) => m.id === "manpower"));
  const cfg = useMemo(() => ({ origins, couriers, storage, freight, people }), [origins, couriers, storage, freight, people]);
  return <NetworkConsole locale={locale} cfg={cfg} statusIdle={!input} complete={complete} />;
}
