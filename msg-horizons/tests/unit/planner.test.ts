import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPlan, decodePlan, encodePlan, type PlanInput } from "../../src/lib/planner.ts";

const ids = (i: PlanInput) => buildPlan(i).modules.map((m) => m.id);

test("a new seller shipping parcels gets last-mile + tracking, launchpad model", () => {
  const p = buildPlan({ persona: "seller", cargo: ["parcels"], volume: "starting", priorities: [] });
  assert.equal(p.model, "launchpad");
  assert.deepEqual(p.modules.map((m) => m.id), ["last-mile", "tracking"]);
  assert.equal(p.modules[0].core, true);
});

test("tracking is always included", () => {
  for (const cargo of [["storage"], ["people"], ["freight"], []] as PlanInput["cargo"][]) {
    assert.ok(ids({ persona: "startup", cargo, volume: "steady", priorities: [] }).includes("tracking"));
  }
});

test("empty cargo defaults to parcels", () => {
  assert.ok(ids({ persona: "seller", cargo: [], volume: "starting", priorities: [] }).includes("last-mile"));
});

test("platforms get capacity model with manpower and fleet as core", () => {
  const p = buildPlan({ persona: "platform", cargo: ["parcels"], volume: "high", priorities: ["peaks"] });
  assert.equal(p.model, "capacity");
  const core = p.modules.filter((m) => m.core).map((m) => m.id);
  assert.ok(core.includes("manpower") && core.includes("fleet"));
});

test("high volume promotes to enterprise and adds account management", () => {
  const p = buildPlan({ persona: "ecommerce", cargo: ["parcels"], volume: "high", priorities: [] });
  assert.equal(p.model, "enterprise");
  assert.ok(p.modules.some((m) => m.id === "account"));
});

test("priorities never pull in an unrelated service", () => {
  const got = ids({ persona: "startup", cargo: ["storage"], volume: "steady", priorities: ["security", "speed"] });
  assert.ok(!got.includes("last-mile"), `unexpected last-mile in ${got}`);
  assert.ok(!got.includes("land-freight"));
});

test("core modules sort before add-ons", () => {
  const p = buildPlan({ persona: "enterprise", cargo: ["b2b", "storage"], volume: "scaling", priorities: ["visibility"] });
  const firstAddon = p.modules.findIndex((m) => !m.core);
  assert.ok(p.modules.slice(firstAddon).every((m) => !m.core));
});

test("never contains customs clearance", () => {
  const all = ids({ persona: "enterprise", cargo: ["parcels", "b2b", "freight", "storage", "people"], volume: "high",
    priorities: ["speed", "ontime", "visibility"] });
  assert.ok(!all.some((x) => (x as string).includes("custom")));
});

test("encode/decode round-trips and rejects junk", () => {
  const i: PlanInput = { persona: "ecommerce", cargo: ["parcels", "storage"], volume: "scaling", priorities: ["speed", "peaks"] };
  assert.deepEqual(decodePlan(encodePlan(i)), i);
  assert.equal(decodePlan("hacker~x~y~z"), null);
  assert.equal(decodePlan(""), null);
  assert.deepEqual(decodePlan("seller~parcels.evil~starting~speed.bad")?.cargo, ["parcels"]);
});
