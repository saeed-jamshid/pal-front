import Image from "next/image"
import Link from "next/link"
import CoffeeArt from "@/components/shop/CoffeeArt"
import { ROAST_LABELS, type Product } from "@/lib/shop"

// Latin names are stored as "Origin Name / process": two lines on the card.
export function nameLines(title: string) {
  return title.split(" / ").map((part) => part.trim())
}

export default function ProductCard({ product }: { product: Product }) {
  const [first, second] = nameLines(product.title)
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
      aria-label={product.title}
      className="pcard"
      // Stable name lets catalog filter changes glide each card to its new slot.
      style={{ viewTransitionName: `pcard-${product.slug}` }}
    >
      <div className="pcard__media">
        {product.image ? (
          <Image
            src={product.image}
            alt=""
            fill
            sizes="(max-width: 1000px) 50vw, 33vw"
            className="object-contain p-[18%]"
          />
        ) : (
          <CoffeeArt
            product={product}
            className="w-full"
          />
        )}
      </div>
      <div className="pcard__info">
        <div>
          <h3 className="pcard__name latin-name">
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
