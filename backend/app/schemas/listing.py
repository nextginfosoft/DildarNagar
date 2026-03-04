from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from decimal import Decimal


class CreateListingRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    category: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    location: Optional[str] = Field(None, max_length=255)
    price: Optional[Decimal] = Field(None, decimal_places=2, max_digits=10)
    image_url: Optional[str] = Field(None, max_length=500)


class UpdateListingRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    category: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    location: Optional[str] = Field(None, max_length=255)
    price: Optional[Decimal] = Field(None, decimal_places=2, max_digits=10)
    image_url: Optional[str] = Field(None, max_length=500)


class ListingResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    category: str
    phone: str
    email: Optional[str]
    location: Optional[str]
    price: Optional[Decimal]
    image_url: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
