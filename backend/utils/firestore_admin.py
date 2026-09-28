"""Lazy Firebase Admin + Firestore client for server-side writes (e.g. notifications)."""

from __future__ import annotations

import json
import os

_db = None


def get_firestore():
    """Return Firestore client. Raises if Firebase is not configured."""
    global _db
    if _db is not None:
        return _db

    json_str = (os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON") or "").strip()
    cred_path = (os.getenv("GOOGLE_APPLICATION_CREDENTIALS") or "").strip()

    if not json_str and not cred_path:
        raise RuntimeError(
            "Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON "
            "or GOOGLE_APPLICATION_CREDENTIALS."
        )

    import firebase_admin
    from firebase_admin import credentials
    from firebase_admin import firestore as fa_firestore

    cred = credentials.Certificate(json.loads(json_str) if json_str else cred_path)

    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app(cred)

    _db = fa_firestore.client()
    return _db
