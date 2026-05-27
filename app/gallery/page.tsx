"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import Image from "next/image"
import { Download, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog"
import Header from "@/components/layout/Header"
import { s } from "../styles"
import  MinimalVideoPlayer  from "@/components/player"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GalleryImage {
  id: number
  src: string // e.g. "/gallery/1.jpg"
  alt: string
  label?: string
}

// ─── Tile sizes ───────────────────────────────────────────────────────────────

type TileSize = { col: 1 | 2; row: 1 | 2 }

const TILE_POOL: TileSize[] = [
  { col: 1, row: 1 },
  { col: 1, row: 1 },
  { col: 1, row: 1 },
  { col: 1, row: 1 },
  { col: 1, row: 2 }, // tall
  { col: 1, row: 2 }, // tall
  { col: 2, row: 1 }, // wide
  { col: 2, row: 2 }, // big (rare)
]

// function pickTiles(count: number, seed: number): TileSize[] {
//   return Array.from({ length: count }, (_, i) => {
//     const idx = Math.abs((seed * 31 + i * 17) % TILE_POOL.length)
//     return TILE_POOL[idx]
//   })
// }
function pickTiles(count: number, seed: number): TileSize[] {
  return Array.from({ length: count }, (_, i) => {
    if (i === 14) return { col: 2, row: 1 } // will be overridden by col-span-full on mobile
    const idx = Math.abs((seed * 31 + i * 17) % TILE_POOL.length)
    return TILE_POOL[idx]
  })
}

const COL_SPAN = { 1: "col-span-1", 2: "col-span-2" } as const
const ROW_SPAN = { 1: "row-span-1", 2: "row-span-2" } as const
const ROW_HEIGHT = 200

// ─── Helpers ──────────────────────────────────────────────────────────────────

function downloadImage(src: string, filename: string) {
  const a = document.createElement("a")
  a.href = src
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-")
}

function shuffleArr<T>(arr: T[], seed: number): T[] {
  const next = [...arr]
  let random = seed
  for (let i = next.length - 1; i > 0; i--) {
    random = (random * 9301 + 49297) % 233280
    const j = Math.floor((random / 233280) * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

// ─── Grid item ────────────────────────────────────────────────────────────────

function GridItem({
  image,
  tile,
  onClick,
  forceFullRow = false,
}: {
  image: GalleryImage
  tile: TileSize
  onClick: () => void
  forceFullRow?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "300px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={[
        forceFullRow ? "col-span-full! md:col-span-3!" : COL_SPAN[tile.col],
        ROW_SPAN[tile.row],
        "group relative cursor-pointer overflow-hidden rounded-md bg-muted",
      ].join(" ")}
      onClick={onClick}
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted-foreground/10" />
      )}
      {visible && (
        <Image
          src={image.src}
          alt="Pal_image"
          fill
          sizes={tile.col === 2 ? "50vw" : "75vw"}
          className={[
            "object-cover transition-all duration-500",
            loaded ? "scale-100 opacity-100" : "scale-105 opacity-0",
            "group-hover:scale-105 group-hover:brightness-75",
          ].join(" ")}
          onLoad={() => setLoaded(true)}
        />
      )}
      <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/70 via-black/20 to-transparent p-3 transition-opacity duration-300 group-hover:opacity-100 md:opacity-0">
        {image.label && (
          <p className="mb-2 line-clamp-2 text-sm leading-tight font-medium text-white">
            {image.label}
          </p>
        )}
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 self-start border border-white/20 bg-white/25 text-white backdrop-blur-sm hover:bg-white/25 lg:bg-white/25"
          onClick={(e) => {
            e.stopPropagation()
            downloadImage(image.src, `${slugify(image.label ?? image.alt)}.jpg`)
          }}
          aria-label="Download"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  images,
  index,
  open,
  onClose,
  onNavigate,
}: {
  images: GalleryImage[]
  index: number
  open: boolean
  onClose: () => void
  onNavigate: (dir: -1 | 1) => void
}) {
  const current = images[index]
  const [loadingD, setLoadingD] = useState(true)

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === "ArrowLeft") onNavigate(-1)
      if (e.key === "ArrowRight") onNavigate(1)
    },
    [open, onNavigate]
  )
  useEffect(() => {
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [handleKey])

  if (!current) return null
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="box-shadow-none w-full max-w-lg gap-0 overflow-hidden bg-transparent p-0 px-2 shadow-none ring-0 backdrop-blur-none outline-none">
        <DialogTitle />
        <div className="relative mb-5 flex items-center justify-between rounded-xl border-b border-none border-white/10 bg-white/5 px-4 py-4 backdrop-blur-3xl">
          <div className="flex items-center">
            <Button
              size="sm"
              className="h-8 gap-1.5 text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() =>
                downloadImage(
                  current.src,
                  `${slugify(current.label ?? current.alt)}.jpg`
                )
              }
            >
              <Download className="h-4 w-4" />
              دانلود
            </Button>
            <DialogClose asChild></DialogClose>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <Button
            size="icon"
            className="absolute top-1/2 left-1 z-10 h-10 w-10 border-2 text-white"
            onClick={() => onNavigate(-1)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="relative aspect-3/4 w-full">
            {!loadingD && (
              <div className="absolute inset-0 size-full animate-pulse rounded-xl bg-gray-200/50 backdrop-blur-2xl" />
            )}
            <Image
              key={current.id}
              src={current.src}
              alt={current.alt}
              fill
              sizes="100vw"
              loading="eager"
              className="absolute animate-in rounded-xl object-cover duration-200 fade-in-0 zoom-in-95"
              onLoad={() => setLoadingD(false)}
            />
          </div>
          <Button
            size="icon"
            className="absolute top-1/2 right-1 z-10 h-10 w-10 border-2 text-white backdrop-blur-3xl"
            onClick={() => onNavigate(1)}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

export default function Gallery() {
  const images: GalleryImage[] = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        src: `/img/gallery/${i}.jpeg`,
        alt: `Photo ${i}`,
        eventId: 1,
      })),
    []
  )

  const [seed] = useState(() => Math.floor(Math.random() * 100000))
  const [isShuffled, setIsShuffled] = useState(true)
  const [shuffleKey] = useState(() => Math.floor(Math.random() * 10000))
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [heroLoading, setHeroLoading] = useState(true)
  const [videoOpen, setVideoOpen] = useState(false)
  // full-array shuffle so hero can be random too (stable per page load via `seed`)
  const displayed = useMemo(() => {
    if (images.length === 0) return []
    return isShuffled ? shuffleArr(images, seed) : images
  }, [images, isShuffled, seed])

  const tiles = useMemo(
    () => pickTiles(Math.max(0, displayed.length - 1), shuffleKey),
    [displayed.length, shuffleKey]
  )

  const title = useMemo(() => {
    const choices = ["Pal", "PalCoffee", "Brewed Moments", "Pal’s Roast"]
    return choices[seed % choices.length]
  }, [seed])

  const hero = displayed[0] ?? null
  const grid = displayed.slice(1)

  function openAt(idx: number) {
    setActiveIndex(idx)
    setLightboxOpen(true)
  }

  function navigate(dir: -1 | 1) {
    setActiveIndex((prev) => (prev + dir + displayed.length) % displayed.length)
  }

  return (
    <div
      style={s.page}
      className="mx-auto max-w-4xl space-y-3 bg-accent-foreground"
    >
      <Header back />
      {/* ── Hero ── */}
      {hero && (
        <div
          className="group relative mt-20 w-full cursor-pointer overflow-hidden rounded-lg"
          style={{ height: ROW_HEIGHT * 2.5 }}
          onClick={() => openAt(0)}
        >
          {!heroLoading && (
            <div className="absolute inset-0 animate-pulse bg-muted-foreground/10" />
          )}
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            sizes="100vw"
            className={[
              "object-cover transition-all duration-500",
              !heroLoading ? "scale-100 opacity-100" : "scale-115 opacity-0",
              "group-hover:scale-105 group-hover:brightness-75",
            ].join(" ")}
            priority
            quality={100}
            onLoad={() => setHeroLoading(false)}
          />
          {!heroLoading && (
            <h1
              className={[
                "pal-text absolute top-1/2 left-0 object-cover text-background transition-all duration-500",
                !heroLoading ? "opacity-100" : "opacity-0",
                "pal-text",
              ].join(" ")}
            >
              {title}
            </h1>
          )}
          <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/70 via-black/10 to-transparent p-5 transition-opacity duration-300 group-hover:opacity-100 md:opacity-0">
            <p className="mb-2 text-base font-medium text-white">
              {title} Gallery
            </p>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 self-start border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/25"
              onClick={(e) => {
                e.stopPropagation()
                downloadImage(
                  hero.src,
                  `${slugify(hero.label ?? hero.alt)}.jpg`
                )
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {/* ── Mosaic grid ── */}
      {grid.length > 0 && (
        <div
          className="grid w-full grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
          style={{
            gridAutoRows: `${ROW_HEIGHT}px`,
            gridAutoFlow: "dense",
          }}
        >
          {grid.map((img, i) => (
            <GridItem
              key={img.id}
              image={img}
              tile={tiles[i] ?? { col: 1, row: 1 }}
              onClick={() => openAt(i + 1)}
              forceFullRow={img.id === 14}
            />
          ))}
        </div>
      )}
      {/* ── Vertical Video ── */}
      <div
        className="group relative w-full cursor-pointer overflow-hidden rounded-lg sm:w-95"
        style={{ aspectRatio: "9/16", maxHeight: 700 }}
      >
        <MinimalVideoPlayer src="/img/gallery/pal.mp4" />
      </div>
      {/* ── Lightbox ── */}
      <Lightbox
        images={displayed}
        index={activeIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={navigate}
      />
    </div>
  )
}
