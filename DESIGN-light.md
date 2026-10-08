# DESIGN.md — PAL (light only)

Instructions for AI agents building any PAL interface (website, landing page, shop, event page, email, social graphic). This is the **light-only** version: PAL ships one theme, the warm "Kahgel" light theme. Do not add a dark mode. Read this whole file before writing UI code. When this file and your own taste disagree, this file wins. When the user's request disagrees with this file, the user wins.

---

## 1. What PAL is

PAL is a specialty coffee brand rooted in the **Ab Anbar** (آب‌انبار) — the brick-domed Persian water cistern where PAL hosts cultural coffee events. The brand is warm, hand-made and Persian, and it sells coffee online.

The visual system has two parents:

- **Structure from a modern roaster's shop:** flat surfaces, 1px dark outlines, a category panel next to a product grid, square product cards with a price tab, round "new" badges, bold uppercase product names.
- **Identity from the Ab Anbar:** earthy kahgel (straw-and-clay plaster) backgrounds, fired brick, cistern-water teal, ochre, dark coffee brown, arches, domes, windcatchers.

One sentence to keep in mind: **a flat, outlined shop, built from the materials of a Persian cistern.**

---

## 2. Hard rules (never break)

1. **Persian first, RTL first.** Every page sets `<html lang="fa" dir="rtl">`. Use logical CSS properties (`margin-inline-start`, `inset-inline-end`, `border-end-start-radius`), never `left`/`right`.
2. **Flat. No drop shadows. Ever.** No `box-shadow`, no `filter: drop-shadow`, no elevation. Separate things with a 1px `--outline` or a surface colour change.
3. **Nothing lifts on hover.** No `translateY`, no scale. Hover = a colour change (150–200ms).
4. **Use tokens only.** Every colour, space, radius and font comes from the variables in §3. No raw hex values in components.
5. **One cistern block per page.** The teal `--cistern` information block appears once per page, for the thing people must read (event details, tasting notes).
6. **One primary button per view.**
7. **Persian digits in Persian text** (۴۸۰ not 480). Latin digits only inside Latin product names.
8. **Never uppercase Persian.** Uppercase is only for Latin product names and Latin labels.
9. **Never draw or invent the PAL logo.** Until the real logo file is supplied, set "PAL" as plain text in Archivo 800.
10. **No AI-template tropes:** no gradients, no emoji as decoration, no glassmorphism, no coloured left-border cards, no purple/blue, no stock "stats" rows with invented numbers.
11. **Light only.** Do not add `prefers-color-scheme: dark` rules or a theme toggle. Set `color-scheme: light` on `:root`. Text contrast ≥ 4.5:1 (≥ 3:1 for text 24px+ and for borders/icons).

---

## 3. Tokens

Paste this block at the top of every stylesheet. These are the only colour values; there is no dark theme.

```css
:root {
  /* Surfaces — "Kahgel" light theme */
  --surface-100: #efe3cf; /* page background (kahgel plaster) */
  --surface-200: #e3d2b6; /* image wells, category panel, inputs */
  --surface-300: #d8c29e; /* adobe band sections, price tab, hover */
  --roast:       #3a2214; /* footer, dark bands */
  --on-roast:    #f3e6d2;

  /* Text */
  --ink:         #2a1a0f; /* all main text */
  --ink-muted:   #654c37; /* secondary text, metadata */

  /* Brand */
  --brick:       #8a3a1c; /* primary brand: primary button, «محدود» badge, accents */
  --on-brick:    #f8efe0;
  --cistern:     #2a6461; /* info block, links, add (+) icon, focus ring, «تازه» badge */
  --on-cistern:  #f8efe0;
  --saffron:     #c98a2b; /* illustration highlights, small accents — never text on light */

  /* Lines */
  --outline:     var(--ink); /* 1px outlines: cards, header rule, pills, secondary buttons */
  --hairline:    #cdb796;    /* decorative dividers only */
  --border:      #85694c;    /* form inputs */

  /* Fonts (Google Fonts: Archivo, Lalezar, Vazirmatn) */
  --font-display:    "Archivo", "Lalezar", system-ui, sans-serif;
  --font-fa-display: "Lalezar", "Vazirmatn", sans-serif;
  --font-body:       "Vazirmatn", "Archivo", system-ui, sans-serif;

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;  --space-3: 16px;
  --space-4: 24px; --space-5: 40px; --space-6: 64px;

  /* Radius */
  --radius-sm: 4px;      /* inputs, small tags */
  --radius-md: 12px;     /* cards, price tab, buttons, panels */
  --radius-circle: 50%;  /* round badges, icon buttons */
  --radius-arch: 999px;  /* pills; top corners of arch frames */

  /* Strokes */
  --stroke-hair: 1px;
  --stroke-icon: 1.6px;

  color-scheme: light;
}

body { background: var(--surface-100); color: var(--ink); font: 400 16px/1.75 var(--font-body); }
:focus-visible { outline: 2px solid var(--cistern); outline-offset: 2px; }
```

