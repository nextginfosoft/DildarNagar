from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class CreateJobRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    company_name: str = Field(..., min_length=2, max_length=150)
    location: str = Field(..., min_length=2, max_length=255)
    job_type: str = Field(..., min_length=2, max_length=50)
    qualification: Optional[str] = Field(None, max_length=120)
    experience: Optional[str] = Field(None, max_length=80)
    salary: Optional[str] = Field(None, max_length=120)
    contact_phone: Optional[str] = Field(None, min_length=10, max_length=20)
    description: Optional[str] = Field(None, max_length=5000)
    image_url: Optional[str] = Field(None, max_length=500)


class UpdateJobRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    company_name: Optional[str] = Field(None, min_length=2, max_length=150)
    location: Optional[str] = Field(None, min_length=2, max_length=255)
    job_type: Optional[str] = Field(None, min_length=2, max_length=50)
    qualification: Optional[str] = Field(None, max_length=120)
    experience: Optional[str] = Field(None, max_length=80)
    salary: Optional[str] = Field(None, max_length=120)
    contact_phone: Optional[str] = Field(None, min_length=10, max_length=20)
    description: Optional[str] = Field(None, max_length=5000)
    image_url: Optional[str] = Field(None, max_length=500)


class JobResponse(BaseModel):
    id: int
    user_id: int
    title: str
    company_name: str
    location: str
    job_type: str
    qualification: Optional[str]
    experience: Optional[str]
    salary: Optional[str]
    contact_phone: Optional[str]
    description: Optional[str]
    image_url: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
