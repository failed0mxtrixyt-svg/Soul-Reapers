#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
import secrets
import smtplib
import sqlite3
from contextlib import closing
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from pathlib import Path
from typing import Any, Optional

import uvicorn
from authlib.integrations.starlette_client import OAuth
from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from starlette.middleware.sessions import SessionMiddleware

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
DB_PATH = BASE_DIR / "sre.db"
SESSION_COOKIE_NAME = "sre_session"
PENDING_AUTH_COOKIE_NAME = "sre_pending_auth"
SESSION_TTL_SECONDS = 12 * 60 * 60
REMEMBER_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60
EMAIL_CODE_TTL_SECONDS = 10 * 60
EMAIL_CODE_MAX_ATTEMPTS = 5
PASSWORD_PEPPER = "soul-reapers-esports-2026"
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "0").lower() in {"1", "true", "yes"}
SKIP_EMAIL_VERIFICATION = os.getenv("SKIP_EMAIL_VERIFICATION", "0").lower() in {"1", "true", "yes"}

SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "").strip()
APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
AUTH_EMAIL_MODE = os.getenv("AUTH_EMAIL_MODE", "smtp").strip().lower()
CONSOLE_EMAIL_ALLOWED = AUTH_EMAIL_MODE == "console" and APP_ENV in {"development", "test"}
EMAIL_VERIFICATION_CONFIGURED = bool((SMTP_HOST and SMTP_FROM_EMAIL) or CONSOLE_EMAIL_ALLOWED)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
OAUTH_STATE_SECRET = os.getenv("OAUTH_STATE_SECRET", "")
GOOGLE_OAUTH_CONFIGURED = bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET and OAUTH_STATE_SECRET)
oauth = OAuth()
if GOOGLE_OAUTH_CONFIGURED:
    oauth.register(
        name="google",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )

SITE_INFO = {
    "name": "Soul Reapers Esports",
    "tagline": "Professional Rainbow Six Siege organization",
    "discord": "https://discord.gg/z5ZSQ5X55X",
    "twitter": "https://twitter.com/soulreapersgg",
    "tiktok": "https://tiktok.com/@soulreapersgg",
    "location": "Global",
    "founded": 2024,
}

ROSTER_DATA = [
    {
        "name": "Dehhleon",
        "real_name": "",
        "role": "IGL",
        "team": "Main R6 Roster",
        "image": "assets/players/FrisbeeHeadband_Face.png",
        "socials": {
            "twitter": "#",
            "twitch": "#",
            "youtube": "#",
            "tiktok": "#",
        },
    },
    {
        "name": "q_aNt4m.",
        "real_name": "",
        "role": "Entry",
        "team": "Main R6 Roster",
        "image": "assets/players/IMG_4428.webp",
        "socials": {
            "twitter": "#",
            "twitch": "#",
            "youtube": "#",
            "tiktok": "#",
        },
    },
    {
        "name": "Sonic",
        "real_name": "",
        "role": "Entry",
        "team": "Main R6 Roster",
        "image": "assets/players/126b11847c35e423e5ec7fbb2e4be985.png",
        "socials": {
            "twitter": "#",
            "twitch": "#",
            "youtube": "#",
            "tiktok": "#",
        },
    },
    {
        "name": "ItsJuice",
        "real_name": "",
        "role": "Flex/Support",
        "team": "Main R6 Roster",
        "image": "assets/players/IMG_1108.png",
        "socials": {
            "twitter": "#",
            "twitch": "#",
            "youtube": "#",
            "tiktok": "#",
        },
    },
    {
        "name": "Thrifts",
        "real_name": "",
        "role": "Flex",
        "team": "Main R6 Roster",
        "image": "assets/staff/694f4cab78d0aed08b6cc852.png",
        "socials": {
            "twitter": "#",
            "twitch": "#",
            "youtube": "#",
            "tiktok": "#",
        },
    },
    {
        "name": "Ooglif",
        "real_name": "",
        "role": "Flex",
        "team": "Academy R6 Roster",
        "image": "assets/players/IMG_5350.jpg",
        "socials": {
            "twitter": "#",
            "twitch": "#",
            "youtube": "#",
            "tiktok": "#",
        },
    },
    {
        "name": "Vclxqz7",
        "real_name": "",
        "role": "IGL",
        "team": "Academy R6 Roster",
        "image": "assets/owners/74729C57-4D20-46F9-AC9B-29A3F8964CFA.png",
        "socials": {
            "twitter": "#",
            "twitch": "#",
            "youtube": "#",
            "tiktok": "#",
        },
    },
]

