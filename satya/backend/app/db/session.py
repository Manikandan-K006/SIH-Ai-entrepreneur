from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

db_url = settings.DATABASE_URL

from pathlib import Path

if db_url.startswith("sqlite"):
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
else:
    try:
        engine = create_engine(db_url, pool_pre_ping=True, pool_size=10, max_overflow=20)
        with engine.connect() as conn:
            pass
    except Exception:
        # Fallback to SQLite for local development when PostgreSQL container is not running
        base_dir = Path(__file__).resolve().parent.parent.parent
        candidates = [
            base_dir / "satya_dev.db",
            base_dir.parent / "satya_dev.db",
            Path("./satya_dev.db").resolve(),
        ]
        sqlite_file = next((p for p in candidates if p.exists()), base_dir / "satya_dev.db")
        sqlite_url = f"sqlite:///{sqlite_file}"
        engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
