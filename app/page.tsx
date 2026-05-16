"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { s } from "./styles/index"
import Link from "next/link"
import LineMdCoffeeHalfEmptyTwotoneLoop from "./icons/LineMdCoffeeHalfEmptyTwotoneLoop"
import GameIconsCoffeePot from "./icons/GameIconsCoffeePot"
import PhCoffeeBeanFill from "./icons/PhCoffeeBeanFill"
import StreamlineUltimateCoffeeEspressoMachineBold from "./icons/StreamlineUltimateCoffeeEspressoMachineBold"
import GravityUiTerminalLine from "./icons/GravityUiTerminalLine"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

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

  //  const card1 = document.getElementById("main-card")
  //  const card2 = document.getElementById("second-card")
  //
  //  const syncHeight = () => {
  //    if (card1 && card2) card2.style.height = card1.offsetHeight + "px"
  //  }
  //  syncHeight()
  //  window.addEventListener("resize", syncHeight)

  return (
    <main style={s.page}>
      <div style={s.topBar}>
        <Popover>
          <PopoverTrigger asChild>
            <span style={s.brand} className="font-soraya!">
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
          </PopoverTrigger>
          <PopoverContent className="mr-5 w-50">
            <PopoverHeader className="text-center text-base">
              <PopoverTitle>پَل یعنی دوستی</PopoverTitle>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </div>
      <section className="">
        <Image
          src="/img/pal_cups.png"
          className="boxShadowMain"
          quality={70}
          width="450"
          loading="eager"
          height="400"
          alt="pal_logo"
        />
        <div className="mx-auto mt-4 flex flex-col-reverse items-center justify-center gap-2 sm:flex-row sm:gap-2">
          <Link href="/submit">
            <Button variant="outline" className="boxShadowMain">
              ثبت نام
              <LineMdCoffeeHalfEmptyTwotoneLoop />
            </Button>
          </Link>
          <div
            dir="rtl"
            className="flex w-full items-center justify-between gap-2 rounded-[8px] border px-2 text-center sm:w-84 sm:justify-center sm:gap-4"
          >
            <TimeBox label="روز" value={timeLeft.days} />
            <TimeBox label="ساعت" value={timeLeft.hours} />
            <TimeBox label="دقیقه" value={timeLeft.minutes} />
            <TimeBox label="ثانیه" value={timeLeft.seconds} />
          </div>
        </div>
      </section>

      <h1 className="mt-10 w-full text-center font-eng text-3xl font-bold">
        After Taste
      </h1>
      {/* middle page */}
      <section className="mt-2 flex w-full flex-col">
        <article className="mx-auto mt-4 flex flex-col items-center justify-between gap-2">
          <Image
            src="/img/pal_people.png"
            quality={70}
            width="300"
            loading="lazy"
            height="300"
            alt="pal_logo"
          />
          <p className="mx-auto w-full max-w-2xl rounded-t-[8px] border border-b-0 p-2 pb-6 text-justify text-xs leading-5 tracking-normal">
            این دورهمی یک بهونه‌ست برای باهم بودن، حرف زدن، چشیدن و تجربه کردن
            یه حس تازه.
            <br />
            برای اینکه بدونیم قهوه‌ای که توی فنجونه‌مونه، از کجا اومده، چه مسیری
            رو طی کرده و چرا هرکدومش یه حس خاص داره.
          </p>
        </article>
        <article className="mx-auto mb-4 flex flex-row-reverse items-center justify-between">
          <div className="relative border-t">
            <span className="absolute -top-px -right-px z-2 hidden size-4 rounded-tr-[8px] border-t border-r"></span>
            <Image
              src="/img/pal_lady.png"
              width="200"
              className="h-55! object-contain"
              loading="lazy"
              height="200"
              alt="pal_logo"
            />
          </div>
          <p className="h-[220px] w-50 max-w-2xl rounded-b-[8px] border border-t-0 p-2 text-justify text-xs leading-5 tracking-normal">
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
      <h1 className="my-3 mt-10 font-bold">برنامه چیه؟!</h1>
      <section className="flex flex-col items-center gap-6 pb-30 md:flex-row">
        <article className="boxShadowMain boxShadowMainH relative flex flex-col overflow-hidden rounded-[8px] transition hover:scale-105">
          <Image
            src="/img/brew.jpeg"
            quality={70}
            width="250"
            height="250"
            alt="pal_logo"
          />
          <p className="absolute right-3 bottom-3 flex items-center gap-1 rounded-[8px] border bg-primary px-2 py-1 text-xs text-white">
            قهوه دمی
            <GameIconsCoffeePot />
          </p>
        </article>
        <article className="boxShadowMain boxShadowMainH relative flex flex-col overflow-hidden rounded-[8px] transition hover:scale-105">
          <Image
            src="/img/beans.jpeg"
            quality={70}
            width="250"
            height="250"
            alt="pal_logo"
            id="main-card"
          />
          <p className="absolute right-3 bottom-3 flex items-center gap-1 rounded-[8px] border bg-primary px-2 py-1 text-xs text-white">
            حس خوب
            <PhCoffeeBeanFill />
          </p>
        </article>
        <article className="boxShadowMain boxShadowMainH relative flex flex-col overflow-hidden rounded-[8px] transition hover:scale-105">
          <Image
            src="/img/espersso.jpeg"
            quality={70}
            width="250"
            id="second-card"
            className="h-[166px]! object-cover!"
            height="250"
            alt="pal_logo"
          />
          <p className="absolute right-3 bottom-3 flex items-center gap-1 rounded-[8px] border bg-primary px-2 py-1 text-xs text-white">
            قهوه اسپرسو
            <StreamlineUltimateCoffeeEspressoMachineBold />
          </p>
        </article>
      </section>
      <footer className="flex size-full flex-col justify-between gap-2 rounded-[8px] bg-[#280000] py-2 text-center text-[10px] text-[#fff9ef]">
        <span className="mb-auto">
          اردیبهشت ۱۴۰۵ — تمامی حقوق این رویداد محفوظ است ©
        </span>
        <span className="mx-auto items-center flex flex-col">
          Made With Suffer
          <span>Saeed & Jamshid</span>
          <GravityUiTerminalLine />
        </span>
        <span className="flex items-center justify-center gap-1 text-[9px]">
          در صورت وجود مشکل در ثبت نام با این شماره تماس بگیرید
          <a href="tel:+989393258985">
            <Badge variant="destructive">09393258985</Badge>
          </a>
        </span>
      </footer>
    </main>
  )
}
