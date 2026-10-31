// Port of backend/reconstruction.py: a general constant mean-motion model.
// NOT an implementation of the original Siddhanta Darpana equations.

import { mod, validateLongitude } from "./astronomy.js";

const MS_PER_DAY = 86_400_000;

function parseISODate(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text));
  if (m) {
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const t = Date.UTC(y, mo - 1, d);
    const c = new Date(t);
    // Round-trip check rejects things like 2026-02-30
    if (c.getUTCFullYear() === y && c.getUTCMonth() === mo - 1 && c.getUTCDate() === d) return t;
  }
  throw new RangeError("Dates must use YYYY-MM-DD format.");
}

// Whole UTC calendar days; immune to DST and time zones.
export function daysBetween(referenceDate, targetDate) {
  return Math.round((parseISODate(targetDate) - parseISODate(referenceDate)) / MS_PER_DAY);
}

export function reconstructLongitude(initialLongitudeDeg, meanMotionDegPerDay, referenceDate, targetDate) {
  const initial = validateLongitude(initialLongitudeDeg);
  const n = Number(meanMotionDegPerDay);
  if (!Number.isFinite(n)) throw new RangeError("Mean motion must be finite.");

  const elapsed = daysBetween(referenceDate, targetDate);
  const unwrapped = initial + n * elapsed;

  return {
    reference_date: referenceDate,
    target_date: targetDate,
    elapsed_days: elapsed,
    initial_longitude_deg: initial,
    mean_motion_deg_per_day: n,
    unwrapped_longitude_deg: unwrapped,
    reconstructed_longitude_deg: mod(unwrapped, 360),
    model: "constant_mean_angular_motion"
  };
}

// sigma(t) = sqrt(sigma0^2 + (elapsed * sigma_n)^2); independent errors only.
export function propagateUncertainty(initialUncertaintyDeg, meanMotionUncertaintyDegPerDay, elapsedDays) {
  const s0 = Number(initialUncertaintyDeg);
  const sn = Number(meanMotionUncertaintyDegPerDay);
  if (!Number.isFinite(s0)) throw new RangeError("Initial uncertainty must be finite.");
  if (!Number.isFinite(sn)) throw new RangeError("Rate uncertainty must be finite.");
  if (s0 < 0) throw new RangeError("Initial uncertainty cannot be negative.");
  if (sn < 0) throw new RangeError("Rate uncertainty cannot be negative.");
  return Math.hypot(s0, elapsedDays * sn);
}

export function reconstructWithUncertainty(
  initialLongitudeDeg, meanMotionDegPerDay, referenceDate, targetDate,
  initialUncertaintyDeg = 0, meanMotionUncertaintyDegPerDay = 0
) {
  const result = reconstructLongitude(initialLongitudeDeg, meanMotionDegPerDay, referenceDate, targetDate);
  return {
    ...result,
    initial_uncertainty_deg: initialUncertaintyDeg,
    mean_motion_uncertainty_deg_per_day: meanMotionUncertaintyDegPerDay,
    propagated_uncertainty_deg: propagateUncertainty(
      initialUncertaintyDeg, meanMotionUncertaintyDegPerDay, result.elapsed_days
    )
  };
}
