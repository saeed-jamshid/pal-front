// Local mocked API only. All writes intercepted; no live registration/payment decisions.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const origin = process.env.PAL_ORIGIN || 'http://localhost:3006'
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin).hostname))
const out = process.env.PAL_EVIDENCE_DIR || '/tmp/pal-admin-polish'
fs.mkdirSync(out, { recursive: true })
const event = { id: 1, title: 'رویداد آزمایشی', date: '2026-10-16', price_rial: 1000001, is_active: true }
const slot = { id: 1, event: 1, event_title: event.title, start_time: '10:05:30', end_time: '12:00:45', registration_ceiling: 10, remaining_capacity: 10 }
const registration = { id: 1, registration_token: '11111111-1111-1111-1111-111111111111', full_name: 'مهمان آزمایشی', event_title: event.title, amount_rial: 1000001, status: 'pending', time_slot: slot, receipt_url: '/private/test', phone_number: '09120000000' }
const rows = results => ({ results, count: results.length, next: null, previous: null })
// Valid one-page PDF fixture, generated locally without another dependency.
const text = "BT /F1 24 Tf 40 700 Td (TEST RECEIPT - NO PAYMENT) Tj ET"
const objects = ["<</Type /Catalog /Pages 2 0 R>>", "<</Type /Pages /Kids [3 0 R] /Count 1>>", "<</Type /Page /Parent 2 0 R /MediaBox [0 0 480 800] /Resources <</Font <</F1 4 0 R>>>> /Contents 5 0 R>>", "<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>", `<</Length ${text.length}>>\nstream\n${text}\nendstream`]
let pdf = "%PDF-1.4\n", offsets = [0]
objects.forEach((obj, i) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${i + 1} 0 obj\n${obj}\nendobj\n` })
const xref = Buffer.byteLength(pdf)
pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n => `${String(n).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<</Size 6 /Root 1 0 R>>\nstartxref\n${xref}\n%%EOF\n`
;(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium' })
  try {
    const maker = await browser.newPage({ viewport: { width: 480, height: 480 } })
    await maker.setContent('<main style="padding:32px;font:24px sans-serif;background:#f1f1f2;color:#24266c"><h1>TEST RECEIPT</h1><p>Local preview only</p><p>100,000 toman</p><p>No real payment</p></main>')
    const png = await maker.screenshot()
    await maker.close()
    for (const width of [320, 390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, timezoneId: "Asia/Tehran" })
      const errors = [], calls = []
      let payload, receiptType = 'image/png', malformedPdf = false, dashboardStatus = 403
      page.on('pageerror', e => errors.push(String(e)))
      await page.addInitScript(() => {
        if (window !== window.top) return
        localStorage.setItem('pal_access_token', 'mock-staff')
        window.revokedBlobs = []
        const revoke = URL.revokeObjectURL.bind(URL)
        URL.revokeObjectURL = url => { window.revokedBlobs.push(url); revoke(url) }
      })
      await page.route('**/api/v1/**', async route => {
        const req = route.request(), url = new URL(req.url()), p = url.pathname
        calls.push([req.method(), p, url.search])
        if (req.method() !== 'GET') {
          assert.ok(p === '/api/v1/manage/events/1/' || p === '/api/v1/manage/slots/1/', 'unexpected mutation')
          payload = req.postDataJSON()
          return route.fulfill({ json: { id: 1, ...payload } })
        }
        if (p.includes('/receipt/')) {
          assert.equal(req.headers().authorization, 'Bearer mock-staff')
          return route.fulfill({ contentType: receiptType, body: receiptType === 'image/png' ? png : receiptType === 'application/pdf' ? (malformedPdf ? '<html>not a PDF</html>' : pdf) : '<html>must not render</html>' })
        }
        if (p === '/api/v1/events/manage/registrations/') return route.fulfill({ status: dashboardStatus, json: { detail: 'You do not have permission to perform this action.' } })
        if (p === '/api/v1/manage/overview/') return route.fulfill({ json: { user: { id: 1, full_name: 'مدیر آزمایشی' }, products: 0, orders: 0, customers: 2, unfulfilled: 0, registrations_pending: 1, receipts_pending: 0, paid_total_rial: 1000001 } })
        if (p === '/api/v1/manage/customers/') {
          const second = url.searchParams.get('page') === '2'
          return route.fulfill({ json: second ? rows([{ id: 2, full_name: 'کاربر غیرفعال', phone_number: '09120000002', is_active: false, is_staff: false }]) : { ...rows([{ id: 1, full_name: 'کاربر فعال', phone_number: '09120000001', is_active: true, is_staff: false }]), count: 2, next: `${origin}/api/v1/manage/customers/?page=2` } })
        }
        return route.fulfill({ json: rows(p === '/api/v1/manage/events/' ? [event] : p === '/api/v1/manage/slots/' ? [slot] : p === '/api/v1/manage/registrations/' ? [registration] : []) })
      })
      await page.goto(`${origin}/manage/events`)
      await page.getByText('۱۰۰٬۰۰۰ تومان', { exact: true }).waitFor()
      await page.getByRole('button', { name: `ویرایش ${event.title}`, exact: true }).click()
      const dialog = page.getByRole('dialog')
      await dialog.locator('summary').filter({ hasText: '۲۴ مهر ۱۴۰۵' }).waitFor()
      await dialog.locator('.admin-date-field summary').click()
      await dialog.locator('.admin-calendar').waitFor()
      assert.ok((await dialog.locator('.rdp-month_caption').innerText()).includes('۱۴۰۵'))
      await dialog.screenshot({ path: `${out}/calendar-${width}.png` })
      assert.ok(await dialog.evaluate(e => e.scrollWidth <= e.clientWidth), 'calendar overflow')
      await dialog.locator('.rdp-day:not(.rdp-outside) .rdp-day_button').filter({ hasText: /^۲۵$/ }).click()
      assert.equal(await dialog.locator('[name=date]').inputValue(), '2026-10-17')
      await dialog.getByRole('button', { name: 'ذخیره تغییرات' }).click()
      await dialog.waitFor({ state: 'hidden' })
      assert.equal(payload.date, '2026-10-17')
      assert.equal(payload.price_rial, 1000001, 'display rounding must not change IRR')
      await page.goto(`${origin}/manage/slots`)
      await page.getByRole('button', { name: 'ویرایش 1', exact: true }).click()
      await dialog.locator('[name=start_time_0]').waitFor()
      assert.equal(await dialog.locator('[name=start_time_0]').inputValue(), '10')
      assert.equal(await dialog.locator('[name=start_time_2]').inputValue(), '30')
      assert.equal(await dialog.locator('[name=start_time_0] option:checked').innerText(), '۱۰')
      await dialog.locator('[name=start_time_1]').selectOption('15')
      await dialog.screenshot({ path: `${out}/time-${width}.png` })
      assert.ok(await dialog.evaluate(e => e.scrollWidth <= e.clientWidth), 'time overflow')
      await dialog.getByRole('button', { name: 'ذخیره تغییرات' }).click()
      await dialog.waitFor({ state: 'hidden' })
      assert.equal(payload.start_time, '10:15:30')
      assert.equal(payload.end_time, '12:00:45')
      await page.goto(`${origin}/manage/customers`)
      await page.getByLabel('فیلتر وضعیت').selectOption('false')
      await page.getByText('کاربر غیرفعال', { exact: true }).waitFor()
      assert.equal(await page.getByText('کاربر فعال', { exact: true }).count(), 0)
      assert.ok(calls.some(([, p, q]) => p.endsWith('/customers/') && q.includes('page=2')))
      await page.screenshot({ path: `${out}/customers-${width}.png`, fullPage: true })
      await page.getByLabel('فیلتر وضعیت').selectOption('true')
      await page.getByText('کاربر فعال', { exact: true }).waitFor()
      assert.equal(await page.getByText('کاربر غیرفعال', { exact: true }).count(), 0)
      await page.goto(`${origin}/manage/registrations`)
      await page.getByRole('button', { name: 'جزئیات مهمان آزمایشی', exact: true }).click()
      await dialog.getByRole('button', { name: 'پیش‌نمایش رسید', exact: true }).click()
      const image = dialog.getByAltText('پیش‌نمایش رسید پرداخت')
      await image.waitFor()
      assert.ok(await image.evaluate(e => e.complete && e.naturalWidth > 0))
      await dialog.screenshot({ path: `${out}/receipt-${width}.png` })
      const blobURL = await image.getAttribute('src')
      await dialog.getByRole('button', { name: 'بستن پیش‌نمایش' }).click()
      assert.ok(await page.evaluate(url => window.revokedBlobs.includes(url), blobURL))
      receiptType = 'application/pdf'
      await dialog.getByRole('button', { name: 'پیش‌نمایش رسید', exact: true }).click()
      await dialog.getByTitle('پیش‌نمایش رسید PDF').waitFor()
      assert.equal(await dialog.getByTitle('پیش‌نمایش رسید PDF').getAttribute('referrerpolicy'), 'no-referrer')
      await page.waitForTimeout(700)
      await dialog.screenshot({ path: `${out}/pdf-${width}.png` })
      await dialog.getByRole('button', { name: 'بستن پیش‌نمایش' }).click()
      malformedPdf = true
      await dialog.getByRole('button', { name: 'پیش‌نمایش رسید', exact: true }).click()
      await dialog.getByText('فایل رسید PDF معتبر نیست. رسید را دانلود و بررسی کنید.').waitFor()
      assert.equal(await dialog.locator('iframe').count(), 0)
      receiptType = 'text/html'
      await dialog.getByRole('button', { name: 'پیش‌نمایش رسید', exact: true }).click()
      await dialog.getByText('پیش‌نمایش این نوع فایل ممکن نیست. رسید را دانلود کنید.').waitFor()
      assert.equal(await dialog.locator('iframe, .admin-receipt-image').count(), 0)
      await page.keyboard.press('Escape')
      await page.goto(`${origin}/dashboard`)
      await page.getByRole('alert').filter({ hasText: 'حساب شما اجازهٔ دسترسی به این بخش را ندارد.' }).waitFor()
      dashboardStatus = 429
      await page.getByRole('button', { name: 'بازخوانی', exact: true }).click()
      await page.getByRole('alert').filter({ hasText: 'درخواست‌های زیادی ارسال شده است.' }).waitFor()
      assert.deepEqual(errors, [])
      assert.equal(calls.filter(([method]) => method !== 'GET').length, 2, 'only mocked date/time saves permitted')
      console.log(`PASS Persian date/time payloads, theme/layout, all-page user filter, private image/PDF preview, cleanup, errors @${width}`)
      await page.close()
    }
  } finally { await browser.close() }
})().catch(e => { console.error(e); process.exitCode = 1 })
