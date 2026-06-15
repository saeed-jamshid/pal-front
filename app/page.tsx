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
import MaterialSymbolsCalendarTodayOutline from "./icons/MaterialSymbolsCalendarTodayOutline"
import MaterialSymbolsLightAlarmOutline from "./icons/MaterialSymbolsLightAlarmOutline"
import MaterialSymbolsLocationOnRounded from "./icons/MaterialSymbolsLocationOnRounded"

import GravityUiTerminalLine from "./icons/GravityUiTerminalLine"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/layout/Header"

const EVENT_START_DATE = new Date("2026-05-22T10:00:00+03:30")
const EVENT_END_DATE = new Date("2026-05-22T14:00:00+03:30")

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
    <div className="flex items-center justify-center gap-2 rounded-lg px-1 py-2 text-xs sm:w-18 sm:justify-around sm:px-2">
      <span className="grid h-5 w-5 place-items-center transition-all duration-300">
        <span key={value} className="animate-pop">
          {value.toString().padStart(2, "0")}
        </span>
      </span>
      <span className="grid place-items-center text-sm opacity-70 sm:mr-auto sm:ml-2">
        {label}
      </span>
    </div>
  )
}

function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(EVENT_START_DATE))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(EVENT_START_DATE))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      dir="rtl"
      className="flex w-full items-center justify-evenly gap-2 rounded-[8px] border px-2 text-center sm:w-84 sm:gap-4"
    >
      <TimeBox label="روز" value={timeLeft.days} />
      <TimeBox label="ساعت" value={timeLeft.hours} />
      <TimeBox label="دقیقه" value={timeLeft.minutes} />
      <TimeBox label="ثانیه" value={timeLeft.seconds} />
    </div>
  )
}

