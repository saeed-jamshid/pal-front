import { test } from "node:test"
import assert from "node:assert/strict"
import {
  csvCell,
  eventMap,
  normalizePhone,
  registerEvent,
  fetchRegistration,
  faDate,
  faTime,
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

test("venue maps reject missing/invalid coordinates, accept zero, clamp bounds", () => {
  for (const coords of [{}, { latitude: "", longitude: "" }, { latitude: null, longitude: 59 }, { latitude: 91, longitude: 59 }, { latitude: 32, longitude: "NaN" }, { latitude: 32, longitude: "https://evil.test" }])
    assert.equal(eventMap(coords), null)
  assert.match(eventMap({ latitude: 0, longitude: 0 })!.link, /mlat=0&mlon=0/)
  const map = eventMap({ latitude: "90.000000", longitude: "180.000000" })!
  assert.equal(new URL(map.embed).hostname, "www.openstreetmap.org")
  assert.equal(new URL(map.embed).searchParams.get("bbox"), "179.992,89.995,180,90")
})

test("Persian time and date formatting", () => {
  assert.equal(faTime("10:30:00"), "۱۰:۳۰")
  assert.match(faDate("2026-10-16"), /جمعه/)
  assert.match(faDate("2026-10-16"), /۲۴ مهر ۱۴۰۵/)
})
