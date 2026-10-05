"use client"

import Image from "next/image"
import OrderPayment from "@/components/shop/OrderPayment"
import { useRouter } from "next/navigation"
import { Suspense, use, useEffect, useState } from "react"
import {
  fetchOrder,
  formatPrice,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type Order,
  type OrderStatus,
} from "@/lib/shop"
import { isAuthed } from "@/lib/api"

const STEPS: OrderStatus[] = ["preparing", "shipped", "delivered"]

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense
      fallback={
        <main dir="rtl" className="min-h-screen bg-(--crp-cream) pt-32">
          <div className="ed-shell h-48 animate-pulse bg-(--crp-warm)" />
        </main>
      }
    >
      <OrderDetailPageContent params={params} />
    </Suspense>
  )
}

function OrderDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isAuthed()) {
      router.replace(`/login?next=/orders/${id}`)
      return
    }
    fetchOrder(id)
      .then(setOrder)
      .catch(() => setError("اطلاعات سفارش در دسترس نیست. دوباره تلاش کنید."))
  }, [id, router])

  const activeIdx = order ? STEPS.findIndex((s) => s === order.status) : -1

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-(--crp-cream) text-(--crp-espresso)"
    >
      <div className="ed-shell max-w-3xl pt-24 pb-24">
        {error && (
          <p className="pt-20 text-center text-(--crp-dark)">{error}</p>
        )}

        {order && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-(--crp-espresso) pb-6">
              <div>
                <p className="t-label text-(--crp-dark)">
                  {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                </p>
                <h1 className="t-h2 mt-2">سفارش {order.orderNumber}</h1>
              </div>
              <p className="text-3xl font-black text-(--crp-terracotta)">
                {formatPrice(order.total)}
              </p>
            </div>

            <p role="status" className="mt-6">
              پرداخت: {PAYMENT_STATUS_LABELS[order.paymentStatus]} — سفارش:{" "}
              {ORDER_STATUS_LABELS[order.status]}
            </p>
            {order.paymentMethod === "card_to_card" &&
              ["unpaid", "pending", "failed"].includes(order.paymentStatus) &&
              order.status !== "cancelled" && (
                <OrderPayment
                  orderNumber={order.orderNumber}
                  onUpdate={() => {
                    void fetchOrder(id)
                      .then(setOrder)
                      .catch(() =>
                        setError("وضعیت سفارش به‌روز نشد. دوباره تلاش کنید.")
                      )
                  }}
                />
              )}
            {/* Numbered status steps — text label + number, never color alone */}
            {order.paymentStatus === "paid" && order.status !== "cancelled" && (
              <ol className="ed-grid mt-10 grid-cols-3">
                {STEPS.map((step, i) => {
                  const done = i <= activeIdx
                  return (
                    <li
                      key={step}
                      aria-current={i === activeIdx ? "step" : undefined}
                      className="flex flex-col gap-3 p-4"
                      style={
                        done
                          ? {
                              background: "var(--crp-terracotta)",
                              color: "var(--crp-cream)",
                            }
                          : undefined
                      }
                    >
                      <span className="ed-seq">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-bold">
                        {ORDER_STATUS_LABELS[step]}
                      </span>
                      <span className="t-label">
                        {i < activeIdx
                          ? "انجام شد"
                          : i === activeIdx
                            ? "در جریان"
                            : "در انتظار"}
                      </span>
                    </li>
                  )
                })}
              </ol>
            )}

            {order.trackingCode && (
              <p className="mt-6 border border-(--crp-sand) p-4">
                <span className="t-label text-(--crp-dark)">
                  کد رهگیری پست:{" "}
                </span>
                <span
                  dir="ltr"
                  className="ed-seq font-bold tracking-wider text-(--crp-terracotta)"
                >
                  {order.trackingCode}
                </span>
              </p>
            )}

            <h2 className="t-label mt-12 border-b border-(--crp-espresso) pb-2">
              اقلام سفارش
            </h2>
            <div className="border-t-0">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b border-(--crp-sand) py-4"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden">
                    <Image
                      src={item.product.image}
                      alt={item.product.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{item.product.title}</p>
                    <p className="t-label mt-1 text-(--crp-dark)">
                      × {item.quantity}
                    </p>
                  </div>
                  <p className="font-black text-(--crp-terracotta)">
                    {formatPrice(item.lineTotal)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
