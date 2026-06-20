from sqlalchemy import Column, Integer, String, Float, Text, Enum, TIMESTAMP, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    gender = Column(Enum("male", "female"), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    logs = relationship("PhysiqueLog", back_populates="user")
    roadmaps = relationship("Roadmap", back_populates="user")
    reset_tokens = relationship("PasswordResetToken", back_populates="user")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(TIMESTAMP, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="reset_tokens")


class Character(Base):
    __tablename__ = "characters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    anime = Column(String(100), nullable=False)
    difficulty = Column(Enum("intermediate", "advanced", "elite", "legendary", "impossible"), nullable=False)
    gender = Column(Enum("male", "female"), nullable=False)
    height_cm = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=False)
    body_fat_percent = Column(Float, nullable=False)
    description = Column(Text)
    image_url = Column(String(255))

    logs = relationship("PhysiqueLog", back_populates="character")
    roadmaps = relationship("Roadmap", back_populates="character")


class PhysiqueLog(Base):
    __tablename__ = "physique_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    character_id = Column(Integer, ForeignKey("characters.id"), nullable=False)
    user_height_cm = Column(Float, nullable=False)
    user_weight_kg = Column(Float, nullable=False)
    user_body_fat = Column(Float, nullable=False)
    match_percent = Column(Float, nullable=False)
    logged_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="logs")
    character = relationship("Character", back_populates="logs")


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    character_id = Column(Integer, ForeignKey("characters.id"), nullable=False)
    training_days = Column(Integer, nullable=False)
    diet_type = Column(String(50))
    experience_level = Column(String(50))
    roadmap_text = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="roadmaps")
    character = relationship("Character", back_populates="roadmaps")
