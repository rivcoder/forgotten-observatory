# The Forgotten Observatory
# V4 — Mean-Motion Reconstruction Methodology

## 1. Objective

V4 introduces a parameterized mathematical engine
for reconstructing angular positions over time.

The model provides a computational framework for
investigating historical planetary calculations.

It is not a direct implementation of Siddhanta Darpana.

## 2. Mathematical model

The engine uses:

λ(t) = [λ₀ + n(t − t₀)] mod 360°

Where:

λ(t) = reconstructed angular position
λ₀ = initial angular position
n = constant mean angular motion per day
t₀ = reference date
t = target date

The elapsed time is measured in calendar days.

## 3. Model assumptions

The current engine assumes:

- Constant mean angular motion.
- A single angular coordinate.
- No explicit orbital eccentricity correction.
- No perturbation model.
- No nutation or precession model.
- No automatic conversion between coordinate frames.

This is a simplified mathematical model.

## 4. Uncertainty propagation

The engine supports independent uncertainty
in the initial longitude and mean-motion rate.

σ(t) = sqrt(σ₀² + (Δt × σₙ)²)

Where:

σ₀ = initial longitude uncertainty
σₙ = mean-motion uncertainty per day
Δt = elapsed days

This calculation assumes independent errors.

It does not include systematic uncertainty,
correlation, or model inadequacy.

## 5. Historical application

To represent a historical astronomical method,
the following must be independently documented:

1. Historical text edition.
2. Original equation or calculation rule.
3. Reference epoch.
4. Initial planetary position.
5. Mean-motion constant.
6. Units and angular convention.
7. Corrections or additional terms.
8. Intermediate calculations.

Do not substitute modern mean-motion constants
and describe the resulting output as a historical
reconstruction.

## 6. Comparison requirements

A historical value and modern reference must use
compatible:

- Coordinate origin.
- Reference plane.
- Coordinate frame.
- Epoch.
- Time scale.
- Geocentric or heliocentric convention.
- Mean or apparent position.
- Ayanamsa, where applicable.

A numerical difference is not automatically
an accuracy measurement.

## 7. Validation strategy

The V4 automated tests verify:

- Date arithmetic.
- Leap-year handling.
- Forward and backward time intervals.
- Angular wrap-around.
- Positive and negative mean motion.
- Zero motion.
- Invalid inputs.
- Uncertainty propagation.

Passing these tests validates the implemented
software behaviour, not the historical model.

## 8. Limitations

The current model does not calculate a complete
physical planetary orbit.

It should not be used as a substitute for
a high-precision astronomical ephemeris.

## 9. Future research

Potential next stages:

- Transcribe historical mean-motion constants.
- Implement historical correction equations.
- Establish a documented epoch and coordinate system.
- Compare with an appropriately configured modern ephemeris.
- Quantify residuals and uncertainty.
- Publish reproducible examples.

## 10. Research integrity

Every parameter must have a traceable source.

Illustrative parameters must be labelled illustrative.

No claim of historical accuracy should be made
without independent source verification and
a reproducible comparison.