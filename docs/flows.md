# Customer and staff flows

## Coffee store

1. Home has separate shop / events entry points, without stale October 2 countdown.
2. Catalog loads real active products + live categories, paginates all results; no mock fallback hides network failure. Detail displays IRR-derived تومان price, actual allowed grind choices and available stock; no invented pack weight.
3. Add to cart requires OTP login; safe local `next` brings customer back to detail. User reviews quantity/grind/line total in cart.
4. Choose owned delivery address or add address. Checkout creates unpaid `card_to_card` order, snapshots prices/address and clears cart.
5. Order detail keeps payment and fulfillment status separate. Select active destination card, backend returns amount + deadline. Upload private receipt; pending review **does not** mean paid.
6. Staff reviews in Django Admin/card decision endpoint. Backend approval commits stock once; customer refreshes status. Rejected receipt may be replaced before deadline. Expired payment requires explicit fresh start before sending money.
7. Order list/detail retain snapshot item names/totals, tracking code and correct fulfillment status.

Failure recovery: disabled submit while request pending; network failure never auto-retries checkout or upload. Customer checks Orders before retrying ambiguous checkout. Auth client refreshes once; invalid tokens cleared. No real gateway, wallet, external SMS, real card or production purchase used by local verification.

Known backend limits: shipping charge currently 0 (backend behavior, not promise of free shipping policy); no coupon UI, guest cart, weight variants, payment-method availability endpoint or order-payment listing. No speculative substitutes built.

## Events

1. `/submit` lists upcoming active backend events with price, date and available slots; no events → clear empty state.
2. Guests see event info, login CTA. Shop/events/staff use same account and OTP/JWT.
3. Existing registration for selected event → status link, not duplicate registration form. Past personal registrations remain in My Registrations.
4. Save account full name, choose available slot. Free event submits without receipt/card; paid event shows active bank cards, exact amount, private file input + optional reference.
5. Only backend 201 shows success artwork. Paid response explicitly pending; free response confirmed.
6. Status route requires account login, owner/staff permission. UUID link alone never grants access. Rejected status displays admin note + receipt resubmission; backend checks current capacity/open event.
7. Download receipts through authenticated blob requests; no public media receipt links, no credential in URL.

No card available → warn not to transfer money, block paid registration. Full slot disabled but server remains authoritative (capacity can change). On ambiguous POST response, reload My Registrations to detect existing request.

## Staff

`/dashboard` uses shared OTP account; server requires `is_staff`. Paginated DRF list, search/status filters, private receipt download, optional note then approve/reject pending registration. Browser cannot bypass role check. Old password-token endpoints, old arbitrary status PATCH and old receipt routes removed. Historical CSV utility retained/tested; dashboard CSV export not ported yet (not required customer purchase/registration path).

Django Admin remains authoritative for event/slot/card/catalog setup and card payment review. No new admin framework.

## UX baseline (integration, not redesign)

Retain existing Vazirmatn, cream/espresso tokens, RTL shell/artwork. Inputs labeled, touch controls >=44px, submit busy state, role=alert for errors, loading/empty/full/pending/confirmed/rejected/expired states distinct. Native selects, file inputs and address controls; no new UI dependencies. Responsive desktop/mobile checks precede user acceptance. Final typography/layout/palette/navigation redesign comes only after explicit confirmation of these real flows.
