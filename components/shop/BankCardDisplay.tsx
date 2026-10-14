"use client"

import { useState } from "react"
import { Copy, CreditCard } from "lucide-react"
import type { BankCard } from "@/lib/payments"

export default function BankCardDisplay({
  card,
}: {
  card: Omit<BankCard, "id">
}) {
  const [message, setMessage] = useState("")

  async function copy(value: string, label: string) {
    setMessage("")
    try {
      await navigator.clipboard.writeText(value.replace(/\s/g, ""))
      setMessage(`${label} کپی شد.`)
    } catch {
      setMessage("کپی ممکن نشد؛ شماره را انتخاب و دستی کپی کنید.")
    }
  }

  return (
    <div dir="rtl" className="space-y-3" data-bank-card>
      <div className="relative overflow-hidden rounded-xl border border-(--outline) bg-(--surface-300) p-5 text-(--ink) sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -left-12 size-40 rounded-full border border-(--outline)"
        />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-(--ink-muted)">کارت مقصد</p>
            <p className="mt-1 font-bold wrap-anywhere">{card.bank_name}</p>
          </div>
          <CreditCard aria-hidden="true" className="size-6 shrink-0" />
        </div>
        <p className="relative mt-7 text-xs text-(--ink-muted)">شماره کارت</p>
        <p
          dir="ltr"
          className="relative mt-2 text-left font-mono text-lg tracking-wider tabular-nums select-all sm:text-2xl"
        >
          {card.card_number
            .replace(/\s/g, "")
            .match(/.{1,4}/g)
            ?.join(" ")}
        </p>
        <div className="relative mt-6 border-t border-(--outline) pt-4">
          <p className="text-xs text-(--ink-muted)">به نام</p>
          <p className="mt-1 font-semibold wrap-anywhere">
            {card.account_holder}
          </p>
        </div>
      </div>
      {card.iban && (
        <div className="rounded border border-(--outline) p-3">
          <p className="text-xs text-(--ink-muted)">شماره شبا</p>
          <p
            dir="ltr"
            className="mt-1 text-left font-mono text-sm break-all select-all"
          >
            {card.iban}
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn--secondary min-h-11 gap-2"
          onClick={() => void copy(card.card_number, "شماره کارت")}
        >
          <Copy aria-hidden="true" className="size-4" />
          کپی شماره کارت
        </button>
        {card.iban && (
          <button
            type="button"
            className="btn btn--secondary min-h-11 gap-2"
            onClick={() => void copy(card.iban, "شماره شبا")}
          >
            <Copy aria-hidden="true" className="size-4" />
            کپی شبا
          </button>
        )}
      </div>
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="min-h-6 text-sm text-(--ink-muted)"
      >
        {message}
      </p>
    </div>
  )
}
