"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { api, ApiError } from "@/lib/api"
import { fetchPages } from "@/lib/shop"
import {
  displayValue,
  formPayload,
  type AdminRow,
  type Field,
  type Resource,
} from "@/lib/admin"

const EASY_PRODUCT_FIELDS = new Set([
  "name", "category", "price", "stock", "short_description", "origin", "roast_level", "tasting_notes", "is_active",
])
const PRODUCT_HELP: Record<string, string> = {
  name: "نامی که مشتری روی کارت قهوه می‌بیند؛ مانند Uganda Drugar / natural.",
  category: "دسته‌ای که محصول در آن نمایش داده می‌شود. دسته‌ها از بخش «دسته‌بندی محصولات» قابل مدیریت‌اند.",
  sku: "کد داخلی و یکتای محصول؛ در حالت ساده خودکار ساخته می‌شود.",
  slug: "بخش پایانی نشانی صفحه محصول؛ خودکار ساخته می‌شود. تغییر آن، لینک قبلی محصول را عوض می‌کند.",
  price: "مبلغ به ریال است: برای ۱۰۰٬۰۰۰ تومان، ۱٬۰۰۰٬۰۰۰ وارد کنید. قیمت فعلاً روی سایت نمایش داده نمی‌شود.",
  stock: "تعداد موجود؛ صفر یعنی موجودی ثبت نشده. این عدد مشخصات طعمی یا وزن محصول نیست.",
  short_description: "یک جمله کوتاه درباره قهوه؛ توضیح مفصل را در حالت پیشرفته وارد کنید.",
  origin: "کشور یا منطقه خاستگاه؛ مانند اوگاندا. اگر مشخص نیست، خالی بگذارید.",
  roast_level: "فقط اگر درجه رست معلوم است انتخاب کنید؛ در غیر این صورت «نامشخص» بماند.",
  tasting_notes: "طعم‌یادها را با «،» جدا کنید؛ مانند شکلات، کارامل، میوه‌های استوایی.",
  is_active: "خاموش کردن این گزینه، محصول را از فهرست عمومی سایت پنهان می‌کند؛ محصول حذف نمی‌شود.",
}

