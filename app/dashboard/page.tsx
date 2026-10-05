"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api, ApiError, isAuthed } from "@/lib/api"
import { type Registration } from "@/lib/event-api"

export default function DashboardPage() {
  const [rows, setRows] = useState<Registration[]>([])
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState("pending")
  const [search, setSearch] = useState("")
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [loggedIn, setLoggedIn] = useState(false)
  const [reload, setReload] = useState(0)
  useEffect(() => {
    let alive = true
    const timer = setTimeout(async () => {
      const authed = isAuthed()
      setLoggedIn(authed)
      if (!authed) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError("")
      try {
        const query = new URLSearchParams({
          page: String(page),
          status,
          search,
        })
        const result = await api.get<{
          results: Registration[]
          next: string | null
        }>(`/events/manage/registrations/?${query}`, true)
        if (alive) {
          setRows(result.results)
          setHasNext(!!result.next)
        }
      } catch (e) {
        if (alive) {
          setRows([])
          setError(
            e instanceof ApiError && e.status === 403
              ? "این صفحه فقط برای مدیر است."
              : e instanceof ApiError
                ? e.message
                : "دریافت اطلاعات ممکن نشد."
          )
        }
      } finally {
        if (alive) setLoading(false)
      }
    }, 250)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [page, status, search, reload])
  async function decide(
    row: Registration,
    decision: "approve" | "reject",
    note: string
  ) {
    if (busy) return
    setBusy(true)
    setError("")
    try {
      await api.post(
        `/events/registrations/${row.registration_token}/decision/`,
        { decision, note },
        true
      )
      setReload((r) => r + 1)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "تصمیم ثبت نشد.")
    } finally {
      setBusy(false)
    }
  }
  async function download(row: Registration) {
    try {
      const blob = await api.blob(
        `/events/registrations/${row.registration_token}/receipt/`
      )
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `receipt-${row.registration_token}`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setError("دریافت رسید ممکن نشد.")
    }
  }
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-(--crp-cream) text-(--crp-espresso)"
    >
      <div className="ed-shell pt-28 pb-20">
        <h1 className="t-h1">مدیریت ثبت‌نام</h1>
        {!loading && !loggedIn && (
          <Link
            className="inline-flex min-h-12 items-center underline"
            href="/login?next=/dashboard"
          >
            ورود با شماره حساب مدیر
          </Link>
        )}
        {loggedIn && (
          <div className="my-6 flex flex-wrap gap-4">
            <label>
              جست‌وجو
              <input
                className="block min-h-12 border px-3"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </label>
            <label>
              وضعیت
              <select
                className="block min-h-12 border px-3"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">همه</option>
                <option value="pending">در انتظار بررسی</option>
                <option value="confirmed">تأییدشده</option>
                <option value="rejected">ردشده</option>
              </select>
            </label>
            <button
              className="min-h-12 underline"
              onClick={() => setReload((r) => r + 1)}
            >
              بازخوانی
            </button>
          </div>
        )}
        {error && (
          <p role="alert" className="my-5">
            {error}
          </p>
        )}
        {loading ? (
          <p role="status">در حال دریافت…</p>
        ) : (
          loggedIn && !error && !rows.length && <p>ثبت‌نامی در این نما نیست.</p>
        )}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => (
            <article key={r.id} className="border border-(--crp-sand) p-5">
              <h2 className="text-lg font-bold">{r.full_name}</h2>
              <p dir="ltr">{r.phone_number}</p>
              <p>
                {r.event_title} — {r.status_display}
              </p>
              {r.time_slot && (
                <p>
                  {r.time_slot.start_time.slice(0, 5)} تا{" "}
                  {r.time_slot.end_time.slice(0, 5)}
                </p>
              )}
              <p>شماره مرجع: {r.reference_number || "—"}</p>
              {r.receipt_url && (
                <button
                  className="min-h-12 underline"
                  onClick={() => void download(r)}
                >
                  دانلود خصوصی رسید
                </button>
              )}
              {r.admin_note && <p>{r.admin_note}</p>}
              {r.status === "pending" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const form = e.currentTarget
                    const native = e.nativeEvent as SubmitEvent
                    void decide(
                      r,
                      (native.submitter as HTMLButtonElement)?.value ===
                        "reject"
                        ? "reject"
                        : "approve",
                      String(new FormData(form).get("note") ?? "")
                    )
                  }}
                >
                  <label>
                    یادداشت بررسی
                    <textarea
                      className="my-3 block w-full border p-3"
                      name="note"
                      maxLength={2000}
                    />
                  </label>
                  <div className="flex gap-4">
                    <button
                      name="decision"
                      value="approve"
                      disabled={busy}
                      className="outline-action min-h-12 px-4"
                    >
                      تأیید
                    </button>
                    <button
                      name="decision"
                      value="reject"
                      disabled={busy}
                      className="outline-action min-h-12 px-4"
                    >
                      رد
                    </button>
                  </div>
                </form>
              )}
            </article>
          ))}
        </div>
        {loggedIn && (
          <nav aria-label="صفحات ثبت‌نام" className="mt-8 flex gap-6">
            <button
              className="min-h-12"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              قبلی
            </button>
            <span>{page}</span>
            <button
              className="min-h-12"
              disabled={!hasNext || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              بعدی
            </button>
          </nav>
        )}
      </div>
    </main>
  )
}
