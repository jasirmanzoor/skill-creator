import type { ServiceId } from "@/content/facts";
import { decodeSizer, encodeSizer, type SizerInput } from "./sizer.ts";

/**
 * "Build your logistics" engine.
 * Maps a visitor's answers to a configuration of MSG Horizons' documented services.
 * It never produces prices, SLAs or promises — only which services fit and why.
 */

export const PERSONAS = ["seller", "startup", "ecommerce", "enterprise", "platform"] as const;
export const CARGO = ["parcels", "b2b", "freight", "storage", "people"] as const;
export const VOLUMES = ["starting", "steady", "scaling", "high"] as const;
export const PRIORITIES = ["speed", "ontime", "visibility", "security", "peaks", "account", "inventory"] as const;

export type Persona = (typeof PERSONAS)[number];
export type Cargo = (typeof CARGO)[number];
export type Volume = (typeof VOLUMES)[number];
export type Priority = (typeof PRIORITIES)[number];

export type PlanInput = {
  persona: Persona;
  cargo: Cargo[];
  volume: Volume;
  priorities: Priority[];
  /** The visitor's real numbers from the network sizer (optional: older links have none). */
  net?: SizerInput;
};

export type Reason =
  | "baseline"
  | `cargo.${Cargo}`
  | `priority.${Priority}`
  | `persona.${Persona}`
  | `volume.${Volume}`
  | "net.linehaul"
  | "net.stock"
  | "net.peak";

export type PlanModule = { id: ServiceId; core: boolean; reasons: Reason[] };

export type OperatingModel = "launchpad" | "growth" | "enterprise" | "capacity";

export type Plan = { model: OperatingModel; modules: PlanModule[] };

const ORDER: ServiceId[] = ["last-mile", "warehousing", "land-freight", "fleet", "manpower", "tracking", "account"];

export function operatingModel(input: PlanInput): OperatingModel {
  if (input.persona === "platform") return "capacity";
  if (input.persona === "enterprise" || input.volume === "high") return "enterprise";
  if (input.persona === "ecommerce" || input.volume === "scaling" || input.volume === "steady") return "growth";
  return "launchpad";
}

export function buildPlan(input: PlanInput): Plan {
  const mods = new Map<ServiceId, PlanModule>();
  const add = (id: ServiceId, reason: Reason, core = false) => {
    const m = mods.get(id) ?? { id, core: false, reasons: [] };
    if (!m.reasons.includes(reason)) m.reasons.push(reason);
    m.core = m.core || core;
    mods.set(id, m);
  };
  const has = (c: Cargo) => input.cargo.includes(c);
  const wants = (p: Priority) => input.priorities.includes(p);
  const cargo = input.cargo.length ? input.cargo : (["parcels"] as Cargo[]);

  // What is being moved decides the core of the configuration.
  if (cargo.includes("parcels")) add("last-mile", "cargo.parcels", true);
  if (has("b2b")) add("land-freight", "cargo.b2b", true);
  if (has("freight")) {
    add("land-freight", "cargo.freight", true);
    add("fleet", "cargo.freight");
  }
  if (has("storage")) add("warehousing", "cargo.storage", true);
  if (has("people")) add("manpower", "cargo.people", true);

  // Who is asking.
  if (input.persona === "platform") {
    add("manpower", "persona.platform", true);
    add("fleet", "persona.platform", true);
  }
  if (input.persona === "enterprise") {
    add("fleet", "persona.enterprise");
    add("account", "persona.enterprise");
  }

  // Attach a priority to the first matching module already in the plan (or a fallback),
  // so a priority never drags in a service the visitor did not ask to move.
  const attach = (reason: Reason, candidates: ServiceId[], fallback: ServiceId) =>
    add(candidates.find((c) => mods.has(c)) ?? fallback, reason);

  // What matters most.
  if (wants("speed")) attach("priority.speed", ["last-mile", "land-freight", "fleet"], "fleet");
  if (wants("ontime")) attach("priority.ontime", ["last-mile", "land-freight", "manpower"], "fleet");
  if (wants("visibility")) add("tracking", "priority.visibility", true);
  if (wants("security")) attach("priority.security", ["land-freight", "last-mile", "warehousing", "fleet"], "tracking");
  if (wants("peaks")) add("manpower", "priority.peaks");
  if (wants("account")) add("account", "priority.account", true);
  if (wants("inventory")) add("warehousing", "priority.inventory", true);

  // How much.
  if (input.volume === "high") {
    add("fleet", "volume.high");
    add("account", "volume.high");
  }
  if (input.volume === "scaling") add("account", "volume.scaling");

  // The visitor's real numbers: city-to-city orders need road linehaul, held stock needs a warehouse,
  // and a sharp peak needs peak manpower on top of the everyday team.
  if (input.net) {
    if (input.net.area !== "riyadh") add("land-freight", "net.linehaul", true);
    if (input.net.stock) add("warehousing", "net.stock", true);
    if (input.net.peak >= 1.8) add("manpower", "net.peak");
  }

  // Every MSG configuration includes real-time tracking and responsive support.
  add("tracking", "baseline");

  const modules = [...mods.values()].sort(
    (a, b) => Number(b.core) - Number(a.core) || ORDER.indexOf(a.id) - ORDER.indexOf(b.id),
  );
  return { model: operatingModel(input), modules };
}

/** Compact, URL-safe encoding so a plan can be shared or attached to a lead. */
export function encodePlan(i: PlanInput): string {
  const parts = [i.persona, i.cargo.join("."), i.volume, i.priorities.join(".")];
  if (i.net) parts.push(encodeSizer(i.net));
  return parts.join("~");
}

export function decodePlan(s: string | null | undefined): PlanInput | null {
  if (!s) return null;
  const [persona, cargo = "", volume, pr = "", net = ""] = s.split("~");
  const list = <T extends string>(raw: string, allowed: readonly T[]) =>
    raw.split(".").filter((x): x is T => (allowed as readonly string[]).includes(x));
  if (!(PERSONAS as readonly string[]).includes(persona)) return null;
  if (!(VOLUMES as readonly string[]).includes(volume)) return null;
  return {
    persona: persona as Persona,
    cargo: list(cargo, CARGO),
    volume: volume as Volume,
    priorities: list(pr, PRIORITIES).slice(0, 3),
    ...(net ? { net: decodeSizer(net) ?? undefined } : {}),
  };
}
