import os
import html
from io import BytesIO
from groq import Groq

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Literal

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

from database import get_db
from models import Character, Roadmap, User
from routes.auth import get_current_user


router = APIRouter(prefix="/roadmap", tags=["roadmap"])

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# ---------- SCHEMAS ----------

class TargetPreviewRequest(BaseModel):
    character_id: int
    user_height_cm: float
    user_weight_kg: float
    user_body_fat_percent: float


class TargetPreviewResponse(BaseModel):
    character_id: int
    character_name: str
    anime: str
    difficulty: str
    closeness_percent: float
    message: str


class RoadmapRequest(BaseModel):
    character_id: int
    user_height_cm: float
    user_weight_kg: float
    user_body_fat_percent: float
    user_age: int
    experience_level: Literal["beginner", "intermediate", "advanced"]
    training_days: int
    target_timeline_months: int


class RoadmapResponse(BaseModel):
    roadmap_id: int
    character_name: str
    anime: str
    roadmap_text: str


# ---------- HELPERS ----------

def compute_closeness(user_height, user_weight, user_bf, char):
    height_diff = abs(user_height - char.height_cm)
    weight_diff = abs(user_weight - char.weight_kg)
    bf_diff = abs(user_bf - char.body_fat_percent)

    height_score = max(0, 100 - height_diff * 1.5)
    weight_score = max(0, 100 - weight_diff * 1.5)
    bf_score = max(0, 100 - bf_diff * 3.0)

    base_score = (
        height_score * 0.30
        + weight_score * 0.30
        + bf_score * 0.40
    )

    difficulty_multiplier = {
        "intermediate": 1.00,
        "advanced": 0.90,
        "elite": 0.78,
        "legendary": 0.62,
        "impossible": 0.45,
    }

    multiplier = difficulty_multiplier.get(str(char.difficulty).lower(), 0.80)

    final_score = base_score * multiplier

    if height_diff > 25:
        final_score *= 0.45
    elif height_diff > 18:
        final_score *= 0.65
    elif height_diff > 12:
        final_score *= 0.82

    return round(max(3, min(final_score, 96)), 2)


def get_closeness_message(percent):
    if percent >= 80:
        return "You are genuinely close to this target physique. Focus on refining conditioning, proportions, and weak points."

    if percent >= 65:
        return "You have a solid base, but this physique still requires focused training, better conditioning, and consistent nutrition."

    if percent >= 45:
        return "You are in the middle range. You need visible improvements in muscle mass, body fat, or proportions to move closer."

    if percent >= 25:
        return "You are still far from this physique. Build your foundation first with consistent training, protein intake, and progressive overload."

    return "This is a major long-term transformation goal. Focus first on improving body composition, strength, and consistency."


def decide_diet_goal(user_weight, user_bf, char_weight, char_bf):
    if user_bf > char_bf + 4:
        return "cut"

    if user_weight < char_weight - 5 and user_bf <= char_bf + 3:
        return "lean bulk"

    return "recomposition / maintain"


def build_prompt(char: Character, req: RoadmapRequest, diet_goal: str) -> str:
    return f"""
You are an expert fitness coach. Create a personalized gym and diet roadmap for someone who wants to achieve a physique inspired by {char.name} from {char.anime}.

Important:
Do not claim the user can become identical to an anime character.
Frame the goal as building a realistic human physique inspired by that character.

Target Physique:
- Character: {char.name}
- Anime: {char.anime}
- Height: {char.height_cm} cm
- Weight: {char.weight_kg} kg
- Body Fat: {char.body_fat_percent}%
- Difficulty: {char.difficulty}

User's Current Stats:
- Height: {req.user_height_cm} cm
- Weight: {req.user_weight_kg} kg
- Body Fat: {req.user_body_fat_percent}%
- Age: {req.user_age}
- Experience Level: {req.experience_level}
- Training Days Per Week: {req.training_days}
- Target Timeline: {req.target_timeline_months} months

Professional Recommendation:
- Diet strategy: {diet_goal}

Create a clear roadmap with these sections:

1. REALITY CHECK
Explain whether the selected {req.target_timeline_months}-month timeline is realistic, aggressive, or too short.

2. RECOMMENDED GOAL
Explain why the user should follow {diet_goal}.

3. PHASE BREAKDOWN
Break the timeline into phases.

4. WEEKLY TRAINING SPLIT
Create a {req.training_days}-day gym split. Include exercises, sets, reps, and focus muscles.

5. DIET STRATEGY
Give approximate calories, protein, carbs, and fats. Keep it practical and Indian-diet friendly.

6. WEAK POINT PRIORITIES
Explain which muscles or body composition areas need the most focus.

7. PROGRESS MILESTONES
Tell what progress should be checked weekly and monthly.

8. MOTIVATIONAL NOTE
Give a short motivational note referencing {char.name}.

Be specific, realistic, safe, and encouraging.
"""


