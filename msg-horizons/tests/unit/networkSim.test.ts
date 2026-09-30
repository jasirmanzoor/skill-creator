import { test } from "node:test";
import assert from "node:assert/strict";
import { NetworkSim } from "../../src/lib/networkSim.ts";

test("network sim moves parcels pickup → hub → door and reshapes without resetting", () => {
  const sim = new NetworkSim({ origins: 1, couriers: 4, storage: false, freight: false, people: false });
  for (let i = 0; i < 1800; i++) sim.step(1 / 30); // one simulated minute
  assert.ok(sim.delivered > 0, "parcels reach doors");
  assert.ok(sim.events.some((e) => e.key === "pickup") && sim.events.some((e) => e.key === "delivered"));
  const t = sim.t;
  sim.configure({ origins: 3, couriers: 10, storage: true, freight: true, people: true });
  assert.equal(sim.t, t, "clock keeps running");
  assert.equal(sim.origins.length, 3);
  assert.equal(sim.vehicles.filter((v) => v.kind === "courier").length, 10);
  assert.ok(sim.vehicles.some((v) => v.kind === "truck") && sim.vehicles.some((v) => v.kind === "shuttle"));
});
