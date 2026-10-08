# PAL phone-first polish

DESIGN-light.md remains the token and visual baseline. These user-requested overrides apply to the public showcase, not the admin layout.

- Phones are the primary device. Check 320, 375, 400 and 430px before desktop.
- Phones/tablets (<1001px): fixed top bar with PAL (right), a compact «ثبت‌نام رویداد» button and a 44px menu button (left) opening a native-popover dropdown that holds the page links and account/login. At 1001px+: PAL, four links, event button, account and logout. Mark the current page; close the panel on resize to desktop.
- Landing artwork is a large, borderless introduction. About and registration artwork are also borderless. Preserve sandbox isolation.
- Scenes keep their ambient loops (user choice) but stay cheap: transform/opacity/dash only, all CSS loops and the flag rAF (30fps) pause offscreen or in hidden tabs; reduced motion shows the complete artwork. On phones the landing crops its empty margins (viewBox 56 72 688 404). The registration scene shares the landing vocabulary (arch, lantern, plants, cup) with moving weather and its own barista cat that reacts to taps, watches the pointer and dozes when idle.
- Coffee bags adapt `pal-bag-mockup.html`: circles, orbit and coffee branch, flat token fills, self-hosted fonts. Labels use backend facts only; no demo coffees or invented weights. Names wrap without truncation. Entry, hover and leave feedback are short; touch links work with one tap.
- User-approved label-only mapping: single-origin → تک خاستگاه, commercial → تخصصی, blends → تجاری. Preserve IDs, slugs, ordering and product membership; do not infer a new taxonomy. Drugar natural and Ethiopia Yirgacheffe additionally appear under تخصصی (frontend `ALSO_IN`, backend category unchanged). Catalog cards have square corners and no «تازه» badge; coffee pages have no event button.
- Restore the historical story as a separate section with a branch drawing before a brief text fade. Text remains readable without JavaScript or with reduced motion.
- Footer: PAL + tagline, links (دربارهٔ ما, ثبت‌نام رویداد, قهوه‌ها, گالری), contact with icons (Instagram @palcoffee.ir, Telegram @pooriya_mqdm, phone 09393258985), copyright. Phone menu button is a 56px bottom-right circle (thumb zone) with a light ring so it reads over the dark footer; top bar = PAL + event button only.
- Gallery keeps 24 existing photos and near-viewport optimized thumbnails. Only the opened photo loads its full-resolution JPEG, with immediate preview, loading/error/retry, an original-file link, circular next/previous, keyboard arrows and horizontal touch swipes. Reuse the installed Radix dialog, restore opener focus, support pinch/vertical gestures and hide navigation behind the viewer.
- Catalog loads all coffees once and filters tabs locally; tab switches use native View Transitions (cards glide, others fade, ~250ms) with a plain swap for reduced motion or unsupported browsers.
- Keep light-only, logical RTL CSS, 44px minimum controls and existing OTP/event status/admin functionality.
- Staff login reuses PAL fields/buttons, labelled phone + password inputs, password-manager autocomplete and paste support, inline generic errors and disabled submitting state. `/manage` login defaults to password; customer OTP is unchanged.
- Footer includes the user-provided live Enamad seal (id 8054802). Preserve its URLs, code and origin referrer; reserve image dimensions, label the verification link, and never fabricate a local seal if the provider fails.

Verify typecheck, tests, lint and build. Inspect phone screenshots and iframe crops, label bounds, navigation touch/keyboard behavior, finite motion and horizontal overflow. No deployment or production data changes.
