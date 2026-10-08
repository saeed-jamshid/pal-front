"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import EventArtwork from "@/components/event/EventArtwork"
import { ApiError, fetchProfile, isAuthed, updateProfile } from "@/lib/api"
import {
  faDate,
  faDigits,
  faTime,
  fetchEvents,
  fetchRegistrations,
  registerEvent,
  type PalEvent,
  type Registration,
} from "@/lib/event-api"
import { fetchCards, type BankCard } from "@/lib/payments"
import { formatPrice } from "@/lib/shop"

const field = "field"
const badge = (status: Registration["status"]) =>
  `status-badge status-badge--${status}`

export default function Submit() {
  const [events, setEvents] = useState<PalEvent[]>([])
  const [cards, setCards] = useState<BankCard[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [eventId, setEventId] = useState(0)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<Registration | null>(null)
  const selected = events.find((e) => e.id === eventId)
  const existing = registrations.find((r) => r.event === eventId)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const list = await fetchEvents()
        if (!alive) return
        setEvents(list)
        setEventId(list[0]?.id ?? 0)
        const loggedIn = isAuthed()
        setAuthed(loggedIn)
        if (loggedIn) {
          const [profile, userCards, previous] = await Promise.all([
            fetchProfile(),
            fetchCards(),
            fetchRegistrations(),
          ])
          if (!alive) return
          setName(profile.full_name)
          setPhone(profile.phone_number)
          setCards(userCards)
          setRegistrations(previous)
        }
      } catch (e) {
        if (alive)
          setError(
            e instanceof ApiError ? e.message : "دریافت اطلاعات ممکن نشد."
          )
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selected || busy || existing) return
    const data = new FormData(e.currentTarget)
    const receipt = data.get("payment_receipt")
    if (
      selected.price_rial &&
      (!(receipt instanceof File) ||
        !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
          receipt.type
        ) ||
        receipt.size > 5 * 1024 * 1024 ||
        receipt.size === 0)
    ) {
      setError("رسید JPG، PNG، WebP یا PDF تا ۵ مگابایت انتخاب کنید.")
      return
    }
    if (!selected.price_rial) {
      data.delete("payment_receipt")
      data.delete("card_id")
    }
    setBusy(true)
    setError("")
    try {
      await updateProfile(name.trim())
      setResult(await registerEvent(data))
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "ارتباط قطع شد. پیش از ارسال دوباره، ثبت‌نام‌های خود را بررسی کنید."
      )
      try {
        setRegistrations(await fetchRegistrations())
      } catch {
        /* Keep original error. */
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen w-full bg-(--surface-100) pt-24 text-(--ink)">
      <div className="ed-shell section">
        <h1 className="fa-h1 border-b border-(--outline) pb-6">
          ثبت‌نام رویدادهای پَل
        </h1>
        {loading && (
          <p role="status" className="mt-6">
            در حال دریافت…
          </p>
        )}
        {error && (
          <p role="alert" className="mt-6 rounded-(--radius-md) border border-(--brick) bg-(--surface-200) p-4 font-semibold text-(--brick)">
            {error}
          </p>
        )}
        {result ? (
          <div className="mt-8 grid items-start gap-8 min-[1001px]:grid-cols-2">
            <div role="status" className="grid justify-items-start gap-4">
              <h2 className="fa-h2">درخواست شما ثبت شد</h2>
              <span className={badge(result.status)}>{result.status_display}</span>
              <p className="leading-8">
                {result.status === "pending"
                  ? "ثبت‌نام شما در انتظار بررسی است. ارسال رسید به معنی تأیید پرداخت نیست؛ پس از بررسی، وضعیت در صفحهٔ پیگیری به‌روز می‌شود."
                  : result.status === "confirmed"
                    ? "ثبت‌نام شما تأیید شد."
                    : "ثبت‌نام شما رد شد. جزئیات را در صفحهٔ پیگیری ببینید."}
              </p>
              <Link
                className="btn btn--secondary"
                href={`/submit/status/${result.registration_token}`}
              >
                پیگیری ثبت‌نام
              </Link>
              <p className="text-sm text-(--ink-muted)">
                برای دیدن وضعیت، با همین شماره وارد شوید.
              </p>
            </div>
            <div className="order-first min-[1001px]:order-last">
              <EventArtwork variant="success" />
            </div>
          </div>
        ) : (
          !loading && (
            <div className="mt-8 grid items-start gap-8 min-[1001px]:grid-cols-2">
              <div>
                {!events.length ? (
                  <p className="lead">رویداد بعدی به‌زودی اعلام می‌شود.</p>
                ) : (
                  <>
                    <label>
                      رویداد
                      <select
                        className={field}
                        value={eventId}
                        disabled={busy}
                        onChange={(e) => setEventId(Number(e.target.value))}
                      >
                        {events.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    {selected && (
                      <div className="my-6 space-y-3">
                        <h2 className="fa-h2">{selected.title}</h2>
                        {selected.description && <p className="leading-8">{selected.description}</p>}
                        {selected.date && <p className="font-bold">{faDate(selected.date)}</p>}
                        <p>
                          هزینه:{" "}
                          {selected.price_rial
                            ? formatPrice(selected.price_rial)
                            : "رایگان"}
                        </p>
                      </div>
                    )}
                    {!authed ? (
                      <div className="grid justify-items-start gap-2">
                        <Link className="btn btn--primary" href="/login?next=/submit">
                          ورود یا ساخت حساب برای ثبت‌نام
                        </Link>
                        <p className="text-sm text-(--ink-muted)">
                          با شمارهٔ موبایل و کد پیامکی وارد می‌شوید؛ بار اول حساب شما ساخته می‌شود.
                        </p>
                      </div>
                    ) : existing ? (
                      <p role="status" className="flex flex-wrap items-center gap-3">
                        برای این رویداد ثبت‌نام کرده‌اید.
                        <span className={badge(existing.status)}>{existing.status_display}</span>
                        <Link
                          className="btn btn--secondary"
                          href={`/submit/status/${existing.registration_token}`}
                        >
                          پیگیری وضعیت
                        </Link>
                      </p>
                    ) : (
                      selected && (
                        <form
                          key={eventId}
                          onSubmit={submit}
                          className="space-y-5"
                        >
                          <fieldset disabled={busy} className="space-y-5">
                            <label className="block">
                              نام کامل
                              <input
                                className={field}
                                required
                                autoComplete="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                              />
                            </label>
                            <p>
                              شماره موبایل: <span dir="ltr">{phone}</span>
                            </p>
                            <label className="block">
                              زمان حضور
                              <select
                                name="time_slot"
                                className={field}
                                required
                                defaultValue=""
                              >
                                <option value="" disabled>
                                  انتخاب بازه
                                </option>
                                {selected.time_slots.map((s) => (
                                  <option
                                    key={s.id}
                                    value={s.id}
                                    disabled={s.remaining_capacity <= 0}
                                  >
                                    {faTime(s.start_time)} تا {faTime(s.end_time)} —{" "}
                                    {s.remaining_capacity > 0
                                      ? `${faDigits(s.remaining_capacity)} جای خالی`
                                      : "تکمیل"}
                                  </option>
                                ))}
                              </select>
                            </label>
                            {selected.price_rial > 0 && (
                              <>
                                <label className="block">
                                  کارت مقصد
                                  <select
                                    name="card_id"
                                    required
                                    className={field}
                                    defaultValue=""
                                  >
                                    <option value="" disabled>
                                      انتخاب کارت
                                    </option>
                                    {cards.map((c) => (
                                      <option value={c.id} key={c.id}>
                                        {c.bank_name} — {c.account_holder} —{" "}
                                        {c.card_number}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                {!cards.length && (
                                  <p role="status">
                                    کارت پرداخت فعال نیست؛ وجهی واریز نکنید.
                                  </p>
                                )}
                                <p>
                                  مبلغ دقیق بالا را به کارت انتخاب‌شده واریز
                                  کنید. تأیید رسید دستی است.
                                </p>
                                <label className="block">
                                  رسید پرداخت
                                  <input
                                    className={field}
                                    name="payment_receipt"
                                    type="file"
                                    required
                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                  />
                                </label>
                                <label className="block">
                                  شماره مرجع (اختیاری)
                                  <input
                                    className={field}
                                    name="reference_number"
                                    maxLength={50}
                                  />
                                </label>
                              </>
                            )}
                            <button
                              className="btn btn--primary w-full"
                              disabled={
                                busy ||
                                !selected.time_slots.some(
                                  (s) => s.remaining_capacity > 0
                                ) ||
                                (selected.price_rial > 0 && !cards.length)
                              }
                            >
                              {busy ? "در حال ثبت…" : "ارسال درخواست ثبت‌نام"}
                            </button>
                          </fieldset>
                        </form>
                      )
                    )}
                  </>
                )}
                {authed && (
                  <div id="my-registrations" className="mt-10 scroll-mt-28">
                    <h2 className="text-xl font-bold">ثبت‌نام‌های من</h2>
                    {registrations.length ? (
                      registrations.map((r) => (
                        <Link
                          key={r.id}
                          className="flex min-h-14 items-center justify-between gap-3 border-b border-(--hairline) transition-colors hover:bg-(--surface-200)"
                          href={`/submit/status/${r.registration_token}`}
                        >
                          <span className="font-semibold">{r.event_title}</span>
                          <span className={badge(r.status)}>{r.status_display}</span>
                        </Link>
                      ))
                    ) : (
                      <p className="mt-3">هنوز ثبت‌نامی ندارید.</p>
                    )}
                  </div>
                )}
              </div>
              <div className="order-first min-[1001px]:order-last">
                <EventArtwork variant="registration" />
              </div>
            </div>
          )
        )}
      </div>
    </main>
  )
}
