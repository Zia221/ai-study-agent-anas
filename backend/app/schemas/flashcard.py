from pydantic import BaseModel, Field


class FlashcardRequest(BaseModel):
    topic: str
    number_of_cards: int | None = Field(
    default=None,
    ge=1,
    le=30,
)

class Flashcard(BaseModel):
    question: str
    answer: str
    topic: str


class GeneratedFlashcards(BaseModel):
    title: str
    topic: str
    flashcards: list[Flashcard]