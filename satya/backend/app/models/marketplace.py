from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    business_profile_id: Mapped[int] = mapped_column(ForeignKey("business_profiles.id"), nullable=False, index=True)

    order_type: Mapped[str] = mapped_column(String(50), default="pickup", nullable=False) # pickup, local_delivery
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False) # pending, accepted, rejected, completed, cancelled
    total_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    delivery_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    customer = relationship("User", foreign_keys=[customer_id])
    business_profile = relationship("BusinessProfile", foreign_keys=[business_profile_id])


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False, index=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"), nullable=True)

    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    item_total: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    order = relationship("Order", back_populates="items")


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    business_profile_id: Mapped[int] = mapped_column(ForeignKey("business_profiles.id"), nullable=False, index=True)

    rating: Mapped[int] = mapped_column(Integer, default=5, nullable=False) # 1-5
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_moderated: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_reported: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    report_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    customer = relationship("User", foreign_keys=[customer_id])
    business_profile = relationship("BusinessProfile", foreign_keys=[business_profile_id])
