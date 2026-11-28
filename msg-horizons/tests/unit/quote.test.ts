import { test } from "node:test";
import assert from "node:assert/strict";
import { interShare, quote, quoteRef } from "../../src/lib/quote.ts";
import { DEFAULT_SIZER, decodeSizer, encodeSizer } from "../../src/lib/sizer.ts";
import { EXTRA_RATES } from "../../src/content/quoteRates.ts";

const base = { ...DEFAULT_SIZER, cod: 0, profile: "small" as const, window: "nextday" as const, stock: false };

test("same-city orders use the intra-city rate at the volume tier", () => {
  const q = quote({ ...base, orders: 100, area: "riyadh" }); // 3,000 a month: tier reached
  assert.equal(q.monthly, 3000);
  assert.deepEqual(q.lanes, [{ lane: "intra", shipments: 3000, rate: 21, total: 63000 }]);
  assert.equal(q.subtotal, 63000);
  assert.equal(q.perOrder, 21);
  assert.equal(q.tier.reached, true);
  assert.equal(q.tier.saving, 3000 * (33 - 21));
});

test("below 299 a month the walk-in rate applies and the tier gap is shown", () => {
  const q = quote({ ...base, orders: 5, area: "kingdom" }); // 150 a month
  assert.equal(q.lanes[0].lane, "inter");
  assert.equal(q.lanes[0].rate, 52);
  assert.equal(q.tier.reached, false);
  assert.equal(q.tier.toGo, 149);
  assert.equal(q.tier.saving, 150 * (52 - 30));
});

test("the visitor's own city-to-city split prices each lane", () => {
  const q = quote({ ...base, orders: 100, area: "multi", split: 30 });
  assert.equal(interShare({ area: "multi", split: 30 }), 0.3);
  assert.deepEqual(q.lanes.map((l) => [l.lane, l.shipments, l.rate]), [["intra", 2100, 21], ["inter", 900, 30]]);
  assert.equal(q.subtotal, 2100 * 21 + 900 * 30);
});

test("shipping from Sabya uses the Sabya lanes", () => {
  const q = quote({ ...base, orders: 20, area: "multi", split: 50, origin: "sabya" });
  assert.deepEqual(q.lanes.map((l) => [l.lane, l.rate]), [["sabyaLocal", 17], ["sabyaMajor", 28]]);
});

test("anything the rate card does not cover is confirmed by MSG, never invented", () => {
  const q = quote({ ...base, orders: 100, cod: 40, window: "sameday", profile: "bulky", stock: true });
  assert.deepEqual(q.extras.map((x) => x.id), ["cod", "sameday", "weight", "storage", "returns"]);
  assert.ok(q.extras.every((x) => x.total === null));
  assert.equal(q.pending, 5);
  assert.equal(q.extras[0].shipments, 1200);
  assert.equal(q.subtotal, 63000, "only the rate card is priced");
});

test("once MSG fills in a rate, that line is priced and added", () => {
  const rates = { ...EXTRA_RATES, codPerOrder: 2, storageMonthly: 1500 };
  const q = quote({ ...base, orders: 100, cod: 50, stock: true }, rates);
  assert.equal(q.extras.find((x) => x.id === "cod")?.total, 3000);
  assert.equal(q.subtotal, 63000 + 3000 + 1500);
  assert.equal(q.pending, 1, "returns stay with MSG");
  assert.equal(q.annual, (63000 + 3000 + 1500) * 12);
});

test("busiest day scales with the peak", () => {
  const q = quote({ ...base, orders: 100, peak: 2.5 });
  assert.equal(q.day, 2100);
  assert.equal(q.peakDay, 5250);
});

test("split and origin survive a shared link; older links still decode", () => {
  const i = { ...base, orders: 80, area: "multi" as const, split: 35, origin: "sabya" as const };
  assert.deepEqual(decodeSizer(encodeSizer(i)), i);
  const old = decodeSizer("o80_p2_amulti_wnextday_fsmall_s0_c0");
  assert.equal(old?.split, undefined);
  assert.equal(old?.origin, undefined);
});

test("quote references are short and stable", () => {
  assert.match(quoteRef("seller~parcels~steady~"), /^MSG-[0-9A-Z]{6}$/);
  assert.equal(quoteRef("a"), quoteRef("a"));
  assert.notEqual(quoteRef("a"), quoteRef("b"));
});
