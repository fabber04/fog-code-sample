# FOG — Family of Greatness

This public repository is a trimmed copy of the private application, prepared so the source can be reviewed. Community photos, podcast audio, and local environment files are not included. Production hostnames, Firebase project identifiers, and personal contact details are replaced with placeholders.

Digital platform for prayer, podcasts, events, Genius Academy, devotionals, and community — built with React, Firebase, and FastAPI.

**Live site:** [familyofgreatness.com](https://familyofgreatness.com)

## Quick start

```bash
npm install
cp env.example .env          # frontend Firebase + API URL
cd backend && cp .env.example .env && pip install -r requirements.txt
cd .. && npm start           # frontend :3000
# separate terminal: cd backend && uvicorn main:app --reload --port 8000
```

Full setup, env vars, and Docker Postgres: **[docs/SETUP.md](docs/SETUP.md)**

## Documentation

| Doc | Contents |
|-----|----------|
| [docs/SETUP.md](docs/SETUP.md) | Local dev, environment variables |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Railway + Firebase production deploy |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, folders, data flow |
| [docs/ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) | Admin tools and routes |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common fixes |
| [scripts/README.md](scripts/README.md) | CLI maintenance scripts |

## Scripts

```bash
npm start          # dev server
npm run build      # production build
npm run build:railway
npm test
```

## Stack

- **Frontend:** React 18, Tailwind CSS, Firebase Auth & Firestore
- **Backend:** FastAPI, PostgreSQL (Railway), optional Cloudflare R2 media
- **Hosting:** Railway (frontend + backend)

## License

Proprietary — all rights reserved.
