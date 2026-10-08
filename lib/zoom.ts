// Photo viewer zoom math. Coordinates are relative to the stage centre;
// the layer is drawn as translate(x, y) scale(s) around that centre.
export type Zoom = { s: number; x: number; y: number }
export const MAX_ZOOM = 4

/** Keep scale in [1, MAX_ZOOM] and never pan past the stage edges. */
export function clampZoom({ s, x, y }: Zoom, w: number, h: number): Zoom {
  s = Math.min(MAX_ZOOM, Math.max(1, s))
  const mx = ((s - 1) * w) / 2, my = ((s - 1) * h) / 2
  return { s, x: Math.min(mx, Math.max(-mx, x)) || 0, y: Math.min(my, Math.max(-my, y)) || 0 }
}

/** Scale to `s` so the content under `from` (at zoom `z`) ends up under `to`. */
export function zoomAt(z: Zoom, s: number, from: { x: number; y: number }, to = from): Zoom {
  const cx = (from.x - z.x) / z.s, cy = (from.y - z.y) / z.s
  return { s, x: to.x - s * cx, y: to.y - s * cy }
}
