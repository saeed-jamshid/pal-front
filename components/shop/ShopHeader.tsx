"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { IconArrowRight, IconMenu2, IconX } from "@tabler/icons-react"

const NAV = [
  { href: "/", label: "خانه" },
  { href: "/catalog", label: "فروشگاه" },
  { href: "/submit", label: "رویدادها" },
  { href: "/about", label: "دربارهٔ ما" },
  { href: "/gallery", label: "گالری" },
]

export default function ShopHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-(--crp-sand) bg-(--crp-cream)">
      <div className="ed-shell grid w-full grid-cols-[1fr_auto] items-center gap-3 py-3 lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 whitespace-nowrap text-(--crp-espresso)"
          >
            <Image
              src="/img/pal_logo.png"
              width={44}
              height={18}
              priority
              alt=""
            />
            <span className="text-sm font-semibold sm:text-base">پَل</span>
          </Link>
        </div>

        {/* Desktop nav — plain text links, underline active */}
        <nav
          aria-label="ناوبری اصلی"
          className="hidden items-center justify-center gap-2 whitespace-nowrap lg:flex xl:gap-5"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="t-label flex min-h-11 items-center border-b-2 border-transparent px-2 text-(--crp-espresso) transition-colors duration-200 hover:border-(--crp-espresso)"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <Link
            href="/orders"
            className="inline-flex min-h-11 items-center px-2 text-sm"
          >
            سفارش‌ها
          </Link>
          <Link
            href="/cart"
            className="inline-flex min-h-11 items-center px-2 text-sm"
          >
            سبد خرید
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            aria-expanded={open}
            className="grid size-11 cursor-pointer place-items-center border border-(--crp-sand) transition hover:border-(--crp-espresso) lg:hidden"
          >
            {open ? <IconX size={19} /> : <IconMenu2 size={19} />}
          </button>
        </div>
      </div>

      {/* Mobile menu — full-width editorial rows, 44px+ targets */}
      {open && (
        <nav
          aria-label="ناوبری موبایل"
          className="border-t border-(--crp-sand) lg:hidden"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="ed-shell flex min-h-14 items-center justify-between border-b border-(--crp-sand) text-lg font-bold transition hover:text-(--crp-terracotta)"
            >
              {item.label}
              <IconArrowRight size={18} className="rotate-180" />
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
