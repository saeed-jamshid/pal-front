"use client"

import { useEffect, useState } from "react"
import { ApiError } from "@/lib/api"
import {
  fetchCards,
  startCardPayment,
  fetchCardPayment,
  uploadCardReceipt,
  PAYMENT_LABELS,
  type BankCard,
  type CardPayment,
} from "@/lib/payments"
import { formatPrice } from "@/lib/shop"

export default function OrderPayment({
  orderNumber,
  onUpdate,
}: {
  orderNumber: string
  onUpdate: () => void
}) {
  const [cards, setCards] = useState<BankCard[]>([])
  const [payment, setPayment] = useState<CardPayment | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [now, setNow] = useState(0)
  useEffect(() => {
    const tick = () => setNow(Date.now())
    const first = setTimeout(tick, 0)
    const timer = setInterval(tick, 1000)
    return () => {
      clearTimeout(first)
      clearInterval(timer)
    }
  }, [])
  const key = `pal_payment_${orderNumber}`
  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const list = await fetchCards()
        if (!alive) return
        setCards(list)
        const id = Number(localStorage.getItem(key))
        if (id) {
          try {
            const p = await fetchCardPayment(id)
            if (alive) setPayment(p)
          } catch (e) {
            if (!(e instanceof ApiError && e.status === 404)) throw e
            localStorage.removeItem(key)
          }
        }
      } catch (e) {
        if (alive)
          setError(
            e instanceof ApiError
              ? e.message
              : "دریافت اطلاعات پرداخت ممکن نشد."
          )
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [key])
  async function start(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return
    const card = Number(new FormData(e.currentTarget).get("card_id"))
    setBusy(true)
    setError("")
    try {
      const p = await startCardPayment(orderNumber, card)
      setPayment(p)
      localStorage.setItem(key, String(p.payment_id))
      onUpdate()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "آغاز پرداخت ممکن نشد.")
    } finally {
      setBusy(false)
    }
  }
  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!payment || busy) return
    const body = new FormData(e.currentTarget)
    setBusy(true)
    setError("")
    try {
      setPayment(await uploadCardReceipt(payment.payment_id, body))
      onUpdate()
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "ارسال ممکن نشد. پیش از تلاش دوباره وضعیت را بازخوانی کنید."
      )
    } finally {
      setBusy(false)
    }
  }
  async function refresh() {
    if (!payment || busy) return
    setBusy(true)
    setError("")
    try {
      setPayment(await fetchCardPayment(payment.payment_id))
      onUpdate()
    } catch {
      setError("بازخوانی پرداخت ممکن نشد.")
    } finally {
      setBusy(false)
    }
  }
  const expired = payment && new Date(payment.expires_at).getTime() <= now
  return (
    <section className="my-8 space-y-4 border border-(--crp-sand) p-5">
      <h2 className="text-xl font-bold">پرداخت کارت‌به‌کارت</h2>
      {loading && <p role="status">در حال دریافت…</p>}
      {error && <p role="alert">{error}</p>}
      {payment && (
        <>
          <p role="status">
            {PAYMENT_LABELS[payment.status] ?? payment.status}
          </p>
          <p>مبلغ: {formatPrice(payment.amount_rial)}</p>
          <p>
            {payment.card.bank_name} — {payment.card.account_holder}
          </p>
          <p dir="ltr">{payment.card.card_number}</p>
          <p>مهلت: {new Date(payment.expires_at).toLocaleString("fa-IR")}</p>
          {payment.admin_note && <p>یادداشت بررسی: {payment.admin_note}</p>}
          <button
            className="min-h-12 underline"
            disabled={busy}
            onClick={() => void refresh()}
          >
            بازخوانی وضعیت
          </button>
          {!expired &&
            ["awaiting_receipt", "rejected"].includes(payment.status) && (
              <form onSubmit={upload} className="space-y-3">
                <p>
                  تأیید پرداخت دستی است. تا تأیید مدیر، سفارش پرداخت‌شده نیست.
                </p>
                <label className="block">
                  رسید (حداکثر ۵ مگابایت)
                  <input
                    required
                    disabled={busy}
                    type="file"
                    name="receipt"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="block min-h-12 w-full"
                  />
                </label>
                <button
                  disabled={busy}
                  className="outline-action min-h-12 px-5"
                >
                  {busy ? "در حال ارسال…" : "ارسال رسید"}
                </button>
              </form>
            )}
        </>
      )}
      {!loading && (!payment || expired || payment.status === "expired") && (
        <form onSubmit={start} className="space-y-4">
          {expired && (
            <p>مهلت قبلی تمام شده؛ قبل از واریز، پرداخت جدید ایجاد کنید.</p>
          )}
          {cards.length ? (
            <>
              <label className="block">
                کارت مقصد
                <select
                  name="card_id"
                  required
                  disabled={busy}
                  className="mt-2 min-h-12 w-full border px-3"
                >
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.bank_name} — {c.account_holder} — {c.card_number}
                    </option>
                  ))}
                </select>
              </label>
              <button disabled={busy} className="outline-action min-h-12 px-5">
                {busy ? "در حال دریافت…" : "دریافت اطلاعات پرداخت"}
              </button>
            </>
          ) : (
            <p>کارت فعال موجود نیست؛ وجهی واریز نکنید.</p>
          )}
        </form>
      )}
    </section>
  )
}
