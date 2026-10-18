// Read-only smoke test against fresh deployed DB; no mocked API responses.
// PLAYWRIGHT_MODULE=/path/to/playwright-core PAL_ORIGIN=http://127.0.0.1:3315 node docs/scripts/browser-fresh-deployment.cjs
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const origin = process.env.PAL_ORIGIN || 'http://127.0.0.1:3315'
const output = process.env.PAL_EVIDENCE || '/tmp/pal-fresh-browser'

;(async () => {
  fs.mkdirSync(output, { recursive: true })
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
  const errors = [], mutations = [], api = []
  try {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
      const page = await context.newPage()
      page.on('pageerror', error => errors.push(error.message))
      page.on('response', response => {
        const url = new URL(response.url())
        if (url.origin === origin && url.pathname.startsWith('/api/')) api.push({ width, path: url.pathname, status: response.status() })
      })
      await page.route('**/api/**', route => {
        if (!['GET', 'HEAD'].includes(route.request().method())) {
          mutations.push(route.request().url())
          return route.abort()
        }
        return route.continue()
      })
      for (const path of ['/', '/catalog', '/submit', '/manage']) {
        const response = await page.goto(origin + path, { waitUntil: 'domcontentloaded' })
        assert.equal(response.status(), 200)
        if (path === '/catalog') {
          await page.locator('.catalog-results[data-state="empty"]').waitFor()
          assert(await page.locator('.catalog-empty').isVisible())
        }
        if (path === '/submit') await page.getByText('رویداد بعدی به‌زودی اعلام می‌شود.').waitFor()
        if (path === '/manage') await page.locator('input[type="password"]').waitFor()
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
        assert(!overflow, `${width}${path}: horizontal overflow`)
        await page.screenshot({ path: `${output}/${width}-${path.slice(1) || 'home'}.png`, fullPage: true })
      }
      await context.close()
    }
    assert.equal(mutations.length, 0, 'Unexpected API mutation attempted')
    assert.equal(errors.length, 0, 'Browser runtime errors')
    for (const path of ['/api/v1/products/', '/api/v1/events/']) assert(api.some(r => r.path === path && r.status === 200), `Missing real API response: ${path}`)
    assert(!api.some(r => r.status >= 500), 'API server error')
    fs.writeFileSync(`${output}/report.json`, JSON.stringify({ api, errors, mutations, widths: [1440, 390] }, null, 2))
    console.log(`PASS fresh DB browser smoke, 2 widths × 4 pages; real API; no writes; ${output}`)
  } finally {
    await browser.close()
  }
})().catch(error => { console.error(error); process.exitCode = 1 })
