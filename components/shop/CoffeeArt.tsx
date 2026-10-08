"use client"

import { useEffect, useId, useRef } from "react"
import CoffeeBranch from "@/components/landing/CoffeeBranch"
import { CATEGORY_LABELS, ROAST_LABELS, type Product } from "@/lib/shop"

const COLORS = ["var(--saffron)", "var(--brick)", "var(--cistern)", "var(--roast)", "var(--ink-muted)"]
const POUCH = "M16 0H234Q250 0 250 16V326Q250 340 236 340H14Q0 340 0 326V16Q0 0 16 0Z"

/** Supplied PAL pouch composition, filled only with this coffee's backend facts. */
export default function CoffeeArt({ product, className = "" }: { product: Product; className?: string }) {
  const ref = useRef<SVGSVGElement>(null)
  const clip = useId()
  const layout = product.id % 5
  const name = product.title.split(" / ")[0]
  const process = product.title.split(" / ").slice(1).join(" / ")
  const notes = product.tastingNotes?.slice(0, 3).join(" · ")
  const roast = product.roastLevel && ROAST_LABELS[product.roastLevel]

  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    let animations: Animation[] = []
    const stop = () => {
      animations.forEach((a) => a.cancel())
      animations = []
    }
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      if (!media.matches) {
        svg.querySelectorAll(".bag-line, .branch-line").forEach((line) => {
          animations.push(line.animate([{ strokeDasharray: "1", strokeDashoffset: "1" }, { strokeDasharray: "1", strokeDashoffset: "0" }], { duration: 900, easing: "ease-out" }))
        })
        svg.querySelectorAll(".bag-motif, .branch-leaf").forEach((shape) => {
          animations.push(shape.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, easing: "ease-out" }))
        })
      }
      io.disconnect()
    }, { threshold: .1 })
    io.observe(svg)
    media.addEventListener("change", stop)
    return () => {
      io.disconnect(); stop()
      media.removeEventListener("change", stop)
    }
  }, [product.id])

  // ponytail: finite printed label area; dense names use smaller type, full card heading stays >=14px.
  const fontSize = name.length > 60 ? 6 : name.length > 35 ? 11 : 15
  const flip = layout === 1 || layout === 2
  return (
    <svg ref={ref} viewBox="0 0 310 370" aria-hidden="true" className={`coffee-art ${className}`}>
      <defs><clipPath id={clip}><path d={POUCH} /></clipPath></defs>
      <g transform="translate(30 12)">
        <path d={POUCH} fill="var(--surface-100)" />
        <g clipPath={`url(#${clip})`}>
          <g className="bag-motif">
            {layout === 0 && <><circle cx="22" cy="58" r="64" fill={COLORS[0]} /><circle cx="256" cy="196" r="58" fill={COLORS[1]} /></>}
            {layout === 1 && <><circle cx="240" cy="40" r="70" fill={COLORS[2]} /><path d="M-4 176A54 54 0 0 1-4 284Z" fill={COLORS[0]} /></>}
            {layout === 2 && <><circle cx="-6" cy="150" r="60" fill={COLORS[1]} /><circle cx="34" cy="122" r="34" fill={COLORS[0]} /><circle cx="230" cy="30" r="40" fill={COLORS[0]} /></>}
            {layout === 3 && <><path d="M29-2A96 96 0 0 0 221-2Z" fill={COLORS[0]} /><circle cx="260" cy="250" r="52" fill={COLORS[3]} /></>}
            {layout === 4 && <><circle cx="30" cy="34" r="46" fill={COLORS[1]} /><circle cx="74" cy="40" r="30" fill={COLORS[0]} /><circle cx="254" cy="170" r="44" fill={COLORS[2]} /></>}
          </g>
          <circle className="bag-line bag-orbit" pathLength="1" cx={[58, 190, 14, 165, 240][layout]} cy={[40, 62, 150, 30, 170][layout]} r={[52, 46, 78, 60, 62][layout]} fill="none" stroke="var(--ink)" strokeWidth="1.2" />
          <rect width="250" height="30" fill="var(--ink)" opacity=".035" />
          <path className="bag-line" pathLength="1" d="M10 40H240" stroke="var(--ink-muted)" strokeWidth="2" />
          <text x="125" y="86" textAnchor="middle" className="bag-brand" direction="ltr">PAL</text>
          <text x="125" y="102" textAnchor="middle" className="bag-subbrand" direction="ltr">COFFEE ROASTERS</text>
          <rect x="62" y="120" width="126" height="150" fill="var(--surface-300)" />
          <foreignObject x="70" y="127" width="110" height="136">
            <div className="bag-label" dir="rtl">
              <span className="bag-category">{CATEGORY_LABELS[product.category] ?? product.categoryName}</span>
              <strong className="bag-label__name" dir="ltr" style={{ fontSize }}>{name}</strong>
              {process && <span className="bag-process" dir="ltr">{process}</span>}
              {product.region && <span>{product.region}</span>}
              {notes && <span className="bag-notes">{notes}</span>}
              {roast && <span>رست {roast}</span>}
            </div>
          </foreignObject>
          <g transform={`translate(${flip ? 256 : -6} 348)`}>
            <g className="bag-branch"><CoffeeBranch flip={flip} /></g>
          </g>
        </g>
        <path className="bag-line bag-outline" pathLength="1" d={POUCH} fill="none" stroke="var(--ink)" strokeWidth="1.2" />
        <path d="M0 22l7 3-7 3Z M250 22l-7 3 7 3Z" fill="var(--surface-200)" />
      </g>
    </svg>
  )
}