Font link:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=Lalezar&family=Vazirmatn:wght@400;500;600;700;800&display=swap">
```

### Colour pairing rules

| Text colour | Allowed on | Notes |
|---|---|---|
| `--ink` | surface-100/200/300 | default for everything |
| `--ink-muted` | surface-100/200/300 | metadata, captions, units |
| `--brick` (as text) | surface-100/200 | on surface-300 only at 24px+ |
| `--cistern` (as text/links) | surface-100/200 | not on surface-300 |
| `--on-brick` | `--brick` fills | |
| `--on-cistern` | `--cistern` fills | |
| `--on-roast` | `--roast` fills | |
| `--saffron` | never as text | fills only; text on it = `--ink` (5.7:1) |

Always use the `--on-*` tokens for text on coloured fills; never hard-code white.

---

## 4. Typography

| Role | Family | Size / line-height | Weight | Use |
|---|---|---|---|---|
| fa-hero | `--font-fa-display` (Lalezar) | clamp(44px, 7vw, 80px) / 1.15 | 400 | Persian hero headline, one per page |
| fa-h1 | `--font-fa-display` | clamp(32px, 4.5vw, 44px) / 1.3 | 400 | Persian section titles |
| hero (Latin) | `--font-display` (Archivo) | 72px / 0.95, -0.02em | 800 | Latin-only heroes, the PAL wordmark |
| product name | `--font-display` | 18px / 1.25, UPPERCASE | 800 | Latin coffee names on cards |
| lead | `--font-body` (Vazirmatn) | 20px / 1.7 | 400 | intro paragraph, `--ink-muted` |
| body | `--font-body` | 16px / 1.75 | 400 | all running text |
| label | `--font-body` | 14–15px / 1.4 | 700 | buttons, nav |
| price | `--font-body` | 22px / 1.1 | 800 | number inside the price tab |
| caption | `--font-body` | 12–13px / 1.5 | 500 | units, notes, `--ink-muted` |

- Headings: `text-wrap: balance`.
- Keep running text under ~65 characters per line.
- Latin product names inside RTL text: `direction: ltr; text-align: right;`. Put the origin on line 1 and the process on line 2 (`Ethiopia Guji<br>natural`). No em-dash.

---

## 5. Layout

- Container: `max-width: 1200px; margin-inline: auto; padding-inline: max(16px, 4vw);`
- Sections are separated by `--space-6` (64px) of vertical padding.
- Alternate section backgrounds down the page: `surface-100` → `surface-300` band → `surface-100`. Never two `surface-300` bands in a row.
- Lay out with grid/flex and `gap`, not margins.
- Breakpoints: phones ≤ 560px, tablets ≤ 760px, small desktop ≤ 1000px.
- The page must never scroll sideways at 400px width.

### Page order for a landing page

1. **Header** (sticky)
2. **Hero:** Persian headline (Lalezar) + lead + primary and secondary buttons + a facts row; Ab Anbar illustration on the other side inside an arch frame
3. **Shop:** section title + category panel + product grid
4. **Story band** (`surface-300`): three short columns (گنبد، بادگیر، پاشیر), each with a line icon
5. **Event:** program list + the single cistern info block with the booking button
6. **Footer** (`--roast`)

---

## 6. Components

### 6.1 Header

Flat `--surface-100` background with a 1px `--outline` rule underneath. Contents in RTL order: PAL wordmark → currency pill → nav links (bold 15px) → line icons (favourites, search, account, cart). The cart count is a small brick circle.

```css
.top { position: sticky; top: 0; z-index: 10; background: var(--surface-100); border-bottom: var(--stroke-hair) solid var(--outline); }
.pill { display: inline-flex; gap: var(--space-2); align-items: center; border: var(--stroke-hair) solid var(--outline); border-radius: var(--radius-arch); padding: 5px 14px; font: 500 13px/1.4 var(--font-body); }
```

On phones, hide the nav and the pill and keep only the icons.

### 6.2 Buttons

```css
.btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
  font: 700 15px/1.4 var(--font-body); padding: 12px 24px; border-radius: var(--radius-md);
  border: var(--stroke-hair) solid transparent; cursor: pointer; text-decoration: none;
  transition: background-color .15s, color .15s; }
