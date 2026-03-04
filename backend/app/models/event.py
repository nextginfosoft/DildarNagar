from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)
    location = Column(String(255), nullable=False, index=True)
    event_date = Column(DateTime, nullable=False, index=True)
    contact_phone = Column(String(20), nullable=True)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="events")

    __table_args__ = (
        Index("idx_events_user_active", "user_id", "is_active"),
        Index("idx_events_category_active", "category", "is_active"),
    )
