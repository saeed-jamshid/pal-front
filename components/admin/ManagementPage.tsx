"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
} from "lucide-react"
import AdminEditor from "./AdminEditor"
import { useAdmin } from "./AdminShell"
import { api, ApiError } from "@/lib/api"
import {
  displayValue,
  fetchAdminPage,
  type AdminPage,
  type AdminRow,
  type Resource,
} from "@/lib/admin"

export default function ManagementPage({ resource }: { resource: Resource }) {
  const { refresh } = useAdmin()
  const [result, setResult] = useState<AdminPage | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("")
  const [reload, setReload] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editor, setEditor] = useState<{ record: AdminRow | null } | null>(null)
  useEffect(() => {
    let alive = true
    const timer = setTimeout(
      async () => {
        setLoading(true)
        setError("")
        try {
          const query = new URLSearchParams({ page: String(page), search })
          if (filter && resource.filter) query.set(resource.filter.key, filter)
          const result = await fetchAdminPage(resource.key, query)
          if (alive) setResult(result)
        } catch (e) {
          if (alive) {
            setResult(null)
            setError(
              e instanceof ApiError && e.status === 403
                ? "دسترسی مدیریت ندارید."
                : e instanceof ApiError
                  ? e.message
                  : "اطلاعات بارگیری نشد. دوباره تلاش کنید."
            )
          }
        } finally {
          if (alive) setLoading(false)
        }
      },
      search ? 250 : 0
    )
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [resource, page, search, filter, reload])
  async function remove(row: AdminRow) {
    if (
      busy ||
      !window.confirm(
        `حذف ${resource.singular} «${String(row.name ?? row.title ?? row.label ?? row.id)}»؟ سوابق وابسته قابل حذف نیستند.`
      )
    )
      return
    setBusy(true)
    setError("")
    setSuccess("")
    try {
      await api.delete(`/manage/${resource.key}/${row.id}/`)
      setSuccess("رکورد حذف شد.")
      setPage(1)
      setReload((n) => n + 1)
      refresh()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "حذف انجام نشد.")
    } finally {
      setBusy(false)
    }
  }
  function saved() {
    setEditor(null)
    setSuccess("تغییرات ذخیره شد.")
    setReload((n) => n + 1)
    refresh()
  }
  return (
    <>
      <section className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">{resource.group}</span>
          <h1>{resource.title}</h1>
          <p>{resource.description}</p>
        </div>
        {resource.create && (
          <button
            className="admin-button"
            onClick={() => {
              setSuccess("")
              setEditor({ record: null })
            }}
          >
            <Plus size={18} aria-hidden="true" />
            افزودن {resource.singular}
          </button>
        )}
      </section>
      {success && (
        <p className="admin-success" role="status">
          {success}
        </p>
      )}
      {error && (
        <div className="admin-alert" role="alert">
          <p>{error}</p>
          <button
            className="admin-link"
            onClick={() => setReload((n) => n + 1)}
          >
            تلاش دوباره
          </button>
        </div>
      )}
      <section className="admin-panel">
        <div className="admin-toolbar">
          <label className="admin-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">جست‌وجو در {resource.title}</span>
            <input
              type="search"
              placeholder="جست‌وجوی نام، شناسه یا شماره…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </label>
          {resource.filter && (
            <label className="admin-filter">
              <span className="sr-only">فیلتر وضعیت</span>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">همه وضعیت‌ها</option>
                {resource.filter.options.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            className="admin-icon-button"
            aria-label="بازخوانی فهرست"
            disabled={loading}
            onClick={() => setReload((n) => n + 1)}
          >
            <RefreshCw size={18} aria-hidden="true" />
          </button>
          <span className="admin-result-count" aria-live="polite">
            {loading
              ? "در حال دریافت…"
              : `${result?.count.toLocaleString("fa-IR") ?? "۰"} رکورد`}
          </span>
        </div>
        {loading ? (
          <div className="admin-table-loading" role="status">
            <div />
            <div />
            <div />
            <span className="sr-only">در حال دریافت {resource.title}</span>
          </div>
        ) : !result?.results.length ? (
          <div className="admin-empty">
            <PackageOpen size={38} aria-hidden="true" />
            <h2>
              {error
                ? "داده در دسترس نیست"
                : search || filter
                  ? "نتیجه‌ای پیدا نشد"
                  : "هنوز رکوردی ندارید"}
            </h2>
            <p>
              {search || filter
                ? "جست‌وجو یا فیلتر را تغییر دهید."
                : resource.create
                  ? `اولین ${resource.singular} را اضافه کنید.`
                  : "هنوز موردی برای نمایش وجود ندارد."}
            </p>
          </div>
        ) : (
          <div
            className="admin-table-scroll"
            tabIndex={0}
            aria-label={`جدول ${resource.title}`}
          >
            <table className="admin-table">
              <thead>
                <tr>
                  {resource.columns.map(([key, title]) => (
                    <th key={key} scope="col">
                      {title}
                    </th>
                  ))}
                  <th scope="col">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {result.results.map((row) => (
                  <tr key={row.id}>
                    {resource.columns.map(([key]) => (
                      <td key={key}>
                        {key === "image" && typeof row[key] === "string" ? (
                          <Image
                            src={row[key]}
                            alt={String(
                              row.alt_text || row.product_name || "تصویر محصول"
                            )}
                            width={56}
                            height={48}
                            unoptimized
                            className="admin-table-image"
                          />
                        ) : [
                            "is_active",
                            "is_staff",
                            "status",
                            "payment_status",
                            "fulfillment_status",
                          ].includes(key) ? (
                          <span
                            className={`admin-status ${row[key] === false || ["failed", "rejected", "cancelled", "expired"].includes(String(row[key])) ? "muted" : ["paid", "approved", "confirmed", "delivered"].includes(String(row[key])) ? "good" : ""}`}
                          >
                            {key === "is_active"
                              ? row[key]
                                ? "فعال"
                                : "غیرفعال"
                              : displayValue(key, row[key])}
                          </span>
                        ) : (
                          <span
                            className={
                              [
                                "order_number",
                                "sku",
                                "phone_number",
                                "card_number",
                                "slug",
                              ].includes(key)
                                ? "admin-latin"
                                : ""
                            }
                          >
                            {displayValue(key, row[key])}
                          </span>
                        )}
                      </td>
                    ))}
                    <td>
                      <div className="admin-row-actions">
                        <button
                          className="admin-icon-button"
                          aria-label={`${resource.fields ? "ویرایش" : "جزئیات"} ${String(row.name ?? row.title ?? row.order_number ?? row.full_name ?? row.label ?? row.id)}`}
                          onClick={() => {
                            setSuccess("")
                            setEditor({ record: row })
                          }}
                        >
                          {resource.fields ? (
                            <Pencil size={16} aria-hidden="true" />
                          ) : (
                            <Eye size={17} aria-hidden="true" />
                          )}
                        </button>
                        {resource.remove && (
                          <button
                            className="admin-icon-button danger"
                            disabled={busy}
                            aria-label={`حذف ${String(row.name ?? row.title ?? row.label ?? row.id)}`}
                            onClick={() => void remove(row)}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <nav
          className="admin-pagination"
          aria-label={`صفحه‌بندی ${resource.title}`}
        >
          <span>
            صفحه {page.toLocaleString("fa-IR")} از{" "}
            {Math.max(1, Math.ceil((result?.count ?? 0) / 20)).toLocaleString(
              "fa-IR"
            )}
          </span>
          <div>
            <button
              className="admin-icon-button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((n) => n - 1)}
              aria-label="صفحه قبل"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
            <button
              className="admin-icon-button"
              disabled={!result?.next || loading}
              onClick={() => setPage((n) => n + 1)}
              aria-label="صفحه بعد"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
          </div>
        </nav>
      </section>
      {editor && (
        <AdminEditor
          resource={resource}
          record={editor.record}
          onClose={() => setEditor(null)}
          onSaved={saved}
        />
      )}
    </>
  )
}
