/* eslint-disable @typescript-eslint/no-require-imports -- standalone CJS test runner */
// Local-only E2E for the show-only store + event signup/tracking.
// Needs: Pal-Back runserver on 127.0.0.1:8081 (SMS_BACKEND=console, log in
// PAL_BACKEND_LOG), frontend on PAL_ORIGIN, staff phone PAL_STAFF_PHONE.
// Creates test data (event, slot, demo card). Never point at production.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core')
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const origin = process.env.PAL_ORIGIN || 'http://localhost:3000'
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin).hostname), 'local-only test: refusing non-loopback origin')
const log = process.env.PAL_BACKEND_LOG || '/tmp/pal-back.log'
const staffPhone = process.env.PAL_STAFF_PHONE || '09120000001'
const out = process.env.PAL_EVIDENCE_DIR || '/tmp/pal-showcase'
fs.mkdirSync(out, { recursive: true })
const checks = []
const check = (name, ok) => { assert.ok(ok, name); checks.push(name); console.log('PASS', name) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function api(method, route, body, token) {
  const res = await fetch(`${origin}/api/v1${route}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${method} ${route} ${res.status} ${JSON.stringify(data)}`)
  return data
}
async function apiLogin(phone) {
  fs.appendFileSync(log, '') // keep file
  const before = fs.readFileSync(log, 'utf8').length
  await api('POST', '/auth/otp/request/', { phone_number: phone })
  for (let i = 0; i < 40; i++) {
    const m = fs.readFileSync(log, 'utf8').slice(before).match(new RegExp(`SMS to ${phone}: .*?(\\d{6})`))
    if (m) return (await api('POST', '/auth/otp/verify/', { phone_number: phone, code: m[1] })).access
    await sleep(250)
  }
  throw new Error('staff OTP missing')
}
async function browserLogin(page, phone) {
  await page.getByRole('link', { name: /ورود/ }).first().click()
  await page.waitForURL(/\/login/)
  const before = fs.readFileSync(log, 'utf8').length
  await page.fill('#phone', phone)
  await page.getByRole('button', { name: 'دریافت کد' }).click()
  await page.waitForSelector('#code')
  let code
  for (let i = 0; i < 40 && !code; i++) {
    code = fs.readFileSync(log, 'utf8').slice(before).match(new RegExp(`SMS to ${phone}: .*?(\\d{6})`))?.[1]
    if (!code) await sleep(250)
  }
  await page.fill('#code', code)
  await page.getByRole('button', { name: 'ورود', exact: true }).click()
}
const receipt = path.join(out, 'receipt.png')
// 1x1 PNG
fs.writeFileSync(receipt, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'))

async function register(browser, phone, name) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(`${origin}/submit`)
  await browserLogin(page, phone)
  await page.waitForURL(/\/submit/)
  await page.getByText(phone, { exact: true }).waitFor()
  await page.getByLabel('نام کامل').fill(name)
  await page.getByLabel('زمان حضور').selectOption({ index: 1 })
  await page.getByLabel('کارت مقصد').selectOption({ index: 1 })
  await page.getByLabel('رسید پرداخت').setInputFiles(receipt)
  await page.getByRole('button', { name: 'ارسال درخواست ثبت‌نام' }).click()
  await page.getByText('درخواست شما ثبت شد').waitFor().catch(async (e) => {
    await page.screenshot({ path: path.join(out, 'register-failure.png'), fullPage: true })
    console.error(await page.locator('main:visible').innerText())
    throw e
  })
  const href = await page.getByRole('link', { name: 'پیگیری ثبت‌نام' }).getAttribute('href')
  return { page, token: href.split('/').pop() }
}

;(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium' })
  const errors = []
  const staff = await apiLogin(staffPhone)

  // Test event setup (same management API the /manage panel uses).
  const events = await api('GET', '/manage/events/?search=' + encodeURIComponent('قصه و قهوه'), null, staff)
  let event = events.results.find((e) => e.date === '2026-10-16')
  if (!event) {
    event = await api('POST', '/manage/events/', { title: 'قصه و قهوه', description: 'دادهٔ آزمایشی محلی؛ زمان، ظرفیت و هزینهٔ واقعی را در پنل وارد کنید.', date: '2026-10-16', price_rial: 1000000, is_active: true }, staff)
    await api('POST', '/manage/slots/', { event: event.id, start_time: '10:00', end_time: '12:00', registration_ceiling: 20 }, staff)
  }
  const cards = await api('GET', '/manage/cards/?is_active=true', null, staff)
  if (!cards.results.length) await api('POST', '/manage/cards/', { label: 'کارت آزمایشی — واریز نکنید', card_number: '0000000000000000', account_holder: 'آزمایشی', bank_name: 'آزمایشی', is_active: true }, staff)
  check('test event + slot + card ready', true)

  // Show-only store
  const p = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  p.on('pageerror', (e) => errors.push(String(e)))
  await p.goto(`${origin}/catalog`)
  await p.locator('a.pcard').first().waitFor()
  check('catalog lists 8 coffees', (await p.locator('a.pcard').count()) === 8)
  const text = await p.locator('main').innerText()
  check('catalog has no price/cart', !/تومان|سبد|افزودن/.test(text))
  await p.goto(`${origin}/catalog/ethiopia-yirgacheffe`)
  await p.getByText('مشخصات قهوه').waitFor()
  const detail = await p.locator('main').innerText()
  check('detail shows spec block, no purchase UI', /یرگاچف/.test(detail) && !/تومان|سبد|افزودن/.test(detail))
  await p.goto(`${origin}/cart`)
  check('/cart redirects to catalog', p.url().endsWith('/catalog'))
  await p.goto(`${origin}/`)
  await p.getByText('قصه و قهوه').first().waitFor()
  check('landing shows event + cistern block', (await p.locator('.info-block').count()) === 1)

  // Signup + register + approve
  const unique = String(Date.now()).slice(-7)
  const a = await register(browser, `0935${unique}`, 'مهمان آزمایشی یک')
  await a.page.goto(`${origin}/submit/status/${a.token}`)
  await a.page.locator('.status-badge--pending').waitFor()
  check('new user registered, status pending via token', true)

  // Staff approves in /manage UI
  const admin = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await admin.goto(origin)
  await admin.evaluate(token => localStorage.setItem('pal_access_token', token), staff)
  await admin.goto(`${origin}/manage/registrations`)
  await admin.waitForURL(/\/manage\/registrations/)
  admin.on('dialog', (d) => d.accept())
  await admin.getByRole('button', { name: /جزئیات مهمان آزمایشی یک/ }).first().click()
  await admin.getByRole('button', { name: 'تأیید', exact: true }).click()
  await sleep(1500)
  await a.page.reload()
  await a.page.locator('.status-badge--confirmed').waitFor()
  check('staff approval in /manage → user sees confirmed', true)
  await admin.screenshot({ path: path.join(out, 'admin-1440.png') })

  // Reject → resubmit
  // OTP request + verify share a 5/min per-IP throttle. Respect it.
  await sleep(61000)
  const b = await register(browser, `0936${unique}`, 'مهمان آزمایشی دو')
  await api('POST', `/events/registrations/${b.token}/decision/`, { decision: 'reject', note: 'رسید خوانا نیست.' }, staff)
  await b.page.goto(`${origin}/submit/status/${b.token}`)
  await b.page.locator('.status-badge--rejected').waitFor()
  check('rejected shows admin note', await b.page.getByText('رسید خوانا نیست.').isVisible())
  await b.page.getByLabel('رسید جدید').setInputFiles(receipt)
  await b.page.getByRole('button', { name: 'ارسال مجدد رسید' }).click()
  await b.page.locator('.status-badge--pending').waitFor()
  check('resubmit returns to pending', true)

  // Header auth state
  await b.page.goto(`${origin}/`)
  check('account link shows my registrations when signed in', await b.page.getByRole('link', { name: 'حساب من' }).isVisible())
  if (b.page.viewportSize().width < 1001) await b.page.getByRole('button', { name: 'باز کردن منو' }).click()
  await b.page.getByRole('button', { name: 'خروج' }).click()
  await b.page.getByRole('link', { name: 'ورود' }).first().waitFor()
  check('logout returns to ورود', true)

  // Scene controls and reduced motion.
  for (const scene of ['landing', 'registration', 'about']) {
    const art = await browser.newPage()
    await art.goto(`${origin}/pal-design/${scene}-animated.html`)
    await art.locator('svg.ready').waitFor()
    check(`no pause control ${scene}`, await art.locator('#pause').count() === 0)
    await art.waitForFunction(() => document.body.classList.contains('settled'))
    check(`finite motion ${scene}`, await art.evaluate(() => document.getAnimations().length === 0))
    await art.emulateMedia({ reducedMotion: 'reduce' })
    await art.reload()
    await art.locator('svg.ready').waitFor()
    check(`reduced motion ${scene}`, await art.locator('body.settled').count() === 1 && await art.evaluate(() => document.getAnimations().length === 0))
    await art.close()
  }

  // Screenshots + overflow
  for (const width of [375, 768, 1440]) {
    const s = await browser.newPage({ viewport: { width, height: 900 } })
    s.on('pageerror', (e) => errors.push(String(e)))
    for (const route of ['/', '/catalog', '/catalog/blend-50-50', '/submit', '/about', '/login', `/submit/status/${a.token}`]) {
      if (route.startsWith('/submit/status')) {
        await s.goto(origin)
        const access = await a.page.evaluate(() => localStorage.getItem('pal_access_token'))
        await s.evaluate(token => localStorage.setItem('pal_access_token', token), access)
      }
      await s.goto(`${origin}${route}`, { waitUntil: 'networkidle' })
      if (['/', '/about', '/submit'].includes(route)) {
        const iframe = s.locator('iframe').first()
        await iframe.scrollIntoViewIfNeeded()
        await iframe.contentFrame().locator('svg.ready').waitFor()
        await sleep(3500)
      }
      const over = await s.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      check(`no horizontal scroll ${route} @${width}`, over <= 0)
      await s.screenshot({ path: path.join(out, `${route.replace(/\W+/g, '_') || 'home'}-${width}.png`), fullPage: true })
      if (['/', '/about', '/submit'].includes(route)) {
        await s.locator('iframe').screenshot({ path: path.join(out, `art-${route.replace(/\W+/g, '_')}-${width}.png`) })
      }
    }
    await s.close()
  }
  check('no page errors', errors.length === 0 || (console.log(errors), false))
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({ checks }, null, 2))
  await browser.close()
  console.log(`${checks.length} checks passed`)
})().catch((e) => { console.error(e); process.exit(1) })
