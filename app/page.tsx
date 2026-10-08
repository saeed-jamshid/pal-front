"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import EventArtwork from "@/components/event/EventArtwork"
import ProductCard from "@/components/shop/ProductCard"
import PalStory from "@/components/landing/PalStory"
import {
  faDate,
  faDigits,
  faTime,
  fetchEvents,
  type PalEvent,
} from "@/lib/event-api"
import { fetchProducts, formatPrice, type Product } from "@/lib/shop"

export default function HomePage() {
  const [events, setEvents] = useState<PalEvent[] | null>(null)
  const [eventError, setEventError] = useState("")
  const [coffees, setCoffees] = useState<Product[]>([])
  useEffect(() => {
    let alive = true
    fetchEvents()
      .then((list) => alive && setEvents(list))
      .catch(() => alive && setEventError("دریافت رویدادها ممکن نشد."))
    fetchProducts()
      .then((list) => {
        if (!alive) return
        const featured = list.filter((p) => p.featured)
        setCoffees((featured.length ? featured : list).slice(0, 3))
      })
      .catch(() => {
        /* The section keeps its link to /catalog. */
      })
    return () => {
      alive = false
    }
  }, [])

  const next = events?.[0]
  const nextLabel =
    next?.title ?? (eventError || (events ? "به‌زودی" : "در حال دریافت…"))

  return (
    <main className="min-h-screen bg-(--surface-100) pt-20 text-(--ink)">
      {/* Hero */}
      <section aria-labelledby="hero-title" className="ed-shell hero-section">
        <div className="hero-layout">
          <div className="hero-intro">
            <p className="text-sm font-bold text-(--brick)">پَل در بیرجند · قهوه و دورهمی</p>
            <h1 id="hero-title" className="fa-hero mt-3">قهوه‌های پَل</h1>
            <p className="lead mt-4">قهوه برای خانه؛ دورهمی برای کنار هم بودن.</p>
          </div>
          <div className="hero-art">
            <EventArtwork variant="landing" />
          </div>
          <div className="hero-actions">
            <div className="flex flex-wrap gap-3">
              <Link href="/submit" className="btn btn--primary">ثبت‌نام رویداد</Link>
              <Link href="/catalog" className="btn btn--secondary">دیدن قهوه‌ها</Link>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-(--hairline) py-4">
              <div>
                <dt className="text-sm text-(--ink-muted)">رویداد پیش رو</dt>
                <dd className="font-bold">{nextLabel}</dd>
                {next?.date && <dd className="text-sm">{faDate(next.date)}</dd>}
              </div>
              <div>
                <dt className="text-sm text-(--ink-muted)">مکان</dt>
                <dd className="font-bold">بیرجند</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Coffees */}
      <section aria-labelledby="coffees-title" className="ed-shell section pt-0">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-(--outline) pb-4">
          <h2 id="coffees-title" className="fa-h1">
            قهوه‌های این فصل
          </h2>
          <Link
            href="/catalog"
            className="inline-flex min-h-11 items-center font-bold text-(--cistern) underline-offset-4 hover:underline"
          >
            همهٔ قهوه‌ها
          </Link>
        </div>
        {coffees.length > 0 && (
          <div className="pgrid mt-6">
            {coffees.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </section>

      <PalStory />

      {/* Archive band */}
      <section aria-labelledby="archive-title" className="band">
        <div className="ed-shell section grid items-center gap-8 min-[761px]:grid-cols-2">
          <div>
            <p className="text-sm font-bold text-(--ink-muted)">آرشیو دورهمی‌های قبلی</p>
            <h2 id="archive-title" className="fa-h1 mt-2">
              چند قاب از کنار هم بودن
            </h2>
            <p className="mt-4 leading-8">
              عکس‌های دورهمی‌های قبلی پَل را در گالری ببینید.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/gallery" className="btn btn--secondary">
                دیدن گالری
              </Link>
              <Link href="/about" className="btn btn--secondary">
                دربارهٔ ما
              </Link>
            </div>
          </div>
          <Image
            src="/img/gallery/optimized/0.webp"
            alt="عکسی از دورهمی قبلی پَل"
            width={800}
            height={560}
            sizes="(max-width: 760px) 100vw, 50vw"
            className="aspect-[4/3] w-full rounded-(--radius-md) border border-(--outline) object-cover"
          />
        </div>
      </section>

      {/* Event */}
      <section aria-labelledby="event-title" className="ed-shell section">
        <h2 id="event-title" className="fa-h1 border-b border-(--outline) pb-4">
          رویداد پیش رو
        </h2>
        {!next ? (
          <p className="lead mt-6" role="status">
            {events ? "رویداد بعدی به‌زودی اعلام می‌شود." : nextLabel}
          </p>
        ) : (
          <div className="mt-6 grid items-start gap-8 min-[761px]:grid-cols-[1fr_380px]">
            <div>
              {next.description && <p className="leading-8">{next.description}</p>}
              <h3 className="mt-6 font-bold">برنامهٔ زمانی</h3>
              <ul className="mt-2">
                {next.time_slots.map((slot) => (
                  <li key={slot.id} className="program-row">
                    <time>
                      {faTime(slot.start_time)} تا {faTime(slot.end_time)}
                    </time>
                    <span>بازهٔ حضور</span>
                    <span className="text-sm text-(--ink-muted)">
                      {slot.remaining_capacity > 0
                        ? `${faDigits(slot.remaining_capacity)} جای خالی`
                        : "تکمیل"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <aside className="info-block" aria-labelledby="event-info-title">
              <h3 id="event-info-title" className="fa-h2">
                {next.title}
              </h3>
              <dl>
                {next.date && (
                  <>
                    <dt>تاریخ</dt>
                    <dd>{faDate(next.date)}</dd>
                  </>
                )}
                <dt>مکان</dt>
                <dd>بیرجند</dd>
                <dt>هزینه</dt>
                <dd>{next.price_rial ? formatPrice(next.price_rial) : "رایگان"}</dd>
              </dl>
              <div>
                <Link href="/submit" className="btn btn--on-cistern">
                  رزرو رویداد
                </Link>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}
