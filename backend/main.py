from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from models.user import User
from models.mood import MoodCheckIn
from routes.moods import router as moods_router
from database import get_db
from database import Base, engine

from routes.auth import router as auth_router

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Cognovio API",
    description="University Student Wellbeing Platform",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)

app.include_router(auth_router)
app.include_router(moods_router)

@app.get("/")
def root():

    return {
        "application": "Cognovio",
        "status": "online"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


@app.get("/health/database")
def database_health(
    db: Session = Depends(get_db)
):

    try:

        db.execute(text("SELECT 1"))

        return {
            "database": "MySQL",
            "status": "connected"
        }

    except Exception as e:

        return {
            "database": "MySQL",
            "status": "error",
            "message": str(e)
        }