from sqlalchemy.orm import Session

from app.db.models import UserSettings


def get_or_create_settings(
    db: Session,
    user_id: int,
):
    settings = (
        db.query(UserSettings)
        .filter(UserSettings.user_id == user_id)
        .first()
    )

    if settings:
        return settings

    settings = UserSettings(
        user_id=user_id,
    )

    db.add(settings)
    db.commit()
    db.refresh(settings)

    return settings


def update_settings(
    db: Session,
    user_id: int,
    data,
):
    settings = get_or_create_settings(
        db=db,
        user_id=user_id,
    )

    settings.difficulty = data.difficulty
    settings.test_question_count = (
        data.test_question_count
    )
    settings.learning_style = (
        data.learning_style
    )
    settings.tutor_response_length = (
        data.tutor_response_length
    )
    settings.tutor_examples = (
        data.tutor_examples
    )
    settings.tutor_follow_up_questions = (
        data.tutor_follow_up_questions
    )
    settings.theme = data.theme

    db.commit()
    db.refresh(settings)

    return settings