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
