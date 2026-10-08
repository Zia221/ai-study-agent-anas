def test_student_auth_flow(client):
    register_response = client.post(
        "/api/auth/register",
        json={
            "username": "student_flow",
            "email": "student_flow@example.com",
            "password": "password123",
        },
    )

    assert register_response.status_code == 200

    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "student_flow",
            "password": "password123",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    assert token

    headers = {
        "Authorization": f"Bearer {token}",
    }

    me_response = client.get(
        "/api/auth/me",
        headers=headers,
    )

    assert me_response.status_code == 200
    assert me_response.json()["username"] == "student_flow"

    progress_response = client.get(
        "/api/progress",
        headers=headers,
    )

    assert progress_response.status_code == 200