"""Verify Firebase ID tokens and enforce Firestore role == admin for server APIs."""

from __future__ import annotations

import os
from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

import firebase_admin.auth as fa_auth

from database import get_db
from models import User
from utils.auth import verify_token
from utils.firestore_admin import get_firestore


def _bearer(raw: Optional[str]) -> Optional[str]:
    if not raw or not raw.lower().startswith("bearer "):
        return None
    return raw[7:].strip() or None


def _firebase_configured() -> bool:
    return bool(
        (os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON") or "").strip()
        or (os.getenv("GOOGLE_APPLICATION_CREDENTIALS") or "").strip()
    )


def _verify_firebase_admin_token(token: str) -> str:
    """Return Firebase uid when token is valid and Firestore user.role == admin."""
    try:
        get_firestore()
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase Admin is not configured on the server.",
        ) from None

    try:
        decoded = fa_auth.verify_id_token(token, check_revoked=True)
        uid = decoded.get("uid")
        if not uid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase token",
        ) from None

    try:
        db = get_firestore()
        snap = db.collection("users").document(uid).get()
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase Admin / Firestore is not configured on the server.",
        ) from None

    if not snap.exists:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User profile not found in Firestore",
        )

    data = snap.to_dict() or {}
    if data.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required",
        )

    return uid


def verify_firebase_id_token(token: str) -> dict:
    """Verify a Firebase ID token and return decoded claims (any signed-in user)."""
    if not _firebase_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase Admin is not configured on the server.",
        )
    try:
        get_firestore()
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase Admin is not configured on the server.",
        ) from None

    try:
        decoded = fa_auth.verify_id_token(token, check_revoked=True)
        if not decoded.get("uid"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )
        return decoded
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase token",
        ) from None


def require_firebase_user(authorization: Optional[str] = Header(None)) -> dict:
    """Depends: any valid Firebase ID token."""
    token = _bearer(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    return verify_firebase_id_token(token)


def require_firebase_admin_uid(authorization: Optional[str] = Header(None)) -> str:
    """Depends: Authorization: Bearer <Firebase ID token>; user doc must have role admin."""
    token = _bearer(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    return _verify_firebase_admin_token(token)


def require_podcast_admin(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> str:
    """Accept Firebase admin tokens (preferred) or legacy backend JWT admin tokens."""
    token = _bearer(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    firebase_error: Optional[HTTPException] = None
    if _firebase_configured():
        try:
            return _verify_firebase_admin_token(token)
        except HTTPException as exc:
            if exc.status_code == status.HTTP_403_FORBIDDEN:
                raise
            firebase_error = exc

    try:
        token_data = verify_token(token)
        user = db.query(User).filter(User.username == token_data.username).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user",
            )
        if not user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )
        return f"legacy:{user.id}"
    except HTTPException as exc:
        if exc.status_code in (
            status.HTTP_403_FORBIDDEN,
            status.HTTP_400_BAD_REQUEST,
        ):
            raise
        if firebase_error:
            raise firebase_error
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired credentials. Sign in with your admin account and try again.",
        ) from None
