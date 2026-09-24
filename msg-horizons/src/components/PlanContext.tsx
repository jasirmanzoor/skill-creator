"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { PlanInput } from "@/lib/planner";

type Ctx = { plan: PlanInput | null; setPlan: (p: PlanInput | null) => void };
const PlanCtx = createContext<Ctx>({ plan: null, setPlan: () => {} });

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<PlanInput | null>(null);
  const value = useMemo(() => ({ plan, setPlan }), [plan]);
  return <PlanCtx.Provider value={value}>{children}</PlanCtx.Provider>;
}

export const usePlan = () => useContext(PlanCtx);
