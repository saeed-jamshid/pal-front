import { test } from "node:test"
import assert from "node:assert/strict"
import { api, ApiError, safeNextPath, requestOtp, verifyOtp } from "./api"

test("login redirect accepts local path, rejects external or script URLs", () => {
  assert.equal(safeNextPath("/orders/123"), "/orders/123")
  for (const url of [
    null,
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "javascript:alert(1)",
    "/\nexample",
  ]) {
    assert.equal(safeNextPath(url), "/catalog")
  }
})

test("OTP wire contract and DRF field errors", async () => {
  const original = globalThis.fetch
  const storage = Object.getOwnPropertyDescriptor(globalThis, "localStorage")
  const tokens = new Map<string, string>()
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => tokens.get(k),
      setItem: (k: string, v: string) => tokens.set(k, v),
    },
  })
  globalThis.fetch = async (input, init) => {
    const body = JSON.parse(String(init?.body))
    assert.equal(body.phone_number, "09123456789")
    assert.equal(body.phone, undefined)
    if (String(input).includes("verify")) {
      assert.equal(body.code, "123456")
      return new Response(
        JSON.stringify({ access: "access", refresh: "refresh" })
      )
    }
    return new Response(JSON.stringify({ phone_number: ["شماره نامعتبر"] }), {
      status: 400,
    })
  }
  try {
    await assert.rejects(
      requestOtp("۰۹۱۲٣٤٥٦٧٨٩"),
      (e) => e instanceof ApiError && e.fields.phone_number === "شماره نامعتبر"
    )
    await verifyOtp("۰۹۱۲٣٤٥٦٧٨٩", "۱۲۳۴۵۶")
    assert.equal(tokens.get("pal_access_token"), "access")
  } finally {
    globalThis.fetch = original
    if (storage) Object.defineProperty(globalThis, "localStorage", storage)
    else Reflect.deleteProperty(globalThis, "localStorage")
  }
})

test("401 refresh retries only once then clears invalid tokens", async () => {
  const tokens = new Map([
    ["pal_access_token", "expired"],
    ["pal_refresh_token", "refresh"],
  ])
  const originalFetch = globalThis.fetch
  const originalStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage"
  )
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => tokens.get(key) ?? null,
      setItem: (key: string, value: string) => tokens.set(key, value),
      removeItem: (key: string) => tokens.delete(key),
    },
  })
  let calls = 0
  globalThis.fetch = async (input) => {
    calls++
    return String(input).includes("/auth/token/refresh/")
      ? new Response(JSON.stringify({ access: "still-invalid" }), {
          status: 200,
        })
      : new Response(null, { status: 401 })
  }
  try {
    await assert.rejects(
      api.get("/cart/", true),
      (error) => error instanceof ApiError && error.status === 401
    )
    assert.equal(calls, 3)
    assert.equal(tokens.size, 0)
  } finally {
    globalThis.fetch = originalFetch
    if (originalStorage)
      Object.defineProperty(globalThis, "localStorage", originalStorage)
    else Reflect.deleteProperty(globalThis, "localStorage")
  }
})
