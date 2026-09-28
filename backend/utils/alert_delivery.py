"""Email (SendGrid) and SMS (Twilio) delivery for critical alerts (blocking httpx calls)."""

from __future__ import annotations

import base64
import logging
import os
from typing import List

import httpx

logger = logging.getLogger(__name__)


def _comma_list(raw: str) -> List[str]:
    return [p.strip() for p in raw.split(",") if p.strip()]


def parse_recipients_emails() -> List[str]:
    return _comma_list(os.getenv("ALERT_EMAIL_RECIPIENTS", ""))


def parse_recipients_phones() -> List[str]:
    return _comma_list(os.getenv("ALERT_SMS_RECIPIENTS", ""))


def send_email_sendgrid(subject: str, plain_text: str) -> None:
    api_key = (os.getenv("SENDGRID_API_KEY") or "").strip()
    from_email = (os.getenv("ALERT_FROM_EMAIL") or "").strip()
    to_emails = parse_recipients_emails()

    if not api_key:
        logger.warning("SENDGRID_API_KEY not set; skipping email alert")
        return
    if not from_email or not to_emails:
        logger.warning("ALERT_FROM_EMAIL or ALERT_EMAIL_RECIPIENTS missing; skipping email alert")
        return

    personalization_tos = [{"email": addr} for addr in to_emails]
    payload = {
        "personalizations": [{"to": personalization_tos}],
        "from": {"email": from_email},
        "subject": subject,
        "content": [{"type": "text/plain", "value": plain_text}],
    }

    with httpx.Client(timeout=30.0) as client:
        r = client.post(
            "https://api.sendgrid.com/v3/mail/send",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        if r.status_code not in (200, 202):
            logger.error("SendGrid mail failed: %s %s", r.status_code, r.text)


def send_sms_twilio(body: str) -> None:
    sid = (os.getenv("TWILIO_ACCOUNT_SID") or "").strip()
    token = (os.getenv("TWILIO_AUTH_TOKEN") or "").strip()
    from_number = (os.getenv("TWILIO_FROM_NUMBER") or "").strip()
    recipients = parse_recipients_phones()

    if not sid or not token or not from_number:
        logger.warning("Twilio credentials not fully set; skipping SMS alert")
        return
    if not recipients:
        logger.warning("ALERT_SMS_RECIPIENTS missing; skipping SMS alert")
        return

    trimmed = body if len(body) <= 480 else body[:477] + "..."
    auth = base64.b64encode(f"{sid}:{token}".encode()).decode()

    with httpx.Client(timeout=30.0) as client:
        for to in recipients:
            r = client.post(
                f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json",
                headers={
                    "Authorization": f"Basic {auth}",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data={"From": from_number, "To": to, "Body": trimmed},
            )
            if r.status_code not in (200, 201):
                logger.error("Twilio SMS failed for %s: %s %s", to, r.status_code, r.text)


def notify_important_channels(subject: str, plain_text: str, *, notify_email: bool, notify_sms: bool) -> None:
    if notify_email:
        send_email_sendgrid(subject, plain_text)
    if notify_sms:
        send_sms_twilio(plain_text)
