from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


class PromotionCampaign(Base):
    __tablename__ = "promotion_campaigns"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    business_profile_id: Mapped[int] = mapped_column(ForeignKey("business_profiles.id"), nullable=False, index=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"), nullable=True)

    tier: Mapped[str] = mapped_column(String(50), default="sponsored_listing", nullable=False) # featured_business, sponsored_listing, local_promotion, festival_promotion
    headline: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    target_district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    target_category: Mapped[str | None] = mapped_column(String(100), nullable=True)

    budget: Mapped[float] = mapped_column(Float, default=500.0, nullable=False)
    duration_days: Mapped[int] = mapped_column(Integer, default=7, nullable=False)

    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False) # draft, active, completed, paused
    impressions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    clicks: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    payment_status: Mapped[str] = mapped_column(String(50), default="completed", nullable=False) # pending, completed, mock_success
    payment_provider: Mapped[str] = mapped_column(String(50), default="mock_upi", nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    business_profile = relationship("BusinessProfile", foreign_keys=[business_profile_id])
    product = relationship("Product", foreign_keys=[product_id])
