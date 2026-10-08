from app.schemas.test_evaluation import (
    TestEvaluationRequest,
    TestEvaluationResult,
    QuestionResult,
)
from app.services.weak_topic_service import analyze_weak_topics


def evaluate_test(
    request: TestEvaluationRequest,
) -> TestEvaluationResult:

    results = []
    correct_answers = 0
    answered_questions = 0

    for index, question in enumerate(request.questions):

        selected_answer = request.answers[index]

        if selected_answer is not None:
            answered_questions += 1

        is_correct = (
            selected_answer == question.correct_answer
        )

        if is_correct:
            correct_answers += 1

        results.append(
            QuestionResult(
                question=question.question,
                topic=question.topic,
                selected_answer=selected_answer,
                correct_answer=question.correct_answer,
                is_correct=is_correct,
                explanation=question.explanation,
            )
        )

    total_questions = len(request.questions)

    score = (
        round(
            (correct_answers / total_questions) * 100
        )
        if total_questions > 0
        else 0
    )

    topic_analysis = analyze_weak_topics(results)

    return TestEvaluationResult(
        total_questions=total_questions,
        answered_questions=answered_questions,
        correct_answers=correct_answers,
        score=score,
        results=results,
        topic_analysis=topic_analysis,
    )