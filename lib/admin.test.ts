import { test } from "node:test"
import assert from "node:assert/strict"
import { formPayload, resources, displayValue, fetchAdminPage } from "./admin"
import { api } from "./api"

test("admin editor serializes whitelist, keeps IRR, rejects unsafe integer input", () => {
  const resource = resources.find((r) => r.key === "products")!
  const data = new FormData()
  data.set("name", "Coffee")
  data.set("category", "1")
  data.set("sku", "P1")
  data.set("slug", "coffee")
  data.set("price", "1500000")
  data.set("stock", "2")
  data.set("is_active", "on")
  data.append("allowed_grinds", "beans")
  data.append("allowed_grinds", "v60")
  data.set("payment_status", "paid")
  const body = formPayload(resource, data)
  assert.equal(body.price, 1500000)
  assert.equal(body.is_active, true)
  assert.equal(body.is_featured, false)
  assert.deepEqual(body.allowed_grinds, ["beans", "v60"])
  assert.deepEqual(body.brew_methods, [])
  assert.equal(body.roast_date, null)
  assert.equal(body.payment_status, undefined)
  assert.match(displayValue("price", 1500000), /تومان/)
  for (const price of ["1.2", "-1", "9007199254740992", "oops", ""]) {
    data.set("price", price)
    assert.throws(() => formPayload(resource, data))
  }
})

test("Persian admin dates/times keep Gregorian API values and seconds", () => {
  assert.equal(displayValue("price_rial", 1000001), "۱۰۰٬۰۰۰ تومان")
  assert.equal(displayValue("date", "2026-10-16"), "۱۴۰۵/۷/۲۴")
  assert.equal(displayValue("start_time", "10:05:30"), "۱۰:۰۵")
  assert.equal(displayValue("time_slot", { start_time: "10:05", end_time: "12:00" }), "۱۰:۰۵ تا ۱۲:۰۰")
  const resource = resources.find(r => r.key === "slots")!
  const data = new FormData()
  data.set("event", "1")
  data.set("registration_ceiling", "10")
  for (const key of ["start_time", "end_time"]) {
    data.set(`${key}_0`, "10")
    data.set(`${key}_1`, "05")
    data.set(`${key}_2`, "30")
  }
  assert.equal(formPayload(resource, data).start_time, "10:05:30")
  data.set("end_time_0", "24")
  assert.throws(() => formPayload(resource, data), /ساعت و دقیقه/)
  const product = resources.find(r => r.key === "products")!
  const invalidDate = new FormData()
  invalidDate.set("roast_date", "2026-02-31")
  // Test date field alone to avoid unrelated required product fields.
  assert.throws(() => formPayload({ ...product, fields: product.fields!.filter(f => f.key === "roast_date") }, invalidDate), /تاریخ معتبر/)
})

test("customer status filter scans all API pages before paging, preserves search", async () => {
  const original = api.get
  const paths: string[] = []
  api.get = async <T>(path: string) => {
    paths.push(path)
    return (path.includes("page=2")
      ? { results: [{ id: 2, is_active: false }, { id: 3, is_active: true }], next: null }
      : { results: [{ id: 1, is_active: true }], next: "http://local/api/v1/manage/customers/?page=2&search=Test+Name" }) as T
  }
  try {
    const page = await fetchAdminPage("customers", new URLSearchParams({ page: "1", is_active: "false", search: "Test Name" }))
    assert.deepEqual(page.results.map(r => r.id), [2])
    assert.equal(page.count, 1)
    assert.equal(page.next, null)
    assert.ok(paths[0].includes("search=Test+Name"))
    assert.equal(paths.length, 2)
  } finally { api.get = original }
})

test("financial histories never expose generic CRUD; resource keys unique", () => {
  assert.equal(new Set(resources.map((r) => r.key)).size, resources.length)
  for (const key of [
    "payments",
    "registrations",
    "gateways",
    "notifications",
  ]) {
    const resource = resources.find((r) => r.key === key)!
    assert.equal(resource.create, undefined)
    assert.equal(resource.remove, undefined)
    assert.equal(resource.fields, undefined)
  }
  assert.deepEqual(
    resources.find((r) => r.key === "orders")!.fields!.map((f) => f.key),
    ["fulfillment_status", "tracking_code", "customer_note"]
  )
})
