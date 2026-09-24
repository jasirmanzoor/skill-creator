"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Persona, PlanInput } from "@/lib/planner";

type Seed = { persona: Persona; n: number } | null;
type Ctx = {
  plan: PlanInput | null;
  setPlan: (p: PlanInput | null) => void;
  /** Hero quick-start: open the planner with a persona already chosen. */
  seed: Seed;
  startWith: (persona: Persona) => void;
};
const PlanCtx = createContext<Ctx>({ plan: null, setPlan: () => {}, seed: null, startWith: () => {} });

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<PlanInput | null>(null);
  const [seed, setSeed] = useState<Seed>(null);
  const startWith = useCallback((persona: Persona) => {
    setSeed((s) => ({ persona, n: (s?.n ?? 0) + 1 }));
    document.getElementById("planner")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const value = useMemo(() => ({ plan, setPlan, seed, startWith }), [plan, seed, startWith]);
  return <PlanCtx.Provider value={value}>{children}</PlanCtx.Provider>;
}

export const usePlan = () => useContext(PlanCtx);
