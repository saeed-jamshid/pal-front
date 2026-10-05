# Friday event launch plan — working status, 30 September 2026

**Worktree only:** frontend/backend implementation in progress; no production deployment or payment activation. Existing worktree changes preserved. Source of truth for visual rules: [`DESIGN.md`](../DESIGN.md).

## Current state and decisions needed

- Existing site is Next.js 16, Persian/RTL. **Confirmed:** «قصه و قهوه», Friday 2 October 2026, 10:00 Asia/Tehran, Birjand. `/submit` remains **closed by default** until launch gates pass; it fetches real slots only when enabled (no sample slots). End time, exact venue/announcement wording, price and payment instructions still need confirmation. Do not accept receipts until those are confirmed.
- `/gallery` already labels May photos as **previous gatherings**. Keep that distinction in every hero, caption, metadata and share image.
- `palDesign/main.html`, `form.html`, `aboutus.html` are **illustrated SVG scenes with animation scripts**, not finished landing/form/about pages. Implemented as `EventArtwork` variants: landing, registration before/success, and about; static SVG snapshots isolate IDs and omit demo scripts/buttons. Complete art remains visible without JS and under reduced motion; no raw HTML injection or iframe.
- `../PalCaffeeEvetBackEnd/` is a separate Django repo with public `GET /api/time-slots/`, multipart `POST /api/register/`, token-based `GET /api/register/status/{uuid}/`, staff `POST /api/token/`, `POST /api/token/refresh/`, `GET /api/dashboard/` and `GET/PATCH /api/dashboard/{id}/`. This is **not** the storefront's unrelated `/api/v1` in `lib/api.ts`; keep integrations separate.
- `/dashboard` previously used an older registration contract (age/birth date/coffee preference, fake default receipt). Replaced with JWT-protected event staff view, server pagination/search/status, protected receipt fetch and CSV export across pages. Removed fake manual add, browser-local check-in and misleading browser-only catalog manager from event staff UI; prior catalog localStorage data has not been deleted. Backend requires real slot and receipt.

## Delivered in worktree

- Backend: event model and migration preserving legacy rows in separate unassigned history; per-event phone uniqueness; conditional atomic capacity claim; closed-by-default `EVENT_REGISTRATION_OPEN`; current-event slots; protected staff receipt route; dashboard pagination/search/history/status mapping. Nginx denies direct receipt media and proxies host frontend.
- Frontend: `/`, `/submit`, `/about`, `/submit/status/[token]`, `/gallery`, and `/dashboard` connected to documented states. Frontend `NEXT_PUBLIC_EVENT_REGISTRATION_OPEN` defaults off and also requires nonempty `NEXT_PUBLIC_EVENT_PAYMENT_INSTRUCTIONS`; backend `EVENT_REGISTRATION_OPEN` independently defaults off. Artwork is static SVG snapshots (no demo script), optimized previous-event gallery copies are 1200px WebP.
- Checks: frontend typecheck, lint, build and Bun tests pass. Backend `manage.py check`, `makemigrations --check --dry-run`, 19 tests pass using existing compatible venv (`../palback/venv`). `check --deploy` still warns about HSTS, HTTPS redirect (proxy topology undecided) and default local secret; Docker Compose now requires `SECRET_KEY`. Chromium screenshots inspected at 375/768/1024/1440px; see `/tmp/pal-home-768-final.png`, `/tmp/pal-home-375-final.png`, `/tmp/pal-home-1024-final.png`, `/tmp/pal-submit-375-final.png`, `/tmp/pal-submit-1024-final.png`, `/tmp/pal-gallery-375-10s.png`.

## Delivery order and release checklist

Implementation completed as listed above; numbered items below remain the acceptance criteria, including configuration and production verification.

### P0 — secure registration before opening