ROSTER_SEED_DATA = [
    {"name": "Dehhleon", "real_name": "", "role": "IGL", "team": "Main R6 Roster", "image": "assets/players/FrisbeeHeadband_Face.png"},
    {"name": "q_aNt4m.", "real_name": "", "role": "Entry", "team": "Main R6 Roster", "image": "assets/players/IMG_4428.webp"},
    {"name": "Sonic", "real_name": "", "role": "Entry", "team": "Main R6 Roster", "image": "assets/players/126b11847c35e423e5ec7fbb2e4be985.png"},
    {"name": "ItsJuice", "real_name": "", "role": "Flex/Support", "team": "Main R6 Roster", "image": "assets/players/IMG_1108.png"},
    {"name": "Thrifts", "real_name": "", "role": "Flex", "team": "Main R6 Roster", "image": "assets/staff/694f4cab78d0aed08b6cc852.png"},
    {"name": "Dehhleon", "real_name": "", "role": "IGL", "team": "Main R6 Roster Subs", "image": "assets/players/FrisbeeHeadband_Face.png"},
    {"name": "q_aNt4m.", "real_name": "", "role": "Entry", "team": "Main R6 Roster Subs", "image": "assets/players/IMG_4428.webp"},
    {"name": "Sonic", "real_name": "", "role": "Entry", "team": "Main R6 Roster Subs", "image": "assets/players/126b11847c35e423e5ec7fbb2e4be985.png"},
    {"name": "ItsJuice", "real_name": "", "role": "Flex/Support", "team": "Main R6 Roster Subs", "image": "assets/players/IMG_1108.png"},
    {"name": "Thrifts", "real_name": "", "role": "Flex", "team": "Main R6 Roster Subs", "image": "assets/staff/694f4cab78d0aed08b6cc852.png"},
    {"name": "Ooglif", "real_name": "", "role": "Flex", "team": "Academy R6 Roster", "image": "assets/players/IMG_5350.jpg"},
    {"name": "Vclxqz7", "real_name": "", "role": "IGL", "team": "Academy R6 Roster", "image": "assets/owners/74729C57-4D20-46F9-AC9B-29A3F8964CFA.png"},
    {"name": "GGmoney_74", "real_name": "", "role": "Entry", "team": "Academy R6 Roster", "image": "assets/players/meme-mem.png"},
    {"name": "Neb", "real_name": "", "role": "Entry", "team": "Academy R6 Roster", "image": "assets/players/academy4.jpg"},
    {"name": "grimdeath", "real_name": "", "role": "Support", "team": "Academy R6 Roster", "image": "assets/owners/grim-reaper-head-illustration-with-combination-of-crossed-scythe-and-blood-grunge-background-vector.jpg"},
    {"name": "Dehhleon", "real_name": "", "role": "IGL", "team": "Academy Roster Subs", "image": "assets/players/FrisbeeHeadband_Face.png"},
    {"name": "q_aNt4m.", "real_name": "", "role": "Entry", "team": "Academy Roster Subs", "image": "assets/players/IMG_4428.webp"},
    {"name": "Sonic", "real_name": "", "role": "Entry", "team": "Academy Roster Subs", "image": "assets/players/126b11847c35e423e5ec7fbb2e4be985.png"},
    {"name": "ItsJuice", "real_name": "", "role": "Flex/Support", "team": "Academy Roster Subs", "image": "assets/players/IMG_1108.png"},
    {"name": "Thrifts", "real_name": "", "role": "Flex", "team": "Academy Roster Subs", "image": "assets/staff/694f4cab78d0aed08b6cc852.png"},
]

ROSTER_TEAMS = [
    "Main R6 Roster",
    "Main R6 Roster Subs",
    "Academy R6 Roster",
    "Academy Roster Subs",
    "Apex Roster",
]

SITE_CONTENT_DEFAULTS = {
    "home_title": "SOUL REAPERS ESPORTS",
    "home_subtitle": "Professional Rainbow Six Siege Esports Organization",
    "home_roster_button": "View Rosters",
    "home_community_button": "Join Our Discord",
    "about_title": "ABOUT SOUL REAPERS ESPORTS",
    "about_subtitle": "Our journey, mission, and commitment to excellence",
    "about_story_one": "Soul Reapers Esports (SRE) is a professional esports organization founded in 2023 with a focus on Rainbow Six Siege. Our mission is to develop talented players and compete at the highest level while maintaining a strong community presence.",
    "about_story_two": "With competitive rosters across multiple games, we provide a pathway for emerging talent to grow and succeed in esports.",
    "about_mission": "To create a player-first organization that fosters talent development, competitive excellence, and community engagement.",
    "about_achievement": "Inaugural League Winners",
    "about_stat_wins": "1+",
    "about_stat_community": "50+",
    "about_stat_teams": "3+",
    "about_stat_founded": "2024",
    "about_value_excellence": "Striving for the highest standards in competition and performance",
    "about_value_community": "Building a supportive and engaged community around our teams",
    "about_value_development": "Nurturing talent and helping players reach their full potential",
    "contact_title": "JOIN OUR COMMUNITY",
    "contact_subtitle": "Connect with us and stay updated",
    "contact_heading": "Connect With Us",
    "contact_intro": "Join our Discord community to stay updated with the latest news, matches, and events!",
    "discord_url": "https://discord.gg/z5ZSQ5X55X",
    "twitter_url": "https://twitter.com/soulreapersgg",
    "tiktok_url": "https://tiktok.com/@soulreapersgg",
    "business_email": "business@soulreapers.gg",
    "tryouts_email": "tryouts@soulreapers.gg",
    "media_email": "media@soulreapers.gg",
    "privacy_updated": "January 2024",
    "terms_updated": "January 2024",
}

STAFF_DATA = [
    {
        "name": "theone23 (alex)",
        "role": "Coach",
        "discord": "@theone23",
        "discord_role": "Coach",
        "image": "assets/staff/coach1.jpg",
        "socials": {
            "twitter": "#",
            "discord": "#",
            "tiktok": "#",
        },
    },
    {
        "name": "Inno--",
        "role": "Head Staff",
        "discord": "@cassandrian.",
        "discord_role": "Head Staff",
        "image": "assets/staff/694f4cab78d0aed08b6cc852.png",
        "socials": {
            "twitter": "#",
            "discord": "#",
            "tiktok": "#",
        },
    },
]

OWNER_DATA = [
    {
        "name": "Vclxqz7",
        "title": "Founder & Owner",
        "bio": "Former professional Rainbow Six Siege player with 3 years of competitive experience. Founded SRE with the vision of creating a player-first organization that focuses on development and excellence.",
        "image": "assets/owners/74729C57-4D20-46F9-AC9B-29A3F8964CFA.png",
        "socials": {
            "twitter": "https://twitter.com/vclxqz7",
            "discord": "https://discord.com/users/vclxqz7",
            "tiktok": "https://tiktok.com/@vclxqz7",
        },
    },
    {
        "name": "GrimDeath",
        "title": "Co-Founder & COO",
        "bio": "Esports industry veteran with expertise in team management and business development. Passionate about creating sustainable careers for players and building lasting community connections.",
        "image": "assets/owners/grim-reaper-head-illustration-with-combination-of-crossed-scythe-and-blood-grunge-background-vector.jpg",
        "socials": {
            "twitter": "#",
            "discord": "#",
            "tiktok": "#",
        },
    },
    {
        "name": "James",
        "title": "Owner",
        "bio": "Passionate about creating sustainable careers for players and building lasting community connections.",
        "image": "assets/owners/blank.png",
        "socials": {
            "twitter": "#",
            "discord": "#",
            "tiktok": "#",
        },
    },
]


