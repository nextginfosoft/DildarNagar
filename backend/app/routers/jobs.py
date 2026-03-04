from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError

from app.database import get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.job import CreateJobRequest, JobResponse, UpdateJobRequest
from app.services.auth_service import decode_token

router = APIRouter(prefix="/jobs", tags=["jobs"])


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


@router.get("", response_model=list[JobResponse])
async def list_jobs(
    skip: int = 0,
    limit: int = 12,
    job_type: str = None,
    location: str = None,
    search: str = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Job).where(Job.is_active == True)

    if job_type:
        stmt = stmt.where(Job.job_type == job_type)

    if location:
        stmt = stmt.where(Job.location.ilike(f"%{location}%"))

    if search:
        search_term = f"%{search}%"
        stmt = stmt.where(
            (Job.title.ilike(search_term))
            | (Job.company_name.ilike(search_term))
            | (Job.description.ilike(search_term))
        )

    stmt = stmt.order_by(Job.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    items = result.scalars().all()
    return [JobResponse.model_validate(item) for item in items]


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    payload: CreateJobRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    item = Job(user_id=current_user.id, **payload.model_dump())
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return JobResponse.model_validate(item)


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Job).where((Job.id == job_id) & (Job.is_active == True))
    result = await db.execute(stmt)
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobResponse.model_validate(item)


@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: int,
    payload: UpdateJobRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Job).where(Job.id == job_id)
    result = await db.execute(stmt)
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Job not found")
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own jobs")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)

    await db.flush()
    await db.refresh(item)
    return JobResponse.model_validate(item)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Job).where(Job.id == job_id)
    result = await db.execute(stmt)
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Job not found")
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own jobs")

    item.is_active = False
    await db.flush()
    return None
