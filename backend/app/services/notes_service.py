import logging
import os

from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy.orm import Session

from app.schemas.notes import GeneratedNotes
from app.services.rag_service import search
from app.services.settings_service import get_or_create_settings
from app.services.ai_preferences import (
    get_response_length_instruction,
)


load_dotenv()

logger = logging.getLogger(__name__)


client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


NOTES_PROMPT = """
You are an AI study assistant.

Create clear and useful study notes from the provided study material.

Rules:

1. Use only information supported by the provided material.
2. Do not invent facts.
3. Explain difficult ideas in simple language.
4. Organize the notes into logical sections.
5. Give each section a clear heading.
6. Include important key points.
7. Keep the summary concise but useful.
8. Focus on understanding rather than memorization.
9. Avoid unnecessary repetition.
"""


def generate_notes(
    topic: str,
    user_id: int,
    db: Session,
):
    logger.info("Notes generation started")

    # Get the student's settings
    settings = get_or_create_settings(
        db=db,
        user_id=user_id,
    )

    # Get response length preference
    response_length_instruction = get_response_length_instruction(
        settings.tutor_response_length
    )

    # Get learning style preference
    learning_style_instruction = {
        "beginner": (
            "Write notes in very simple language. "
            "Explain unfamiliar concepts clearly."
        ),
        "balanced": (
            "Write clear, structured study notes with useful detail."
        ),
        "advanced": (
            "Include deeper technical details and important relationships "
            "between concepts."
        ),
    }.get(
        settings.learning_style,
        "Write clear, structured study notes.",
    )

    # Build personalized prompt
    personalized_prompt = f"""
{NOTES_PROMPT}

Student learning style:

{learning_style_instruction}

Response style:

{response_length_instruction}
"""

    # Search the student's study material using RAG
    retrieved_chunks = search(
        query=topic,
        user_id=user_id,
        limit=8,
    )

    if not retrieved_chunks:
        logger.info(
            "No relevant study material found for notes"
        )

        raise ValueError(
            "I couldn't find relevant information "
            "about this topic in your study material."
        )

    # Combine retrieved study material
    context = "\n\n".join(
        chunk["text"]
        for chunk in retrieved_chunks
    )

    logger.info(
        "Study material retrieved for notes generation"
    )

    try:
        # Generate personalized notes
        response = client.responses.parse(
            model="gpt-5.6-luna",
            instructions=personalized_prompt,
            input=f"""
Study material:

{context}

Create study notes about:

Topic:
{topic}
""",
            text_format=GeneratedNotes,
        )

        logger.info("Notes generated successfully")

        return response.output_parsed

    except Exception:
        logger.exception("Notes generation failed")
        raise