def hash_password(password: str) -> str:
    salted = (PASSWORD_PEPPER + password).encode("utf-8")
    return hashlib.pbkdf2_hmac("sha256", salted, b"soulreapers", 100_000).hex()


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with closing(get_db_connection()) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                subject TEXT,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'coach',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT NOT NULL UNIQUE,
                expires_at TEXT NOT NULL,
                mfa_verified INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
            """
        )
        session_columns = {row["name"] for row in conn.execute("PRAGMA table_info(sessions)").fetchall()}
        if "mfa_verified" not in session_columns:
            conn.execute("ALTER TABLE sessions ADD COLUMN mfa_verified INTEGER NOT NULL DEFAULT 0")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS email_login_challenges (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                code_hash TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0,
                remember_me INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS schedule_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                player TEXT NOT NULL,
                category TEXT NOT NULL,
                team TEXT NOT NULL,
                event_date TEXT NOT NULL,
                event_time TEXT NOT NULL,
                location TEXT NOT NULL,
                notes TEXT,
                created_by INTEGER,
                FOREIGN KEY(created_by) REFERENCES users(id)
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS roster_players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                real_name TEXT NOT NULL DEFAULT '',
                role TEXT NOT NULL,
                team TEXT NOT NULL,
                image TEXT NOT NULL DEFAULT '',
                discord_name TEXT NOT NULL DEFAULT '',
                order_index INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        roster_columns = {row["name"] for row in conn.execute("PRAGMA table_info(roster_players)").fetchall()}
        if "discord_name" not in roster_columns:
            conn.execute("ALTER TABLE roster_players ADD COLUMN discord_name TEXT NOT NULL DEFAULT ''")
        conn.execute(
            "CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)"
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS team_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                kind TEXT NOT NULL CHECK(kind IN ('staff', 'owner')),
                name TEXT NOT NULL,
                title TEXT NOT NULL DEFAULT '',
                contact TEXT NOT NULL DEFAULT '',
                bio TEXT NOT NULL DEFAULT '',
                image TEXT NOT NULL DEFAULT '',
                socials TEXT NOT NULL DEFAULT '{}',
                order_index INTEGER NOT NULL DEFAULT 0
            )
            """
        )

        roster_total = conn.execute("SELECT COUNT(*) FROM roster_players").fetchone()[0]
        if roster_total == 0:
            conn.executemany(
                "INSERT INTO roster_players (name, real_name, role, team, image, order_index) VALUES (?, ?, ?, ?, ?, ?)",
                [
                    (player["name"], player["real_name"], player["role"], player["team"], player["image"], index)
                    for index, player in enumerate(ROSTER_SEED_DATA)
                ],
            )

        roster_rows = conn.execute("SELECT id, image FROM roster_players WHERE image != ''").fetchall()
        for roster_row in roster_rows:
            image = roster_row["image"]
            if not image.startswith("https://") and not (BASE_DIR / image.lstrip("/")).is_file():
                conn.execute(
                    "UPDATE roster_players SET image = ? WHERE id = ?",
                    ("assets/SREtp - Copy.png", roster_row["id"]),
                )
        conn.execute(
            "UPDATE roster_players SET team = ? WHERE team = ?",
            ("Academy Roster Subs", "Acad Roster subs"),
        )

        for key, value in SITE_CONTENT_DEFAULTS.items():
            conn.execute(
                "INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)",
                (key, value),
            )

        if conn.execute("SELECT COUNT(*) FROM team_members").fetchone()[0] == 0:
            member_seed = []
            for index, person in enumerate(STAFF_DATA):
                member_seed.append((
                    "staff", person["name"], person["role"], person.get("discord", ""), "",
                    person["image"], json.dumps(person.get("socials", {})), index,
                ))
            for index, person in enumerate(OWNER_DATA):
                member_seed.append((
                    "owner", person["name"], person["title"], "", person["bio"],
                    person["image"], json.dumps(person.get("socials", {})), index,
                ))
            conn.executemany(
                "INSERT INTO team_members (kind, name, title, contact, bio, image, socials, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                member_seed,
            )

        admin_total = conn.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'").fetchone()[0]
        if admin_total == 0:
            conn.execute(
                "INSERT OR IGNORE INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
                ("sreadmin", "admin@soulreapers.gg", hash_password("Admin123!"), "admin"),
            )

        conn.commit()


class ContactMessage(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=5, max_length=255)
    subject: Optional[str] = Field(default=None, max_length=150)
    message: str = Field(..., min_length=10, max_length=2000)


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)


class UserRoleUpdate(BaseModel):
    role: str = Field(..., min_length=1, max_length=20)


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    remember_me: bool = False


class VerifyEmailCodeRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, pattern="^[0-9]{6}$")


class ScheduleEvent(BaseModel):
    id: Optional[int] = None
    title: str = Field(..., min_length=3, max_length=200)
    player: str = Field(..., min_length=2, max_length=200)
    category: str = Field(..., min_length=2, max_length=50)
    team: str = Field(..., min_length=2, max_length=80)
    date: str = Field(..., alias="date")
    time: str = Field(..., alias="time")
    location: str = Field(..., min_length=2, max_length=200)
    notes: Optional[str] = Field(default=None, max_length=500)

    class Config:
        allow_population_by_field_name = True


