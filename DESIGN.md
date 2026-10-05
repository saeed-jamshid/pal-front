# Pal Coffee Design System

## Landing animation and light-only theme — approved (2026-10-05)

User approved reuse of `~/Downloads/PAL · آبانبار.html` on landing. `EventArtwork` embeds the same SVG/CSS/JS scene from `public/pal-design/landing-animated.html` in a scripts-only sandbox; no canvas or new dependency. Preserve 8:5 geometry, artwork colors, existing responsive hero and store/event links. Replay is a keyboard-accessible button; a separate pause/resume control stops motion. Reduced-motion renders the finished scene; continuous animation pauses offscreen and in hidden tabs. Other page artwork remains static. Verify desktop/mobile, keyboard replay/pause, sandbox, reduced motion and hero links.

User also requested light theme only across public pages and admin. Force existing `white` palette; remove dark toggle and `d` shortcut, ignore saved/system dark preferences. Historical dark-mode trials below are superseded; retain CSS tokens without exposing theme switching.

## Frontend admin — approved implementation (2026-10-05)

User approved `/admin` operational panel and required staff-only backend APIs. [Admin scope/design/testing](docs/admin.md). UI/UX Pro Max verified Data-Dense Dashboard + confirmation/responsive-table/success-feedback guidance; consumer hero/palette search results rejected as poor fit. Preserve PAL warm tokens/Vazirmatn; right desktop sidebar, compact overview/searchable paginated lists, existing accessible Radix editors, native fields, explicit IRR money, private receipt review. Scoped admin CSS; public visual redesign remains unapproved. No fake charts/metrics or provider credential editing. Test mobile375/tablet768/desktop1440, keyboard, light/dark, reduced motion and server permission boundaries.

## Store + events restart — integration gate (2026-10-05)

User's current brief: PAL is both coffee store and event website. First verify `../Pal-Back`, align frontend API/customer flows, document/test, then obtain explicit user confirmation **before visual redesign**. Older one-off event brief/countdown below is historical, not current homepage truth. See [current docs](docs/README.md).

This phase retains existing palette, Vazirmatn, artwork, `ed-shell`, RTL and breakpoints. Only functional UI changes: live categories/grinds/prices, addresses/checkout, independent card receipt flow, upcoming backend events, authenticated status/resubmission and shared staff login. No visual direction change or new UI dependencies. Hide unsupported product sensory/weight claims; do not invent backend data. Native inputs/selects, loading/empty/error/busy/full states, >=44px actions, distinct payment vs fulfillment, private receipts. Verify desktop 1440 and mobile 390, keyboard reachability, overflow and real backend flows. Typography/navigation/hero redesign remains proposed until approval.

## Friday event visual integration — implementation (2026-09-30)

Implementation sequence, API/security blockers and launch gates: [`docs/friday-event-launch-plan.md`](docs/friday-event-launch-plan.md). Frontend pages, artwork and backend contracts updated in worktree; **registration remains closed on both frontend and backend by default**, with no deployment or payment activation. Existing palette/theme notes below are historical trials or proposals; do not silently replace them.

**Audience and direction.** Persian-first Pal community in Birjand; an inviting, editorial event site, not a generic commerce landing page. Use Pal's own ink-drawn coffee/آب‌انبار imagery and real archival photos. One clear CTA per page. Do not imply an unannounced venue, invented itinerary or that old photos show this Friday's event. Confirmed event: «قصه و قهوه», Friday ۱۰ مهر ۱۴۰۵ / 2 October 2026, 10:00 Asia/Tehran in Birjand. Exact venue, end time and payment instructions remain unconfirmed.

**Artwork → page map.** `palDesign/main.html` → landing hero; `palDesign/form.html` → form before/success; `palDesign/aboutus.html` → `/about`. Three source HTML files are SVG animation demos, **not forms or page templates**. `components/event/EventArtwork.tsx` uses pre-rendered vector snapshots in `public/pal-design/` (drawn from original SVG + DOM-generated plants/linework); distinct form art is controlled only by real 201 response. Static SVG intentionally omits looping demo animation and global JS, so artwork renders immediately in image contexts and reduced motion. SVG internal IDs are isolated by external image documents. Keep header link to `/about` and `/gallery` labeled as previous gatherings.

