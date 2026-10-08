import { api } from "./api"

// ponytail: show-only store. Flip to true to restore prices, cart and orders
// (also remove the /cart and /orders redirects in next.config.mjs).
export const SHOP_SALES_ENABLED = false

export type TasteProfile = "fruity" | "chocolate" | "balanced"
export const ROAST_LABELS: Record<string, string> = {
  light: "روشن",
  medium: "مدیوم",
  dark: "تیره",
}

// ─── Types (see docs/api.md) ────────────────────────────────────────

export type CategorySlug = string

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  "single-origin": "تک خاستگاه",
  // User-approved label-only rename; preserve existing slugs and membership.
  commercial: "تخصصی",
  blends: "تجاری",
}

// User-chosen extra listing: these also appear under تخصصی while keeping their backend category.
// ponytail: frontend list, move to a backend M2M if staff need to edit it.
const ALSO_IN: Record<CategorySlug, string[]> = {
  commercial: ["drugar-natural", "ethiopia-yirgacheffe"],
}
export const inCategory = (p: Pick<Product, "slug" | "category">, slug: CategorySlug) =>
  !slug || p.category === slug || (ALSO_IN[slug] ?? []).includes(p.slug)

export type GrindType =
  "" | "beans" | "espresso" | "moka_pot" | "french_press" | "v60"
export const GRIND_LABELS: Record<GrindType, string> = {
  "": "بدون آسیاب",
  beans: "دانه",
  espresso: "اسپرسوساز",
  moka_pot: "موکاپات",
  french_press: "فرنچ‌پرس",
  v60: "V60",
}

export type BrewMethod =
  "espresso" | "v60" | "chemex" | "french-press" | "moka" | "aeropress"
export const BREW_LABELS: Record<BrewMethod, string> = {
  espresso: "اسپرسو",
  v60: "V60",
  chemex: "کمکس",
  "french-press": "فرنچ‌پرس",
  moka: "موکا",
  aeropress: "ائروپرس",
}
// accent swap per device (single-origin pages only)
// Editorial light palette. Every value >=4.5:1 as text on cream (#FFF9F0)
// and inverts safely with cream text on top. See DESIGN.md §Color Rules.
export const BREW_ACCENTS: Record<BrewMethod, string> = {
  espresso: "#9F3422",
  v60: "#8A5B1F",
  chemex: "#A8453C",
  "french-press": "#6B5E3A",
  moka: "#8C3B26",
  aeropress: "#7A4A2B",
}

export interface WeightOption {
  grams: number
  price: number
}

export interface Product {
  id: number
  slug: string
  title: string
  category: CategorySlug
  region: string
  description: string
  image: string
  weights: WeightOption[]
  allowedGrinds: GrindType[]
  availableStock: number
  categoryName: string
  shortDescription: string
  featured: boolean
  tasteProfile: TasteProfile
  // sensory 0–10
  acidity: number
  sweetness: number
  bitterness: number
  body: number
  // single-origin only
  altitude?: string
  arabicaVariety?: string
  cuppingScore?: number
  roastLevel?: string
  process?: string
  tastingNotes?: string[]
  brewMethods?: BrewMethod[]
  // specialty/commercial only
  arabicaPercent?: number
}

export interface CartItem {
  id: number
  product: Pick<Product, "id" | "slug" | "title" | "image">
  quantity: number
  grindType: GrindType
  unitPrice: number
  lineTotal: number
}
export interface Cart {
  items: CartItem[]
  total: number
}

export type OrderStatus =
  "new" | "preparing" | "shipped" | "delivered" | "cancelled"
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "جدید",
  cancelled: "لغوشده",
  preparing: "آماده‌سازی",
  shipped: "ارسال به پست",
  delivered: "تحویل شد",
}
export interface Order {
  orderNumber: string
  status: OrderStatus
  paymentStatus: "unpaid" | "pending" | "paid" | "failed" | "refunded"
  paymentMethod: string
  items: CartItem[]
  total: number
  createdAt: string
  trackingCode?: string
}

export interface BlogPost {
  slug: string
  title: string
  cover: string
  excerpt: string
  content: string
  theme?: "light" | "dark" | "accent"
  category?: string
  publishedAt: string
}

