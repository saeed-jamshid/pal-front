"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { fetchEvents, type PalEvent } from "@/lib/event-api"
import EventArtwork from "@/components/event/EventArtwork"

export default function HomePage() {
  const [events, setEvents] = useState<PalEvent[] | null>(null)
  const [error, setError] = useState("")
  useEffect(() => {
    let alive = true
    fetchEvents()
      .then((events) => alive && setEvents(events))
      .catch(() => alive && setError("دریافت رویدادها ممکن نشد."))
    return () => {
      alive = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-(--crp-cream) text-(--crp-espresso)">
      <div className="ed-shell pt-24">
        <section
          aria-labelledby="event-title"
          className="grid min-h-[calc(100svh-7rem)] items-center gap-8 border-b border-(--crp-sand) py-10 md:grid-cols-2 md:gap-12"
        >
          <div className="max-w-2xl">
            <p className="mb-5 text-sm font-semibold text-(--crp-terracotta)">
              پَل در بیرجند · قهوه و دورهمی
            </p>
            <h1
              id="event-title"
              className="text-[clamp(3rem,8vw,7rem)] leading-[1.2] font-bold"
            >
              قهوه‌های پَل
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-9">
              قهوه برای خانه؛ دورهمی برای کنار هم بودن.
            </p>
            <Link
              href="/catalog"
              className="outline-action mt-6 inline-flex min-h-12 items-center px-8 font-semibold"
            >
              خرید قهوه
            </Link>
            <dl className="mt-8 grid max-w-lg grid-cols-2 gap-4 border-y border-(--crp-sand) py-5">
              <div>
                <dt className="text-sm text-(--crp-dark)">رویداد پیش رو</dt>
                <dd className="font-semibold">
                  {events?.[0]?.title ??
                    (error || (events ? "به‌زودی" : "در حال دریافت…"))}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-(--crp-dark)">مکان</dt>
                <dd className="font-semibold">
                  اطلاعات هر رویداد در صفحه ثبت‌نام
                </dd>
              </div>
            </dl>
            <Link
              href="/submit"
              className="outline-action mt-9 inline-flex min-h-12 items-center justify-center rounded-[10px] px-8 font-semibold"
            >
              رویدادها و ثبت‌نام
            </Link>
          </div>
          <EventArtwork variant="landing" className="max-w-2xl" />
        </section>
        <section
          aria-labelledby="archive-title"
          className="grid items-center gap-8 bg-(--crp-warm) px-4 py-14 md:grid-cols-2 md:px-8 md:py-20"
        >
          <div>
            <p className="text-sm font-semibold text-(--crp-terracotta)">
              آرشیو دورهمی‌های قبلی
            </p>
            <h2
              id="archive-title"
              className="mt-3 text-3xl leading-relaxed font-bold"
            >
              چند قاب از کنار هم بودن
            </h2>
            <p className="mt-4 leading-8">
              این عکس‌ها از دورهمی‌های پیشین پَل هستند، نه رویدادهای آینده.
            </p>
            <div className="mt-5 flex flex-wrap gap-6">
              <Link
                href="/gallery"
                className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
              >
                دیدن گالری
              </Link>
              <Link
                href="/about"
                className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
              >
                دربارهٔ ما
              </Link>
            </div>
          </div>
          <Image
            src="/img/gallery/optimized/0.webp"
            alt="عکسی از دورهمی قبلی پَل"
            width={800}
            height={560}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="aspect-[4/3] w-full object-cover"
          />
        </section>
      </div>
      <footer className="border-t border-(--crp-sand) bg-(--crp-warm) py-7 text-sm">
        <div className="ed-shell flex flex-wrap justify-between gap-3">
          <span>پَل · بیرجند</span>
          <a
            href="tel:+989393258985"
            dir="ltr"
            className="underline underline-offset-4"
          >
            ۰۹۳۹۳۲۵۸۹۸۵
          </a>
        </div>
      </footer>
    </main>
  )
}
