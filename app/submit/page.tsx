"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar } from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
// import "react-multi-date-picker/styles/colors/teal.css"
// import "react-multi-date-picker/styles/layouts/mobile.css"
import { Input } from "@/components/ui/input"
import { s } from "../styles/index"

const CARD_NUMBER = "6037997462069395"

const Submit = () => {
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [successVisible, setSuccessVisible] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [receipt, setReceipt] = useState<File | null>(null)
  const [form, setForm] = useState({ name: "", phone: "", birthdate: "" })
  const [copied, setCopied] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const datePickerRef = useRef<HTMLDivElement>(null)

  const [toast, setToast] = useState("")

  useEffect(() => {
    if (!toast) return

    const id = window.setTimeout(() => setToast(""), 3200)
    return () => window.clearTimeout(id)
  }, [toast])

  useEffect(() => {
    if (submitted) {
      const id = window.setTimeout(() => setSuccessVisible(true), 20)
      return () => window.clearTimeout(id)
    }
    const id = window.setTimeout(() => setFormVisible(true), 20)
    return () => window.clearTimeout(id)
  }, [submitted])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])
  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const addFile = (file: File) => {
    if (file.size < 5 * 1024 * 1024) {
      setReceipt(file)
    } else {
      setToast("حجم فایل نمی‌تواند بیش از ۵ مگابایت باشد.")
    }
  }

  const copyCard = () => {
    navigator.clipboard.writeText(CARD_NUMBER.replace(/\s/g, ""))
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const focus = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderBottomColor = "#9f3422")
  const blur = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderBottomColor = "#e0cdaf")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.phone || !receipt) {
      if (!form.name && !form.phone && !receipt) {
        setToast("لطفاً نام، شماره همراه و رسید پرداخت را وارد کنید.")
      } else if (!form.name) {
        setToast("لطفاً نام خود را وارد کنید.")
      } else if (!form.phone) {
        setToast("لطفاً شماره همراه را وارد کنید.")
      } else if (!receipt) {
        setToast("لطفاً رسید پرداخت را آپلود کنید.")
      }
      return
    }

    setSubmitted(true)
    setSuccessVisible(false)
  }

  const reset = () => {
    setFormVisible(false)
    setSubmitted(false)
    setReceipt(null)
    setForm({ name: "", phone: "", birthdate: "" })
  }

  return (
    <>
      !submitted && (
      {toast && (
        <div style={s.toastContainer}>
          <div style={s.toastMessage}>{toast}</div>
        </div>
      )}
      <div style={s.logoWrap}>
        <svg
          width="32"
          height="40"
          viewBox="0 0 36 44"
          fill="none"
          style={{ marginBottom: "0.5rem" }}
        >
          <ellipse
            cx="18"
            cy="10"
            rx="14"
            ry="5"
            stroke="#280000"
            strokeWidth="1.4"
            fill="none"
          />
          <path
            d="M10 12 Q18 22 18 34"
            stroke="#280000"
            strokeWidth="1.4"
            fill="none"
          />
          <circle cx="18" cy="38" r="2.5" fill="#9f3422" />
          <path
            d="M20 8 Q24 4 28 6"
            stroke="#511e1d"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <div style={s.logoText}>ثبت‌نام رویداد</div>
        <div style={s.logoSub}>palCoffee — Coffee Roastery Pal</div>
        <div style={s.locationBadge}>
          <svg width="9" height="11" viewBox="0 0 9 11" fill="none">
            <path
              d="M4.5 0C2.57 0 1 1.57 1 3.5c0 2.63 3.5 7 3.5 7S8 6.13 8 3.5C8 1.57 6.43 0 4.5 0zm0 4.75a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"
              fill="#73a89c"
            />
          </svg>
          بیرجند-کافه نوفه
        </div>
        <div style={s.priceBadge}>۲۰۰،۰۰۰ تومان</div>
        <div style={s.dividerLine} />
      </div>
      )
      {submitted ? (
        <div
          style={{
            ...s.success,
            ...(successVisible ? s.successActive : s.successEnter),
          }}
        >
          <div style={s.successIcon}>☕</div>
          <div style={s.successTitle}>ثبت‌نام تکمیل شد!</div>
          <div style={s.successCard}>
            <div style={s.row}>
              <span>{form.name}</span>
              <span style={s.rowKey}>نام و نام خانوادگی</span>
            </div>
            <div style={s.row}>
              <span style={{ direction: "ltr", display: "inline-block" }}>
                {form.phone}
              </span>
              <span style={s.rowKey}>شماره همراه</span>
            </div>
            {form.birthdate && (
              <div style={s.row}>
                <span style={{ direction: "ltr", display: "inline-block" }}>
                  {form.birthdate}
                </span>
                <span style={s.rowKey}>تاریخ تولد</span>
              </div>
            )}
            <div style={s.rowLast}>
              <span style={{ color: "#73a89c" }}>✓ آپلود شد</span>
              <span style={s.rowKey}>رسید پرداخت</span>
            </div>
          </div>
          <p style={s.successNote}>
            پس از بررسی رسید، تأییدیه ثبت‌نام
            <br />
            از طریق پیامک ارسال می‌شود.
          </p>
          <button style={s.resetBtn} onClick={reset}>
            ثبت‌نام جدید
          </button>
        </div>
      ) : (
        /* ── فرم ── */
        <form
          style={{ ...s.form, ...(formVisible ? s.formActive : s.formEnter) }}
          onSubmit={submit}
        >
          <div style={s.fieldWrap}>
            <Input
              id="name"
              name="name"
              required
              value={form.name}
              onChange={handle}
              placeholder="نام و نام خانوادگی"
              style={s.input}
              onFocus={focus}
              onBlur={blur}
              className="rounded-2xl"
              aria-label="نام و نام خانوادگی"
            />
          </div>

          <div style={s.fieldWrap}>
            <Input
              id="phone"
              name="phone"
              type="tel"
              dir="ltr"
              required
              value={form.phone}
              onChange={handle}
              className="text-left placeholder:text-right"
              placeholder="شماره همراه"
              style={{ ...s.input }}
              onFocus={focus}
              onBlur={blur}
            />
          </div>

          <div
            style={{ ...s.fieldWrap, ...s.datePickerWrapper }}
            ref={datePickerRef}
          >
            <Input
              id="birthdate"
              name="birthdate"
              value={form.birthdate}
              readOnly
              placeholder="۱۴۰۳/۰۱/۰۱"
              style={{ ...s.input, direction: "ltr", textAlign: "left" }}
              onFocus={() => setIsOpen(true)}
              onClick={() => setIsOpen(true)}
              aria-label="تاریخ تولد"
            />
            {isOpen && (
              <div style={s.calendarPopup}>
                <Calendar
                  calendar={persian}
                  locale={persian_fa}
                  className="crp-calendar"
                  value={form.birthdate}
                  onChange={(date) => {
                    setForm((prev) => ({
                      ...prev,
                      birthdate: date?.format?.("YYYY/MM/DD") || "",
                    }))
                    setIsOpen(false)
                  }}
                />
              </div>
            )}
          </div>

          {/* پرداخت */}
          <div style={s.sectionLabel}>پرداخت هزینه رویداد</div>

          <div style={s.payCard}>
            <div style={s.payRow}>
              <div>
                <div style={s.payAmount}>۲۰۰،۰۰۰</div>
                <div style={s.payAmountSub}>تومان — هزینه شرکت در رویداد</div>
              </div>
              <svg width="26" height="26" viewBox="0 0 36 44" fill="none">
                <ellipse
                  cx="18"
                  cy="10"
                  rx="14"
                  ry="5"
                  stroke="#e0cdaf"
                  strokeWidth="1.2"
                  fill="none"
                />
                <path
                  d="M10 12 Q18 22 18 34"
                  stroke="#e0cdaf"
                  strokeWidth="1.2"
                  fill="none"
                />
                <circle cx="18" cy="38" r="2.5" fill="#e0cdaf" />
              </svg>
            </div>

            <div style={s.payCardLabel}>شماره کارت جهت واریز:</div>
            <span style={s.payCardNumber}>{CARD_NUMBER}</span>
            <button
              type="button"
              style={s.copyBtn}
              onClick={copyCard}
              onMouseEnter={(e) => {
                ;(e.target as HTMLButtonElement).style.background = "#280000"
                ;(e.target as HTMLButtonElement).style.color = "#fff9f0"
              }}
              onMouseLeave={(e) => {
                ;(e.target as HTMLButtonElement).style.background =
                  "transparent"
                ;(e.target as HTMLButtonElement).style.color = "#511e1d"
              }}
            >
              {copied ? "✓ کپی شد" : "کپی شماره کارت"}
            </button>
            <div style={s.payNote}>
              لطفاً پس از واریز، رسید پرداخت را در قسمت زیر آپلود کنید.
            </div>
          </div>

          {/* آپلود رسید */}
          <div style={s.sectionLabel}>آپلود رسید پرداخت *</div>

          <div style={s.fieldWrap}>
            <div
              style={{
                ...s.uploadZone,
                ...(dragOver ? s.uploadZoneActive : {}),
              }}
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
            >
              <div style={{ marginBottom: "0.5rem" }}>
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
              </div>
              <div style={s.uploadText}>
                {dragOver ? "رها کنید…" : "کلیک کنید یا فایل را اینجا بکشید"}
              </div>
              <div style={s.uploadSub}>PNG، JPG یا PDF — حداکثر ۵ مگابایت</div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) addFile(f)
                }}
              />
            </div>

            {receipt && (
              <div style={s.uploadPreview}>
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
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  {receipt.name}
                </span>
                <span style={{ fontSize: "0.6rem", color: "#73a89c" }}>✓</span>
                <button
                  type="button"
                  style={s.removeBtn}
                  onClick={() => setReceipt(null)}
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* ارسال */}
          <div style={s.footerRow}>
            <button
              type="submit"
              style={s.submitBtn}
              onMouseEnter={(e) =>
                ((e.target as HTMLButtonElement).style.background = "#511e1d")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLButtonElement).style.background = "#9f3422")
              }
            >
              ← تکمیل ثبت‌نام
            </button>
            <span style={s.hint}>* ضروری</span>
          </div>
        </form>
      )}
    </>
  )
}

export default Submit
