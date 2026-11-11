from fastapi.testclient import TestClient

from server import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["site"] == "Soul Reapers Esports"


def test_rosters_endpoint():
    response = client.get("/api/rosters")
    assert response.status_code == 200
    body = response.json()
    assert "rosters" in body
    assert "Apex Roster" in body["teams"]
    assert len(body["rosters"]) >= 1
    assert body["rosters"][0]["name"]


def test_contact_submission():
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "subject": "Website question",
        "message": "Can you send me more info?"
    }
    response = client.post("/api/contact", json=payload)
    assert response.status_code == 201
    body = response.json()
    assert body["message"] == "Contact message received."
