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
      <p className="t-label font-eng text-(--crp-terracotta)">PAL Coffee</p>
      <h1 className="t-h1 mt-4">
        پَل یعنی
        <br />
        <span className="text-(--crp-terracotta)">دوستی</span>
      </h1>
      <p className="t-body mt-6 border-b border-(--crp-espresso) pb-8 text-(--crp-dark)">
        {step === "phone"
          ? "برای ورود، شماره موبایل خود را وارد کنید."
          : `کد پیامک‌شده به ${phone} را وارد کنید.`}
      </p>

      {step === "phone" ? (
        <form onSubmit={sendCode} className="mt-8 flex max-w-sm flex-col gap-5">
          <div>
            <label
              htmlFor="phone"
              className="t-label mb-2 block text-(--crp-dark)"
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
              className={`min-h-12 w-full border bg-(--crp-cream) px-4 text-center text-lg ${
                error ? "border-(--crp-terracotta)" : "border-(--crp-sand)"
              }`}
              required
            />
            {error && (
              <p
                id="login-error"
                className="mt-2 text-sm font-bold text-(--crp-terracotta)"
              >
                {error}
              </p>
            )}
          </div>
          <button
            disabled={busy}
            className="outline-action ed-press min-h-12 cursor-pointer font-bold disabled:opacity-50"
          >
            {busy ? "در حال ارسال…" : "دریافت کد"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-8 flex max-w-sm flex-col gap-5">
          <div>
            <label
              htmlFor="code"
              className="t-label mb-2 block text-(--crp-dark)"
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
              className={`min-h-12 w-full border bg-(--crp-cream) px-4 text-center text-xl tracking-[0.5em] ${
                error ? "border-(--crp-terracotta)" : "border-(--crp-sand)"
              }`}
              required
            />
            {error && (
              <p
                id="login-error"
                className="mt-2 text-sm font-bold text-(--crp-terracotta)"
              >
                {error}
              </p>
            )}
          </div>
          <button
            disabled={busy}
            className="outline-action ed-press min-h-12 cursor-pointer font-bold disabled:opacity-50"
          >
            {busy ? "در حال بررسی…" : "ورود"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("phone")
              setError("")
            }}
            className="min-h-11 cursor-pointer text-sm font-bold text-(--crp-dark) underline"
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
    <main
      dir="rtl"
      className="min-h-screen bg-(--crp-cream) text-(--crp-espresso)"
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  )
}