.btn--primary   { background: var(--brick); color: var(--on-brick); border-color: var(--brick); }
.btn--primary:hover { background: var(--ink); border-color: var(--ink); color: var(--surface-100); }
.btn--secondary { background: transparent; color: var(--ink); border-color: var(--outline); }
.btn--secondary:hover { background: var(--surface-300); }
```

Labels are Persian, verb first: «خرید قهوه»، «رزرو رویداد»، «افزودن به سبد».

### 6.3 Product card (the signature component)

A square image well with a 1px outline; under it, an outlined text box; next to the text box, a filled price tab tucked under the image's outer corner. In RTL the text box is on the right and the price tab on the left.

```html
<article class="card">
  <div class="media">
    <span class="badge">تازه</span>
    <button class="fav" aria-pressed="false" aria-label="افزودن Ethiopia Guji به علاقه‌مندی‌ها">♡ (line SVG)</button>
    <img src="pack.png" alt="">
  </div>
  <div class="card-info">
    <div>
      <h3>Ethiopia Guji<br>natural</h3>
      <p class="notes">زردآلو · یاس · کاکائو</p>
    </div>
    <span class="unit">۲۵۰ گرم</span>
  </div>
  <div class="price">
    <div><strong>۴۸۰</strong><small>هزار تومان</small></div>
    <button class="add" aria-label="افزودن Ethiopia Guji به سبد">+ (line SVG)</button>
  </div>
</article>
```

```css
.card { display: grid; align-content: start; grid-template-rows: auto 1fr;
  grid-template-columns: minmax(0,1fr) 76px; grid-template-areas: "media media" "info price"; }
.media { grid-area: media; position: relative; aspect-ratio: 1/1; background: var(--surface-200);
  border: var(--stroke-hair) solid var(--outline); border-radius: var(--radius-md);
  border-end-start-radius: 0; display: grid; place-items: center; transition: background-color .2s; }
.card:hover .media { background: var(--surface-300); }
.card-info { grid-area: info; border: var(--stroke-hair) solid var(--outline); border-top: 0;
  border-radius: 0 0 var(--radius-md) var(--radius-md); padding: 10px 16px 14px; min-height: 124px;
  display: flex; flex-direction: column; justify-content: space-between; gap: var(--space-2); min-width: 0; }
.card-info h3 { font: 800 18px/1.25 var(--font-display); text-transform: uppercase; direction: ltr; text-align: right; }
.price { grid-area: price; background: var(--surface-300); border-radius: var(--radius-md);
  margin-top: 1px; margin-inline-start: 2px; display: flex; flex-direction: column;
  align-items: center; justify-content: space-between; padding-block: 12px 8px; text-align: center; }
.price strong { font: 800 22px/1.1 var(--font-body); display: block; }
.price small  { font: 500 12px/1.4 var(--font-body); }
.add svg { stroke: var(--cistern); stroke-width: 2; }
.badge { position: absolute; top: 16px; inset-inline-start: 16px; width: 46px; height: 46px;
  border-radius: var(--radius-circle); background: var(--cistern); color: var(--on-cistern);
  display: grid; place-items: center; font: 700 12px/1 var(--font-body); }
.badge--limited { background: var(--brick); color: var(--on-brick); }
.fav { position: absolute; top: 12px; inset-inline-end: 12px; }
.fav[aria-pressed="true"] svg { fill: var(--brick); stroke: var(--brick); }

