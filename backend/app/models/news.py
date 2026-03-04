from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    summary = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    source = Column(String(120), nullable=True)
    location = Column(String(255), nullable=True, index=True)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="news_items")

    __table_args__ = (
        Index("idx_news_user_active", "user_id", "is_active"),
        Index("idx_news_category_active", "category", "is_active"),
    )
