"use client";

import { MotionConfig } from "motion/react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Persona, PlanInput } from "@/lib/planner";
import type { Lane } from "@/content/redsea";
import { focusPanel } from "@/lib/deck";

type Seed = { persona: Persona; n: number } | null;
/** the delivery a visitor is pricing: set in the hero's quote card, read again by the price band */
export type Quote = { lane: Lane; orders: number };
type Ctx = {
  plan: PlanInput | null;
  setPlan: (p: PlanInput | null) => void;
  /** Hero quick-start: open the planner with a persona already chosen. */
  seed: Seed;
  startWith: (persona: Persona) => void;
  quote: Quote;
  setQuote: (q: Partial<Quote>) => void;
};
const START: Quote = { lane: "intra", orders: 300 };
const PlanCtx = createContext<Ctx>({ plan: null, setPlan: () => {}, seed: null, startWith: () => {}, quote: START, setQuote: () => {} });

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<PlanInput | null>(null);
  const [seed, setSeed] = useState<Seed>(null);
  const [quote, setQ] = useState<Quote>(START);
  const startWith = useCallback((persona: Persona) => {
    setSeed((s) => ({ persona, n: (s?.n ?? 0) + 1 }));
    focusPanel("planner");
  }, []);
  const setQuote = useCallback((q: Partial<Quote>) => setQ((prev) => ({ ...prev, ...q })), []);
  const value = useMemo(() => ({ plan, setPlan, seed, startWith, quote, setQuote }), [plan, seed, startWith, quote, setQuote]);
  // every Motion animation on the page honours the visitor's reduced-motion setting
  return (
    <PlanCtx.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </PlanCtx.Provider>
  );
}

export const usePlan = () => useContext(PlanCtx);