1. Confirm payment process, end time and venue wording; configure actual backend time slots/capacities in Django Admin. **Decision: keep previous registrations separately.** Previously, no event/date ID existed and phone uniqueness crossed event boundaries. Event scoping now exists in code; apply migration after verified backup, create/activate a dated event and slots, check historical records remain available and never reset live data automatically.
2. Backend hardening code now denies `/media/receipts/`, protects `/api/receipts/{id}/` with staff auth, verifies uploaded image content, rate-limits by Nginx-overwritten `X-Real-IP`, and uses atomic slot claims. Nginx `/` now targets host port 3000 via `host.docker.internal`. **Verify deployment**: HTTPS termination/forwarded protocol and trusted proxy CIDR, private media (including old URLs), DB+media backups, counter audit, concurrency last-slot smoke test, and rate limits for distinct external clients. Do not expose Gunicorn directly; default local cache is per worker.
3. Connect `/submit` to live slots with loading/empty/error/full states. Send only `full_name`, normalized `phone_number`, numeric `time_slot`, real JPEG/PNG `payment_receipt` (≤5 MiB) as `FormData` to `/api/register/`. No fabricated receipt, no invented amount. Render backend field errors beside fields, handle sold-out/race/429/offline, prevent duplicate submits, and provide returned **private** tracking token/link for status follow-up. Do not claim payment confirmed when response is merely `pending`. Prefer same-origin `/api/` at deployment; configurable origin only for local development.
4. Update `/dashboard` against actual Django responses: JWT sign-in/refresh/expiry, staff authorization, server pagination/search/status, `status_value` mapping, slot/time, count/export across pages, receipt viewing through protected endpoint, PATCH error handling with rollback/refetch; no silent optimistic success. Remove browser-only check-in claim or clearly mark as per-device until backed by server. Avoid leaking tokens or receipts through public URLs/export. Add integration coverage for login → list → change status and registration → token status.

### P1 — visual pages and launch copy

5. Turn each `palDesign/*.html` SVG into reusable React artwork (one scene implementation where genuinely shared, distinct shapes per variant), with scoped styling. Landing `/`: scene + concise confirmed event details + real signup CTA; no unverified water-reservoir tour/venue. Form `/submit`: artwork before/success driven by actual API response; status page/link available afterward. New `/about`: about artwork + factual Pal copy, links to gallery. Update desktop/mobile header from `/#about` to `/about` once route exists. Keep `/gallery` archival; select/optimize representative images (current JPEGs are often 5–11 MiB) rather than serve every full-resolution original.
6. **Decision: illustration palette stays in artwork only.** Use existing Vazirmatn and site `--crp-*` tokens for interface; SVG paper `#f8f3eb`, ink `#1c1512`, terra `#a23a24`, orange `#ff8030`, sand `#dcc8a4` remain scoped to art. Keep established white/night theme unchanged. Limit continuous animation, respect reduced motion, avoid pointer-only actions, and preserve Persian RTL/keyboard focus.
7. Source remaining event assets: approved event logo/wording, venue reveal/map (once confirmed), poster/social vector exports (SVG + PNG at target sizes), real previous-event photos with permission and truthful captions. Keep assets in `public/`, document ownership/alt text, and avoid placeholder schedule or payment details.

### P2 — cleanup, verification, release

8. Review existing staged/unstaged changes **without discarding or resetting them**. Separate unrelated shop/catalog/blog work from event launch; tests/build/lint now pass. Run full deployed staging flow and backend concurrency tests on target host, review generated assets and check older shop flows for regression.
9. Browser check at 375/768/1024/1440px plus keyboard, RTL and reduced motion: `/`, `/submit` (empty/full/error/success), `/about`, `/gallery`, staff `/dashboard` (401/403, pagination, PATCH errors, restricted receipt). Inspect desktop/mobile screenshots; confirm no horizontal scroll, clipping, inaccurate copy or accessibility regressions.
10. Deploy in order: backend migration + verified backup + HTTPS/proxy/media restrictions → frontend staging against test data → real registration smoke test + staff confirmation + token status → publish CTA. Keep signup closed on failure; monitor rate limits, uploads, capacity and errors. Rollback frontend to preview/closed CTA without losing submitted registrations; restore database only from verified backup with operator approval.

## Launch gate (must pass before enabling signup)

- Event details, payment destination/amount, location messaging approved; previous photos explicitly archival.
- Backend capacity and event scoping tested (including concurrent last-slot requests); no public receipt access.
- One real staging registration returns private token; status lookup works; admin can view protected receipt, paginate, confirm/reject; failures do not fake success.
- Frontend build, lint, tests and backend checks pass; responsive/accessibility/reduced-motion checks complete; HTTPS and backup/rollback tested.

**Confirmed decisions:** event name/start/Birjand; public signup only after launch gates; previous registrations separate; artwork colors local. **Still needed:** payment destination/amount, end time, venue announcement wording, production topology/HTTPS and authorized image permissions. Backend capacity code exists but must pass deployment concurrency smoke test. Until launch gate passes, both flags stay false and `/submit` stays preview-only.
