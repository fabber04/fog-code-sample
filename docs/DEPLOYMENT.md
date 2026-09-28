# Deployment

FOG runs as **two Railway services** plus **Firebase** for auth and Firestore.

| Layer | Host | Notes |
|-------|------|-------|
| Frontend (CRA) | Railway | Builds from repo root; `npm run build:railway` |
| Backend (FastAPI) | Railway | Root directory `backend/` |
| Auth & realtime data | Firebase | Firestore rules in `firestore.rules` |
| Public site | `https://familyofgreatness.com` | Custom domain on frontend service |
| API (production) | `https://api.example.com` | Set `REACT_APP_API_URL` at frontend build time |
| Media (recommended) | Cloudflare R2 | `STORAGE_MODE=r2` on backend |

GitHub Pages is **not** the primary host (workflow removed). Do not rely on static hosting alone — the Python API is required for podcasts, members, and admin uploads.

## Deploy flow

1. Push to `main` — Railway auto-deploys connected services.
2. **Frontend service variables** (build time):
   - All `REACT_APP_FIREBASE_*` from Firebase Console
   - `REACT_APP_API_URL` = your Railway backend public URL
3. **Backend service variables**:
   - `DATABASE_URL` (Railway PostgreSQL)
   - `SECRET_KEY` (long random string)
   - `ENVIRONMENT=production`
   - CORS is configured in `backend/main.py` for production origins
   - R2 vars if using cloud media storage
   - Firebase service account for admin notifications

## Verify after deploy

```bash
curl https://api.example.com/api/health
python scripts/check_db.py
python scripts/show_tables.py
```

On the live site: hard-refresh, open DevTools → Network, confirm API calls hit the Railway backend (not `localhost`).

## Podcast media

- New uploads with `STORAGE_MODE=r2` go to Cloudflare R2 (`media.familyofgreatness.com`).
- Local `storage/` and `Media/` folders are gitignored — never commit audio files.
- Bulk upload: `python scripts/upload_podcasts_r2_s3.py` (requires R2 env vars).

## Rotating secrets

If credentials ever appeared in git history or logs:

1. **Railway PostgreSQL** — reset password in Railway dashboard, update `DATABASE_URL`.
2. **`SECRET_KEY`** — generate new value, redeploy backend (invalidates old JWTs).
3. **Firebase / R2 / SendGrid / Twilio** — rotate in respective consoles.