export default function AdminEditor({
  resource,
  record,
  onClose,
  onSaved,
}: {
  resource: Resource
  record: AdminRow | null
  onClose: () => void
  onSaved: () => void
}) {
  const product = resource.key === "products"
  const [advanced, setAdvanced] = useState(false)
  const [productDefaults] = useState<Record<string, unknown>>(() => {
    if (!product || record) return {}
    const id = crypto.randomUUID()
    return { slug: `coffee-${id}`, sku: `PAL-${id}`, price: 0, stock: 0 }
  })
  const [choices, setChoices] = useState<Record<string, AdminRow[]>>({})
  const [loading, setLoading] = useState(
    !!resource.fields?.some((f) => f.source)
  )
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const errorRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const returnFocus = useRef<HTMLElement | null>(
    typeof document !== "undefined"
      ? (document.activeElement as HTMLElement)
      : null
  )
  const readonly = !resource.fields && !resource.review
  const canReview =
    resource.review &&
    (resource.review === "event"
      ? record?.status === "pending"
      : record?.status === "pending_review")
  useEffect(() => {
    let alive = true
    const sources = [
      ...new Set(
        resource.fields?.map((f) => f.source).filter((s): s is string => !!s)
      ),
    ]
    // ponytail: native reference selects load all rows; use paginated search if catalogs grow large.
    Promise.all(
      sources.map(
        async (source) =>
          [
            source,
            await fetchPages<AdminRow>(`/manage/${source}/`, true),
          ] as const
      )
    )
      .then((entries) => {
        if (alive) {
          setChoices(Object.fromEntries(entries))
          setLoading(false)
        }
      })
      .catch(() => {
        if (alive) {
          setError(
            "گزینه‌های فرم بارگیری نشد. فرم را ببندید و دوباره باز کنید."
          )
          setLoading(false)
        }
      })
    return () => {
      alive = false
    }
  }, [resource])
  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])
  function close() {
    if (busy) return
    if (
      !dirty ||
      window.confirm("تغییرات ذخیره نشده است. بدون ذخیره خارج شوید؟")
    )
      onClose()
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy || loading) return
    const data = new FormData(e.currentTarget)
    setBusy(true)
    setError("")
    setErrors({})
    try {
      if (resource.review && record) {
        const decision = (e.nativeEvent as SubmitEvent).submitter?.getAttribute(
          "value"
        )
        if (decision !== "approve" && decision !== "reject")
          throw new Error("تصمیم را انتخاب کنید.")
        if (
          !window.confirm(
            `${decision === "approve" ? "تأیید" : "رد"} ${resource.singular} را ثبت می‌کنید؟`
          )
        )
          return
        const endpoint =
          resource.review === "event"
            ? `/events/registrations/${encodeURIComponent(String(record.registration_token))}/decision/`
            : `/payments/card/${record.id}/decision/`
        await api.post(
          endpoint,
          { decision, note: String(data.get("note") ?? "") },
          true
        )
      } else {
        const body = formPayload(resource, data)
        const endpoint = `/manage/${resource.key}/${record ? `${record.id}/` : ""}`
        const hasFiles = resource.fields?.some(
          (f) =>
            f.type === "file" &&
            data.get(f.key) instanceof File &&
            (data.get(f.key) as File).size > 0
        )
        if (hasFiles) {
          const multipart = new FormData()
          for (const [key, value] of Object.entries(body)) {
            if (Array.isArray(value))
              value.forEach((v) => multipart.append(key, String(v)))
            else if (value !== null) multipart.set(key, String(value))
          }
          for (const field of resource.fields ?? [])
            if (field.type === "file") {
              const file = data.get(field.key)
              if (file instanceof File && file.size) {
                if (
                  !["image/jpeg", "image/png", "image/webp"].includes(
                    file.type
                  ) ||
                  file.size > 5 * 1024 * 1024
                )
                  throw new Error(
                    "تصویر JPG، PNG یا WebP تا ۵ مگابایت انتخاب کنید."
                  )
                multipart.set(field.key, file)
              }
            }
          await api.upload(endpoint, multipart, record ? "PATCH" : "POST")
        } else if (record) await api.patch(endpoint, body)
        else await api.post(endpoint, body, true)
      }
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره انجام نشد.")
      if (e instanceof ApiError) {
        setErrors(e.fields)
        if (product && Object.keys(e.fields).some(key => !EASY_PRODUCT_FIELDS.has(key))) setAdvanced(true)
      }
    } finally {
      setBusy(false)
    }
  }
  async function receipt() {
    if (!record || busy) return
    setBusy(true)
    setError("")
    try {
      const endpoint =
        resource.review === "event"
          ? `/events/registrations/${encodeURIComponent(String(record.registration_token))}/receipt/`
          : `/payments/card/${record.id}/receipt/download/`
      const blob = await api.blob(endpoint)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `receipt-${record.id}`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setError("رسید دانلود نشد. دوباره تلاش کنید.")
    } finally {
      setBusy(false)
    }
  }
  function input(field: Field) {
    const id = `admin-field-${field.key}`
    const value = record?.[field.key] ?? productDefaults[field.key] ?? field.default ?? ""
    const hint = product ? PRODUCT_HELP[field.key] ?? field.hint : field.hint
    const common = {
      id,
      name: field.key,
      "aria-invalid": !!errors[field.key],
      "aria-describedby": errors[field.key]
        ? `${id}-error`
        : hint
          ? `${id}-hint`
          : undefined,
    }
    const locked =
      !!record &&
      ((resource.key === "slots" && field.key === "event") ||
        (resource.key === "bundles" && field.key === "bundle_product"))
    if (field.type === "checkbox")
      return (
        <label className="admin-checkbox" htmlFor={id}>
          <input {...common} type="checkbox" defaultChecked={Boolean(value)} />
          {field.label}
        </label>
      )
    if (field.type === "multi")
      return (
        <fieldset className="admin-multi">
          <legend>{field.label}</legend>
          <div>
            {field.options?.map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  name={field.key}
                  value={key}
                  defaultChecked={Array.isArray(value) && value.includes(key)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      )
    const options = field.source
      ? (choices[field.source] ?? []).map(
          (row) =>
            [
              String(row.id),
              String(row.name ?? row.title ?? row.label ?? row.id),
            ] as [string, string]
        )
      : field.options
    return (
      <>
        <label htmlFor={id}>
          {field.label}
          {field.required && <span className="admin-required"> *</span>}
        </label>
        {field.type === "textarea" ? (
          <textarea
            {...common}
            rows={field.key === "content" ? 8 : 3}
            defaultValue={String(value)}
            required={field.required}
          />
        ) : field.type === "select" ? (
          <>
            <select
              {...common}
              defaultValue={String(value || options?.[0]?.[0] || "")}
              required={field.required}
              disabled={locked}
            >
              {field.source && <option value="">انتخاب کنید</option>}
              {options?.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            {locked && (
              <input type="hidden" name={field.key} value={String(value)} />
            )}
          </>
        ) : field.type === "file" ? (
          <>
            <input
              {...common}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={field.required && !record}
            />
            {typeof value === "string" && value && (
              <Image
                src={value}
                alt="تصویر فعلی"
                width={100}
                height={80}
                unoptimized
                className="admin-image-preview"
              />
            )}
          </>
        ) : (
          <input
            {...common}
            type={field.type ?? "text"}
            defaultValue={String(value)}
            required={field.required}
            min={field.type === "number" ? (field.min ?? 0) : undefined}
            step={
              field.type === "time"
                ? 1
                : field.type === "number"
                  ? 1
                  : undefined
            }
            dir={
              ["slug", "sku", "card_number", "iban"].includes(field.key)
                ? "ltr"
                : undefined
            }
          />
        )}
      </>
    )
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent
        className="admin-dialog sm:max-w-[880px]"
        dir="rtl"
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          returnFocus.current?.focus()
        }}
        onEscapeKeyDown={(e) => {
          if (busy) e.preventDefault()
        }}
      >
        <div className="admin-editor-heading">
          <span className="admin-eyebrow">{resource.group}</span>
          <DialogTitle>
            {readonly || resource.review
              ? "جزئیات"
              : record
                ? "ویرایش"
                : "افزودن"}{" "}
            {resource.singular}
          </DialogTitle>
          <DialogDescription>{resource.description}</DialogDescription>
        </div>
        {error && (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="admin-alert"
          >
            <strong>خطا</strong>
            <p>{error}</p>
            {Object.entries(errors)
              .filter(([key]) => resource.fields?.some((f) => f.key === key))
              .map(([key, message]) => (
                <a key={key} href={`#admin-field-${key}`}>
                  {resource.fields?.find((f) => f.key === key)?.label}:{" "}
                  {message}
                </a>
              ))}
          </div>
        )}
        {record &&
          (readonly || resource.review || resource.key === "orders") && (
            <div className="admin-record-details">
              <dl>
                {resource.columns
                  .filter(([key]) => !["image", "cover_image"].includes(key))
                  .map(([key, label]) => (
                    <div key={key}>
                      <dt>{label}</dt>
                      <dd>{displayValue(key, record[key])}</dd>
                    </div>
                  ))}
                {!!record.phone_number && (
                  <div>
                    <dt>موبایل</dt>
                    <dd dir="ltr">{String(record.phone_number)}</dd>
                  </div>
                )}
              </dl>
              {!!record.address_snapshot && (
                <div className="admin-order-address">
                  <h3>آدرس ثبت‌شده سفارش</h3>
                  <p>
                    {Object.values(
                      record.address_snapshot as Record<string, unknown>
                    )
                      .map(String)
                      .join(" · ")}
                  </p>
                </div>
              )}
              {Array.isArray(record.items) && (
                <div className="admin-order-items">
                  <h3>اقلام سفارش</h3>
                  {record.items.map((item) => (
                    <p key={item.id}>
                      {item.product_name} × {item.quantity}{" "}
                      <span>{displayValue("line_total", item.line_total)}</span>
                    </p>
                  ))}
                </div>
              )}
              {!!record.admin_note && (
                <p className="admin-review-note">
                  یادداشت قبلی: {String(record.admin_note)}
                </p>
              )}
            </div>
          )}
        {resource.review &&
          record &&
          !!(record.has_receipt || record.receipt_url) && (
            <button
              className="admin-button secondary"
              disabled={busy}
              onClick={() => void receipt()}
            >
              دانلود رسید خصوصی
            </button>
          )}
        {loading ? (
          <p role="status">در حال دریافت گزینه‌ها…</p>
        ) : (
          (resource.fields || canReview) && (
            <form
              ref={formRef}
              onSubmit={submit}
              onChange={() => setDirty(true)}
              onInvalidCapture={event => {
                const field = event.target as HTMLInputElement
                if (product && field.closest("[hidden]")) {
                  event.preventDefault()
                  setAdvanced(true)
                  requestAnimationFrame(() => field.focus())
                }
              }}
            >
              {product && <div className="admin-product-guide">
                <div className="admin-mode-switch" role="group" aria-label="حالت فرم محصول">
                  <button type="button" aria-pressed={!advanced} disabled={busy} onClick={() => setAdvanced(false)}>حالت ساده</button>
                  <button type="button" aria-pressed={advanced} disabled={busy} onClick={() => setAdvanced(true)}>حالت پیشرفته</button>
                </div>
                <p>{advanced ? "همه مشخصات محصول در دسترس است. تغییر حالت، اطلاعات واردشده را پاک نمی‌کند." : record
                  ? "مشخصات اصلی را ویرایش کنید؛ تنظیمات دیگر بدون تغییر باقی می‌مانند."
                  : "برای شروع، نام و دسته را وارد کنید. شناسه‌ها خودکار ساخته می‌شوند؛ قیمت و موجودی از صفر شروع می‌کنند."}</p>
                <details>
                  <summary>راهنمای افزودن محصول</summary>
                  <ol>
                    <li>نام و دسته ضروری‌اند؛ جزئیات نامعلوم قهوه را خالی بگذارید.</li>
                    <li>مبالغ به ریال ذخیره می‌شوند، نه تومان. فروش آنلاین فعلاً غیرفعال است.</li>
                    <li>با گزینه «فعال / قابل نمایش» مشخص کنید محصول در سایت دیده شود یا نه.</li>
                    <li>پس از ذخیره، تصویر را از بخش «تصاویر محصولات» اضافه کنید. محصول بدون عکس با طرح بسته‌بندی پَل نمایش داده می‌شود.</li>
                    <li>برای توضیحات مفصل، تاریخ رست، تنظیمات آسیاب یا تغییر شناسه‌ها، حالت پیشرفته را باز کنید.</li>
                  </ol>
                </details>
              </div>}
              <fieldset
                disabled={
                  busy || (resource.key === "customers" && !!record?.is_staff)
                }
                className="admin-form-fields"
              >
                {resource.fields?.map((field) => (
                  <div
                    key={field.key}
                    hidden={product && !advanced && !EASY_PRODUCT_FIELDS.has(field.key)}
                    className={`admin-field ${["textarea", "multi"].includes(field.type ?? "") ? "wide" : ""}`}
                  >
                    {input(field)}
                    {(product ? PRODUCT_HELP[field.key] ?? field.hint : field.hint) && (
                      <p
                        id={`admin-field-${field.key}-hint`}
                        className="admin-field-hint"
                      >
                        {product ? PRODUCT_HELP[field.key] ?? field.hint : field.hint}
                      </p>
                    )}
                    {errors[field.key] && (
                      <p
                        id={`admin-field-${field.key}-error`}
                        className="admin-field-error"
                      >
                        {errors[field.key]}
                      </p>
                    )}
                  </div>
                ))}
                {canReview && (
                  <div className="admin-field wide">
                    <label htmlFor="admin-review-note">
                      یادداشت بررسی (اختیاری)
                    </label>
                    <textarea
                      id="admin-review-note"
                      name="note"
                      maxLength={2000}
                      rows={3}
                    />
                    <p className="admin-field-hint">
                      قبل از تأیید، مبلغ رسید و حساب مقصد را بررسی کنید.
                    </p>
                  </div>
                )}
              </fieldset>
              <div className="admin-editor-actions">
                <button
                  type="button"
                  className="admin-button secondary"
                  disabled={busy}
                  onClick={close}
                >
                  انصراف
                </button>
                {canReview ? (
                  <>
                    <button
                      name="decision"
                      value="reject"
                      className="admin-button danger"
                      disabled={busy}
                    >
                      {busy ? "در حال ثبت…" : "رد با یادداشت"}
                    </button>
                    <button
                      name="decision"
                      value="approve"
                      className="admin-button"
                      disabled={busy}
                    >
                      {busy ? "در حال ثبت…" : "تأیید"}
                    </button>
                  </>
                ) : (
                  resource.fields && (
                    <button
                      className="admin-button"
                      disabled={
                        busy ||
                        (resource.key === "customers" && !!record?.is_staff)
                      }
                    >
                      {busy ? "در حال ذخیره…" : "ذخیره تغییرات"}
                    </button>
                  )
                )}
              </div>
            </form>
          )
        )}
        {!resource.fields && !canReview && (
          <div className="admin-editor-actions">
            <button
              className="admin-button secondary"
              disabled={busy}
              onClick={close}
            >
              بستن جزئیات
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
