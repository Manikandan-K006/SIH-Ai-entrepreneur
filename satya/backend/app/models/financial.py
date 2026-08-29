from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


class FinancialPlan(Base):
    __tablename__ = "financial_plans"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    business_profile_id: Mapped[int | None] = mapped_column(ForeignKey("business_profiles.id"), nullable=True)

    title: Mapped[str] = mapped_column(String(255), default="My Financial Plan", nullable=False)

    # Input
    available_capital: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    required_investment: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    equipment_cost: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    raw_material_cost: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    labour_cost_monthly: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    rent_monthly: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    transport_monthly: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    other_expenses_monthly: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    expected_revenue_monthly: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Calculated outputs
    total_project_cost: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    own_contribution: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    funding_requirement: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_monthly_expenses: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    gross_margin_percent: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    break_even_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    break_even_revenue: Mapped[float | None] = mapped_column(Float, nullable=True)

    # EMI simulation
    loan_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    loan_interest_rate: Mapped[float] = mapped_column(Float, default=7.0, nullable=False)
    loan_tenure_months: Mapped[int] = mapped_column(Integer, default=36, nullable=False)
    emi_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Projections (12-month JSON array)
    cash_flow_projection: Mapped[list | None] = mapped_column(JSON, nullable=True)
    revenue_projection: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # AI insights
    ai_insights: Mapped[str | None] = mapped_column(Text, nullable=True)
    financing_suggestions: Mapped[list | None] = mapped_column(JSON, nullable=True)

    is_demo: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
