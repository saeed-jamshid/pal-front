# PAL frontend deployment

Source: `saeed-jamshid/pal-front`, branch `main`. CI uses committed code only.

## Production environment

GitHub environment `production`:

| Setting | Kind | Purpose |
| --- | --- | --- |
| DEPLOY_SSH_KEY | Secret | Dedicated deploy-user SSH private key |
| DEPLOY_KNOWN_HOSTS | Secret | Independently verified VPS SSH host key |
| DEPLOY_HOST / DEPLOY_USER / DEPLOY_PORT | Variables | VPS connection |
| PAL_BACKEND_URL | Variable | Build-time loopback backend URL, e.g. `http://127.0.0.1:8091` |
| FRONTEND_PORT | Variable | Free localhost port; provisional default `3005` |
| DEPLOY_ENABLED | Variable | Must be exactly `true` to activate VPS deployment |
| API_HEALTH_REQUIRED | Variable | Defaults `true`; temporary `false` permits frontend-only activation |

Current rollout: DEPLOY_ENABLED=true, API_HEALTH_REQUIRED=true, frontend3005 and backend8091. Backend is running; host API and Next API proxy verified. Initial frontend-only rollout used false temporarily. Public OTP stays blocked until SMS acceptance; no real payment or production content/admin acceptance claimed.

CI installs Bun 1.4.2 with frozen `bun.lock`, runs tests/lint/typecheck/deployment self-check, then builds Next standalone on Node 22. The older npm lockfile is not used by this pipeline. Git LFS must hydrate video files; package rejects pointer-only assets. Env files are excluded from release archives.

Artifacts contain standalone server, `public` and `.next/static`; uploaded archive has SHA256 checksum. Deployed releases live under `/opt/pal/front/releases/<sha>-<run>-<attempt>`, with `current` symlink and PM2 app `pal-front` owned by deploy. Filesystem lock prevents overlapping activation. Existing unrelated apps are untouched.

Full activation requires backend `/health/` first. PM2 reload is followed by localhost homepage, login and catalog checks, plus same-origin `/api/v1/products/` when API readiness is required. Failure restores prior release/config and checks recovery; first-release failure removes the app. Releases are retained for recovery; review disk usage before deleting old inactive releases. No automatic pruning yet.

## VPS prerequisites

- `/opt/pal/front/{releases,shared}` owned by deploy.
- Node 22, PM2, curl, tar, SHA256 utilities, flock.
- Backend reachable on chosen free loopback port.
- PM2 startup service configured for deploy (requires root), so saved app survives reboot.
- Public domain: `palcoffee.ir`. CDN terminates visitor HTTPS and connects to host Nginx via HTTP80. Canonical full host config is `ops/palcoffee.conf` in Pal-Back repo (also in infrastructure workspace). Require visitor HTTPS and restrict origin to CDN IPs; origin HTTP is unencrypted.
- PM2 replacement can briefly interrupt requests; zero-downtime deployment is not claimed.

Manual recovery: read previous successful release from CI/deploy logs; set `current` to it, regenerate PM2 config using the same release path/port structure in `scripts/deploy-front.sh`, then `pm2 startOrReload /opt/pal/front/ecosystem.config.json --update-env`, verify both health URLs and `pm2 save`. Do not delete persistent data. Failed rollback needs operator intervention.

## Current host proxy and PM2

Public HTTPS returns200. Origin config listens on80 without TLS or redirect; CDN visitor HTTPS is mandatory. Old frontend-only ops/setup-front.sh and Certbot config remain historical bootstrap artifacts; do not run them against current full PAL proxy. Update the full config from Pal-Back ops/palcoffee.conf instead. App CI does not overwrite host Nginx.

PM2-deploy systemd service is enabled/active. Initial manual PM2 daemon caused a missing-PID service failure; adoption was fixed by saving and stopping it before starting the unit:

```bash
# Only needed to recover the manual-daemon/systemd conflict; briefly interrupts apps.
pm2 save
pm2 kill
sudo systemctl reset-failed pm2-deploy
sudo systemctl start pm2-deploy
```

Normal app reload:

```bash
pm2 startOrReload /opt/pal/front/ecosystem.config.json --update-env
pm2 save
```

Latest deployed frontend81047a3, successful CI/CD run37351058232 attempt2. Local setup clone under ~/.local/state/vinext-pal-setup/pal-front-release is not a production dependency. Scripts are versioned in this repo and copied to VPS releases; original dirty checkout was not overwritten.

Run isolated deployment checks with `bash scripts/test-deploy-front.sh`; no live services are touched.

## Navy/sky redesign release checkpoint (12 October 2026)

Local release preparation passed: 17 unit tests, typecheck, lint (7 existing unused-disable warnings), production build, and isolated deployment/rollback/backend-gate checks. A fresh standalone package with `public` and `.next/static`, no `.env*` files and hydrated LFS assets passed 190 redesign, 60 navigation/prefetch, 16 mocked editor and 30 Vira dialog browser checks. Local standalone API proxy returned all 8 seeded coffees. Evidence: `/tmp/pal-release-*.log` and `/tmp/pal-release-{redesign,navigation,editor,vira}/` on the preparation machine, not production acceptance.

Before publishing:

- Push to `origin/main` only with deployment approval: the current workflow may activate production automatically when `DEPLOY_ENABLED=true`. A local commit does not trigger it.
- Verify current GitHub production variables, SSH host key and backend health; do not assume historical settings above are still current. Build must use the production loopback backend URL, not local `8081`.
- Watch CI artifact/activation checks. Confirm public homepage, catalog, detail navigation, image URLs, phone menu, registration access and unchanged warm admin after activation. Third-party Enamad availability needs a live check; its image is now 1rem square with a 44px link target.
- Local seed populated only the local DB. Do not seed/overwrite production content automatically; review any production content import separately. Keep sales and public OTP gates unchanged.
- Keep previous release available for rollback. No production deployment, credential verification, live SMS or payment acceptance was performed during this checkpoint.
- An existing Git remote contains an embedded credential. Rotate it and switch that remote to credential-free authentication before using it. Never copy the remote URL into release logs or docs.

Only optimized runtime brand assets are part of this release; large local `newDesign/` reference inputs and agent/MCP setup files are not deployment dependencies.
