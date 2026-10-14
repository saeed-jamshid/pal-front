// Local-only mocked signup UI; no backend writes. Run against npm run start.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const origin = process.env.PAL_ORIGIN || 'http://localhost:3006'
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin).hostname))
const out = process.env.PAL_EVIDENCE_DIR || '/tmp/pal-bank-card'
fs.mkdirSync(out, { recursive: true })
const cards = [
  { id: 1, bank_name: 'بانک آزمایشی', account_holder: 'صاحب حساب آزمایشی', card_number: '0000000000000000', iban: 'IR000000000000000000000000', label: 'آزمایشی' },
  { id: 2, bank_name: 'بانک دوم', account_holder: 'صاحب حساب دوم با نام طولانی برای بررسی نمایش در موبایل', card_number: '1111111111111111', iban: '', label: 'دوم' },
]
const events = [1, 2].map(id => ({ id, title: id === 1 ? 'رویداد آزمایشی' : 'رویداد رایگان', description: '', date: '2026-10-16', price_rial: id === 1 ? 1000001 : 0, time_slots: [{ id, start_time: '10:00', end_time: '12:00', remaining_capacity: 10 }] }))
;(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium' })
  const errors = []
  let writes = 0
  try {
    for (const width of [320, 390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] })
      const page = await context.newPage()
      let emptyCards = false
      page.on('pageerror', e => errors.push(String(e)))
      await page.addInitScript(() => { if (window === window.top && /^https?:\/\/(localhost|127\.0\.0\.1):/.test(location.href)) localStorage.setItem('pal_access_token', 'local-mock') })
      await page.route('**/api/v1/**', route => {
        const req = route.request()
        if (req.method() !== 'GET') { writes++; return route.abort() }
        const p = new URL(req.url()).pathname
        const body = p === '/api/v1/events/' ? { results: events, next: null }
          : p === '/api/v1/payments/cards/' ? { results: emptyCards ? [] : cards, next: null }
          : p === '/api/v1/auth/me/' ? { id: 1, full_name: 'مهمان آزمایشی', phone_number: '09120000000' }
          : { results: [], next: null }
        return route.fulfill({ json: body })
      })
      await page.goto(`${origin}/submit`)
      const panel = page.locator('[data-bank-card]')
      await page.getByLabel('کارت مقصد').waitFor()
      assert.ok((await page.locator('main').innerText()).includes('هزینه: ۱۰۰٬۰۰۰ تومان'))
      assert.ok((await page.locator('main').innerText()).includes('۲۴ مهر ۱۴۰۵'))
      assert.equal(await panel.count(), 0)
      await page.getByLabel('کارت مقصد').selectOption('1')
      await panel.waitFor()
      assert.ok((await panel.innerText()).includes('0000 0000 0000 0000'))
      // Keyboard activation, real clipboard, no form submission.
      await panel.getByRole('button', { name: 'کپی شماره کارت', exact: true }).focus()
      await page.keyboard.press('Enter')
      await panel.getByRole('status').filter({ hasText: 'شماره کارت کپی شد.' }).waitFor()
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), cards[0].card_number)
      await panel.getByRole('button', { name: 'کپی شبا', exact: true }).click()
      await panel.getByRole('status').filter({ hasText: 'شماره شبا کپی شد.' }).waitFor()
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), cards[0].iban)
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      for (const button of await panel.getByRole('button').all()) assert.ok((await button.boundingBox()).height >= 44)
      await panel.screenshot({ path: `${out}/card-${width}.png` })
      await page.screenshot({ path: `${out}/signup-${width}.png`, fullPage: true })
      await page.getByLabel('کارت مقصد').selectOption('2')
      assert.ok((await panel.innerText()).includes(cards[1].account_holder))
      assert.equal(await panel.getByRole('button', { name: 'کپی شبا' }).count(), 0)
      assert.equal(await panel.getByRole('status').innerText(), '')
      await panel.getByRole('button', { name: 'کپی شماره کارت' }).click()
      await panel.getByRole('status').filter({ hasText: 'کپی شد' }).waitFor()
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), cards[1].card_number)
      await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async () => { throw new Error('denied') } }))
      await panel.getByRole('button', { name: 'کپی شماره کارت' }).click()
      await panel.getByRole('status').filter({ hasText: 'کپی ممکن نشد' }).waitFor()
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      await page.getByLabel('رویداد').selectOption('2')
      assert.equal(await panel.count(), 0)
      assert.equal(await page.getByLabel('رسید پرداخت').count(), 0)
      await page.getByLabel('رویداد').selectOption('1')
      assert.equal(await page.getByLabel('کارت مقصد').inputValue(), '')
      assert.equal(await panel.count(), 0)
      emptyCards = true
      await page.reload()
      await page.getByText('کارت پرداخت فعال نیست؛ وجهی واریز نکنید.').waitFor()
      assert.equal(await panel.count(), 0)
      assert.ok(await page.getByRole('button', { name: 'ارسال درخواست ثبت‌نام' }).isDisabled())
      console.log(`PASS card display/copy/keyboard/error/selection/free/empty @${width}`)
      await context.close()
    }
    assert.equal(writes, 0, 'copy must not submit forms or mutate backend')
    assert.deepEqual(errors, [])
    console.log('PASS zero API writes, zero page errors')
  } finally { await browser.close() }
})().catch(e => { console.error(e); process.exitCode = 1 })
