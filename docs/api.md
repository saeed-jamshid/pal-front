# Runtime API contract

Base: `/api/v1/`. Browser uses same-origin proxy; server config `PAL_BACKEND_URL` points to Django. `NEXT_PUBLIC_API_BASE_URL` optional explicit API origin, without `/api/v1`. Never include credentials in public env. Shared client `lib/api.ts`: JSON, authenticated multipart, private blobs, one refresh retry after 401, DRF error text/fields, no-store. Tokens currently in localStorage (existing architecture): XSS can read them; consider HttpOnly BFF before production security approval.

## Authentication / account

| Method | Route | Payload / response |
|---|---|---|
| POST | `auth/otp/request/` | `{phone_number}` → 202; SMS queued |
| POST | `auth/otp/verify/` | `{phone_number, code}` (6 digits) → `{access, refresh}` |
| POST | `auth/token/refresh/` | `{refresh}` → `{access}` |
| GET / PATCH | `auth/me/` | JWT; `{id, phone_number, full_name}`; PATCH `{full_name}` |
| GET / POST | `auth/addresses/` | JWT; paginated / create |
| GET / PATCH / DELETE | `auth/addresses/{id}/` | Owner only |

Address: `title`, `recipient_name`, `recipient_phone`, `province`, `city`, `postal_address`, `postal_code`, `is_default`. Phone input normalized Persian/Arabic → ASCII. Staff shares OTP login; backend enforces `is_staff`, not frontend role guesses.

Sources: `accounts/{urls,views,serializers,models}.py`.

## Catalog / cart / orders

| Method | Route | Notes |
|---|---|---|
| GET | `categories/` | Public array `{id,name,slug,...}` |
| GET | `products/` | Public paginated; filters `category` slug, `available=true`, `featured=true`, `search`, `roast_level`, `brew_method` |
| GET | `products/{slug}/` | Public product detail |
| GET / DELETE | `cart/` | JWT; `{items,total,updated_at}` / clear |
| POST | `cart/items/` | `{product_id,quantity,grind_type}` |
| PATCH / DELETE | `cart/items/{id}/` | Owner only |
| POST | `orders/checkout/` | `{address_id,customer_note,payment_method}` → 201 full order; cart cleared |
| GET | `orders/` | Owner paginated |
| GET | `orders/{order_number}/` | Owner only |
| GET | `blog/posts/`, `blog/posts/{slug}/` | Public; `cover_image`, `category_name` |

Product: `name` (not title), category **numeric ID**, `origin`, `price`, `currency: IRR`, `available_stock`, `images[].image`, `tasting_notes` **string**, `brew_methods`, `allowed_grinds`. Grinds: `beans`, `espresso`, `moka_pot`, `french_press`, `v60`; never send old `ground`. Empty `allowed_grinds` (tools) → send empty `grind_type`, not beans. UI resolves categories from category endpoint. Catalog does not use backend `available=true` stock filter: bundles may have stock=0 but positive computed `available_stock`; actual detail availability comes from computed field. Pagination default 20; `page_size` is not supported by default paginator. Shared pagination walker follows backend page paths without forwarding JWT to host in `next`.

Cart items are flat `{id,product_name,price,quantity,grind_type}`; no product slug/image/id in read response. Do not fabricate product links. Placeholder image is existing asset, not claimed product photography. Line total computed `price * quantity`.

Order: `order_number`, `items[].product_name`, `unit_price`, `line_total`, `total_amount`, `currency`, `payment_status`, `fulfillment_status`, `tracking_code`, `created_at`. Payment: unpaid/pending/paid/failed/refunded. Fulfillment: new/preparing/shipped/delivered/cancelled. These are separate; unpaid does not mean preparing.

**Money:** preserve integer IRR throughout adapters and submissions. Display only converts IRR / 10 to تومان. No guessed 250g packs: backend exposes no weight variants. Existing weight-based UI hides grams when unavailable. No sensory metrics, score, arabica %, variety/altitude/process fields in backend contract; visual redesign must not invent them. Unsupported sensory bars and pack-weight labels hidden; only add back after approved backend fields exist.

Sources: `catalog/{models,serializers,views,urls}.py`, `orders/{models,serializers,views,urls}.py`, `blog/{serializers,urls}.py`.

## Independent card-to-card payment

| Method | Route | Notes |
|---|---|---|
| GET | `payments/cards/` | JWT; paginated active cards: id,label,card_number,iban,account_holder,bank_name |
| POST | `payments/card/start/{order_number}/` | Owner, `{card_id}` → payment data |
| GET | `payments/card/{payment_id}/` | Owner status |
| POST | `payments/card/{payment_id}/receipt/` | Owner multipart `receipt` |
| GET | `payments/card/{payment_id}/receipt/download/` | Owner/staff private binary |
| POST | `payments/card/{payment_id}/decision/` | Staff `{decision: approve|reject,note}` |

Payment data: `payment_id`, `public_id`, `status`, `amount_rial`, `expires_at`, `admin_note`, `card`. Receipt statuses: awaiting_receipt → pending_review → approved/rejected; expired possible. Payment ID stored per order locally to resume rejection flow. Missing ID can recover active payment via start (backend reuses active awaiting/pending payment). Cross-device rejected-payment discovery lacks order→payment endpoint: documented gap, not fabricated route.

Checkout UI uses `card_to_card` first: works without gateway/Bale credentials. Saman and Bale APIs still exist, intentionally not exposed as production-ready payment choices. `saman/start/{order_number}/` returns `mock://` in local mode; frontend must never treat mock as real payment. Gateway callback returns JSON, not frontend redirect. Real SEP contract/provider configuration must be verified before adding online-payment UX.

Sources: `payments/{urls,card_views,bale_views,balepay,services,models}.py`.

## Events (shared account, no standalone API)

| Method | Route | Notes |
|---|---|---|
| GET | `events/`, `events/{id}/` | Public active events; list excludes past dates |
| GET / POST | `events/registrations/` | Current-user paginated / multipart create |
| GET | `events/registrations/{uuid}/` | Owner/staff authenticated status |
| GET / POST | `events/registrations/{uuid}/receipt/` | Private download / rejected receipt resubmission |
| GET | `events/manage/registrations/?status=&event=&search=&page=` | Staff; event numeric ID only, not `all` |
| POST | `events/registrations/{uuid}/decision/` | Staff approve/reject + optional note |

Event: `id,title,description,date,price_rial,time_slots`. Slot: `id,start_time,end_time,registration_ceiling,remaining_capacity`. No venue/timezone field; slot times displayed as provided, dates interpreted as local calendar dates.

Create: `time_slot`, paid event `payment_receipt` + `card_id`, optional `reference_number`. **Never submit full_name/phone as registration identity:** first PATCH full_name to account; JWT supplies user. Response is registration object directly, not old `{success,data}` wrapper. `registration_token` UUID is identifier, **not authentication credential**.

Paid → pending manual review; free → confirmed without receipt. One registration per user per event. Pending and confirmed occupy slot; rejected releases capacity. Rejected resubmission checks open event + capacity again. Admin cannot arbitrarily set pending; only pending approve/reject transitions allowed. Private receipts fetched with Bearer auth as blobs, not public image links. Accepted backend formats JPEG/PNG/WebP/PDF, max 5MB; backend validates file content.

Sources: `events/{urls,models,serializers,views,services}.py` and payment receipt validation.
