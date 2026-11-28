import { approxCost } from "./estimate.ts";
import type { SizerInput } from "./sizer.ts";

/**
 * What the configurator may say about price. MSG's supplied rate card (content/redsea.ts) prices one thing: 1 kg
 * parcels delivered next day, by lane and by monthly volume. approxCost() turns the visitor's numbers into that
 * estimate and is left exactly as it is. This only decides when the estimate applies:
 *
 *   - small parcels, next-day delivery: the rate-card estimate, per order and per month;
 *   - same day, a chosen slot, mixed sizes or bulky items: the rate card has no price for them, so the answer is
 *     "MSG confirms" (the next-day figure is kept only as a labelled reference, never as the quote).
 *
 * Cash on delivery, storage and returns are never priced here; they are confirmed in MSG's quote.
 */
export type Price =
  | { kind: "estimate"; perOrder: number; monthly: number; orders: number }
  | { kind: "confirm"; reason: "window" | "profile"; reference: { perOrder: number; monthly: number; orders: number } };

export function priceFor(net: SizerInput): Price {
  const cost = approxCost(net);
  if (net.window !== "nextday") return { kind: "confirm", reason: "window", reference: cost };
  if (net.profile !== "small") return { kind: "confirm", reason: "profile", reference: cost };
  return { kind: "estimate", ...cost };
}
