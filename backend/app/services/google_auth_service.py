from google.auth.transport import requests
from google.oauth2 import id_token
from sqlalchemy.orm import Session

from app.core.config import GOOGLE_CLIENT_ID
from app.core.security import create_access_token
from app.db.models import User


def authenticate_google_user(
    db: Session,
    credential: str,
):
    if not GOOGLE_CLIENT_ID:
        raise ValueError(
            "Google authentication is not configured."
        )

    try:
        google_user = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except ValueError:
        raise ValueError(
            "Invalid Google authentication."
        )

    google_id = google_user.get("sub")
    email = google_user.get("email")
    email_verified = google_user.get("email_verified")

    if not google_id or not email:
        raise ValueError(
            "Google account information is incomplete."
        )

    if not email_verified:
        raise ValueError(
            "Google email is not verified."
        )

    user = (
        db.query(User)
        .filter(User.google_id == google_id)
        .first()
    )

    if user:
        if not user.is_active:
            raise ValueError("User account is inactive.")

        return create_access_token(user.id)

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if user:
        if not user.is_active:
            raise ValueError("User account is inactive.")

        user.google_id = google_id

        db.commit()
        db.refresh(user)

        return create_access_token(user.id)

    username = email.split("@")[0]

    existing_username = (
        db.query(User)
        .filter(User.username == username)
        .first()
    )

    if existing_username:
        username = f"{username}_{google_id[-6:]}"

    user = User(
        username=username,
        email=email,
        hashed_password=None,
        google_id=google_id,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return create_access_token(user.id)