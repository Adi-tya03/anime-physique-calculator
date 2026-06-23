from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Literal
from math import sqrt

from database import get_db
from models import Character

router = APIRouter(
    prefix="/calculator",
    tags=["calculator"]
)


# ------------------------
# CURATED CHARACTER LIST
# ------------------------

ALLOWED_CHARACTERS = [
    "Goku",
    "Toji Fushiguro",
    "Baki Hanma",
    "Broly",
    "Garou",
    "Yujiro Hanma",
    "Roronoa Zoro",
    "Yuji Itadori",
    "Tengen Uzui",
    "Levi Ackerman",
    "Rock Lee",
    "Might Guy",
    "Vegeta",
    "All Might",
    "Eren Yeager",
    "Gojo Satoru",
    "Maki Zenin",
    "Mikasa Ackerman",
    "Mirko",
    "Android 18",
]


# ------------------------
# SCHEMAS
# ------------------------

class CalculatorInput(BaseModel):
    height_cm: float
    weight_kg: float
    body_fat_percent: float
    gender: Literal["male", "female"]


class BodyFatEstimateInput(BaseModel):
    height_cm: float
    weight_kg: float
    age: int
    gender: Literal["male", "female"]


class BodyFatEstimateOutput(BaseModel):
    estimated_body_fat_percent: float
    bmi: float
    disclaimer: str


class MatchResult(BaseModel):
    character_id: int
    character_name: str
    anime: str
    difficulty: str
    match_percent: float
    image_url: Optional[str]


class CalculatorResponse(BaseModel):
    bmi: float
    ffmi: float
    best_match: MatchResult
    top_matches: list[MatchResult]


# ------------------------
# HELPERS
# ------------------------

def compute_match(user_height, user_weight, user_bf, char):
    height_diff = abs(user_height - char.height_cm)
    weight_diff = abs(user_weight - char.weight_kg)
    bf_diff = abs(user_bf - char.body_fat_percent)

    height_score = max(0, 100 - height_diff * 2.0)
    weight_score = max(0, 100 - weight_diff * 1.2)
    bf_score = max(0, 100 - bf_diff * 2.5)

    base_score = (
        height_score * 0.45
        + weight_score * 0.25
        + bf_score * 0.30
    )

    difficulty_multiplier = {
        "intermediate": 1.00,
        "advanced": 0.97,
        "elite": 0.93,
        "legendary": 0.88,
        "impossible": 0.80,
    }

    multiplier = difficulty_multiplier.get(str(char.difficulty).lower(), 0.90)
    final_score = base_score * multiplier

    if height_diff > 25:
        final_score *= 0.55
    elif height_diff > 18:
        final_score *= 0.72
    elif height_diff > 12:
        final_score *= 0.87

    return round(max(3.0, min(final_score, 96.0)), 2)
def compute_bmi(weight_kg, height_cm):
    return round(
        weight_kg / ((height_cm / 100) ** 2),
        2
    )


def compute_ffmi(weight_kg, height_cm, body_fat_percent):
    lean_mass = weight_kg * (1 - body_fat_percent / 100)

    return round(
        lean_mass / ((height_cm / 100) ** 2),
        2
    )


# ------------------------
# ESTIMATE BODY FAT
# ------------------------

@router.post(
    "/estimate-bodyfat",
    response_model=BodyFatEstimateOutput
)
def estimate_body_fat(payload: BodyFatEstimateInput):
    bmi = compute_bmi(
        payload.weight_kg,
        payload.height_cm
    )

    if payload.gender == "male":
        bf = 1.20 * bmi + 0.23 * payload.age - 16.2
    else:
        bf = 1.20 * bmi + 0.23 * payload.age - 5.4

    bf = round(max(5.0, min(bf, 50.0)), 1)

    return BodyFatEstimateOutput(
        estimated_body_fat_percent=bf,
        bmi=bmi,
        disclaimer=(
            "This is an estimate based on BMI and age using the "
            "Deurenberg formula. It may not be accurate for muscular individuals."
        ),
    )


# ------------------------
# MATCH CHARACTER
# ------------------------

@router.post(
    "/match",
    response_model=CalculatorResponse
)
def match_character(
    payload: CalculatorInput,
    db: Session = Depends(get_db),
):
    characters = (
        db.query(Character)
        .filter(
            Character.gender == payload.gender,
            Character.name.in_(ALLOWED_CHARACTERS),
        )
        .all()
    )

    if not characters:
        raise HTTPException(
            status_code=404,
            detail="No curated characters found for this gender"
        )

    scored = sorted(
        [
            (
                compute_match(
                    payload.height_cm,
                    payload.weight_kg,
                    payload.body_fat_percent,
                    character,
                ),
                character,
            )
            for character in characters
        ],
        key=lambda x: x[0],
        reverse=True,
    )

    top5 = scored[:5]
    best_score, best_char = top5[0]

    def to_result(score, char):
        return MatchResult(
            character_id=char.id,
            character_name=char.name,
            anime=char.anime,
            difficulty=char.difficulty,
            match_percent=score,
            image_url=char.image_url,
        )

    return CalculatorResponse(
        bmi=compute_bmi(
            payload.weight_kg,
            payload.height_cm
        ),
        ffmi=compute_ffmi(
            payload.weight_kg,
            payload.height_cm,
            payload.body_fat_percent
        ),
        best_match=to_result(
            best_score,
            best_char
        ),
        top_matches=[
            to_result(score, char)
            for score, char in top5
        ],
    )