export default function PalCoffeeEventForm() {
  const [now, setNow] = useState(new Date())
  const eventLive = now >= EVENT_START_DATE && now < EVENT_END_DATE
  const signupClosed = now >= EVENT_START_DATE

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
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
    <main style={s.page} className="">
      <Header />
      <section className="pt-20">
        <Image
          src="/img/pal_cups.png"
          className="boxShadowMain animate-scaleIn"
          priority
          quality={80}
          width={"450"}
          style={{
            width: "100%",
            height: "auto",
          }}
          height="400"
          alt="pal_logo"
        />
        <div className="animate-fadeUp mt-8 mb-5 hidden w-full justify-center gap-2 px-2 text-xs delay-200 *:min-h-6 *:opacity-50 *:lg:text-base">
          <Badge
            variant="outline"
            className="gap-1.5 rounded-full px-3 py-1.5 font-vazir font-normal lg:py-3"
          >
            <MaterialSymbolsCalendarTodayOutline />
            جمعه ۱ خرداد
          </Badge>
          <Badge
            variant="outline"
            className="gap-1.5 rounded-full px-3 py-1.5 font-normal lg:py-3"
          >
            <MaterialSymbolsLightAlarmOutline />
            ۱۰:۰۰ تا ۱۴:۰۰
          </Badge>
          <Badge
            variant="outline"
            onClick={() =>
              window.open(
                "https://neshan.org/maps/places/e3e384c27293cbcd49bde3c6a622dfde#c32.849-59.227-20z-0p",
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="cursor-pointer gap-1.5 rounded-full px-3 py-1.5 font-normal lg:py-3"
          >
            <MaterialSymbolsLocationOnRounded />
            کافه نوفه
          </Badge>
        </div>
        {eventLive && (
          <div className="mx-auto mb-4 animate-[borderMove_8s_ease_infinite] rounded-xl bg-[linear-gradient(120deg,#9f3422,#cc8831,#73a89c,#9f3422)] bg-size-[250%_250%] p-0.5">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-(--crp-cream) px-4 py-3 text-center text-sm font-bold text-[var(--crp-dark)]">
              ایونت در حال برگزاریه!
            </div>
          </div>
        )}
        <div className="animate-fadeUp mx-auto mt-4 flex flex-col-reverse items-center justify-center gap-2 px-2 delay-300 sm:flex-row sm:gap-2">
          {signupClosed && eventLive ? (
            <div className="party" title=":party:">
              <a title=":party:">
                <ul>
                  <li></li>
                  <li></li>
                  <li></li>
                  <li></li>
                </ul>
              </a>
            </div>
          ) : (
            !eventLive && (
              <Link
                prefetch
                href="/gallery"
                className="mt-5 flex cursor-default flex-col items-center gap-2"
              >
                <Button variant="default" className="boxShadowMain text-base">
                  گالری
                  <LineMdCoffeeHalfEmptyTwotoneLoop />
                </Button>
              </Link>
            )
          )}

          {!signupClosed && <Countdown />}
        </div>
      </section>

      <h1 className="mt-10 w-full text-center font-eng text-3xl font-bold">
        After Taste
      </h1>
      {/* middle page */}
      <section className="animate-fadeIn mt-2 flex w-full flex-col">
        <article className="relative mx-auto mt-4 flex flex-col items-center justify-between gap-2">
          <Image
            src="/img/pal_people.png"
            quality={80}
            decoding="async"
            className="lg:w-[70%]"
            width="300"
            priority
            height="300"
            alt="pal_logo"
          />
          <p className="mx-auto w-full max-w-2xl rounded-t-[8px] border border-b-0 p-2 py-2 text-justify text-xs leading-6 tracking-normal xs:px-4 sm:border-none lg:text-base">
            این دورهمی یک بهونه‌ست برای باهم بودن، حرف زدن، چشیدن و تجربه کردن
            یه حس تازه.
            <br />
            برای اینکه بدونیم قهوه‌ای که توی فنجونمونه، از کجا اومده، چه مسیری
            رو طی کرده و چرا هرکدومش یه حس خاص داره.
          </p>
          <span className="absolute -bottom-px left-0 z-5 h-5 w-[3%] rounded-bl-[8px] border-b border-l sm:hidden"></span>
          <span className="absolute -bottom-px left-0 z-4 h-5 w-[3%] border-b border-l border-transparent! bg-[#fff9f0] sm:hidden"></span>
        </article>
        <article className="mx-auto mb-4 flex flex-row-reverse items-center justify-between lg:justify-center">
          <div className="relative h-60">
            <span className="absolute top-0 -right-px z-3 h-5 w-full rounded-tr-[8px] border-t border-r sm:hidden"></span>
            <span className="absolute -top-px -right-px z-2 size-4 border-t border-r border-transparent! bg-[#fff9f0] sm:hidden"></span>
            <Image
              src="/img/pal_lady.png"
              width="200"
              style={{
                height: "auto",
              }}
              className="mr-2 h-60! object-contain lg:h-80!"
              loading="lazy"
              height="200"
              alt="pal_logo"
            />
          </div>
          <p className="my-auto h-60 w-full rounded-b-[8px] border border-t-0 px-2 py-0 text-justify text-xs leading-6 tracking-normal xs:w-[calc(100%-200px)] xs:p-4 sm:h-60 sm:border-none sm:py-2 lg:w-1/4 lg:text-base">
            توی دنیایی که جنگ و تورم هر روز قیمت قهوه رو بالا می‌بره؛ ما ترجیح
            می‌دیم به‌جای کم کردن کیفیت و فراموشی فرهنگ قهوه، دست به دست هم بدیم
            تا با ساده درست کردن قهوه فرهنگ قهوه رو زنده نگه داریم
            <br />
          </p>
        </article>
        <div className="mx-auto my-6 flex w-full max-w-2xl items-center gap-3 lg:mt-20">
          <div className="h-px flex-1 bg-border" />
          <div className="h-1.5 w-1.5 rounded-full bg-accent opacity-60" />
          <div className="h-px flex-1 bg-border" />
        </div>
        <article className="relative mx-auto mt-10 max-w-md py-6 text-center">
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-5xl text-(--crp-sand)">
            “
          </span>
          <p className="w-50 text-base leading-8 italic xs:w-80 xs:text-lg">
            قهوه فقط یک نوشیدنی نیست؛ یک صنعت است، یک فرهنگ است، و برای بسیاری،
            تمام زندگی‌شان…
          </p>
          <div className="mx-auto mt-4 h-0.5 w-12 rounded-full bg-(--crp-terracotta)"></div>
        </article>
      </section>

      <h1 className="my-3 mt-10 font-bold">برنامه چیه؟!</h1>

      <section className="flex flex-col items-center gap-6 pb-30 md:flex-row">
        <article className="boxShadowMain boxShadowMainH relative flex flex-col overflow-hidden rounded-[8px] transition hover:scale-105">
          <Image
            src="/img/brew.jpeg"
            quality={70}
            loading="lazy"
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
            loading="lazy"
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
            loading="lazy"
            id="second-card"
            className="h-41.5! object-cover!"
            height="250"
            alt="pal_logo"
          />
          <p className="absolute right-3 bottom-3 flex items-center gap-1 rounded-[8px] border bg-primary px-2 py-1 text-xs text-white">
            قهوه اسپرسو
            <StreamlineUltimateCoffeeEspressoMachineBold />
          </p>
        </article>
      </section>
      <footer className="flex size-full flex-col justify-between gap-2 rounded-[8px] bg-[#280000] py-2 text-center text-xs text-[10px] text-[#fff9ef]">
        <span className="mb-auto">
          اردیبهشت ۱۴۰۵ — تمامی حقوق این رویداد محفوظ است ©
        </span>
        <span className="mx-auto flex flex-col items-center">
          Made With Suffer
          <span>Saeed && Jamshid</span>
          <GravityUiTerminalLine />
        </span>
        <span className="flex flex-col items-center justify-center gap-1">
          در صورت وجود مشکل در ثبت نام با این شماره تماس بگیرید
          <a href="tel:+989393258985">
            <Badge variant="destructive">09393258985</Badge>
          </a>
        </span>
      </footer>
    </main>
  )
}
