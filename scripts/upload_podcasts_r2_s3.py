#!/usr/bin/env python3
"""
Mass podcast uploader (R2 + database).

Walks a folder tree of audio files and, for each file:
  1. Uploads the audio directly to Cloudflare R2 via the S3-compatible API (boto3).
  2. Uploads the matching category cover to R2 (if found locally).
  3. Registers a podcast row via POST /api/podcasts/ so it appears everywhere in
     the app (audio_url points at the public R2 URL, same as STORAGE_MODE=r2).

My script is fully self-contained (no dependency on other scripts).

Required env (same as backend):
  R2_ACCESS_KEY_ID
  R2_SECRET_ACCESS_KEY
  R2_ENDPOINT_URL    e.g. https://<accountid>.r2.cloudflarestorage.com
  R2_BUCKET
  R2_PUBLIC_BASE_URL e.g. https://media.oursite.com  (no trailing slash)

Optional (to register in your app database):
  PODCAST_API_URL    e.g. https://api.example.com

Examples:
  pip install boto3 requests
  set R2_ACCESS_KEY_ID=...
  set R2_SECRET_ACCESS_KEY=...
  set R2_ENDPOINT_URL=https://....r2.cloudflarestorage.com
  set R2_BUCKET=fog-media
  set R2_PUBLIC_BASE_URL=https://media.example.com
  set PODCAST_API_URL=https://api.example.com

  python scripts/upload_podcasts_r2_s3.py --dry-run --limit 3
  python scripts/upload_podcasts_r2_s3.py --skip-existing
"""

from __future__ import annotations

import argparse
import mimetypes
import os
import re
import sys
import time
from pathlib import Path

import requests

_SCRIPTS_DIR = Path(__file__).resolve().parent
_REPO_ROOT = _SCRIPTS_DIR.parent

# Folder/category helpers. 
# Kept here so this script never breaks if other scripts are moved
# or removed.


AUDIO_EXT = {".m4a", ".mp3", ".wav", ".ogg", ".aac", ".mp4"}

# First path segment under audio root to podcast category slug
# (must match AdminPodcasts / app filters in src/constants/podcastCovers.js)

FOLDER_TO_CATEGORY = {
    "01 spiritual growth podcasts": "spiritual-development",
    "ladies podcasts": "ladies-empowerment",
    "personal development": "personal-development",
    "relationships podcasts": "relationships",
    "university student": "university-students",
    "gents podcasts": "gents-empowerment",
    "university students": "university-students",
}

# Default cover art per category (public/images/podcasts/New images/). Dw about this its in our public frontend folder.
NEW_COVERS_DIR = _REPO_ROOT / "public" / "images" / "podcasts" / "New images"
COVER_BY_CATEGORY = {
    "gents-empowerment": NEW_COVERS_DIR / "Gents Empowerment podcasts.png",
    "ladies-empowerment": NEW_COVERS_DIR / "Ladies Empowerment Podcasts.png",
    "wisdom-keys": NEW_COVERS_DIR / "Wisdom keys.jpeg",
    "teens": NEW_COVERS_DIR / "Teens Podcasts.jpeg",
    "spiritual-development": NEW_COVERS_DIR / "Spiritual Development Podcasts.jpeg",
    "personal-development": NEW_COVERS_DIR / "Personal Development.jpeg",
    "university-students": NEW_COVERS_DIR / "University Students podcasts.jpeg",
    "relationships": NEW_COVERS_DIR / "Relationship podcasts.png",
}


# Normalize key to remove special characters and spaces we doing this because we want to be able to match the category to the folder name.
def normalize_key(s: str) -> str:
    return " ".join(s.strip().lower().split())


def map_category(series_folder: str) -> str:
    return FOLDER_TO_CATEGORY.get(normalize_key(series_folder), "spiritual-development")


def category_for_file(audio_root: Path, file_path: Path) -> str:
    """Resolve category from any folder in the path (deepest known series wins)."""
    try:
        rel = file_path.relative_to(audio_root)
    except ValueError:
        return "spiritual-development"
    dir_parts = rel.parts[:-1]
    for part in reversed(dir_parts):
        key = normalize_key(part)
        if key in FOLDER_TO_CATEGORY:
            return FOLDER_TO_CATEGORY[key]
    if dir_parts:
        return map_category(dir_parts[0])
    return "spiritual-development"


def title_from_file(path: Path) -> str:
    return path.stem.replace("_", " ").strip() or path.name


def gather_audio_files(audio_root: Path) -> list[Path]:
    out: list[Path] = []
    for p in audio_root.rglob("*"):
        if p.is_file() and p.suffix.lower() in AUDIO_EXT:
            out.append(p)
    return sorted(out, key=lambda x: str(x).lower())


def fetch_existing_titles(api_base: str) -> set[str]:
    titles: set[str] = set()
    skip = 0
    page = 100
    while True:
        try:
            r = requests.get(
                f"{api_base.rstrip('/')}/api/podcasts/",
                params={"skip": skip, "limit": page},
                timeout=60,
            )
        except Exception:
            return titles
        if not r.ok:
            return titles
        batch = r.json()
        if not batch:
            break
        for row in batch:
            t = row.get("title")
            if t:
                titles.add(t.strip().lower())
        if len(batch) < page:
            break
        skip += page
    return titles


def sanitize_filename(filename: str) -> str:
    filename = Path(filename).name
    filename = re.sub(r'[<>:"|?*\x00-\x1f]', "", filename)
    filename = filename.strip(" .")
    return filename or "file"


def r2_object_key(category: str, subcategory: str, filename: str) -> str:
    safe = sanitize_filename(filename)
    return f"{category}/{subcategory}/{safe}"


