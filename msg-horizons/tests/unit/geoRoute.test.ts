import { test } from "node:test";
import assert from "node:assert/strict";
import { angleDiff, arc, bearing, decodePolyline, haversine, makePath, metresPerPixel, offsetPath, pointAt, slicePath, type LngLat } from "../../src/lib/geoRoute.ts";
import { CITY_LL, SITE_LL, placeLL } from "../../src/content/routeGeo.ts";
import { AREAS, CITIES } from "../../src/content/routeConsole.ts";
import { planRoute } from "../../src/lib/routePlan.ts";

const near = (a: number, b: number, tol: number, msg?: string) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} ${a} vs ${b}`);

test("haversine: Riyadh to Jeddah is about 850 km as the crow flies", () => {
  near(haversine(CITY_LL.riyadh, CITY_LL.jeddah) / 1000, 846, 25);
  assert.equal(haversine([46.7, 24.7], [46.7, 24.7]), 0);
});

test("bearing: compass directions", () => {
  near(bearing([46, 24], [46, 25]), 0, 0.01);
  near(bearing([46, 24], [47, 24]), 90, 0.6);
  near(bearing([46, 24], [46, 23]), 180, 0.01);
  near(bearing([46, 24], [45, 24]), 270, 0.6);
});

test("angleDiff always takes the short way round", () => {
  assert.equal(angleDiff(350, 10), 20);
  assert.equal(angleDiff(10, 350), -20);
  assert.equal(angleDiff(0, 180), 180);
  assert.equal(angleDiff(90, 90), 0);
});

test("path: points, direction of travel and slicing", () => {
  const p = makePath([[46, 24], [46, 24.01], [46.01, 24.01]]); // north, then east
  near(p.len, haversine([46, 24], [46, 24.01]) + haversine([46, 24.01], [46.01, 24.01]), 0.01);
  const start = pointAt(p, 0);
  assert.deepEqual(start.p, [46, 24]);
  near(start.bearing, 0, 0.01);
  const end = pointAt(p, p.len + 500); // beyond the end clamps
  assert.deepEqual(end.p, [46.01, 24.01]);
  near(end.bearing, 90, 0.6);
  const half = slicePath(p, p.len / 2);
  assert.ok(half.length >= 2 && half.length <= 3);
  near(haversine(half[half.length - 1], pointAt(p, p.len / 2).p), 0, 0.01);
});

test("offsetPath keeps parallel flows a fixed distance apart, on the right of travel", () => {
  const line: LngLat[] = [[46, 24], [46, 24.01], [46, 24.02]]; // heading north
  const right = offsetPath(line, 10);
  near(haversine(line[1], right[1]), 10, 0.2);
  assert.ok(right[1][0] > line[1][0], "right of a northbound line is east");
  const left = offsetPath(line, -10);
  assert.ok(left[1][0] < line[1][0]);
  assert.equal(offsetPath(line, 0), line);
});

test("arc: starts and ends on its cities and bows to the requested side", () => {
  const a = CITY_LL.riyadh;
  const b = CITY_LL.jeddah;
  const up = arc(a, b, 0.16);
  const down = arc(a, b, -0.16);
  assert.deepEqual(up[0], a);
  near(up[up.length - 1][0], b[0], 1e-9);
  near(up[up.length - 1][1], b[1], 1e-9);
  const mid = (pts: LngLat[]) => pts[Math.floor(pts.length / 2)];
  assert.notDeepEqual(mid(up), mid(down));
});

test("decodePolyline reads the standard encoding (Google's documented example)", () => {
  const pts = decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@");
  assert.equal(pts.length, 3);
  near(pts[0][1], 38.5, 1e-6); // lat
  near(pts[0][0], -120.2, 1e-6); // lng
  near(pts[2][1], 43.252, 1e-6);
  near(pts[2][0], -126.453, 1e-6);
});

test("metresPerPixel halves with every zoom level", () => {
  near(metresPerPixel(24.7, 15) / metresPerPixel(24.7, 16), 2, 1e-9);
  assert.ok(metresPerPixel(24.7, 17) < 2 && metresPerPixel(24.7, 17) > 0.5);
});

test("every console place resolves to a real spot inside Saudi Arabia", () => {
  const inKsa = ([lng, lat]: LngLat) => lng > 34 && lng < 56 && lat > 16 && lat < 33;
  for (const c of CITIES) {
    for (const a of c === "riyadh" ? AREAS.riyadh : AREAS.other) {
      const ll = placeLL({ city: c, fx: a.fx, fy: a.fy, pin: "door" });
      assert.ok(inKsa(ll), `${c}/${a.id} → ${ll}`);
      // a district stays near its own city
      assert.ok(haversine(ll, CITY_LL[c]) < 25000, `${c}/${a.id} is ${Math.round(haversine(ll, CITY_LL[c]))} m from its city`);
    }
  }
  assert.deepEqual(placeLL({ city: "riyadh", fx: 0.6, fy: 0.46, pin: "site" }), SITE_LL.riyadh);
  assert.deepEqual(placeLL({ city: "sabya", fx: 0.5, fy: 0.5, pin: "site" }), SITE_LL.sabya);
});

test("two different Riyadh districts are never the same spot", () => {
  const seen = new Set<string>();
  for (const a of AREAS.riyadh) seen.add(placeLL({ city: "riyadh", fx: a.fx, fy: a.fy, pin: "door" }).join());
  seen.add(SITE_LL.riyadh.join());
  assert.equal(seen.size, AREAS.riyadh.length + 1);
});

test("a planned route resolves every stop to coordinates", () => {
  const plan = planRoute({ model: "door", from: { city: "riyadh", area: { fx: 0.3, fy: 0.3 } }, to: { city: "jeddah", area: { fx: 0.5, fy: 0.5 } }, site: "riyadh", cod: true, returns: true });
  for (const b of plan.beats) for (const p of [b.from, b.to]) assert.ok(placeLL(p).every(Number.isFinite));
});
