import { test } from "node:test"
import assert from "node:assert/strict"
import { formPayload, resources, displayValue } from "./admin"

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
