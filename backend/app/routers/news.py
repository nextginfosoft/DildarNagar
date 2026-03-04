from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError

from app.database import get_db
from app.models.news import News
from app.models.user import User
from app.schemas.news import CreateNewsRequest, NewsResponse, UpdateNewsRequest
from app.services.auth_service import decode_token

router = APIRouter(prefix="/news", tags=["news"])


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


@router.get("", response_model=list[NewsResponse])
async def list_news(
    skip: int = 0,
    limit: int = 12,
    category: str = None,
    location: str = None,
    search: str = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(News).where(News.is_active == True)

    if category:
        stmt = stmt.where(News.category == category)

    if location:
        stmt = stmt.where(News.location.ilike(f"%{location}%"))

    if search:
        search_term = f"%{search}%"
        stmt = stmt.where((News.title.ilike(search_term)) | (News.summary.ilike(search_term)))

    stmt = stmt.order_by(News.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    items = result.scalars().all()
    return [NewsResponse.model_validate(item) for item in items]


@router.post("", response_model=NewsResponse, status_code=status.HTTP_201_CREATED)
async def create_news(
    payload: CreateNewsRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    item = News(user_id=current_user.id, **payload.model_dump())
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return NewsResponse.model_validate(item)


@router.get("/{news_id}", response_model=NewsResponse)
async def get_news(news_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(News).where((News.id == news_id) & (News.is_active == True))
    result = await db.execute(stmt)
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="News not found")
    return NewsResponse.model_validate(item)


@router.put("/{news_id}", response_model=NewsResponse)
async def update_news(
    news_id: int,
    payload: UpdateNewsRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(News).where(News.id == news_id)
    result = await db.execute(stmt)
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="News not found")
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own news")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)

    await db.flush()
    await db.refresh(item)
    return NewsResponse.model_validate(item)


@router.delete("/{news_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_news(
    news_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(News).where(News.id == news_id)
    result = await db.execute(stmt)
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="News not found")
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own news")

    item.is_active = False
    await db.flush()
    return None
