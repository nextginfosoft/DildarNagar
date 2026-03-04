from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime, DECIMAL, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)
    phone = Column(String(20), nullable=False)
    email = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True, index=True)
    price = Column(DECIMAL(10, 2), nullable=True)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to User
    user = relationship("User", back_populates="listings")

    __table_args__ = (
        Index("idx_listings_user_active", "user_id", "is_active"),
        Index("idx_listings_category_active", "category", "is_active"),
    )
