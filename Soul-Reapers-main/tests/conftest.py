import pytest
from fastapi.testclient import TestClient

import server


@pytest.fixture
def sent_verification_codes(monkeypatch):
    codes = {}

    def capture_email(address: str, code: str) -> None:
        codes[address] = code

    monkeypatch.setattr(server, "send_login_verification_email", capture_email)
    monkeypatch.setattr(server, "EMAIL_VERIFICATION_CONFIGURED", True)
    return codes


def login_and_verify(client: TestClient, email: str, password: str, codes: dict[str, str], remember_me: bool = False):
    login = client.post(
        "/api/auth/login",
        json={"email": email, "password": password, "remember_me": remember_me},
    )
    assert login.status_code == 200, login.text
    assert login.json()["verification_required"] is True
    code = codes[email]
    return client.post("/api/auth/verify-email", json={"code": code})
