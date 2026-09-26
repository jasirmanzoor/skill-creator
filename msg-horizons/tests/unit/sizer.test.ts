import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_SIZER, decodeSizer, encodeSizer, ordersFromSlider, size, sliderFromOrders, volumeBand } from "../../src/lib/sizer.ts";

test("routes follow orders ÷ stops per route", () => {
  const s = size({ ...DEFAULT_SIZER, orders: 320, peak: 1, cod: 0, profile: "small", window: "nextday" });
  assert.equal(s.drops, 32);
  assert.equal(s.baseRoutes, 10);
  assert.equal(s.baseCouriers, 11); // +10% cover
  assert.equal(s.flex, 0);
});

test("same-day and cash on delivery shorten routes", () => {
  const base = size({ ...DEFAULT_SIZER, orders: 1000, cod: 0, window: "nextday" });
  const tight = size({ ...DEFAULT_SIZER, orders: 1000, cod: 100, window: "sameday" });
  assert.ok(tight.drops < base.drops);
  assert.ok(tight.baseRoutes > base.baseRoutes);
});

test("peak drives a flex pool and the flex headline", () => {
  const s = size({ ...DEFAULT_SIZER, orders: 500, peak: 3 });
  assert.ok(s.flex > 0);
  assert.equal(s.peakCouriers, s.baseCouriers + s.flex);
  assert.equal(s.headline, "flex");
});

test("pickup model changes with volume and stock", () => {
  assert.equal(size({ ...DEFAULT_SIZER, orders: 20 }).pickup, "direct");
  assert.equal(size({ ...DEFAULT_SIZER, orders: 150 }).pickup, "scheduled");
  assert.equal(size({ ...DEFAULT_SIZER, orders: 900 }).pickup, "dedicated");
  assert.equal(size({ ...DEFAULT_SIZER, orders: 900, stock: true }).pickup, "warehouse");
});

test("multi-city adds linehaul; platform runs round the clock", () => {
  assert.ok(size({ ...DEFAULT_SIZER, area: "kingdom" }).linehaul);
  assert.equal(size(DEFAULT_SIZER, "platform").cadence, "roundclock");
});

test("scale share is measured against the published 1,000+ couriers", () => {
  const s = size({ ...DEFAULT_SIZER, orders: 20000, peak: 3 });
  assert.ok(s.scaleShare > 1);
  assert.ok(s.decisions.some((d) => d.id === "scale" && d.beyond));
});

test("sizer inputs round-trip through the URL and reject junk", () => {
  const i = { orders: 750, peak: 2.5, area: "multi" as const, window: "sameday" as const, profile: "mixed" as const, stock: true, cod: 40 };
  assert.deepEqual(decodeSizer(encodeSizer(i)), i);
  assert.equal(decodeSizer("o-5_p99_aMars")?.peak, 5);
  assert.equal(decodeSizer("o-5_p99_aMars")?.area, "riyadh");
});

test("slider is logarithmic and volume bands match the planner", () => {
  assert.equal(ordersFromSlider(0), 5);
  assert.equal(ordersFromSlider(1), 20000);
  assert.ok(Math.abs(sliderFromOrders(ordersFromSlider(0.5)) - 0.5) < 0.02);
  assert.equal(volumeBand(10), "starting");
  assert.equal(volumeBand(150), "steady");
  assert.equal(volumeBand(1500), "scaling");
  assert.equal(volumeBand(5000), "high");
});
