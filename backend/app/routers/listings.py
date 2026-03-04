from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError

from app.database import get_db
from app.models.listing import Listing
from app.models.user import User
from app.schemas.listing import CreateListingRequest, ListingResponse, UpdateListingRequest
from app.services.auth_service import decode_token

router = APIRouter(prefix="/listings", tags=["listings"])


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


@router.get("", response_model=list[ListingResponse])
async def list_listings(
    skip: int = 0,
    limit: int = 20,
    category: str = None,
    location: str = None,
    search: str = None,
    db: AsyncSession = Depends(get_db),
):
    """List all active listings with optional filtering and pagination."""
    stmt = select(Listing).where(Listing.is_active == True)

    if category:
        stmt = stmt.where(Listing.category == category)

    if location:
        stmt = stmt.where(Listing.location.ilike(f"%{location}%"))

    if search:
        search_term = f"%{search}%"
        stmt = stmt.where(
            (Listing.title.ilike(search_term)) | (Listing.description.ilike(search_term))
        )

    stmt = stmt.order_by(Listing.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(stmt)
    listings = result.scalars().all()
    
    return [ListingResponse.model_validate(listing) for listing in listings]


@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
async def create_listing(
    payload: CreateListingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new listing (requires authentication)."""
    listing = Listing(
        user_id=current_user.id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        phone=payload.phone,
        email=payload.email,
        location=payload.location,
        price=payload.price,
        image_url=payload.image_url,
    )
    db.add(listing)
    await db.flush()
    await db.refresh(listing)
    
    return ListingResponse.model_validate(listing)


@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a single listing by ID."""
    stmt = select(Listing).where(
        (Listing.id == listing_id) & (Listing.is_active == True)
    )
    result = await db.execute(stmt)
    listing = result.scalar_one_or_none()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    return ListingResponse.model_validate(listing)


@router.put("/{listing_id}", response_model=ListingResponse)
async def update_listing(
    listing_id: int,
    payload: UpdateListingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a listing (owner only)."""
    stmt = select(Listing).where(Listing.id == listing_id)
    result = await db.execute(stmt)
    listing = result.scalar_one_or_none()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if listing.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own listings",
        )

    # Update only provided fields
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(listing, key, value)

    await db.flush()
    await db.refresh(listing)
    
    return ListingResponse.model_validate(listing)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a listing (soft delete - owner only)."""
    stmt = select(Listing).where(Listing.id == listing_id)
    result = await db.execute(stmt)
    listing = result.scalar_one_or_none()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if listing.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own listings",
        )

    listing.is_active = False
    await db.flush()
    
    return None
