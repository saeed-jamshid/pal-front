import { test } from "node:test"
import assert from "node:assert/strict"
import { clampZoom, zoomAt } from "./zoom"

test("zoom keeps the pinched point under the fingers and stays in bounds", () => {
  const z = zoomAt({ s: 1, x: 0, y: 0 }, 2, { x: 50, y: -20 })
  assert.deepEqual(z, { s: 2, x: -50, y: 20 }) // content point (50,-20) still at (50,-20)
  assert.deepEqual(clampZoom({ s: 2, x: -500, y: 999 }, 400, 300), { s: 2, x: -200, y: 150 })
  assert.deepEqual(clampZoom({ s: .5, x: 30, y: 30 }, 400, 300), { s: 1, x: 0, y: 0 })
  assert.equal(clampZoom({ s: 9, x: 0, y: 0 }, 400, 300).s, 4)
  // panning while pinching: the midpoint moves, content follows it
  assert.deepEqual(zoomAt({ s: 2, x: 0, y: 0 }, 2, { x: 0, y: 0 }, { x: 10, y: 5 }), { s: 2, x: 10, y: 5 })
})
