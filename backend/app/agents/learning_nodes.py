from sqlalchemy.orm import Session

from app.services.test_generator import generate_test
from app.services.settings_service import get_or_create_settings
from app.services.rag_service import search
from app.services.tutor_service import teach


def load_student_preferences(
    state: dict,
    db: Session,
) -> dict:
    settings = get_or_create_settings(
        db=db,
        user_id=state["user_id"],
    )

    return {
        "learning_style": settings.learning_style,
        "difficulty": settings.difficulty,
    }


def retrieve_material(
    state: dict,
) -> dict:
    results = search(
        query=state["topic"],
        user_id=state["user_id"],
        limit=8,
    )

    context = "\n\n".join(
        item["text"]
        for item in results
    )

    return {
        "study_context": context,
    }


def teach_topic(
    state: dict,
    db: Session,
) -> dict:
    explanation = teach(
        question=(
            f"Teach me {state['topic']} "
            f"for the goal: {state['goal']}"
        ),
        user_id=state["user_id"],
        db=db,
    )

    return {
        "explanation": explanation,
        "status": "teaching",
    }


def create_practice(
    state: dict,
    db: Session,
) -> dict:
    result = generate_test(
        topic=state["topic"],
        number_of_questions=5,
        difficulty=state["difficulty"],
        user_id=state["user_id"],
    )

    questions = [
        question.model_dump()
        if hasattr(question, "model_dump")
        else question
        for question in result.questions
    ]

    return {
        "questions": questions,
        "total_questions": len(questions),
        "status": "practice",
    }


def evaluate_practice(
    state: dict,
) -> dict:
    questions = state.get("questions", [])
    answers = state.get("answers", [])

    total = len(questions)

    if total == 0:
        return {
            "score": 0,
            "correct_answers": 0,
            "total_questions": 0,
            "status": "evaluated",
        }

    correct = 0

    for index, question in enumerate(questions):
        selected = (
            answers[index]
            if index < len(answers)
            else None
        )

        if selected == question["correct_answer"]:
            correct += 1

    score = round((correct / total) * 100)

    return {
        "score": score,
        "correct_answers": correct,
        "total_questions": total,
        "status": "evaluated",
    }


def decide_next_action(
    state: dict,
) -> dict:
    score = state.get("score", 0)

    if score < 60:
        next_action = "teach"

        recommendation = (
            "The student needs another explanation "
            "before attempting more difficult practice."
        )

    elif score < 80:
        next_action = "practice"

        recommendation = (
            "The student understands the basics but "
            "needs more practice."
        )

    else:
        next_action = "advance"

        recommendation = (
            "The student has demonstrated strong understanding. "
            "Move to the next level or topic."
        )

    return {
        "next_action": next_action,
        "recommendation": recommendation,
        "status": "completed",
    }