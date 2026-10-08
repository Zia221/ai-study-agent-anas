from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.notes import NotesRequest
from app.services.notes_service import generate_notes


router = APIRouter(
    prefix="/api/notes",
    tags=["Notes"],
)


@router.post("/generate")
async def create_notes(
    data: NotesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        notes = generate_notes(
            topic=data.topic,
            user_id=current_user.id,
            db=db,
        )

        return notes

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )