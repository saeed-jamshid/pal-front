"use client"

import Image from "next/image"
import { Suspense, use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { IconMinus, IconPlus, IconShoppingBag } from "@tabler/icons-react"
import {
  fetchProduct,
  addCartItem,
  formatPrice,
  CATEGORY_LABELS,
  BREW_LABELS,
  BREW_ACCENTS,
  GRIND_LABELS,
  type BrewMethod,
  type GrindType,
  type Product,
} from "@/lib/shop"
import { isAuthed } from "@/lib/api"

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <Suspense
      fallback={
        <main dir="rtl" className="min-h-screen bg-(--crp-cream) pt-32">
          <div className="ed-shell h-48 animate-pulse bg-(--crp-warm)" />
        </main>
      }
    >
      <ProductPageContent params={params} />
    </Suspense>
  )
}

function ProductPageContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState("")
  const [brew, setBrew] = useState<BrewMethod>("espresso")
  const [grind, setGrind] = useState<GrindType>("beans")
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchProduct(slug)
      .then((p) => {
        setProduct(p)
        setGrind(p.allowedGrinds[0] ?? "")
      })
      .catch(() => setError("اطلاعات محصول در دسترس نیست. دوباره تلاش کنید."))
  }, [slug])

  if (error)
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-(--crp-cream) text-(--crp-espresso)"
      >
        <p className="ed-shell pt-40 text-center text-(--crp-dark)">{error}</p>
      </main>
    )

  if (!product)
    return (
      <main dir="rtl" className="min-h-screen bg-(--crp-cream)">
        <div className="ed-shell grid gap-10 pt-28 lg:grid-cols-2">
          <div className="aspect-square animate-pulse bg-(--crp-warm)" />
          <div className="flex flex-col gap-4">
            <div className="h-16 animate-pulse bg-(--crp-warm)" />
            <div className="h-40 animate-pulse bg-(--crp-warm)" />
          </div>
        </div>
      </main>
    )

  const isSO = product.category === "single-origin"
  const selectedBrew = product.brewMethods?.includes(brew)
    ? brew
    : product.brewMethods?.[0]
  const accent =
    isSO && selectedBrew ? BREW_ACCENTS[selectedBrew] : "var(--crp-terracotta)"
  const weight = product.weights[0]
  const total = weight ? weight.price * qty : 0

  async function addToCart() {
    if (!weight) return
    if (!isAuthed()) {
      router.push(`/login?next=/catalog/${slug}`)
      return
    }
    setAdding(true)
    try {
      await addCartItem(product!.id, qty, grind)
      router.push("/cart")
    } catch {
      toast.error("محصول به سبد اضافه نشد. دوباره تلاش کنید.")
    } finally {
      setAdding(false)
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-(--crp-cream) pb-24 text-(--crp-espresso) lg:pb-0"
      style={{ "--brew-accent": accent } as React.CSSProperties}
    >
      {/* Split hero */}
      <section className="ed-shell pt-24">
        <div className="grid border-b border-(--crp-espresso) lg:grid-cols-2">
          <div className="relative aspect-square border-(--crp-sand) lg:border-l">
            <Image
              src={product.image}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <span
              className="ed-seq absolute top-0 right-0 px-3 py-2 text-(--crp-cream)"
              style={{ background: accent }}
            >
              {product.categoryName || CATEGORY_LABELS[product.category]}
            </span>
          </div>

          <div className="flex flex-col justify-center gap-5 py-8 lg:pr-10">
            <p className="t-label text-(--crp-dark)">{product.region}</p>
            <h1 className="t-h1">{product.title}</h1>
            {product.tastingNotes && product.tastingNotes.length > 0 && (
              <p className="t-body text-(--crp-dark)">
                {product.tastingNotes.join(" · ")}
              </p>
            )}
            <p className="text-3xl font-black" style={{ color: accent }}>
              {weight ? formatPrice(weight.price) : "—"}
              {weight && weight.grams > 0 && (
                <span className="mr-2 text-base font-normal text-(--crp-dark)">
                  / {weight.grams} گرم
                </span>
              )}
            </p>
          </div>
        </div>
      </section>

      <div className="ed-shell grid gap-12 py-12 lg:grid-cols-[1fr_380px]">
        {/* Editorial content */}
        <div className="flex flex-col gap-12">
          <p className="t-body max-w-prose text-(--crp-dark)">
            {product.description}
          </p>

          {/* Specs — bordered definition table */}
          <section>
            <h2 className="t-label mb-4 border-b border-(--crp-espresso) pb-2">
              مشخصات
            </h2>
            <dl className="ed-grid grid-cols-2 sm:grid-cols-3">
              <Spec label="منطقه" value={product.region} />
              <Spec label="درجه رست" value={product.roastLevel} />
              {isSO ? (
                <>
                  <Spec label="ارتفاع" value={product.altitude} />
                  <Spec label="واریته عربیکا" value={product.arabicaVariety} />
                  <Spec
                    label="امتیاز"
                    value={product.cuppingScore?.toString()}
                  />
                  <Spec label="فرآوری" value={product.process} />
                </>
              ) : (
                product.arabicaPercent != null && (
                  <Spec
                    label="عربیکا / روبوستا"
                    value={`${product.arabicaPercent}٪ / ${100 - product.arabicaPercent}٪`}
                  />
                )
              )}
            </dl>
          </section>

          {/* Brew methods — illustrated color blocks, swap accent */}
          {product.brewMethods && product.brewMethods.length > 0 && (
            <section>
              <h2 className="t-label mb-4 border-b border-(--crp-espresso) pb-2">
                روش دم‌آوری
              </h2>
              <div className="ed-grid grid-cols-2 sm:grid-cols-3">
                {product.brewMethods.map((m) => {
                  const active = selectedBrew === m
                  return (
                    <button
                      key={m}
                      onClick={() => setBrew(m)}
                      aria-pressed={active}
                      className={`min-h-16 cursor-pointer border px-3 py-4 text-sm font-bold transition-colors duration-200 ${active ? "border-(--crp-espresso)" : "border-transparent"}`}
                    >
                      <span
                        className="mx-auto mb-2 block size-3"
                        style={{
                          background: active
                            ? "var(--crp-cream)"
                            : BREW_ACCENTS[m],
                        }}
                      />
                      {BREW_LABELS[m]}
                    </button>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        {/* Buy panel — sticky on desktop */}
        <aside className="h-fit border border-(--crp-espresso) lg:sticky lg:top-24">
          <div className="flex flex-col gap-5 p-5">
            {weight && weight.grams > 0 && (
              <p className="t-label text-(--crp-dark)">
                وزن بسته: {weight.grams} گرم
              </p>
            )}

            <div>
              <span className="t-label mb-2 block text-(--crp-dark)">
                آسیاب
              </span>
              {!product.allowedGrinds.length && (
                <p>این محصول نیازی به آسیاب ندارد.</p>
              )}
              <div className="ed-grid grid-cols-2">
                {product.allowedGrinds.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGrind(g)}
                    aria-pressed={grind === g}
                    className={`min-h-11 cursor-pointer border px-2 py-2 text-sm font-bold transition-colors duration-200 ${grind === g ? "border-(--crp-espresso)" : "border-transparent"}`}
                  >
                    {GRIND_LABELS[g]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="t-label mb-2 block text-(--crp-dark)">
                تعداد
              </span>
              <div className="flex items-center justify-between border border-(--crp-sand)">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="کاهش تعداد"
                  className="grid size-11 cursor-pointer place-items-center transition hover:bg-(--crp-warm)"
                >
                  <IconMinus size={16} />
                </button>
                <span className="font-black">{qty}</span>
                <button
                  onClick={() =>
                    setQty((q) => Math.min(product.availableStock, q + 1))
                  }
                  aria-label="افزایش تعداد"
                  className="grid size-11 cursor-pointer place-items-center transition hover:bg-(--crp-warm)"
                >
                  <IconPlus size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-baseline justify-between border-t border-(--crp-sand) pt-4">
              <span className="t-label text-(--crp-dark)">مجموع</span>
              <span className="text-2xl font-black" style={{ color: accent }}>
                {weight ? formatPrice(total) : "—"}
              </span>
            </div>

            <button
              onClick={addToCart}
              disabled={adding || !weight || product.availableStock <= 0}
              className="outline-action ed-press flex min-h-12 cursor-pointer items-center justify-center gap-2 font-bold disabled:opacity-50"
            >
              <IconShoppingBag size={18} />
              {adding
                ? "در حال افزودن…"
                : product.availableStock <= 0
                  ? "ناموجود"
                  : "افزودن به سبد"}
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile sticky purchase bar */}
      <div className="fixed right-0 bottom-0 left-0 z-40 flex items-center justify-between gap-4 border-t border-(--crp-espresso) bg-(--crp-cream) px-4 py-3 lg:hidden">
        <div>
          <span className="t-label block text-(--crp-dark)">مجموع</span>
          <span className="text-lg font-black" style={{ color: accent }}>
            {weight ? formatPrice(total) : "—"}
          </span>
        </div>
        <button
          onClick={addToCart}
          disabled={adding || !weight || product.availableStock <= 0}
          className="outline-action flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 font-bold disabled:opacity-50"
        >
          <IconShoppingBag size={18} />
          {adding
            ? "…"
            : product.availableStock <= 0
              ? "ناموجود"
              : "افزودن به سبد"}
        </button>
      </div>
    </main>
  )
}

function Spec({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="p-4">
      <dt className="t-label text-(--crp-dark)">{label}</dt>
      <dd className="mt-1 font-bold">{value}</dd>
    </div>
  )
}
