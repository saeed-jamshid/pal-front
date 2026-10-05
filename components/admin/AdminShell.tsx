"use client"

import { createContext, useContext, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Coffee,
  LayoutDashboard,
  Package,
  ShoppingBag,
  CalendarDays,
  FileText,
  Users,
  ArrowUpRight,
  LogOut,
  Menu,
  RefreshCw,
  Moon,
  Sun,
} from "lucide-react"
import { ApiError, clearTokens } from "@/lib/api"
import { fetchOverview, resources, type Overview } from "@/lib/admin"

const AdminContext = createContext<{
  overview: Overview
  refresh: () => void
} | null>(null)
export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) throw new Error("Admin context required")
  return context
}
const icons = {
  فروشگاه: Package,
  عملیات: ShoppingBag,
  رویدادها: CalendarDays,
  محتوا: FileText,
  حساب‌ها: Users,
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [overview, setOverview] = useState<Overview | null>(null)
  const [error, setError] = useState("")
  const [reload, setReload] = useState(0)
  const [menu, setMenu] = useState(false)
  useEffect(() => {
    let alive = true
    fetchOverview()
      .then((data) => {
        if (alive) {
          setOverview(data)
          setError("")
        }
      })
      .catch((e) => {
        if (!alive) return
        if (e instanceof ApiError && e.status === 401) {
          setOverview(null)
          router.replace(`/login?next=${encodeURIComponent(pathname)}`)
        } else {
          setOverview(null)
          setError(
            e instanceof ApiError && e.status === 403
              ? "این بخش فقط برای کارکنان مجاز است."
              : "ارتباط با پنل برقرار نشد. دوباره تلاش کنید."
          )
        }
      })
    return () => {
      alive = false
    }
  }, [reload, router, pathname])
  const current = resources.find((r) => pathname === `/admin/${r.key}`)
  const nav = (
    <>
      <Link
        href="/admin"
        className={`admin-nav-link ${pathname === "/admin" ? "is-current" : ""}`}
        aria-current={pathname === "/admin" ? "page" : undefined}
        onClick={() => setMenu(false)}
      >
        <LayoutDashboard size={18} aria-hidden="true" />
        نمای کلی
      </Link>
      {Object.entries(icons).map(([group, Icon]) => (
        <div key={group} className="admin-nav-group">
          <p className="admin-nav-heading">
            <Icon size={14} aria-hidden="true" />
            {group}
          </p>
          {resources
            .filter((r) => r.group === group)
            .map((r) => (
              <Link
                key={r.key}
                href={`/admin/${r.key}`}
                className={`admin-nav-link ${current?.key === r.key ? "is-current" : ""}`}
                aria-current={current?.key === r.key ? "page" : undefined}
                onClick={() => setMenu(false)}
              >
                {r.title}
              </Link>
            ))}
        </div>
      ))}
    </>
  )
  if (!overview)
    return (
      <div className="admin-access">
        <div className="admin-access-card">
          <Coffee size={32} aria-hidden="true" />
          <h1>مدیریت پَل</h1>
          {error ? (
            <>
              <p role="alert">{error}</p>
              <button
                className="admin-button"
                onClick={() => setReload((n) => n + 1)}
              >
                تلاش دوباره
              </button>
              <Link href="/" className="admin-link">
                بازگشت به سایت
              </Link>
            </>
          ) : (
            <p role="status">در حال بررسی دسترسی…</p>
          )}
        </div>
      </div>
    )
  return (
    <AdminContext.Provider
      value={{ overview, refresh: () => setReload((n) => n + 1) }}
    >
      <div className="admin-app" dir="rtl">
        <a className="admin-skip" href="#admin-content">
          رفتن به محتوا
        </a>
        <aside className="admin-sidebar">
          <Link href="/admin" className="admin-brand">
            <span className="admin-brand-mark">
              <Coffee size={22} aria-hidden="true" />
            </span>
            <span>
              <strong>پَل</strong>
              <small>مرکز مدیریت</small>
            </span>
          </Link>
          <nav aria-label="مدیریت پَل">{nav}</nav>
          <div className="admin-sidebar-footer">
            <span className="admin-live-dot" />
            پنل مدیریت پَل
          </div>
        </aside>
        <div className="admin-workspace">
          <header className="admin-topbar">
            <div className="admin-topbar-title">
              <button
                className="admin-icon-button admin-menu-button"
                aria-label={menu ? "بستن منوی مدیریت" : "باز کردن منوی مدیریت"}
                aria-expanded={menu}
                aria-controls="admin-mobile-nav"
                onClick={() => setMenu((v) => !v)}
              >
                <Menu size={20} aria-hidden="true" />
              </button>
              <span>
                مدیریت پَل <span aria-hidden="true">/</span>{" "}
                <strong>{current?.title ?? "نمای کلی"}</strong>
              </span>
            </div>
            <div className="admin-topbar-actions">
              <Link href="/" className="admin-site-link">
                مشاهده سایت
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <button
                className="admin-icon-button"
                aria-label={
                  resolvedTheme === "dark"
                    ? "فعال کردن حالت روشن"
                    : "فعال کردن حالت تیره"
                }
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "white" : "dark")
                }
              >
                {resolvedTheme === "dark" ? (
                  <Sun size={17} aria-hidden="true" />
                ) : (
                  <Moon size={17} aria-hidden="true" />
                )}
              </button>
              <button
                className="admin-icon-button"
                aria-label="بازخوانی نمای کلی"
                onClick={() => setReload((n) => n + 1)}
              >
                <RefreshCw size={17} aria-hidden="true" />
              </button>
              <button
                className="admin-icon-button"
                aria-label="خروج از حساب"
                onClick={() => {
                  clearTokens()
                  setOverview(null)
                  router.replace("/login?next=/admin")
                }}
              >
                <LogOut size={17} aria-hidden="true" />
              </button>
              <span
                className="admin-avatar"
                title={overview.user.full_name || overview.user.phone_number}
              >
                {(overview.user.full_name || "مدیر").slice(0, 1)}
              </span>
            </div>
          </header>
          {menu && (
            <nav
              id="admin-mobile-nav"
              aria-label="مدیریت پَل در موبایل"
              className="admin-mobile-nav"
              onKeyDown={(e) => {
                if (e.key === "Escape") setMenu(false)
              }}
            >
              {nav}
            </nav>
          )}
          <main id="admin-content" tabIndex={-1} className="admin-main">
            {children}
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  )
}
