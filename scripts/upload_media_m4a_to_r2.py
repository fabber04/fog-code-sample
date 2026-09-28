#!/usr/bin/env python3
"""
Find all .m4a files anywhere in the Media/ folder and upload them FLAT to
Cloudflare R2 at:  fog-media/podcasts/audio/<filename>.m4a

This only uploads files to R2 (no database rows, no categories).

Required env (same as backend):
  R2_ACCESS_KEY_ID
  R2_SECRET_ACCESS_KEY
  R2_ENDPOINT_URL      e.g. https://<accountid>.r2.cloudflarestorage.com
  R2_BUCKET            e.g. fog-media
  R2_PUBLIC_BASE_URL   e.g. https://media.familyofgreatness.com  (no trailing slash)

Usage (PowerShell):
  pip install boto3
  python scripts/upload_media_m4a_to_r2.py --dry-run
  python scripts/upload_media_m4a_to_r2.py
  python scripts/upload_media_m4a_to_r2.py --skip-existing
  python scripts/upload_media_m4a_to_r2.py --media-root "C:\\path\\to\\Media"
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parent.parent

R2_PREFIX = "podcasts/audio"


def sanitize_filename(name: str) -> str:
    name = Path(name).name
    name = re.sub(r'[<>:"|?*\x00-\x1f]', "", name)
    return name.strip(" .") or "file.m4a"


def gather_m4a(media_root: Path) -> list[Path]:
    files = [p for p in media_root.rglob("*") if p.is_file() and p.suffix.lower() == ".m4a"]
    return sorted(files, key=lambda x: str(x).lower())


def get_s3_client():
    try:
        import boto3
    except ImportError:
        sys.exit("boto3 is required. Run: pip install boto3")

    endpoint = os.environ.get("R2_ENDPOINT_URL", "").strip()
    key_id = os.environ.get("R2_ACCESS_KEY_ID", "").strip()
    secret = os.environ.get("R2_SECRET_ACCESS_KEY", "").strip()
    if not (endpoint and key_id and secret):
        sys.exit("Set R2_ENDPOINT_URL, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY.")

    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=key_id,
        aws_secret_access_key=secret,
        region_name="auto",
    )


def public_url_for_key(key: str) -> str:
    base = os.environ.get("R2_PUBLIC_BASE_URL", "").strip().rstrip("/")
    return f"{base}/{key}" if base else f"(no R2_PUBLIC_BASE_URL)/{key}"


def object_exists(client, bucket: str, key: str) -> bool:
    try:
        client.head_object(Bucket=bucket, Key=key)
        return True
    except Exception:
        return False


def main() -> int:
    parser = argparse.ArgumentParser(description="Upload all Media/*.m4a flat to R2 podcasts/audio/")
    parser.add_argument(
        "--media-root",
        type=Path,
        default=_REPO_ROOT / "Media",
        help="Folder to search recursively (default: <repo>/Media)",
    )
    parser.add_argument("--dry-run", action="store_true", help="List actions without uploading")
    parser.add_argument("--skip-existing", action="store_true", help="Skip keys already in the bucket")
    args = parser.parse_args()

    media_root = args.media_root.resolve()
    if not media_root.is_dir():
        sys.exit(f"Media folder not found: {media_root}")

    files = gather_m4a(media_root)
    if not files:
        print(f"No .m4a files found under {media_root}")
        return 0

    bucket = os.environ.get("R2_BUCKET", "").strip()
    if not args.dry_run and not bucket:
        sys.exit("Set R2_BUCKET (e.g. fog-media).")
    bucket = bucket or "(dry-run)"

    client = None if args.dry_run else get_s3_client()

    ok = err = skipped = 0
    for i, path in enumerate(files, 1):
        filename = sanitize_filename(path.name)
        key = f"{R2_PREFIX}/{filename}"
        print(f"[{i}/{len(files)}] {path.relative_to(media_root)}")
        print(f"          -> s3://{bucket}/{key}")
        print(f"          -> {public_url_for_key(key)}")

        if args.dry_run:
            ok += 1
            continue

        if args.skip_existing and object_exists(client, bucket, key):
            print("          [skip] already in bucket")
            skipped += 1
            continue

        try:
            with open(path, "rb") as f:
                client.put_object(Bucket=bucket, Key=key, Body=f, ContentType="audio/mp4")
            print("          [ok] uploaded")
            ok += 1
        except Exception as e:
            print(f"          [err] {e}")
            err += 1

    print(f"\nDone. uploaded/ok={ok} skipped={skipped} errors={err} (found {len(files)} .m4a)")
    return 0 if err == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
