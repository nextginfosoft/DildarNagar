from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os
from pathlib import Path

from app.database import Base, engine
from app.routers.auth import router as auth_router
from app.routers.listings import router as listings_router
from app.routers.user import router as user_router
from app.routers.upload import router as upload_router
from app.routers.news import router as news_router
from app.routers.events import router as events_router
from app.routers.jobs import router as jobs_router

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

app = FastAPI(
    title="Dildarnagar.in API",
    description="Backend API for Dildarnagar local directory",
    version="1.0.0"
)

# CORS — allow your frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5500",
        "https://dildarnagar.in",
        "https://www.dildarnagar.in",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Import routers (we'll add these step by step)
app.include_router(auth_router, prefix="/api")
app.include_router(listings_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(news_router, prefix="/api")
app.include_router(events_router, prefix="/api")
app.include_router(jobs_router, prefix="/api")


@app.on_event("startup")
async def on_startup() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "Dildarnagar.in API is running ✅", "version": "1.0"}

@app.get("/health")
async def health():
    return {"status": "ok"}
