from app.core.security import (
    hash_password,
    verify_password,
)


def test_password_hash_is_different_from_original():
    password = "password123"

    hashed_password = hash_password(password)

    assert hashed_password != password


def test_correct_password_is_verified():
    password = "password123"

    hashed_password = hash_password(password)

    assert verify_password(
        password,
        hashed_password,
    )


def test_wrong_password_is_rejected():
    password = "password123"

    hashed_password = hash_password(password)

    assert not verify_password(
        "wrong-password",
        hashed_password,
    )