# Frontend admin panel

User approved the panel and staff-only backend APIs on 2026-10-05. Public-site visual redesign is separate. Changes are local, not committed or deployed.

## Open the panel

Visit `http://localhost:3005/manage` (production: `https://palcoffee.ir/manage`). Staff sign in with their Django phone number and password at `/login?next=/manage` (nested panel links preserve their destination). Customer SMS-code login remains available. Password login uses `/api/v1/auth/staff/login/`, accepts active staff only, returns existing access/refresh tokens, and limits attempts by IP and normalized phone number (5/min each). Credentials are not stored by the frontend. Local SMS uses the console provider; no real SMS or money transfer is required for tests. Django Admin stays at `/admin/` (local `http://127.0.0.1:8081/admin/`, production `https://palcoffee.ir/admin/`); the two panels never share a path.

The panel covers products/categories/images, bundle components, order fulfillment, payment receipt review, gateway history, events/time slots/registration review, blog articles/categories, destination cards, customer profiles and SMS status. The overview uses current backend counts and paid-order totals, not sample analytics.

Staff roles stay in Django Admin. Gateway and SMS credentials stay in server configuration, not editable forms. Address snapshots and order items are visible in order details. Financial histories cannot be created or deleted through generic CRUD.

## Product editor modes

Products open in **حالت ساده**: name, category, rial price, stock, short intro, origin, roast, tasting notes and visibility. New products get unique editable URL/SKU identifiers and start with zero price/stock. **حالت پیشرفته** exposes the remaining existing fields. Inputs stay mounted: switching modes preserves values, and saving an existing product in Easy mode retains its advanced settings. Field errors in hidden settings reveal Advanced mode automatically.

Inline hints and **راهنمای افزودن محصول** explain rial/toman, unknown coffee facts, visibility and adding photos through **تصاویر محصولات** after saving. Other editors are unchanged. Run `docs/scripts/browser-product-modes.cjs` with installed Playwright for mocked create/edit, mode-switch and validation checks; it writes no real product data.

## Rules that protect records

Every `/api/v1/manage/` route requires Django `IsAdminUser`; frontend redirects alone do not grant access. Customers and guests cannot read or modify these endpoints. Shared JWT refresh is reused.

- Edit prices in integer **IRR**. Lists display تومان. No shipping, refund or provider policy is invented by this panel.
- Orders allow fulfillment, tracking and notes only. Payment amounts/statuses and stock-commit flags are immutable.
- Existing locked receipt-review services handle approval/rejection. Downloads require JWT; identifiers are not download credentials.
- Referenced products, event slots and other records cannot be deleted. Disable records that have an active flag instead.
- Bundle components cannot nest or change after orders exist. Slot capacity cannot fall below current reservations; reserved slots cannot move.
- Customer controls cannot change phone numbers, grant roles or edit staff/self accounts.
- Image uploads validate actual format and size. Django retains old uploaded files after replacement/deletion; physical media cleanup needs a separate retention policy.
- OTP text, gateway tokens and wallet-link secrets are omitted from management histories. SMS status means a send was recorded, not proof the recipient read the message.

## Design and text

UI/UX Pro Max guided the operational layout: right desktop sidebar, searchable paginated tables, restrained PAL colors and Vazirmatn, existing Radix dialogs, native fields. No new UI dependency, chart or public-site redesign.

Controls are at least 44px. Tables scroll within their container on small screens; forms become one column. Dialogs handle Escape, focus return and unsaved changes. Form errors focus the summary and link to affected fields. Light theme is forced across public pages and admin, per the latest user request. Dark toggle and keyboard shortcut are removed. Reduced motion is supported.

User-facing copy follows `.pi/skills/human-writing/SKILL.md`, as requested. Use direct Persian, say what happened, add a next step when useful. Keep financial warnings explicit. Avoid promises of security, automatic approval or delivery that the backend cannot establish. API field names, routes and status codes do not change for wording edits. Login shows actual API errors rather than calling every connection failure an invalid code. Unknown API failures no longer expose raw endpoint paths.

## Verification

Backend: `docker compose -p pal-local exec -T web python manage.py test --noinput`.

Frontend: `bun run typecheck`, `bun test lib/*.test.ts`, targeted ESLint and `bun run build`.

Local browser runner: `docs/scripts/browser-admin.cjs`. Requires existing Playwright (`PLAYWRIGHT_MODULE`), Chromium, protected local-admin credentials and fresh local demo tokens. Seed using the existing `seed-demo.py` with `PAL_LOCAL_DEMO=1`; never publish token files. Temporary fixtures/results live under `/tmp/pal-admin`. Runner deactivates its successful fixtures and preserves financial history. Demo cards are non-payable: **do not transfer money**.

Backend checks cover permission denial on every management route, CRUD, valid/invalid uploads, cache invalidation, financial immutability, fulfillment transitions, role protection, capacity, bundle history and stale-cart grinds. Browser checks cover real OTP staff login, CRUD, rejection/resubmission/approval, stock changes, private downloads, customer denial, search/pagination, deletion protection, keyboard focus and 375/768/1440px layouts.

Verified locally on 2026-10-05: **36 backend tests, 11 frontend tests, 39 admin browser/API checks passed**. Typecheck, targeted ESLint, production build and both repositories' diff checks passed. Desktop/mobile/tablet, light/dark and editor screenshots were inspected; evidence is in `docs/evidence/admin/`. Shared RTL dialog centering and DRF binary-download negotiation were repaired and regression-checked. No browser runtime errors were recorded. The existing customer store/event regression also passed **35/35 browser/API checks** after the text and shared fixes. Successful and interrupted admin demo fixtures were deactivated; order/registration/payment history was retained. Temporary JWT files were deleted. Production still needs provider credentials, deployment/security review, token-storage/XSS review and load/expiry acceptance. Reference selects currently load all pages; replace them with paginated search if catalogs grow large.
