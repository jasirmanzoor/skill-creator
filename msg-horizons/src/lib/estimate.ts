import type { RateCard } from "../content/rates.ts";
import type { SizerInput } from "./sizer.ts";

const DAYS_PER_MONTH = 30;

/**
 * Monthly cost estimate from MSG's rate card. Returns null whenever a rate the plan needs
 * is missing, so the UI never shows a made-up price.
 */
export function estimateMonthly(i: SizerInput, r: RateCard): number | null {
  const per = r.perOrder[i.profile];
  if (per == null) return null;
  const monthly = i.orders * DAYS_PER_MONTH;
  let total = monthly * per;
  if (i.cod > 0) {
    if (r.codPerOrder == null) return null;
    total += monthly * (i.cod / 100) * r.codPerOrder;
  }
  if (i.stock) {
    if (r.storageMonthly == null) return null;
    total += r.storageMonthly;
  }
  if (i.area !== "riyadh" && r.outsideRiyadhPerOrder != null) {
    // share of orders leaving Riyadh is unknown here; MSG confirms it — apply to half as a planning midpoint
    total += monthly * 0.5 * r.outsideRiyadhPerOrder;
  }
  return Math.round(total);
}
