"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react"
import {
  fetchCart,
  updateCartItem,
  deleteCartItem,
  formatPrice,
  GRIND_LABELS,
  checkout,
  fetchAddresses,
  createAddress,
  type Address,
  type Cart,
} from "@/lib/shop"
import { ApiError, isAuthed } from "@/lib/api"

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [error, setError] = useState("")
  const [addresses, setAddresses] = useState<Address[]>([])
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    if (!isAuthed()) {
      router.replace("/login?next=/cart")
      return
    }
    return Promise.all([fetchCart(), fetchAddresses()])
      .then(([cart, addresses]) => {
        setCart(cart)
        setAddresses(addresses)
      })
      .catch(() => setError("سبد خرید یا آدرس‌ها بارگذاری نشد."))
  }, [router])

  useEffect(() => {
    void load()
  }, [load])

  async function setQty(id: number, qty: number) {
    if (qty < 1 || busy) return
    setBusy(true)
    setError("")
    try {
      await updateCartItem(id, qty)
      await load()
    } catch {
      toast.error("به‌روزرسانی تعداد ناموفق بود.")
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: number) {
    if (busy) return
    setBusy(true)
    setError("")
    try {
      await deleteCartItem(id)
      await load()
    } catch {
      toast.error("حذف محصول ناموفق بود.")
    } finally {
      setBusy(false)
    }
  }

  async function saveAddress(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return
    const data = new FormData(e.currentTarget)
    const form = e.currentTarget
    setBusy(true)
    setError("")
    try {
      await createAddress({
        title: "آدرس ارسال",
        recipientName: String(data.get("recipientName")),
        recipientPhone: String(data.get("recipientPhone")),
        province: String(data.get("province")),
        city: String(data.get("city")),
        postalAddress: String(data.get("postalAddress")),
        postalCode: String(data.get("postalCode")),
        isDefault: addresses.length === 0,
      })
      setAddresses(await fetchAddresses())
      form.reset()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "ثبت آدرس ناموفق بود.")
    } finally {
      setBusy(false)
    }
  }

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return
    const data = new FormData(e.currentTarget)
    setBusy(true)
    setError("")
    try {
      const order = await checkout(
        Number(data.get("address")),
        String(data.get("note") ?? "")
      )
      router.push(`/orders/${order.order_number}`)
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "ارتباط قطع شد. پیش از ثبت دوباره، سفارش‌های خود را بررسی کنید."
      )
      await load()
    } finally {
      setBusy(false)
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-(--crp-cream) text-(--crp-espresso)"
    >
      <div className="ed-shell pt-24 pb-24">
        <h1 className="t-h1 border-b border-(--crp-espresso) pb-6">سبد خرید</h1>

        {error && (
          <p role="alert" className="mt-10 text-center text-(--crp-dark)">
            {error}
          </p>
        )}

        {cart && cart.items.length === 0 && (
          <div className="py-24 text-center">
            <p className="t-h2">سبد خرید خالی است.</p>
            <Link
              href="/catalog"
              className="outline-action ed-press mt-8 inline-flex min-h-12 items-center px-8 font-bold"
            >
              رفتن به فروشگاه
            </Link>
          </div>
        )}

        {cart && cart.items.length > 0 && (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
            {/* Items as editorial rows */}
            <div className="border-t border-(--crp-sand)">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-5 border-b border-(--crp-sand) py-5"
                >
                  <div className="relative size-24 shrink-0 overflow-hidden sm:size-28">
                    <Image
                      src={item.product.image}
                      alt={item.product.title}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-black">
                          {item.product.title}
                        </p>
                        <p className="t-label mt-1 text-(--crp-dark)">
                          {GRIND_LABELS[item.grindType]}
                        </p>
                      </div>
                      <button
                        disabled={busy}
                        onClick={() => remove(item.id)}
                        aria-label={`حذف ${item.product.title}`}
                        className="grid size-11 cursor-pointer place-items-center border border-(--crp-sand) text-(--crp-dark) transition hover:text-(--crp-terracotta)"
                      >
                        <IconTrash size={18} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-(--crp-sand)">
                        <button
                          disabled={busy || item.quantity <= 1}
                          onClick={() => setQty(item.id, item.quantity - 1)}
                          aria-label="کاهش تعداد"
                          className="grid size-10 cursor-pointer place-items-center transition hover:bg-(--crp-warm)"
                        >
                          <IconMinus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-black">
                          {item.quantity}
                        </span>
                        <button
                          disabled={busy}
                          onClick={() => setQty(item.id, item.quantity + 1)}
                          aria-label="افزایش تعداد"
                          className="grid size-10 cursor-pointer place-items-center transition hover:bg-(--crp-warm)"
                        >
                          <IconPlus size={14} />
                        </button>
                      </div>
                      <p className="text-lg font-black text-(--crp-terracotta)">
                        {formatPrice(item.lineTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout — one strong terracotta block */}
            <aside className="h-fit border border-(--crp-espresso) lg:sticky lg:top-24">
              <div className="flex items-baseline justify-between bg-(--crp-terracotta) p-5 text-(--crp-cream)">
                <span className="t-label">مجموع</span>
                <span className="text-2xl font-black">
                  {formatPrice(cart.total)}
                </span>
              </div>

              <div className="p-5">
                <form onSubmit={placeOrder} className="space-y-4">
                  <label className="block">
                    آدرس ارسال
                    <select
                      name="address"
                      required
                      disabled={busy}
                      className="mt-2 min-h-12 w-full border px-3"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        انتخاب آدرس
                      </option>
                      {addresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.city} — {a.postalAddress}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    یادداشت (اختیاری)
                    <textarea
                      name="note"
                      disabled={busy}
                      className="mt-2 w-full border p-3"
                    />
                  </label>
                  <p>
                    پرداخت کارت‌به‌کارت با بررسی دستی رسید. ثبت سفارش به معنی
                    پرداخت نیست.
                  </p>
                  <button
                    disabled={busy || !addresses.length}
                    className="outline-action min-h-12 w-full disabled:opacity-60"
                  >
                    {busy ? "در حال ثبت…" : "ثبت سفارش و ادامه پرداخت"}
                  </button>
                </form>
                <details className="mt-6" open={!addresses.length}>
                  <summary className="min-h-12 cursor-pointer">
                    افزودن آدرس
                  </summary>
                  <form onSubmit={saveAddress} className="space-y-3">
                    <fieldset disabled={busy} className="space-y-3">
                      {(
                        [
                          ["recipientName", "نام گیرنده"],
                          ["recipientPhone", "شماره گیرنده"],
                          ["province", "استان"],
                          ["city", "شهر"],
                          ["postalAddress", "آدرس کامل"],
                          ["postalCode", "کد پستی"],
                        ] as const
                      ).map(([key, label]) => (
                        <label key={key} className="block">
                          {label}
                          <input
                            name={key}
                            required
                            autoComplete={
                              key === "recipientName"
                                ? "name"
                                : key === "recipientPhone"
                                  ? "tel"
                                  : key === "postalCode"
                                    ? "postal-code"
                                    : "off"
                            }
                            className="mt-1 min-h-12 w-full border px-3"
                          />
                        </label>
                      ))}
                      <button
                        className="outline-action min-h-12 w-full"
                        disabled={busy}
                      >
                        {busy ? "در حال ذخیره…" : "ذخیره آدرس"}
                      </button>
                    </fieldset>
                  </form>
                </details>
                <Link
                  href="/orders"
                  className="mt-4 inline-flex min-h-12 items-center underline"
                >
                  بررسی سفارش‌های من
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
