# Architecture

## Stack overview

```
Browser (React 18 + Tailwind)
    ├── Firebase Auth — sign-in, ID tokens for admin routes
    ├── Firestore — in-app notifications bell, user roles
    └── FastAPI backend (Railway PostgreSQL)
            ├── Podcasts, events, library, members, prayer requests
            ├── File uploads → local disk or Cloudflare R2
            └── Legacy JWT auth for upload scripts (use SECRET_KEY env)
```

## Repository layout

| Path | Role |
|------|------|
| `src/` | React SPA — pages, components, contexts, `apiService.js` |
| `backend/` | **Production API** — `main.py`, routes, SQLAlchemy models |
| `scripts/` | **Admin/maintenance CLI tools** — not part of the running app |
| `public/` | Static assets committed to git |
| `storage/`, `Media/` | Local dev media only (gitignored) |
| `firestore.rules`, `storage.rules` | Firebase security |
| `dataconnect/` | Firebase Data Connect schema (if used) |

The `backend/` folder is the live server. Root-level `scripts/` are one-off or recurring operator tools that call the API or `DATABASE_URL` directly — they are not deployed to Railway.

## Key frontend modules

- `src/App.js` — routes (HashRouter), splash, onboarding gate
- `src/services/apiService.js` — all REST calls to FastAPI
- `src/contexts/AuthContext.jsx` — Firebase session + profile sync
- `src/components/AudioPlayer.js` — podcast playback (mini + full-screen on mobile)
- `src/pages/admin/*` — admin UI (podcasts, notifications wired; others stubbed)

## Key backend modules

- `backend/routes/podcasts.py` — CRUD, streaming, play counts
- `backend/routes/prayer.py` — prayer requests (privacy-sensitive)
- `backend/routes/auth.py` — legacy username/password JWT
- `backend/utils/firebase_admin_auth.py` — verifies Firebase ID tokens for admin

## Data stores

- **PostgreSQL** — podcasts, users, events, library metadata, prayer requests
- **Firestore** — notifications, optional user profile fields
- **R2 / local storage** — podcast audio and cover binaries

## Security notes

- Admin routes require Firebase ID token + Firestore `admin` role **or** legacy JWT.
- Prayer request visibility must stay restricted — add tests before changing `prayer.py` or related rules.
- Never hardcode `DATABASE_URL`, tokens, or API keys in scripts; use environment variables.
