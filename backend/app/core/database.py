import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.app.core.config import settings

Base = declarative_base()

# Attempt to configure engine. If PostgreSQL connection fails in local testing, fallback gracefully.
db_url = settings.DATABASE_URL
is_sqlite = False

try:
    if "postgresql" in db_url and not os.getenv("FORCE_SQLITE"):
        engine = create_engine(
            db_url,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 5}
        )
    else:
        is_sqlite = True
        engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
except Exception:
    is_sqlite = True
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """Dependency that provides an active SQLAlchemy database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes tables for local / test databases."""
    Base.metadata.create_all(bind=engine)
