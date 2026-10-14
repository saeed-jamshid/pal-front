# PAL public design

## Approved direction

PAL is a Persian-first coffee showcase and event site for customers in Birjand. The public design now follows `newDesign/designDemo/PAL Coffee — Industrial.html` and the supplied PDF references: navy typography, sky-blue circles and swirls, pale gray backgrounds, fine rules, generous spacing and square-edged product compositions.

`design.md` is the single public design baseline. Superseded design documents were removed; the warm admin palette is pinned in `app/manage/admin.css`.

## Scope and preserved behavior

- Presentation only. Preserve API calls, product selection/order, taxonomy, category membership, local filtering/View Transitions, auth, OTP gate, event registration, payment/status logic and all routes.
- Sales stay disabled. Do not copy demo prices, weights, add buttons or cart links into this show-only site.
- Keep current navigation labels and links, event CTA, login/account, logout and native phone popover.
- Replace the landing scene with the supplied logo arch and geometric composition. Keep registration/about scenes, recolored; retain their sandbox, scripts, accessibility and motion controls.
- Admin `/manage` stays on the warm palette, including dialogs. Staff login stays functional.
- Preserve gallery photos/viewer, historical story, PAL contact links, live Enamad code/URLs/referrer and Vira contact dialog.

## Assets and typography

Copy public-sized assets from `newDesign/assets` to `/public/brand/new-design/`; do not serve PDFs, the bundled demo, original PNG or reference screenshots as production UI.

Use `logo-mark.svg` + `wordmark.svg` for navigation, `logo.svg` for the footer, `logo-lockup.svg` for the hero, `bg-swirl.svg` and `swirl.svg` for decoration. Products with uploaded images keep them. Missing images use supplied coffee bag WebP mockup, per user choice. Its printed "100 ROBUSTA" is artwork, not product metadata; the detail-page mockup caption is omitted at the user’s request; use backend facts for all text. Never infer origin, blend, weight or price from the printed label.

Peyda is not licensed/bundled. Use existing self-hosted Vazirmatn for Persian body/headings (700–900 headings), Archivo for Latin names, native monospace for small section labels. No remote fonts. Persian headings must not inherit forced LTR direction from Latin product-name helpers.

## Tokens

| Role | Value |
|---|---|
| Navy / primary / links | `#2e3191` |
| Deep navy / body text | `#24266c` |
| Muted navy | `#555778` |
| Sky / decoration | `#93caed` |
| Page | `#f1f1f2` |
| Panel | `#e6e7e8` |
| Light sky panel | `#dcecf5` |
| Rule | `#b9bbd3` |
| Input border | `#73769e` |
| Error | `#b42318` |
| Orange decorative accent | `#ee9141` |

Spacing: 4, 8, 16, 24, 40, 64px. Public max width 1440px; responsive gutters 16–80px. Buttons/input corners 4px; product tiles square; circles reserved for decoration/menu/viewer controls. No heavy shadows, glass panels, warm backgrounds or invented social proof.

## Composition and components

