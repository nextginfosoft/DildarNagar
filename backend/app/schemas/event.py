from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class CreateEventRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    category: str = Field(..., min_length=2, max_length=100)
    location: str = Field(..., min_length=2, max_length=255)
    event_date: datetime
    contact_phone: Optional[str] = Field(None, min_length=10, max_length=20)
    image_url: Optional[str] = Field(None, max_length=500)


class UpdateEventRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    category: Optional[str] = Field(None, min_length=2, max_length=100)
    location: Optional[str] = Field(None, min_length=2, max_length=255)
    event_date: Optional[datetime] = None
    contact_phone: Optional[str] = Field(None, min_length=10, max_length=20)
    image_url: Optional[str] = Field(None, max_length=500)


class EventResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    category: str
    location: str
    event_date: datetime
    contact_phone: Optional[str]
    image_url: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
