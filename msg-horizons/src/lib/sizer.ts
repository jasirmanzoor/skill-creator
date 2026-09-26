import { facts } from "../content/facts.ts";
import type { Persona, Volume } from "@/lib/planner";

/**
 * Network sizer: turns a visitor's real numbers into the most efficient delivery structure.
 *
 * Every figure it returns is derived from the visitor's own inputs plus the published planning
 * assumptions below. It never returns prices, delivery times or success rates, and it never
 * implies MSG capacity beyond the verified facts (1,000+ couriers, 100+ vehicles, 24/7).
 */

export const AREAS = ["riyadh", "multi", "kingdom"] as const;
export const WINDOWS = ["sameday", "nextday", "scheduled"] as const;
export const PROFILES = ["small", "mixed", "bulky"] as const;

export type Area = (typeof AREAS)[number];
export type DeliveryWindow = (typeof WINDOWS)[number];
export type Profile = (typeof PROFILES)[number];

export type SizerInput = {
  orders: number; // average orders or shipments a day
  peak: number; // busiest day ÷ average day (1 = flat)
  area: Area;
  window: DeliveryWindow;
  profile: Profile;
  stock: boolean; // holds stock that MSG should store
  cod: number; // % of orders paid in cash at the door (0–100)
};

/** Planning assumptions. Shown to the visitor verbatim; MSG confirms real figures on the call. */
export const ASSUMPTIONS = {
  dropsPerRoute: { small: 32, mixed: 25, bulky: 14 } as Record<Profile, number>,
  sameDayDensity: 0.85, // tighter windows mean fewer stops per route
  codSlowdown: 0.2, // a fully cash-on-delivery route loses ~20% of stops to collection time
  cover: 0.1, // 10% cover for rest days and absence
  pickupDirectMax: 40, // up to this many orders a day, a courier collects straight from the seller
  pickupDedicatedMin: 400, // from here, a dedicated pickup vehicle feeds the hub
} as const;

export type Pickup = "direct" | "scheduled" | "dedicated" | "warehouse";
export type Cadence = "single" | "waves" | "slots" | "roundclock";

export type Decision =
  | { id: "routes"; routes: number; drops: number }
  | { id: "flex"; flex: number; peak: number }
  | { id: "pickup"; pickup: Pickup }
  | { id: "cadence"; cadence: Cadence }
  | { id: "linehaul"; area: Exclude<Area, "riyadh"> }
  | { id: "vehicles"; profile: Profile }
  | { id: "cod"; cod: number }
  | { id: "account" }
  | { id: "scale"; share: number; beyond: boolean };

export type Structure = {
  drops: number; // effective stops per route after window + COD adjustments
  baseRoutes: number;
  baseCouriers: number; // routes + cover
  peakCouriers: number;
  flex: number; // surge couriers needed only on peak days
  pickup: Pickup;
  cadence: Cadence;
  linehaul: boolean;
  account: boolean;
  scaleShare: number; // peak couriers as a share of MSG's published courier base (0–1+)
  headline: "flex" | "stock" | "linehaul" | "waves" | "lean";
  decisions: Decision[];
  volume: Volume; // band for the existing plan engine
};

