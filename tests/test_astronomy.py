"""
V4 astronomy calculation tests.
"""

import pytest

from backend.astronomy import (
    validate_longitude,
    signed_angular_difference,
    absolute_angular_difference,
    degrees_to_dms,
    dms_to_degrees,
    gnomon_shadow_length,
    combined_uncertainty
)


def test_valid_longitude():

    assert validate_longitude(100) == 100


def test_invalid_longitude():

    with pytest.raises(ValueError):

        validate_longitude(360)


def test_angular_difference():

    assert absolute_angular_difference(
        100,
        99
    ) == 1


def test_angular_wrap():

    assert absolute_angular_difference(
        359,
        1
    ) == 2


def test_signed_difference():

    assert signed_angular_difference(
        99,
        100
    ) == -1


def test_dms_conversion():

    assert dms_to_degrees(
        358,
        15,
        0
    ) == 358.25


def test_decimal_to_dms():

    result = degrees_to_dms(358.25)

    assert result["degrees"] == 358
    assert result["minutes"] == 15


def test_gnomon_45():

    assert gnomon_shadow_length(
        1,
        45
    ) == pytest.approx(1)


def test_gnomon_30():

    assert gnomon_shadow_length(
        1,
        30
    ) == pytest.approx(1.73205, abs=0.0001)


def test_invalid_gnomon():

    with pytest.raises(ValueError):

        gnomon_shadow_length(
            1,
            90
        )


def test_combined_uncertainty():

    assert combined_uncertainty(
        3,
        4
    ) == 5


def test_negative_uncertainty():

    with pytest.raises(ValueError):

        combined_uncertainty(
            -1,
            2
        )