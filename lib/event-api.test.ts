import { test } from "node:test"
import assert from "node:assert/strict"
import {
  csvCell,
  normalizePhone,
  registerEvent,
  fetchRegistration,
} from "./event-api"

test("normalize Persian/Arabic phone; CSV neutralizes formula", () => {
  assert.equal(normalizePhone("۰۹۱۲-٣٤٥ ٦٧٨٩"), "09123456789")
  assert.equal(
    csvCell(' =IMPORTXML("https://example.test", "x")'),
    '"\' =IMPORTXML(""https://example.test"", ""x"")"'
  )
})

test("event registration uses unified multipart route; status requires JWT", async () => {
  const original = globalThis.fetch
  globalThis.fetch = async (input, init) => {
    const path = String(input)
    assert.match(path, /\/api\/v1\/events\/registrations\//)
    if (init?.method === "POST") {
      assert.ok(init.body instanceof FormData)
      assert.equal(new Headers(init.headers).has("Content-Type"), false)
    }
    return new Response(
      JSON.stringify({ registration_token: "test", status: "pending" })
    )
  }
  try {
    const body = new FormData()
    body.set("time_slot", "1")
    assert.equal((await registerEvent(body)).status, "pending")
    assert.equal((await fetchRegistration("test")).registration_token, "test")
  } finally {
    globalThis.fetch = original
  }
})