class RosterPlayer(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    real_name: str = Field(default="", max_length=120)
    role: str = Field(..., min_length=1, max_length=80)
    team: str = Field(..., min_length=1, max_length=100)
    image: str = Field(default="", max_length=500)
    discord_name: str = Field(default="", max_length=100)


class TeamMember(BaseModel):
    kind: str = Field(..., pattern="^(staff|owner)$")
    name: str = Field(..., min_length=1, max_length=100)
    title: str = Field(default="", max_length=120)
    contact: str = Field(default="", max_length=160)
    bio: str = Field(default="", max_length=2000)
    image: str = Field(default="", max_length=500)
    socials: dict[str, str] = Field(default_factory=dict)


class SiteContentUpdate(BaseModel):
    content: dict[str, str]


app = FastAPI(
    title="Soul Reapers Esports Backend",
    description="API for roster, staff, ownership, and contact management for Soul Reapers Esports.",
    version="1.0.0",
)

init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
if GOOGLE_OAUTH_CONFIGURED:
    app.add_middleware(
        SessionMiddleware,
        secret_key=OAUTH_STATE_SECRET,
        same_site="lax",
        https_only=COOKIE_SECURE,
    )


@app.on_event("startup")
def startup_event() -> None:
    init_db()


def get_current_user(request: Request) -> dict[str, Any]:
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required.")

    with closing(get_db_connection()) as conn:
        row = conn.execute(
            """
            SELECT u.id, u.username, u.email, u.role
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token = ? AND s.expires_at > ? AND s.mfa_verified = 1
            """,
            (token, datetime.now(timezone.utc).isoformat()),
        ).fetchone()

    if not row:
        raise HTTPException(status_code=401, detail="Session expired or invalid.")

    return {
        "id": row["id"],
        "username": row["username"],
        "email": row["email"],
        "role": row["role"],
    }


def require_roles(*allowed_roles: str):
    def dependency(request: Request):
        user = get_current_user(request)
        if user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions.")
        return user

    return Depends(dependency)


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "site": SITE_INFO["name"],
        "version": app.version,
        "database": "sqlite",
    }


@app.get("/api/site")
def site() -> dict[str, Any]:
    return {"site": SITE_INFO}


@app.get("/api/rosters")
def get_rosters() -> dict[str, Any]:
    with closing(get_db_connection()) as conn:
        rows = conn.execute(
            "SELECT id, name, real_name, role, team, image, discord_name FROM roster_players ORDER BY order_index, id"
        ).fetchall()
    return {"rosters": [dict(row) for row in rows], "teams": ROSTER_TEAMS}


@app.get("/api/admin/rosters")
def get_admin_rosters(user: dict[str, Any] = require_roles("admin", "owner", "coach")):
    with closing(get_db_connection()) as conn:
        rows = conn.execute(
            "SELECT id, name, real_name, role, team, image, discord_name FROM roster_players ORDER BY team, order_index, id"
        ).fetchall()
    return {"rosters": [dict(row) for row in rows], "viewer": user}


def validate_roster_image(image: str) -> str:
    image = image.strip()
    if not image:
        return ""
    if image.startswith("https://"):
        return image
    if image.startswith("assets/") or image.startswith("/assets/"):
        if ".." not in Path(image).parts:
            return image
    raise HTTPException(status_code=400, detail="Image must be an assets/ path or a secure https:// URL.")


@app.post("/api/admin/rosters", status_code=status.HTTP_201_CREATED)
def create_roster_player(player: RosterPlayer, user: dict[str, Any] = require_roles("admin", "owner", "coach")):
    image = validate_roster_image(player.image)
    with closing(get_db_connection()) as conn:
        next_order = conn.execute("SELECT COALESCE(MAX(order_index), -1) + 1 FROM roster_players").fetchone()[0]
        cursor = conn.execute(
            "INSERT INTO roster_players (name, real_name, role, team, image, discord_name, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (player.name.strip(), player.real_name.strip(), player.role.strip(), player.team.strip(), image, player.discord_name.strip().lstrip("@"), next_order),
        )
        conn.commit()
        player_id = cursor.lastrowid
    return {"message": "Roster player added.", "id": player_id, "viewer": user}


@app.put("/api/admin/rosters/{player_id}")
def update_roster_player(player_id: int, player: RosterPlayer, user: dict[str, Any] = require_roles("admin", "owner", "coach")):
    image = validate_roster_image(player.image)
    with closing(get_db_connection()) as conn:
        updated = conn.execute(
            "UPDATE roster_players SET name = ?, real_name = ?, role = ?, team = ?, image = ?, discord_name = ? WHERE id = ?",
            (player.name.strip(), player.real_name.strip(), player.role.strip(), player.team.strip(), image, player.discord_name.strip().lstrip("@"), player_id),
        ).rowcount
        conn.commit()
    if updated == 0:
        raise HTTPException(status_code=404, detail="Roster player not found.")
    return {"message": "Roster player updated.", "viewer": user}


@app.delete("/api/admin/rosters/{player_id}")
def delete_roster_player(player_id: int, user: dict[str, Any] = require_roles("admin", "owner", "coach")):
    with closing(get_db_connection()) as conn:
        deleted = conn.execute("DELETE FROM roster_players WHERE id = ?", (player_id,)).rowcount
        conn.commit()
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Roster player not found.")
    return {"message": "Roster player deleted.", "viewer": user}


@app.get("/api/staff")
def get_staff() -> dict[str, Any]:
    with closing(get_db_connection()) as conn:
        rows = conn.execute(
            "SELECT id, name, title, contact, image, socials FROM team_members WHERE kind = 'staff' ORDER BY order_index, id"
        ).fetchall()
    return {"staff": [{**dict(row), "role": row["title"], "discord": row["contact"], "socials": json.loads(row["socials"])} for row in rows]}


@app.get("/api/owners")
def get_owners() -> dict[str, Any]:
    with closing(get_db_connection()) as conn:
        rows = conn.execute(
            "SELECT id, name, title, bio, image, socials FROM team_members WHERE kind = 'owner' ORDER BY order_index, id"
        ).fetchall()
    return {"owners": [{**dict(row), "socials": json.loads(row["socials"])} for row in rows]}


