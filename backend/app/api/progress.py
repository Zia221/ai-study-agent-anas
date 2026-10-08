from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.services.progress_service import get_progress


router = APIRouter(
    prefix="/api/progress",
    tags=["Progress"],
)


@router.get("")
async def read_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_progress(
        db=db,
        user_id=current_user.id,
    )