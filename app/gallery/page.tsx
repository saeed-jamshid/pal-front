"use client"

import { useEffect, useRef, useState, type MouseEventHandler } from "react"
import Image from "next/image"
import Link from "next/link"
import { IconArrowLeft, IconArrowRight, IconExternalLink, IconX } from "@tabler/icons-react"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { clampZoom, zoomAt, type Zoom } from "@/lib/zoom"

// Keep the existing selection. Originals are fetched only when a photo is opened.
const photos = Array.from({ length: 24 }, (_, index) => ({
  thumbnail: `/img/gallery/optimized/${index}.webp`,
  original: `/img/gallery/${index}.jpeg`,
}))

export default function Gallery() {
  const [active, setActive] = useState<number | null>(null)
  const opener = useRef<HTMLButtonElement | null>(null)
  const move = (delta: number) => setActive(index => index === null ? null : (index + delta + photos.length) % photos.length)

  return (
    <main className="min-h-screen bg-(--surface-100) text-(--ink)">
      <div className="ed-shell pt-28 pb-20">
        <p className="text-sm font-semibold text-(--brick)">از دورهمی‌های قبلی پَل</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-5 border-b border-(--outline) pb-6">
          <h1 className="fa-h1">چند قاب از کنار هم بودن</h1>
          <Link href="/submit" className="min-h-11 content-center text-sm underline underline-offset-4">رویدادهای پَل</Link>
        </div>
        <div className="gallery-grid mt-8 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <GalleryPhoto key={photo.thumbnail} src={photo.thumbnail} index={index} onClick={event => {
              opener.current = event.currentTarget
              document.querySelector<HTMLElement>("#public-menu")?.hidePopover()
              setActive(index)
            }} />
          ))}
        </div>
      </div>
      <Dialog open={active !== null} onOpenChange={open => { if (!open) setActive(null) }}>
        <DialogContent
          className="gallery-viewer"
          showCloseButton={false}
          aria-describedby={undefined}
          onCloseAutoFocus={event => { event.preventDefault(); opener.current?.focus() }}
          onKeyDown={event => {
            if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
            const target = event.target as HTMLElement
            if (target.closest("input, textarea, select, [contenteditable=true]")) return
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault()
              move(event.key === "ArrowRight" ? 1 : -1)
            }
          }}
        >
          <div className="gallery-viewer__heading">
            <DialogTitle>عکس‌های دورهمی پَل</DialogTitle>
            <DialogClose className="gallery-control" aria-label="بستن عکس"><IconX size={22} aria-hidden /></DialogClose>
          </div>
          {active !== null && <GalleryImage key={active} index={active} onMove={move} />}
          <div className="gallery-viewer__controls">
            <button type="button" className="gallery-control" aria-label="عکس قبلی" onClick={() => move(-1)}><IconArrowLeft size={22} aria-hidden /></button>
            <span className="gallery-count" aria-live="polite" dir="ltr">{active === null ? "" : `${active + 1} / ${photos.length}`}</span>
            <button type="button" className="gallery-control" aria-label="عکس بعدی" onClick={() => move(1)}><IconArrowRight size={22} aria-hidden /></button>
            {active !== null && <a className="gallery-control" href={photos[active].original} target="_blank" rel="noopener noreferrer" aria-label="باز کردن فایل اصلی عکس" title="فایل اصلی"><IconExternalLink size={20} aria-hidden /></a>}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}

type Point = { x: number; y: number }

