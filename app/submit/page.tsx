"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import EventArtwork from "@/components/event/EventArtwork"
import { ApiError, fetchProfile, isAuthed, updateProfile } from "@/lib/api"
import {
  fetchEvents,
  fetchRegistrations,
  registerEvent,
  type PalEvent,
  type Registration,
} from "@/lib/event-api"
import { fetchCards, type BankCard } from "@/lib/payments"
import { formatPrice } from "@/lib/shop"

const field =
  "mt-2 min-h-12 w-full border border-(--crp-sand) bg-transparent px-4"

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
    <main
      dir="rtl"
      className="min-h-screen w-full bg-(--crp-cream) text-(--crp-espresso)"
    >
      <div className="ed-shell max-w-6xl pt-28 pb-20">
        <h1 className="t-h1 border-b border-(--crp-sand) pb-7">
          ثبت‌نام رویدادهای پَل
        </h1>
        {loading && (
          <p role="status" className="mt-6">
            در حال دریافت…
          </p>
        )}
        {error && (
          <p role="alert" className="mt-6 border-r-2 border-red-700 p-4">
            {error}
          </p>
        )}
        {result ? (
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div role="status">
              <h2 className="text-2xl font-bold">درخواست ثبت شد</h2>
              <p className="mt-4">
                {result.status_display} —{" "}
                {result.status === "pending"
                  ? "ارسال رسید به معنی تأیید پرداخت نیست."
                  : "ثبت‌نام رایگان تأیید شد."}
              </p>
              <Link
                className="mt-6 inline-flex min-h-12 items-center underline"
                href={`/submit/status/${result.registration_token}`}
              >
                پیگیری ثبت‌نام
              </Link>
            </div>
            <EventArtwork variant="success" />
          </div>
        ) : (
          !loading && (
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div>
                {!events.length ? (
                  <p>فعلاً رویدادی برای ثبت‌نام اعلام نشده است.</p>
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
                        <p>{selected.description}</p>
                        {selected.date && (
                          <p>
                            {new Date(
                              `${selected.date}T12:00:00`
                            ).toLocaleDateString("fa-IR")}
                          </p>
                        )}
                        <p>
                          هزینه:{" "}
                          {selected.price_rial
                            ? formatPrice(selected.price_rial)
                            : "رایگان"}
                        </p>
                      </div>
                    )}
                    {!authed ? (
                      <Link
                        className="outline-action inline-flex min-h-12 items-center px-6"
                        href="/login?next=/submit"
                      >
                        ورود برای ثبت‌نام
                      </Link>
                    ) : existing ? (
                      <p role="status">
                        قبلاً ثبت‌نام کرده‌اید.{" "}
                        <Link
                          className="underline"
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
                              شماره حساب: <span dir="ltr">{phone}</span>
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
                                    {s.start_time.slice(0, 5)} تا{" "}
                                    {s.end_time.slice(0, 5)} —{" "}
                                    {s.remaining_capacity} جای خالی
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
                              className="outline-action min-h-12 w-full disabled:opacity-60"
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
                  <div className="mt-8">
                    <h2 className="text-xl font-bold">ثبت‌نام‌های من</h2>
                    {registrations.length ? (
                      registrations.map((r) => (
                        <Link
                          key={r.id}
                          className="flex min-h-12 items-center justify-between border-b border-(--crp-sand)"
                          href={`/submit/status/${r.registration_token}`}
                        >
                          <span>{r.event_title}</span>
                          <span>{r.status_display}</span>
                        </Link>
                      ))
                    ) : (
                      <p className="mt-3">هنوز ثبت‌نامی ندارید.</p>
                    )}
                  </div>
                )}
              </div>
              <EventArtwork variant="registration" className="self-start" />
            </div>
          )
        )}
      </div>
    </main>
  )
}
