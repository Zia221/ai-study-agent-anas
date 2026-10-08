from datetime import datetime
from sqlalchemy import Boolean, ForeignKey, Integer, String
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Integer, String,ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class TestResult(Base):
    __tablename__ = "test_results"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        index=True,
    )

    topic: Mapped[str] = mapped_column(
        String,
        index=True,
    )

    total_questions: Mapped[int] = mapped_column(Integer)

    answered_questions: Mapped[int] = mapped_column(Integer)

    correct_answers: Mapped[int] = mapped_column(Integer)

    score: Mapped[int] = mapped_column(Integer)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    username: Mapped[str] = mapped_column(
        String,
        unique=True,
        index=True,
    )

    email: Mapped[str] = mapped_column(
        String,
        unique=True,
        index=True,
    )

    hashed_password: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    google_id: Mapped[str | None] = mapped_column(
        String,
        unique=True,
        index=True,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        unique=True,
        index=True,
    )

    difficulty: Mapped[str] = mapped_column(
        String,
        default="medium",
    )

    test_question_count: Mapped[int] = mapped_column(
        Integer,
        default=10,
    )

    learning_style: Mapped[str] = mapped_column(
        String,
        default="balanced",
    )

    tutor_response_length: Mapped[str] = mapped_column(
        String,
        default="balanced",
    )

    tutor_examples: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    tutor_follow_up_questions: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    theme: Mapped[str] = mapped_column(
        String,
        default="dark",
    )


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    filename: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )
    
    file_path: Mapped[str] = mapped_column(
    String,
    nullable=False,
    )
    file_type: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    file_size: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    status: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="processing",
    )

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    