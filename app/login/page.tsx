"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import {
  ApiError,
  requestOtp,
  verifyOtp,
  safeNextPath,
  normalizePhone,
} from "@/lib/api"

function LoginForm() {
  const router = useRouter()
  const next = safeNextPath(useSearchParams().get("next"))
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"phone" | "code">("phone")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function sendCode(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError("")
    try {
      await requestOtp(phone)
      setStep("code")
    } catch (error) {
      setError(
        error instanceof ApiError
          ? error.message
          : "کد ارسال نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید."
      )
    } finally {
      setBusy(false)
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError("")
    try {
      await verifyOtp(phone, code)
      router.replace(next)
    } catch (error) {
      setError(
        error instanceof ApiError
          ? error.message
          : "کد بررسی نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید."
      )
      setBusy(false)
    }
  }

  return (
    <div className="ed-shell max-w-xl pt-28 pb-24">
      <p className="latin-name text-sm text-(--brick)">PAL Coffee</p>
      <h1 className="fa-h1 mt-3">ورود یا ساخت حساب</h1>
      <p className="lead mt-4 border-b border-(--outline) pb-6">
        {step === "phone"
          ? "شمارهٔ موبایل خود را وارد کنید تا کد ورود برایتان پیامک شود."
          : `کد پیامک‌شده به ${phone} را وارد کنید.`}
      </p>
      <p className="mt-3 text-sm text-(--ink-muted)">
        اگر اولین بار است، با تأیید کد حساب شما ساخته می‌شود.
      </p>

      {step === "phone" ? (
        <form onSubmit={sendCode} className="mt-8 flex max-w-sm flex-col gap-5">
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-bold"
            >
              شماره موبایل
            </label>
            <input
              id="phone"
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              pattern="09[0-9]{9}"
              maxLength={11}
              placeholder="09xxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(normalizePhone(e.target.value))}
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
              className={`min-h-12 w-full border rounded-(--radius-sm) bg-(--surface-200) px-4 text-center text-lg ${
                error ? "border-(--brick)" : "border-(--border-input)"
              }`}
              required
            />
            {error && (
              <p
                id="login-error"
                className="mt-2 text-sm font-bold text-(--brick)"
              >
                {error}
              </p>
            )}
          </div>
          <button
            disabled={busy}
            className="btn btn--primary"
          >
            {busy ? "در حال ارسال…" : "دریافت کد"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-8 flex max-w-sm flex-col gap-5">
          <div>
            <label
              htmlFor="code"
              className="mb-2 block text-sm font-bold"
            >
              کد تأیید
            </label>
            <input
              id="code"
              dir="ltr"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="------"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(normalizePhone(e.target.value))}
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
              className={`min-h-12 w-full border rounded-(--radius-sm) bg-(--surface-200) px-4 text-center text-xl tracking-[0.5em] ${
                error ? "border-(--brick)" : "border-(--border-input)"
              }`}
              required
            />
            {error && (
              <p
                id="login-error"
                className="mt-2 text-sm font-bold text-(--brick)"
              >
                {error}
              </p>
            )}
          </div>
          <button
            disabled={busy}
            className="btn btn--primary"
          >
            {busy ? "در حال بررسی…" : "ورود"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("phone")
              setError("")
            }}
            className="min-h-11 cursor-pointer text-sm font-bold text-(--cistern) underline"
          >
            تغییر شماره
          </button>
        </form>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-(--surface-100) text-(--ink)">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  )
}
