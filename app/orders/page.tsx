"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { IconArrowRight } from "@tabler/icons-react"
import {
  fetchOrders,
  formatPrice,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type Order,
} from "@/lib/shop"
import { isAuthed } from "@/lib/api"

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isAuthed()) {
      router.replace("/login?next=/orders")
      return
    }
    fetchOrders()
      .then(setOrders)
      .catch(() => setError("سفارش‌ها بارگذاری نشد."))
  }, [router])

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-(--crp-cream) text-(--crp-espresso)"
    >
      <div className="ed-shell max-w-3xl pt-24 pb-24">
        <h1 className="t-h1 border-b border-(--crp-espresso) pb-6">سفارش‌ها</h1>

        {error && (
          <p className="mt-10 text-center text-(--crp-dark)">{error}</p>
        )}
        {orders && orders.length === 0 && (
          <div className="py-24 text-center">
            <p className="t-h2">هنوز سفارشی ثبت نکرده‌اید.</p>
            <Link
              href="/catalog"
              className="outline-action ed-press mt-8 inline-flex min-h-12 items-center px-8 font-bold"
            >
              رفتن به فروشگاه
            </Link>
          </div>
        )}

        <div className="border-t border-(--crp-sand)">
          {orders?.map((o, i) => (
            <Link
              key={o.orderNumber}
              href={`/orders/${o.orderNumber}`}
              className="group flex items-center gap-4 border-b border-(--crp-sand) py-5 transition-colors duration-200 hover:bg-(--crp-warm)"
            >
              <span className="ed-seq text-(--crp-dark)">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <p className="font-black">سفارش {o.orderNumber}</p>
                <p className="t-label mt-1 text-(--crp-dark)">
                  {new Date(o.createdAt).toLocaleDateString("fa-IR")} ·{" "}
                  {o.items.length} قلم · {ORDER_STATUS_LABELS[o.status]} ·{" "}
                  {PAYMENT_STATUS_LABELS[o.paymentStatus]}
                </p>
              </div>
              <p className="font-black text-(--crp-terracotta)">
                {formatPrice(o.total)}
              </p>
              <IconArrowRight
                size={18}
                className="rotate-180 text-(--crp-dark) transition-transform duration-200 group-hover:-translate-x-1"
              />
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
