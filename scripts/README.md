# Maintenance scripts

Run from repo root. All scripts use environment variables for secrets — never hardcode URLs or passwords.

| Script | When to use |
|--------|-------------|
| `check_db.py` | Quick backend health check |
| `show_tables.py` | Inspect DB table counts/samples via API |
| `list_stored_files.py` | Audit local `storage/files` layout |
| `create_admin_user.py` | Register legacy admin via API |
| `update_podcast_categories.py` | Normalize category slugs in PostgreSQL (`DATABASE_URL` required) |
| `upload_podcasts.py` | Upload a fixed list of podcasts via API |
| `manual_bulk_upload_podcasts.py` | Mass upload a folder tree via API (backend decides storage) |
| `upload_podcasts_r2_s3.py` | Mass upload a folder tree **directly to R2 + create DB rows** (self-contained) |
| `upload_media_m4a_to_r2.py` | Upload `.m4a` files from `Media/` to R2 (no DB rows) |

## Examples

```bash
# Health
API_BASE_URL=https://api.example.com python scripts/check_db.py

# Categories (dry run)
set DATABASE_URL=postgresql://...
python scripts/update_podcast_categories.py --dry-run

# Local storage audit
python scripts/list_stored_files.py

# Mass upload audio -> R2 bucket + register DB rows (so episodes appear in the app)
set R2_ACCESS_KEY_ID=...
set R2_SECRET_ACCESS_KEY=...
set R2_ENDPOINT_URL=https://<accountid>.r2.cloudflarestorage.com
set R2_BUCKET=fog-media
set R2_PUBLIC_BASE_URL=https://media.familyofgreatness.com
set PODCAST_API_URL=https://your-api.example.com
python scripts/upload_podcasts_r2_s3.py --audio-root "C:\path\to\audio" --dry-run
python scripts/upload_podcasts_r2_s3.py --audio-root "C:\path\to\audio" --skip-existing
```

SQL reference files live in `scripts/sql/`.

One-time migration scripts were removed; use git history if you need an old uploader.
