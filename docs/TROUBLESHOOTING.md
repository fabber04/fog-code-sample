# Troubleshooting

## Podcasts not loading

1. Check backend health: `python scripts/check_db.py`
2. In browser DevTools → Network, confirm requests go to the Railway API (not `localhost`)
3. If local dev: ensure backend runs on port 8000 and `REACT_APP_API_URL=http://localhost:8000`
4. CORS errors: add your origin in `backend/main.py` allow list

## Audio stops on iPhone

- Use the in-app player (mini bar → expand). Background playback uses Media Session API.
- Stream URL: `/api/podcasts/{id}/stream` — requires backend reachable from device network.
- Hard-refresh after deploy to pick up latest `AudioPlayer.js`.

## API returns 502 / connection failed

- Railway backend may be redeploying — check Railway dashboard logs.
- Verify `DATABASE_URL` is set on the backend service.
- `scripts/check_db.py` uses `API_BASE_URL` env var to target the right host.

## Firebase auth errors

- Confirm all `REACT_APP_FIREBASE_*` vars are set on the **frontend** Railway service (build-time).
- Restart dev server after changing root `.env`.

## Upload / admin script failures

- Do not use `.auth_token` files — pass tokens via env or Firebase login in the web UI.
- Bulk scripts need `DATABASE_URL` or `API_BASE_URL` in the shell environment.
- R2 uploads need full `R2_*` set per `backend/.env.example`.

## Wrong API URL in production build

CRA bakes env vars at build time. Update `REACT_APP_API_URL` on Railway frontend, then trigger a redeploy.

## After a secret leak

1. Rotate Railway PostgreSQL password → update `DATABASE_URL`
2. Set new `SECRET_KEY` on backend → redeploy
3. Revoke exposed Firebase / R2 keys in their consoles
4. See `docs/DEPLOYMENT.md` → Rotating secrets
