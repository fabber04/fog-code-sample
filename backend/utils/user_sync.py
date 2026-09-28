"""Sync Firebase / Firestore member profiles into PostgreSQL users table."""

from __future__ import annotations

import re
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from models import User


def _username_from_email(email: str) -> str:
    base = re.sub(r"[^a-zA-Z0-9_]", "", (email or "").split("@")[0]) or "user"
    return base[:40]


def _unique_username(db: Session, base: str, uid: str) -> str:
    if not db.query(User).filter(User.username == base).first():
        return base
    candidate = f"{base}_{uid[:8]}"[:50]
    if not db.query(User).filter(User.username == candidate).first():
        return candidate
    n = 1
    while n < 1000:
        candidate = f"{base}_{n}"[:50]
        if not db.query(User).filter(User.username == candidate).first():
            return candidate
        n += 1
    return f"user_{uid[:12]}"


def upsert_user_from_profile(
    db: Session,
    *,
    firebase_uid: str,
    email: Optional[str] = None,
    full_name: Optional[str] = None,
    phone: Optional[str] = None,
    location: Optional[str] = None,
    grade: Optional[str] = None,
    role: Optional[str] = None,
) -> User:
    """Create or update a PostgreSQL user row linked to a Firebase uid."""
    uid = (firebase_uid or "").strip()
    if not uid:
        raise ValueError("firebase_uid is required")

    normalized_email = (email or "").strip().lower() or None
    user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user and normalized_email:
        user = db.query(User).filter(User.email == normalized_email).first()

    role_lower = (role or "member").lower()
    is_admin = role_lower == "admin"
    display_role = "Admin" if is_admin else (role or "Member").capitalize()

    if user:
        user.firebase_uid = uid
        if normalized_email:
            user.email = normalized_email
        if full_name:
            user.full_name = full_name
        if phone is not None:
            user.phone = phone or None
        if location is not None:
            user.location = location or None
        if grade is not None:
            user.grade = grade or None
        user.role = display_role
        user.is_admin = is_admin
        user.is_active = True
        user.updated_at = datetime.utcnow()
    else:
        email_value = normalized_email or f"{uid}@members.fog.local"
        username = _unique_username(db, _username_from_email(email_value), uid)
        user = User(
            firebase_uid=uid,
            email=email_value,
            username=username,
            full_name=(full_name or username).strip(),
            hashed_password=None,
            phone=phone or None,
            location=location or None,
            grade=grade or None,
            role=display_role,
            is_admin=is_admin,
            is_active=True,
        )
        db.add(user)

    db.commit()
    db.refresh(user)
    return user
