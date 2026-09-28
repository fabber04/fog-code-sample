"""Internal endpoints (scripts / cron): create in-app notifications + optional email/SMS via shared secret."""

from __future__ import annotations

import os
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status

from utils.app_notifications_publish import CreateAppNotificationBody, publish_app_notification

router = APIRouter()


async def verify_internal_secret(
    x_fog_internal_key: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
) -> None:
    expected = (os.getenv("ALERTS_INTERNAL_SECRET") or "").strip()
    if not expected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ALERTS_INTERNAL_SECRET is not configured on the server.",
        )

    provided = None
    if x_fog_internal_key:
        provided = x_fog_internal_key.strip()
    elif authorization and authorization.lower().startswith("bearer "):
        provided = authorization[7:].strip()

    if not provided or provided != expected:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid internal key")


@router.post("/notifications", summary="Create app notification (Firestore) + optional email/SMS")
def create_notification(
    body: CreateAppNotificationBody,
    _: None = Depends(verify_internal_secret),
):
    nid = publish_app_notification(body)
    return {"ok": True, "id": nid}
