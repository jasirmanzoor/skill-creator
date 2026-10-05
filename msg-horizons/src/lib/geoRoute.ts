/**
 * Geography and camera maths for the route flyover. Pure functions only (no DOM, no map library), so
 * they run in the unit tests. Coordinates are [longitude, latitude] in degrees, distances in metres.
 */

export type LngLat = [number, number];

const R = 6371008.8;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const M_PER_DEG_LAT = 110574;
const mPerDegLng = (lat: number) => 111320 * Math.cos(rad(lat));

export function haversine(a: LngLat, b: LngLat): number {
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** compass bearing a → b, 0 = north, clockwise, in [0, 360) */
export function bearing(a: LngLat, b: LngLat): number {
  const y = Math.sin(rad(b[0] - a[0])) * Math.cos(rad(b[1]));
  const x = Math.cos(rad(a[1])) * Math.sin(rad(b[1])) - Math.sin(rad(a[1])) * Math.cos(rad(b[1])) * Math.cos(rad(b[0] - a[0]));
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

/** shortest signed turn from one bearing to another, in (-180, 180] */
export function angleDiff(from: number, to: number): number {
  let d = (to - from) % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

export type Path = { pts: LngLat[]; cum: number[]; len: number };

export function makePath(pts: LngLat[]): Path {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + haversine(pts[i - 1], pts[i]));
  return { pts, cum, len: cum[cum.length - 1] ?? 0 };
}

/** the point `d` metres along the path, and the direction of travel there */
export function pointAt(path: Path, d: number): { p: LngLat; bearing: number } {
  const { pts, cum, len } = path;
  if (pts.length === 1) return { p: pts[0], bearing: 0 };
  const dd = Math.min(len, Math.max(0, d));
  let lo = 1;
  let hi = pts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < dd) lo = mid + 1;
    else hi = mid;
  }
  const a = pts[lo - 1];
  const b = pts[lo];
  const seg = Math.max(1e-9, cum[lo] - cum[lo - 1]);
  const u = Math.min(1, Math.max(0, (dd - cum[lo - 1]) / seg));
  return { p: [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u], bearing: bearing(a, b) };
}

/** the part of the path from the start up to `d` metres */
export function slicePath(path: Path, d: number): LngLat[] {
  const { pts, cum, len } = path;
  const dd = Math.min(len, Math.max(0, d));
  const out: LngLat[] = [pts[0]];
  for (let i = 1; i < pts.length && cum[i] <= dd; i++) out.push(pts[i]);
  const end = pointAt(path, dd).p;
  const last = out[out.length - 1];
  if (last[0] !== end[0] || last[1] !== end[1]) out.push(end);
  return out.length > 1 ? out : [pts[0], pts[0]];
}

/** shift a line sideways (positive = to the right of travel), in metres, so parallel flows do not overlap */
export function offsetPath(pts: LngLat[], metres: number): LngLat[] {
  if (pts.length < 2 || metres === 0) return pts;
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const lat = p[1];
    const dx = (b[0] - a[0]) * mPerDegLng(lat);
    const dy = (b[1] - a[1]) * M_PER_DEG_LAT;
    const n = Math.hypot(dx, dy) || 1;
    // right-hand normal of the direction of travel
    const nx = dy / n;
    const ny = -dx / n;
    return [p[0] + (nx * metres) / mPerDegLng(lat), p[1] + (ny * metres) / M_PER_DEG_LAT] as LngLat;
  });
}

/** a smooth curve between two cities; `lift` bows it to one side (+) or the other (−) as a share of its length */
export function arc(a: LngLat, b: LngLat, lift: number, n = 64): LngLat[] {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const c: LngLat = [mx - dy * lift, my + dx * lift];
  const out: LngLat[] = [];
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    out.push([(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]);
  }
  return out;
}

/** Google-style encoded polyline (what OSRM returns with `geometries=polyline`), lat/lng order on the wire */
export function decodePolyline(str: string, precision = 5): LngLat[] {
  const f = 10 ** precision;
  const out: LngLat[] = [];
  let i = 0;
  let lat = 0;
  let lng = 0;
  while (i < str.length) {
    for (const axis of [0, 1]) {
      let shift = 0;
      let result = 0;
      let byte: number;
      do {
        byte = str.charCodeAt(i++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (axis === 0) lat += delta;
      else lng += delta;
    }
    out.push([lng / f, lat / f]);
  }
  return out;
}

/** ground resolution of the map at a latitude and zoom (MapLibre uses 512 px tiles) */
export const metresPerPixel = (lat: number, zoom: number) => (78271.517 * Math.cos(rad(lat))) / 2 ** zoom;

/** how far, in screen widths, a point is from the camera: used to pull the camera up on long hops */
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
