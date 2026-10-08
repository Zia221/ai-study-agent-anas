from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.flashcard import FlashcardRequest
from app.services.flashcard_service import generate_flashcards
from app.services.settings_service import get_or_create_settings


router = APIRouter(
    prefix="/api/flashcards",
    tags=["Flashcards"],
)


@router.post("/generate")
async def create_flashcards(
    data: FlashcardRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        settings = get_or_create_settings(
            db=db,
            user_id=current_user.id,
        )

        number_of_cards = (
            data.number_of_cards
            if data.number_of_cards is not None
            else settings.test_question_count
        )

        flashcards = generate_flashcards(
            topic=data.topic,
            number_of_cards=number_of_cards,
            user_id=current_user.id,
            db=db,
        )

        return flashcards

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )