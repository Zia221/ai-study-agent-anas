def get_learning_style_instruction(learning_style: str) -> str:
    instructions = {
        "beginner": (
            "Use beginner-friendly language. "
            "Explain difficult concepts step by step "
            "and avoid unnecessary jargon."
        ),
        "balanced": (
            "Use a balanced teaching style with clear explanations "
            "and appropriate technical detail."
        ),
        "advanced": (
            "Use more technical language and provide deeper explanations "
            "when useful."
        ),
    }

    return instructions.get(
        learning_style,
        instructions["balanced"],
    )


def get_response_length_instruction(response_length: str) -> str:
    instructions = {
        "short": "Keep the response concise and focused.",
        "balanced": "Give a clear response with useful detail.",
        "detailed": (
            "Give a detailed response with step-by-step explanation."
        ),
    }

    return instructions.get(
        response_length,
        instructions["balanced"],
    )


def get_examples_instruction(tutor_examples: bool) -> str:
    if tutor_examples:
        return "Use examples when they help the student understand the concept."

    return "Do not add unnecessary examples."


def get_follow_up_instruction(tutor_follow_up_questions: bool) -> str:
    if tutor_follow_up_questions:
        return (
            "At the end, ask one short question "
            "to check the student's understanding."
        )

    return "Do not ask a follow-up question."