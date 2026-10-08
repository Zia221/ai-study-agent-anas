from app.schemas.test_evaluation import QuestionResult
from app.services.weak_topic_service import analyze_weak_topics


def make_result(
    topic: str,
    is_correct: bool,
):
    return QuestionResult(
        question="Example question",
        topic=topic,
        selected_answer=0,
        correct_answer=0,
        is_correct=is_correct,
        explanation="Example explanation",
    )


def test_detects_weak_topic():
    results = [
        make_result("RAG", False),
        make_result("RAG", False),
        make_result("RAG", True),
    ]

    analysis = analyze_weak_topics(results)

    rag = analysis[0]

    assert rag["topic"] == "RAG"
    assert rag["score"] == 33
    assert rag["status"] == "weak"


def test_detects_strong_topic():
    results = [
        make_result("Python", True),
        make_result("Python", True),
        make_result("Python", True),
    ]

    analysis = analyze_weak_topics(results)

    python = analysis[0]

    assert python["score"] == 100
    assert python["status"] == "strong"