- Landing: large RTL headline and existing event facts/actions on the right; supplied logo arch on the left, clipped circles and faint swirl behind it. On phones text precedes compact artwork. All existing content sections remain.
- Product cards: sky wash, fine border, large transparent bag/image with swirl, real title/notes/meta beneath. Bag fades/rises in over 750ms; background swirl scales from zero and rotates from −140° over 900ms, with a bounded 0–180ms card stagger and 120ms swirl delay. Both run once when cards mount; hover remains available after entrance. Reduced motion shows the complete card immediately. No fake price, weight or purchase button. Two columns on phones where readable, three on desktop; names wrap completely.
- Catalog: existing category controls and result states, compact rules and airy background. Product detail repeats bag composition with a clear specifications panel. Keep native Next Link shell/code prefetch; preload public coffee details on hover, keyboard focus or touch/pointer press. One in-memory intent slot expires after 30 seconds and is consumed by navigation; pending/successful requests are reused, failed preloads are discarded, and direct/later reads stay fresh. No persistent browser/server cache, no eager API request for every visible card, no changes to authenticated reads.
- Detail entry: 240ms fade/rise, with the same 750ms bag and 900ms scale/rotate swirl entrance as catalog. Reduced motion disables all three. Key loaded state by slug so a new URL never displays the previous coffee/error while loading.
- Footer/story use navy bands and light text; real contacts, seal and credit remain. “برای باهم بودن” uses the supplied چکیدن vector (V60/server, icon 04) from the updated Industrial demo, replacing the branch drawing. Preserve its geometry, normalize the exported viewBox, scope the clip ID and use an opaque pale-sky circle (radius 56 in the 120×120 viewBox) for contrast on navy. On first viewport entry, coffee fills once and drops fall three times, then settle; reduced motion leaves one static drop visible. Story text is unchanged.
- Forms, loading/empty/error states, gallery and secondary pages inherit consistent public tokens. Error text stays distinct from navigation/primary actions.

## Responsive, RTL and accessibility

- Check 320, 390, 840 and 1440px. Desktop navigation starts at 1001px; phone menu remains bottom-right with safe-area spacing.
- Logical CSS for alignment/padding. Do not reverse Persian names or isolate them LTR. Latin values stay isolated where needed.
- Minimum 44px controls, visible keyboard focus, labelled fields, disabled/busy feedback. No body horizontal overflow. Internal category scrolling is allowed.
- Decorative SVGs have empty alt text/aria-hidden; real content images retain meaningful text. Reserve image dimensions. Use WebP and responsive image sizes.
- Hero lockup enters once on page load: logo fades/rises over 900ms, sky circle scales in over 1000ms, outline ring follows with a 180ms delay. Only transform/opacity animate; no loops or layout shifts. Reduced motion shows the complete artwork immediately.
- Keep existing finite animations, reduced-motion support and offscreen/hidden-tab pauses in scenes. No new autoplay marquee or motion library.

## Card-to-card payment

- Event signup and order payment share a destination-card panel using existing navy/sky tokens. Show backend bank name, account holder, grouped LTR card number and optional IBAN; never invent banking details.
- Keep the destination selector and payment/receipt workflow. Show the selected card; reset event card selection when the event changes. Copy buttons use `type="button"`, copy values without spaces, announce success or failure, and leave values selectable for manual copy.
- Check phone/desktop layout, keyboard copy, destination changes, missing IBAN/cards, free events and denied clipboard access. Sales remain disabled.

## Persian display and admin controls

- User confirmed the event amount problem is extra decimals. Display whole toman with Persian digits and grouping; round only for display. Stored amounts and API payloads remain IRR.
- User requested both public and admin date/time fixes. Dates use the Persian calendar; admin date selection converts back to Gregorian ISO dates. Time selectors show Persian 24-hour values while preserving seconds in API payloads. Keep public navy/sky and admin warm palettes.
- Preserve useful Persian validation messages; replace English errors, expired-session, permission, throttling and server failures with Persian guidance.
- Admin receipts use authenticated blob requests, allow only JPEG/PNG/WebP/PDF preview, and release object URLs on close. No public receipt URLs or automatic approvals.
- Customer status filtering covers all matching API pages before local pagination because the current backend does not support this filter. Active/inactive filters reuse existing search; move filtering server-side when lists grow.

## Signup and status scenes

- Signup shows the first upcoming event title directly, matching the homepage; no event selector. Slot/card selection and authentication stay unchanged. Remove the two requested account-access helper sentences, not their access checks.
- Status page reuses the signup SVG scene: pending shows a sleeping cat with closed eyes and drifting sleep marks, confirmed a happy cat with a heart, rejected a sad cat. Status scenes keep their mood on hover/tap; tap only replays entrance. Existing signup petting remains unchanged.
- Keep sandboxed artwork, navy/sky palette, reduced motion and offscreen pauses. Check all three statuses, receipt resubmission, first-event slot payload and empty-event state on phone/desktop.