def build_fallback_roadmap(char: Character, req: RoadmapRequest, diet_goal: str) -> str:
    return f"""
AI quota is currently unavailable, so here is a fallback roadmap.

TARGET CHARACTER:
{char.name} from {char.anime}

TARGET TIMELINE:
{req.target_timeline_months} months

RECOMMENDED GOAL:
{diet_goal}

REALITY CHECK:
This goal should be treated as building a realistic human physique inspired by {char.name}, not becoming identical to an anime character.

PHASE 1: FOUNDATION ARC
Focus on consistency, form, sleep, hydration, and daily protein intake.

Training:
- Follow a {req.training_days}-day workout split.
- Prioritize compound lifts like bench press, rows, squats, shoulder press, pull-ups, and leg press.
- Keep 2-3 reps in reserve on most sets.
- Track every workout.

Diet:
- Recommended strategy: {diet_goal}
- Eat high protein daily.
- Track calories for at least 2 weeks.
- Keep meals simple and repeatable.

PHASE 2: PROGRESSION ARC
Increase training intensity gradually and attack weak points.

PHASE 3: CHARACTER PHYSIQUE ARC
Train specifically toward the visual traits of {char.name}'s physique.

Milestones:
- Measure weight weekly.
- Track body fat monthly.
- Take progress photos every 2 weeks.
- Track strength progression on major lifts.

Motivation:
Build your own version of {char.name}'s physique. Stay consistent, train hard, recover properly, and make the transformation sustainable.
"""


# ---------- ROUTES ----------

@router.post("/target-preview", response_model=TargetPreviewResponse)
def target_preview(
    req: TargetPreviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    char = db.query(Character).filter(Character.id == req.character_id).first()

    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    closeness = compute_closeness(
        req.user_height_cm,
        req.user_weight_kg,
        req.user_body_fat_percent,
        char,
    )

    return TargetPreviewResponse(
        character_id=char.id,
        character_name=char.name,
        anime=char.anime,
        difficulty=char.difficulty,
        closeness_percent=closeness,
        message=get_closeness_message(closeness),
    )


@router.post("/generate", response_model=RoadmapResponse)
def generate_roadmap(
    req: RoadmapRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    char = db.query(Character).filter(Character.id == req.character_id).first()

    if not char:
        raise HTTPException(status_code=404, detail="Character not found")

    diet_goal = decide_diet_goal(
        req.user_weight_kg,
        req.user_body_fat_percent,
        char.weight_kg,
        char.body_fat_percent,
    )

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "user",
                    "content": build_prompt(char, req, diet_goal),
                }
            ],
        )

        roadmap_text = response.choices[0].message.content.strip()

    except Exception:
        roadmap_text = build_fallback_roadmap(char, req, diet_goal)

    roadmap = Roadmap(
        user_id=current_user.id,
        character_id=char.id,
        training_days=req.training_days,
        diet_type=diet_goal,
        experience_level=req.experience_level,
        roadmap_text=roadmap_text,
    )

    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)

    return RoadmapResponse(
        roadmap_id=roadmap.id,
        character_name=char.name,
        anime=char.anime,
        roadmap_text=roadmap_text,
    )


@router.get("/download-pdf/{roadmap_id}")
def download_roadmap_pdf(
    roadmap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    roadmap = (
        db.query(Roadmap)
        .filter(
            Roadmap.id == roadmap_id,
            Roadmap.user_id == current_user.id,
        )
        .first()
    )

    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=45,
        leftMargin=45,
        topMargin=45,
        bottomMargin=45,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=22,
        leading=28,
        spaceAfter=14,
    )

    subtitle_style = ParagraphStyle(
        "CustomSubtitle",
        parent=styles["Heading2"],
        fontSize=13,
        leading=18,
        spaceAfter=16,
    )

    body_style = ParagraphStyle(
        "CustomBody",
        parent=styles["BodyText"],
        fontSize=10,
        leading=15,
        spaceAfter=8,
    )

    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontSize=13,
        leading=17,
        spaceBefore=10,
        spaceAfter=8,
    )

    story = []

    character_name = roadmap.character.name if roadmap.character else "Character"
    anime_name = roadmap.character.anime if roadmap.character else "Anime"

    story.append(Paragraph(html.escape(f"{character_name} Physique Roadmap"), title_style))
    story.append(Paragraph(html.escape(f"Anime: {anime_name}"), subtitle_style))
    story.append(Paragraph(html.escape(f"Training Days: {roadmap.training_days} days/week"), body_style))
    story.append(Paragraph(html.escape(f"Recommended Goal: {roadmap.diet_type}"), body_style))
    story.append(Paragraph(html.escape(f"Experience Level: {roadmap.experience_level}"), body_style))
    story.append(Spacer(1, 0.2 * inch))

    for raw_line in roadmap.roadmap_text.split("\n"):
        line = raw_line.strip()

        if not line:
            story.append(Spacer(1, 6))
            continue

        safe_line = html.escape(line)

        if line.isupper() or line[:2].isdigit():
            story.append(Paragraph(safe_line, heading_style))
        else:
            story.append(Paragraph(safe_line, body_style))

    doc.build(story)
    buffer.seek(0)

    filename = f"{character_name.replace(' ', '_')}_roadmap.pdf"

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        },
    )


@router.get("/history")
def roadmap_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = (
        db.query(Roadmap)
        .filter(Roadmap.user_id == current_user.id)
        .order_by(Roadmap.created_at.desc())
        .limit(5)
        .all()
    )

    return [
        {
            "id": r.id,
            "character_name": r.character.name,
            "anime": r.character.anime,
            "training_days": r.training_days,
            "diet_type": r.diet_type,
            "created_at": r.created_at,
        }
        for r in records
    ]