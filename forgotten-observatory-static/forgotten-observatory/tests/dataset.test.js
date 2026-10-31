import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildResidualRows } from "../frontend/js/engine/dataset.js";

const dataset = JSON.parse(readFileSync(new URL("../frontend/data/published_epoch_1869.json", import.meta.url)));
const rows = buildResidualRows(dataset);
const byBody = Object.fromEntries(rows.map(r => [r.body, r]));
const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps, `${a} !~ ${b}`);

test("one row per body, Jupiter excluded", () => {
  assert.equal(rows.length, 6);
  assert.equal(byBody.Jupiter, undefined);
});
test("identical published values give zero", () => {
  assert.equal(byBody.Sun.difference_deg, 0);
  assert.equal(byBody.Mars.difference_deg, 0);
});
test("known residuals in arcminutes", () => {
  close(byBody.Moon.difference_arcmin, 10.4, 1e-3);
  close(byBody.Mercury.difference_arcmin, 27, 1e-3);
  close(byBody.Venus.difference_arcmin, 1, 1e-3);
  close(byBody.Saturn.difference_arcmin, -12, 1e-3);
});
test("rejects malformed dataset", () => assert.throws(() => buildResidualRows({}), TypeError));
