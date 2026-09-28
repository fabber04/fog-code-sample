"""Admin APIs authenticated with Firebase ID token + Firestore role (no separate admin SPA required)."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from utils.app_notifications_publish import CreateAppNotificationBody, publish_app_notification
from utils.firebase_admin_auth import require_firebase_admin_uid
from utils.firestore_admin import get_firestore
from utils.user_sync import upsert_user_from_profile

router = APIRouter()


@router.post("/notifications")
def admin_create_notification(
    body: CreateAppNotificationBody,
    _admin_uid: str = Depends(require_firebase_admin_uid),
):
    nid = publish_app_notification(body)
    return {"ok": True, "id": nid}


@router.post("/users/backfill-firestore")
def backfill_users_from_firestore(
    _admin_uid: str = Depends(require_firebase_admin_uid),
    db: Session = Depends(get_db),
):
    """Copy all Firestore users/* docs into PostgreSQL (one-time recovery / sync)."""
    fs = get_firestore()
    created = 0
    updated = 0

    for doc in fs.collection("users").stream():
        data = doc.to_dict() or {}
        uid = doc.id
        existed = db.query(User).filter(User.firebase_uid == uid).first() is not None
        upsert_user_from_profile(
            db,
            firebase_uid=uid,
            email=data.get("email"),
            full_name=data.get("name") or data.get("full_name"),
            phone=data.get("phone"),
            location=data.get("location"),
            grade=data.get("grade"),
            role=data.get("role"),
        )
        if existed:
            updated += 1
        else:
            created += 1

    return {
        "ok": True,
        "created": created,
        "updated": updated,
        "total": created + updated,
    }
