import test from "node:test";
import assert from "node:assert/strict";
import {
  validateLongitude, signedAngularDifference, absoluteAngularDifference,
  degreesToDms, dmsToDegrees, gnomonShadowLength, combinedUncertainty, comparePositions
} from "../frontend/js/engine/astronomy.js";

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} !~ ${b}`);

test("valid longitude", () => assert.equal(validateLongitude(100), 100));
test("invalid longitude", () => assert.throws(() => validateLongitude(360), RangeError));
test("rejects empty and NaN", () => {
  assert.throws(() => validateLongitude(""), RangeError);
  assert.throws(() => validateLongitude(NaN), RangeError);
});
test("angular difference", () => assert.equal(absoluteAngularDifference(100, 99), 1));
test("angular wrap", () => assert.equal(absoluteAngularDifference(359, 1), 2));
test("signed difference", () => assert.equal(signedAngularDifference(99, 100), -1));
test("DMS to degrees", () => assert.equal(dmsToDegrees(358, 15, 0), 358.25));
test("degrees to DMS", () => {
  const r = degreesToDms(358.25);
  assert.equal(r.degrees, 358);
  assert.equal(r.minutes, 15);
});
test("gnomon 45", () => close(gnomonShadowLength(1, 45), 1));
test("gnomon 30", () => close(gnomonShadowLength(1, 30), 1.73205, 1e-4));
test("invalid gnomon", () => assert.throws(() => gnomonShadowLength(1, 90), RangeError));
test("combined uncertainty", () => assert.equal(combinedUncertainty(3, 4), 5));
test("negative uncertainty", () => assert.throws(() => combinedUncertainty(-1, 2), RangeError));
test("compare status labels", () => {
  assert.equal(comparePositions(10, 10).comparison_status, "conventions_not_verified");
  assert.equal(comparePositions(10, 10, 0, 0, true).comparison_status, "conventions_declared_matched");
});
