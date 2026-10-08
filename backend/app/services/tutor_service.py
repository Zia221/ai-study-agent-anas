import logging
import os

from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy.orm import Session

from app.services.ai_preferences import (
    get_learning_style_instruction,
    get_response_length_instruction,
    get_examples_instruction,
    get_follow_up_instruction,
)
from app.services.rag_service import search
from app.services.settings_service import get_or_create_settings


load_dotenv()

logger = logging.getLogger(__name__)


client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


TUTOR_SYSTEM_PROMPT = """
You are an AI Study Tutor.

Your job is to help the student understand their study material.

General rules:

1. Explain concepts clearly.
2. Use the provided study material as the primary source.
3. Do not invent information that is not supported by the material.
4. Break difficult concepts into smaller parts.
5. Encourage understanding instead of memorization.
"""


def teach(
    question: str,
    user_id: int,
    db: Session,
    limit: int = 5,
) -> str:

    logger.info("Tutor request started")

    settings = get_or_create_settings(
        db=db,
        user_id=user_id,
    )

    # Get all personalization instructions
    learning_style_instruction = get_learning_style_instruction(
        settings.learning_style
    )

    response_length_instruction = get_response_length_instruction(
        settings.tutor_response_length
    )

    examples_instruction = get_examples_instruction(
        settings.tutor_examples
    )

    follow_up_instruction = get_follow_up_instruction(
        settings.tutor_follow_up_questions
    )

    # Build personalized tutor prompt
    personalized_prompt = f"""
{TUTOR_SYSTEM_PROMPT}

Teaching preferences:

Learning style:
{learning_style_instruction}

Response length:
{response_length_instruction}

Examples:
{examples_instruction}

Follow-up questions:
{follow_up_instruction}
"""

    # Search student's study material
    retrieved_chunks = search(
        query=question,
        user_id=user_id,
        limit=limit,
    )

    if not retrieved_chunks:
        logger.info("Tutor found no relevant study material")

        return "I couldn't find relevant information in your study material."

    context = "\n\n".join(
        chunk["text"]
        for chunk in retrieved_chunks
    )

    logger.info("Tutor found relevant study material")

    try:
        response = client.responses.create(
            model="gpt-5.6-luna",
            instructions=personalized_prompt,
            input=f"""
Study material:

{context}

Student question:

{question}
""",
        )

        logger.info("Tutor response generated successfully")

        return response.output_text.strip()

    except Exception:
        logger.exception("Tutor response generation failed")
        raise