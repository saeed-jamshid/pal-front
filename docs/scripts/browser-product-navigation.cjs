// Production-mode, mocked public API; no DB writes. Reuses installed Playwright.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const origin = process.env.PAL_ORIGIN || 'http://localhost:3006'
assert.ok(['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
const out = process.env.PAL_EVIDENCE_DIR || '/tmp/pal-product-navigation'
fs.mkdirSync(out, { recursive: true })
const products = ['hover', 'focus', 'touch', 'retry'].map((slug, i) => ({ id: i + 1, slug, name: `Coffee ${slug}`, category: 1, images: [], origin: 'Test origin', description: 'Test details', price: 0 }))
const list = results => ({ count: results.length, next: null, results })
;(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] })
  const checks = [], errors = [], writes = []
  const check = (name, ok) => { assert.ok(ok, name); checks.push(name); console.log('PASS', name) }
  try {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width === 390 })
      const page = await context.newPage(), calls = {}
      page.on('pageerror', e => errors.push(e.message))
      await page.route('https://trustseal.enamad.ir/**', r => r.abort())
      await page.route('**/api/v1/**', async r => {
        const req = r.request(), path = new URL(req.url()).pathname
        if (req.method() !== 'GET') { writes.push(path); return r.abort() }
        if (path.endsWith('/categories/')) return r.fulfill({ json: [{ id: 1, name: 'تک خاستگاه', slug: 'single-origin' }] })
        if (path.endsWith('/products/')) return r.fulfill({ json: list(products) })
        const product = products.find(p => path.endsWith(`/products/${p.slug}/`))
        if (product) {
          calls[product.slug] = (calls[product.slug] || 0) + 1
          await new Promise(resolve => setTimeout(resolve, 100))
          return r.fulfill({ status: product.slug === 'retry' && calls.retry === 1 ? 503 : 200, json: product })
        }
        return r.fulfill({ json: list([]) })
      })
      for (const intent of ['hover', 'focus', 'touch', 'retry']) {
        await page.goto(origin + '/catalog', { waitUntil: 'networkidle' })
        check(`no eager product API requests ${intent} @${width}`, calls[intent] === undefined)
        const link = page.locator(`a.pcard[href='/catalog/${intent}']`)
        const preloaded = page.waitForResponse(r => new URL(r.url()).pathname.endsWith(`/products/${intent}/`))
        if (intent === 'focus') await link.focus()
        else if (intent === 'touch') await link.dispatchEvent('touchstart')
        else await link.hover()
        await preloaded
        check(`API fetched before click ${intent} @${width}`, calls[intent] === 1 && new URL(page.url()).pathname === '/catalog')
        if (intent === 'retry') await page.waitForTimeout(100)
        if (intent === 'focus') await link.press('Enter')
        else await link.click()
        await page.waitForURL(`**/catalog/${intent}`)
        await page.locator('.product-detail h1').waitFor()
        check(`correct detail ${intent} @${width}`, await page.locator('.product-detail h1').innerText() === `Coffee ${intent}`)
        check(`dedup or recover ${intent} @${width}`, calls[intent] === (intent === 'retry' ? 2 : 1))
        const detail = page.locator('.product-detail')
        check(`detail fade and swirl ${intent} @${width}`, await detail.evaluate(e => getComputedStyle(e).animationName === 'product-detail-in' && getComputedStyle(e.querySelector('.product-art'), '::before').animationName === 'package-swirl-in'))
        await detail.evaluate(e => Promise.all(e.getAnimations({ subtree: true }).map(a => a.finished)))
        check(`settles without overflow ${intent} @${width}`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && getComputedStyle(document.querySelector('.product-detail')).opacity === '1'))
        if (intent === 'hover') await page.screenshot({ path: `${out}/detail-${width}.png`, fullPage: true })
        await page.emulateMedia({ reducedMotion: 'reduce' })
        check(`detail reduced motion ${intent} @${width}`, await detail.evaluate(e => getComputedStyle(e).animationName === 'none' && getComputedStyle(e.querySelector('.product-art'), '::before').animationName === 'none'))
        await page.emulateMedia({ reducedMotion: 'no-preference' })
      }
      await page.goto(origin + '/catalog/focus', { waitUntil: 'networkidle' })
      await page.locator('.product-detail h1').waitFor()
      check(`direct visit stays fresh @${width}`, calls.focus === 2)
      await context.close()
    }
    check('no page errors', errors.length === 0)
    check('no API writes', writes.length === 0)
    fs.writeFileSync(`${out}/report.json`, JSON.stringify({ checks, errors, writes }, null, 2))
    console.log(`${checks.length} checks passed`)
  } finally { await browser.close() }
})().catch(e => { console.error(e); process.exitCode = 1 })
