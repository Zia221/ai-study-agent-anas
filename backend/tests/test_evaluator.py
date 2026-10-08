from app.schemas.test_evaluation import (
    SubmittedQuestion,
    TestEvaluationRequest,
)
from app.services.test_evaluator import evaluate_test


def make_question(correct_answer: int):
    return SubmittedQuestion(
        question="What is 2 + 2?",
        topic="Math",
        options=[
            "3",
            "4",
            "5",
            "6",
        ],
        correct_answer=correct_answer,
        explanation="2 + 2 equals 4.",
    )


def test_all_answers_correct():
    questions = [
        make_question(1),
        make_question(1),
        make_question(1),
    ]

    request = TestEvaluationRequest(
        questions=questions,
        answers=[1, 1, 1],
    )

    result = evaluate_test(request)

    assert result.total_questions == 3
    assert result.answered_questions == 3
    assert result.correct_answers == 3
    assert result.score == 100


def test_all_answers_wrong():
    questions = [
        make_question(1),
        make_question(1),
        make_question(1),
    ]

    request = TestEvaluationRequest(
        questions=questions,
        answers=[0, 0, 0],
    )

    result = evaluate_test(request)

    assert result.total_questions == 3
    assert result.correct_answers == 0
    assert result.score == 0


def test_unanswered_question():
    questions = [
        make_question(1),
    ]

    request = TestEvaluationRequest(
        questions=questions,
        answers=[None],
    )

    result = evaluate_test(request)

    assert result.total_questions == 1
    assert result.answered_questions == 0
    assert result.correct_answers == 0
    assert result.score == 0