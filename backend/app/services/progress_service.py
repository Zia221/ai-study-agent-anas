from sqlalchemy.orm import Session

from app.db.models import TestResult
from app.services.progress_intelligence import analyze_progress


def save_test_result(
    db: Session,
    user_id: int,
    topic: str,
    total_questions: int,
    answered_questions: int,
    correct_answers: int,
    score: int,
):
    result = TestResult(
        user_id=user_id,
        topic=topic,
        total_questions=total_questions,
        answered_questions=answered_questions,
        correct_answers=correct_answers,
        score=score,
    )

    db.add(result)
    db.commit()
    db.refresh(result)

    return result


def get_progress(db: Session, user_id:int):
    results = (
        db.query(TestResult)
        .filter(TestResult.user_id == user_id)
        .order_by(TestResult.created_at.desc())
        .all()
    )

    if not results:
      return {
        "tests_taken": 0,
        "average_score": 0,
        "best_score": 0,
        "recent_tests": [],
        "topic_progress": [],
    }

    tests_taken = len(results)

    average_score = round(
        sum(result.score for result in results)
        / tests_taken
    )

    best_score = max(
        result.score
        for result in results
    )

    recent_tests = results[:10]

    topic_data = {}

    for result in results:
        topic = result.topic

        if topic not in topic_data:
            topic_data[topic] = []

        topic_data[topic].append(result.score)

    topic_progress = []

    for topic, scores in topic_data.items():
        topic_progress.append(
            {
                "topic": topic,
                "tests_taken": len(scores),
                "average_score": round(
                    sum(scores) / len(scores)
                ),
            }
        )

    insights = analyze_progress(results)

    return {
    "tests_taken": tests_taken,
    "average_score": average_score,
    "best_score": best_score,
    "recent_tests": recent_tests,
    "topic_progress": topic_progress,
    "insights": insights,
}