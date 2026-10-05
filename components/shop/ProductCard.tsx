import Image from "next/image"
import Link from "next/link"
import { formatPrice, CATEGORY_LABELS, type Product } from "@/lib/shop"

export default function ProductCard({
  product,
  seq,
}: {
  product: Product
  seq?: number
}) {
  const from = product.weights[0]
  const isSO = product.category === "single-origin"

  // One metadata line, same slot for every category — keeps the column scannable
  const meta = isSO
    ? [product.process, product.roastLevel].filter(Boolean).join(" · ")
    : product.arabicaPercent != null
      ? `عربیکا ${product.arabicaPercent}٪ / روبوستا ${100 - product.arabicaPercent}٪`
      : ""

  return (
    <Link
      href={`/catalog/${product.slug}`}
      className="group flex h-full flex-col bg-(--crp-cream) transition-colors duration-200 hover:bg-(--crp-warm) focus-visible:bg-(--crp-warm)"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-(--crp-warm)">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        {seq != null && (
          <span className="ed-seq absolute top-0 right-0 bg-(--crp-espresso) px-2.5 py-1.5 text-(--crp-cream)">
            {String(seq).padStart(2, "0")}
          </span>
        )}
        {isSO && product.cuppingScore != null && (
          <span className="ed-seq absolute top-0 left-0 bg-(--crp-terracotta) px-2.5 py-1.5 text-(--crp-cream)">
            {product.cuppingScore}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        {/* Title block */}
        <h3 className="text-lg leading-relaxed font-semibold">
          {product.title}
        </h3>
        <p className="t-label mt-1.5 text-(--crp-dark)">
          {product.region}
          {" · "}
          {product.categoryName || CATEGORY_LABELS[product.category]}
        </p>

        {/* Tasting notes — the actual reason someone picks a coffee */}
        {product.tastingNotes && product.tastingNotes.length > 0 && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-(--crp-dark)">
            {product.tastingNotes.slice(0, 3).join(" · ")}
          </p>
        )}

        {meta && <p className="t-label mt-2 text-(--crp-dark)">{meta}</p>}

        {/* Price row pinned to the bottom so the column aligns across cards */}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 border-t border-(--crp-sand) pt-4">
          {from ? (
            <p className="flex items-baseline gap-1.5">
              <span className="text-lg font-semibold text-(--crp-terracotta)">
                {formatPrice(from.price)}
              </span>
              {from.grams > 0 && (
                <span className="t-label font-normal text-(--crp-dark)">
                  / {from.grams} گرم
                </span>
              )}
            </p>
          ) : (
            <span className="t-label text-(--crp-dark)">ناموجود</span>
          )}
          <span className="t-label text-(--crp-terracotta) transition-transform duration-200 group-hover:-translate-x-1">
            مشاهده ←
          </span>
        </div>
      </div>
    </Link>
  )
}
