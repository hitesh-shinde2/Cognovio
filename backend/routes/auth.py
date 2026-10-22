
from datetime import timedelta, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError

from database import get_db
from models.user import User
from schemas.auth import RegisterRequest, LoginRequest
from config import settings


router = APIRouter(prefix="/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

bearer_scheme = HTTPBearer()


# REGISTER
@router.post("/register", status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    email = str(data.email).lower()

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email is already registered"
        )

    if data.student_id:
        existing_student = (
            db.query(User)
            .filter(User.student_id == data.student_id)
            .first()
        )
        if existing_student:
            raise HTTPException(
                status_code=409,
                detail="Student ID is already registered"
            )

    new_user = User(
        name=data.name.strip(),
        email=email,
        password_hash=pwd_context.hash(data.password),
        student_id=data.student_id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Registration successful",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "student_id": new_user.student_id
        }
    }


# LOGIN
@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    email = str(data.email).lower()

    user = db.query(User).filter(User.email == email).first()

    if not user or not pwd_context.verify(
        data.password, user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="This account is inactive"
        )

    expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    token = jwt.encode(
        {
            "sub": str(user.id),
            "exp": datetime.now(timezone.utc) + expires
        },
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }


# VERIFY JWT AND GET CURRENT USER
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    credentials_error = HTTPException(
        status_code=401,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"}
    )

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id:
            raise credentials_error

        user_id = int(user_id)

    except (JWTError, ValueError, TypeError):
        raise credentials_error

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise credentials_error

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="This account is inactive"
        )

    return user


# PROTECTED PROFILE ENDPOINT
@router.get("/me")
def read_current_user(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "student_id": current_user.student_id
    }
