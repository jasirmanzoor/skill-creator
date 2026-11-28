import { RATE_CARD, TIER_FROM, type Lane } from "../content/redsea.ts";
import { EXTRA_RATES, type ExtraRates } from "../content/quoteRates.ts";
import type { SizerInput } from "./sizer.ts";

/**
 * The plan builder's quote. Every priced line is MSG's own 1 kg next-day rate card (content/redsea.ts) multiplied
 * by the visitor's own numbers; nothing is invented. Anything the rate card does not cover (cash on delivery,
 * same-day, heavier parcels, storage, returns) is listed as "confirmed by MSG" until MSG fills in
 * content/quoteRates.ts, at which point it is priced and added automatically.
 */

export const DAYS_PER_MONTH = 30;

export type LaneLine = { lane: Lane; shipments: number; rate: number; total: number };
export type ExtraId = "cod" | "sameday" | "weight" | "storage" | "returns";
/** `total` is null while MSG has not supplied the rate: the line shows "confirmed by MSG" */
export type ExtraLine = { id: ExtraId; shipments: number | null; rate: number | null; total: number | null };

export type Quote = {
  /** shipments a month at the visitor's normal-day volume */
  monthly: number;
  lanes: LaneLine[];
  extras: ExtraLine[];
  /** priced lines only (rate card + any extras MSG has supplied) */
  subtotal: number;
  /** blended price per order across the priced lines */
  perOrder: number;
  annual: number;
  /** what a normal day and the busiest day cost at these rates */
  day: number;
  peakDay: number;
  tier: {
    reached: boolean;
    from: number;
    /** shipments a month still to go to reach the volume tier (0 once reached) */
    toGo: number;
    /** monthly saving the volume tier brings at this lane mix (once reached, what it is already saving) */
    saving: number;
  };
  /** how many lines are still waiting on MSG's rate */
  pending: number;
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** share of orders that leave the origin city, from the area choice (and the visitor's own split when mixed) */
export function interShare(i: Pick<SizerInput, "area" | "split">): number {
  if (i.area === "riyadh") return 0;
  if (i.area === "kingdom") return 1;
  return clamp(i.split ?? 50, 0, 100) / 100;
}

export function lanesFor(origin: SizerInput["origin"]): { local: Lane; away: Lane } {
  return origin === "sabya" ? { local: "sabyaLocal", away: "sabyaMajor" } : { local: "intra", away: "inter" };
}

export function quote(i: SizerInput, extra: ExtraRates = EXTRA_RATES): Quote {
  const orders = clamp(Math.round(i.orders), 1, 50_000);
  const monthly = orders * DAYS_PER_MONTH;
  const share = interShare(i);
  const { local, away } = lanesFor(i.origin);
  const reached = monthly >= TIER_FROM;
  const tierOf = (lane: Lane, at: boolean) => (at ? RATE_CARD[lane].t299 : RATE_CARD[lane].walkin);

  const awayN = Math.round(monthly * share);
  const counts: [Lane, number][] = [[local, monthly - awayN], [away, awayN]];
  const lanes: LaneLine[] = counts
    .filter(([, n]) => n > 0)
    .map(([lane, n]) => ({ lane, shipments: n, rate: tierOf(lane, reached), total: n * tierOf(lane, reached) }));

  const per = (id: ExtraId, shipments: number, rate: number | null): ExtraLine => ({
    id, shipments, rate, total: rate == null ? null : Math.round(shipments * rate),
  });
  const extras: ExtraLine[] = [];
  const cod = clamp(Math.round(i.cod), 0, 100);
  if (cod > 0) extras.push(per("cod", Math.round((monthly * cod) / 100), extra.codPerOrder));
  if (i.window === "sameday") extras.push(per("sameday", monthly, extra.sameDayPerOrder));
  if (i.profile !== "small") extras.push(per("weight", monthly, i.profile === "bulky" ? extra.bulkyPerOrder : extra.mixedPerOrder));
  if (i.stock) extras.push({ id: "storage", shipments: null, rate: extra.storageMonthly, total: extra.storageMonthly });
  // how many orders come back is not known in advance, so returns are never added to the total
  extras.push({ id: "returns", shipments: null, rate: extra.returnPerOrder, total: null });

  const laneTotal = lanes.reduce((a, l) => a + l.total, 0);
  const subtotal = laneTotal + extras.reduce((a, x) => a + (x.total ?? 0), 0);
  // per-order and per-day figures follow the per-shipment lines; a flat storage charge is spread over the month
  const variable = laneTotal + extras.filter((x) => x.id !== "storage").reduce((a, x) => a + (x.total ?? 0), 0);
  const perOrderExact = variable / monthly;
  const fixedPerDay = (subtotal - variable) / DAYS_PER_MONTH;
  const peak = clamp(i.peak, 1, 5);

  // the tier is reached on total monthly shipments; the saving is the same lane mix priced on both tiers
  const mix = (at: boolean) => counts.reduce((a, [lane, n]) => a + n * tierOf(lane, at), 0);
  const saving = mix(false) - mix(true);

  return {
    monthly,
    lanes,
    extras,
    subtotal: Math.round(subtotal),
    perOrder: Math.round(perOrderExact * 10) / 10,
    annual: Math.round(subtotal * 12),
    day: Math.round(orders * perOrderExact + fixedPerDay),
    peakDay: Math.round(Math.round(orders * peak) * perOrderExact + fixedPerDay),
    tier: { reached, from: TIER_FROM, toGo: reached ? 0 : TIER_FROM - monthly, saving },
    pending: extras.filter((x) => x.total == null).length,
  };
}

/** A short, stable reference for a quote, so MSG and the client can talk about the same one. */
export function quoteRef(code: string): string {
  let h = 2166136261;
  for (let k = 0; k < code.length; k++) {
    h ^= code.charCodeAt(k);
    h = Math.imul(h, 16777619);
  }
  return "MSG-" + (h >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(-6);
}