export const DEFAULT_SIZER: SizerInput = {
  orders: 120,
  peak: 2,
  area: "riyadh",
  window: "nextday",
  profile: "small",
  stock: false,
  cod: 30,
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function volumeBand(orders: number): Volume {
  if (orders < 20) return "starting";
  if (orders < 200) return "steady";
  if (orders < 2000) return "scaling";
  return "high";
}

export function size(raw: SizerInput, persona?: Persona | null): Structure {
  const i: SizerInput = {
    ...raw,
    orders: clamp(Math.round(raw.orders), 1, 50_000),
    peak: clamp(raw.peak, 1, 5),
    cod: clamp(Math.round(raw.cod), 0, 100),
  };
  const A = ASSUMPTIONS;

  let drops = A.dropsPerRoute[i.profile];
  if (i.window === "sameday") drops *= A.sameDayDensity;
  drops *= 1 - A.codSlowdown * (i.cod / 100);
  drops = Math.max(4, Math.floor(drops));

  const baseRoutes = Math.max(1, Math.ceil(i.orders / drops));
  const baseCouriers = Math.ceil(baseRoutes * (1 + A.cover));
  const peakRoutes = Math.max(baseRoutes, Math.ceil((i.orders * i.peak) / drops));
  const peakCouriers = Math.ceil(peakRoutes * (1 + A.cover));
  const flex = peakCouriers - baseCouriers;

  const pickup: Pickup = i.stock
    ? "warehouse"
    : i.orders <= A.pickupDirectMax
      ? "direct"
      : i.orders < A.pickupDedicatedMin
        ? "scheduled"
        : "dedicated";

  const cadence: Cadence =
    persona === "platform" || i.orders >= 5000
      ? "roundclock"
      : i.window === "sameday"
        ? "waves"
        : i.window === "scheduled"
          ? "slots"
          : "single";

  const linehaul = i.area !== "riyadh";
  const account = persona === "enterprise" || persona === "platform" || i.orders >= 200 || peakCouriers >= 20;
  const scaleShare = peakCouriers / facts.metrics.couriers.value;

  const headline: Structure["headline"] =
    i.peak >= 1.8 && flex >= 2
      ? "flex"
      : i.stock
        ? "stock"
        : linehaul
          ? "linehaul"
          : i.window === "sameday"
            ? "waves"
            : "lean";

  const decisions: Decision[] = [
    { id: "routes", routes: baseRoutes, drops },
    ...(flex > 0 ? [{ id: "flex", flex, peak: i.peak } as const] : []),
    { id: "pickup", pickup },
    { id: "cadence", cadence },
    ...(linehaul ? [{ id: "linehaul", area: i.area as Exclude<Area, "riyadh"> } as const] : []),
    { id: "vehicles", profile: i.profile },
    ...(i.cod > 0 ? [{ id: "cod", cod: i.cod } as const] : []),
    ...(account ? [{ id: "account" } as const] : []),
    { id: "scale", share: scaleShare, beyond: scaleShare > 1 },
  ];

  return {
    drops,
    baseRoutes,
    baseCouriers,
    peakCouriers,
    flex,
    pickup,
    cadence,
    linehaul,
    account,
    scaleShare,
    headline,
    decisions,
    volume: volumeBand(i.orders),
  };
}

/** Compact URL segment, e.g. o120_p2_ariyadh_wnextday_fsmall_s0_c30. */
export function encodeSizer(i: SizerInput): string {
  return ["o" + i.orders, "p" + i.peak, "a" + i.area, "w" + i.window, "f" + i.profile, "s" + (i.stock ? 1 : 0), "c" + i.cod].join("_");
}

export function decodeSizer(s: string | null | undefined): SizerInput | null {
  if (!s) return null;
  const out: SizerInput = { ...DEFAULT_SIZER };
  for (const part of s.split("_")) {
    const k = part[0];
    const v = part.slice(1);
    if (k === "o" && Number.isFinite(+v)) out.orders = clamp(Math.round(+v), 1, 50_000);
    else if (k === "p" && Number.isFinite(+v)) out.peak = clamp(+v, 1, 5);
    else if (k === "a" && (AREAS as readonly string[]).includes(v)) out.area = v as Area;
    else if (k === "w" && (WINDOWS as readonly string[]).includes(v)) out.window = v as DeliveryWindow;
    else if (k === "f" && (PROFILES as readonly string[]).includes(v)) out.profile = v as Profile;
    else if (k === "s") out.stock = v === "1";
    else if (k === "c" && Number.isFinite(+v)) out.cod = clamp(Math.round(+v), 0, 100);
  }
  return out;
}

/** Slider scale for orders a day: logarithmic so 5 and 5,000 are both easy to reach. */
export const ORDER_MIN = 5;
export const ORDER_MAX = 20_000;
export function ordersFromSlider(t: number): number {
  const v = ORDER_MIN * Math.pow(ORDER_MAX / ORDER_MIN, clamp(t, 0, 1));
  const step = v < 100 ? 5 : v < 1000 ? 10 : v < 5000 ? 50 : 100;
  return Math.max(ORDER_MIN, Math.round(v / step) * step);
}
export function sliderFromOrders(o: number): number {
  return Math.log(clamp(o, ORDER_MIN, ORDER_MAX) / ORDER_MIN) / Math.log(ORDER_MAX / ORDER_MIN);
}
