from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    company_name = Column(String(150), nullable=False, index=True)
    location = Column(String(255), nullable=False, index=True)
    job_type = Column(String(50), nullable=False, index=True)
    qualification = Column(String(120), nullable=True)
    experience = Column(String(80), nullable=True)
    salary = Column(String(120), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="jobs")

    __table_args__ = (
        Index("idx_jobs_user_active", "user_id", "is_active"),
        Index("idx_jobs_type_active", "job_type", "is_active"),
    )
