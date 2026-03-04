from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError

from app.database import get_db
from app.models.user import User
from app.models.listing import Listing
from app.schemas.auth import UserResponse
from app.services.auth_service import decode_token

router = APIRouter(prefix="/user", tags=["user"])


async def get_current_user(
    authorization: str = Header(None), db: AsyncSession = Depends(get_db)
) -> User:
    """Dependency to verify JWT token and return current user."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )

    token = authorization.split(" ")[1]
    
    try:
        user_id = decode_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    user_stmt = select(User).where(User.id == int(user_id))
    user_result = await db.execute(user_stmt)
    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


@router.get("/me", response_model=UserResponse)
async def get_user_profile(
    current_user: User = Depends(get_current_user),
):
    """Get current user's profile."""
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user profile. Placeholder for future profile customization."""
    # For now, just return the current user
    # Future: add business_name, business_description, business_image_url columns
    return UserResponse.model_validate(current_user)


class ListingWithStats(UserResponse):
    """Listing with basic stats for dashboard."""
    pass


@router.get("/listings", response_model=list)
async def get_user_listings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all listings for the current user with stats."""
    stmt = select(Listing).where(
        Listing.user_id == current_user.id
    ).order_by(Listing.created_at.desc())
    
    result = await db.execute(stmt)
    listings = result.scalars().all()
    
    # Build response with each listing
    response = []
    for listing in listings:
        listing_dict = {
            "id": listing.id,
            "title": listing.title,
            "description": listing.description,
            "category": listing.category,
            "phone": listing.phone,
            "email": listing.email,
            "location": listing.location,
            "price": listing.price,
            "image_url": listing.image_url,
            "is_active": listing.is_active,
            "created_at": listing.created_at,
            "updated_at": listing.updated_at,
        }
        response.append(listing_dict)
    
    return response


@router.get("/dashboard")
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get complete dashboard data (profile + listings + stats)."""
    # Get user listings
    stmt = select(Listing).where(Listing.user_id == current_user.id)
    result = await db.execute(stmt)
    listings = result.scalars().all()

    # Count stats
    total_listings = len(listings)
    active_listings = sum(1 for l in listings if l.is_active)
    
    user_data = {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "created_at": current_user.created_at,
    }

    listings_data = [
        {
            "id": listing.id,
            "title": listing.title,
            "category": listing.category,
            "location": listing.location,
            "price": listing.price,
            "image_url": listing.image_url,
            "is_active": listing.is_active,
            "created_at": listing.created_at,
        }
        for listing in listings
    ]

    return {
        "user": user_data,
        "listings": listings_data,
        "stats": {
            "total_listings": total_listings,
            "active_listings": active_listings,
            "inactive_listings": total_listings - active_listings,
        },
    }
