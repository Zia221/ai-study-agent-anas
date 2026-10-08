from typing import TypedDict


class LearningState(TypedDict, total=False):
    user_id: int
    topic: str
    goal: str

    learning_style: str
    difficulty: str

    study_context: str
    explanation: str

    questions: list[dict]
    answers: list[int | None]

    score: int
    correct_answers: int
    total_questions: int

    weak_topics: list[str]

    next_action: str
    recommendation: str

    status: str