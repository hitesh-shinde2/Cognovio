
from datetime import date, datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)

from database import Base


class MoodCheckIn(Base):
    __tablename__ = "mood_checkins"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "check_in_date",
            name="uq_mood_user_date",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    mood = Column(String(20), nullable=False)

    score = Column(Integer, nullable=False)

    check_in_date = Column(
        Date,
        nullable=False,
        default=date.today,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )
