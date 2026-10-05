import { test } from "node:test";
import assert from "node:assert/strict";
import { planRoute, type RouteInput } from "../../src/lib/routePlan.ts";

const at = (city: RouteInput["from"]["city"]) => ({ city, area: { fx: 0.3, fy: 0.3 } });
const steps = (i: Partial<RouteInput>) =>
  planRoute({ model: "door", from: at("riyadh"), to: at("riyadh"), site: "riyadh", cod: false, returns: false, ...i }).beats.map((b) => b.step);

test("door to door inside Riyadh stays on the city map and sorts at the hub", () => {
  const p = planRoute({ model: "door", from: at("riyadh"), to: { city: "riyadh", area: { fx: 0.8, fy: 0.7 } }, site: "riyadh", cod: true, returns: true });
  assert.equal(p.view, "city");
  assert.deepEqual(p.beats.map((b) => b.step), ["collect", "sort", "lastmile", "cod", "return"]);
});

test("crossing cities adds line-haul and switches to the Kingdom map", () => {
  const p = planRoute({ model: "door", from: at("riyadh"), to: at("jeddah"), site: "riyadh", cod: false, returns: false });
  assert.equal(p.view, "kingdom");
  assert.deepEqual(p.beats.map((b) => b.step), ["collect", "sort", "linehaul", "lastmile"]);
});

test("a city without an MSG site is not given a hub", () => {
  assert.deepEqual(steps({ from: at("jeddah"), to: at("dammam") }), ["collect", "linehaul", "lastmile"]);
});

test("B2B is one drop point and never remits cash", () => {
  assert.deepEqual(steps({ model: "b2b", cod: true, returns: true }), ["load", "onedrop", "return"]);
  assert.deepEqual(steps({ model: "b2b", to: at("dammam") }), ["load", "linehaul", "onedrop"]);
});

test("drop at MSG starts with the seller bringing parcels to the chosen site", () => {
  assert.deepEqual(steps({ model: "dropoff", site: "sabya", from: at("sabya"), to: at("riyadh") }), ["bring", "sort", "linehaul", "lastmile"]);
});

test("end to end runs the full chain and returns to the warehouse", () => {
  const p = planRoute({ model: "e2e", from: at("jeddah"), to: at("abha"), site: "sabya", cod: true, returns: true });
  assert.deepEqual(p.beats.map((b) => b.step), ["inbound", "store", "order", "pack", "segregate", "linehaul", "lastmile", "cod", "return"]);
  assert.equal(p.beats.at(-1)!.to.city, "sabya");
  assert.equal(p.beats.find((b) => b.step === "cod")!.vehicle, undefined);
});
