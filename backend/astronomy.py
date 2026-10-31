"""
The Forgotten Observatory
V4 - Astronomy Mathematics
"""

from math import radians, tan, sqrt, isfinite


def validate_longitude(value):

    value = float(value)

    if not isfinite(value):
        raise ValueError("Longitude must be finite.")

    if not 0 <= value < 360:
        raise ValueError(
            "Longitude must be between 0 and less than 360 degrees."
        )

    return value


def signed_angular_difference(
    historical,
    modern
):

    historical = validate_longitude(historical)
    modern = validate_longitude(modern)

    return (
        (historical - modern + 180) % 360
    ) - 180


def absolute_angular_difference(
    historical,
    modern
):

    return abs(
        signed_angular_difference(
            historical,
            modern
        )
    )


def degrees_to_dms(angle):

    angle = float(angle)

    if not isfinite(angle) or angle < 0:
        raise ValueError(
            "Angle must be finite and non-negative."
        )

    degrees = int(angle)

    remaining = (angle - degrees) * 60

    minutes = int(remaining)

    seconds = (remaining - minutes) * 60

    return {
        "degrees": degrees,
        "minutes": minutes,
        "seconds": round(seconds, 6)
    }


def dms_to_degrees(
    degrees,
    minutes=0,
    seconds=0
):

    if degrees < 0:
        raise ValueError("Degrees cannot be negative.")

    if not 0 <= minutes < 60:
        raise ValueError("Invalid minutes.")

    if not 0 <= seconds < 60:
        raise ValueError("Invalid seconds.")

    return (
        degrees
        + minutes / 60
        + seconds / 3600
    )


def gnomon_shadow_length(
    height_m,
    solar_altitude_deg
):

    height_m = float(height_m)
    solar_altitude_deg = float(solar_altitude_deg)

    if not isfinite(height_m) or height_m <= 0:
        raise ValueError("Height must be positive.")

    if (
        not isfinite(solar_altitude_deg)
        or not 0 < solar_altitude_deg < 90
    ):
        raise ValueError(
            "Solar altitude must be between 0 and 90 degrees."
        )

    return (
        height_m /
        tan(radians(solar_altitude_deg))
    )


def combined_uncertainty(
    historical_uncertainty,
    modern_uncertainty
):

    historical_uncertainty = float(
        historical_uncertainty
    )

    modern_uncertainty = float(
        modern_uncertainty
    )

    if (
        not isfinite(historical_uncertainty)
        or not isfinite(modern_uncertainty)
    ):
        raise ValueError("Uncertainties must be finite.")

    if historical_uncertainty < 0 or modern_uncertainty < 0:
        raise ValueError("Uncertainties cannot be negative.")

    return sqrt(
        historical_uncertainty ** 2
        + modern_uncertainty ** 2
    )


def compare_positions(
    historical,
    modern,
    historical_uncertainty=0,
    modern_uncertainty=0,
    conventions_matched=False
):

    signed = signed_angular_difference(
        historical,
        modern
    )

    absolute = abs(signed)

    uncertainty = combined_uncertainty(
        historical_uncertainty,
        modern_uncertainty
    )

    status = (
        "conventions_declared_matched"
        if conventions_matched
        else "conventions_not_verified"
    )

    return {
        "historical_longitude_deg": float(historical),
        "modern_longitude_deg": float(modern),
        "signed_difference_deg": signed,
        "absolute_difference_deg": absolute,
        "combined_uncertainty_deg": uncertainty,
        "comparison_status": status
    }