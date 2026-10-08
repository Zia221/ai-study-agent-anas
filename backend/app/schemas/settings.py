from pydantic import BaseModel, Field


class SettingsResponse(BaseModel):
    difficulty: str
    test_question_count: int
    learning_style: str
    tutor_response_length: str
    tutor_examples: bool
    tutor_follow_up_questions: bool
    theme: str


class SettingsUpdate(BaseModel):
    difficulty: str = Field(
        default="medium"
    )

    test_question_count: int = Field(
        default=10,
        ge=5,
        le=20,
    )

    learning_style: str = Field(
        default="balanced"
    )

    tutor_response_length: str = Field(
        default="balanced"
    )

    tutor_examples: bool = True

    tutor_follow_up_questions: bool = True

    theme: str = Field(
        default="dark"
    )