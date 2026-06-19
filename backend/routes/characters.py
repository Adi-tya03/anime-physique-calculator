from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Literal
from database import get_db
from models import Character

router = APIRouter(prefix="/characters", tags=["characters"])


# --- Schemas ---
class CharacterOut(BaseModel):
    id: int
    name: str
    anime: str
    difficulty: str
    gender: str
    height_cm: float
    weight_kg: float
    body_fat_percent: float
    description: Optional[str]
    image_url: Optional[str]

    class Config:
        from_attributes = True


# --- Routes ---
@router.get("/", response_model=list[CharacterOut])
def list_characters(
    gender: Optional[Literal["male", "female"]] = Query(None),
    difficulty: Optional[str] = Query(None),
    anime: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Character)
    if gender:
        query = query.filter(Character.gender == gender)
    if difficulty:
        query = query.filter(Character.difficulty == difficulty)
    if anime:
        query = query.filter(Character.anime.ilike(f"%{anime}%"))
    return query.all()


@router.get("/{character_id}", response_model=CharacterOut)
def get_character(character_id: int, db: Session = Depends(get_db)):
    character = db.query(Character).filter(Character.id == character_id).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    return character