**Visual tokens (illustration source; artwork only, confirmed).** Paper `#f8f3eb`, ink `#1c1512`, terracotta `#a23a24`, orange `#ff8030` (art highlights only), sand `#dcc8a4`, sage `#6fa99b`. Keep site-level `--crp-*` white/night tokens unchanged; do not spread SVG hard-coded colors into form controls. Typography: existing Vazirmatn body/labels/headings, A_Soraya only for short display accents. Prefer fluid spacing and the existing `ed-shell`; at 375px stack hero/form, at 768px allow two columns when readable, at 1024/1440px give artwork and content equal visual weight. No cropped essential SVG labels or horizontal overflow.

**Interactions.** Keep public registration closed until launch gates pass. Label every field; submit button disabled only while sending or when registration is deliberately closed. Expose loading, sold-out, network error, field validation, pending-review and confirmed states distinctly. Never show illustration's success state before 201 registration response. Registration token/status link is private. Keyboard focus visible, tap targets ≥44px, Arabic/Persian numeral input normalized at boundary, logical RTL order. Reduced-motion visitors get complete static scenes; pause continuous animation offscreen and avoid pointer-only effects. Maintain 4.5:1 small-text contrast.

**Image and verification targets.** `public/img/gallery/optimized/` contains 1200px WebP variants from prior gathering images; originals remain untouched and gallery/home use optimized copies. Confirm image publication permissions with owner before release; keep accurate archival alt/captions. Check landing, form (all states), about, gallery and staff pages at 375/768/1024/1440px, keyboard and reduced motion; compare against these rules after desktop/mobile screenshots. Existing gallery and shop are not to be redesigned as part of the event artwork conversion.

## Landing animation trial

Landing visual is now a responsive PAL wordmark with illustrated coffee beans. Existing Framer Motion staggers bean arrivals; reduced-motion visitors see the finished composition immediately. No WebGL or blue pixels.

## Palette trial — Foundation Café (2026-09-29)

`tryDesign.md` supplies day/white/night palette for current event and shop. This is a **trial**, not a new product identity: retain Persian Vazirmatn, event content, existing navigation and checkout. Day uses oat `#F4EFE8`, surface `#FBF8F4`, well `#EAE3D9`, espresso `#2B1F19`, crema `#954F28`; night uses espresso `#1A1411`, cream ink `#F1E9DF`, crema `#D9895A`. Existing `--crp-*` aliases in `app/globals.css` carry these values so existing pages inherit them. White is now default (`.white`: `#F8F3EB` page ground, `#FFFFFF` section/card surface, `#F9F5F0` secondary section/well, `#E7E1D9` lines); home and catalog alternate these three grounds by section; keyboard `d` toggles white/night. Day remains available as the root palette or `.light` theme. Buttons and button-like CTAs now use transparent fills with visible espresso borders and ink text; crema stays for hover, links, prices and focus. Selected tabs/options use borders, not fills. Mobile catalog uses two columns, tablet three, desktop four; touch targets stay at least 44px. Autumn/Birjand variants and new fonts are **not** part of this trial. Earlier color direction below is historical.

## Direction: قصه و قهوه — پاییز ۱۴۰۵

**Current redesign brief (2026-09-29):** Minimal, photo-led site for Friday ۱۰ مهر ۱۴۰۵ / ۲ October ۲۰۲۶ at ۱۰:۰۰ Asia/Tehran. Name proposal: «قصه و قهوه»; an approachable meeting point for Birjand's local culture and coffee. Venue is **not announced**. Existing registration/payment/API remain in use with user's approval; do not carry over the old venue, old event name, or unconfirmed end time. Photos from May are archival; label them as previous gatherings, never as this week's event. Palette below is a proposal until user supplies final colors.

Proposed palette: bone `#F7F2E8` (background), ink `#29221D` (text), fired clay `#8E3F2D` (primary action), sand `#DFD1BC` (lines), soft beige `#EDE3D3` (secondary surface), saffron `#A76319` (rare detail). Inspired by Birjand's adobe and warm morning light, without costume-like traditional ornaments. Use near-black on saffron/light surfaces; cream on clay buttons (verify contrast). No new fonts: Vazirmatn for interface.

