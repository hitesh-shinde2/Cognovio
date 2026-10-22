
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


MoodType = Literal["Great", "Good", "Okay", "Low", "Struggling"]


class MoodCreate(BaseModel):
    mood: MoodType


class MoodResponse(BaseModel):
    id: int
    mood: MoodType
    score: int
    check_in_date: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
