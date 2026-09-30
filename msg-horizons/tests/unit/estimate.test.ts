import { test } from "node:test";
import assert from "node:assert/strict";
import { estimateMonthly } from "../../src/lib/estimate.ts";
import { RATES } from "../../src/content/rates.ts";
import { DEFAULT_SIZER } from "../../src/lib/sizer.ts";

test("no rate card, no price: the estimator never invents one", () => {
  assert.equal(estimateMonthly(DEFAULT_SIZER, RATES), null);
});

test("with a rate card the estimate is orders × days × rate (+ COD, storage)", () => {
  const card = { ...RATES, perOrder: { small: 10, mixed: 12, bulky: 20 }, codPerOrder: 2, storageMonthly: 1000, outsideRiyadhPerOrder: null };
  const i = { ...DEFAULT_SIZER, orders: 100, cod: 50, stock: true, profile: "small" as const, area: "riyadh" as const };
  // 100×30×10 = 30,000 · COD 1,500×2 = 3,000 · storage 1,000
  assert.equal(estimateMonthly(i, card), 34000);
  assert.equal(estimateMonthly({ ...i, cod: 0, stock: false }, card), 30000);
  assert.equal(estimateMonthly(i, { ...card, codPerOrder: null }), null);
});
