from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base


class MarketData(Base):
    __tablename__ = "market_data"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Location
    state: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    village_town: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # Business category
    business_category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    # Market factors (0-100 scores)
    demand_score: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    competition_score: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    raw_material_score: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    transport_score: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    seasonality_score: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    opportunity_score: Mapped[int] = mapped_column(Integer, default=50, nullable=False)

    # Descriptive data
    demand_level: Mapped[str] = mapped_column(String(20), default="Medium", nullable=False)
    competition_level: Mapped[str] = mapped_column(String(20), default="Medium", nullable=False)
    nearby_markets: Mapped[list | None] = mapped_column(JSON, nullable=True)
    price_range_info: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    seasonal_patterns: Mapped[str | None] = mapped_column(Text, nullable=True)
    local_demand_indicators: Mapped[list | None] = mapped_column(JSON, nullable=True)
    key_competitors: Mapped[list | None] = mapped_column(JSON, nullable=True)
    opportunities: Mapped[list | None] = mapped_column(JSON, nullable=True)
    challenges: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # Meta
    data_source: Mapped[str] = mapped_column(String(100), default="Demo Data", nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