@app.get("/api/content")
def get_site_content():
    with closing(get_db_connection()) as conn:
        rows = conn.execute("SELECT key, value FROM site_settings").fetchall()
    return {"content": {row["key"]: row["value"] for row in rows}}


@app.put("/api/admin/content")
def update_site_content(payload: SiteContentUpdate, user: dict[str, Any] = require_roles("admin", "owner")):
    unknown_keys = set(payload.content) - set(SITE_CONTENT_DEFAULTS)
    if unknown_keys:
        raise HTTPException(status_code=400, detail="Unknown site content fields: " + ", ".join(sorted(unknown_keys)))
    with closing(get_db_connection()) as conn:
        for key, value in payload.content.items():
            conn.execute(
                "INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
                (key, value.strip()),
            )
        conn.commit()
    return {"message": "Site content saved.", "viewer": user}


def serialize_team_member(row: sqlite3.Row) -> dict[str, Any]:
    item = dict(row)
    item["socials"] = json.loads(item["socials"] or "{}")
    return item


@app.get("/api/admin/team-members")
def list_team_members(user: dict[str, Any] = require_roles("admin", "owner")):
    with closing(get_db_connection()) as conn:
        rows = conn.execute("SELECT * FROM team_members ORDER BY kind, order_index, id").fetchall()
    return {"members": [serialize_team_member(row) for row in rows], "viewer": user}


def validate_social_links(socials: dict[str, str]) -> str:
    for value in socials.values():
        if value and value != "#" and not value.startswith(("https://", "mailto:")):
            raise HTTPException(status_code=400, detail="Social links must use https:// or mailto:.")
    return json.dumps(socials)


@app.post("/api/admin/team-members", status_code=status.HTTP_201_CREATED)
def create_team_member(member: TeamMember, user: dict[str, Any] = require_roles("admin", "owner")):
    image = validate_roster_image(member.image)
    socials = validate_social_links(member.socials)
    with closing(get_db_connection()) as conn:
        order_index = conn.execute("SELECT COALESCE(MAX(order_index), -1) + 1 FROM team_members WHERE kind = ?", (member.kind,)).fetchone()[0]
        cursor = conn.execute(
            "INSERT INTO team_members (kind, name, title, contact, bio, image, socials, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (member.kind, member.name.strip(), member.title.strip(), member.contact.strip(), member.bio.strip(), image, socials, order_index),
        )
        conn.commit()
    return {"message": "Team profile added.", "id": cursor.lastrowid, "viewer": user}


@app.put("/api/admin/team-members/{member_id}")
def update_team_member(member_id: int, member: TeamMember, user: dict[str, Any] = require_roles("admin", "owner")):
    image = validate_roster_image(member.image)
    socials = validate_social_links(member.socials)
    with closing(get_db_connection()) as conn:
        updated = conn.execute(
            "UPDATE team_members SET kind = ?, name = ?, title = ?, contact = ?, bio = ?, image = ?, socials = ? WHERE id = ?",
            (member.kind, member.name.strip(), member.title.strip(), member.contact.strip(), member.bio.strip(), image, socials, member_id),
        ).rowcount
        conn.commit()
    if not updated:
        raise HTTPException(status_code=404, detail="Team profile not found.")
    return {"message": "Team profile updated.", "viewer": user}


@app.delete("/api/admin/team-members/{member_id}")
def delete_team_member(member_id: int, user: dict[str, Any] = require_roles("admin", "owner")):
    with closing(get_db_connection()) as conn:
        deleted = conn.execute("DELETE FROM team_members WHERE id = ?", (member_id,)).rowcount
        conn.commit()
    if not deleted:
        raise HTTPException(status_code=404, detail="Team profile not found.")
    return {"message": "Team profile deleted.", "viewer": user}


@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest):
    username = payload.username.strip()
    email = payload.email.strip().lower()
    password = payload.password.strip()

    if len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters.")
    if "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Email must be valid.")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    with closing(get_db_connection()) as conn:
        existing = conn.execute(
            "SELECT id FROM users WHERE username = ? OR email = ?",
            (username, email),
        ).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="Username or email already exists.")

        role = "viewer"

        cursor = conn.execute(
            "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
            (username, email, hash_password(password), role),
        )
        conn.commit()
        user_id = cursor.lastrowid

    return {
        "message": "Account created. Sign in to verify your email and continue.",
        "user": {"id": user_id, "username": username, "email": email, "role": role},
    }


