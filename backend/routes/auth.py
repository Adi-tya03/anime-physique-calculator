import os
import secrets
import resend
from dotenv import load_dotenv
load_dotenv()

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from typing import Literal
from database import get_db
from models import User, PasswordResetToken

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY not set in .env file")

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://anime-physique-calculator.vercel.app")

resend.api_key = RESEND_API_KEY

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# --- Schemas ---
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    gender: Literal["male", "female"]

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    gender: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# --- Helpers ---
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user


# --- Routes ---
@router.post("/register", response_model=UserOut, status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
        gender=payload.gender,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    # Always return success even if email not found (security best practice)
    if not user:
        return {"message": "If this email exists, a reset link has been sent."}

    # Delete any existing unused tokens for this user
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used == False
    ).delete()
    db.commit()

    # Generate secure token
    raw_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)

    reset_token = PasswordResetToken(
        user_id=user.id,
        token=raw_token,
        expires_at=expires_at,
    )
    db.add(reset_token)
    db.commit()

    # Send email via Resend
    reset_link = f"{FRONTEND_URL}/reset-password?token={raw_token}"

    resend.Emails.send({
        "from": "Anime Physique <onboarding@resend.dev>",
        "to": [user.email],
        "subject": "Reset Your Password - Anime Physique Calculator",
        "html": f"""
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; background: #050816; color: white; padding: 40px; border-radius: 16px;">
            <h1 style="color: #22d3ee; margin-bottom: 8px;">Anime Physique Calculator</h1>
            <p style="color: #94a3b8;">Hi {user.username},</p>
            <p style="color: #94a3b8;">We received a request to reset your password. Click the button below to set a new one.</p>
            <a href="{reset_link}"
               style="display: inline-block; margin: 24px 0; padding: 14px 28px; background: #7c3aed; color: white; text-decoration: none; border-radius: 12px; font-weight: bold;">
                Reset Password
            </a>
            <p style="color: #64748b; font-size: 14px;">This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email.</p>
            <p style="color: #64748b; font-size: 12px;">Or copy this link: {reset_link}</p>
        </div>
        """
    })

    return {"message": "If this email exists, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == payload.token,
        PasswordResetToken.used == False,
    ).first()

    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid or already used reset link.")

    if datetime.utcnow() > reset_token.expires_at:
        raise HTTPException(status_code=400, detail="Reset link has expired. Please request a new one.")

    # Update password
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    user.password_hash = hash_password(payload.new_password)

    # Mark token as used
    reset_token.used = True

    db.commit()

    return {"message": "Password reset successfully. You can now log in."}
