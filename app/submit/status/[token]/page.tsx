"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { api, ApiError, isAuthed } from "@/lib/api"
import {
  fetchRegistration,
  resubmitReceipt,
  type Registration,
} from "@/lib/event-api"

export default function RegistrationStatusPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [data, setData] = useState<Registration | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (!isAuthed()) {
      router.replace(`/login?next=/submit/status/${encodeURIComponent(token)}`)
      return
    }
    if (!/^[0-9a-f-]{36}$/i.test(token)) return
    let alive = true
    fetchRegistration(token)
      .then((r) => alive && setData(r))
      .catch(() => alive && setError("ثبت‌نام پیدا نشد یا دسترسی ندارید."))
    return () => {
      alive = false
    }
  }, [token, router])
  async function resubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return
    const body = new FormData(e.currentTarget)
    setBusy(true)
    setError("")
    try {
      setData(await resubmitReceipt(token, body))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "ارسال رسید ممکن نشد.")
    } finally {
      setBusy(false)
    }
  }
  async function download() {
    setError("")
    try {
      const blob = await api.blob(
        `/events/registrations/${encodeURIComponent(token)}/receipt/`
      )
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `receipt-${token}`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setError("دریافت رسید ممکن نشد.")
    }
  }
  return (
    <main
      dir="rtl"
      className="min-h-screen w-full bg-(--crp-cream) text-(--crp-espresso)"
    >
      <div className="ed-shell max-w-3xl pt-28 pb-20">
        <h1 className="t-h1 border-b border-(--crp-sand) pb-7">
          پیگیری ثبت‌نام
        </h1>
        {error && (
          <p role="alert" className="mt-6">
            {error}
          </p>
        )}
        {data ? (
          <div className="mt-8 space-y-4 leading-8" role="status">
            <h2 className="text-xl font-bold">{data.event_title}</h2>
            <p>نام: {data.full_name}</p>
            <p>
              وضعیت: <strong>{data.status_display}</strong>
            </p>
            <p>
              {data.status === "pending"
                ? "رسید در انتظار بررسی است؛ هنوز تأیید نشده‌اید."
                : data.status === "confirmed"
                  ? "ثبت‌نام شما تأیید شد."
                  : "رسید رد شد؛ در صورت باز بودن رویداد و ظرفیت، رسید جدید ارسال کنید."}
            </p>
            {data.admin_note && <p>یادداشت بررسی: {data.admin_note}</p>}
            {data.time_slot && (
              <p>
                زمان حضور: {data.time_slot.start_time.slice(0, 5)} تا{" "}
                {data.time_slot.end_time.slice(0, 5)}
              </p>
            )}
            {data.receipt_url && (
              <button
                className="min-h-12 underline"
                onClick={() => void download()}
              >
                دانلود خصوصی رسید
              </button>
            )}
            {data.status === "rejected" && data.amount_rial > 0 && (
              <form onSubmit={resubmit} className="space-y-4">
                <label className="block">
                  رسید جدید
                  <input
                    className="block min-h-12 w-full"
                    type="file"
                    name="payment_receipt"
                    required
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    disabled={busy}
                  />
                </label>
                <label className="block">
                  شماره مرجع (اختیاری)
                  <input
                    className="block min-h-12 w-full border px-3"
                    name="reference_number"
                    maxLength={50}
                    disabled={busy}
                  />
                </label>
                <button
                  disabled={busy}
                  className="outline-action min-h-12 px-5"
                >
                  {busy ? "در حال ارسال…" : "ارسال مجدد رسید"}
                </button>
              </form>
            )}
          </div>
        ) : (
          !error && (
            <p className="mt-8" role="status">
              {/^[0-9a-f-]{36}$/i.test(token)
                ? "در حال دریافت…"
                : "لینک نامعتبر است."}
            </p>
          )
        )}
        <p className="mt-8 text-sm">
          نمایش وضعیت و رسید فقط با ورود صاحب حساب یا مدیر ممکن است.
        </p>
        <Link
          href="/submit"
          className="mt-4 inline-flex min-h-12 items-center underline"
        >
          رویدادها و ثبت‌نام‌های من
        </Link>
      </div>
    </main>
  )
}