@app.post("/api/auth/login")
def login_user(payload: LoginRequest, request: Request, response: Response):
    email = payload.email.strip().lower()
    password = payload.password.strip()

    with closing(get_db_connection()) as conn:
        row = conn.execute(
            "SELECT id, username, email, password_hash, role FROM users WHERE email = ?",
            (email,),
        ).fetchone()

    if not row or row["password_hash"] != hash_password(password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    user = {
        "id": row["id"],
        "username": row["username"],
        "email": row["email"],
        "role": row["role"],
    }
    if SKIP_EMAIL_VERIFICATION:
        return create_auth_session(response, user, remember_me=payload.remember_me)
    return begin_email_login_challenge(response, user, payload.remember_me, request)


def send_login_verification_email(email: str, code: str) -> None:
    if CONSOLE_EMAIL_ALLOWED:
        print(f"[DEV ONLY] Email verification code for {email}: {code}", flush=True)
        return
    if not EMAIL_VERIFICATION_CONFIGURED:
        raise RuntimeError("Email verification is not configured on this server.")

    message = EmailMessage()
    message["Subject"] = "Your Soul Reapers sign-in code"
    message["From"] = SMTP_FROM_EMAIL
    message["To"] = email
    message.set_content(
        f"Your Soul Reapers Esports verification code is {code}.\n\n"
        f"It expires in {EMAIL_CODE_TTL_SECONDS // 60} minutes. If you did not try to sign in, you can ignore this email."
    )

    smtp_class = smtplib.SMTP_SSL if SMTP_PORT == 465 else smtplib.SMTP
    with smtp_class(SMTP_HOST, SMTP_PORT, timeout=15) as smtp:
        smtp.ehlo()
        if SMTP_PORT != 465 and os.getenv("SMTP_STARTTLS", "1").lower() not in {"0", "false", "no"}:
            smtp.starttls()
            smtp.ehlo()
        if SMTP_USERNAME:
            smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
        smtp.send_message(message)


def _email_code_hash(challenge_id: str, code: str) -> str:
    return hmac.new(
        PASSWORD_PEPPER.encode("utf-8"),
        f"{challenge_id}:{code}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def begin_email_login_challenge(response: Response, user: dict[str, Any], remember_me: bool, request: Request) -> dict[str, Any]:
    if CONSOLE_EMAIL_ALLOWED and (not request.client or request.client.host not in {"127.0.0.1", "::1", "testclient"}):
        raise HTTPException(status_code=503, detail="Console email verification is limited to local development requests.")
    if not EMAIL_VERIFICATION_CONFIGURED:
        raise HTTPException(
            status_code=503,
            detail="Email verification is not configured. Set SMTP_HOST and SMTP_FROM_EMAIL to enable sign-in.",
        )

    challenge_id = secrets.token_urlsafe(32)
    code = f"{secrets.randbelow(1_000_000):06d}"
    expires_at = (datetime.now(timezone.utc) + timedelta(seconds=EMAIL_CODE_TTL_SECONDS)).isoformat()
    with closing(get_db_connection()) as conn:
        conn.execute("DELETE FROM email_login_challenges WHERE user_id = ? OR expires_at <= ?", (user["id"], datetime.now(timezone.utc).isoformat()))
        conn.execute(
            "INSERT INTO email_login_challenges (id, user_id, code_hash, expires_at, remember_me) VALUES (?, ?, ?, ?, ?)",
            (challenge_id, user["id"], _email_code_hash(challenge_id, code), expires_at, int(remember_me)),
        )
        conn.commit()

    try:
        send_login_verification_email(user["email"], code)
    except Exception as error:
        with closing(get_db_connection()) as conn:
            conn.execute("DELETE FROM email_login_challenges WHERE id = ?", (challenge_id,))
            conn.commit()
        if isinstance(error, RuntimeError):
            raise HTTPException(status_code=503, detail=str(error)) from error
        raise HTTPException(status_code=503, detail="Could not send the verification email. Check the email server settings and try again.") from error

    response.set_cookie(
        key=PENDING_AUTH_COOKIE_NAME,
        value=challenge_id,
        max_age=EMAIL_CODE_TTL_SECONDS,
        httponly=True,
        samesite="lax",
        secure=COOKIE_SECURE,
        path="/",
    )
    return {"message": "Verification code sent to your email.", "verification_required": True}


def create_auth_session(response: Response, user: dict[str, Any], remember_me: bool = False) -> dict[str, Any]:
    token = secrets.token_urlsafe(32)
    ttl = REMEMBER_SESSION_TTL_SECONDS if remember_me else SESSION_TTL_SECONDS
    expires_at = (datetime.now(timezone.utc) + timedelta(seconds=ttl)).isoformat()

    with closing(get_db_connection()) as conn:
        conn.execute(
            "INSERT INTO sessions (user_id, token, expires_at, mfa_verified) VALUES (?, ?, ?, 1)",
            (user["id"], token, expires_at),
        )
        conn.commit()

    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=ttl if remember_me else None,
        secure=COOKIE_SECURE,
        path="/",
    )
    response.delete_cookie(key=PENDING_AUTH_COOKIE_NAME, path="/", secure=COOKIE_SECURE, httponly=True, samesite="lax")

    return {
        "message": "Authentication successful.",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
        },
    }


@app.post("/api/auth/verify-email")
def verify_email_login(payload: VerifyEmailCodeRequest, request: Request, response: Response):
    challenge_id = request.cookies.get(PENDING_AUTH_COOKIE_NAME)
    if not challenge_id:
        raise HTTPException(status_code=401, detail="Sign-in expired. Enter your password again.")

    now = datetime.now(timezone.utc).isoformat()
    with closing(get_db_connection()) as conn:
        row = conn.execute(
            """
            SELECT c.user_id, c.code_hash, c.expires_at, c.attempts, c.remember_me,
                   u.username, u.email, u.role
            FROM email_login_challenges c
            JOIN users u ON u.id = c.user_id
            WHERE c.id = ?
            """,
            (challenge_id,),
        ).fetchone()
        if not row or row["expires_at"] <= now:
            conn.execute("DELETE FROM email_login_challenges WHERE id = ?", (challenge_id,))
            conn.commit()
            response.delete_cookie(key=PENDING_AUTH_COOKIE_NAME, path="/", secure=COOKIE_SECURE, httponly=True, samesite="lax")
            raise HTTPException(status_code=401, detail="Verification code expired. Sign in again.")
        if row["attempts"] >= EMAIL_CODE_MAX_ATTEMPTS:
            conn.execute("DELETE FROM email_login_challenges WHERE id = ?", (challenge_id,))
            conn.commit()
            response.delete_cookie(key=PENDING_AUTH_COOKIE_NAME, path="/", secure=COOKIE_SECURE, httponly=True, samesite="lax")
            raise HTTPException(status_code=429, detail="Too many incorrect codes. Sign in again to get a new code.")

        if not hmac.compare_digest(row["code_hash"], _email_code_hash(challenge_id, payload.code)):
            attempts = row["attempts"] + 1
            conn.execute("UPDATE email_login_challenges SET attempts = ? WHERE id = ?", (attempts, challenge_id))
            if attempts >= EMAIL_CODE_MAX_ATTEMPTS:
                conn.execute("DELETE FROM email_login_challenges WHERE id = ?", (challenge_id,))
            conn.commit()
            if attempts >= EMAIL_CODE_MAX_ATTEMPTS:
                response.delete_cookie(key=PENDING_AUTH_COOKIE_NAME, path="/", secure=COOKIE_SECURE, httponly=True, samesite="lax")
                raise HTTPException(status_code=429, detail="Too many incorrect codes. Sign in again to get a new code.")
            raise HTTPException(status_code=401, detail="Incorrect verification code.")

        conn.execute("DELETE FROM email_login_challenges WHERE id = ?", (challenge_id,))
        conn.commit()

    user = {"id": row["user_id"], "username": row["username"], "email": row["email"], "role": row["role"]}
    return create_auth_session(response, user, remember_me=bool(row["remember_me"]))


