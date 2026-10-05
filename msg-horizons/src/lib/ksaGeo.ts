/** Saudi Arabia outline, dot matrix and city positions for the route console's Kingdom map. */
export type P = { x: number; y: number };
const LON0 = 34, LAT1 = 33, K = 50;
export const KW = 22 * K, KH = 17 * K;
const pr = (lon: number, lat: number): P => ({ x: (lon - LON0) * K, y: (LAT1 - lat) * K });

export const KSA: P[] = ([
  [34.95, 29.36], [36.5, 29.5], [38, 30.5], [37, 31.5], [39.2, 32.15], [40.4, 31.9], [42, 31.1], [44.7, 29.2], [46.4, 29.1],
  [47.4, 29], [48.4, 28.5], [48.8, 27.6], [49.6, 26.9], [50.1, 26.2], [50.2, 25.6], [50.8, 24.75], [51.6, 24.25], [52, 23],
  [55.2, 22.7], [55.7, 22], [55, 20], [52, 19], [49.1, 18.6], [47.5, 17.1], [46.4, 17.2], [45.2, 17.4], [44, 17.4], [43.2, 16.8],
  [42.78, 16.37], [42.55, 16.9], [42, 17.9], [41.2, 19.1], [40.4, 20.2], [39.6, 20.9], [39.1, 21.7], [38.9, 22.6], [38.1, 24.1],
  [37.2, 25], [36.5, 26], [35.6, 27.4], [34.6, 28.1], [34.8, 28.9],
] as [number, number][]).map(([a, b]) => pr(a, b));

export const CITY_XY: Record<string, P> = {
  riyadh: pr(46.72, 24.71), jeddah: pr(39.17, 21.54), makkah: pr(39.83, 21.42), madinah: pr(39.61, 24.47),
  dammam: pr(50.1, 26.43), abha: pr(42.51, 18.22), tabuk: pr(36.57, 28.38), hail: pr(41.69, 27.52),
  buraidah: pr(43.97, 26.33), sabya: pr(42.63, 17.15), najran: pr(44.13, 17.49), ahsa: pr(49.59, 25.38), taif: pr(40.42, 21.27),
};

function inside(p: P) {
  let c = false;
  for (let i = 0, j = KSA.length - 1; i < KSA.length; j = i++) {
    const a = KSA[i], b = KSA[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}
export const KSA_DOTS: P[] = [];
for (let y = 6; y < KH; y += 14) for (let x = 6; x < KW; x += 14) if (inside({ x, y })) KSA_DOTS.push({ x, y });
