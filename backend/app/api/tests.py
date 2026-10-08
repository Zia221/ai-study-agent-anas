from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.test import TestRequest
from app.schemas.test_evaluation import TestEvaluationRequest
from app.services.progress_service import save_test_result
from app.services.settings_service import get_or_create_settings
from app.services.test_evaluator import evaluate_test
from app.services.test_generator import generate_test


router = APIRouter(
    prefix="/api/tests",
    tags=["Tests"],
)


@router.post("/generate")
async def create_test(
    request: TestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        settings = get_or_create_settings(
            db=db,
            user_id=current_user.id,
        )

        number_of_questions = (
            request.number_of_questions
            if request.number_of_questions is not None
            else settings.test_question_count
        )

        difficulty = (
            request.difficulty
            if request.difficulty is not None
            else settings.difficulty
        )

        test = generate_test(
            topic=request.topic,
            number_of_questions=number_of_questions,
            difficulty=difficulty,
            user_id=current_user.id,
        )

        return test

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

@router.post("/evaluate")
async def evaluate_student_test(
    request: TestEvaluationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if len(request.questions) != len(request.answers):
        raise HTTPException(
            status_code=400,
            detail="Questions and answers must have the same length.",
        )

    evaluation = evaluate_test(request)

    topic = (
        request.questions[0].topic
        if request.questions
        else "Unknown"
    )

    save_test_result(
        db=db,
        user_id=current_user.id,
        topic=topic,
        total_questions=evaluation.total_questions,
        answered_questions=evaluation.answered_questions,
        correct_answers=evaluation.correct_answers,
        score=evaluation.score,
    )

    return evaluation