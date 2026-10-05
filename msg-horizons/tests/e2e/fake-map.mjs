// A stand-in for the real map services, for tests that run without internet access: a MapLibre style with a
// street grid, parks and 3D buildings over central Riyadh, and a routing answer that follows that grid.
// The e2e suite and the visual checks serve these in place of the live tile and routing hosts.

const BBOX = { w: 46.6, e: 46.9, s: 24.55, n: 24.8 };
const STEP = 0.004;
const rand = (a, b) => Math.abs(Math.sin(a * 12.9898 + b * 78.233) * 43758.5453) % 1;

export function fakeStyle() {
  const roads = [];
  for (let x = BBOX.w; x <= BBOX.e; x += STEP) roads.push({ type: "Feature", properties: { art: Math.round(x / STEP) % 6 === 0 }, geometry: { type: "LineString", coordinates: [[x, BBOX.s], [x, BBOX.n]] } });
  for (let y = BBOX.s; y <= BBOX.n; y += STEP) roads.push({ type: "Feature", properties: { art: Math.round(y / STEP) % 6 === 0 }, geometry: { type: "LineString", coordinates: [[BBOX.w, y], [BBOX.e, y]] } });
  const blocks = [];
  const parks = [];
  for (let x = BBOX.w + 0.0005; x < BBOX.e; x += STEP) {
    for (let y = BBOX.s + 0.0005; y < BBOX.n; y += STEP) {
      const k = rand(x * 100, y * 100);
      const ring = (w, h) => [[[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]];
      if (k < 0.1) parks.push({ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: ring(STEP - 0.001, STEP - 0.001) } });
      else if (k < 0.8) blocks.push({ type: "Feature", properties: { h: 8 + Math.round(rand(y * 90, x * 90) * 70) }, geometry: { type: "Polygon", coordinates: ring(0.0016 + rand(x, y) * 0.0012, 0.0016 + rand(y, x) * 0.0012) } });
    }
  }
  const fc = (features) => ({ type: "FeatureCollection", features });
  return {
    version: 8,
    name: "stand-in",
    sources: { roads: { type: "geojson", data: fc(roads) }, blocks: { type: "geojson", data: fc(blocks) }, parks: { type: "geojson", data: fc(parks) } },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#e4eae4" } },
      { id: "parks", type: "fill", source: "parks", paint: { "fill-color": "#c9e4cf" } },
      { id: "road-case", type: "line", source: "roads", paint: { "line-color": "#c9d3cf", "line-width": ["interpolate", ["linear"], ["zoom"], 10, 1, 16, ["case", ["get", "art"], 12, 7]] } },
      { id: "road", type: "line", source: "roads", paint: { "line-color": ["case", ["get", "art"], "#fff3c8", "#ffffff"], "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.6, 16, ["case", ["get", "art"], 9, 5]] } },
      { id: "blocks", type: "fill-extrusion", source: "blocks", paint: { "fill-extrusion-color": "#d9ddd6", "fill-extrusion-height": ["get", "h"], "fill-extrusion-opacity": 0.95 } },
    ],
  };
}

const snap = (v) => Math.round(v / STEP) * STEP;
/** a driving route that stays on the stand-in grid: along A's street, then down the street nearest B */
export function fakeRoute(a, b) {
  const [ax, ay] = a;
  const [bx, by] = b;
  const sy = snap(ay);
  const sx = snap(bx);
  const pts = [[ax, ay], [ax, sy]];
  const nx = Math.max(2, Math.ceil(Math.abs(sx - ax) / 0.0006));
  for (let k = 1; k <= nx; k++) pts.push([ax + ((sx - ax) * k) / nx, sy]);
  const ny = Math.max(2, Math.ceil(Math.abs(by - sy) / 0.0006));
  for (let k = 1; k <= ny; k++) pts.push([sx, sy + ((by - sy) * k) / ny]);
  pts.push([bx, by]);
  return { code: "Ok", routes: [{ geometry: { type: "LineString", coordinates: pts } }] };
}

/** wire both fakes into a Playwright browser context */
export async function installFakeMap(ctx, { routing = true } = {}) {
  await ctx.route("https://tiles.openfreemap.org/**", (r) => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(fakeStyle()) }));
  if (routing) {
    await ctx.route("https://router.project-osrm.org/**", (r) => {
      const m = r.request().url().match(/driving\/([-\d.]+),([-\d.]+);([-\d.]+),([-\d.]+)/);
      if (!m) return r.abort();
      r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(fakeRoute([+m[1], +m[2]], [+m[3], +m[4]])) });
    });
  }
}
