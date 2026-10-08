// Real-touch checks for the gallery viewer: pinch, pan, clamp, double tap, swipe. PAL_ORIGIN / O = server.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core')
const assert = require('node:assert/strict')
const O = process.env.O || 'http://localhost:3000'; let n = 0
const ok = (name, v) => { assert.ok(v, name); n++; console.log('PASS', name) }
const delay = ms => new Promise(r => setTimeout(r, ms))
;(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium' })
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })
  const page = await ctx.newPage(); const cdp = await ctx.newCDPSession(page)
  const touch = async (frames) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: frames[0] })
    for (const f of frames.slice(1)) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: f }); await delay(16) }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await delay(260)
  }
  const box = async () => page.locator('.gallery-stage').boundingBox()
  const z = () => page.locator('.gallery-zoom').evaluate(e => { const m = new DOMMatrix(getComputedStyle(e).transform); return { s: +m.a.toFixed(2), x: Math.round(m.e), y: Math.round(m.f) } })
  const idx = () => page.locator('.gallery-stage').getAttribute('data-photo-index')
  await page.goto(O + '/gallery', { waitUntil: 'networkidle' })
  await page.locator('.gallery-thumbnail').first().tap()
  await page.locator('.gallery-stage').waitFor(); await delay(400)
  ok('no full-res / original text', !(await page.locator('.gallery-viewer').innerText()).match(/وضوح کامل|تصویر اصلی/))
  const link = page.locator('.gallery-viewer a[href="/img/gallery/0.jpeg"]')
  ok('original link icon-only with label', (await link.innerText()).trim() === '' && await link.getAttribute('aria-label') === 'باز کردن فایل اصلی عکس')
  const r = await box(), cx = r.x + r.width / 2, cy = r.y + r.height / 2
  const steps = (f) => [0, .2, .4, .6, .8, 1].map(f)
  // pinch out from 60px apart to 180px apart
  await touch(steps(t => [{ x: cx - 30 - 60 * t, y: cy, id: 1 }, { x: cx + 30 + 60 * t, y: cy, id: 2 }]))
  let s = await z(); ok(`pinch zooms (${s.s}x)`, s.s > 2.5 && s.s <= 4)
  ok('pinch does not zoom the page', await page.evaluate(() => visualViewport.scale) === 1)
  // pan while zoomed: drag left must pan, not navigate
  await touch(steps(t => [{ x: cx + 60 - 160 * t, y: cy, id: 3 }]))
  const p = await z(); ok('one-finger drag pans when zoomed', p.x < s.x - 50)
  ok('drag when zoomed does not navigate', await idx() === '0')
  // huge drag clamps to edges
  for (let i = 0; i < 4; i++) await touch(steps(t => [{ x: cx + 150 - 300 * t, y: cy, id: 4 }]))
  const c = await z(); ok('pan is clamped to edges', Math.abs(c.x) <= (c.s - 1) * r.width / 2 + 1)
  // pinch in below 1 -> snaps to 1
  await touch(steps(t => [{ x: cx - 150 + 130 * t, y: cy, id: 5 }, { x: cx + 150 - 130 * t, y: cy, id: 6 }]))
  ok('pinch in snaps back to 1x', (await z()).s === 1)
  // double tap toggles
  for (let i = 0; i < 2; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx + 40, y: cy, id: 7 + i }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await delay(120) }
  await delay(600); ok('double tap zooms 2.5x', (await z()).s === 2.5)
  for (let i = 0; i < 2; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 9 + i }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await delay(120) }
  await delay(600); ok('double tap again resets', (await z()).s === 1)
  // swipe at 1x still navigates both ways, vertical does not
  await touch(steps(t => [{ x: cx + 50 - 100 * t, y: cy, id: 11 }])); ok('swipe left -> next', await idx() === '1')
  ok('new photo starts unzoomed', (await z()).s === 1)
  await touch(steps(t => [{ x: cx - 50 + 100 * t, y: cy, id: 12 }])); ok('swipe right -> previous', await idx() === '0')
  await touch(steps(t => [{ x: cx, y: cy - 50 + 100 * t, id: 13 }])); ok('vertical swipe no nav', await idx() === '0')
  await page.screenshot({ path: '/tmp/pal-nav/gallery-viewer.png' })
  await page.keyboard.press('Escape'); await delay(300)
  ok('Escape closes viewer', await page.locator('.gallery-stage').count() === 0)
  // desktop mouse: double click zooms, drag pans
  const d = await b.newPage({ viewport: { width: 1280, height: 900 } })
  await d.goto(O + '/gallery', { waitUntil: 'networkidle' }); await d.locator('.gallery-thumbnail').first().click(); await d.locator('.gallery-stage').waitFor(); await delay(300)
  const R = await d.locator('.gallery-stage').boundingBox()
  await d.mouse.dblclick(R.x + R.width / 2, R.y + R.height / 2); await delay(300)
  const zd = await d.locator('.gallery-zoom').evaluate(e => new DOMMatrix(getComputedStyle(e).transform).a)
  ok('mouse double click zooms', zd === 2.5)
  await d.keyboard.press('ArrowLeft'); await delay(200)
  ok('arrow keys still navigate', await d.locator('.gallery-stage').getAttribute('data-photo-index') === '23')
  console.log(n, 'zoom checks passed'); await b.close()
})().catch(e => { console.error(e); process.exit(1) })
