from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Only load .env for local development, never on Railway/production
# Railway sets all variables via the UI, so .env should not override them
if not os.getenv("PORT"):  # Railway sets PORT env var
    try:
        from dotenv import load_dotenv
        load_dotenv(BASE_DIR / ".env")
    except ImportError:
        pass

DATABASE_URL = os.getenv("DATABASE_URL")

# Initialize engine as None, will be set only if DATABASE_URL is valid
engine = None
AsyncSessionLocal = None

if DATABASE_URL:
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    try:
        engine = create_async_engine(DATABASE_URL, echo=True)
        AsyncSessionLocal = sessionmaker(
            engine, class_=AsyncSession, expire_on_commit=False
        )
        print(f"✅ Database engine created successfully")
    except Exception as e:
        print(f"⚠️ Failed to create database engine: {str(e)}")
        engine = None
        AsyncSessionLocal = None
else:
    print("⚠️ DATABASE_URL not set - database features disabled")

Base = declarative_base()

# Dependency — use this in all route handlers
async def get_db():
    if not AsyncSessionLocal:
        raise RuntimeError("Database not initialized - DATABASE_URL not set or invalid")
    
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
