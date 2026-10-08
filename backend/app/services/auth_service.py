from sqlalchemy.orm import Session
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.core.security import hash_password
from app.db.models import User
from app.schemas.auth import UserCreate
from app.core.security import (
    create_access_token,
    verify_password,
)
from app.schemas.auth import LoginRequest
def login_user(
    db: Session,
    username: str,
    password: str,
):
    user = (
        db.query(User)
        .filter(User.username == username)
        .first()
    )

    if user is None:
        return None

    if not verify_password(
        password,
        user.hashed_password,
    ):
        return None

    if not user.is_active:
        return None

    return user
def create_user(
    db: Session,
    user_data: UserCreate,
):
    existing_username = (
        db.query(User)
        .filter(
            User.username == user_data.username
        )
        .first()
    )

    if existing_username:
        raise ValueError(
            "Username already exists."
        )

    existing_email = (
        db.query(User)
        .filter(
            User.email == user_data.email
        )
        .first()
    )

    if existing_email:
        raise ValueError(
            "Email already exists."
        )

    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(
            user_data.password
        ),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def update_user(
    db: Session,
    user: User,
    username: str,
):
    username = username.strip()

    if len(username) < 3:
        raise ValueError(
            "Username must be at least 3 characters."
        )

    existing_user = (
        db.query(User)
        .filter(
            User.username == username,
            User.id != user.id,
        )
        .first()
    )

    if existing_user:
        raise ValueError(
            "Username already exists."
        )

    user.username = username

    db.commit()
    db.refresh(user)

    return user


def change_password(
    db: Session,
    user: User,
    current_password: str,
    new_password: str,
):
    if user.hashed_password is None:
        raise ValueError(
            "This account does not have a password yet."
        )

    if not verify_password(
        current_password,
        user.hashed_password,
    ):
        raise ValueError(
            "Current password is incorrect."
        )

    if current_password == new_password:
        raise ValueError(
            "New password must be different."
        )

    user.hashed_password = hash_password(
        new_password
    )

    db.commit()
    db.refresh(user)

    return user