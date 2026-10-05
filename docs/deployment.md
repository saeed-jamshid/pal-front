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

Deployment remains disabled until backend, ports, backup and public routing are verified. Builds and artifacts still run on every push.

CI installs Bun 1.4.2 with frozen `bun.lock`, runs tests/lint/typecheck/deployment self-check, then builds Next standalone on Node 22. The older npm lockfile is not used by this pipeline. Git LFS must hydrate video files; package rejects pointer-only assets. Env files are excluded from release archives.

Artifacts contain standalone server, `public` and `.next/static`; uploaded archive has SHA256 checksum. Deployed releases live under `/opt/pal/front/releases/<sha>-<run>-<attempt>`, with `current` symlink and PM2 app `pal-front` owned by deploy. Filesystem lock prevents overlapping activation. Existing unrelated apps are untouched.

Activation requires backend `/health/` first. PM2 reload is followed by localhost homepage and same-origin `/api/v1/products/` checks. Failure restores prior release/config and checks recovery; first-release failure removes the app. Releases are retained for recovery; review disk usage before deleting old inactive releases. No automatic pruning yet.

## VPS prerequisites

- `/opt/pal/front/{releases,shared}` owned by deploy.
- Node 22, PM2, curl, tar, SHA256 utilities, flock.
- Backend reachable on chosen free loopback port.
- PM2 startup service configured for deploy (requires root), so saved app survives reboot.
- Confirm public domain, DNS, TLS and Nginx upstream before setting `DEPLOY_ENABLED=true`.
- PM2 replacement can briefly interrupt requests; zero-downtime deployment is not claimed.

Manual recovery: read previous successful release from CI/deploy logs; set `current` to it, regenerate PM2 config using the same release path/port structure in `scripts/deploy-front.sh`, then `pm2 startOrReload /opt/pal/front/ecosystem.config.json --update-env`, verify both health URLs and `pm2 save`. Do not delete persistent data. Failed rollback needs operator intervention.

Run isolated deployment checks with `bash scripts/test-deploy-front.sh`; no live services are touched.
