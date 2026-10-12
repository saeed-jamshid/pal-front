"use client"

import Image from "next/image"
import Link from "next/link"
import { preloadProduct, ROAST_LABELS, type Product } from "@/lib/shop"

// Latin names are stored as "Origin Name / process": two lines on the card.
export function nameLines(title: string) {
  return title.split(" / ").map((part) => part.trim())
}

export default function ProductCard({ product }: { product: Product }) {
  const [first, second] = nameLines(product.title)
  const preload = () => preloadProduct(product.slug)
  const notes = product.tastingNotes?.slice(0, 3).join(" · ")
  const meta = [
    product.region,
    product.roastLevel && ROAST_LABELS[product.roastLevel],
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <Link
      href={`/catalog/${product.slug}`}
      onMouseEnter={preload}
      onFocus={preload}
      onTouchStart={preload}
      onPointerDown={preload}
      aria-label={product.title}
      className="pcard"
      // Stable name lets catalog filter changes glide each card to its new slot.
      style={{ viewTransitionName: `pcard-${product.slug}` }}
    >
      <div className="pcard__media">
        <Image
          src={product.image || "/brand/new-design/images/coffee-bag-800.webp"}
          alt=""
          fill
          sizes="(max-width: 760px) 45vw, (max-width: 1000px) 40vw, 28vw"
          className="pcard__photo"
        />
      </div>
      <div className="pcard__info">
        <div>
          <h3 className="pcard__name product-name" dir="auto">
            {first}
            {second && (
              <>
                <br />
                <span className="font-semibold normal-case">{second}</span>
              </>
            )}
          </h3>
          {notes && <p className="pcard__notes mt-2">{notes}</p>}
        </div>
        {meta && <p className="pcard__meta">{meta}</p>}
      </div>
    </Link>
  )
}
