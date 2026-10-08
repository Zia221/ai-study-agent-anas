from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import get_current_user

from app.schemas.learning_agent import (
    LearningStartRequest,
    LearningAnswerRequest,
)

from app.agents.learning_agent import build_learning_graph
from app.agents.learning_nodes import (
    evaluate_practice,
    decide_next_action,
)

router = APIRouter(
    prefix="/api/learning-agent",
    tags=["Learning Agent"],
)

@router.post("/start")
async def start_learning(
    data: LearningStartRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    graph = build_learning_graph(db)

    state = {
        "user_id": current_user.id,
        "topic": data.topic,
        "goal": data.goal,
    }

    result = graph.invoke(state)

    return {
        "topic": result["topic"],
        "goal": result["goal"],
        "explanation": result.get("explanation"),
        "questions": result.get("questions", []),
        "status": result.get("status"),
    }

@router.post("/evaluate")
async def evaluate_learning(
    data: LearningAnswerRequest,
    current_user=Depends(get_current_user),
):
    state = {
        "questions": data.questions,
        "answers": data.answers,
    }

    evaluation = evaluate_practice(state)

    decision = decide_next_action({
        **state,
        **evaluation,
    })

    return {
        **evaluation,
        **decision,
    }