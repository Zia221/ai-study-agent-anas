from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.settings import (
    SettingsResponse,
    SettingsUpdate,
)
from app.services.settings_service import (
    get_or_create_settings,
    update_settings,
)


router = APIRouter(
    prefix="/api/settings",
    tags=["Settings"],
)


@router.get(
    "",
    response_model=SettingsResponse,
)
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_or_create_settings(
        db=db,
        user_id=current_user.id,
    )


@router.put(
    "",
    response_model=SettingsResponse,
)
async def save_settings(
    data: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return update_settings(
        db=db,
        user_id=current_user.id,
        data=data,
    )