import { SITE_SPOT, type City, type Model, type Site, type StepKey } from "../content/routeConsole.ts";

/**
 * Turns a working model and two ends into the beats the route console plays.
 * A Place is a spot inside a city (fx/fy 0–1 across the city map), so the same plan can be drawn
 * on the city map (both ends in one city) or the Kingdom map (anything that crosses cities).
 */

export type Place = { city: City; fx: number; fy: number; pin?: "you" | "site" | "door" | "drop" };
export type End = { city: City; area: { fx: number; fy: number } };
export type RouteInput = { model: Model; from: End; to: End; site: Site; cod: boolean; returns: boolean };
export type Vehicle = "courier" | "van" | "truck" | "you";
export type Flow = "parcel" | "cash" | "return" | "order";
export type Beat = {
  step: StepKey;
  who: "you" | "msg";
  from: Place;
  to: Place;
  /** moving beats carry a vehicle; dwell beats (from === to) are handling at one place */
  vehicle?: Vehicle;
  flow: Flow;
  vars: Record<string, string>;
};
export type RoutePlan = { view: "city" | "kingdom"; beats: Beat[]; places: Place[] };

const SITE_CITIES: Site[] = ["riyadh", "sabya"];
const siteOf = (c: City): Site | null => (SITE_CITIES as string[]).includes(c) ? (c as Site) : null;
const sitePlace = (s: Site): Place => ({ city: s, ...SITE_SPOT[s], pin: "site" });
/** where line-haul arrives in a city: MSG's own site if it has one, else the city centre */
const gateway = (c: City): Place => (siteOf(c) ? sitePlace(siteOf(c)!) : { city: c, fx: 0.5, fy: 0.5 });

export function planRoute(i: RouteInput): RoutePlan {
  const O: Place = { city: i.from.city, ...i.from.area, pin: "you" };
  const D: Place = { city: i.to.city, ...i.to.area, pin: i.model === "b2b" ? "drop" : "door" };
  const beats: Beat[] = [];
  const move = (step: StepKey, who: "you" | "msg", from: Place, to: Place, vehicle: Vehicle | undefined, flow: Flow = "parcel", vars: Record<string, string> = {}) =>
    beats.push({ step, who, from, to, vehicle, flow, vars });
  const dwell = (step: StepKey, at: Place, vars: Record<string, string> = {}, who: "you" | "msg" = "msg") =>
    beats.push({ step, who, from: at, to: at, flow: "parcel", vars });
  const haul = (a: Place, b: Place) => move("linehaul", "msg", a, b, "truck", "parcel", { a: a.city, b: b.city });
  const lastMile = (from: Place) => move("lastmile", "msg", from, D, "courier", "parcel", { to: D.city });

  let back: Place = O; // where a failed delivery goes home to
  let backSite: Site | null = null;

  if (i.model === "door") {
    const own = siteOf(O.city);
    if (own) {
      const S = sitePlace(own);
      move("collect", "msg", O, S, "courier", "parcel", { from: O.city });
      dwell("sort", S, { site: own });
      if (D.city !== own) { const G = gateway(D.city); haul(S, G); lastMile(G); } else lastMile(S);
      back = S; backSite = own;
    } else {
      const G0 = gateway(O.city);
      move("collect", "msg", O, G0, "courier", "parcel", { from: O.city });
      if (D.city !== O.city) { const G = gateway(D.city); haul(G0, G); lastMile(G); } else lastMile(G0);
    }
  } else if (i.model === "b2b") {
    dwell("load", O, { from: O.city });
    if (D.city !== O.city) move("linehaul", "msg", O, D, "truck", "parcel", { a: O.city, b: D.city });
    else move("onedrop", "msg", O, D, "van", "parcel", { to: D.city });
    if (D.city !== O.city) dwell("onedrop", D, { to: D.city });
  } else {
    const S = sitePlace(i.site);
    if (i.model === "dropoff") {
      move("bring", "you", O, S, "you", "parcel", { site: i.site });
      dwell("sort", S, { site: i.site });
    } else {
      move("inbound", "msg", O, S, O.city === i.site ? "van" : "truck", "parcel", { site: i.site });
      dwell("store", S);
      move("order", "you", D, S, undefined, "order");
      dwell("pack", S);
      dwell("segregate", S);
    }
    if (D.city !== i.site) { const G = gateway(D.city); haul(S, G); lastMile(G); } else lastMile(S);
    back = S; backSite = i.site;
  }

  if (i.cod && i.model !== "b2b") move("cod", "msg", D, O, undefined, "cash");
  if (i.returns) move("return", "msg", D, back, i.model === "b2b" ? "van" : "courier", "return", { back: backSite ?? "you" });

  const places: Place[] = [];
  const seen = new Set<string>();
  for (const b of beats) for (const p of [b.from, b.to]) {
    const k = `${p.city}:${p.fx}:${p.fy}`;
    if (!seen.has(k)) { seen.add(k); places.push(p); }
  }
  const view = new Set(places.map((p) => p.city)).size > 1 ? "kingdom" : "city";
  return { view, beats, places };
}

/** seconds each beat plays for */
export const beatSeconds = (b: Beat) => (b.from === b.to ? 1.5 : b.step === "linehaul" || b.step === "inbound" ? 3 : b.flow === "cash" || b.flow === "order" ? 1.8 : 2.4);
