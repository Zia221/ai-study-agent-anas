from pydantic import BaseModel, Field


class LearningStartRequest(BaseModel):
    topic: str = Field(
        min_length=1,
        max_length=200,
    )

    goal: str = Field(
        default="Understand this topic",
        max_length=500,
    )


class LearningAnswerRequest(BaseModel):
    questions: list[dict]
    answers: list[int | None]