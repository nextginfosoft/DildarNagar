from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class CreateNewsRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    summary: str = Field(..., min_length=10, max_length=5000)
    category: str = Field(..., min_length=2, max_length=100)
    source: Optional[str] = Field(None, max_length=120)
    location: Optional[str] = Field(None, max_length=255)
    image_url: Optional[str] = Field(None, max_length=500)


class UpdateNewsRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    summary: Optional[str] = Field(None, min_length=10, max_length=5000)
    category: Optional[str] = Field(None, min_length=2, max_length=100)
    source: Optional[str] = Field(None, max_length=120)
    location: Optional[str] = Field(None, max_length=255)
    image_url: Optional[str] = Field(None, max_length=500)


class NewsResponse(BaseModel):
    id: int
    user_id: int
    title: str
    summary: str
    category: str
    source: Optional[str]
    location: Optional[str]
    image_url: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
