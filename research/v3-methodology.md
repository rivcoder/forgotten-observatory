# The Forgotten Observatory
## V3 — Research Methodology and Validation

### 1. Purpose

V3 introduces a modular calculation engine and automated
mathematical tests.

The objective is to improve reproducibility and make the
assumptions behind every calculation visible.

The project investigates historical Indian astronomical
methods associated with Pathani Samanta and Siddhanta Darpana.

### 2. Angular comparison

The comparison engine accepts two celestial longitudes:

- Historical longitude (H)
- Modern reference longitude (M)

The signed shortest angular difference is:

Δ = ((H - M + 180) mod 360) - 180

The absolute angular separation is:

|Δ|

The formula handles the 0°/360° boundary.

Example:

H = 359°
M = 1°

Δ = -2°

Absolute difference = 2°

### 3. Coordinate compatibility

A numerical difference alone does not establish scientific
agreement or disagreement.

Before interpreting a comparison, document:

- Coordinate origin
- Reference plane
- Coordinate frame
- Epoch
- Time scale
- Mean or apparent position
- Geocentric or heliocentric convention
- Ayanamsa, if applicable
- Historical calculation method
- Modern ephemeris settings

If these are unknown, the result must remain labelled
as a numerical comparison only.

### 4. Gnomon model

The ideal shadow-length model is:

L = H / tan(θ)

Where:

L = shadow length
H = vertical gnomon height
θ = solar altitude above the horizon

Assumptions:

- Gnomon is vertical.
- Ground is horizontal.
- Solar rays are treated as parallel.
- Shadow endpoint is measured ideally.

Real measurements may be affected by:

- Terrain slope
- Instrument alignment
- Atmospheric conditions
- Penumbra
- Reading precision
- Local obstructions

### 5. Uncertainty

For independent standard uncertainties:

σcombined = sqrt(σhistorical² + σmodern²)

This is an uncertainty propagation approximation.

It is not appropriate to use this formula blindly
when errors are correlated or systematic.

Systematic uncertainty should be documented separately.

### 6. Historical dataset

The 12 April 1869 dataset is transcribed from a
secondary publication.

It is not independently verified against every
original historical calculation.

The dataset must retain its source attribution
and transcription status.

The ambiguous Jupiter value is excluded.

### 7. Automated testing

The V3 test suite checks:

- Longitude boundaries
- Angular wrap-around
- Signed angular differences
- DMS conversion
- Gnomon geometry
- Uncertainty propagation
- Comparison status labels

Passing software tests demonstrates that the
implemented formulas behave as expected for
the tested inputs.

It does not prove the historical astronomical
calculations are correct.

### 8. Future validation

A future research stage should:

1. Identify the exact historical text edition.
2. Locate the original calculation passage.
3. Transcribe the relevant formula.
4. Record constants and intermediate calculations.
5. Establish the historical coordinate convention.
6. Obtain a modern reference with matching settings.
7. Quantify uncertainty.
8. Compare results.
9. Publish the calculation trail.

### 9. Research integrity

Do not claim that the historical method is more accurate,
equally accurate or less accurate based only on a
published comparison table.

Any conclusion must be supported by reproducible
calculations and documented assumptions.