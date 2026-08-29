import enum
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Enum as SAEnum, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class EntrepreneurProfile(Base):
    __tablename__ = "entrepreneur_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False, index=True)

    # Demographics
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[Gender | None] = mapped_column(SAEnum(Gender), nullable=True)

    # Location
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    village_town: Mapped[str | None] = mapped_column(String(200), nullable=True)
    pincode: Mapped[str | None] = mapped_column(String(10), nullable=True)
    # GPS stored only with explicit user consent
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    location_consent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Skills & Experience
    skills: Mapped[list | None] = mapped_column(JSON, nullable=True)  # list of strings
    previous_experience: Mapped[str | None] = mapped_column(Text, nullable=True)
    education_level: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Business context
    business_category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    business_idea: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_existing_business: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    business_stage: Mapped[str] = mapped_column(String(50), default="idea", nullable=False)

    # Financial
    available_capital: Mapped[float | None] = mapped_column(Float, nullable=True)
    expected_investment: Mapped[float | None] = mapped_column(Float, nullable=True)
    available_resources: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Team
    family_members_involved: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    employees_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Goals
    business_goals: Mapped[str | None] = mapped_column(Text, nullable=True)
    monthly_income_target: Mapped[float | None] = mapped_column(Float, nullable=True)

    # AI Score
    opportunity_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="entrepreneur_profile", foreign_keys=[user_id])
