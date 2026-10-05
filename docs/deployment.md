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

Frontend-only rollout uses `DEPLOY_ENABLED=true`, `API_HEALTH_REQUIRED=false`, frontend port 3005 and reserved backend port 8091. Pages deploy independently; real shop/login/event API flows remain unavailable until backend exists. Restore `API_HEALTH_REQUIRED=true` after backend deployment. This changes readiness checks only, not authentication or permissions.

CI installs Bun 1.4.2 with frozen `bun.lock`, runs tests/lint/typecheck/deployment self-check, then builds Next standalone on Node 22. The older npm lockfile is not used by this pipeline. Git LFS must hydrate video files; package rejects pointer-only assets. Env files are excluded from release archives.

Artifacts contain standalone server, `public` and `.next/static`; uploaded archive has SHA256 checksum. Deployed releases live under `/opt/pal/front/releases/<sha>-<run>-<attempt>`, with `current` symlink and PM2 app `pal-front` owned by deploy. Filesystem lock prevents overlapping activation. Existing unrelated apps are untouched.

Full activation requires backend `/health/` first. PM2 reload is followed by localhost homepage, login and catalog checks, plus same-origin `/api/v1/products/` when API readiness is required. Failure restores prior release/config and checks recovery; first-release failure removes the app. Releases are retained for recovery; review disk usage before deleting old inactive releases. No automatic pruning yet.

## VPS prerequisites

- `/opt/pal/front/{releases,shared}` owned by deploy.
- Node 22, PM2, curl, tar, SHA256 utilities, flock.
- Backend reachable on chosen free loopback port.
- PM2 startup service configured for deploy (requires root), so saved app survives reboot.
- Public domain: `palcoffee.ir`. Verify DNS/CDN origin and configure Nginx/TLS before declaring public rollout complete. App can run on loopback before proxy setup.
- PM2 replacement can briefly interrupt requests; zero-downtime deployment is not claimed.

Manual recovery: read previous successful release from CI/deploy logs; set `current` to it, regenerate PM2 config using the same release path/port structure in `scripts/deploy-front.sh`, then `pm2 startOrReload /opt/pal/front/ecosystem.config.json --update-env`, verify both health URLs and `pm2 save`. Do not delete persistent data. Failed rollback needs operator intervention.

## Root commands after first successful loopback deploy

Do not replace an existing PAL site without reviewing it first. Initial frontend-only config is packaged in each release:

```bash
sudo bash /opt/pal/front/current/ops/setup-front.sh --tls
```

Omit `--tls` only if TLS is handled elsewhere and origin HTTP is intentional. Script requires a healthy localhost frontend, refuses duplicate/unrecognized site config, validates before reload, rolls back newly created files on invalid config, and preserves existing Certbot changes on re-run. Run `pm2 save` as deploy after app activation (CI already does this). If DNS is proxied through CDN, verify its origin points to this VPS and ACME challenges reach it. Existing TLS elsewhere does not establish TLS on this origin. Preserve Certbot-managed site changes on later app deployments; workflow does not overwrite Nginx.

Run isolated deployment checks with `bash scripts/test-deploy-front.sh`; no live services are touched.
