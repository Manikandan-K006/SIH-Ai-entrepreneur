from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False, index=True)
    entrepreneur_profile_id: Mapped[int | None] = mapped_column(ForeignKey("entrepreneur_profiles.id"), nullable=True)

    business_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    business_category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    business_sub_category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    stage: Mapped[str] = mapped_column(String(50), default="idea", nullable=False)

    # AI Analysis
    feasibility_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    opportunity_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    strengths: Mapped[list | None] = mapped_column(JSON, nullable=True)
    weaknesses: Mapped[list | None] = mapped_column(JSON, nullable=True)
    risks: Mapped[list | None] = mapped_column(JSON, nullable=True)
    opportunities: Mapped[list | None] = mapped_column(JSON, nullable=True)
    target_customers: Mapped[list | None] = mapped_column(JSON, nullable=True)
    required_resources: Mapped[list | None] = mapped_column(JSON, nullable=True)
    suggested_next_steps: Mapped[list | None] = mapped_column(JSON, nullable=True)
    analysis_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_analyzed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    is_demo: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="business_profile", foreign_keys=[user_id])
    plans = relationship("BusinessPlan", back_populates="business_profile")


class BusinessPlan(Base):
    __tablename__ = "business_plans"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    business_profile_id: Mapped[int | None] = mapped_column(ForeignKey("business_profiles.id"), nullable=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Plan sections as JSON
    executive_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    business_objective: Mapped[str | None] = mapped_column(Text, nullable=True)
    products_services: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_market: Mapped[str | None] = mapped_column(Text, nullable=True)
    customer_segments: Mapped[str | None] = mapped_column(Text, nullable=True)
    resource_requirements: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    operations_plan: Mapped[str | None] = mapped_column(Text, nullable=True)
    marketing_plan: Mapped[str | None] = mapped_column(Text, nullable=True)
    financial_requirements: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    risk_assessment: Mapped[list | None] = mapped_column(JSON, nullable=True)
    action_plan_30: Mapped[list | None] = mapped_column(JSON, nullable=True)
    action_plan_60: Mapped[list | None] = mapped_column(JSON, nullable=True)
    action_plan_90: Mapped[list | None] = mapped_column(JSON, nullable=True)

    pdf_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    business_profile = relationship("BusinessProfile", back_populates="plans")
