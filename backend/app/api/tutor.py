from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.models import User
from app.db.database import get_db
from app.services.tutor_service import teach


router = APIRouter(
    prefix="/api/tutor",
    tags=["Tutor"],
)


class TutorRequest(BaseModel):
    question: str


@router.post("/ask")
async def ask_tutor(
    request: TutorRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    answer = teach(
        question=request.question,
        user_id=current_user.id,
        db=db,
    )

    return {
        "question": request.question,
        "answer": answer,
    }