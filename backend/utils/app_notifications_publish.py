"""Persist an in-app bell notification + optional email/SMS (shared by internal key + Firebase admin routes)."""

from __future__ import annotations

from typing import Optional

from fastapi import HTTPException, status
from pydantic import BaseModel, Field
from firebase_admin import firestore as fa_firestore

from utils.alert_delivery import notify_important_channels
from utils.firestore_admin import get_firestore


class CreateAppNotificationBody(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=4000)
    type: str = Field(default="announcement", max_length=50)
    target: Optional[str] = Field(default=None, max_length=500)
    scroll_to_id: Optional[str] = Field(default=None, max_length=200)
    published: bool = True
    important: bool = False
    notify_email: bool = True
    notify_sms: bool = True


def publish_app_notification(body: CreateAppNotificationBody) -> str:
    try:
        db = get_firestore()
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        ) from e

    doc = {
        "title": body.title,
        "message": body.message,
        "type": body.type,
        "published": body.published,
        "createdAt": fa_firestore.SERVER_TIMESTAMP,
    }
    if body.target is not None:
        doc["target"] = body.target
    if body.scroll_to_id is not None:
        doc["scrollToId"] = body.scroll_to_id
    doc["important"] = body.important

    _, ref = db.collection("notifications").add(doc)

    plain = f"{body.title}\n\n{body.message}"
    if body.target:
        plain += f"\n\nLink hint: {body.target}"

    if body.important and body.published:
        notify_important_channels(
            subject=f"[FOG Important] {body.title}",
            plain_text=plain,
            notify_email=body.notify_email,
            notify_sms=body.notify_sms,
        )

    return ref.id
