"use client"

import { useState, useRef  , useEffect} from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
// import "react-multi-date-picker/styles/colors/teal.css"
// import "react-multi-date-picker/styles/layouts/mobile.css"
import { Input } from "@/components/ui/input"

// ← شماره کارت واقعی رو اینجا جایگزین کنید
const CARD_NUMBER = "6037997462069395"

const s = {
  page: {
    minHeight: "100vh",
    background: "#fff9f0",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    fontFamily: "'Vazirmatn', 'Tahoma', sans-serif",
    color: "#280000",
    padding: "0 1rem 3rem",
    direction: "rtl" as const,
    textAlign: "right" as const,
  },
  topBar: {
    width: "100%",
    maxWidth: 480,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.25rem 0 0.5rem",
    borderBottom: "1px solid #e0cdaf",
    marginBottom: "2.5rem",
  },
  brand: {
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#280000",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#9f3422",
    display: "inline-block",
    flexShrink: 0,
  },
  aboutBtn: {
    background: "transparent",
    border: "1.5px solid #280000",
    color: "#280000",
    fontFamily: "'Vazirmatn', 'Tahoma', sans-serif",
    fontSize: "0.7rem",
    padding: "0.35rem 0.8rem",
    cursor: "pointer",
    borderRadius: 0,
  },
  logoWrap: { textAlign: "center" as const, marginBottom: "2rem" },
  logoText: {
    fontSize: "clamp(1.2rem,5vw,1.6rem)",
    fontWeight: 500,
    color: "#280000",
  },
  logoSub: { fontSize: "0.63rem", color: "#9f3422", marginTop: "0.3rem" },
  locationBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    marginTop: "0.55rem",
    border: "1px solid #e0cdaf",
    padding: "0.2rem 0.65rem",
    fontSize: "0.62rem",
    color: "#73a89c",
  },
  priceBadge: {
    display: "inline-flex",
    alignItems: "center",
    marginTop: "0.4rem",
    background: "#9f3422",
    padding: "0.25rem 0.8rem",
    fontSize: "0.65rem",
    color: "#fff9f0",
    fontWeight: 500,
  },
  dividerLine: {
    width: 32,
    height: 1,
    background: "#e0cdaf",
    margin: "0.9rem auto 0",
  },

  form: {
    width: "100%",
    maxWidth: 480,
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  sectionLabel: {
    fontSize: "0.58rem",
    color: "#cc8831",
    borderBottom: "1px solid #f6e4cb",
    paddingBottom: "0.35rem",
    marginBottom: "-0.5rem",
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.4rem",
  },
  label: { fontSize: "0.68rem", color: "#511e1d", fontWeight: 500 },
  input: {
    background: "transparent",
    border: "none",
    borderBottom: "1.5px solid #e0cdaf",
    borderRadius: 0,
    fontFamily: "'Vazirmatn', 'Tahoma', sans-serif",
    fontSize: "0.85rem",
    color: "#280000",
    padding: "0.5rem 0",
    outline: "none",
    width: "100%",
    direction: "rtl" as const,
    textAlign: "right" as const,
    transition: "border-color 0.18s",
  },
  datePickerWrapper: {
    position: "relative" as const,
  },
  toastContainer: {
    position: "fixed" as const,
    top: 16,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 60,
    width: "min(100%, 480px)",
    padding: "0 1rem",
    pointerEvents: "none" as const,
  },
  toastMessage: {
    background: "#280000",
    color: "#fff9f0",
    borderRadius: 0,
    padding: "0.9rem 1rem",
    boxShadow: "0 14px 32px rgba(40, 0, 0, 0.14)",
    fontSize: "0.85rem",
    textAlign: "center" as const,
    pointerEvents: "auto" as const,
  },
  calendarPopup: {
    position: "absolute" as const,
    top: "calc(100% + 0.5rem)",
    left: 0,
    zIndex: 30,
    minWidth: 280,
    maxWidth: "100%",
    border: "1.5px solid #e0cdaf",
    borderRadius: 0,
    background: "#fff9f0",
    boxShadow: "0 18px 45px rgba(40, 0, 0, 0.08)",
  },

  /* ── کارت پرداخت ── */
  payCard: {
    border: "1.5px solid #e0cdaf",
    padding: "1.1rem 1.2rem",
    background: "#fdf6ec",
  },
  payRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "0.9rem",
  },
  payAmount: {
    fontSize: "1.4rem",
    fontWeight: 500,
    color: "#9f3422",
    lineHeight: 1,
  },
  payAmountSub: { fontSize: "0.58rem", color: "#cc8831", marginTop: "0.2rem" },
  payCardLabel: {
    fontSize: "0.6rem",
    color: "#511e1d",
    marginBottom: "0.3rem",
  },
  payCardNumber: {
    fontFamily: "'Courier New', monospace",
    fontSize: "1.05rem",
    letterSpacing: "0.1em",
    color: "#280000",
    fontWeight: 600,
    direction: "ltr" as const,
    display: "block",
    marginBottom: "0.6rem",
  },
  copyBtn: {
    background: "transparent",
    border: "1px solid #e0cdaf",
    color: "#511e1d",
    fontFamily: "'Vazirmatn', 'Tahoma', sans-serif",
    fontSize: "0.62rem",
    padding: "0.25rem 0.7rem",
    cursor: "pointer",
    borderRadius: 0,
    transition: "all 0.15s",
  },
  payNote: {
    fontSize: "0.62rem",
    color: "#73a89c",
    marginTop: "0.75rem",
    lineHeight: 1.9,
    borderTop: "1px dashed #e0cdaf",
    paddingTop: "0.6rem",
  },

  /* ── آپلود ── */
  uploadZone: {
    border: "1.5px dashed #e0cdaf",
    padding: "1.4rem 1rem",
    textAlign: "center" as const,
    cursor: "pointer",
    transition: "border-color 0.18s, background 0.18s",
  },
  uploadZoneActive: { borderColor: "#73a89c", background: "#f0f7f6" },
  uploadText: { fontSize: "0.72rem", color: "#511e1d", lineHeight: 1.9 },
  uploadSub: { fontSize: "0.6rem", color: "#cc8831", marginTop: "0.2rem" },
  uploadPreview: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    padding: "0.55rem 0.8rem",
    border: "1px solid #73a89c",
    background: "#f0f7f6",
    marginTop: "0.5rem",
    fontSize: "0.7rem",
    color: "#280000",
  },
  removeBtn: {
    marginRight: "auto",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#9f3422",
    fontSize: "0.9rem",
    lineHeight: 1,
    padding: 0,
  },

  footerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "1.2rem",
    borderTop: "1px solid #e0cdaf",
  },
  hint: { fontSize: "0.62rem", color: "#cc8831" },
  submitBtn: {
    background: "#9f3422",
    border: "1.5px solid #9f3422",
    color: "#fff9f0",
    fontFamily: "'Vazirmatn', 'Tahoma', sans-serif",
    fontSize: "0.72rem",
    padding: "0.7rem 1.6rem",
    cursor: "pointer",
    transition: "background 0.18s",
    borderRadius: 0,
  },

  /* ── موفقیت ── */
  success: {
    textAlign: "center" as const,
    padding: "3rem 1rem",
    maxWidth: 480,
    width: "100%",
  },
  successEnter: {
    opacity: 0,
    transform: "translateY(16px) scale(0.98)",
    transition: "opacity 220ms ease, transform 220ms ease",
  },
  successActive: {
    opacity: 1,
    transform: "translateY(0) scale(1)",
    transition: "opacity 220ms ease, transform 220ms ease",
  },
  formEnter: {
    opacity: 0,
    transform: "translateY(16px) scale(0.98)",
    transition: "opacity 220ms ease, transform 220ms ease",
  },
  formActive: {
    opacity: 1,
    transform: "translateY(0) scale(1)",
    transition: "opacity 220ms ease, transform 220ms ease",
  },
  successIcon: { fontSize: "2rem", marginBottom: "1rem" },
  successTitle: {
    fontSize: "1.2rem",
    fontWeight: 500,
    color: "#280000",
    marginBottom: "0.8rem",
  },
  successCard: {
    border: "1px solid #e0cdaf",
    padding: "0.9rem 1.1rem",
    marginBottom: "1rem",
    textAlign: "right" as const,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.72rem",
    color: "#511e1d",
    lineHeight: 2.4,
    borderBottom: "1px dashed #f6e4cb",
  },
  rowLast: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.72rem",
    color: "#511e1d",
    lineHeight: 2.4,
  },
  rowKey: { color: "#9f3422", fontSize: "0.62rem", fontWeight: 500 },
  successNote: { fontSize: "0.7rem", color: "#511e1d", lineHeight: 2 },
  resetBtn: {
    marginTop: "1.4rem",
    background: "transparent",
    border: "1.5px solid #280000",
    color: "#280000",
    fontFamily: "'Vazirmatn', 'Tahoma', sans-serif",
    fontSize: "0.7rem",
    padding: "0.55rem 1.2rem",
    cursor: "pointer",
    borderRadius: 0,
  },

  /* ── دیالوگ ── */
  dlg: {
    background: "#fff9f0",
    border: "1.5px solid #e0cdaf",
    borderRadius: 0,
    maxWidth: 400,
    width: "calc(100vw - 2rem)",
    padding: "2rem 1.5rem",
    fontFamily: "'Vazirmatn', 'Tahoma', sans-serif",
    direction: "rtl" as const,
    textAlign: "right" as const,
  },
  dlgTitle: {
    fontSize: "1.05rem",
    fontWeight: 500,
    color: "#280000",
    textAlign: "right" as const,
    marginBottom: "0.3rem",
  },
  dlgSub: { fontSize: "0.62rem", color: "#9f3422", marginBottom: "1rem" },
  dlgBody: {
    fontSize: "0.78rem",
    lineHeight: 2.1,
    color: "#511e1d",
    marginBottom: "1rem",
  },
  dlgAccent: {
    borderRight: "2px solid #73a89c",
    paddingRight: "0.8rem",
    fontSize: "0.73rem",
    lineHeight: 2,
    color: "#280000",
    marginBottom: "1.2rem",
  },
  dlgGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" },
  dlgBox: {
    border: "1px solid #e0cdaf",
    padding: "0.6rem 0.75rem",
    fontSize: "0.65rem",
    lineHeight: 1.9,
    color: "#511e1d",
  },
  dlgBoxLabel: {
    color: "#9f3422",
    fontSize: "0.58rem",
    fontWeight: 500,
    display: "block" as const,
  },
}

