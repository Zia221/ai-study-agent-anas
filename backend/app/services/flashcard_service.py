import logging
import os

from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy.orm import Session

from app.schemas.flashcard import GeneratedFlashcards
from app.services.rag_service import search
from app.services.settings_service import get_or_create_settings


load_dotenv()

logger = logging.getLogger(__name__)


client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


FLASHCARD_PROMPT = """
You are an AI study assistant.

Create useful flashcards from the provided study material.

Rules:
1. Every flashcard must be based on the provided material.
2. Do not invent facts.
3. Keep questions clear and focused.
4. Keep answers concise but educational.
5. Avoid duplicate flashcards.
6. Test important concepts rather than tiny details.
7. Every flashcard must include its specific topic.
"""


def generate_flashcards(
    topic: str,
    number_of_cards: int,
    user_id: int,
    db: Session,
):
    logger.info("Flashcard generation started")

    settings = get_or_create_settings(
        db=db,
        user_id=user_id,
    )

    learning_style = settings.learning_style

    learning_style_instruction = {
        "beginner": (
            "Create very simple flashcards. "
            "Use beginner-friendly language."
        ),
        "balanced": (
            "Create balanced flashcards with clear explanations "
            "and appropriate technical detail."
        ),
        "advanced": (
            "Create more technical flashcards that test "
            "deeper understanding."
        ),
    }.get(
        learning_style,
        "Create balanced flashcards.",
    )

    personalized_prompt = f"""
{FLASHCARD_PROMPT}

Student learning style:
{learning_style_instruction}
"""

    retrieved_chunks = search(
        query=topic,
        user_id=user_id,
        limit=8,
    )

    if not retrieved_chunks:
        logger.info(
            "No relevant study material found for flashcards"
        )

        raise ValueError(
            "I couldn't find relevant information about this topic "
            "in your study material."
        )

    context = "\n\n".join(
        chunk["text"] for chunk in retrieved_chunks
    )

    logger.info(
        "Study material retrieved for flashcard generation"
    )

    try:
        response = client.responses.parse(
            model="gpt-5.6-luna",
            instructions=personalized_prompt,
            input=f"""
Study material:
{context}

Create flashcards about:

Topic:
{topic}

Number of flashcards:
{number_of_cards}
""",
            text_format=GeneratedFlashcards,
        )

        logger.info("Flashcards generated successfully")

        return response.output_parsed

    except Exception:
        logger.exception("Flashcard generation failed")
        raise