#!/usr/bin/env python3
"""
Remap podcast.category values in PostgreSQL to the canonical 8-category set.

Usage:
  set DATABASE_URL=postgresql://...
  python scripts/update_podcast_categories.py --dry-run
  python scripts/update_podcast_categories.py
"""

from __future__ import annotations

import argparse
import os
import sys

try:
    import psycopg2
except ImportError:
    print("Install psycopg2: pip install psycopg2-binary")
    sys.exit(1)

DEFAULT_DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()

# legacy value (lowercase) → canonical slug
CATEGORY_MAP = {
    "gents empowerment podcasts": "gents-empowerment",
    "gents-empowerment": "gents-empowerment",
    "fog-gents": "gents-empowerment",
    "gents podcasts": "gents-empowerment",

    "ladies empowerment podcasts": "ladies-empowerment",
    "ladies-empowerment": "ladies-empowerment",
    "wisdom-for-ladies": "ladies-empowerment",
    "ladies podcasts": "ladies-empowerment",

    "wisdom keys": "wisdom-keys",
    "wisdom-keys": "wisdom-keys",

    "teens podcasts": "teens",
    "teens": "teens",
    "wisdom-for-teenagers": "teens",
    "wisdom for teenagers": "teens",

    "spiritual development": "spiritual-development",
    "spiritual-development": "spiritual-development",
    "01 spiritual growth podcasts": "spiritual-development",

    "personal development": "personal-development",
    "personal-development": "personal-development",

    "university students podcasts": "university-students",
    "university-students": "university-students",
    "university student": "university-students",
    "university students": "university-students",

    "relationship podcasts": "relationships",
    "relationships": "relationships",
    "relationships podcasts": "relationships",
    "beyond-dating-game": "relationships",
    "beyond the dating game": "relationships",
}

CANONICAL = {
    "gents-empowerment",
    "ladies-empowerment",
    "wisdom-keys",
    "teens",
    "spiritual-development",
    "personal-development",
    "university-students",
    "relationships",
}


def map_category(value: str) -> str:
    key = " ".join((value or "").strip().lower().split())
    return CATEGORY_MAP.get(key, key if key in CANONICAL else "spiritual-development")


def main() -> int:
    parser = argparse.ArgumentParser(description="Normalize podcast categories in PostgreSQL")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without writing")
    parser.add_argument("--database-url", default=DEFAULT_DATABASE_URL)
    args = parser.parse_args()

    if not args.database_url:
        print("DATABASE_URL is required. Set it in the environment or pass --database-url.")
        return 1

    print("Connecting to database...")
    conn = psycopg2.connect(args.database_url)
    cur = conn.cursor()

    cur.execute("SELECT id, title, category FROM podcasts ORDER BY id;")
    rows = cur.fetchall()
    print(f"Found {len(rows)} podcasts.\n")

    counts_before: dict[str, int] = {}
    counts_after: dict[str, int] = {}
    updated = 0
    unchanged = 0

    for podcast_id, title, category in rows:
        old = category or ""
        new = map_category(old)
        counts_before[old] = counts_before.get(old, 0) + 1
        counts_after[new] = counts_after.get(new, 0) + 1

        if old == new:
            unchanged += 1
            continue

        print(f"  [{podcast_id}] {title}")
        print(f"    {old!r} -> {new!r}")
        if not args.dry_run:
            cur.execute("UPDATE podcasts SET category = %s WHERE id = %s;", (new, podcast_id))
        updated += 1

    if not args.dry_run:
        conn.commit()

    cur.close()
    conn.close()

    print("\n" + "-" * 60)
    print("Before:")
    for k, v in sorted(counts_before.items()):
        print(f"  {k!r}: {v}")

    print("\nAfter:")
    for k, v in sorted(counts_after.items()):
        print(f"  {k!r}: {v}")

    mode = "DRY RUN" if args.dry_run else "APPLIED"
    print(f"\n{mode}: {updated} updated, {unchanged} unchanged.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
