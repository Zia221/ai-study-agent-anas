import logging
import os
import random

from dotenv import load_dotenv
from openai import OpenAI

from app.services.rag_service import search
from app.schemas.test import GeneratedTest


load_dotenv()

logger = logging.getLogger(__name__)


client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


TEST_GENERATOR_PROMPT = """
You are an AI test generator for a study application.

Your job is to create high-quality multiple-choice questions
from the provided study material.

Rules:

1. Questions must be based on the provided material.
2. Do not invent facts that are not supported by the material.
3. Each question must have exactly 4 options.
4. Only one option can be correct.
5. Include a short explanation for the correct answer.
6. Match the requested difficulty.
7. Avoid duplicate questions.
8. Test understanding, not only memorization.
9. Every question must include the specific topic or concept
   being tested.
"""


def generate_test(
    topic: str,
    number_of_questions: int,
    difficulty: str,
    user_id: int,
):
    logger.info("Test generation started")

    retrieved_chunks = search(
        query=topic,
        user_id=user_id,
        limit=8,
    )

    if not retrieved_chunks:
        logger.info("No relevant study material found for test")

        raise ValueError(
            "I couldn't find enough information "
            "about this topic in your study material."
        )

    context = "\n\n".join(
        chunk["text"]
        for chunk in retrieved_chunks
    )

    logger.info("Study material retrieved for test generation")

    try:
        response = client.responses.parse(
            model="gpt-5.6-luna",
            instructions=TEST_GENERATOR_PROMPT,
            input=f"""
Study material:

{context}

Create a test about:

Topic: {topic}

Number of questions:
{number_of_questions}

Difficulty:
{difficulty}
""",
            text_format=GeneratedTest,
        )

        test = response.output_parsed

        # Shuffle the options for every question
        # while keeping the correct answer index correct.
        for question in test.questions:
            correct_option = question.options[
                question.correct_answer
            ]

            random.shuffle(question.options)

            question.correct_answer = question.options.index(
                correct_option
            )

        logger.info("Test generated successfully")

        return test

    except Exception:
        logger.exception("Test generation failed")
        raise