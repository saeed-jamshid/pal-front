// Mocked API only: never writes products to a database.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const origin = process.env.PAL_ORIGIN || 'http://localhost:3000'
assert.ok(['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
const out = process.env.PAL_EVIDENCE_DIR || '/tmp/pal-product-modes'
fs.mkdirSync(out, { recursive: true })
;(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium' })
  let checks = 0
  const check = (name, value) => { assert.ok(value, name); checks++; console.log('PASS', name) }
  try {
    for (const width of [390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } })
      await page.addInitScript(() => localStorage.setItem('pal_access_token', 'mock-staff'))
      const existing = { id: 1, name: 'Existing coffee', slug: 'existing-coffee', sku: 'EXIST-1', category: 1, price: 123000, stock: 7, origin: 'Uganda', roast_level: 'light', roast_date: '2026-10-01', tasting_notes: 'Caramel', description: 'Keep me', allowed_grinds: ['beans'], brew_methods: ['v60'], taste_profile: 'fruity', strength: 'strong', is_active: true, is_featured: true }
      let submitted, reject = true
      await page.route('**/api/v1/manage/**', async route => {
        const request = route.request(), url = new URL(request.url())
        if (['POST', 'PATCH'].includes(request.method())) {
          submitted = request.postDataJSON()
          if (reject) return route.fulfill({ status: 400, json: { slug: ['شناسه تکراری است.'] } })
          return route.fulfill({ status: 200, json: { id: 2, ...submitted } })
        }
        if (url.pathname.includes('/overview/')) return route.fulfill({ json: { user: { id: 1, full_name: 'Test staff', phone_number: '09120000000' }, products: 1, orders: 0, customers: 0, unfulfilled: 0, registrations_pending: 0, receipts_pending: 0, paid_total_rial: 0 } })
        const rows = url.pathname.includes('/categories/') ? [{ id: 1, name: 'تک خاستگاه' }] : [existing]
        return route.fulfill({ json: { count: rows.length, next: null, previous: null, results: rows } })
      })
      await page.goto(origin + '/manage/products')
      await page.getByRole('button', { name: 'افزودن محصول', exact: true }).click()
      const dialog = page.getByRole('dialog'), simple = dialog.getByRole('button', { name: 'حالت ساده', exact: true }), advanced = dialog.getByRole('button', { name: 'حالت پیشرفته', exact: true })
      await simple.waitFor()
      check(`easy defaults @${width}`, await simple.getAttribute('aria-pressed') === 'true' && await dialog.locator('[name=slug]').isHidden())
      check(`generated identifiers @${width}`, /^coffee-[\da-f-]{36}$/.test(await dialog.locator('[name=slug]').inputValue()) && /^PAL-/.test(await dialog.locator('[name=sku]').inputValue()))
      await dialog.locator('[name=name]').fill('New coffee')
      await dialog.locator('[name=price]').fill('1500000')
      await advanced.click()
      await dialog.locator('[name=description]').fill('Long description')
      await dialog.locator('[name=allowed_grinds][value=beans]').check()
      await simple.click(); await advanced.click()
      check(`values survive toggles @${width}`, await dialog.locator('[name=description]').inputValue() === 'Long description' && await dialog.locator('[name=allowed_grinds][value=beans]').isChecked() && await dialog.locator('[name=price]').inputValue() === '1500000')
      await simple.click()
      await dialog.getByText('راهنمای افزودن محصول', { exact: true }).click()
      check(`helper visible @${width}`, await dialog.getByText(/پس از ذخیره، تصویر را/).isVisible())
      await dialog.screenshot({ path: `${out}/easy-${width}.png` })
      check(`no dialog overflow @${width}`, await dialog.evaluate(e => e.scrollWidth <= e.clientWidth))
      await dialog.getByRole('button', { name: 'ذخیره تغییرات' }).click()
      await dialog.getByRole('alert').waitFor()
      check(`hidden server error reveals advanced @${width}`, await advanced.getAttribute('aria-pressed') === 'true' && await dialog.locator('[name=slug]').isVisible())
      check(`create payload correct @${width}`, submitted.price === 1500000 && submitted.stock === 0 && submitted.description === 'Long description' && submitted.allowed_grinds[0] === 'beans')
      reject = false
      await dialog.getByRole('button', { name: 'ذخیره تغییرات' }).click()
      await dialog.waitFor({ state: 'hidden' })
      await page.getByRole('button', { name: 'ویرایش Existing coffee', exact: true }).click()
      await simple.waitFor()
      await dialog.locator('[name=name]').fill('Renamed coffee')
      await dialog.getByRole('button', { name: 'ذخیره تغییرات' }).click()
      await dialog.waitFor({ state: 'hidden' })
      check(`simple edit preserves advanced settings @${width}`, submitted.slug === existing.slug && submitted.sku === existing.sku && submitted.price === existing.price && submitted.stock === existing.stock && submitted.description === existing.description && submitted.roast_date === existing.roast_date && submitted.taste_profile === existing.taste_profile && submitted.strength === existing.strength && submitted.is_featured === true && submitted.brew_methods[0] === 'v60')
      await page.close()
    }
    console.log(`${checks} checks passed`)
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
