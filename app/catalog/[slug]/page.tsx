"use client"

// Show-only coffee page. The purchase panel (grind, qty, add to cart) lives in
// git history before this change; restore it together with SHOP_SALES_ENABLED.
import Image from "next/image"
import Link from "next/link"
import { Suspense, use, useEffect, useState } from "react"
import CoffeeArt from "@/components/shop/CoffeeArt"
import { nameLines } from "@/components/shop/ProductCard"
import {
  fetchProduct,
  formatPrice,
  ROAST_LABELS,
  SHOP_SALES_ENABLED,
  splitDescription,
  type Product,
} from "@/lib/shop"

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <main className="min-h-screen bg-(--surface-100) pt-24 pb-16 text-(--ink)">
      <div className="ed-shell">
        <Suspense fallback={<Skeleton />}>
          <ProductPageContent params={params} />
        </Suspense>
      </div>
    </main>
  )
}

function Skeleton() {
  return (
    <div className="grid gap-10 min-[1001px]:grid-cols-2" role="status" aria-label="در حال بارگذاری">
      <div className="arch aspect-square" />
      <div className="h-64 rounded-(--radius-md) bg-(--surface-200)" />
    </div>
  )
}

function ProductPageContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let alive = true
    fetchProduct(slug)
      .then((p) => alive && setProduct(p))
      .catch(() => alive && setError("این قهوه پیدا نشد یا اطلاعاتش در دسترس نیست."))
    return () => {
      alive = false
    }
  }, [slug])

  if (error)
    return (
      <div className="py-24 text-center">
        <p className="text-xl font-bold">{error}</p>
        <Link href="/catalog" className="btn btn--secondary mt-6">
          بازگشت به قهوه‌ها
        </Link>
      </div>
    )
  if (!product) return <Skeleton />

  const [first, second] = nameLines(product.title)
  const { specs, paragraphs } = splitDescription(product.description)
  const rows = Array.from(new Map<string, string>([
    ["خاستگاه", product.region],
    ["درجه رست", product.roastLevel ? ROAST_LABELS[product.roastLevel] ?? "" : ""],
    ["طعم‌یادها", (product.tastingNotes ?? []).join(" · ")],
    ...specs,
  ].filter(([, v]) => v) as [string, string][]).entries())

  return (
    <article className="grid items-start gap-10 min-[1001px]:grid-cols-2">
      <div className="arch relative grid aspect-square place-items-center">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            priority
            sizes="(max-width: 1000px) 100vw, 50vw"
            className="object-contain p-[15%]"
          />
        ) : (
          <CoffeeArt product={product} className="w-[90%]" />
        )}
      </div>

      <div className="grid gap-6">
        <nav aria-label="مسیر">
          <Link href="/catalog" className="text-sm font-bold text-(--cistern) underline-offset-4 hover:underline">
            قهوه‌ها
          </Link>
          {product.categoryName && (
            <span className="text-sm text-(--ink-muted)"> / {product.categoryName}</span>
          )}
        </nav>
        <h1 className="latin-name text-[clamp(28px,4vw,44px)] leading-[1.1]">
          {first}
          {second && (
            <>
              <br />
              <span className="font-semibold normal-case">{second}</span>
            </>
          )}
        </h1>
        {product.shortDescription && <p className="lead">{product.shortDescription}</p>}
        {paragraphs.map((p) => (
          <p key={p} className="max-w-prose leading-8">
            {p}
          </p>
        ))}
        {SHOP_SALES_ENABLED && product.weights[0] && (
          <p className="text-2xl font-extrabold">{formatPrice(product.weights[0].price)}</p>
        )}

        <section className="info-block" aria-labelledby="specs-title">
          <h2 id="specs-title" className="fa-h2">
            مشخصات قهوه
          </h2>
          <dl>
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </article>
  )
}
