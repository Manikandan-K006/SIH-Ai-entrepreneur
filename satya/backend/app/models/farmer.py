# pyrefly: ignore [missing-import]
from datetime import datetime, timezone
from typing import Optional, List, Any
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False, index=True)

    # Location & Consent
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    village_town: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    pincode: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    consent_given: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Agricultural / Allied Activity Details
    agri_activity_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    land_size_acres: Mapped[Optional[float]] = mapped_column(Float, default=0.0, nullable=True)
    irrigation_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    existing_business_activity: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    products: Mapped[Optional[List[Any]]] = mapped_column(JSON, default=list, nullable=True)
    production_scale: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    existing_equipment: Mapped[Optional[List[Any]]] = mapped_column(JSON, default=list, nullable=True)
    skills: Mapped[Optional[List[Any]]] = mapped_column(JSON, default=list, nullable=True)

    # Financial & Target Enterprise
    available_capital: Mapped[Optional[float]] = mapped_column(Float, default=0.0, nullable=True)
    required_investment: Mapped[Optional[float]] = mapped_column(Float, default=0.0, nullable=True)
    current_income_monthly: Mapped[Optional[float]] = mapped_column(Float, default=0.0, nullable=True)
    monthly_expenses: Mapped[Optional[float]] = mapped_column(Float, default=0.0, nullable=True)
    target_business: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    target_customers: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # AI Readiness Assessment
    readiness_score: Mapped[Optional[int]] = mapped_column(Integer, default=70, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="farmer_profile", foreign_keys=[user_id])


class AgriFinancialRecord(Base):
    __tablename__ = "agri_financial_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)

    month_year: Mapped[str] = mapped_column(String(20), nullable=False) # e.g. "2026-08"
    sales_revenue: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    input_cost: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    transport_cost: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    labour_cost: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    equipment_cost: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    other_expense: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    
    total_expenses: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    net_profit_loss: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    ai_analysis_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", foreign_keys=[user_id])