## Verification

Run typecheck, unit tests, lint and production build. Browser-check real rendering with isolated mocked API responses if local backend is unavailable: populated/error/empty catalog, filtering, long titles, product detail, mobile popover/keyboard, gallery dialog, login, event/status states and preserved admin colors. Capture phone/desktop screenshots. Report bugs and fixes separately; no deployment or production mutations.

### Local verification, 2026-10-12

- Typecheck and production build passed; 16 unit tests passed. Lint passed with 7 pre-existing unused-disable warnings in older browser scripts.
- `docs/scripts/browser-redesign.cjs`: 190 checks passed (including normal/reduced-motion hero, package/swirl and supplied drip-vector entrances on phone and desktop) on production build at 320/390/840/1440px. Includes palette restoration after admin navigation, warm portaled editor, catalog retry/empty/filtering, photo preservation, focus on navy panels, native phone menu, gallery keyboard/focus restoration, scene tap/success/replay/reduced motion, no page errors or failed same-origin assets, and zero API writes.
- Existing mocked product-editor script: 16 checks passed. Vira keyboard/focus/viewport/reduced-motion script: 30 checks passed.
- Product navigation: `docs/scripts/browser-product-navigation.cjs` passed 60 production-mode checks at 390/1440px: hover/focus/touch preload before click, no eager detail API calls, one request on navigation, failed-preload recovery, fresh direct visits, correct details, fade/swirl settling and reduced motion, zero API writes/page errors. Screenshots/report: `/tmp/pal-product-navigation/`. Unit tests now total 17, including pending preload reuse, expiry, one-use consumption and failure races. Build/typecheck/lint pass; 190 redesign regression checks remain green.
- Screenshots and report: `/tmp/pal-redesign-production/`; Vira screenshots: `/tmp/pal-redesign-vira/`. Local preview: `http://localhost:3006`.
- Bugs fixed: Persian card/detail names incorrectly inherited forced LTR Latin styling; keyboard outlines inside dark info panels blended into their background. Names now use automatic direction; panel focus outlines use white.
- Local backend was offline. API responses in browser checks were mocked; no live OTP/payment/registration or production acceptance claimed. Third-party Enamad availability was excluded from local checks; original seal integration is preserved, not replaced with a fake seal.

### Payment/admin polish verification, 2026-10-14

- `bun test lib/*.test.ts`: 20 passed. Typecheck/build passed; lint has zero errors and the same 7 older unused-disable warnings.
- `docs/scripts/browser-bank-card.cjs`: passed at 320/390/1440px with mocked API. Covers Persian whole-toman amount and Jalali date, selected card, keyboard/clipboard, denied copy, optional IBAN, free events, empty cards and event selection reset; zero API writes/page errors. Screenshots: `/tmp/pal-bank-card/`.
- `docs/scripts/browser-admin-polish.cjs`: passed at 320/390/1440px in Asia/Tehran. Covers Jalali date selection to Gregorian API payload, unchanged IRR, Persian hour/minute/second controls, matching theme/no dialog overflow, active/inactive customer filtering across API pages, authenticated image/PDF preview, invalid MIME/PDF rejection, object-URL release and Persian permission/throttle errors. Only two date/time saves per viewport, both intercepted mocks; no real writes. Screenshots: `/tmp/pal-admin-polish/`.
- Existing product-editor regression: 16 checks passed. Sandbox originally blocked native PDF preview; replaced with a MIME/signature-checked PDF blob in the browser viewer. PDF rendering visually checked. Native viewer appearance remains browser-dependent; download remains available.
- Sales remain disabled; hidden order payment integration was typechecked/built, not browser-accepted through redirected order routes. No backend changes, live payment, deployment or production acceptance claimed.
