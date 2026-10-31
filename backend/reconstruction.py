"""
The Forgotten Observatory
V4 - Mean Motion Reconstruction Engine

This module implements a general linear mean-motion model.

It is NOT an implementation of the original Siddhanta
Darpana equations.

Historical parameters must be independently sourced
before this engine can represent a historical method.
"""

from datetime import date
from math import isfinite, sqrt


def validate_longitude(longitude: float) -> float:

    longitude = float(longitude)

    if not isfinite(longitude):
        raise ValueError("Longitude must be finite.")

    if not 0 <= longitude < 360:
        raise ValueError(
            "Longitude must be between 0 and less than 360 degrees."
        )

    return longitude


def days_between(
    reference_date: str,
    target_date: str
) -> int:
    """
    Calculate the number of calendar days between two ISO dates.
    """

    try:

        reference = date.fromisoformat(reference_date)
        target = date.fromisoformat(target_date)

    except ValueError:

        raise ValueError(
            "Dates must use YYYY-MM-DD format."
        )

    return (target - reference).days


def reconstruct_longitude(
    initial_longitude_deg: float,
    mean_motion_deg_per_day: float,
    reference_date: str,
    target_date: str
) -> dict:
    """
    Calculate longitude using a constant mean angular motion.

    Formula:

    longitude = (initial longitude + mean motion * elapsed days) % 360

    Mean motion may be positive or negative.
    """

    initial_longitude_deg = validate_longitude(
        initial_longitude_deg
    )

    mean_motion_deg_per_day = float(
        mean_motion_deg_per_day
    )

    if not isfinite(mean_motion_deg_per_day):
        raise ValueError("Mean motion must be finite.")

    elapsed_days = days_between(
        reference_date,
        target_date
    )

    unwrapped_longitude = (
        initial_longitude_deg
        + mean_motion_deg_per_day * elapsed_days
    )

    reconstructed_longitude = (
        unwrapped_longitude % 360
    )

    return {
        "reference_date": reference_date,
        "target_date": target_date,
        "elapsed_days": elapsed_days,
        "initial_longitude_deg": initial_longitude_deg,
        "mean_motion_deg_per_day": mean_motion_deg_per_day,
        "unwrapped_longitude_deg": unwrapped_longitude,
        "reconstructed_longitude_deg": reconstructed_longitude,
        "model": "constant_mean_angular_motion"
    }


def propagate_uncertainty(
    initial_uncertainty_deg: float,
    mean_motion_uncertainty_deg_per_day: float,
    elapsed_days: int
) -> float:
    """
    Propagate independent uncertainty in initial longitude
    and mean motion.

    sigma(t) = sqrt(
        sigma_initial^2 +
        (elapsed_days * sigma_rate)^2
    )

    This does not include systematic errors or covariance.
    """

    initial_uncertainty_deg = float(
        initial_uncertainty_deg
    )

    mean_motion_uncertainty_deg_per_day = float(
        mean_motion_uncertainty_deg_per_day
    )

    if not isfinite(initial_uncertainty_deg):
        raise ValueError("Initial uncertainty must be finite.")

    if not isfinite(mean_motion_uncertainty_deg_per_day):
        raise ValueError("Rate uncertainty must be finite.")

    if initial_uncertainty_deg < 0:
        raise ValueError("Initial uncertainty cannot be negative.")

    if mean_motion_uncertainty_deg_per_day < 0:
        raise ValueError("Rate uncertainty cannot be negative.")

    return sqrt(
        initial_uncertainty_deg ** 2
        + (
            elapsed_days
            * mean_motion_uncertainty_deg_per_day
        ) ** 2
    )


def reconstruct_with_uncertainty(
    initial_longitude_deg: float,
    mean_motion_deg_per_day: float,
    reference_date: str,
    target_date: str,
    initial_uncertainty_deg: float = 0,
    mean_motion_uncertainty_deg_per_day: float = 0
) -> dict:
    """
    Return a reconstructed longitude with propagated
    model parameter uncertainty.
    """

    result = reconstruct_longitude(
        initial_longitude_deg=initial_longitude_deg,
        mean_motion_deg_per_day=mean_motion_deg_per_day,
        reference_date=reference_date,
        target_date=target_date
    )

    uncertainty = propagate_uncertainty(
        initial_uncertainty_deg=initial_uncertainty_deg,
        mean_motion_uncertainty_deg_per_day=(
            mean_motion_uncertainty_deg_per_day
        ),
        elapsed_days=result["elapsed_days"]
    )

    result.update({
        "initial_uncertainty_deg": initial_uncertainty_deg,
        "mean_motion_uncertainty_deg_per_day": (
            mean_motion_uncertainty_deg_per_day
        ),
        "propagated_uncertainty_deg": uncertainty
    })

    return result