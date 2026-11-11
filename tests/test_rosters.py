import uuid

from fastapi.testclient import TestClient

from server import app
from conftest import login_and_verify


def test_roster_crud_requires_coach_or_admin(sent_verification_codes):
    client = TestClient(app)
    unauthorized = client.post(
        "/api/admin/rosters",
        json={"name": "Test Player", "role": "Flex", "team": "Main R6 Roster", "image": ""},
    )
    assert unauthorized.status_code == 401

    login = login_and_verify(client, "admin@soulreapers.gg", "Admin123!", sent_verification_codes)
    assert login.status_code == 200, login.text

    unique_name = f"TestPlayer{uuid.uuid4().hex[:8]}"
    payload = {
        "name": unique_name,
        "real_name": "Test User",
        "role": "Flex",
        "team": "Main R6 Roster",
        "image": "assets/owners/blank.png",
        "discord_name": "test.handle",
    }
    created = client.post("/api/admin/rosters", json=payload)
    assert created.status_code == 201, created.text
    player_id = created.json()["id"]

    public_rosters = client.get("/api/rosters").json()["rosters"]
    assert any(player["id"] == player_id and player["name"] == unique_name and player["discord_name"] == "test.handle" for player in public_rosters)

    payload["role"] = "Support"
    payload["discord_name"] = "updated.handle"
    updated = client.put(f"/api/admin/rosters/{player_id}", json=payload)
    assert updated.status_code == 200, updated.text
    assert any(player["id"] == player_id and player["role"] == "Support" and player["discord_name"] == "updated.handle" for player in client.get("/api/rosters").json()["rosters"])

    deleted = client.delete(f"/api/admin/rosters/{player_id}")
    assert deleted.status_code == 200, deleted.text
    assert all(player["id"] != player_id for player in client.get("/api/rosters").json()["rosters"])


def test_admin_can_update_public_content_and_team_profiles(sent_verification_codes):
    client = TestClient(app)
    login = login_and_verify(client, "admin@soulreapers.gg", "Admin123!", sent_verification_codes)
    assert login.status_code == 200, login.text

    before = client.get("/api/content").json()["content"]["home_title"]
    update = client.put("/api/admin/content", json={"content": {"home_title": "SRE TEST TITLE"}})
    assert update.status_code == 200, update.text
    assert client.get("/api/content").json()["content"]["home_title"] == "SRE TEST TITLE"
    client.put("/api/admin/content", json={"content": {"home_title": before}})

    member = {
        "kind": "staff", "name": f"TestStaff{uuid.uuid4().hex[:6]}", "title": "Coach",
        "contact": "", "bio": "", "image": "assets/SREtp - Copy.png", "socials": {"twitter": ""},
    }
    created = client.post("/api/admin/team-members", json=member)
    assert created.status_code == 201, created.text
    member_id = created.json()["id"]
    assert any(person["id"] == member_id for person in client.get("/api/staff").json()["staff"])

    member["title"] = "Assistant Coach"
    updated = client.put(f"/api/admin/team-members/{member_id}", json=member)
    assert updated.status_code == 200, updated.text
    assert any(person["id"] == member_id and person["role"] == "Assistant Coach" for person in client.get("/api/staff").json()["staff"])
    assert client.delete(f"/api/admin/team-members/{member_id}").status_code == 200


def test_admin_can_edit_existing_schedule_event(sent_verification_codes):
    client = TestClient(app)
    login = login_and_verify(client, "admin@soulreapers.gg", "Admin123!", sent_verification_codes)
    assert login.status_code == 200, login.text
    payload = {
        "title": "Temporary test scrim", "player": "Test roster", "category": "Scrim",
        "team": "Main Roster", "date": "2026-12-01", "time": "18:00",
        "location": "Online", "notes": "Before edit",
    }
    created = client.post("/api/admin/schedule", json=payload)
    assert created.status_code == 200, created.text
    event_id = created.json()["id"]
    payload["title"] = "Updated test scrim"
    payload["notes"] = "After edit"
    updated = client.put(f"/api/admin/schedule/{event_id}", json=payload)
    assert updated.status_code == 200, updated.text
    assert any(event["id"] == event_id and event["title"] == payload["title"] for event in client.get("/api/schedule").json()["events"])
    assert client.delete(f"/api/admin/schedule/{event_id}").status_code == 200
