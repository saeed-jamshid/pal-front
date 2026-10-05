"use client"

import Link from "next/link"
import {
  ArrowUpLeft,
  Package,
  ShoppingBag,
  CalendarDays,
  Receipt,
  Users,
  Truck,
  CheckCircle2,
} from "lucide-react"
import { useAdmin } from "@/components/admin/AdminShell"
import { formatPrice } from "@/lib/shop"

export default function AdminOverview() {
  const { overview } = useAdmin()
  const stats = [
    {
      label: "محصول فعال",
      value: overview.products,
      Icon: Package,
      href: "/admin/products",
    },
    {
      label: "کل سفارش‌ها",
      value: overview.orders,
      Icon: ShoppingBag,
      href: "/admin/orders",
    },
    {
      label: "سفارش آماده پردازش",
      value: overview.unfulfilled,
      Icon: Truck,
      href: "/admin/orders",
    },
    {
      label: "مشتری",
      value: overview.customers,
      Icon: Users,
      href: "/admin/customers",
    },
  ]
  const reviews = [
    {
      title: "رسیدهای پرداخت",
      text: "پرداخت‌های منتظر تأیید؛ ابتدا رسید و حساب مقصد را بررسی کنید.",
      value: overview.receipts_pending,
      Icon: Receipt,
      href: "/admin/payments",
    },
    {
      title: "ثبت‌نام رویدادها",
      text: "درخواست‌های در انتظار بررسی؛ تأیید هر درخواست، وضعیت حضور را نهایی می‌کند.",
      value: overview.registrations_pending,
      Icon: CalendarDays,
      href: "/admin/registrations",
    },
  ]
  return (
    <>
      <section className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">نمای کلی کسب‌وکار</span>
          <h1>{overview.user.full_name || "مدیر پَل"}، خوش آمدید</h1>
          <p>سفارش‌ها و ثبت‌نام‌های پَل را اینجا مدیریت کنید.</p>
        </div>
        <Link className="admin-button" href="/admin/products">
          مدیریت محصولات
          <ArrowUpLeft size={18} aria-hidden="true" />
        </Link>
      </section>
      <div className="admin-stats">
        {stats.map(({ label, value, Icon, href }) => (
          <Link className="admin-stat" key={label} href={href}>
            <div>
              <span>{label}</span>
              <Icon size={20} aria-hidden="true" />
            </div>
            <strong>{value.toLocaleString("fa-IR")}</strong>
            <p>
              مشاهده فهرست
              <ArrowUpLeft size={14} aria-hidden="true" />
            </p>
          </Link>
        ))}
      </div>
      <section className="admin-section">
        <div className="admin-section-heading">
          <h2>نیاز به بررسی شما</h2>
          <span>پرداخت‌ها و ثبت‌نام‌های در انتظار</span>
        </div>
        <div className="admin-review-grid">
          {reviews.map(({ title, text, value, Icon, href }) => (
            <article className="admin-review-card" key={title}>
              <div className="admin-review-card-heading">
                <span className="admin-review-icon">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span className={`admin-status ${value === 0 ? "good" : ""}`}>
                  {value.toLocaleString("fa-IR")} در انتظار
                </span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              <Link href={href} className="admin-link">
                باز کردن صف بررسی
                <ArrowUpLeft size={16} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <div className="admin-overview-bottom">
        <section className="admin-panel admin-revenue">
          <span className="admin-eyebrow">فروش ثبت‌شده</span>
          <h2>{formatPrice(overview.paid_total_rial)}</h2>
          <p>
            مجموع سفارش‌های پرداخت‌شده؛ فروش خالص یا گزارش تسویه بانکی نیست.
          </p>
          <Link className="admin-link" href="/admin/orders">
            بررسی سفارش‌ها
            <ArrowUpLeft size={16} aria-hidden="true" />
          </Link>
        </section>
        <section className="admin-panel admin-operating-note">
          <CheckCircle2 size={22} aria-hidden="true" />
          <h2>رکوردهای دارای سابقه را غیرفعال کنید</h2>
          <p>
            موارد دارای سابقه سفارش یا ثبت‌نام را حذف نکنید. دسترسی کارکنان در
            Django Admin مدیریت می‌شود. تنظیمات درگاه و پیامک در سرور هستند.
          </p>
          <Link className="admin-link" href="/admin/cards">
            مدیریت کارت‌های مقصد
            <ArrowUpLeft size={16} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  )
}
