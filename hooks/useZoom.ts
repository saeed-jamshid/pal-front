import { useCallback, useEffect, useRef, useState } from "react"

export interface ZoomTransform {
  scale: number
  x: number
  y: number
}

const IDENTITY: ZoomTransform = { scale: 1, x: 0, y: 0 }

/**
 * Pinch-zoom + pan for a single element, built on Pointer Events.
 *
 * Why pointer events and a manual listener:
 * React's onTouchMove is registered passively, so calling preventDefault()
 * inside it is ignored and the browser keeps its own page zoom/scroll. The
 * touchmove listener must be attached with { passive: false } on the real
 * node to suppress that. Pointer events additionally unify mouse/touch/pen
 * and give us implicit capture, so a finger leaving the element mid-gesture
 * doesn't strand the transform.
 */
export function useZoom({
  minScale = 1,
  maxScale = 4,
  doubleTapScale = 2,
}: {
  minScale?: number
  maxScale?: number
  doubleTapScale?: number
} = {}) {
  const [transform, setTransform] = useState<ZoomTransform>(IDENTITY)
  const ref = useRef<HTMLDivElement | null>(null)

  // Live pointers, keyed by pointerId
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  // Gesture baseline captured when the 2nd finger lands
  const start = useRef<{ dist: number; scale: number; x: number; y: number; cx: number; cy: number } | null>(null)
  // Single-finger pan baseline
  const pan = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const lastTap = useRef(0)

  // Mirror of `transform` for use inside event handlers and native listeners
  // without re-subscribing them on every frame.
  const transformRef = useRef(transform)
  useEffect(() => {
    transformRef.current = transform
  }, [transform])

  const reset = useCallback(() => setTransform(IDENTITY), [])

  const clamp = useCallback(
    (t: ZoomTransform, el: HTMLElement | null): ZoomTransform => {
      const scale = Math.min(maxScale, Math.max(minScale, t.scale))
      if (scale <= 1 || !el) return { scale, x: 0, y: 0 }
      // Keep the image from being dragged entirely out of view
      const r = el.getBoundingClientRect()
      const maxX = ((scale - 1) * r.width) / 2
      const maxY = ((scale - 1) * r.height) / 2
      return {
        scale,
        x: Math.min(maxX, Math.max(-maxX, t.x)),
        y: Math.min(maxY, Math.max(-maxY, t.y)),
      }
    },
    [minScale, maxScale],
  )

  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y)

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    e.currentTarget.setPointerCapture?.(e.pointerId)

    const pts = [...pointers.current.values()]

    if (pts.length === 2) {
      const t = transformRef.current
      start.current = {
        dist: dist(pts[0], pts[1]),
        scale: t.scale,
        x: t.x,
        y: t.y,
        cx: (pts[0].x + pts[1].x) / 2,
        cy: (pts[0].y + pts[1].y) / 2,
      }
      pan.current = null
      return
    }

    if (pts.length === 1) {
      const t = transformRef.current
      // Pan only matters while zoomed in; otherwise let the swipe handler work
      pan.current = t.scale > 1 ? { x: e.clientX, y: e.clientY, tx: t.x, ty: t.y } : null

      // Double-tap toggles zoom
      const now = Date.now()
      if (now - lastTap.current < 300) {
        lastTap.current = 0
        setTransform((cur) =>
          cur.scale > 1 ? IDENTITY : clamp({ scale: doubleTapScale, x: 0, y: 0 }, ref.current),
        )
      } else {
        lastTap.current = now
      }
    }
  }, [clamp, doubleTapScale])

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pointers.current.has(e.pointerId)) return
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      const pts = [...pointers.current.values()]

      if (pts.length >= 2 && start.current) {
        const s = start.current
        const ratio = dist(pts[0], pts[1]) / (s.dist || 1)
        const cx = (pts[0].x + pts[1].x) / 2
        const cy = (pts[0].y + pts[1].y) / 2
        setTransform(
          clamp(
            {
              scale: s.scale * ratio,
              x: s.x + (cx - s.cx),
              y: s.y + (cy - s.cy),
            },
            ref.current,
          ),
        )
        return
      }

      if (pts.length === 1 && pan.current) {
        const p = pan.current
        setTransform((cur) =>
          clamp({ scale: cur.scale, x: p.tx + (e.clientX - p.x), y: p.ty + (e.clientY - p.y) }, ref.current),
        )
      }
    },
    [clamp],
  )

  const endPointer = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) start.current = null
    if (pointers.current.size === 0) pan.current = null
    // Snap back if the user pinched below 1x
    setTransform((cur) => (cur.scale <= 1 ? IDENTITY : cur))
  }, [])

  // touchmove must be non-passive to stop the browser's native page zoom
  // while a pinch is in progress on this element.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const block = (ev: TouchEvent) => {
      if (ev.touches.length >= 2 || transformRef.current.scale > 1) ev.preventDefault()
    }
    el.addEventListener("touchmove", block, { passive: false })
    return () => el.removeEventListener("touchmove", block)
  }, [])

  const zoomed = transform.scale > 1

  return {
    ref,
    transform,
    zoomed,
    reset,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
    },
  }
}
