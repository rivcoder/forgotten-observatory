"""
The Forgotten Observatory
V4 - FastAPI Application
"""

import json

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel, Field

from astronomy import (
    compare_positions,
    gnomon_shadow_length,
    degrees_to_dms,
    dms_to_degrees
)

from reconstruction import (
    reconstruct_longitude,
    reconstruct_with_uncertainty
)


BASE_DIR = Path(__file__).resolve().parent

DATASET_PATH = (
    BASE_DIR / "data" / "published_epoch_1869.json"
)


app = FastAPI(
    title="The Forgotten Observatory",
    description=(
        "Computational reconstruction of historical "
        "Indian astronomy."
    ),
    version="0.4.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"]
)


class ComparisonInput(BaseModel):

    historical_longitude: float = Field(
        ge=0,
        lt=360
    )

    modern_longitude: float = Field(
        ge=0,
        lt=360
    )

    historical_uncertainty: float = Field(
        default=0,
        ge=0
    )

    modern_uncertainty: float = Field(
        default=0,
        ge=0
    )

    conventions_matched: bool = False


class GnomonInput(BaseModel):

    height_m: float = Field(
        gt=0,
        le=100
    )

    solar_altitude_deg: float = Field(
        gt=0,
        lt=90
    )


class ReconstructionInput(BaseModel):

    initial_longitude_deg: float = Field(
        ge=0,
        lt=360
    )

    mean_motion_deg_per_day: float

    reference_date: str

    target_date: str


class ReconstructionUncertaintyInput(
    ReconstructionInput
):

    initial_uncertainty_deg: float = Field(
        default=0,
        ge=0
    )

    mean_motion_uncertainty_deg_per_day: float = Field(
        default=0,
        ge=0
    )


class DMSInput(BaseModel):

    degrees: int = Field(ge=0)

    minutes: int = Field(ge=0, lt=60)

    seconds: float = Field(ge=0, lt=60)


@app.get("/")
def root():

    return {
        "project": "The Forgotten Observatory",
        "version": "0.4.0",
        "status": "research_prototype",
        "model": "constant_mean_angular_motion",
        "documentation": "/docs"
    }


@app.get("/api/health")
def health():

    return {
        "ok": True,
        "version": "0.4.0"
    }


@app.post("/api/compare")
def compare(data: ComparisonInput):

    try:

        return compare_positions(
            historical=data.historical_longitude,
            modern=data.modern_longitude,
            historical_uncertainty=data.historical_uncertainty,
            modern_uncertainty=data.modern_uncertainty,
            conventions_matched=data.conventions_matched
        )

    except (ValueError, TypeError) as error:

        raise HTTPException(
            status_code=422,
            detail=str(error)
        )


@app.post("/api/reconstruct")
def reconstruct(data: ReconstructionInput):

    try:

        return reconstruct_longitude(
            initial_longitude_deg=data.initial_longitude_deg,
            mean_motion_deg_per_day=data.mean_motion_deg_per_day,
            reference_date=data.reference_date,
            target_date=data.target_date
        )

    except (ValueError, TypeError) as error:

        raise HTTPException(
            status_code=422,
            detail=str(error)
        )


@app.post("/api/reconstruct/uncertainty")
def reconstruct_uncertainty(
    data: ReconstructionUncertaintyInput
):

    try:

        return reconstruct_with_uncertainty(
            initial_longitude_deg=data.initial_longitude_deg,
            mean_motion_deg_per_day=data.mean_motion_deg_per_day,
            reference_date=data.reference_date,
            target_date=data.target_date,
            initial_uncertainty_deg=data.initial_uncertainty_deg,
            mean_motion_uncertainty_deg_per_day=(
                data.mean_motion_uncertainty_deg_per_day
            )
        )

    except (ValueError, TypeError) as error:

        raise HTTPException(
            status_code=422,
            detail=str(error)
        )


@app.post("/api/gnomon")
def gnomon(data: GnomonInput):

    try:

        shadow = gnomon_shadow_length(
            height_m=data.height_m,
            solar_altitude_deg=data.solar_altitude_deg
        )

        return {
            "height_m": data.height_m,
            "solar_altitude_deg": data.solar_altitude_deg,
            "shadow_length_m": shadow,
            "formula": "L = H / tan(theta)"
        }

    except (ValueError, TypeError) as error:

        raise HTTPException(
            status_code=422,
            detail=str(error)
        )


@app.post("/api/angle/dms-to-degrees")
def convert_dms(data: DMSInput):

    try:

        value = dms_to_degrees(
            data.degrees,
            data.minutes,
            data.seconds
        )

        return {
            "decimal_degrees": value
        }

    except (ValueError, TypeError) as error:

        raise HTTPException(
            status_code=422,
            detail=str(error)
        )


@app.get("/api/angle/degrees-to-dms")
def convert_degrees(angle: float):

    try:

        return {
            "decimal_degrees": angle,
            "dms": degrees_to_dms(angle)
        }

    except (ValueError, TypeError) as error:

        raise HTTPException(
            status_code=422,
            detail=str(error)
        )


@app.get("/api/datasets/epoch-1869")
def epoch_1869():

    if not DATASET_PATH.exists():

        raise HTTPException(
            status_code=500,
            detail="Dataset file is missing."
        )

    try:

        with DATASET_PATH.open(
            "r",
            encoding="utf-8"
        ) as file:

            return json.load(file)

    except json.JSONDecodeError:

        raise HTTPException(
            status_code=500,
            detail="Dataset contains invalid JSON."
        )