// Turns the published 1869 table into rows with a signed residual (Siddhanta Darpana - published modern).
// A residual here is a difference between two PUBLISHED values, not a verified accuracy measurement.
import { signedAngularDifference } from "./astronomy.js";

export function buildResidualRows(dataset) {
  if (!dataset || !Array.isArray(dataset.positions)) {
    throw new TypeError("Dataset has no positions array.");
  }
  return dataset.positions.map(p => {
    const difference_deg = signedAngularDifference(p.siddhanta_darpana_deg, p.modern_published_deg);
    return {
      body: p.body,
      siddhanta_dms: p.siddhanta_darpana_dms,
      modern_dms: p.modern_published_dms,
      siddhanta_deg: p.siddhanta_darpana_deg,
      modern_deg: p.modern_published_deg,
      difference_deg,
      difference_arcmin: difference_deg * 60
    };
  });
}
