#!/usr/bin/env python3
"""
Bulk manual podcast upload: walks a folder tree, uploads audio + optional cover, creates DB rows.

Use when you already have .m4a/.mp3 files on disk (default tree: media/podcasts).

Examples:
  set PODCAST_API_URL=http://localhost:8000
  python scripts/manual_bulk_upload_podcasts.py --dry-run

  python scripts/manual_bulk_upload_podcasts.py --limit 5

  python scripts/manual_bulk_upload_podcasts.py --api https://your-api.example.com

Env:
  PODCAST_API_URL   Base URL for the FastAPI backend (default: http://localhost:8000)
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from pathlib import Path

import requests

# Repo root = parent of scripts/
REPO_ROOT = Path(__file__).resolve().parent.parent

DEFAULT_API = os.environ.get("PODCAST_API_URL", "http://localhost:8000").rstrip("/")

AUDIO_EXT = {".m4a", ".mp3", ".wav", ".ogg", ".aac", ".mp4"}

# First path segment under --audio-root → podcast category slug (must match AdminPodcasts / app filters)
FOLDER_TO_CATEGORY = {
    "01 spiritual growth podcasts": "spiritual-development",
    "ladies podcasts": "ladies-empowerment",
    "personal development": "personal-development",
    "relationships podcasts": "relationships",
    "university student": "university-students",
    "gents podcasts": "gents-empowerment",
    "university students": "university-students",
}

# Default cover art per category (public/images/podcasts/New images/)
NEW_COVERS_DIR = REPO_ROOT / "public" / "images" / "podcasts" / "New images"
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


def normalize_key(s: str) -> str:
    return " ".join(s.strip().lower().split())


def map_category(series_folder: str) -> str:
    key = normalize_key(series_folder)
    return FOLDER_TO_CATEGORY.get(key, "spiritual-development")


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


def upload_file(api_base: str, endpoint: str, file_path: Path, file_type: str) -> dict:
    url = f"{api_base}/api/podcasts/{endpoint}"
    mime = "audio/m4a" if file_type == "audio" else "image/jpeg"
    with open(file_path, "rb") as f:
        files = {"file": (file_path.name, f, mime)}
        r = requests.post(url, files=files, timeout=600)
    if not r.ok:
        try:
            detail = r.json().get("detail", r.text)
        except Exception:
            detail = r.text
        raise RuntimeError(f"Upload failed ({r.status_code}): {detail}")
    return r.json()


def create_podcast(api_base: str, payload: dict) -> dict:
    url = f"{api_base}/api/podcasts/"
    r = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=60)
    if not r.ok:
        try:
            detail = r.json().get("detail", r.text)
        except Exception:
            detail = r.text
        raise RuntimeError(f"Create failed ({r.status_code}): {detail}")
    return r.json()


def fetch_existing_titles(api_base: str) -> set[str]:
    titles: set[str] = set()
    skip = 0
    page = 100
    while True:
        r = requests.get(
            f"{api_base}/api/podcasts/",
            params={"skip": skip, "limit": page},
            timeout=60,
        )
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


def main() -> int:
    parser = argparse.ArgumentParser(description="Bulk upload podcasts from a folder tree.")
    parser.add_argument(
        "--api",
        default=DEFAULT_API,
        help=f"API base URL (default: env PODCAST_API_URL or {DEFAULT_API})",
    )
    parser.add_argument(
        "--audio-root",
        type=Path,
        default=REPO_ROOT / "media" / "podcasts",
        help="Root folder containing series subfolders and audio files (default: <repo>/media/podcasts)",
    )
    parser.add_argument("--dry-run", action="store_true", help="List actions only; no uploads")
    parser.add_argument("--limit", type=int, default=0, help="Max number of files to process (0=all)")
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip when a podcast with the same title already exists (queries API first)",
    )
    parser.add_argument("--delay", type=float, default=0.5, help="Seconds between episodes")
    args = parser.parse_args()

    api_base = args.api.rstrip("/")
    audio_root = args.audio_root.resolve()

    if not audio_root.is_dir():
        print(f"[error] Audio root not found: {audio_root}")
        return 1

    files = gather_audio_files(audio_root)
    if args.limit > 0:
        files = files[: args.limit]

    existing: set[str] = set()
    if args.skip_existing and not args.dry_run:
        print("Fetching existing podcast titles…")
        existing = fetch_existing_titles(api_base)
        print(f"   Found {len(existing)} existing titles.\n")

    ok = 0
    err = 0
    for i, path in enumerate(files, 1):
        category = category_for_file(audio_root, path)
        title = title_from_file(path)
        title_key = title.strip().lower()

        print(f"[{i}/{len(files)}] {path.relative_to(audio_root)}")
        print(f"         -> title={title!r} category={category}")

        if args.skip_existing and title_key in existing:
            print("         [skip] title already exists")
            continue

        if args.dry_run:
            print("         (dry-run)")
            ok += 1
            continue

        try:
            audio_result = upload_file(api_base, "upload-audio", path, "audio")
            audio_url = audio_result.get("url")
            if not audio_url:
                raise RuntimeError("No url in audio upload response")

            cover_path = COVER_BY_CATEGORY.get(category)
            cover_url = None
            if cover_path and cover_path.is_file():
                cover_result = upload_file(api_base, "upload-cover", cover_path, "image")
                cover_url = cover_result.get("url")

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
            created = create_podcast(api_base, payload)
            pid = created.get("id")
            print(f"         [ok] created id={pid}")
            existing.add(title_key)
            ok += 1
            if args.delay > 0:
                time.sleep(args.delay)
        except Exception as e:
            print(f"         [err] {e}")
            err += 1

    print(f"\nDone. ok={ok}  errors={err}")
    return 0 if err == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