// ─── Adapters for ../Pal-Back (amounts remain IRR) ──────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
const num = (v: any, d = 0) => (typeof v === "number" ? v : Number(v) || d)

export function toProduct(r: any, categories: Category[] = []): Product {
  const category = categories.find((c) => c.id === r.category)
  return {
    id: num(r.id),
    slug: r.slug ?? String(r.id),
    title: r.title ?? r.name ?? "",
    category: category?.slug ?? "",
    categoryName: category?.name ?? "",
    allowedGrinds: r.allowed_grinds ?? [],
    availableStock: num(r.available_stock),
    region: r.origin ?? "",
    description: r.description ?? "",
    // Empty when no photo was uploaded; UI draws CoffeeArt instead.
    image: r.images?.[0]?.image || "",
    shortDescription: r.short_description ?? "",
    featured: !!r.is_featured,
    tasteProfile: (["fruity", "chocolate"].includes(r.taste_profile)
      ? r.taste_profile
      : "balanced") as TasteProfile,
    weights: [{ grams: 0, price: num(r.price) }],
    acidity: num(r.acidity),
    sweetness: num(r.sweetness),
    bitterness: num(r.bitterness),
    body: num(r.body),
    altitude: r.altitude,
    arabicaVariety: r.arabica_variety ?? r.variety,
    cuppingScore: r.cupping_score != null ? num(r.cupping_score) : undefined,
    roastLevel: r.roast_level ?? r.roast,
    process: r.process,
    tastingNotes: String(r.tasting_notes ?? "")
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean),
    brewMethods: (r.brew_methods ?? [])
      .map(
        (m: string) =>
          ({ moka_pot: "moka", french_press: "french-press" })[m] ?? m
      )
      .filter((m: string) => m in BREW_LABELS),
    arabicaPercent:
      r.arabica_percent != null ? num(r.arabica_percent) : undefined,
  }
}

export function toCartItem(r: any): CartItem {
  const p = r.product ?? {}
  return {
    id: num(r.id),
    product: {
      id: num(p.id ?? r.product_id ?? r.product),
      slug: p.slug ?? "",
      title: r.product_name ?? p.title ?? "",
      image: p.image || "/img/brew.jpeg",
    },
    quantity: num(r.quantity, 1),
    grindType: (r.grind_type ?? "") as GrindType,
    unitPrice: num(r.unit_price ?? r.price),
    lineTotal:
      r.line_total != null
        ? num(r.line_total)
        : num(r.price) * num(r.quantity, 1),
  }
}

export function toOrder(r: any): Order {
  return {
    orderNumber: r.order_number ?? String(r.id),
    status: r.fulfillment_status,
    paymentStatus: r.payment_status,
    paymentMethod: r.payment_method,
    items: (r.items ?? []).map(toCartItem),
    total: num(r.total_amount),
    createdAt: r.created_at ?? "",
    trackingCode: r.tracking_code,
  }
}

function toPost(r: any): BlogPost {
  return {
    slug: r.slug ?? "",
    title: r.title ?? "",
    cover: r.cover_image || "/img/brew.jpeg",
    excerpt: r.excerpt ?? "",
    content: r.content ?? r.body ?? "",
    theme: r.theme,
    category: r.category_name,
    publishedAt: r.published_at ?? r.created_at ?? "",
  }
}

// ─── Fetchers ────────────────────────────────────────────────────────────────

type Page<T> = { results: T[]; next: string | null }
export type Category = { id: number; slug: string; name: string }
export const fetchCategories = () => api.get<Category[]>("/categories/")

export async function fetchPages<T>(path: string, auth = false): Promise<T[]> {
  const items: T[] = []
  while (path) {
    const page = await api.get<Page<T>>(path, auth)
    items.push(...page.results)
    const next = page.next
      ? new URL(page.next, "http://local").pathname +
        new URL(page.next, "http://local").search
      : ""
    if (next && !next.startsWith("/api/v1/"))
      throw new Error("Invalid pagination path")
    path = next.replace(/^\/api\/v1/, "")
  }
  return items
}

