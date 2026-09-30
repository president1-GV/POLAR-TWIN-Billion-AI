import os
from pydantic import BaseModel
from typing import List

class Settings(BaseModel):
    PROJECT_NAME: str = "POLAR-TWIN"
    VERSION: str = "2.1.0"
    API_PREFIX: str = "/api"
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://fpoxnocbznagepusczkk.supabase.co")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_ACCESS_TOKEN: str = os.getenv("SUPABASE_ACCESS_TOKEN", "")
    SUPABASE_PROJECT_REF: str = os.getenv("SUPABASE_PROJECT_REF", "fpoxnocbznagepusczkk")
    
    # PostgreSQL / SQLAlchemy Connection
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"postgresql://postgres:{os.getenv('SUPABASE_DB_PASSWORD', 'postgres')}@db.fpoxnocbznagepusczkk.supabase.co:5432/postgres"
    )
    
    # Security & CORS
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "polar-twin-antarctic-secret-key-32bytes-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://president1-gv.github.io"
    ]

settings = Settings()
