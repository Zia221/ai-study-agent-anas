from pydantic import BaseModel, Field


class TestRequest(BaseModel):
    topic: str
    number_of_questions: int | None = Field(
        default=None,
        ge=1,
        le=20,
    )
    difficulty: str | None = None


class Question(BaseModel):
    question: str
    topic: str
    options: list[str]
    correct_answer: int
    explanation: str


class GeneratedTest(BaseModel):
    title: str
    topic: str
    difficulty: str
    questions: list[Question]