export default function PalCoffeeEventForm() {
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [receipt, setReceipt] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ name: "", phone: "", birthdate: "" })
  const [isOpen, setIsOpen] = useState(false)
  const [toast, setToast] = useState("")
  const [successVisible, setSuccessVisible] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const datePickerRef = useRef<HTMLDivElement>(null)
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
  return (
    <div style={s.page}>
      {toast && (
        <div style={s.toastContainer}>
          <div style={s.toastMessage}>{toast}</div>
        </div>
      )}
      <div style={s.topBar}>
        <span style={s.brand}>
          <span style={s.brandDot} />
          Pal Coffee
        </span>
        <Dialog>
          <DialogTrigger asChild>
            <button style={s.aboutBtn}>درباره رویداد</button>
          </DialogTrigger>
          <DialogContent style={s.dlg}>
            <DialogHeader>
              <DialogTitle style={s.dlgTitle}>رویداد palCoffee</DialogTitle>
              <p style={s.dlgSub}>میزبان: کافه نوفه — بیرجند</p>
            </DialogHeader>
            <p style={s.dlgBody}>
              پال؛ جایی که دانه‌ها به احترام دوستی برشته می‌شوند.
            </p>
            <div style={s.dlgAccent}>
              «هر رویداد یک فرصت است برای اینکه داستان قهوه را با هم تجربه
              کنیم.»
            </div>
            <div style={s.dlgGrid}>
              <div style={s.dlgBox}>
                <span style={s.dlgBoxLabel}>مکان</span>کافه نوفه، بیرجند
              </div>
              <div style={s.dlgBox}>
                <span style={s.dlgBoxLabel}>برند</span>palCoffee
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* هدر صفحه */}
      {!submitted && (
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
      )}

      {/* ── صفحه موفقیت ── */}
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
        <form style={{ ...s.form, ...(formVisible ? s.formActive : s.formEnter) }} onSubmit={submit}>
          {/* اطلاعات شخصی */}
          <div style={s.sectionLabel}>اطلاعات شخصی</div>

          <div style={s.fieldWrap}>
            <label style={s.label} htmlFor="name">
              نام و نام خانوادگی *
            </label>
            <input
              id="name"
              name="name"
              required
              value={form.name}
              onChange={handle}
              placeholder="مثلاً: علی احمدی"
              style={s.input}
              onFocus={focus}
              onBlur={blur}
              
            />
          </div>

          <div style={s.fieldWrap}>
            <label style={s.label} htmlFor="phone">
              شماره همراه *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={form.phone}
              onChange={handle}
              placeholder="۰۹۱۲ ..."
              style={{ ...s.input, direction: "ltr", textAlign: "left" }}
              onFocus={focus}
              onBlur={blur}
            />
              <Input
          placeholder="تست"
          value={form.phone}
          
          className={`pr-10 rounded-lg border transition-colors`}
        />
          </div>

          <div style={{ ...s.fieldWrap, ...s.datePickerWrapper }} ref={datePickerRef}>
            <label style={s.label} htmlFor="birthdate">
              تاریخ تولد
            </label>

            <input
              id="birthdate"
              name="birthdate"
              value={form.birthdate}
              readOnly // Keeps the UI clean; users pick from the "Pal" calendar
              placeholder="۱۴۰۳/۰۱/۰۱"
              style={{ ...s.input, direction: "ltr", textAlign: "left" }}
              onFocus={() => setIsOpen(true)}
              onClick={() => setIsOpen(true)}
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
    </div>
  )
}
