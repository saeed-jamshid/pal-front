// Local mocked UI checks. Every API request intercepted; no live writes.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const origin = process.env.PAL_ORIGIN || 'http://127.0.0.1:3006'
assert.ok(['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
const out = '/tmp/pal-admin-crud'
fs.mkdirSync(out, { recursive: true })
const list = results => ({ count: results.length, results, next: null, previous: null })
;(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium' })
  try {
    for (const width of [320, 390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } })
      const errors = [], mutations = []
      let accept = true, full = false, noSlots = false, registrationFail = false
      const event = { id: 1, title: 'رویداد تست', description: '', price_rial: 0, date: '2027-10-16', is_active: true, location_name: 'محل آزمایشی', address: 'نشانی آزمایشی', latitude: '32.870000', longitude: '59.220000' }
      let slots = [{ id: 1, event: 1, event_title: event.title, start_time: '10:00:00', end_time: '11:00:00', registration_ceiling: 10, remaining_capacity: 10 }]
      let customers = [{ id: 2, full_name: 'مشتری بدون سابقه', is_active: true, is_staff: false }, { id: 3, full_name: 'مشتری دارای سابقه', is_active: true, is_staff: false }, { id: 1, full_name: 'مدیر', is_active: true, is_staff: true }]
      page.on('pageerror', e => errors.push(e.message))
      page.on('dialog', dialog => accept ? dialog.accept() : dialog.dismiss())
      await page.addInitScript(() => { if (window === window.top) localStorage.setItem('pal_access_token', 'mock-staff') })
      await page.route('https://trustseal.enamad.ir/**', route => route.abort())
      await page.route('https://www.openstreetmap.org/**', route => route.fulfill({ contentType: 'text/html', body: '<p>Mock venue map</p>' }))
      await page.route('**/api/v1/**', async route => {
        const req = route.request(), p = new URL(req.url()).pathname, method = req.method()
        if (method !== 'GET') {
          mutations.push({ method, path: p, body: req.postData() })
          if (p === '/api/v1/manage/events/1/' && method === 'PATCH') { Object.assign(event, req.postDataJSON()); return route.fulfill({ json: event }) }
          if (p === '/api/v1/manage/slots/' && method === 'POST') { const slot = { id: 2, ...req.postDataJSON(), remaining_capacity: 5 }; slots.push(slot); return route.fulfill({ status: 201, json: slot }) }
          if (p === '/api/v1/manage/slots/2/' && method === 'PATCH') { Object.assign(slots[1], req.postDataJSON()); return route.fulfill({ json: slots[1] }) }
          if ((p === '/api/v1/manage/slots/2/' || p === '/api/v1/manage/customers/2/') && method === 'DELETE') { slots = slots.filter(s => s.id !== 2); customers = customers.filter(c => c.id !== 2); return route.fulfill({ status: 204 }) }
          if (p === '/api/v1/manage/customers/3/' && method === 'DELETE') return route.fulfill({ status: 409, json: { detail: 'این مشتری سابقه ثبت‌نام دارد؛ به‌جای حذف آن را غیرفعال کنید.' } })
          if (p === '/api/v1/auth/me/' && method === 'PATCH') return route.fulfill({ json: req.postDataJSON() })
          if (p === '/api/v1/events/registrations/' && method === 'POST') {
            assert.ok(req.postData().includes('name="time_slot"'))
            return route.fulfill({ status: registrationFail ? 400 : 201, json: registrationFail ? { detail: 'ظرفیت تکمیل شده است.' } : { id: 8, registration_token: 'test-token', status: 'confirmed', status_display: 'تأییدشده' } })
          }
          throw new Error(`Unexpected mutation ${method} ${p}`)
        }
        if (p === '/api/v1/manage/overview/') return route.fulfill({ json: { user: { id: 1, full_name: 'مدیر' }, products: 0, orders: 0, customers: 2, unfulfilled: 0, registrations_pending: 0, receipts_pending: 0, paid_total_rial: 0 } })
        if (p === '/api/v1/auth/me/') return route.fulfill({ json: { full_name: 'مهمان', phone_number: '09120000000' } })
        const results = p === '/api/v1/manage/customers/' ? customers : p === '/api/v1/manage/events/' ? [event] : p === '/api/v1/manage/slots/' ? slots : p === '/api/v1/events/' ? [{ ...event, time_slots: noSlots ? [] : slots.map(s => ({ ...s, remaining_capacity: full ? 0 : s.remaining_capacity })) }] : []
        return route.fulfill({ json: list(results) })
      })
      await page.goto(`${origin}/manage/customers`)
      await page.getByLabel('حذف مشتری بدون سابقه', { exact: true }).waitFor()
      assert.equal(await page.getByLabel('حذف مدیر', { exact: true }).count(), 0)
      accept = false
      await page.getByLabel('حذف مشتری بدون سابقه', { exact: true }).click()
      assert.equal(mutations.length, 0)
      accept = true
      await page.getByLabel('حذف مشتری بدون سابقه', { exact: true }).click()
      await page.getByText('رکورد حذف شد.', { exact: true }).waitFor()
      await page.getByLabel('حذف مشتری دارای سابقه', { exact: true }).click()
      await page.getByRole('alert').filter({ hasText: 'غیرفعال کنید' }).waitFor()
      await page.getByText('مشتری دارای سابقه', { exact: true }).waitFor()
      await page.screenshot({ path: `${out}/customers-${width}.png`, fullPage: true })
      await page.goto(`${origin}/manage/events`)
      await page.getByLabel(`ویرایش ${event.title}`, { exact: true }).click()
      const dialog = page.getByRole('dialog')
      assert.equal(await dialog.evaluate(e => getComputedStyle(e).getPropertyValue('--adm-accent').trim()), '#2e3191')
      await dialog.getByLabel('نشانی محل برگزاری', { exact: true }).fill('نشانی تازه محل آزمایشی')
      await dialog.getByRole('button', { name: 'ذخیره تغییرات' }).click()
      await dialog.waitFor({ state: 'hidden' })
      assert.equal(event.address, 'نشانی تازه محل آزمایشی')
      await page.goto(`${origin}/manage/slots`)
      await page.getByRole('button', { name: 'افزودن بازه حضور', exact: true }).click()
      await dialog.getByLabel('رویداد', { exact: false }).waitFor()
      assert.equal(await dialog.locator('[name=event]').inputValue(), '', 'event must be explicitly chosen')
      await dialog.locator('[name=event]').selectOption('1')
      for (const [key, hour] of [['start_time', '12'], ['end_time', '13']]) {
        for (const [i, val] of [hour, '00', '00'].entries()) await dialog.locator(`[name=${key}_${i}]`).selectOption(val)
      }
      await dialog.locator('[name=registration_ceiling]').fill('5')
      await dialog.getByRole('button', { name: 'ذخیره تغییرات' }).click()
      await dialog.waitFor({ state: 'hidden' })
      await page.getByLabel('ویرایش 2', { exact: true }).click()
      await dialog.locator('[name=registration_ceiling]').fill('6')
      await dialog.getByRole('button', { name: 'ذخیره تغییرات' }).click()
      await dialog.waitFor({ state: 'hidden' })
      await page.getByLabel('حذف 2', { exact: true }).click()
      await page.getByText('رکورد حذف شد.', { exact: true }).waitFor()
      assert.equal(slots.length, 1)
      await page.goto(`${origin}/submit`)
      await page.getByText(event.address, { exact: true }).waitFor()
      assert.equal(await page.locator('iframe[title="نقشه محل برگزاری رویداد"]').count(), 0)
      await page.getByRole('button', { name: 'نمایش نقشه', exact: true }).focus()
      await page.keyboard.press('Enter')
      const map = page.getByTitle('نقشه محل برگزاری رویداد', { exact: true })
      await map.waitFor()
      assert.equal(new URL(await map.getAttribute('src')).searchParams.get('marker'), '32.87,59.22')
      await page.locator('[name=time_slot]').selectOption('1')
      await page.screenshot({ path: `${out}/signup-${width}.png`, fullPage: true })
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no page overflow')
      registrationFail = true
      full = true
      await page.getByRole('button', { name: 'ارسال درخواست ثبت‌نام' }).click()
      await page.getByRole('alert').filter({ hasText: 'ظرفیت تکمیل' }).waitFor()
      await page.getByText('ظرفیت همه بازه‌ها تکمیل شده است.', { exact: true }).waitFor()
      assert.equal(await page.locator('[name=time_slot]').inputValue(), '')
      noSlots = true
      await page.reload()
      await page.getByText('هنوز بازه‌ای برای این رویداد تعریف نشده است.', { exact: true }).waitFor()
      assert.ok(await page.getByRole('button', { name: 'ارسال درخواست ثبت‌نام' }).isDisabled())
      noSlots = false; full = false; registrationFail = false
      await page.reload()
      await page.locator('[name=time_slot]').selectOption('1')
      await page.getByRole('button', { name: 'ارسال درخواست ثبت‌نام' }).click()
      await page.getByRole('heading', { name: 'درخواست شما ثبت شد' }).waitFor()
      assert.deepEqual(errors, [])
      console.log(`PASS theme, customer delete/cancel/conflict, venue edit/map, slot CRUD, capacity refresh, empty slots, signup @${width}; ${mutations.length} intercepted mutations`)
      await page.close()
    }
  } finally { await browser.close() }
})().catch(e => { console.error(e); process.exitCode = 1 })