function GalleryImage({ index, onMove }: { index: number; onMove: (delta: number) => void }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [retry, setRetry] = useState(0)
  const photo = photos[index]
  // Gesture state lives in refs and is written straight to the layer style: no re-render per frame.
  const layer = useRef<HTMLDivElement>(null)
  const zoom = useRef<Zoom>({ s: 1, x: 0, y: 0 })
  const points = useRef(new Map<number, Point>())
  const start = useRef<{ zoom: Zoom; a: Point; b?: Point; at: number; touch: boolean } | null>(null)
  const pinched = useRef(false)
  const lastTap = useRef<{ at: number } & Point>({ at: 0, x: 0, y: 0 })

  const rel = (event: React.PointerEvent): Point => {
    const box = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - box.left - box.width / 2, y: event.clientY - box.top - box.height / 2 }
  }
  const apply = (next: Zoom, stage: HTMLElement, animate = false) => {
    const z = (zoom.current = clampZoom(next, stage.clientWidth, stage.clientHeight))
    const el = layer.current!
    el.style.transition = animate ? "transform 200ms ease-out" : "none"
    el.style.transform = z.s === 1 ? "" : `translate3d(${z.x}px, ${z.y}px, 0) scale(${z.s})`
    stage.dataset.zoomed = String(z.s > 1)
  }
  // Re-anchor whenever the finger count changes so pinch -> pan never jumps.
  const anchor = (touch: boolean) => {
    const [a, b] = [...points.current.values()]
    start.current = a ? { zoom: zoom.current, a, b, at: performance.now(), touch } : null
  }

  return (
    <>
      <div
        className="gallery-stage"
        data-photo-index={index}
        data-zoomed="false"
        aria-busy={!loaded && !failed}
        onPointerDown={event => {
          if (event.pointerType === "mouse" && event.button !== 0) return
          event.currentTarget.setPointerCapture(event.pointerId)
          points.current.set(event.pointerId, rel(event))
          if (points.current.size === 1) pinched.current = false
          if (points.current.size > 1) pinched.current = true
          anchor(event.pointerType === "touch")
        }}
        onPointerMove={event => {
          if (!points.current.has(event.pointerId) || !start.current) return
          points.current.set(event.pointerId, rel(event))
          const [a, b] = [...points.current.values()]
          const { zoom: z0, a: a0, b: b0 } = start.current
          if (b && b0) {
            const mid = (p: Point, q: Point) => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 })
            const ratio = Math.hypot(a.x - b.x, a.y - b.y) / (Math.hypot(a0.x - b0.x, a0.y - b0.y) || 1)
            apply(zoomAt(z0, Math.max(.8, z0.s * ratio), mid(a0, b0), mid(a, b)), event.currentTarget)
          } else if (z0.s > 1) {
            apply({ s: z0.s, x: z0.x + a.x - a0.x, y: z0.y + a.y - a0.y }, event.currentTarget)
          }
        }}
        onPointerUp={event => {
          const stage = event.currentTarget
          const begin = start.current, end = rel(event)
          points.current.delete(event.pointerId)
          if (points.current.size) { apply(zoom.current, stage, true); anchor(true); return }
          start.current = null
          if (pinched.current || !begin) { apply(zoom.current, stage, true); return }
          const dx = end.x - begin.a.x, dy = end.y - begin.a.y
          // Double tap / double click toggles a 2.5x zoom at that spot.
          if (Math.hypot(dx, dy) < 10) {
            const tap = lastTap.current, now = performance.now()
            if (now - tap.at < 300 && Math.hypot(end.x - tap.x, end.y - tap.y) < 30) {
              lastTap.current = { at: 0, x: 0, y: 0 }
              apply(zoom.current.s > 1 ? { s: 1, x: 0, y: 0 } : zoomAt(zoom.current, 2.5, end), stage, true)
            } else lastTap.current = { at: now, ...end }
            return
          }
          // Swipe navigates only at normal size; when zoomed the drag was a pan.
          if (begin.touch && begin.zoom.s === 1 && zoom.current.s === 1 && Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.3) onMove(dx < 0 ? 1 : -1)
        }}
        onPointerCancel={event => {
          points.current.delete(event.pointerId)
          if (!points.current.size) start.current = null
          apply(zoom.current, event.currentTarget, true)
        }}
      >
        <div ref={layer} className="gallery-zoom">
          <Image src={photo.thumbnail} alt="" fill unoptimized sizes="100vw" draggable={false} className="gallery-preview" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element -- Original JPEG, never downscaled by the image optimizer. */}
          <img
            key={retry}
            src={photo.original}
            alt={`عکس ${index + 1} از دورهمی قبلی پَل`}
            className={`gallery-full ${loaded ? "is-loaded" : ""}`}
            data-original
            decoding="async"
            draggable={false}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        </div>
      </div>
      <div className={`gallery-image-status ${failed ? "" : "sr-only"}`} role="status">
        {failed ? <>
          <span>تصویر اصلی دریافت نشد؛ پیش‌نمایش باقی است.</span>
          <button type="button" onClick={() => { setFailed(false); setLoaded(false); setRetry(n => n + 1) }}>تلاش دوباره</button>
        </> : loaded ? "" : "در حال دریافت عکس…"}
      </div>
    </>
  )
}

function GalleryPhoto({ src, index, onClick }: { src: string; index: number; onClick: MouseEventHandler<HTMLButtonElement> }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [visible, setVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const button = ref.current
    if (!button) return
    if (!("IntersectionObserver" in window)) {
      queueMicrotask(() => setVisible(true))
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { rootMargin: "100px" })
    observer.observe(button)
    return () => observer.disconnect()
  }, [])

  return (
    <button ref={ref} type="button" onClick={onClick} aria-label={`دیدن عکس ${index + 1} از دورهمی قبلی`} className="gallery-thumbnail relative aspect-[3/4] cursor-pointer overflow-hidden bg-(--surface-200)">
      {visible && <Image src={src} alt={`عکس ${index + 1} از دورهمی قبلی پَل`} fill loading="lazy" sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} className={`object-cover transition-opacity duration-150 motion-reduce:transition-none ${loaded ? "opacity-100" : "opacity-0"}`} />}
      {failed && <span className="absolute inset-0 grid place-content-center gap-2 p-4 text-sm">پیش‌نمایش دریافت نشد.<br />باز کردن تصویر اصلی</span>}
    </button>
  )
}
