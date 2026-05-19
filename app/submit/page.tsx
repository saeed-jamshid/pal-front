"use client"

import { useState, useRef, useEffect } from "react"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import Header from "@/components/layout/Header"
import dynamic from "next/dynamic"

const Calendar = dynamic(
  () =>
    import("react-multi-date-picker").then((mod) => ({
      default: mod.Calendar,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center rounded-xl bg-white px-4 py-4 shadow-lg">
        <svg
          className="animate-spin"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" stroke="#e0cdaf" strokeWidth="3" />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="#9f3422"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
  }
)

import gregorian from "react-date-object/calendars/gregorian"
import gregorian_en from "react-date-object/locales/gregorian_en"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner" // shadcn uses sonner for toasts
import { s } from "../styles/index"
import GameIconsCoffeePot from "@/app/icons/GameIconsCoffeePot"
import StreamlineUltimateCoffeeEspressoMachineBold from "@/app/icons/StreamlineUltimateCoffeeEspressoMachineBold"
import { useRouter } from "next/navigation"

const CARD_NUMBER = "6037997462069395"
const API_URL = "https://palcoffee.ir/api/register/"

type CoffeePref = "drip" | "espresso" | ""

export default function Submit() {
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [successVisible, setSuccessVisible] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [receipt, setReceipt] = useState<File | null>(null)
  const [form, setForm] = useState({
    name: "",
    phone: "",
    birthdate: "",
    birthdateDisplay: "",
  })
  const [coffeePref, setCoffeePref] = useState<CoffeePref>("")
  const [copied, setCopied] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const datePickerRef = useRef<HTMLDivElement>(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const router = useRouter()

  useEffect(() => {
    if (submitted) {
      const id = window.setTimeout(() => setSuccessVisible(true), 20)
      return () => window.clearTimeout(id)
    }
    const id = window.setTimeout(() => setFormVisible(true), 20)
    return () => window.clearTimeout(id)
  }, [submitted])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(e.target as Node)
      )
        setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setFieldErrors((p) => ({ ...p, [e.target.name]: undefined }))
  }

  const addFile = (file: File) => {
    if (file.size < 5 * 1024 * 1024) setReceipt(file)
    else toast.error("حجم فایل نمی‌تواند بیش از ۵ مگابایت باشد.")
  }

  const copyCard = () => {
    navigator.clipboard.writeText(CARD_NUMBER)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) {
      toast.error("لطفاً نام خود را وارد کنید.")
      return
    }
    if (!form.phone) {
      toast.error("لطفاً شماره همراه را وارد کنید.")
      return
    }
    if (!form.birthdate) {
      toast.error("لطفا تاریخ تولد خود را وارد کنید")
      return
    }
    if (!coffeePref) {
      toast.error("لطفاً ترجیح قهوه خود را انتخاب کنید.")
      return
    }
    if (!receipt) {
      toast.error("لطفاً رسید پرداخت را آپلود کنید.")
      return
    }

    try {
      setLoading(true)
      const body = new FormData()
      body.append("full_name", form.name)
      body.append("phone_number", form.phone)
      body.append("birth_date", form.birthdate)
      body.append("coffee_preference", coffeePref)
      body.append("payment_receipt", receipt)

      const res = await fetch(API_URL, { method: "POST", body })
      const err = await res.json().catch(() => ({}))
      if (!err?.success) {
        toast.error(err.message ?? "خطایی رخ داد. لطفاً دوباره تلاش کنید.")
        setFieldErrors(err.errors)
        return
      }
      setSubmitted(true)
      setSuccessVisible(false)
    } catch {
      toast.error("اتصال برقرار نشد. لطفاً اینترنت خود را بررسی کنید.")
    } finally {
      setLoading(false)
    }
  }

  function generateICS() {
    const start = new Date("2026-05-22T10:00:00")
    const end = new Date("2026-05-22T14:00:00")

    const formatDate = (date: Date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Pal Coffee//EN",
      "BEGIN:VEVENT",
      "SUMMARY:After Taste - Pal Coffee Event",
      "DESCRIPTION:رویداد قهوه پَل ☕",
      "LOCATION:32.84950182154514\,59.226566755939080",
      "DESCRIPTION:رویداد قهوه پَل ☕\\nمسیریابی: https://neshan.org/maps/places/e3e384c27293cbcd49bde3c6a622dfde#c32.849-59.227-20z-0p",
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      "DESCRIPTION:یادآوری: رویداد قهوه پَل فرداست ☕",
      "END:VALARM",
      "BEGIN:VALARM",
      "TRIGGER:-PT30M",
      "ACTION:DISPLAY",
      "DESCRIPTION:۳۰ دقیقه تا شروع رویداد ☕",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n")

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "pal-coffee-event.ics"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  const reset = () => {
    setFormVisible(false)
    setSubmitted(false)
    setReceipt(null)
    setCoffeePref("")
    setForm({ name: "", phone: "", birthdate: "", birthdateDisplay: "" })
    router.push("/submit")
  }

  // ── Success screen ───────────────────────────────────────────────────────
  if (submitted)
    return (
      <div
        style={s.page}
        className="lg:m-auto! lg:grid! lg:grid-cols-2 lg:place-content-center lg:gap-x-4 lg:gap-y-2"
      >
        <Header back />
        <div
          className={`w-full max-w-md px-5 pt-20 text-center transition-all duration-300 lg:col-start-1 lg:row-span-1 lg:mt-auto ${successVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
        >
          <div className="mb-3 text-4xl">☕</div>
          <p className="mb-4 text-lg font-bold text-[#280000]">
            ثبت‌نام تکمیل شد!
          </p>

          <Card className="mb-4 hidden rounded-xl border-[#e0cdaf] text-right">
            <CardContent className="space-y-0 p-4">
              {[
                { label: "نام و نام خانوادگی", value: form.name },
                { label: "شماره همراه", value: form.phone, ltr: true },
                ...(form.birthdate
                  ? [
                      {
                        label: "تاریخ تولد",
                        value: form.birthdateDisplay,
                        ltr: true,
                      },
                    ]
                  : []),
                {
                  label: "ترجیح قهوه",
                  value: coffeePref == "drip" ? "دمی" : "اسپرسو",
                  teal: true,
                },
                { label: "رسید پرداخت", value: "آپلود شد", teal: true },
              ].map((row, i, arr) => (
                <div
                  key={i}
                  className={`flex flex-row-reverse items-center justify-between py-2 text-sm ${i < arr.length - 1 ? "border-b border-[#e0cdaf]" : ""}`}
                >
                  <span
                    className={row.ltr ? "direction-ltr inline-block" : ""}
                    style={row.teal ? { color: "#73a89c" } : {}}
                  >
                    {row.value}
                  </span>
                  <span className="text-xs text-[#c8b89a]">{row.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="rounded-xl border-[#e0cdaf] text-[#511e1d]"
            onClick={reset}
          >
            ثبت‌نام جدید
          </Button>
        </div>
        <Button
          onClick={generateICS}
          className="mt-2 rounded-xl bg-(--crp-sage) text-white hover:opacity-90 lg:col-start-1 lg:row-start-2 lg:mb-auto lg:place-self-center"
        >
          افزودن به تقویم 📅
        </Button>
        <div className="mt-8 ml-auto flex w-full flex-col items-center justify-center border-t py-2 text-center lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-auto lg:border-none">
          <p className="mb-5 text-xs leading-7 font-bold text-[#511e1d]">
            پس از بررسی رسید تاییدیه ثبتنام از طریق پیامک ارسال میشه
            <br />۱ خرداد ماه از ساعت ۱۰ الی ۱۴ منتظرتونیم!
          </p>

          <Badge variant="default">محل برگزاری کافه نوفه</Badge>
        </div>
        <iframe
          title="map-iframe"
          src="https://neshan.org/maps/iframe/places/_boQ5ZpJ77NN#c32.850-59.227-22z-0p/32.8495323970823/59.22647602662667"
          height="250"
          loading="lazy"
          className="my-4 w-full! rounded-2xl p-1 outline-2 lg:col-span-2 lg:col-start-1 lg:row-start-3"
        ></iframe>
      </div>
    )

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <Header back />
      <form
        onSubmit={submit}
        className={`flex w-full flex-col gap-2 space-y-3 px-5 pt-20 transition-all duration-300 lg:m-auto lg:grid lg:grid-cols-2 lg:gap-x-4 ${formVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
      >
        {/* ── Name ── */}
        <div className="col-start-1 space-y-1">
          <Input
            id="name"
            name="name"
            required
            value={form.name}
            onChange={handle}
            placeholder="نام و نام خانوادگی"
            className="boxShadowMainH boxShadowMain rounded-[8px] border bg-white transition focus:scale-110"
          />
          {fieldErrors?.full_name && (
            <p
              id="phone-error"
              role="alert"
              className="mt-3 text-[11px] text-[#9f3422]"
            >
              {fieldErrors?.full_name[0]}
            </p>
          )}
        </div>

        {/* ── Phone ── */}
        <div className="col-start-1 space-y-1">
          <Input
            id="phone"
            name="phone"
            type="tel"
            dir="ltr"
            required
            value={form.phone}
            onChange={handle}
            placeholder="شماره همراه"
            className="boxShadowMainH boxShadowMain rounded-[8px] border bg-white transition placeholder:text-right focus:scale-110"
          />
          {fieldErrors?.phone_number && (
            <p
              id="phone-error"
              role="alert"
              className="mt-3 text-[11px] text-[#9f3422]"
            >
              {fieldErrors?.phone_number[0]}
            </p>
          )}
        </div>

        {/* ── Birthdate ── */}
        <div className="col-start-1 space-y-1" ref={datePickerRef}>
          <div className="relative">
            <Input
              id="birthdate"
              name="birthdate"
              readOnly
              value={form.birthdateDisplay}
              placeholder="تاریخ تولد"
              style={{ direction: "ltr", textAlign: "left" }}
              className="boxShadowMainH boxShadowMain rounded-[8px] border bg-white transition placeholder:text-right focus:scale-110"
              onFocus={() => setIsOpen(true)}
              onClick={() => setIsOpen(true)}
            />
            {isOpen && (
              <div className="absolute top-[calc(100%+6px)] right-0 z-50 min-h-20 overflow-hidden rounded-xl shadow-lg">
                <Calendar
                  calendar={persian}
                  locale={persian_fa}
                  className="rmdp-wrapper custom-input custom-calendar"
                  value={form.birthdateDisplay}
                  onChange={(date) => {
                    if (!date) return

                    const test = date.convert("gregorian").format("YYYY-MM-DD")
                    console.log(form.birthdate)
                    const gregorianDate = date
                      .convert(gregorian, gregorian_en)
                      .format("YYYY-MM-DD")

                    setForm((p) => ({
                      ...p,
                      birthdate: gregorianDate,
                      birthdateDisplay: test,
                    }))
                    setIsOpen(false)
                  }}
                />
              </div>
            )}
            {fieldErrors?.birth_date && (
              <p
                id="phone-error"
                role="alert"
                className="mt-3 text-[11px] text-[#9f3422]"
              >
                {fieldErrors?.birth_date[0]}
              </p>
            )}
          </div>
        </div>

        {/* ── Coffee preference ── */}
        <div className="col-start-1 mt-2 space-y-2">
          <Label className="text-xs text-[#511e1d]">کدوم رو ترجیح میدی؟</Label>
          <div className="grid grid-cols-2 gap-3">
            {(["drip", "espresso"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setCoffeePref(opt)}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl border py-3 text-sm transition-all ${
                  coffeePref === opt
                    ? "border-[#9f3422] text-[#511e1d]"
                    : "border-[#e0cdaf] text-[#511e1d] hover:border-[#9f3422]/50"
                }`}
              >
                {opt === "drip" ? (
                  <GameIconsCoffeePot fontSize={30} />
                ) : (
                  <StreamlineUltimateCoffeeEspressoMachineBold fontSize={30} />
                )}
                <span className="text-xs font-medium">
                  {opt === "drip" ? "قهوه دمی" : "اسپرسو"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Separator className="my-1 bg-[#e0cdaf] lg:hidden" />

        {/* ── Payment card ── */}
        <div className="col-start-2 row-span-4 row-start-1 space-y-2 font-bold">
          <Label className="text-xs text-[#511e1d] lg:hidden">
            پرداخت هزینه رویداد
          </Label>
          <Card className="h-full overflow-hidden rounded-xl border-0 bg-[#280000]">
            <CardContent className="p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-xl font-bold text-[#fff9f0]">۲۰۰،۰۰۰</p>
                  <p className="text-[11px] text-[#e0cdaf]">
                    تومان — هزینه شرکت در رویداد
                  </p>
                </div>
              </div>
              <p className="mb-1 text-[11px] text-[#e0cdaf]">
                شماره کارت جهت واریز:
              </p>
              <p
                className="ltr mb-3 font-mono text-sm tracking-widest text-[#fff9f0]"
                dir="ltr"
              >
                {CARD_NUMBER.replace(/(.{4})/g, "$1 ").trim()}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyCard}
                className="h-7 rounded-lg border-[#e0cdaf]/50 bg-transparent text-xs text-[#e0cdaf] hover:bg-[#fff9f0]/10 hover:text-[#fff9f0]"
              >
                {copied ? "✓ کپی شد" : "کپی شماره کارت"}
              </Button>
              <p className="mt-3 text-[11px] leading-6 text-[#c8b89a]">
                لطفاً پس از واریز، رسید پرداخت را در قسمت زیر آپلود کنید.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Upload receipt ── */}
        <div className="col-span-2 col-start-1 space-y-2">
          <Label className="text-xs text-[#511e1d] lg:hidden">
            آپلود رسید پرداخت{" "}
          </Label>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              const f = e.dataTransfer.files[0]
              if (f) addFile(f)
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed py-6 transition-colors ${
              dragOver
                ? "border-[#73a89c] bg-[#E1F5EE]"
                : "border-[#c8b89a] bg-white hover:border-[#9f3422]/40"
            }`}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke={dragOver ? "#73a89c" : "#c8b89a"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <p className="text-sm text-[#511e1d]">
              {dragOver ? "رها کنید…" : "کلیک کنید یا فایل را اینجا بکشید"}
            </p>
            <p className="text-[11px] text-[#c8b89a]">PNG , JPG , JPEG</p>
            <input
              ref={fileRef}
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) addFile(f)
              }}
            />
          </div>

          {receipt && (
            <div className="flex items-center gap-2 rounded-xl border border-[#e0cdaf] bg-white px-3 py-2 text-xs text-[#511e1d]">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#73a89c"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="flex-1 truncate">{receipt.name}</span>
              <span className="text-[10px] text-[#73a89c]">✓</span>
              <button
                type="button"
                onClick={() => setReceipt(null)}
                className="ml-1 text-base leading-none text-[#c8b89a] transition-colors hover:text-[#9f3422]"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* ── Submit ── */}
        <div className="col-span-2 flex items-center justify-center pt-1">
          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#9f3422] text-[#fff9f0] transition-colors hover:bg-[#511e1d]"
          >
            {loading ? "در حال ارسال…" : " تکمیل ثبت‌نام"}
          </Button>
        </div>
      </form>
    </div>
  )
}
