def test_login_with_wrong_password_returns_401(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "error_test_user",
            "email": "error_test@example.com",
            "password": "password123",
        },
    )

    response = client.post(
        "/api/auth/login",
        data={
            "username": "error_test_user",
            "password": "wrong-password",
        },
    )

    assert response.status_code == 401


def test_register_rejects_short_password(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "123",
        },
    )

    assert response.status_code == 422


def test_register_rejects_short_username(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "ab",
            "email": "test@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 422