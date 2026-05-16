"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { s } from "./styles/index"
import LineMdCoffeeHalfEmptyTwotoneLoop from "./icons/LineMdCoffeeHalfEmptyTwotoneLoop"

function getTimeLeft(targetDate: Date) {
  const now = new Date().getTime()
  const distance = targetDate.getTime() - now

  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((distance / (1000 * 60)) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  }
}
function TimeBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-h-8 w-14 items-center justify-center gap-2 rounded-lg px-1 py-2 text-xs sm:w-18 sm:justify-around sm:px-2">
      <span className="grid h-3 place-items-center">
        {value.toString().padStart(2, "0")}{" "}
      </span>
      <span className="grid place-items-center text-sm opacity-70 sm:mr-auto sm:ml-2">
        {label}
      </span>
    </div>
  )
}

export default function PalCoffeeEventForm() {
  const targetDate = new Date("2026-05-22T10:00:00")
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate))
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main style={s.page}>
      <div style={s.topBar}>
        <span style={s.brand}>
          <Image
            src="/img/pal_logo.png"
            quality={100}
            unoptimized
            width="50"
            loading="eager"
            height="20"
            alt="pal_logo"
          />
          برشته کاری پَل
        </span>
      </div>
      <section className="">
        <Image
          src="/img/pal_cups.png"
          className="boxShadowMain"
          quality={100}
          width="450"
          loading="eager"
          height="400"
          alt="pal_logo"
        />
        <div className="mx-auto mt-4 flex flex-col-reverse items-center justify-center gap-2 sm:flex-row sm:gap-4">
          <Button variant="outline" className="boxShadowMain">
            ثبت نام
            <LineMdCoffeeHalfEmptyTwotoneLoop />
          </Button>
          <div
            dir="rtl"
            className="flex items-center gap-2 rounded-[8px] border px-2 text-center sm:gap-4"
          >
            <TimeBox label="روز" value={timeLeft.days} />
            <TimeBox label="ساعت" value={timeLeft.hours} />
            <TimeBox label="دقیقه" value={timeLeft.minutes} />
            <TimeBox label="ثانیه" value={timeLeft.seconds} />
          </div>
        </div>
      </section>

      <h1 className="mt-10 w-full text-center font-bold">
        پَل , کم کردن فاصله ها
      </h1>
      {/* middle page */}
      <section className="mt-4 flex w-full flex-col">
        <article className="mx-auto my-4 flex items-center justify-between gap-2">
          <Image
            src="/img/pal_people.png"
            width="200"
            loading="lazy"
            height="300"
            alt="pal_logo"
          />
          <p className="mx-auto w-50 max-w-2xl text-justify text-xs tracking-normal">
            این دورهمی یک بهونه‌ست برای باهم بودن، حرف زدن، چشیدن و تجربه کردن
            یه حس تازه.
            <br />
            برای اینکه بدونیم قهوه‌ای که توی فنجونه‌مونه، از کجا اومده، چه مسیری
            رو طی کرده و چرا هرکدومش یه حس خاص داره.
          </p>
        </article>
        <article className="mx-auto my-4 flex flex-row-reverse items-center justify-between gap-2">
          <Image
            src="/img/pal_lady.png"
            width="200"
            loading="lazy"
            height="300"
            alt="pal_logo"
          />
          <p className="w-50 max-w-2xl text-justify text-xs tracking-normal">
            توی دنیایی که جنگ و تورم هر روز قیمت قهوه رو بالا می‌بره; ما ترجیح
            می‌دیم به‌جای از دست دادن امید و کم کردن کیفیت و تسلیم شدن از فرهنگ
            قهوه دست به دست هم بدیم تا با ساده درست کردن قهوه فرهنگ قهوه رو زنده
            نگه داریم
            <br />
          </p>
        </article>
        <div className="mx-auto my-6 flex w-full max-w-2xl items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <div className="h-[6px] w-[6px] rounded-full bg-accent opacity-60" />
          <div className="h-px flex-1 bg-border" />
        </div>
        <article className="mx-auto mt-4 w-45 text-justify">
          قهوه فقط یه نوشیدنی نیست یک صنعت است یک فرهنگ است و برای خیلی ها تمام
          زندگی شان….
        </article>
      </section>
      <section>
        <article>

        </article>
      </section>
    </main>
  )
}
