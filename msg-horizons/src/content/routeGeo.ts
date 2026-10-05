import type { Place } from "../lib/routePlan.ts";
import { AREAS, type City, type Site } from "./routeConsole.ts";
import type { LngLat } from "../lib/geoRoute.ts";

/**
 * Where the route console's places really are. The console works in abstract city coordinates (fx, fy);
 * the flyover needs real ones. Districts and city centres are approximate: the road router snaps them to
 * the nearest street, so a pin always lands on a real road.
 */

export const CITY_LL: Record<City, LngLat> = {
  riyadh: [46.6753, 24.7136],
  jeddah: [39.1728, 21.5433],
  makkah: [39.8579, 21.3891],
  madinah: [39.6111, 24.4672],
  dammam: [50.0888, 26.4207],
  ahsa: [49.5876, 25.3648],
  buraidah: [43.975, 26.326],
  hail: [41.7208, 27.5114],
  tabuk: [36.5662, 28.3838],
  taif: [40.4183, 21.2854],
  abha: [42.5053, 18.2164],
  najran: [44.1322, 17.4917],
  sabya: [42.625, 17.149],
};

/** MSG's Riyadh hub is the Al Malaz head office; the Sabya logistics centre sits in the town centre */
export const SITE_LL: Record<Site, LngLat> = {
  riyadh: [46.733, 24.6688],
  sabya: [42.6262, 17.1484],
};

const RIYADH_AREA_LL: Record<string, LngLat> = {
  olaya: [46.6845, 24.6935],
  kingfahd: [46.659, 24.715],
  malaz: [46.724, 24.664],
  rawdah: [46.774, 24.736],
  naseem: [46.84, 24.717],
  sulay: [46.812, 24.607],
};

/** half-width of "part of town" in degrees: big cities spread wider than small towns */
const SPAN: Record<City, number> = {
  riyadh: 0.09, jeddah: 0.1, makkah: 0.06, madinah: 0.07, dammam: 0.06, ahsa: 0.06, buraidah: 0.05,
  hail: 0.05, tabuk: 0.06, taif: 0.05, abha: 0.05, najran: 0.045, sabya: 0.03,
};

export function placeLL(p: Place): LngLat {
  if (p.pin === "site" && (p.city === "riyadh" || p.city === "sabya")) return SITE_LL[p.city];
  if (p.city === "riyadh") {
    const a = AREAS.riyadh.find((x) => x.fx === p.fx && x.fy === p.fy);
    return a ? RIYADH_AREA_LL[a.id] : CITY_LL.riyadh;
  }
  const c = CITY_LL[p.city];
  const s = SPAN[p.city];
  return [c[0] + (p.fx - 0.5) * 2 * s * 1.1, c[1] + (0.5 - p.fy) * 2 * s * 0.9];
}
