import test from "node:test";
import assert from "node:assert/strict";
import {
  daysBetween, reconstructLongitude, propagateUncertainty, reconstructWithUncertainty
} from "../frontend/js/engine/reconstruction.js";

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} !~ ${b}`);
const lon = (...args) => reconstructLongitude(...args).reconstructed_longitude_deg;

test("same date", () => assert.equal(daysBetween("2026-01-01", "2026-01-01"), 0));
test("one day", () => assert.equal(daysBetween("2026-01-01", "2026-01-02"), 1));
test("reverse", () => assert.equal(daysBetween("2026-01-02", "2026-01-01"), -1));
test("leap year", () => assert.equal(daysBetween("2024-02-28", "2024-03-01"), 2));
test("DST boundary is not a 23h day", () => assert.equal(daysBetween("2026-03-28", "2026-03-30"), 2));
test("invalid dates", () => {
  assert.throws(() => daysBetween("invalid", "2026-01-01"), RangeError);
  assert.throws(() => daysBetween("2026-01-01", "invalid"), RangeError);
  assert.throws(() => daysBetween("2026-02-30", "2026-03-01"), RangeError);
});

test("basic reconstruction", () => {
  const r = reconstructLongitude(100, 1, "2026-01-01", "2026-01-11");
  assert.equal(r.elapsed_days, 10);
  assert.equal(r.reconstructed_longitude_deg, 110);
});
test("wrap-around", () => assert.equal(lon(359, 1, "2026-01-01", "2026-01-03"), 1));
test("negative motion", () => assert.equal(lon(100, -2, "2026-01-01", "2026-01-06"), 90));
test("negative wrap stays in [0,360)", () => assert.equal(lon(1, -1, "2026-01-01", "2026-01-03"), 359));
test("zero motion", () => assert.equal(lon(100, 0, "2026-01-01", "2026-12-01"), 100));
test("invalid longitude", () => assert.throws(() => lon(360, 1, "2026-01-01", "2026-01-02"), RangeError));
test("NaN motion", () => assert.throws(() => lon(100, NaN, "2026-01-01", "2026-01-02"), RangeError));

test("uncertainty propagation", () => close(propagateUncertainty(0.1, 0.01, 10), Math.sqrt(0.02)));
test("uncertainty zero days", () => close(propagateUncertainty(0.5, 0.1, 0), 0.5));
test("negative uncertainty rejected", () => assert.throws(() => propagateUncertainty(-0.1, 0, 10), RangeError));
test("reconstruction with uncertainty", () => {
  const r = reconstructWithUncertainty(100, 1, "2026-01-01", "2026-01-11", 0.1, 0.01);
  assert.equal(r.reconstructed_longitude_deg, 110);
  close(r.propagated_uncertainty_deg, 0.141421356);
});
