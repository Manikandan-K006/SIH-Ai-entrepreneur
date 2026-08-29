from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base
try:
    from pgvector.sqlalchemy import Vector
    PGVECTOR_AVAILABLE = True
except ImportError:
    PGVECTOR_AVAILABLE = False


class GovernmentScheme(Base):
    __tablename__ = "government_schemes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    name_hindi: Mapped[str | None] = mapped_column(String(500), nullable=True)
    name_tamil: Mapped[str | None] = mapped_column(String(500), nullable=True)

    ministry: Mapped[str | None] = mapped_column(String(255), nullable=True)
    scheme_type: Mapped[str] = mapped_column(String(100), default="Central", nullable=False)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Categorization
    business_categories: Mapped[list | None] = mapped_column(JSON, nullable=True)
    target_beneficiaries: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # Content
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_hindi: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_tamil: Mapped[str | None] = mapped_column(Text, nullable=True)
    benefits: Mapped[str | None] = mapped_column(Text, nullable=True)
    eligibility: Mapped[str | None] = mapped_column(Text, nullable=True)
    required_documents: Mapped[list | None] = mapped_column(JSON, nullable=True)
    application_process: Mapped[str | None] = mapped_column(Text, nullable=True)
    max_subsidy_amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_loan_amount: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Source
    official_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_document: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class GovernmentDocument(Base):
    __tablename__ = "government_documents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    scheme_id: Mapped[int | None] = mapped_column(ForeignKey("government_schemes.id"), nullable=True)

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    source_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    doc_type: Mapped[str] = mapped_column(String(50), default="pdf", nullable=False)
    is_processed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class SchemeEmbedding(Base):
    __tablename__ = "scheme_embeddings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    scheme_id: Mapped[int] = mapped_column(ForeignKey("government_schemes.id"), nullable=False, index=True)
    document_id: Mapped[int | None] = mapped_column(ForeignKey("government_documents.id"), nullable=True)

    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    chunk_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    # embedding stored as JSON array for compatibility without pgvector
    embedding_json: Mapped[list | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
