import { decodePolyline, type LngLat } from "./geoRoute.ts";

/**
 * Real driving routes for the flyover. Order of preference: the pre-computed table (no network, no
 * rate limits), a per-visit cache, then a live OSRM request. Returns null when none of them can answer,
 * and the console then falls back to its flat map rather than drawing a line that ignores the roads.
 */
const BASE = (process.env.NEXT_PUBLIC_ROUTING_URL || "https://router.project-osrm.org").replace(/\/$/, "");

const r4 = (n: number) => n.toFixed(4);
export const routeKey = (a: LngLat, b: LngLat) => `${r4(a[0])},${r4(a[1])}>${r4(b[0])},${r4(b[1])}`;

const memo = new Map<string, Promise<LngLat[] | null>>();

export function roadRoute(a: LngLat, b: LngLat): Promise<LngLat[] | null> {
  const key = routeKey(a, b);
  const hit = memo.get(key);
  if (hit) return hit;
  const p = load(key, a, b);
  memo.set(key, p);
  void p.then((r) => { if (!r) memo.delete(key); }); // a failure is retried next time, not remembered
  return p;
}

async function load(key: string, a: LngLat, b: LngLat): Promise<LngLat[] | null> {
  try {
    const { ROUTES_STATIC } = await import("../content/routesStatic.ts");
    const pre = ROUTES_STATIC[key];
    if (pre) return decodePolyline(pre);
  } catch { /* table unavailable: carry on */ }
  try {
    const s = sessionStorage.getItem(`msg-route:${key}`);
    if (s) return JSON.parse(s) as LngLat[];
  } catch { /* storage blocked */ }

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 8000);
  try {
    const res = await fetch(`${BASE}/route/v1/driving/${a[0]},${a[1]};${b[0]},${b[1]}?overview=full&geometries=geojson&steps=false`, { signal: ctl.signal });
    if (!res.ok) return null;
    const json = (await res.json()) as { routes?: { geometry?: { coordinates?: LngLat[] } }[] };
    const coords = json.routes?.[0]?.geometry?.coordinates;
    if (!coords || coords.length < 2) return null;
    try { sessionStorage.setItem(`msg-route:${key}`, JSON.stringify(coords)); } catch { /* full or blocked */ }
    return coords;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
