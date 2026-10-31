// Port of backend/astronomy.py. Result keys stay snake_case so the UI is a drop-in.

const radians = deg => (deg * Math.PI) / 180;
export const mod = (x, m) => ((x % m) + m) % m; // always in [0, m), like Python's %

function toNumber(value, name) {
  if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) {
    throw new RangeError(`${name} is required.`);
  }
  return Number(value);
}

export function validateLongitude(value) {
  const v = toNumber(value, "Longitude");
  if (!Number.isFinite(v)) throw new RangeError("Longitude must be finite.");
  if (!(v >= 0 && v < 360)) {
    throw new RangeError("Longitude must be between 0 and less than 360 degrees.");
  }
  return v;
}

export function signedAngularDifference(historical, modern) {
  return mod(validateLongitude(historical) - validateLongitude(modern) + 180, 360) - 180;
}

export const absoluteAngularDifference = (h, m) => Math.abs(signedAngularDifference(h, m));

export function degreesToDms(angle) {
  const a = toNumber(angle, "Angle");
  if (!Number.isFinite(a) || a < 0) throw new RangeError("Angle must be finite and non-negative.");
  const degrees = Math.trunc(a);
  const remaining = (a - degrees) * 60;
  const minutes = Math.trunc(remaining);
  const seconds = Number(((remaining - minutes) * 60).toFixed(6));
  return { degrees, minutes, seconds };
}

export function dmsToDegrees(degrees, minutes = 0, seconds = 0) {
  if (degrees < 0) throw new RangeError("Degrees cannot be negative.");
  if (!(minutes >= 0 && minutes < 60)) throw new RangeError("Invalid minutes.");
  if (!(seconds >= 0 && seconds < 60)) throw new RangeError("Invalid seconds.");
  return degrees + minutes / 60 + seconds / 3600;
}

export function gnomonShadowLength(heightM, solarAltitudeDeg) {
  const h = toNumber(heightM, "Height");
  const alt = toNumber(solarAltitudeDeg, "Solar altitude");
  if (!Number.isFinite(h) || h <= 0) throw new RangeError("Height must be positive.");
  if (!Number.isFinite(alt) || !(alt > 0 && alt < 90)) {
    throw new RangeError("Solar altitude must be between 0 and 90 degrees.");
  }
  return h / Math.tan(radians(alt));
}

export function combinedUncertainty(historicalUncertainty, modernUncertainty) {
  const a = Number(historicalUncertainty);
  const b = Number(modernUncertainty);
  if (!Number.isFinite(a) || !Number.isFinite(b)) throw new RangeError("Uncertainties must be finite.");
  if (a < 0 || b < 0) throw new RangeError("Uncertainties cannot be negative.");
  return Math.hypot(a, b);
}

export function comparePositions(
  historical,
  modern,
  historicalUncertainty = 0,
  modernUncertainty = 0,
  conventionsMatched = false
) {
  const signed = signedAngularDifference(historical, modern);
  return {
    historical_longitude_deg: Number(historical),
    modern_longitude_deg: Number(modern),
    signed_difference_deg: signed,
    absolute_difference_deg: Math.abs(signed),
    combined_uncertainty_deg: combinedUncertainty(historicalUncertainty, modernUncertainty),
    comparison_status: conventionsMatched ? "conventions_declared_matched" : "conventions_not_verified"
  };
}