@media (max-width: 560px) {
  .card { grid-template-columns: minmax(0,1fr) 56px; }
  .card-info { padding: 8px 10px 10px; min-height: 110px; }
  .card-info h3 { font-size: 14px; }
  .card-info .notes { display: none; }
  .price strong { font-size: 17px; }
}
```

Rules:

- Prices are written in thousands of tomans: big number + «هزار تومان».
- One badge at most: «تازه» (cistern) or «محدود» (brick).
- Product images are cut-out packs, centred, about 45% of the well's width.
- The tasting notes are always three words joined with « · ».

### 6.4 Category panel + product grid

```css
.shop { display: grid; grid-template-columns: 240px minmax(0,1fr); gap: var(--space-4); align-items: start; }
.cats { background: var(--surface-200); border-radius: var(--radius-md); padding: var(--space-4); position: sticky; top: 76px; }
.cats button { font: 600 17px/1.9 var(--font-body); color: var(--ink-muted); }
.cats button[aria-pressed="true"] { color: var(--ink); font-weight: 800; } /* plus a 7px ink dot before it */
.grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: var(--space-3); }
@media (max-width: 1000px) { .grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 760px) {
  .shop { grid-template-columns: 1fr; }
  /* the panel becomes a horizontal scroll row of outlined pill chips; the active chip is filled --ink with --surface-100 text */
}
```

Categories: همه، تک‌خاستگاه، ترکیب‌ها، دریپ‌بگ، ابزار دم‌آوری، کارت هدیه.

### 6.5 Info block (cistern)

The one teal block per page, holding a title (Lalezar 30px), a `<dl>` of 3–5 label/value pairs, and one button using `--on-cistern` as its fill and `--cistern` as its text.

```css
.info { background: var(--cistern); color: var(--on-cistern); border-radius: var(--radius-md);
  padding: var(--space-5) var(--space-4); display: grid; gap: var(--space-4); }
.info dl { display: grid; grid-template-columns: auto 1fr; gap: var(--space-2) var(--space-4); }
.info dt { font: 500 13px/1.7 var(--font-body); opacity: .85; }
.info dd { margin: 0; font: 600 16px/1.6 var(--font-body); }
```

### 6.6 Program / list rows

Use rows separated by 1px `--hairline` rules, with the time in brick, bold and tabular numbers (`font-variant-numeric: tabular-nums`), and the description in `--ink`.

### 6.7 Footer

Footer on `--roast` with `--on-roast` text: a large PAL wordmark plus a one-line tagline, then three link columns (فروشگاه، پال، تماس), then a legal line separated by a faint rule.

---

## 7. Imagery and illustration

- Use PAL's own hand-drawn illustrations when they are available. They have line work in `--ink` and fills from `--brick`, `--cistern` and `--saffron`.
- If no illustration has been supplied, use simple flat geometric SVG shapes built from tokens: an arch, a dome, windcatchers, steps (pashir), water. Use solid fills and no gradients.
- **Arch frame:** illustrations and hero art sit in a shape with `border-radius: var(--radius-arch) var(--radius-arch) 0 0` (rounded top only).
- Photos should be warm and low-light, inside the cistern. Product photos are cut-out packs on `--surface-200`.

### Icons

Use a line icon set such as Lucide at 24px, with `stroke: var(--ink)`, `stroke-width: var(--stroke-icon)`, round caps and no fill. Needed icons: heart, search, user, cart, plus.

---

## 8. Voice and copy

- The voice is warm, a little poetic and never salesy. Use short sentences.
- PAL speaks as «ما» and addresses the guest as «شما».
- Headlines can carry a feeling («قهوه، از دلِ آب‌انبار»). Everything functional is plain («افزودن به سبد»، «۲۵۰ گرم»).
- Coffee naming: Latin origin + process (`Colombia Huila / washed`), then three tasting notes in Persian.
- Ab Anbar words to draw on: گنبد (dome), بادگیر (windcatcher), پاشیر (the steps down to the water), آجر (brick), کاهگل (kahgel plaster).
- No emoji. No exclamation marks in UI.
- Never invent real facts (dates, prices, addresses, reviews). Use clearly marked placeholders and tell the user.

---

## 9. Motion

- Use colour transitions of 150–200ms with ease-out only.
- No parallax, no bounce, no scroll-triggered reveals that hide content.
- Respect `prefers-reduced-motion: reduce` by disabling transitions.

---

## 10. Accessibility checklist

- [ ] `lang="fa" dir="rtl"` on `<html>`
- [ ] Every icon-only button has an `aria-label` naming the product («افزودن Kenya Nyeri به سبد»)
- [ ] Toggles (favourite, category) use `aria-pressed`
- [ ] Visible focus ring: 2px solid `--cistern`, 2px offset
- [ ] Contrast checked against the pairing table in §3
- [ ] Touch targets ≥ 36px
- [ ] No horizontal scroll at 400px

---

## 11. Before you ship — self-review

1. Search your CSS for `box-shadow`, `translate`, `#fff`, `white` and `left:`/`right:`, and remove any you find.
2. Every colour is a `var(--…)` token.
3. There is only one cistern info block and only one primary button per view.
4. Persian digits appear everywhere in Persian text.
5. Search for `prefers-color-scheme` and `data-theme` and remove them: the page is light only, even when the device is in dark mode.
6. Check the 400px phone width: the cards are 2-up, the category chips scroll, and nothing overflows.
