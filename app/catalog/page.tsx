"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Header from "@/components/layout/Header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { loadCatalogProducts, type CatalogProduct } from "@/lib/catalog"

export default function CatalogPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([])

  useEffect(() => {
    const sync = () => setProducts(loadCatalogProducts())
    sync()
    window.addEventListener("storage", sync)
    window.addEventListener("catalog-products-updated", sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener("catalog-products-updated", sync)
    }
  }, [])

  return (
    <main dir="rtl" className="min-h-screen overflow-hidden bg-(--crp-cream) text-(--crp-espresso)">
      <Header back />

      <section className="mx-auto px-4 pt-24 lg:max-w-6xl">
        <div className="boxShadowMain overflow-hidden rounded-xl border bg-[#f8eee4] lg:grid lg:min-h-[620px] lg:grid-cols-3">
          <BrochurePanel className="bg-[#f6e3e1] lg:order-3">
            <p className="text-xs font-bold tracking-[0.25em] text-(--crp-terracotta)">PAL COFFEE</p>
            <h1 className="mt-4 text-4xl leading-[1.15] font-black sm:text-5xl">
              روزت رو با یک فنجان خوب شروع کن
            </h1>
            <Image
              src="/img/pal_chair.png"
              alt="دوست‌هایی که کنار هم قهوه می‌نوشند"
              width={1200}
              height={700}
              priority
              className="mt-auto h-64 w-full object-contain object-bottom"
            />
            <p className="rounded-2xl bg-(--crp-terracotta) px-5 py-4 text-sm leading-7 text-(--crp-cream)">
              قهوه برای عجله نیست؛ برای مکث کردن، حرف زدن و ساختن یک لحظه خوبه.
            </p>
          </BrochurePanel>

          <BrochurePanel className="bg-(--crp-cream) lg:order-2 lg:border-x">
            <h2 className="text-3xl leading-tight font-black text-(--crp-dark)">
              چیزی که ما به فنجان می‌آریم
            </h2>
            <p className="mt-5 text-justify text-sm leading-8 text-(--crp-dark)">
              از انتخاب دانه تا برشته‌کاری و دم‌آوری، هر مرحله با حوصله انجام می‌شه.
              نتیجه برای ما فقط یک نوشیدنی نیست؛ یک تجربه ساده، صمیمی و به‌یادموندنیه.
            </p>
            <Image
              src="/img/pal_machine.png"
              alt="فرآیند آماده‌سازی قهوه پَل"
              width={1535}
              height={619}
              className="my-auto w-full object-contain"
            />
            <p className="font-eng text-center text-xl text-(--crp-terracotta)">Slow down. Sip better.</p>
          </BrochurePanel>

          <BrochurePanel className="bg-[#edf1e8] lg:order-1">
            <Image
              src="/img/pal_people2.png"
              alt="کشاورزان و همراهان قهوه پَل"
              width={1400}
              height={960}
              className="h-72 w-full object-contain object-bottom"
            />
            <div className="mt-auto">
              <h2 className="text-3xl font-black text-(--crp-dark)">با ما در تماس باش</h2>
              <div className="mt-5 flex flex-col gap-3 text-center text-sm">
                <a className="rounded-full bg-(--crp-sage)/35 px-4 py-3" href="tel:+989393258985">
                  ۰۹۳۹۳۲۵۸۹۸۵
                </a>
                <a className="rounded-full bg-(--crp-sage)/35 px-4 py-3" href="https://palcoffee.ir">
                  palcoffee.ir
                </a>
              </div>
            </div>
          </BrochurePanel>
        </div>
      </section>


      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="mb-10 flex flex-col items-center text-center">
          <p className="font-eng text-sm text-(--crp-amber)">Choose your coffee</p>
          <h2 className="mt-2 text-4xl font-black">قهوه‌های پَل</h2>
          <p className="mt-4 max-w-xl leading-7 text-(--crp-dark)">
            هر قهوه شخصیت خودش رو داره؛ نت‌های طعمی رو ببین و فنجان خودت رو پیدا کن.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {products.map((product, index) => (
            <motion.article
              key={product.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.08 }}
              className="group flex overflow-hidden rounded-2xl border bg-(--crp-cream) shadow-[8px_8px_0_var(--crp-sand)] transition hover:-translate-y-1"
            >
              <Link href={`/catalog/${product.slug}`} className="flex w-full flex-col">
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <Badge className="absolute top-4 right-4 rounded-full bg-(--crp-cream) text-(--crp-terracotta)">
                    {product.roast}
                  </Badge>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-xl font-black">{product.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-(--crp-dark)">{product.subtitle}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {product.notes.map((note) => (
                      <span key={note} className="rounded-full bg-(--crp-warm) px-3 py-1 text-xs">
                        {note}
                      </span>
                    ))}
                  </div>
                  <span className="mt-6 font-bold text-(--crp-terracotta)">دیدن جزئیات ←</span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <a href="tel:+989393258985">
            <Button size="lg" className="rounded-full px-8">مشاوره و سفارش</Button>
          </a>
        </div>
      </section>
    </main>
  )
}

function BrochurePanel({ className, children }: { className: string; children: React.ReactNode }) {
  return <article className={`flex min-h-[560px] flex-col gap-5 p-7 ${className}`}>{children}</article>
}
