# Isolated local setup

Backend directory: `../Pal-Back`. Compose project **pal-local** owns separate PostgreSQL/Redis/media volumes; existing unrelated services left alone. API/admin: `http://127.0.0.1:8081`. Frontend: `http://localhost:3005` (3000 belongs to another project).

```sh
cd ../Pal-Back
# First run only: copy .env.example to .env; generate random SECRET_KEY.
# Local defaults: SMS_BACKEND=console, SAMAN_MOCK=True; no real credentials.
docker compose -p pal-local up -d --build
docker compose -p pal-local exec web python manage.py seed
docker compose -p pal-local exec web python manage.py createsuperuser
# Staff credentials must be entered locally, never committed. This session created isolated local admin; see credential path below.
docker compose -p pal-local exec web python manage.py test
curl http://127.0.0.1:8081/health/
```

This session created backend `.env` mode600 (ignored), random secret, local CORS/trusted origins and mock callback URL. No real SMS/payment credentials set. Initial direct package download failed; build succeeded using host HTTP proxy build args. Five services running; test results in testing.md. If network requires it:

```sh
docker compose -p pal-local build \
  --build-arg HTTP_PROXY=http://127.0.0.1:10809 \
  --build-arg HTTPS_PROXY=http://127.0.0.1:10809
# Build uses network: host; proxy is local transport, not app env.
docker compose -p pal-local up -d
```

Frontend ignored `.env.local` overrides older `.env` without modifying it:

```dotenv
NEXT_PUBLIC_API_BASE_URL=
PAL_BACKEND_URL=http://127.0.0.1:8081
```

```sh
cd ../palCoffee
bun run dev -- --port 3005
bun test lib/*.test.ts
bun run typecheck
bun run build
```

Restart/rebuild Next after proxy/public env changes. Production must explicitly set reachable backend URL at build time (or same-origin reverse proxy); local fallback is development-only. Public media hostname requires approved Next image configuration. Never proxy production requests to localhost accidentally.

Local Django Admin credentials: `~/.local/state/pal-coffee/local-admin.json` (mode600, outside repo). Do not paste or commit this file. Admin login/CSRF verified in browser. Use same local admin phone for frontend staff OTP login; obtain code only from local worker console. No production account created.

Verified build runs standalone on loopback 3005. For another local production-build run (after `bun run build`): link/copy `public/` into `.next/standalone/public` and `.next/static` into `.next/standalone/.next/static`, then `HOSTNAME=127.0.0.1 PORT=3005 node .next/standalone/server.js`. Current generated assets use local symlinks; deployment packaging must copy assets correctly.

OTP code appears in **local console worker log**; use local test phone only. No OTP displayed by frontend, fixed login code or auth bypass added. Event/slot/card seed for browser checks uses clearly labeled demo data with non-payable dummy card. Never transfer money to demo card; automated registration uses generated test image, not actual receipt.

Stop only this stack: `docker compose -p pal-local stop`. Do not use `down -v` unless deliberately deleting demo data. Production release needs actual SMS provider, allowed domains/HTTPS, backup/restore, admin ownership, real card details, gateway validation (if enabled), privacy/image publication review and user approval.
