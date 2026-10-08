from fastapi.testclient import TestClient
from fastapi.testclient import TestClient
from main import app




def test_register_user(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "api_test_user_2",
            "email": "api_test_2@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["username"] == "api_test_user_2"
    assert data["email"] == "api_test_2@example.com"
    assert "hashed_password" not in data


def test_duplicate_username_is_rejected(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "duplicate_user",
            "email": "first@example.com",
            "password": "password123",
        },
    )

    response = client.post(
        "/api/auth/register",
        json={
            "username": "duplicate_user",
            "email": "second@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 400


def test_login_returns_access_token(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "login_test_user",
            "email": "login_test@example.com",
            "password": "password123",
        },
    )

    response = client.post(
        "/api/auth/login",
        data={
            "username": "login_test_user",
            "password": "password123",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_wrong_password_returns_401(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "wrong_password_user",
            "email": "wrong_password@example.com",
            "password": "password123",
        },
    )

    response = client.post(
        "/api/auth/login",
        data={
            "username": "wrong_password_user",
            "password": "wrong-password",
        },
    )

    assert response.status_code == 401


def test_me_requires_authentication(client):
    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_me_returns_current_user(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "me_test_user",
            "email": "me_test@example.com",
            "password": "password123",
        },
    )

    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "me_test_user",
            "password": "password123",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    response = client.get(
        "/api/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["username"] == "me_test_user"
    assert data["email"] == "me_test@example.com"


def test_progress_requires_authentication(client):
    response = client.get("/api/progress")

    assert response.status_code == 401


def test_authenticated_user_can_access_progress(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "progress_api_user",
            "email": "progress_api@example.com",
            "password": "password123",
        },
    )

    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "progress_api_user",
            "password": "password123",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    response = client.get(
        "/api/progress",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200


def test_invalid_token_is_rejected(client):
    response = client.get(
        "/api/auth/me",
        headers={
            "Authorization": "Bearer invalid-token",
        },
    )

    assert response.status_code == 401