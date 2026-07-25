"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import Header from "@/components/layout/Header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getCatalogProduct, loadCatalogProducts } from "@/lib/catalog"

export default function CatalogProductPage() {
  const params = useParams<{ slug: string }>()
  const product = getCatalogProduct(params.slug, loadCatalogProducts())

  if (!product) {
    return (
      <main dir="rtl" className="min-h-screen bg-(--crp-cream) px-4 pt-24 text-center">
        <Header back />
        <h1 className="text-2xl font-bold">این قهوه پیدا نشد</h1>
        <Link href="/catalog" className="mt-4 inline-block text-(--crp-terracotta)">
          بازگشت به کاتالوگ
        </Link>
      </main>
    )
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-(--crp-cream) px-4 pb-10 text-(--crp-espresso)"
    >
      <Header back />

      <section className="mx-auto flex max-w-5xl flex-col gap-8 pt-24 md:flex-row-reverse md:items-start">
        <div className="boxShadowMain overflow-hidden rounded-[8px] border bg-card md:w-1/2">
          <Image
            src={product.image}
            alt={product.title}
            width={900}
            height={700}
            priority
            className="h-auto w-full object-cover md:h-[520px]"
          />
        </div>

        <article className="flex flex-1 flex-col gap-5 rounded-[8px] border bg-[#fff9f0]/70 p-5 shadow-sm">
          <Link href="/catalog" className="text-sm text-(--crp-terracotta)">
            بازگشت به کاتالوگ
          </Link>

          <div>
            <p className="font-eng text-sm text-(--crp-amber)">Pal Coffee Catalog</p>
            <h1 className="mt-2 text-3xl font-bold">{product.title}</h1>
            <p className="mt-2 leading-7 text-(--crp-dark)">{product.subtitle}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.notes.map((note) => (
              <Badge key={note} variant="outline" className="rounded-full">
                {note}
              </Badge>
            ))}
          </div>

          <p className="text-justify leading-8">{product.description}</p>

          <div className="grid gap-3 sm:grid-cols-3">
            <Info label="خاستگاه" value={product.origin} />
            <Info label="برشته‌کاری" value={product.roast} />
            <Info label="فرآوری" value={product.process} />
          </div>

          <div className="rounded-[8px] border border-dashed p-4 leading-8">
            <span className="text-sm text-(--crp-terracotta)">پیشنهاد دم‌آوری</span>
            <p>{product.brewGuide}</p>
          </div>

          <div className="mt-auto flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-bold text-(--crp-terracotta)">{product.price}</span>
            <a href="tel:+989393258985">
              <Button>استعلام و سفارش</Button>
            </a>
          </div>
        </article>
      </section>
    </main>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border bg-(--crp-warm)/40 p-3">
      <span className="text-xs text-(--crp-terracotta)">{label}</span>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  )
}