**Override for this event:** one short hero sentence, one photo, date/location, live countdown and one registration CTA. No speculative itinerary, venue, decorative grids, hard-shadow cards, or repeated marketing copy. Elsewhere, preserve shop capabilities while reducing visual noise. Original After Taste wording below is historical, not current-event copy.

Pal Coffee uses **bold, product-led editorial minimalism** with a warm Persian identity. [Foundation.ua](https://foundation.ua/) is a reference for its clean coffee storefront, confident type, simple navigation, prominent product imagery, and restrained high-contrast palette—not a template to copy. Pal's borders and occasional hard shadows add a tactile edge; they should not turn every section into a neo-brutalist poster.

The experience should feel:

- Bold but warm
- Editorial, not corporate
- Iranian and Persian-first
- Crafted rather than luxurious
- Playful without becoming childish
- Direct, tactile, and product-focused

## Core Principle

**Copy constraint (superseded for this new event):** The previous After Taste event's wording, date, venue and program do not apply. Keep Persian copy human, specific, short; do not invent performers, schedules, or a venue. Typography stays readable and restrained: one visual focal point per section, not 900-weight oversized headlines everywhere.

Unify Pal Coffee's warm illustrated identity with its store. Home, catalog, product, cart, orders, and blog must look like one brand.

Use one oversized statement at a time, clear hierarchy, generous breathing room, simple product grids, and Pal's existing artwork. Keep buying and browsing straightforward. Avoid generic dark e-commerce cards, glassmorphism, soft SaaS layouts, and excessive pills.

## Visual Language

### Style

Primary style:

- Contemporary editorial coffee commerce
- High-contrast typography on spacious, light surfaces
- Straightforward modular grids with product photography as focal point
- Selective color blocks and tactile borders, not decoration on every card

### Foundation.ua → Pal translation

| Observed on Foundation.ua | Apply at Pal Coffee |
|---|---|
| Black/white foundation with electric-blue (`#0046FF`) accent | Keep Pal's cream/espresso foundation and terracotta action color; do not import blue. |
| HelveticaNeueCyr sans and direct, bold headings | Keep Vazirmatn for Persian hierarchy and legibility; reserve display fonts for brief accents. |
| Plain category navigation and prominent catalog entry points | Use readable RTL links and category tabs; make active state obvious without pill overload. |
| Product-first storefront with clear product imagery | Lead catalog and product detail with real coffee photos, names, prices, and an unambiguous buy action. |
| Minimal, spacious presentation | Let whitespace and alignment do work; use borders or hard shadows only when they clarify structure. |

Reference describes current site direction, not a requirement to reproduce its layout, copy, or branding.

### Signature Detail

Each major page may have one memorable editorial moment: Persian headline paired with Pal artwork or a product photograph. Keep catalog and checkout especially clear; do not break the grid at the expense of scanning products or prices.

## Color System

Proposed colors for the new event; tokens preserve existing names so shop pages inherit the redesign. Do not adopt Foundation's blue.

| Role | Color | Token |
|---|---:|---|
| Main background | `#F7F2E8` | `--crp-cream` |
| Primary text | `#29221D` | `--crp-espresso` |
| Primary action | `#8E3F2D` | `--crp-terracotta` |
| Secondary surface | `#EDE3D3` | `--crp-warm` |
| Structural border | `#DFD1BC` | `--crp-sand` |
| Legacy illustration accent | `#73A89C` | `--crp-sage` |
| Decorative detail only | `#A76319` | `--crp-amber` |
| Supporting dark text | `#493C34` | `--crp-dark` |

### Color Rules

- Bone dominates backgrounds; ink defines typography and key borders.
- Fired clay is the only CTA/interaction color; bone-on-clay passes WCAG AA (6.49:1).
- Amber is decorative only (4.24:1 against bone, insufficient for small text); sage only belongs to existing Pal artwork.
- Prefer whitespace to color-block sections. Dark backgrounds only when they help comprehension, never across entire shop.
- Maintain WCAG AA contrast for body text and controls.

## Typography

### Persian

Use existing **Vazirmatn** variable font.

- Hero: 800–900 weight, reserved for one focal statement
- Headings: 700–800 weight; use 900 sparingly
- Body: 400–500 weight
- Labels: 500–700 weight

### Display Accent

Use existing `A_Soraya` sparingly for brand moments, short quotes, or logo-adjacent text. It must not replace readable interface typography.

Use `Playwrite GB S` only for short English accents such as `PAL`, edition numbers, or campaign labels.

### Scale

```css
--type-hero: clamp(3.5rem, 11vw, 10rem);
--type-display: clamp(2.5rem, 7vw, 6rem);
--type-h1: clamp(2.25rem, 5vw, 4.5rem);
--type-h2: clamp(1.75rem, 3.5vw, 3rem);
--type-body: clamp(1rem, 1.2vw, 1.125rem);
--type-label: 0.75rem;
```

### Typography Rules

- Headlines may occupy multiple grid cells.
- Use tight heading line height: `0.9–1.05`.
- Keep body line height between `1.7–2` for Persian readability.
- Avoid centered body copy except short campaign introductions.
- Never use tiny text below `12px`.

## Layout

### Grid

Desktop pages use a visible 12-column editorial grid. Mobile collapses to one primary column with occasional two-column product metadata.

```css
--page-max: 1440px;
--page-gutter: clamp(1rem, 3vw, 3rem);
--grid-gap: 1px;
--section-space: clamp(4rem, 10vw, 9rem);
```

Use spacing and occasional fine rules to expose structure. Prefer consistent product grids over floating cards.

### Shape

- Main blocks: `0–8px` radius
- Buttons: square or lightly rounded
- Circular controls: icon-only actions and status markers only
- Borders: `1–2px`, usually espresso or sand
- Shadows: none in current minimal direction; distinguish groups with spacing or a single rule

Avoid large `16–32px` card radii throughout shop.

### Spacing

Use generous spacing around major statements, tighter spacing inside product/spec grids. Preserve hierarchy rather than applying equal padding everywhere.

## Header and Navigation

- Fixed or sticky header with cream background and solid bottom border
- Pal logo and name remain visible
- Desktop navigation uses plain text links, not pill containers
- Cart displays count as compact numeric marker
- Active link uses underline, solid block, or inverted color
- Mobile menu uses full-width editorial rows with minimum 44px targets
- Keyboard focus must remain clearly visible

## Home Page

The home page should introduce Pal as culture and community before selling products.

Current event home order:

1. Event name, one-line description, Friday ۱۰ مهر at ۱۰:۰۰, venue pending, countdown, registration action
2. One clearly labeled archival photo from previous gatherings
3. Compact shop and gallery links
4. Simple footer with contact

Do not show old event copy or present archive imagery as documentation of upcoming event.

Keep illustrations but place them inside stronger grids. Remove decorative cards that do not communicate content or action.

## Catalog

### Hero

Use a large Persian statement such as:

> قهوه‌ای برای هر جور رفاقت

Pair it with Pal artwork or one featured coffee image. Hero should span most viewport width and feel like a magazine cover.

### Category Navigation

Categories remain:

- تک‌خاستگاه
- تخصصی
- تجاری

Present them as bordered tabs or full-width grid cells. Avoid small floating pills. Active category receives a solid Pal accent background.

### Product Grid

Use a scannable grid with occasional editorial variation:

- Consistent product cells for quick comparison
- At most one featured product or story tile when there is real content to feature
- Product photography may be full bleed, but names, prices, and actions stay easy to scan

Each product tile includes:

- Sequence number (`01`, `02`, …)
- Name
- Region
- Category or score
- Up to three tasting notes in one line
- Starting weight and price

Hover behavior:

- Accent background or border inversion
- Image crop shifts slightly
- Hard shadow or 2–4px physical translation
- No soft floating shadow

## Product Detail

### Hero

Use split-screen composition:

- Large product image
- Oversized name and region
- Category, score, and price integrated into grid

### Information

- Show origin/specifications as bordered definition table
- Show sensory profile as large horizontal bars
- Show tasting notes as editorial text, not many pills
- Brew methods become selectable illustrated color blocks
- Selected brew method may swap one accent token
- Keep purchasing controls close to current price and stock state

### Purchase Bar

On desktop, buy panel may stay sticky beside content. On mobile, use sticky bottom purchase bar without covering content.

Controls must provide:

- Weight
- Grind type
- Quantity
- Current total
- Add-to-cart action

Minimum touch target: `44 × 44px`.

## Cart, Orders, and Login

Use same cream, borders, and editorial hierarchy.

- Cart items appear as rows, not detached rounded cards
- Checkout total uses one strong terracotta or espresso block
- Order progress uses numbered steps with text labels
- Login should be sparse: one bold statement, phone input, OTP flow
- Errors appear next to relevant field
- Loading and submission state must be visible

## Blog

Treat blog as an independent coffee journal within same system.

- Large issue-style title
- Editorial image crops
- Reading time/date as compact metadata
- Feature story may break grid
- Article body uses narrow readable measure
- Each post may select cream, espresso, sage, or terracotta hero treatment while body remains readable

## Imagery

Use existing Pal assets as brand material:

- `pal_cups.png`: hero/campaign artwork
- `pal_people.png`: community story
- `pal_lady.png`: manifesto or quote section
- `pal_machine.png`: roasting/process content
- `pal_bean.png`: origin/sensory content
- Product photos: catalog and commerce

### Image Rules

- Prefer deliberate crops over showing entire asset every time.
- Mix cutout illustrations with full-bleed photography.
- Product imagery must remain dominant in commerce sections.
- Avoid generic stock-coffee imagery.
- Use `next/image`, reserve dimensions, and mark only above-fold LCP image as `priority`.

## Motion

Motion should feel mechanical and editorial.

- Page/section reveal: `300–450ms`
- Product stagger: approximately `60ms` between items
- Hover shift: `150–250ms`
- Button press: translate `2–4px`, reduce hard shadow
- Image scale/crop: subtle, maximum around `1.04`

Avoid floating animations, excessive parallax, and constant decorative motion.

Always support:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Components

### Buttons

- Strong fill or visible 2px border
- Short direct labels
- Hard press feedback
- Minimum 44px height
- Visible `focus-visible` outline

### Cards

Use cards only when content needs grouping. Prefer grid cells and rows. Cards should use visible borders, low radius, and no soft shadow.

### Tags

Tags communicate real metadata only: category, tasting note, status, or roast. Avoid turning all controls and labels into pills.

### Icons

Use installed Tabler or Lucide icons. Do not use emoji as interface icons. Icon-only buttons require accessible Persian labels.

## RTL and Accessibility

- Root shop and content pages use `dir="rtl"` and `lang="fa"`
- Keep numbers/prices readable; isolate LTR values where needed
- Logical CSS properties preferred: `margin-inline`, `padding-inline`, `inset-inline`
- All navigation uses `next/link`
- Interactive elements must work by keyboard
- Focus must remain visible
- Body text contrast: minimum `4.5:1`
- Large text contrast: minimum `3:1`
- Do not rely on color alone for category, roast, or order status
- Test at 375px, 768px, 1024px, and 1440px

## Do

- Use Pal's own palette and illustrations
- Make typography clear without crowding product information
- Build clear, spacious editorial grids
- Let product images occupy space
- Use asymmetry intentionally
- Repeat strong CTA at useful decision points
- Preserve Persian readability

## Avoid

- Copying Foundation's blue palette or exact compositions
- Generic dark luxury e-commerce styling
- Glassmorphism
- Purple gradients
- Repeated rounded cards
- Excessive pills
- Soft floating shadows
- Decorative animation without purpose
- New font or UI dependencies without demonstrated need
- Dense text-heavy sections without visual hierarchy

## Implementation Priority

1. Set shared palette and simplify shared header, grid and button treatment across site
2. Replace outdated event home, registration and gallery; keep payment/API behavior
3. Let existing catalog, product, cart, orders, login and blog inherit shared minimal tokens
4. Validate responsive behavior, focus, contrast, reduced motion, and event time in Asia/Tehran

## Reference Summary

Foundation.ua contributes:

- Clean light surfaces, dark text, and one clear accent
- Bold but readable type hierarchy
- Plain navigation and obvious catalog entry points
- Product photography and scannable commerce information
- Spacious modular rhythm rather than decorative complexity

Pal Coffee contributes:

- Proposed bone, ink and fired-clay palette; legacy sage only in illustration assets
- Persian language and Iranian cultural context
- Existing hand-drawn/cutout illustrations
- Community-first voice
- Coffee education and product detail

Final identity: **Pal Coffee Press—warm Persian editorial commerce with a restrained tactile edge.**
