import { test } from "node:test";
import assert from "node:assert/strict";
import { position, routeFraction, showNext, stepIndex } from "../../src/lib/journey.ts";

const tops = [0, 1000, 2500, 4000];
const end = 6000;

test("position: which stop is being read, and how far through it", () => {
  assert.deepEqual(position(tops, end, 0), { index: 0, t: 0, p: 0 });
  assert.deepEqual(position(tops, end, 500), { index: 0, t: 0.5, p: 0.5 });
  assert.deepEqual(position(tops, end, 1000), { index: 1, t: 0, p: 1 });
  assert.equal(position(tops, end, 1750).p, 1.5);
  assert.equal(position(tops, end, 5000).index, 3);
  assert.equal(position(tops, end, 5000).t, 0.5);
});

test("position: above the first stop or past the end stays inside the route", () => {
  assert.deepEqual(position(tops, end, -300), { index: 0, t: 0, p: 0 });
  const past = position(tops, end, 9000);
  assert.equal(past.index, 3);
  assert.equal(past.t, 1);
  assert.deepEqual(position([], end, 100), { index: 0, t: 0, p: 0 });
});

test("p glides: it never jumps when crossing from one stop to the next", () => {
  const a = position(tops, end, 999).p;
  const b = position(tops, end, 1001).p;
  assert.ok(b > a && b - a < 0.01);
});

test("stepIndex stays within the stops", () => {
  assert.equal(stepIndex(0, -1, 4), 0);
  assert.equal(stepIndex(3, 1, 4), 3);
  assert.equal(stepIndex(1, 1, 4), 2);
  assert.equal(stepIndex(2, -1, 4), 1);
});

test("the next-stop invitation shows near the end of a stop, never on the last one", () => {
  assert.equal(showNext(1, 0.5, 4), false);
  assert.equal(showNext(1, 0.85, 4), true);
  assert.equal(showNext(3, 0.95, 4), false);
});

test("routeFraction maps a position onto 0–1 along the route", () => {
  assert.equal(routeFraction(0, 5), 0);
  assert.equal(routeFraction(2, 5), 0.5);
  assert.equal(routeFraction(4, 5), 1);
  assert.equal(routeFraction(9, 5), 1);
  assert.equal(routeFraction(0, 1), 0);
});

import { buildRoute } from "../../src/lib/journey.ts";

test("route map: twelve stops snake across two rows, joined by a U-turn", () => {
  const r = buildRoute(12, false);
  assert.equal(r.pts.length, 12);
  assert.ok(r.pts[0].x < r.pts[5].x, "the first row runs left to right");
  assert.equal(r.pts[0].y, r.pts[5].y);
  assert.equal(r.pts[5].x, r.pts[6].x, "the U-turn drops straight down to the second row");
  assert.ok(r.pts[6].y > r.pts[5].y);
  assert.ok(r.pts[6].x > r.pts[11].x, "the second row runs back");
  assert.match(r.d, /^M [\d.]+ [\d.]+ L/);
  assert.match(r.d, / C /);
});

test("route map: the courier's path passes through every stop, in order", () => {
  const r = buildRoute(12, false);
  assert.equal(r.stopLen.length, 12);
  for (let i = 1; i < r.stopLen.length; i++) assert.ok(r.stopLen[i] > r.stopLen[i - 1]);
  for (let i = 0; i < 12; i++) {
    const p = r.at(r.stopLen[i]);
    assert.ok(Math.hypot(p.x - r.pts[i].x, p.y - r.pts[i].y) < 0.5, `stop ${i}`);
  }
  assert.deepEqual(r.at(-5), r.pts[0]);
  const end = r.at(r.total + 50);
  assert.ok(Math.hypot(end.x - r.pts[11].x, end.y - r.pts[11].y) < 0.5);
});

test("route map: right-to-left mirrors the whole route", () => {
  const a = buildRoute(12, false);
  const b = buildRoute(12, true);
  for (let i = 0; i < 12; i++) {
    assert.ok(Math.abs(a.pts[i].x + b.pts[i].x - 1000) < 1e-6);
    assert.equal(a.pts[i].y, b.pts[i].y);
  }
  assert.ok(Math.abs(a.total - b.total) < 1e-6);
});

test("route map: odd stop counts and tiny routes still work", () => {
  for (const n of [2, 3, 7, 11]) {
    const r = buildRoute(n, false);
    assert.equal(r.stopLen.length, n);
    assert.ok(r.total > 0);
  }
});