@app.post("/api/auth/cancel-email-verification")
def cancel_email_verification(request: Request, response: Response):
    challenge_id = request.cookies.get(PENDING_AUTH_COOKIE_NAME)
    if challenge_id:
        with closing(get_db_connection()) as conn:
            conn.execute("DELETE FROM email_login_challenges WHERE id = ?", (challenge_id,))
            conn.commit()
    response.delete_cookie(key=PENDING_AUTH_COOKIE_NAME, path="/", secure=COOKIE_SECURE, httponly=True, samesite="lax")
    return {"message": "Verification cancelled."}


@app.get("/api/auth/providers")
def auth_providers():
    return {
        "google_enabled": GOOGLE_OAUTH_CONFIGURED,
        "email_verification_enabled": EMAIL_VERIFICATION_CONFIGURED,
        "email_mode": "disabled" if SKIP_EMAIL_VERIFICATION else "console" if CONSOLE_EMAIL_ALLOWED else "smtp" if SMTP_HOST and SMTP_FROM_EMAIL else "unconfigured",
    }


@app.get("/auth/google/login")
async def google_login(request: Request, remember_me: bool = False):
    if not GOOGLE_OAUTH_CONFIGURED:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured on this server.")
    request.session["remember_me"] = remember_me
    redirect_uri = request.url_for("google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/auth/google/callback", name="google_callback")
async def google_callback(request: Request):
    if not GOOGLE_OAUTH_CONFIGURED:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured on this server.")
    try:
        token = await oauth.google.authorize_access_token(request)
        profile = token.get("userinfo") or await oauth.google.userinfo(token=token)
    except Exception as error:
        raise HTTPException(status_code=401, detail="Google sign-in could not be completed.") from error

    email = str(profile.get("email", "")).strip().lower()
    if not email or profile.get("email_verified") is not True:
        raise HTTPException(status_code=403, detail="Google must confirm this email address before it can be used.")

    with closing(get_db_connection()) as conn:
        row = conn.execute("SELECT id, username, email, role FROM users WHERE email = ?", (email,)).fetchone()
        if not row:
            base_name = re.sub(r"[^A-Za-z0-9_.-]", "", email.split("@", 1)[0])[:24] or "googleuser"
            username = base_name
            while conn.execute("SELECT 1 FROM users WHERE username = ?", (username,)).fetchone():
                username = f"{base_name[:19]}{secrets.token_hex(2)}"
            cursor = conn.execute(
                "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, 'viewer')",
                (username, email, hash_password(secrets.token_urlsafe(32))),
            )
            conn.commit()
            row = {"id": cursor.lastrowid, "username": username, "email": email, "role": "viewer"}

    user = {"id": row["id"], "username": row["username"], "email": row["email"], "role": row["role"]}
    remember_me = bool(request.session.pop("remember_me", False))
    response = RedirectResponse(url="/login?verify=email", status_code=303)
    begin_email_login_challenge(response, user, remember_me, request)
    return response


@app.get("/api/auth/me")
def current_user(request: Request):
    user = get_current_user(request)
    return {"user": user}


@app.post("/api/auth/logout")
def logout_user(request: Request, response: Response):
    token = request.cookies.get(SESSION_COOKIE_NAME)
    pending_challenge = request.cookies.get(PENDING_AUTH_COOKIE_NAME)
    with closing(get_db_connection()) as conn:
        if token:
            conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        if pending_challenge:
            conn.execute("DELETE FROM email_login_challenges WHERE id = ?", (pending_challenge,))
        conn.commit()
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/", secure=COOKIE_SECURE, httponly=True, samesite="lax")
    response.delete_cookie(key=PENDING_AUTH_COOKIE_NAME, path="/", secure=COOKIE_SECURE, httponly=True, samesite="lax")
    return {"message": "Logged out successfully."}


@app.post("/api/contact", status_code=status.HTTP_201_CREATED)
def submit_contact(payload: ContactMessage) -> dict[str, Any]:
    email = payload.email.strip()
    if "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Email must be a valid address.")

    with closing(get_db_connection()) as conn:
        cursor = conn.execute(
            "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
            (
                payload.name.strip(),
                email,
                (payload.subject or "General inquiry").strip(),
                payload.message.strip(),
            ),
        )
        conn.commit()
        contact_id = cursor.lastrowid

    return {
        "message": "Contact message received.",
        "id": contact_id,
    }


@app.get("/api/admin/contact-messages")
def list_contact_messages(
    user: dict[str, Any] = require_roles("admin", "owner"),
    x_admin_key: Optional[str] = None,
) -> dict[str, Any]:
    if x_admin_key is not None and x_admin_key == os.getenv("ADMIN_API_KEY", "change-me"):
        pass

    with closing(get_db_connection()) as conn:
        rows = conn.execute(
            "SELECT id, name, email, subject, message, created_at FROM contact_messages ORDER BY id DESC"
        ).fetchall()

    return {"messages": [dict(row) for row in rows], "viewer": user}


@app.get("/api/schedule")
def get_public_schedule():
    with closing(get_db_connection()) as conn:
        rows = conn.execute(
            """
            SELECT id, title, player, category, team, event_date as date, event_time as time,
                   location, notes
            FROM schedule_events
            ORDER BY event_date ASC, event_time ASC
            """
        ).fetchall()
    return {"events": [dict(row) for row in rows]}


