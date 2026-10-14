// Local mocked API only. Registration writes intercepted; no real payment or signup.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const origin = process.env.PAL_ORIGIN || 'http://localhost:3006'
assert.ok(['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
const out = '/tmp/pal-registration-status'
fs.mkdirSync(out, { recursive: true })
const token = '11111111-1111-1111-1111-111111111111'
const event = { id: 1, title: 'رویداد پیش رو', date: '2026-10-16', price_rial: 0, time_slots: [{ id: 11, start_time: '10:00', end_time: '12:00', remaining_capacity: 5 }] }
;(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium' })
  try {
    for (const width of [390, 1440]) for (const reducedMotion of ['no-preference', 'reduce']) {
      const page = await browser.newPage({ viewport: { width, height: 950 }, reducedMotion })
      let status = 'pending', empty = false, submitted = false
      const errors = []
      page.on('pageerror', e => errors.push(String(e)))
      await page.addInitScript(() => { if (window === window.top) localStorage.setItem('pal_access_token', 'mock') })
      const registration = () => ({ id: 1, event: 1, registration_token: token, event_title: event.title, full_name: 'مهمان', status, status_display: { pending: 'در انتظار بررسی', confirmed: 'تأییدشده', rejected: 'ردشده' }[status], amount_rial: 1000000, time_slot: event.time_slots[0], admin_note: '', receipt_url: '/private/test' })
      await page.route('**/api/v1/**', async route => {
        const req = route.request(), p = new URL(req.url()).pathname
        if (req.method() === 'PATCH' && p === '/api/v1/auth/me/') return route.fulfill({ json: { full_name: 'مهمان' } })
        if (req.method() === 'POST' && p === '/api/v1/events/registrations/') {
          assert.ok(req.postData().includes('11'), 'signup uses first-event slot')
          submitted = true
          return route.fulfill({ json: registration() })
        }
        if (req.method() !== 'GET') throw new Error('Unexpected mutation')
        return route.fulfill({ json: p.endsWith(`/registrations/${token}/`) ? registration()
          : p === '/api/v1/events/' ? { results: empty ? [] : [event, { ...event, id: 2, title: 'رویداد بعدی' }], next: null }
          : p === '/api/v1/auth/me/' ? { full_name: 'مهمان', phone_number: '09120000000' }
          : { results: [], next: null } })
      })
      await page.goto(origin + '/submit')
      await page.getByRole('heading', { name: event.title, exact: true }).waitFor()
      assert.equal(await page.getByText('رویداد بعدی', { exact: true }).count(), 0)
      assert.equal(await page.locator('select').count(), 1)
      await page.getByLabel('زمان حضور').selectOption('11')
      await page.getByRole('button', { name: 'ارسال درخواست ثبت‌نام' }).click()
      await page.getByRole('heading', { name: 'درخواست شما ثبت شد' }).waitFor()
      assert.ok(submitted)
      assert.ok(!(await page.locator('main').innerText()).includes('برای دیدن وضعیت، با همین شماره وارد شوید'))
      for (status of ['pending', 'confirmed', 'rejected']) {
        await page.goto(`${origin}/submit/status/${token}`)
        const iframe = page.locator('main iframe')
        await iframe.waitFor()
        await iframe.scrollIntoViewIfNeeded()
        assert.ok((await iframe.getAttribute('src')).endsWith('#' + status))
        assert.equal(await iframe.getAttribute('sandbox'), 'allow-scripts')
        const frame = page.frameLocator('main iframe'), svg = frame.locator('#art')
        await svg.waitFor()
        const mood = { pending: 'sleepy', confirmed: 'happy', rejected: 'sad' }[status]
        await page.waitForTimeout(1800)
        assert.equal(await svg.getAttribute('data-mood'), mood)
        await frame.locator('#card').hover()
        await frame.locator('#card').click()
        assert.equal(await svg.getAttribute('data-mood'), mood, 'interaction must not change status mood')
        assert.equal(await frame.locator('.heart').evaluate(e => getComputedStyle(e).display !== 'none'), status === 'confirmed')
        if (reducedMotion === 'reduce') assert.ok(await frame.locator('body').evaluate(e => e.classList.contains('static')))
        assert.ok(!(await page.locator('main').innerText()).includes('نمایش وضعیت و رسید فقط با ورود صاحب حساب یا مدیر ممکن است.'))
        assert.equal(await page.getByLabel('رسید جدید').count(), status === 'rejected' ? 1 : 0)
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        await page.waitForTimeout(2200)
        assert.ok(await svg.evaluate(e => e.querySelectorAll('path').length > 50))
        assert.ok(await frame.locator('.hop').first().evaluate(e => Number(getComputedStyle(e).opacity) > .9), 'cat entrance must finish visibly')
        await page.screenshot({ path: `${out}/${status}-${width}-${reducedMotion}.png`, fullPage: true })
      }
      empty = true
      await page.goto(origin + '/submit')
      await page.getByText('رویداد بعدی به‌زودی اعلام می‌شود.').waitFor()
      assert.equal(await page.locator('form').count(), 0)
      assert.deepEqual(errors, [])
      console.log(`PASS signup/title/payload/copy removal, three SVG moods/interaction/reduced-motion/status forms @${width} ${reducedMotion}`)
      await page.close()
    }
  } finally { await browser.close() }
})().catch(e => { console.error(e); process.exitCode = 1 })
