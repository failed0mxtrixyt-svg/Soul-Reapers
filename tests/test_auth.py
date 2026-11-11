import uuid

import server
from fastapi.testclient import TestClient

from server import app, get_db_connection
from conftest import login_and_verify

client = TestClient(app)


def test_register_and_login_user(sent_verification_codes):
    unique = uuid.uuid4().hex[:8]
    username = f"adminuser{unique}"
    email = f"adminuser{unique}@example.com"

    register = client.post(
        "/api/auth/register",
        json={
            "username": username,
            "email": email,
            "password": "StrongPass123!",
            "role": "admin",
        },
    )
    assert register.status_code == 201, register.text
    body = register.json()
    assert body["user"]["username"] == username
    assert body["user"]["role"] == "viewer"
    assert "sre_session" not in client.cookies

    login_start = client.post(
        "/api/auth/login", json={"email": email, "password": "StrongPass123!"}
    )
    assert login_start.status_code == 200, login_start.text
    assert login_start.json()["verification_required"] is True
    assert "sre_session" not in client.cookies

    verified = client.post("/api/auth/verify-email", json={"code": sent_verification_codes[email]})
    assert verified.status_code == 200, verified.text
    assert "sre_session" in client.cookies

    me = client.get("/api/auth/me")
    assert me.status_code == 200, me.text
    assert me.json()["user"]["username"] == username


def test_schedule_admin_requires_login():
    fresh_client = TestClient(app)
    response = fresh_client.get("/api/admin/schedule")
    assert response.status_code == 401


def test_remember_me_controls_session_duration(sent_verification_codes):
    unique = uuid.uuid4().hex[:8]
    email = f"remember{unique}@example.com"
    client = TestClient(app)
    client.post("/api/auth/register", json={"username": f"remember{unique}", "email": email, "password": "StrongPass123!"})
    login = login_and_verify(client, email, "StrongPass123!", sent_verification_codes, remember_me=True)
    assert login.status_code == 200, login.text
    assert "Max-Age=2592000" in login.headers.get("set-cookie", "")


def test_email_code_is_required_and_invalid_code_is_rejected(sent_verification_codes):
    unique = uuid.uuid4().hex[:8]
    email = f"otp{unique}@example.com"
    client = TestClient(app)
    client.post("/api/auth/register", json={"username": f"otp{unique}", "email": email, "password": "StrongPass123!"})
    started = client.post("/api/auth/login", json={"email": email, "password": "StrongPass123!"})
    assert started.status_code == 200
    assert client.get("/api/auth/me").status_code == 401
    invalid = client.post("/api/auth/verify-email", json={"code": "000000" if sent_verification_codes[email] != "000000" else "111111"})
    assert invalid.status_code == 401
    valid = client.post("/api/auth/verify-email", json={"code": sent_verification_codes[email]})
    assert valid.status_code == 200, valid.text


def test_login_fails_closed_when_email_delivery_is_not_configured(monkeypatch):
    monkeypatch.setattr(server, "EMAIL_VERIFICATION_CONFIGURED", False)
    monkeypatch.setattr(server, "GOOGLE_OAUTH_CONFIGURED", False)
    client = TestClient(app)
    unique = uuid.uuid4().hex[:8]
    email = f"nosmtp{unique}@example.com"
    client.post("/api/auth/register", json={"username": f"nosmtp{unique}", "email": email, "password": "StrongPass123!"})
    result = client.get("/api/auth/providers")
    assert result.status_code == 200
    assert result.json()["email_verification_enabled"] is False
    login = client.post("/api/auth/login", json={"email": email, "password": "StrongPass123!"})
    assert login.status_code == 503
    assert "sre_session" not in client.cookies
    assert client.get("/auth/google/login").status_code == 503


def test_dashboard_only_allows_admin_and_owner(sent_verification_codes):
    unique = uuid.uuid4().hex[:8]
    username = f"dashboarduser{unique}"
    email = f"dashboarduser{unique}@example.com"
    client = TestClient(app)
    registered = client.post(
        "/api/auth/register",
        json={"username": username, "email": email, "password": "StrongPass123!"},
    )
    assert registered.status_code == 201
    user_id = registered.json()["user"]["id"]
    assert registered.json()["user"]["role"] == "viewer"
    assert login_and_verify(client, email, "StrongPass123!", sent_verification_codes).status_code == 200
    assert client.get("/admin").status_code == 403
    assert client.get("/admin.html").status_code == 403
    assert client.get("/owner").status_code == 403
    assert client.get("/coach").status_code == 403

    with get_db_connection() as conn:
        conn.execute("UPDATE users SET role = 'coach' WHERE id = ?", (user_id,))
        conn.commit()
    assert client.get("/admin").status_code == 403
    assert client.get("/admin.html").status_code == 403
    assert client.get("/owner").status_code == 403
    assert client.get("/coach").status_code == 200
    assert client.get("/coach.html").status_code == 200
    assert client.get("/api/admin/rosters").status_code == 200
    assert client.get("/api/admin/schedule").status_code == 200
    assert client.get("/api/admin/team-members").status_code == 403
    assert client.get("/api/admin/users").status_code == 403
    assert client.put("/api/admin/content", json={"content": {}}).status_code == 403

    with get_db_connection() as conn:
        conn.execute("UPDATE users SET role = 'admin' WHERE id = ?", (user_id,))
        conn.commit()
    assert client.get("/admin").status_code == 200
    assert client.get("/admin.html").status_code == 200
    assert client.get("/owner").status_code == 403
    assert client.get("/coach").status_code == 403
    assert client.put("/api/admin/content", json={"content": {}}).status_code == 200
    assert client.get("/api/admin/team-members").status_code == 200
    assert client.get("/api/admin/users").status_code == 403

    with get_db_connection() as conn:
        conn.execute("UPDATE users SET role = 'owner' WHERE id = ?", (user_id,))
        conn.commit()
    assert client.get("/admin").status_code == 200
    assert client.get("/admin.html").status_code == 200
    assert client.get("/owner").status_code == 200
    assert client.get("/owner.html").status_code == 200
    assert client.get("/coach").status_code == 200
    assert client.get("/coach.html").status_code == 200
    assert client.get("/api/admin/users").status_code == 200
