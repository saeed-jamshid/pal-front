# palCoffee — New Catalog Plan (v2)

Goal: catalog with 3 product tiers, cart + order tracking, and a blog. Persian RTL; visual direction is `DESIGN.md` (cream editorial Pal Coffee Press).

## 1. Data Model

```ts
type ProductCategory = "single-origin" | "specialty" | "commercial"

interface BaseProduct {
  slug: string
  category: ProductCategory
  title: string
  region: string              // ریجن
  description: string         // توضیحات
  image: string
  weights: { grams: number; price: number }[]  // price per weight option
  // sensory profile (0–10 scale, shown as bars/radar)
  acidity: number             // اسیدیته
  sweetness: number           // سوییتنس
  bitterness: number          // بیترنس
  body: number                // بادی
}

// تک‌خاستگاه (single origin)
interface SingleOrigin extends BaseProduct {
  category: "single-origin"
  altitude: string            // ارتفاع
  arabicaVariety: string      // مدل عربیکا (heirloom, bourbon, ...)
  cuppingScore: number        // امتیاز قهوه (80+)
  roastLevel: RoastLevel      // درجه رست
  process: string             // نوع پروسس (washed, natural, honey...)
  tastingNotes: string[]      // تیست
  brewMethods: BrewMethod[]   // روش دم‌آوری بر اساس دستگاه → per-method page theme
}

// تخصصی + تجاری — same fields, differ by category only
interface BlendProduct extends BaseProduct {
  category: "specialty" | "commercial"
  arabicaPercent: number      // عربیکا/روبوستا درصدی (robusta = 100 - arabica)
  // one shared theme for both tiers
}

type RoastLevel = "light" | "medium-light" | "medium" | "medium-dark" | "dark"
type BrewMethod = "espresso" | "v60" | "chemex" | "french-press" | "moka" | "aeropress"

interface CartItem { slug: string; grams: number; qty: number }

type OrderStatus = "preparing" | "shipped" | "delivered"   // آماده‌سازی → ارسال به پست → تحویل

interface Order {
  id: string
  items: CartItem[]
  total: number
  status: OrderStatus
  createdAt: string
  trackingCode?: string       // کد رهگیری پست
}

interface BlogPost {
  slug: string
  title: string
  cover: string
  theme: "light" | "dark" | "accent"  // تم‌بندی per post
  content: string             // markdown
  publishedAt: string
}
```

## 2. Pages / Routes

| Route | Purpose |
|---|---|
| `/catalog` | 3 tabs (تک‌خاستگاه / تخصصی / تجاری), product cards |
| `/catalog/[slug]` | Product detail; **theme switches by selected brew device** for single-origin; one shared theme for specialty/commercial |
| `/cart` | Edit qty + weight per line, total, submit order |
| `/orders` | Order history list |
| `/orders/[id]` | Status tracker: آماده‌سازی → ارسال به پست → تحویل + tracking code |
| `/blog` | Post list |
| `/blog/[slug]` | Post reader with per-post theme |

## 3. UI Direction (ui-ux-pro-max: premium e-commerce)

- **Style**: warm editorial grids and bold Persian typography, shared with home page.
- **Palette**: cream `#FFF9F0`, espresso `#280000`, terracotta `#9F3422`; see `DESIGN.md`.
- **Typography**: Vazirmatn (body, RTL) + existing display font for headings — keep, don't add Google fonts
- **Sensory profile**: horizontal bars (acidity/sweetness/bitterness/body), no chart lib needed
- **Brew-device theme**: accent color + background tint per device (espresso=dark amber, v60=bright, etc.) via CSS var swap on the product page
- RTL everywhere, no emojis (Lucide/Tabler already installed), 44px touch targets

## 4. API (Bruno: PAL Coffee API, base `/api/v1`)

Decided: real backend, not localStorage. Implemented in `lib/api.ts` + `lib/shop.ts`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/otp/request/`, `POST /auth/otp/verify/`, `POST /auth/token/refresh/` |
| Catalog | `GET /products/?available=true`, `GET /products/{slug}/`, `GET /categories/`, `GET /products/{slug}/recommend/` |
| Cart | `GET /cart/`, `POST /cart/items/` (product_id, quantity, grind_type), `PATCH/DELETE /cart/items/{id}/` |
| Checkout | `POST /orders/checkout/` (address_id, customer_note) → order_number |
| Orders | `GET /orders/`, `GET /orders/{order_number}/` |
| Payment | `POST /payments/saman/start/{order_number}/` |
| Addresses | `GET/POST /auth/addresses/`, `PATCH/DELETE /auth/addresses/{id}/` |
| Blog | `GET /blog/posts/`, `GET /blog/posts/{slug}/`, `GET /blog/categories/` |

Adapters tolerate unknown field names (camel/snake) — verify against first real response.
**Cart weight edit**: Bruno cart item has only quantity + grind_type, no weight field. If weight = separate variant, backend must expose it; pending confirmation.

## 5. Status (built)

- ✅ `lib/api.ts` (fetch wrapper, OTP auth, token refresh), `lib/shop.ts` (types + adapters + fetchers)
- ✅ `/catalog` — 3 category tabs, cream editorial theme, skeleton/empty/error states
- ✅ `/catalog/[slug]` — full specs, sensory bars, brew-device accent swap (SO only), weight/grind/qty, add to cart
- ✅ `/cart` — qty edit, remove, total; checkout disabled until payment flow is verified (no unpaid order falsely shown as complete).
- ✅ `/orders` + `/orders/[id]` — history + 3-step status tracker + tracking code
- ✅ `/blog` + `/blog/[slug]` — list + reader, per-post theme (light/dark/accent)
- ✅ `/login` — OTP flow
- ⏳ Saman payment start after checkout (endpoint not verified; checkout intentionally gated).
- ⏳ Backend cart API has no weight/variant field. PDP shows base weight only until variant support is verified.
- ⏳ Verify adapters against real API responses; preview mocks are development-only and production errors surface.
