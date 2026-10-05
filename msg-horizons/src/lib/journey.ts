/**
 * The route: the page's sections as stops on one journey. Pure functions only, so they run in the unit tests.
 * Positions are page coordinates (pixels from the top of the document).
 */

export type Position = { index: number; t: number; p: number };

/**
 * Where the visitor is on the route. `tops` are the stops' tops in ascending order, `docEnd` is the bottom of
 * the page and `y` is the reading line. `index` is the stop being read, `t` how far through it (0–1) and
 * `p = index + t` a continuous position that glides smoothly from one stop to the next.
 */
export function position(tops: number[], docEnd: number, y: number): Position {
  if (!tops.length) return { index: 0, t: 0, p: 0 };
  let index = 0;
  for (let k = 0; k < tops.length; k++) if (y >= tops[k]) index = k;
  const end = index + 1 < tops.length ? tops[index + 1] : docEnd;
  const t = Math.min(1, Math.max(0, (y - tops[index]) / Math.max(1, end - tops[index])));
  return { index, t, p: index + t };
}

export const stepIndex = (index: number, dir: 1 | -1, n: number) => Math.min(n - 1, Math.max(0, index + dir));

/** the "next stop" invitation shows near the end of a stop, and never on the last one */
export const showNext = (index: number, t: number, n: number) => index < n - 1 && t > 0.8;

/** top of an element in page coordinates, ignoring CSS transforms (sections rise into place as they enter) */
export function pageTop(el: HTMLElement): number {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

/** the fraction of the way along the route (0–1) for a continuous position */
export const routeFraction = (p: number, n: number) => (n <= 1 ? 0 : Math.min(1, Math.max(0, p / (n - 1))));

export type XY = { x: number; y: number };
export type RouteGeometry = {
  W: number;
  H: number;
  /** each stop's centre, in the W × H drawing */
  pts: XY[];
  /** SVG path through every stop */
  d: string;
  /** length along the path at each stop */
  stopLen: number[];
  total: number;
  /** the point a given distance along the path */
  at: (len: number) => XY;
};

/**
 * The route map's drawing: stops snake across the page (left to right along the first row, a U-turn, then back
 * along the second row), mirrored for right-to-left languages so the journey reads the way the text does.
 */
export function buildRoute(n: number, rtl: boolean, W = 1000, H = 425): RouteGeometry {
  const perRow = Math.ceil(n / 2);
  const x0 = W * 0.08;
  const x1 = W * 0.86;
  const ys = [H * 0.26, H * 0.72];
  const mx = (x: number) => (rtl ? W - x : x);
  const colX = (col: number) => x0 + col * ((x1 - x0) / Math.max(1, perRow - 1));
  const pts: XY[] = Array.from({ length: n }, (_, i) => {
    const row = i < perRow ? 0 : 1;
    const col = row === 0 ? i : perRow - 1 - (i - perRow);
    return { x: mx(colX(col)), y: ys[row] };
  });

  const poly: XY[] = [];
  const stopAt: number[] = [];
  const push = (p: XY, stop = false) => { poly.push(p); if (stop) stopAt.push(poly.length - 1); };
  for (let i = 0; i < perRow; i++) push(pts[i], true);
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < perRow; i++) d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
  if (n > perRow) {
    const a = pts[perRow - 1];
    const b = pts[perRow];
    const c1 = { x: mx(W * 0.985), y: ys[0] };
    const c2 = { x: mx(W * 0.985), y: ys[1] };
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    const STEPS = 40;
    for (let k = 1; k <= STEPS; k++) {
      const t = k / STEPS;
      const u = 1 - t;
      const p: XY = {
        x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x,
        y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y,
      };
      push(k === STEPS ? b : p, k === STEPS);
    }
    for (let i = perRow + 1; i < n; i++) {
      push(pts[i], true);
      d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
    }
  }
  const cum = [0];
  for (let i = 1; i < poly.length; i++) cum.push(cum[i - 1] + Math.hypot(poly[i].x - poly[i - 1].x, poly[i].y - poly[i - 1].y));
  const total = cum[cum.length - 1];
  const at = (len: number): XY => {
    const L = Math.min(total, Math.max(0, len));
    let lo = 1;
    let hi = poly.length - 1;
    if (poly.length === 1) return poly[0];
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < L) lo = mid + 1;
      else hi = mid;
    }
    const seg = Math.max(1e-9, cum[lo] - cum[lo - 1]);
    const u = (L - cum[lo - 1]) / seg;
    return { x: poly[lo - 1].x + (poly[lo].x - poly[lo - 1].x) * u, y: poly[lo - 1].y + (poly[lo].y - poly[lo - 1].y) * u };
  };
  return { W, H, pts, d, stopLen: stopAt.map((i) => cum[i]), total, at };
}
