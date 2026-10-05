"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import ProductCard from "@/components/shop/ProductCard"
import {
  fetchProducts,
  fetchCategories,
  type Category,
  type CategorySlug,
  type Product,
} from "@/lib/shop"

type SortKey = "featured" | "price-asc" | "price-desc" | "score-desc"

const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "پیش‌فرض" },
  { key: "price-asc", label: "ارزان‌ترین" },
  { key: "price-desc", label: "گران‌ترین" },
]

const priceOf = (p: Product) => p.weights[0]?.price ?? Number.POSITIVE_INFINITY

export default function CatalogPage() {
  const [tab, setTab] = useState<CategorySlug>("" as CategorySlug)
  const [categories, setCategories] = useState<Category[]>([])
  const TABS = ["", ...categories.map((c) => c.slug)] as CategorySlug[]
  const [sort, setSort] = useState<SortKey>("featured")
  // null = loading for current tab; Error = failed
  const [result, setResult] = useState<Product[] | Error | null>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    let alive = true
    Promise.all([fetchProducts(tab || undefined), fetchCategories()])
      .then(([p, categories]) => {
        if (alive) {
          setResult(p)
          setCategories(categories)
        }
      })
      .catch(() => alive && setResult(new Error("ارتباط با سرور برقرار نشد.")))
    return () => {
      alive = false
    }
  }, [tab])

  const loading = result === null
  const error = result instanceof Error ? result.message : ""
  const products = useMemo(
    () => (Array.isArray(result) ? result : []),
    [result]
  )

  const sorted = useMemo(() => {
    const list = [...products]
    switch (sort) {
      case "price-asc":
        return list.sort((a, b) => priceOf(a) - priceOf(b))
      case "price-desc":
        return list.sort((a, b) => priceOf(b) - priceOf(a))
      case "score-desc":
        return list.sort(
          (a, b) => (b.cuppingScore ?? 0) - (a.cuppingScore ?? 0)
        )
      default:
        return list
    }
  }, [products, sort])

  function selectTab(next: CategorySlug) {
    setTab(next)
    setResult(null)
  }

  // Roving focus: arrow keys move between tabs (WAI-ARIA tabs pattern)
  function onTabKey(e: React.KeyboardEvent, i: number) {
    const dir = e.key === "ArrowLeft" ? 1 : e.key === "ArrowRight" ? -1 : 0 // RTL
    if (!dir) return
    e.preventDefault()
    const next = (i + dir + TABS.length) % TABS.length
    tabRefs.current[next]?.focus()
    selectTab(TABS[next])
  }

  const panelId = `panel-${tab}`

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-(--crp-cream) text-(--crp-espresso)"
    >
      {/* Compact masthead — product stays near the fold */}
      <section className="ed-shell pt-24">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b-2 border-(--crp-espresso) pb-5">
          <div>
            <h1 className="t-h2">قهوه‌های پَل</h1>
          </div>
        </div>
      </section>

      {/* Category tabs */}
      <section className="ed-shell bg-(--crp-surface)">
        <div
          role="tablist"
          aria-label="دسته‌بندی قهوه"
          className="ed-grid grid-cols-2 border-t-0 md:grid-cols-4"
        >
          {TABS.map((t, i) => {
            const active = tab === t
            return (
              <button
                key={t}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                role="tab"
                id={`tab-${t}`}
                aria-selected={active}
                aria-controls={panelId}
                tabIndex={active ? 0 : -1}
                onClick={() => selectTab(t)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`min-h-14 cursor-pointer px-2 py-4 text-sm font-bold transition-colors duration-200 sm:text-base ${
                  active
                    ? "border-b-2 border-(--crp-espresso) text-(--crp-espresso)"
                    : "hover:bg-(--crp-warm)!"
                }`}
              >
                {t ? categories.find((c) => c.slug === t)?.name : "همه قهوه‌ها"}
              </button>
            )
          })}
        </div>
      </section>

      {/* Toolbar: result count + sort */}
      <section className="ed-shell bg-(--crp-warm)">
        <div className="flex flex-wrap items-center justify-between gap-3 border-x border-b border-(--crp-sand) px-4 py-3">
          <p aria-live="polite" className="t-label text-(--crp-dark)">
            {loading
              ? "در حال بارگذاری…"
              : error
                ? ""
                : `${sorted.length} محصول`}
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="t-label text-(--crp-dark)">
              مرتب‌سازی
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="min-h-11 cursor-pointer border border-(--crp-sand) bg-(--crp-cream) px-3 text-sm font-bold"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Product grid — uniform rhythm, no arbitrary featured tile */}
      <section
        id={panelId}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        tabIndex={-1}
        className="ed-shell bg-(--crp-surface) pb-24"
      >
        {loading ? (
          <div className="ed-grid grid-cols-2 border-t-0 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-(--crp-cream)!">
                <div className="h-64 animate-pulse bg-(--crp-warm)" />
                <div className="flex flex-col gap-3 border-t border-(--crp-sand) p-5">
                  <div className="h-3 w-20 animate-pulse bg-(--crp-warm)" />
                  <div className="h-5 w-3/4 animate-pulse bg-(--crp-warm)" />
                  <div className="h-3 w-1/2 animate-pulse bg-(--crp-warm)" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="border-x border-b border-(--crp-sand) py-20 text-center">
            <p className="t-h2">{error}</p>
            <button
              onClick={() => {
                setResult(null)
                Promise.all([
                  fetchProducts(tab || undefined),
                  fetchCategories(),
                ])
                  .then(([p, c]) => {
                    setResult(p)
                    setCategories(c)
                  })
                  .catch(() =>
                    setResult(new Error("ارتباط با سرور برقرار نشد."))
                  )
              }}
              className="outline-action ed-press mt-6 min-h-12 cursor-pointer px-8 font-bold"
            >
              تلاش دوباره
            </button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="border-x border-b border-(--crp-sand) py-20 text-center">
            <p className="t-h2">فعلاً محصولی در این دسته نیست.</p>
            <p className="t-body mt-3 text-(--crp-dark)">
              دسته‌های دیگر را ببینید.
            </p>
          </div>
        ) : (
          <div className="ed-grid grid-cols-2 border-t-0 md:grid-cols-3 lg:grid-cols-4">
            {sorted.map((p, i) => (
              <ProductCard key={p.slug} product={p} seq={i + 1} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
