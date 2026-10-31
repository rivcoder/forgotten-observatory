"""
V4 reconstruction tests.

Run from the project root:

python -m pytest -v
"""

import pytest

from backend.reconstruction import (
    days_between,
    reconstruct_longitude,
    propagate_uncertainty,
    reconstruct_with_uncertainty
)


def test_same_date():

    result = days_between(
        "2026-01-01",
        "2026-01-01"
    )

    assert result == 0


def test_one_day_difference():

    result = days_between(
        "2026-01-01",
        "2026-01-02"
    )

    assert result == 1


def test_reverse_date_difference():

    result = days_between(
        "2026-01-02",
        "2026-01-01"
    )

    assert result == -1


def test_leap_year():

    result = days_between(
        "2024-02-28",
        "2024-03-01"
    )

    assert result == 2


def test_basic_reconstruction():

    result = reconstruct_longitude(
        initial_longitude_deg=100,
        mean_motion_deg_per_day=1,
        reference_date="2026-01-01",
        target_date="2026-01-11"
    )

    assert result["elapsed_days"] == 10

    assert result[
        "reconstructed_longitude_deg"
    ] == 110


def test_wrap_around():

    result = reconstruct_longitude(
        initial_longitude_deg=359,
        mean_motion_deg_per_day=1,
        reference_date="2026-01-01",
        target_date="2026-01-03"
    )

    assert result[
        "reconstructed_longitude_deg"
    ] == 1


def test_negative_motion():

    result = reconstruct_longitude(
        initial_longitude_deg=100,
        mean_motion_deg_per_day=-2,
        reference_date="2026-01-01",
        target_date="2026-01-06"
    )

    assert result[
        "reconstructed_longitude_deg"
    ] == 90


def test_zero_motion():

    result = reconstruct_longitude(
        initial_longitude_deg=100,
        mean_motion_deg_per_day=0,
        reference_date="2026-01-01",
        target_date="2026-12-01"
    )

    assert result[
        "reconstructed_longitude_deg"
    ] == 100


def test_invalid_reference_date():

    with pytest.raises(ValueError):

        days_between(
            "invalid",
            "2026-01-01"
        )


def test_invalid_target_date():

    with pytest.raises(ValueError):

        days_between(
            "2026-01-01",
            "invalid"
        )


def test_invalid_longitude():

    with pytest.raises(ValueError):

        reconstruct_longitude(
            initial_longitude_deg=360,
            mean_motion_deg_per_day=1,
            reference_date="2026-01-01",
            target_date="2026-01-02"
        )


def test_nan_motion():

    with pytest.raises(ValueError):

        reconstruct_longitude(
            initial_longitude_deg=100,
            mean_motion_deg_per_day=float("nan"),
            reference_date="2026-01-01",
            target_date="2026-01-02"
        )


def test_uncertainty_propagation():

    result = propagate_uncertainty(
        initial_uncertainty_deg=0.1,
        mean_motion_uncertainty_deg_per_day=0.01,
        elapsed_days=10
    )

    assert result == pytest.approx(
        (0.1 ** 2 + 0.1 ** 2) ** 0.5
    )


def test_uncertainty_zero_days():

    result = propagate_uncertainty(
        initial_uncertainty_deg=0.5,
        mean_motion_uncertainty_deg_per_day=0.1,
        elapsed_days=0
    )

    assert result == pytest.approx(0.5)


def test_negative_uncertainty_rejected():

    with pytest.raises(ValueError):

        propagate_uncertainty(
            initial_uncertainty_deg=-0.1,
            mean_motion_uncertainty_deg_per_day=0,
            elapsed_days=10
        )


def test_reconstruction_with_uncertainty():

    result = reconstruct_with_uncertainty(
        initial_longitude_deg=100,
        mean_motion_deg_per_day=1,
        reference_date="2026-01-01",
        target_date="2026-01-11",
        initial_uncertainty_deg=0.1,
        mean_motion_uncertainty_deg_per_day=0.01
    )

    assert result[
        "reconstructed_longitude_deg"
    ] == 110

    assert result[
        "propagated_uncertainty_deg"
    ] == pytest.approx(0.141421356)