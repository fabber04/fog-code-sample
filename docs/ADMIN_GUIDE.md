# Admin guide

## User management

### Web — `/members`

- View, search, and filter members
- Export to Excel
- Add, edit, activate/deactivate, delete users

### API

- `GET /api/users/` — list (admin token)
- `GET /api/users/stats/overview` — overview stats

### CLI

```bash
python scripts/show_tables.py          # sample rows via API
python scripts/check_db.py             # health check
```

Set `API_BASE_URL` if not using the default Railway backend.

## Content management

| Area | Route | Status |
|------|-------|--------|
| Podcasts | `/admin/podcasts` | Live — upload, edit, delete |
| Notifications | `/admin/notifications` | Live — push to members |
| Events | `/admin/events` | Page exists, not in main nav |
| Library | `/admin/library` | Page exists, not in main nav |

## Podcast uploads (bulk)

```bash
# Requires R2 env vars — see docs/SETUP.md
python scripts/upload_podcasts_r2_s3.py
python scripts/upload_media_m4a_to_r2.py
```

## Create admin user

```bash
python scripts/create_admin_user.py <username> <password> <email> "Full Name"
```

Prefer Firebase Auth + Firestore `admin` role for day-to-day admin access.

## Database

Production uses **Railway PostgreSQL** (`DATABASE_URL`). Local dev may use Docker Postgres or SQLite fallback — see `docs/SETUP.md`.

Never commit connection strings. Rotate Railway DB password if credentials were ever in git history.

## Prayer requests

Admins see all requests; members see only their own. Test privacy rules before changing `backend/routes/prayer.py` or Firestore rules.
