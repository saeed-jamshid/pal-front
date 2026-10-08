"use client"

import { Suspense, useEffect, useState } from "react"
import { flushSync } from "react-dom"
import { useSearchParams } from "next/navigation"
import ProductCard from "@/components/shop/ProductCard"
import {
  CATEGORY_LABELS,
  fetchProducts,
  inCategory,
  type Product,
} from "@/lib/shop"

function Catalog() {
  // One request for all coffees; tabs filter locally so switching never flashes a loader.
  const [tab, setTab] = useState(useSearchParams().get("category") ?? "")
  const [reload, setReload] = useState(0)
  const [loaded, setLoaded] = useState<{ reload: number; value: Product[] | Error }>()
  const result = loaded?.reload === reload ? loaded.value : null

  useEffect(() => {
    let alive = true
    fetchProducts()
      .then((products) => alive && setLoaded({ reload, value: products }))
      .catch(() => alive && setLoaded({ reload, value: new Error("ارتباط با سرور برقرار نشد.") }))
    return () => {
      alive = false
    }
  }, [reload])

  const select = (slug: string) => {
    if (slug === tab) return
    history.replaceState(null, "", slug ? `/catalog?category=${slug}` : "/catalog")
    const update = () => flushSync(() => setTab(slug))
    // Native view transition: remaining cards glide to their new spot, others fade.
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches)
      document.startViewTransition(update)
    else update()
  }

  const tabs = [{ slug: "", name: "همه" }, ...Object.entries(CATEGORY_LABELS).map(([slug, name]) => ({ slug, name }))]
  const shown = Array.isArray(result) ? result.filter((p) => inCategory(p, tab)) : []
  const state = result === null ? "loading" : result instanceof Error ? "error" : shown.length ? "ready" : "empty"

  return (
    <div className="shop-layout">
      <nav aria-label="دسته‌بندی قهوه" className="cats">
        {tabs.map((c) => (
          <button
            key={c.slug}
            type="button"
            aria-pressed={tab === c.slug}
            onClick={() => select(c.slug)}
          >
            {c.name}
          </button>
        ))}
      </nav>

      <section aria-live="polite" aria-busy={result === null}>
        <div className="catalog-results" data-state={state}>
        {result === null ? (
          <div className="pgrid" aria-label="در حال بارگذاری">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="pcard" aria-hidden>
                <div className="pcard__media" />
                <div className="pcard__info" />
              </div>
            ))}
          </div>
        ) : result instanceof Error ? (
          <div className="rounded-(--radius-md) border border-(--outline) px-6 py-16 text-center">
            <p className="text-xl font-bold">{result.message}</p>
            <button
              type="button"
              onClick={() => setReload((n) => n + 1)}
              className="btn btn--secondary mt-6"
            >
              تلاش دوباره
            </button>
          </div>
        ) : shown.length === 0 ? (
          <p className="catalog-empty rounded-(--radius-md) border border-(--outline) px-6 py-16 text-center text-xl font-bold">
            قهوه‌ای برای نمایش نیست.
          </p>
        ) : (
          <div className="pgrid">
            {shown.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
        </div>
      </section>
    </div>
  )
}

export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-(--surface-100) pt-24 pb-16 text-(--ink)">
      <div className="ed-shell">
        <header className="border-b border-(--outline) pb-6">
          <h1 className="fa-h1">قهوه‌های پَل</h1>
          <p className="lead mt-2">
            قهوه‌هایی که این فصل در پَل دم می‌کنیم. برای هر قهوه، خاستگاه و طعم‌یادها را ببینید.
          </p>
        </header>
        <div className="mt-8">
          <Suspense fallback={<p role="status">در حال بارگذاری…</p>}>
            <Catalog />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