export async function fetchProducts(
  category?: CategorySlug
): Promise<Product[]> {
  const q = category ? `?category=${encodeURIComponent(category)}` : ""
  const [data, categories] = await Promise.all([
    fetchPages<any>(`/products/${q}`),
    fetchCategories(),
  ])
  return data.map((r) => toProduct(r, categories))
}
export async function fetchProduct(slug: string): Promise<Product> {
  const [product, categories] = await Promise.all([
    api.get(`/products/${encodeURIComponent(slug)}/`),
    fetchCategories(),
  ])
  return toProduct(product, categories)
}

export async function fetchCart(): Promise<Cart> {
  const d = await api.get<any>("/cart/", true)
  return { items: (d.items ?? []).map(toCartItem), total: num(d.total) }
}
export const addCartItem = (
  productId: number,
  quantity: number,
  grindType: GrindType
) =>
  api.post(
    "/cart/items/",
    { product_id: productId, quantity, grind_type: grindType },
    true
  )
export const updateCartItem = (id: number, quantity: number) =>
  api.patch(`/cart/items/${id}/`, { quantity })
export const deleteCartItem = (id: number) => api.delete(`/cart/items/${id}/`)

export async function fetchOrders(): Promise<Order[]> {
  return (await fetchPages<any>("/orders/", true)).map(toOrder)
}
export async function fetchOrder(orderNumber: string): Promise<Order> {
  return toOrder(await api.get(`/orders/${orderNumber}/`, true))
}
export const checkout = (addressId: number, note: string) =>
  api.post<{ order_number: string }>(
    "/orders/checkout/",
    {
      address_id: addressId,
      customer_note: note,
      payment_method: "card_to_card",
    },
    true
  )

export async function fetchPosts(): Promise<BlogPost[]> {
  return (await fetchPages<any>("/blog/posts/")).map(toPost)
}
export async function fetchPost(slug: string): Promise<BlogPost> {
  return toPost(await api.get(`/blog/posts/${encodeURIComponent(slug)}/`))
}

// ─── Addresses ─────────────────────────────────────────────────────────────

export interface Address {
  id: number
  title: string
  recipientName: string
  recipientPhone: string
  province: string
  city: string
  postalAddress: string
  postalCode: string
  isDefault: boolean
}
const toAddress = (r: any): Address => ({
  id: num(r.id),
  title: r.title ?? "",
  recipientName: r.recipient_name ?? "",
  recipientPhone: r.recipient_phone ?? "",
  province: r.province ?? "",
  city: r.city ?? "",
  postalAddress: r.postal_address ?? "",
  postalCode: r.postal_code ?? "",
  isDefault: !!r.is_default,
})
export async function fetchAddresses(): Promise<Address[]> {
  const d = await api.get<any>("/auth/addresses/", true)
  return (Array.isArray(d) ? d : (d.results ?? [])).map(toAddress)
}
export function createAddress(a: Omit<Address, "id">) {
  return api.post(
    "/auth/addresses/",
    {
      title: a.title,
      recipient_name: a.recipientName,
      recipient_phone: a.recipientPhone,
      province: a.province,
      city: a.city,
      postal_address: a.postalAddress,
      postal_code: a.postalCode,
      is_default: a.isDefault,
    },
    true
  )
}

// API amounts remain IRR; convert only at display boundary.
export const formatPrice = (rial: number) =>
  `${(rial / 10).toLocaleString("fa-IR")} تومان`
export const PAYMENT_STATUS_LABELS = {
  unpaid: "پرداخت‌نشده",
  pending: "در انتظار پرداخت / بررسی",
  paid: "پرداخت‌شده",
  failed: "ناموفق",
  refunded: "بازگشت وجه",
}

// Descriptions hold "label: value" lines (see Pal-Back seed_pal_coffees).
// ponytail: parsed from text instead of model fields; add fields if admin needs filtering.
export function splitDescription(text: string) {
  const specs: [string, string][] = []
  const paragraphs: string[] = []
  for (const line of text.split("\n").map((l) => l.trim()).filter(Boolean)) {
    const m = line.match(/^([^:：]{1,30}?)\s*[:：]\s*(.+)$/)
    if (m) specs.push([m[1], m[2]])
    else paragraphs.push(line)
  }
  return { specs, paragraphs }
}
