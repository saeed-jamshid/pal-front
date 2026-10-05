"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

const photos = Array.from({ length: 24 }, (_, i) => `/img/gallery/optimized/${i}.webp`)

export default function Gallery() {
  const [active, setActive] = useState<number | null>(null)
  return (
    <main className="min-h-screen bg-(--crp-cream) text-(--crp-espresso)">
      <div className="ed-shell pt-28 pb-20">
        <p className="text-sm font-semibold text-(--crp-terracotta)">از دورهمی‌های قبلی پَل</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-5 border-b border-(--crp-sand) pb-7"><h1 className="t-h1">چند قاب از کنار هم بودن</h1><Link href="/submit" className="min-h-11 content-center text-sm underline underline-offset-4">رویدادهای پَل</Link></div>
        <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {photos.map((src, i) => <GalleryPhoto key={src} src={src} index={i} onClick={() => setActive(i)} />)}
        </div>
      </div>
      <Dialog open={active !== null} onOpenChange={open => { if (!open) setActive(null) }}>
        <DialogContent className="max-w-[min(90vw,700px)] border-none bg-(--crp-espresso) p-4 text-(--crp-cream) sm:max-w-[min(90vw,700px)]">
          <DialogTitle className="sr-only">عکس‌های دورهمی قبلی پَل</DialogTitle>
          {active !== null && <><div className="relative h-[min(75dvh,750px)]"><Image src={photos[active]} alt={`عکس ${active + 1} از دورهمی قبلی پَل`} fill sizes="90vw" className="object-contain" /></div><div className="flex items-center justify-between gap-4 text-sm"><button className="min-h-11 cursor-pointer underline underline-offset-4" onClick={() => setActive((active + photos.length - 1) % photos.length)}>قبلی</button><span>{active + 1} / {photos.length}</span><button className="min-h-11 cursor-pointer underline underline-offset-4" onClick={() => setActive((active + 1) % photos.length)}>بعدی</button></div></>}
        </DialogContent>
      </Dialog>
    </main>
  )
}

function GalleryPhoto({ src, index, onClick }: { src: string; index: number; onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [visible, setVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    if (!('IntersectionObserver' in window)) {
      queueMicrotask(() => setVisible(true))
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '100px' })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <button ref={ref} type="button" onClick={onClick} aria-label={`دیدن عکس ${index + 1} از دورهمی قبلی`} className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-(--crp-warm) focus-visible:outline-2 focus-visible:outline-(--crp-terracotta)">
      {!loaded && <span aria-hidden="true" className="absolute inset-0 animate-pulse bg-(--crp-sand) motion-reduce:animate-none" />}
      {visible && <Image src={src} alt={`عکس ${index + 1} از دورهمی قبلی پَل`} fill loading="lazy" sizes="(max-width: 768px) 50vw, 25vw" onLoad={() => setLoaded(true)} className={`object-cover transition-[opacity,transform] duration-500 motion-reduce:transition-none hover:scale-[1.02] ${loaded ? 'opacity-100' : 'opacity-0'}`} />}
    </button>
  )
}
