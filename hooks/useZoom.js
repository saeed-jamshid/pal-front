// hooks/useZoom.js
import { useRef, useCallback } from 'react'

export function useZoom({ scale, setScale, minScale = 1, maxScale = 4 }) {
  const lastDistance = useRef(null)
  const lastScale = useRef(scale)

  const getDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const onTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      lastDistance.current = getDistance(e.touches)
      lastScale.current = scale
    }
  }, [scale])

  const onTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const dist = getDistance(e.touches)
      const ratio = dist / lastDistance.current
      const next = Math.min(maxScale, Math.max(minScale, lastScale.current * ratio))
      setScale(next)
    }
  }, [setScale, minScale, maxScale])

  const onTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) {
      lastDistance.current = null
    }
  }, [])

  return { onTouchStart, onTouchMove, onTouchEnd }
}
