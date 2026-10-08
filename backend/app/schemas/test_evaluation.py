from pydantic import BaseModel


class SubmittedQuestion(BaseModel):
    question: str
    topic: str
    options: list[str]
    correct_answer: int
    explanation: str


class TestEvaluationRequest(BaseModel):
    __test__ = False

    questions: list[SubmittedQuestion]
    answers: list[int | None]


class QuestionResult(BaseModel):
    question: str
    topic: str
    selected_answer: int | None
    correct_answer: int
    is_correct: bool
    explanation: str


class TopicAnalysis(BaseModel):
    topic: str
    total_questions: int
    correct_answers: int
    score: int
    status: str


class TestEvaluationResult(BaseModel):
    total_questions: int
    answered_questions: int
    correct_answers: int
    score: int
    results: list[QuestionResult]
    topic_analysis: list[TopicAnalysis]