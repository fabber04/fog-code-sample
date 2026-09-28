# Local setup

## Prerequisites

- Node.js 20.x (`nvm use` reads `.nvmrc`)
- npm (lockfile: `package-lock.json` only — do not add `yarn.lock`)
- Python 3.11+ for the FastAPI backend
- Docker Desktop (optional, for local PostgreSQL via `docker compose up -d`)
- Firebase project (Auth, Firestore, Storage)

## Frontend (React)

```bash
npm install
cp env.example .env
# Fill REACT_APP_* values from Firebase Console → Project settings → Your apps → Web
npm start
```

App runs at `http://localhost:3000`. API defaults to `http://localhost:8000` when hostname is local.

## Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Set DATABASE_URL (see backend/.env.example)
uvicorn main:app --reload --port 8000
```

From repo root with Docker Postgres:

```bash
docker compose up -d
```

## Environment variables (canonical list)

### Frontend — repo root `.env` (copy from `env.example`)

| Variable | Purpose |
|----------|---------|
| `REACT_APP_API_URL` | Backend URL (`http://localhost:8000` locally) |
| `REACT_APP_FIREBASE_API_KEY` | Firebase web API key |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | e.g. `your-firebase-project.firebaseapp.com` |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase project ID |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `REACT_APP_FIREBASE_APP_ID` | Firebase app ID |
| `REACT_APP_FIREBASE_MEASUREMENT_ID` | Optional Analytics |

### Backend — `backend/.env` (copy from `backend/.env.example`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (required in production) |
| `ENVIRONMENT` | `development` or `production` |
| `SECRET_KEY` | JWT signing key for legacy API auth — **rotate if ever leaked** |
| `STORAGE_MODE` | `local` or `r2` |
| `R2_*` | Cloudflare R2 credentials when `STORAGE_MODE=r2` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS` | Admin SDK for Firestore notifications |
| `ALERTS_INTERNAL_SECRET` | Protects internal notification endpoints |
| `SENDGRID_*`, `TWILIO_*` | Optional alert email/SMS |

Never commit `.env`, `.auth_token`, or database URLs. Scripts read `DATABASE_URL` and `API_BASE_URL` from the environment only.

## Maintenance scripts

See [`scripts/README.md`](../scripts/README.md).