def content_type_for(path: Path) -> str:
    ext = path.suffix.lower()
    audio = {
        ".mp3": "audio/mpeg",
        ".m4a": "audio/mp4",
        ".wav": "audio/wav",
        ".ogg": "audio/ogg",
        ".aac": "audio/aac",
        ".mp4": "audio/mp4",
    }
    if ext in audio:
        return audio[ext]
    guess, _ = mimetypes.guess_type(str(path))
    return guess or "application/octet-stream"


def get_s3_client():
    try:
        import boto3
    except ImportError:
        raise SystemExit("Install boto3: pip install boto3") from None

    endpoint = os.environ.get("R2_ENDPOINT_URL", "").strip()
    key_id = os.environ.get("R2_ACCESS_KEY_ID", "").strip()
    secret = os.environ.get("R2_SECRET_ACCESS_KEY", "").strip()
    if not endpoint or not key_id or not secret:
        raise SystemExit(
            "Missing R2 credentials. Set R2_ENDPOINT_URL, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY."
        )
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=key_id,
        aws_secret_access_key=secret,
        region_name="auto",
    )


def public_url_for_key(key: str) -> str:
    base = os.environ.get("R2_PUBLIC_BASE_URL", "").strip().rstrip("/")
    if not base:
        raise SystemExit("Missing R2_PUBLIC_BASE_URL.")
    return f"{base}/{key}"


def put_file(client, bucket: str, key: str, path: Path, content_type: str) -> None:
    with open(path, "rb") as f:
        client.put_object(
            Bucket=bucket,
            Key=key,
            Body=f,
            ContentType=content_type,
        )


def upload_cover_s3(client, bucket: str, cover_path: Path) -> str | None:
    if not cover_path.is_file():
        return None
    key = r2_object_key("podcasts", "covers", cover_path.name)
    ct = content_type_for(cover_path)
    if not ct.startswith("image/"):
        ct = "image/jpeg"
    put_file(client, bucket, key, cover_path, ct)
    return public_url_for_key(key)


def create_podcast_row(api_base: str, payload: dict) -> dict:
    url = f"{api_base.rstrip('/')}/api/podcasts/"
    r = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=60)
    if not r.ok:
        try:
            detail = r.json().get("detail", r.text)
        except Exception:
            detail = r.text
        raise RuntimeError(f"Create failed ({r.status_code}): {detail}")
    return r.json()


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Upload podcasts to R2 via S3 API, optionally register in API."
    )
    parser.add_argument(
        "--audio-root",
        type=Path,
        default=_REPO_ROOT / "media" / "podcasts",
        help="Root folder (default: <repo>/media/podcasts)",
    )
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--skip-existing", action="store_true")
    parser.add_argument(
        "--no-register",
        action="store_true",
        help="Only upload to R2; do not POST /api/podcasts/",
    )
    parser.add_argument("--delay", type=float, default=0.3)
    args = parser.parse_args()

    api_base = os.environ.get("PODCAST_API_URL", "").strip()
    if not args.no_register and not api_base:
        print(
            "Set PODCAST_API_URL to register rows, or pass --no-register to upload to R2 only."
        )
        return 1

    bucket = os.environ.get("R2_BUCKET", "").strip()
    if not args.dry_run and not bucket:
        sys.exit("Set R2_BUCKET (your R2 bucket name, e.g. fog-media).")
    if args.dry_run and not bucket:
        bucket = "(dry-run)"

    audio_root = args.audio_root.resolve()
    if not audio_root.is_dir():
        print(f"[error] Not a directory: {audio_root}")
        return 1

    files = gather_audio_files(audio_root)
    if args.limit > 0:
        files = files[: args.limit]

    existing: set[str] = set()
    if args.skip_existing and api_base and not args.no_register and not args.dry_run:
        print("Fetching existing podcast titles...")
        existing = fetch_existing_titles(api_base)
        print(f"   {len(existing)} titles in API.\n")

    client = None
    if not args.dry_run:
        client = get_s3_client()

    ok = err = 0
    for i, path in enumerate(files, 1):
        category = category_for_file(audio_root, path)
        title = title_from_file(path)
        title_key = title.strip().lower()

        audio_key = r2_object_key("podcasts", "audio", path.name)
        if args.dry_run:
            audio_url = f"(would be) https://<R2_PUBLIC_BASE_URL>/{audio_key}"
        else:
            audio_url = public_url_for_key(audio_key)

        print(f"[{i}/{len(files)}] {path.relative_to(audio_root)}")
        print(f"         key=s3://{bucket}/{audio_key}")
        print(f"         url={audio_url}")

        if args.skip_existing and title_key in existing:
            print("         [skip] title exists")
            continue

        if args.dry_run:
            ok += 1
            continue

        assert client is not None
        try:
            put_file(client, bucket, audio_key, path, content_type_for(path))

            cover_path = COVER_BY_CATEGORY.get(category)
            cover_url = None
            if cover_path:
                cover_url = upload_cover_s3(client, bucket, cover_path)

            if args.no_register:
                print("         [ok] R2 put_object (no DB row)")
            else:
                payload = {
                    "title": title,
                    "host": "FOG Ministries",
                    "type": "episode",
                    "category": category,
                    "description": f"Audio: {title}",
                    "duration": None,
                    "is_live": False,
                    "is_free": True,
                    "tags": "podcast, fog",
                    "audio_url": audio_url,
                    "transcript": None,
                    "cover": cover_url,
                }
                created = create_podcast_row(api_base, payload)
                print(f"         [ok] db id={created.get('id')}")
                existing.add(title_key)

            ok += 1
            if args.delay > 0:
                time.sleep(args.delay)
        except Exception as e:
            print(f"         [err] {e}")
            err += 1

    print(f"\nDone. ok={ok} errors={err}")
    return 0 if err == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
