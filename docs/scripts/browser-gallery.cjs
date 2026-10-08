/* eslint-disable @typescript-eslint/no-require-imports -- standalone local browser check */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const origin = process.env.PAL_ORIGIN || 'http://localhost:3005'
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin).hostname))
const out = process.env.PAL_EVIDENCE_DIR || '/tmp/pal-gallery'
fs.mkdirSync(out, { recursive: true })
const checks = [], errors = []
const check = (name, ok) => { assert.ok(ok, name); checks.push(name); console.log('PASS', name) }
const delay = ms => new Promise(r => setTimeout(r, ms))
const index = page => page.locator('.gallery-stage').getAttribute('data-photo-index')
async function waitIndex(page, n) { await page.waitForFunction(n => document.querySelector('.gallery-stage')?.dataset.photoIndex === String(n), n) }
async function swipe(page, dx, dy, multi = false) {
  const client = await page.context().newCDPSession(page)
  const box = await page.locator('.gallery-stage').boundingBox()
  const x = box.x + box.width * .6, y = box.y + box.height * .4
  const points = (delta = 0) => multi ? [{ x: x + delta * 80, y, id: 1 }, { x: x - 60 - delta * 80, y: y + 40, id: 2 }] : [{ x: x + dx * delta, y: y + dy * delta, id: 1 }]
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points() })
  for (const step of [.2, .4, .6, .8, 1]) { await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points(step) }); await delay(16) }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  if (multi) await client.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 })
  await client.detach()
  await delay(180)
}
;(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium' })
  try {
    for (const width of [375, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width === 375, isMobile: width === 375 })
      page.on('pageerror', e => errors.push(String(e)))
      const originals = [], thumbs = new Set()
      page.on('request', request => {
        const url = new URL(request.url())
        if (/\/img\/gallery\/\d+\.jpeg$/.test(url.pathname)) originals.push(url.pathname)
        const image = url.searchParams.get('url') || url.pathname
        if (/\/img\/gallery\/optimized\/\d+\.webp$/.test(image)) thumbs.add(image)
      })
      let release
      const held = new Promise(resolve => { release = resolve })
      await page.route('**/img/gallery/0.jpeg', async route => { await held; await route.continue() }, { times: 1 })
      await page.goto(origin + '/gallery')
      await page.locator('.gallery-thumbnail img').first().waitFor()
      await delay(400)
      check(`24 thumbnail frames @${width}`, await page.locator('.gallery-thumbnail').count() === 24)
      check(`near-viewport thumbnail requests only @${width}`, thumbs.size > 0 && thumbs.size < 24)
      check(`no original before open @${width}`, originals.length === 0)
      await page.screenshot({ path: `${out}/grid-${width}.png` })
      const first = page.locator('.gallery-thumbnail').first()
      await first.click()
      await waitIndex(page, 0)
      check(`preview while original pending @${width}`, await page.locator('.gallery-preview').isVisible() && await page.locator('.gallery-stage').getAttribute('aria-busy') === 'true')
      check(`navigation hidden behind viewer @${width}`, await page.locator('.nav-brand').isHidden())
      await delay(50) // allow the held original request to reach the browser network queue
      check(`only active original requested @${width}`, originals.length === 1)
      release()
      await page.waitForFunction(() => document.querySelector('[data-original]')?.naturalWidth === 3480)
      await page.locator('.gallery-full.is-loaded').waitFor()
      check(`full resolution uncropped @${width}`, await page.locator('[data-original]').evaluate(e => e.naturalHeight === 6192 && getComputedStyle(e).objectFit === 'contain' && e.currentSrc.endsWith('/img/gallery/0.jpeg')))
      check(`original file link @${width}`, await page.locator('.gallery-viewer a[aria-label="باز کردن فایل اصلی عکس"]').getAttribute('href') === '/img/gallery/0.jpeg')
      for (let i = 0; i < 8; i++) await page.keyboard.press('Tab')
      check(`dialog traps focus @${width}`, await page.locator('.gallery-viewer').evaluate(e => e.contains(document.activeElement)))
      await page.keyboard.press('ArrowRight'); await waitIndex(page, 1)
      check(`keyboard next @${width}`, true)
      await page.keyboard.press('ArrowLeft'); await waitIndex(page, 0)
      await page.getByRole('button', { name: 'عکس قبلی', exact: true }).click(); await waitIndex(page, 23)
      check(`previous wraps @${width}`, true)
      await page.getByRole('button', { name: 'عکس بعدی', exact: true }).click(); await waitIndex(page, 0)
      check(`next wraps @${width}`, true)
      await page.keyboard.press('Alt+ArrowRight')
      check(`modifier key not intercepted @${width}`, await index(page) === '0')
      if (width === 375) {
        await swipe(page, -100, 0); await waitIndex(page, 1)
        check('real touch swipe left advances', true)
        await swipe(page, 100, 0); await waitIndex(page, 0)
        check('real touch swipe right goes previous', true)
        await swipe(page, 0, 100)
        check('vertical touch does not navigate', await index(page) === '0')
        await swipe(page, 0, 0, true)
        check('multitouch does not navigate', await index(page) === '0')
        await page.setViewportSize({ width: 812, height: 375 })
        check('landscape viewer fits', await page.locator('.gallery-viewer').evaluate(e => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth }))
        await page.setViewportSize({ width: 375, height: 900 })
      }
      await delay(250)
      await page.screenshot({ path: `${out}/viewer-${width}.png` })
      await page.keyboard.press('Escape')
      await page.locator('.gallery-viewer').waitFor({ state: 'hidden' })
      check(`Escape restores exact opener @${width}`, await first.evaluate(e => e === document.activeElement))
      check(`nav visible after close @${width}`, await page.locator('.nav-brand').isVisible())
      await page.locator('.gallery-thumbnail').last().scrollIntoViewIfNeeded()
      await page.locator('.gallery-thumbnail').last().locator('img').waitFor()
      check(`scroll reveals last thumbnail @${width}`, true)
      check(`gallery no page overflow @${width}`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      await page.close()
    }

    const page = await browser.newPage({ viewport: { width: 375, height: 900 } })
    page.on('pageerror', e => errors.push(String(e)))
    await page.route('**/img/gallery/0.jpeg', route => route.abort(), { times: 1 })
    await page.goto(origin + '/gallery')
    await page.locator('.gallery-thumbnail').first().click()
    await page.getByText('تصویر اصلی دریافت نشد؛ پیش‌نمایش باقی است.').waitFor()
    check('original error retains preview and controls', await page.locator('.gallery-preview').isVisible() && await page.getByRole('button', { name: 'عکس بعدی' }).isVisible())
    await page.getByRole('button', { name: 'تلاش دوباره', exact: true }).click()
    await page.waitForFunction(() => document.querySelector('[data-original]')?.naturalWidth === 3480)
    check('original retry succeeds', true)
    for (let i = 0; i < 6; i++) await page.getByRole('button', { name: 'عکس بعدی' }).click()
    await waitIndex(page, 6)
    await page.waitForFunction(() => document.querySelector('[data-original]')?.currentSrc.endsWith('/6.jpeg'))
    check('rapid navigation keeps image and count aligned', await page.locator('.gallery-count').innerText() === '7 / 24')
    await page.keyboard.press('Escape')
    await page.route('**/_next/image?**', route => {
      const src = new URL(route.request().url()).searchParams.get('url')
      return src?.endsWith('/0.webp') ? route.abort() : route.continue()
    })
    await page.goto(origin + '/gallery')
    await page.locator('.gallery-thumbnail').first().getByText(/پیش‌نمایش دریافت نشد/).waitFor()
    check('thumbnail failure has readable original action', await page.locator('.gallery-thumbnail').first().getByText(/باز کردن تصویر اصلی/).isVisible())
    await page.locator('.gallery-thumbnail').first().click()
    await page.waitForFunction(() => document.querySelector('[data-original]')?.naturalWidth === 3480)
    check('failed thumbnail still opens original', true)
    await page.keyboard.press('Escape')
    await page.goto(origin + '/catalog')
    await page.locator('a.pcard').first().waitFor()
    await page.locator('.navigation-trigger').click()
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.waitForFunction(() => !document.querySelector('#public-menu').matches(':popover-open'))
    check('open mobile menu closes on desktop resize', await page.locator('.desktop-nav').isVisible())
    await page.setViewportSize({ width: 375, height: 900 })
    check('mobile menu stays closed after resize back', !await page.locator('#public-menu').evaluate(e => e.matches(':popover-open')))
    // Catalog loads once and filters tabs locally: no per-tab request, so no late-response race.
    const productRequests = []
    page.on('request', r => { if (r.url().includes('/api/v1/products/')) productRequests.push(r.url()) })
    await page.getByRole('button', { name: 'تک خاستگاه', exact: true }).click()
    await page.getByRole('button', { name: 'تجاری', exact: true }).click()
    await page.waitForFunction(() => document.querySelectorAll('a.pcard').length === 1)
    check('tab switch filters locally without refetching', productRequests.length === 0)
    await delay(800)
    check('current tab result stays', await page.locator('a.pcard').count() === 1 && await page.locator('a.pcard').getAttribute('href') === '/catalog/blend-50-50')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    check('catalog reduced motion visible and static', await page.locator('a.pcard').evaluate(e => getComputedStyle(e).animationName === 'none' && +getComputedStyle(e).opacity === 1))
    await page.unroute('**/api/v1/products/**')
    await page.route('**/api/v1/products/**', route => route.fulfill({ status: 503, json: {} }), { times: 1 })
    await page.reload()
    await page.getByText('ارتباط با سرور برقرار نشد.').waitFor()
    check('catalog error state present', await page.locator('.catalog-results').getAttribute('data-state') === 'error')
    await page.getByRole('button', { name: 'تلاش دوباره', exact: true }).click()
    await page.waitForFunction(() => document.querySelectorAll('a.pcard').length === 1)
    check('catalog retry restores products (current tab kept)', true)
    await page.close()

    const art = await browser.newPage()
    art.on('pageerror', e => errors.push(String(e)))
    await art.addInitScript(() => {
      const frames = new Set(), timers = new Set()
      const raf = window.requestAnimationFrame.bind(window), cancel = window.cancelAnimationFrame.bind(window)
      const timeout = window.setTimeout.bind(window), clear = window.clearTimeout.bind(window)
      window.requestAnimationFrame = fn => {
        const id = raf(t => { frames.delete(id); fn(t) }); frames.add(id); return id
      }
      window.cancelAnimationFrame = id => { frames.delete(id); cancel(id) }
      window.setTimeout = (fn, ms, ...args) => {
        const id = timeout(() => { timers.delete(id); fn(...args) }, ms); timers.add(id); return id
      }
      window.clearTimeout = id => { timers.delete(id); clear(id) }
      window.palPending = () => ({ frames: frames.size, timers: timers.size })
    })
    // Scenes loop by design (user choice); check they stay cheap and the form cat reacts.
    await art.goto(origin + '/pal-design/landing-animated.html')
    await art.locator('svg').first().waitFor()
    await delay(500)
    check('landing flag animates while visible (one rAF chain)', await art.evaluate(() => window.palPending().frames === 1))
    await art.emulateMedia({ reducedMotion: 'reduce' })
    await delay(300)
    const flagAt = await art.evaluate(() => document.querySelector('#flagA').getAttribute('d'))
    await delay(300)
    check('reduced motion stops flag and pauses loops', await art.evaluate(f => window.palPending().frames === 0
      && document.querySelector('#flagA').getAttribute('d') === f
      && getComputedStyle(document.querySelector('.steam')).animationPlayState === 'paused', flagAt))
    await art.emulateMedia({ reducedMotion: 'no-preference' })
    await art.goto(origin + '/pal-design/registration-animated.html')
    await art.locator('#cat').waitFor()
    check('form cat starts idle', await art.locator('#art').getAttribute('data-mood') === 'idle')
    await art.locator('#card').click()
    check('form cat reacts to a tap', await art.locator('#art').getAttribute('data-mood') === 'surprised')
    await art.waitForFunction(() => ['happy', 'wink'].includes(document.querySelector('#art').dataset.mood))
    check('form cat settles into a happy face', true)
    await art.goto(origin + '/pal-design/registration-animated.html#success')
    check('success scene shows happy cat + heart', await art.locator('#art').getAttribute('data-mood') === 'happy' && await art.locator('.heart').isVisible())
    await art.close()
    check('no page errors', errors.length === 0 || (console.error(errors), false))
    fs.writeFileSync(`${out}/report.json`, JSON.stringify({ checks }, null, 2))
    console.log(`${checks.length} checks passed`)
  } finally { await browser.close() }
})().catch(e => { console.error(e); process.exitCode = 1 })
