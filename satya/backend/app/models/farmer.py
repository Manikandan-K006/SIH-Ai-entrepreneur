# pyrefly: ignore [missing-import]
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False, index=True)

    # Location & Consent
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    village_town: Mapped[str | None] = mapped_column(String(200), nullable=True)
    pincode: Mapped[str | None] = mapped_column(String(10), nullable=True)
    consent_given: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Agricultural / Allied Activity Details
    agri_activity_type: Mapped[str | None] = mapped_column(String(100), nullable=True) # Dairy, Poultry, Fisheries, Beekeeping, Horticulture, Food Processing, Crop Production, Agri-Trading
    land_size_acres: Mapped[float | None] = mapped_column(Float, default=0.0, nullable=True)
    irrigation_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    existing_business_activity: Mapped[str | None] = mapped_column(Text, nullable=True)
    products: Mapped[list | None] = mapped_column(JSON, default=list, nullable=True)
    production_scale: Mapped[str | None] = mapped_column(String(100), nullable=True)
    existing_equipment: Mapped[list | None] = mapped_column(JSON, default=list, nullable=True)
    skills: Mapped[list | None] = mapped_column(JSON, default=list, nullable=True)

    # Financial & Target Enterprise
    available_capital: Mapped[float | None] = mapped_column(Float, default=0.0, nullable=True)
    required_investment: Mapped[float | None] = mapped_column(Float, default=0.0, nullable=True)
    current_income_monthly: Mapped[float | None] = mapped_column(Float, default=0.0, nullable=True)
    monthly_expenses: Mapped[float | None] = mapped_column(Float, default=0.0, nullable=True)
    target_business: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_customers: Mapped[str | None] = mapped_column(Text, nullable=True)

    # AI Readiness Assessment
    readiness_score: Mapped[int | None] = mapped_column(Integer, default=70, nullable=True)

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

    ai_analysis_summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", foreign_keys=[user_id])