@app.get("/api/admin/schedule")
def get_schedule(user: dict[str, Any] = require_roles("admin", "owner", "coach")):
    with closing(get_db_connection()) as conn:
        rows = conn.execute(
            """
            SELECT id, title, player, category, team, event_date as date, event_time as time,
                   location, notes
            FROM schedule_events
            ORDER BY event_date ASC, event_time ASC
            """
        ).fetchall()
    return {"events": [dict(row) for row in rows], "viewer": user}


@app.post("/api/admin/schedule")
def create_schedule_event(event: ScheduleEvent, user: dict[str, Any] = require_roles("admin", "owner", "coach")):
    with closing(get_db_connection()) as conn:
        cursor = conn.execute(
            """
            INSERT INTO schedule_events (title, player, category, team, event_date, event_time, location, notes, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event.title.strip(),
                event.player.strip(),
                event.category.strip(),
                event.team.strip(),
                event.date,
                event.time,
                event.location.strip(),
                event.notes.strip() if event.notes else None,
                user["id"],
            ),
        )
        conn.commit()
        event_id = cursor.lastrowid

    return {"message": "Event saved successfully.", "id": event_id, "viewer": user}


@app.put("/api/admin/schedule/{event_id}")
def update_schedule_event(event_id: int, event: ScheduleEvent, user: dict[str, Any] = require_roles("admin", "owner", "coach")):
    with closing(get_db_connection()) as conn:
        updated = conn.execute(
            """
            UPDATE schedule_events
            SET title = ?, player = ?, category = ?, team = ?, event_date = ?, event_time = ?, location = ?, notes = ?
            WHERE id = ?
            """,
            (event.title.strip(), event.player.strip(), event.category.strip(), event.team.strip(), event.date,
             event.time, event.location.strip(), event.notes.strip() if event.notes else None, event_id),
        ).rowcount
        conn.commit()
    if not updated:
        raise HTTPException(status_code=404, detail="Event not found.")
    return {"message": "Event updated successfully.", "id": event_id, "viewer": user}


@app.delete("/api/admin/schedule/{event_id}")
def delete_schedule_event(event_id: int, user: dict[str, Any] = require_roles("admin", "owner", "coach")):
    with closing(get_db_connection()) as conn:
        deleted = conn.execute("DELETE FROM schedule_events WHERE id = ?", (event_id,)).rowcount
        conn.commit()
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Event not found.")
    return {"message": "Event deleted successfully.", "viewer": user}


@app.get("/api/admin/users")
def list_users(user: dict[str, Any] = require_roles("owner")):
    with closing(get_db_connection()) as conn:
        rows = conn.execute(
            "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC"
        ).fetchall()
    return {"users": [dict(row) for row in rows], "viewer": user}


@app.patch("/api/admin/users/{user_id}/role")
def update_user_role(user_id: int, payload: UserRoleUpdate, user: dict[str, Any] = require_roles("owner")):
    role = payload.role.strip().lower()
    if role not in {"viewer", "coach", "admin"}:
        raise HTTPException(status_code=400, detail="Role must be viewer, coach, or admin.")
    with closing(get_db_connection()) as conn:
        target = conn.execute("SELECT id, role FROM users WHERE id = ?", (user_id,)).fetchone()
        if not target:
            raise HTTPException(status_code=404, detail="User not found.")
        if target["role"] == "owner" or target["id"] == user["id"]:
            raise HTTPException(status_code=400, detail="Owner accounts and your own account cannot be changed here.")
        conn.execute("UPDATE users SET role = ? WHERE id = ?", (role, user_id))
        conn.commit()
    return {"message": f"User role updated to {role}.", "viewer": user}


@app.get("/")
def home() -> FileResponse:
    return FileResponse(BASE_DIR / "index.html")


@app.get("/index.html")
def index_html() -> FileResponse:
    return FileResponse(BASE_DIR / "index.html")


@app.get("/login")
def login_page() -> FileResponse:
    return FileResponse(BASE_DIR / "login.html")


@app.get("/register")
def register_page() -> FileResponse:
    return FileResponse(BASE_DIR / "register.html")


@app.get("/admin")
def admin_page(user: dict[str, Any] = require_roles("admin", "owner")) -> FileResponse:
    return FileResponse(BASE_DIR / "admin.html")


@app.get("/admin.html")
def admin_html_page(user: dict[str, Any] = require_roles("admin", "owner")) -> FileResponse:
    return FileResponse(BASE_DIR / "admin.html")


@app.get("/owner")
def owner_page(user: dict[str, Any] = require_roles("owner")) -> FileResponse:
    return FileResponse(BASE_DIR / "admin.html")


@app.get("/owner.html")
def owner_html_page(user: dict[str, Any] = require_roles("owner")) -> FileResponse:
    return FileResponse(BASE_DIR / "admin.html")


@app.get("/coach")
def coach_page(user: dict[str, Any] = require_roles("coach", "owner")) -> FileResponse:
    return FileResponse(BASE_DIR / "coach.html")


@app.get("/coach.html")
def coach_html_page(user: dict[str, Any] = require_roles("coach", "owner")) -> FileResponse:
    return FileResponse(BASE_DIR / "coach.html")


@app.get("/schedule")
def schedule_page() -> FileResponse:
    return FileResponse(BASE_DIR / "schedule.html")


@app.get("/{path_name:path}")
def static_file(path_name: str) -> FileResponse:
    requested_path = (BASE_DIR / path_name).resolve()
    if not requested_path.is_file():
        raise HTTPException(status_code=404, detail="Page not found.")
    if BASE_DIR not in requested_path.parents and requested_path != BASE_DIR:
        raise HTTPException(status_code=403, detail="Access denied.")
    return FileResponse(requested_path)


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)
