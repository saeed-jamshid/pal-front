# Integration verification / redesign gate

Date: 2026-10-05. Backend `e100c43`, frontend pre-existing HEAD `ba17811` with retained dirty worktree. No production environment, real SMS, real transfer or live gateway used.

## Checks

| Check | Result |
|---|---|
| Isolated `pal-local` PostgreSQL/Redis/web/worker/nginx | Running; health DB + Redis OK |
| Django `manage.py test --noinput` in web container | **27 passed**, PostgreSQL test DB created/destroyed |
| `bun test lib/*.test.ts` | **8 passed** |
| `bun run typecheck` | Passed |
| ESLint on touched integration TS/TSX files | Passed; not blanket claim about unrelated historical code |
| `bun run build` | Passed with existing Cache Components / Partial Prefetching flags |
| `git diff --check` | Passed |
| Real browser + API suite | **35 passed** on final standalone build, including local admin login; [report](evidence/browser-report.json) |

Runnable checks: `lib/{api,shop,event-api,event}.test.ts` and [`scripts/browser-flows.cjs`](scripts/browser-flows.cjs). Browser script reuses external existing Playwright installation; no project dependency added.

## Actual flow coverage

- Next proxy preserves trailing slashes; OTP sends `phone_number`, six-digit code; worker delivers generated console SMS; browser login submits by Enter and returns to product.
- Real coffee product → cart quantity → owned address → checkout → unpaid/new order → destination card → private receipt → pending review.
- Staff reject → customer replacement receipt → staff approve → paid/new order; repeat approval accepted without duplicate transaction (backend suite verifies stock behavior).
- Other account denied order/store receipt. Public event status denied; other account denied event receipt; customer denied staff review/dashboard.
- Shared account full name + paid event multipart → pending; duplicate registration denied; rejection note → replacement receipt → confirmation.
- Full slot disabled + server rejects direct full-slot request. Free event has no receipt input, auto-confirms. Existing registration replaces duplicate form.
- Mobile keyboard menu navigation; catalog/cart/events no horizontal overflow at 390px. Products with no allowed grinds send empty grind (tools), not invalid beans.
- Staff authenticated list; local Django Admin login/CSRF smoke check in final run. Event/card decisions exercised through real staff API; frontend staff decision buttons still require manual acceptance.
- Desktop 1440x1000/mobile 390x844 captures, no page runtime errors in final successful run. Animation disabled for stable screenshots; mobile captures inspected, submit width corrected. Captures are baseline integration evidence, **not approved redesign or complete accessibility audit**.

## Re-run against isolated local stack

```sh
# Verify pal-local is local + SMS_BACKEND=console before creating fixtures.
umask 077
mkdir -p /tmp/pal-integration
docker compose -p pal-local -f ../Pal-Back/docker-compose.yml exec -T \
  -e PAL_LOCAL_DEMO=1 web python manage.py shell < docs/scripts/seed-demo.py \
  > /tmp/pal-integration/demo-private.txt
# Last stdout line is JSON. Save as demo-private.json mode600; contains ephemeral JWTs.
docker cp pal-local-web-1:/tmp/pal-demo-receipt.png /tmp/pal-integration/receipt.png
PLAYWRIGHT_MODULE=/tmp/pm-playwright-audit/node_modules/playwright-core \
  node docs/scripts/browser-flows.cjs
```

Fixture script creates local demo users/events/slots/dummy bank card and generated image. It never calls real SMS/payment. Browser suite performs genuine writes **only in isolated demo DB/media**. Each run gets fresh events/users. Full-slot fixtures deliberately consume one slot. Admin smoke reads `~/.local/state/pal-coffee/local-admin.json` mode600; credentials never committed/displayed in reports. Delete ephemeral JWT fixture files after testing; do not copy into docs/evidence.

## Issues found and repaired during verification

- Old standalone event routes + public UUID-status assumption replaced with shared `/api/v1/events/` and account auth.
- Guessed product/category/cart/order fields and تومان/ریال mix corrected.
- Next slash removal + Django APPEND_SLASH produced redirect loop; `skipTrailingSlashRedirect` + explicit slash on proxy destination fixes GET and preserves POST body.
- Coffee/tool grind difference fixed; computed bundle availability no longer hidden by stock-only list filter.
- Checkout mutation controls gated while requests run; optimistic quantity no longer displays stale price totals.
- Submit layout inherited centered wrapper; full-width main restored for responsive forms.
- Early test-only failures: URL glob query slash mismatch, navigation-before-render selector collision, hidden native option wait, immediate disabled assertion, label locator matching option text. Script corrected, not disguised as product failures.

## Remaining release / acceptance limits

- **User confirmation required before visual redesign.** Current palette/layout not redesigned.
- Card-to-card is first implemented payment UX. Saman/Bale wallet not exposed until real credentials/provider contract/callback UX verified; local mock is not real payment.
- No official product photography or weights/sensory data in seed contract. Existing placeholder photos retained, no invented metrics shown.
- No cross-device rejected-order-payment discovery endpoint; local payment ID resume only. Shipping policy (backend currently zero), ownership/privacy/image publication and production SMS/cards/HTTPS/backups need owner review.
- Tokens remain localStorage (existing architecture); HttpOnly BFF/XSS review required for production security sign-off.
- No blanket keyboard/contrast/screen-reader audit, concurrent load test, frontend staff decision-button acceptance, expiration-clock end-to-end test or production readiness claim. Backend capacity/receipt/payment checks covered by its suite; frontend expiry UI is not yet acceptance-tested.
- Old dashboard CSV export not ported in this customer-flow slice; current staff filters cover all event history, backend event filter accepts numeric ID only.
- Existing old dev server on 3001 and unrelated project on 3000 were not killed. Review this verified build on **3005**.
