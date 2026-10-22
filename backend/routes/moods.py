
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.mood import MoodCheckIn
from models.user import User
from routes.auth import get_current_user
from schemas.mood import MoodCreate, MoodResponse


router = APIRouter(prefix="/moods", tags=["Mood Check-ins"])

MOOD_SCORES = {
    "Great": 100,
    "Good": 80,
    "Okay": 60,
    "Low": 40,
    "Struggling": 20,
}


@router.post("/", response_model=MoodResponse)
def save_mood(
    data: MoodCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()

    entry = (
        db.query(MoodCheckIn)
        .filter(
            MoodCheckIn.user_id == current_user.id,
            MoodCheckIn.check_in_date == today,
        )
        .first()
    )

    if entry:
        entry.mood = data.mood
        entry.score = MOOD_SCORES[data.mood]
    else:
        entry = MoodCheckIn(
            user_id=current_user.id,
            mood=data.mood,
            score=MOOD_SCORES[data.mood],
            check_in_date=today,
        )
        db.add(entry)

    db.commit()
    db.refresh(entry)

    return entry


@router.get("/", response_model=list[MoodResponse])
def get_mood_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(MoodCheckIn)
        .filter(MoodCheckIn.user_id == current_user.id)
        .order_by(MoodCheckIn.check_in_date.desc())
        .limit(90)
        .all()
    )


@router.get("/today", response_model=MoodResponse | None)
def get_today_mood(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(MoodCheckIn)
        .filter(
            MoodCheckIn.user_id == current_user.id,
            MoodCheckIn.check_in_date == date.today(),
        )
        .first()
    )
