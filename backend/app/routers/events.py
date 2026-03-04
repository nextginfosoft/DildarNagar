from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError

from app.database import get_db
from app.models.event import Event
from app.models.user import User
from app.schemas.event import CreateEventRequest, EventResponse, UpdateEventRequest
from app.services.auth_service import decode_token

router = APIRouter(prefix="/events", tags=["events"])


async def get_current_user(
    authorization: str = Header(None), db: AsyncSession = Depends(get_db)
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )

    token = authorization.split(" ")[1]
    try:
        user_id = decode_token(token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_stmt = select(User).where(User.id == int(user_id))
    user_result = await db.execute(user_stmt)
    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


@router.get("", response_model=list[EventResponse])
async def list_events(
    skip: int = 0,
    limit: int = 12,
    category: str = None,
    location: str = None,
    search: str = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Event).where(Event.is_active == True)

    if category:
        stmt = stmt.where(Event.category == category)

    if location:
        stmt = stmt.where(Event.location.ilike(f"%{location}%"))

    if search:
        search_term = f"%{search}%"
        stmt = stmt.where((Event.title.ilike(search_term)) | (Event.description.ilike(search_term)))

    stmt = stmt.order_by(Event.event_date.asc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    items = result.scalars().all()
    return [EventResponse.model_validate(item) for item in items]


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    payload: CreateEventRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    if data.get("event_date") and data["event_date"].tzinfo is not None:
        data["event_date"] = data["event_date"].replace(tzinfo=None)

    item = Event(user_id=current_user.id, **data)
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return EventResponse.model_validate(item)


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Event).where((Event.id == event_id) & (Event.is_active == True))
    result = await db.execute(stmt)
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Event not found")
    return EventResponse.model_validate(item)


@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    payload: UpdateEventRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Event).where(Event.id == event_id)
    result = await db.execute(stmt)
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Event not found")
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own events")

    update_data = payload.model_dump(exclude_unset=True)
    if update_data.get("event_date") and update_data["event_date"].tzinfo is not None:
        update_data["event_date"] = update_data["event_date"].replace(tzinfo=None)

    for key, value in update_data.items():
        setattr(item, key, value)

    await db.flush()
    await db.refresh(item)
    return EventResponse.model_validate(item)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Event).where(Event.id == event_id)
    result = await db.execute(stmt)
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Event not found")
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own events")

    item.is_active = False
    await db.flush()
    return None
