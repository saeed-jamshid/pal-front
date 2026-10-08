import { test } from "node:test"
import assert from "node:assert/strict"
import { CATEGORY_LABELS, inCategory, toProduct, toCartItem, toOrder, formatPrice, fetchPages, splitDescription } from "./shop"

test("category labels change without moving existing groups or URLs", () => {
  assert.deepEqual(Object.entries(CATEGORY_LABELS), [
    ["single-origin", "تک خاستگاه"], ["commercial", "تخصصی"], ["blends", "تجاری"],
  ])
})

test("backend fields mapped without invented weight, price or status", () => {
  const p = toProduct(
    {
      id: 1,
      name: "Coffee",
      slug: "coffee",
      category: 9,
      price: 1250000,
      origin: "Iran",
      images: [{ image: "/media/coffee.jpg" }],
      available_stock: 3,
      allowed_grinds: ["beans", "v60"],
      tasting_notes: "شکلات، میوه",
      brew_methods: ["moka_pot", "french_press"],
    },
    [{ id: 9, name: "قهوه", slug: "coffee" }]
  )
  assert.equal(p.category, "coffee")
  assert.equal(p.region, "Iran")
  assert.equal(p.weights[0].grams, 0)
  assert.equal(p.weights[0].price, 1250000)
  assert.deepEqual(p.tastingNotes, ["شکلات", "میوه"])
  assert.deepEqual(p.brewMethods, ["moka", "french-press"])
  assert.equal(
    formatPrice(1250000),
    `${(125000).toLocaleString("fa-IR")} تومان`
  )
  const item = toCartItem({
    id: 1,
    product_name: "Coffee",
    price: 1250000,
    quantity: 2,
    grind_type: "v60",
  })
  assert.equal(item.product.title, "Coffee")
  assert.equal(item.lineTotal, 2500000)
  const order = toOrder({
    order_number: "ABC",
    payment_status: "unpaid",
    fulfillment_status: "new",
    total_amount: 2500000,
    items: [
      {
        id: 2,
        product: 1,
        product_name: "Coffee",
        unit_price: 1250000,
        line_total: 2500000,
        quantity: 2,
      },
    ],
  })
  assert.equal(order.paymentStatus, "unpaid")
  assert.equal(order.status, "new")
  assert.equal(order.total, 2500000)
  assert.equal(order.items[0].lineTotal, 2500000)
})

test("pagination follows all backend pages, never forwards token to supplied host", async () => {
  const original = globalThis.fetch
  const calls: string[] = []
  globalThis.fetch = async (input) => {
    calls.push(String(input))
    return new Response(
      JSON.stringify(
        calls.length === 1
          ? {
              results: [1],
              next: "https://untrusted.test/api/v1/orders/?page=2",
            }
          : { results: [2], next: null }
      )
    )
  }
  try {
    assert.deepEqual(await fetchPages("/orders/"), [1, 2])
    assert.equal(calls.length, 2)
    assert.ok(calls.every((c) => !c.includes("untrusted.test")))
  } finally {
    globalThis.fetch = original
  }
})

test("splitDescription separates label: value specs from prose", () => {
  const { specs, paragraphs } = splitDescription(
    "فرآوری: نچرال\nقهوه‌ای شیرین برای صبح.\nارتفاع : ۱۸۰۰ تا ۲۲۰۰ متر"
  )
  assert.deepEqual(specs, [
    ["فرآوری", "نچرال"],
    ["ارتفاع", "۱۸۰۰ تا ۲۲۰۰ متر"],
  ])
  assert.deepEqual(paragraphs, ["قهوه‌ای شیرین برای صبح."])
})

test("تخصصی also lists Drugar and Yirgacheffe without moving them", () => {
  const drugar = { slug: "drugar-natural", category: "single-origin" }
  assert.ok(inCategory(drugar, "commercial"))
  assert.ok(inCategory(drugar, "single-origin"))
  assert.ok(inCategory(drugar, ""))
  assert.ok(!inCategory(drugar, "blends"))
  assert.ok(inCategory({ slug: "ethiopia-yirgacheffe", category: "single-origin" }, "commercial"))
  assert.ok(!inCategory({ slug: "bugisu-aa", category: "single-origin" }, "commercial"))
})
