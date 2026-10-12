// Local presentation checks. All API responses mocked; no DB writes or SMS.
// PLAYWRIGHT_MODULE=/path/to/playwright-core PAL_ORIGIN=http://localhost:3005 node docs/scripts/browser-redesign.cjs
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const origin = process.env.PAL_ORIGIN || 'http://localhost:3005'
assert.ok(['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
const out = process.env.PAL_EVIDENCE_DIR || '/tmp/pal-redesign'
fs.mkdirSync(out, { recursive: true })
const categories = [{ id: 1, slug: 'single-origin', name: 'تک خاستگاه' }, { id: 2, slug: 'blends', name: 'تجاری' }]
const products = ['اوگاندا', 'Ethiopia Yirgacheffe / Natural', 'قهوه با نام طولانی برای بررسی نمایش کامل عنوان در گوشی', 'کلمبیا', 'Brazil Santos', 'ترکیب پَل'].map((name, i) => ({ id: i + 1, name, slug: `coffee-${i}`, category: i === 5 ? 2 : 1, images: i === 4 ? [{ image: '/img/gallery/optimized/0.webp' }] : [], origin: 'خاستگاه آزمایشی', roast_level: 'medium', tasting_notes: 'شکلات، کارامل', short_description: 'داده آزمایشی برای بررسی ظاهر', description: 'توضیح آزمایشی قهوه.', price: '100000', is_featured: true }))
const event = { id: 1, title: 'دورهمی آزمایشی پَل', description: 'داده آزمایشی محلی', date: '2026-10-16', price_rial: 0, time_slots: [{ id: 1, start_time: '10:00:00', end_time: '12:00:00', registration_ceiling: 20, remaining_capacity: 10 }] }
const list = results => ({ count: results.length, next: null, previous: null, results })
;(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium', args: ['--no-sandbox'] })
  const checks = [], errors = [], writes = [], failedAssets = []
  const check = (name, ok) => { assert.ok(ok, name); checks.push(name); console.log('PASS', name) }
  try {
    for (const width of [320, 390, 840, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
      const page = await context.newPage()
      page.on('pageerror', e => errors.push(e.message))
      page.on('response', res => { if (res.status() >= 400 && /^\/(?:_next|brand|fonts|img)\//.test(new URL(res.url()).pathname)) failedAssets.push(res.url()) })
      let mode = 'ready'
      await page.route('**/api/v1/**', route => {
        const req = route.request(), path = new URL(req.url()).pathname
        if (req.method() !== 'GET') {
          writes.push(path)
          return route.fulfill({ status: 503, json: { detail: 'ارسال پیامک در حال حاضر فعال نیست.' } })
        }
        if (path.includes('/manage/overview/')) return route.fulfill({ json: { user: { id: 1, full_name: 'Test staff', phone_number: '09120000000' }, products: 6, orders: 0, customers: 0, unfulfilled: 0, registrations_pending: 0, receipts_pending: 0, paid_total_rial: 0 } })
        if (path.includes('/manage/')) return route.fulfill({ json: list(path.includes('/categories/') ? categories : products) })
        if (path.endsWith('/categories/')) return route.fulfill({ json: categories })
        if (path.endsWith('/products/')) return route.fulfill({ status: mode === 'error' ? 503 : 200, json: mode === 'error' ? {} : list(mode === 'empty' ? [] : products) })
        if (path.includes('/products/coffee-')) return route.fulfill({ json: products.find(p => path.endsWith(`/${p.slug}/`)) })
        if (path.endsWith('/events/')) return route.fulfill({ json: list([event]) })
        return route.fulfill({ json: list([]) })
      })
      // Third-party trust seal remains unchanged; exclude external availability from local checks.
      await page.route('https://trustseal.enamad.ir/**', route => route.abort())
      for (const route of ['/', '/catalog', '/catalog/coffee-0', '/catalog/coffee-4', '/about', '/gallery', '/submit', '/login', '/submit/status/test', '/missing-redesign-page']) {
        await page.goto(origin + route, { waitUntil: 'networkidle' })
        await page.locator('main').first().waitFor()
        check(`no overflow ${route} @${width}`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        check(`public palette ${route} @${width}`, await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--surface-100').trim() === '#f1f1f2'))
        if (route === '/') {
          check(`hero logo replaces iframe @${width}`, await page.locator('.hero-lockup img').count() === 1 && await page.locator('.hero-art iframe').count() === 0)
          check(`featured selection unchanged @${width}`, await page.locator('a.pcard').count() === 3)
          await page.locator('.info-block .btn').focus()
          check(`focus on dark panel @${width}`, await page.locator('.info-block .btn').evaluate(e => getComputedStyle(e).outlineColor === 'rgb(255, 255, 255)'))
          await page.locator('.info-block .btn').evaluate(e => e.blur())
        }
        if (route === '/catalog') {
          check(`six real cards, no purchase UI @${width}`, await page.locator('a.pcard').count() === 6 && !/تومان|افزودن به سبد/.test(await page.locator('main').innerText()))
          check(`Persian title direction @${width}`, await page.locator('.pcard__name').first().evaluate(e => getComputedStyle(e).direction === 'rtl'))
          check(`uploaded photo retained @${width}`, (await page.locator('.pcard__media img').nth(4).getAttribute('src')).includes(encodeURIComponent('/img/gallery/optimized/0.webp')))
          await page.screenshot({ path: `${out}/catalog-${width}.png`, fullPage: true })
          await page.locator('.cats button').last().click()
          check(`local filter @${width}`, await page.locator('a.pcard').count() === 1)
          await page.locator('.cats button').first().click()
          check(`filter restores @${width}`, await page.locator('a.pcard').count() === 6)
        }
        if (route === '/catalog/coffee-0') check(`no packaging caption @${width}`, await page.locator('.mockup-caption').count() === 0)
        if (route === '/catalog/coffee-4') check(`real image no mockup caption @${width}`, await page.locator('.mockup-caption').count() === 0)
        if (route === '/gallery') {
          await page.locator('.gallery-thumbnail').first().click()
          await page.locator('.gallery-viewer').waitFor()
          await page.keyboard.press('ArrowRight')
          check(`gallery keyboard next @${width}`, await page.locator('.gallery-count').innerText() === '2 / 24')
          await page.keyboard.press('Escape')
          await page.locator('.gallery-viewer').waitFor({ state: 'hidden' })
          check(`gallery restores focus @${width}`, await page.locator('.gallery-thumbnail').first().evaluate(e => document.activeElement === e))
        }
        if (['/', '/about', '/submit', '/login', '/catalog/coffee-0'].includes(route)) await page.screenshot({ path: `${out}/${route.replace(/\W/g, '-') || 'home'}-${width}.png`, fullPage: true })
      }
      if (width < 1001) {
        await page.goto(origin)
        await page.getByRole('button', { name: 'باز کردن منو' }).click()
        check(`mobile menu opens @${width}`, await page.locator('#public-menu').evaluate(e => e.matches(':popover-open')))
        await page.keyboard.press('Escape')
        check(`mobile Escape @${width}`, !await page.locator('#public-menu').evaluate(e => e.matches(':popover-open')))
      }
      for (mode of ['error', 'empty']) {
        await page.goto(origin + '/catalog', { waitUntil: 'networkidle' })
        check(`catalog ${mode} @${width}`, mode === 'error' ? await page.getByRole('button', { name: 'تلاش دوباره' }).isVisible() : await page.locator('.catalog-empty').isVisible())
        if (mode === 'error') { mode = 'ready'; await page.getByRole('button', { name: 'تلاش دوباره' }).click(); await page.locator('a.pcard').first().waitFor(); check(`retry @${width}`, await page.locator('a.pcard').count() === 6) }
      }
      await page.evaluate(() => localStorage.setItem('pal_access_token', 'mock-staff'))
      await page.goto(origin + '/manage/products', { waitUntil: 'networkidle' })
      check(`warm admin palette @${width}`, await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--surface-100').trim() === '#efe3cf'))
      await page.getByRole('button', { name: 'افزودن محصول', exact: true }).click()
      check(`warm portal @${width}`, await page.getByRole('dialog').evaluate(e => getComputedStyle(e).getPropertyValue('--adm-surface').trim() === '#efe3cf'))
      await page.screenshot({ path: `${out}/admin-dialog-${width}.png`, fullPage: true })
      await page.keyboard.press('Escape')
      await page.goto(origin + '/catalog', { waitUntil: 'networkidle' })
      check(`public palette restored after admin @${width}`, await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--surface-100').trim() === '#f1f1f2'))
      await context.close()
    }
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } })
      await page.route('**/api/v1/**', route => route.fulfill({ json: route.request().url().includes('/categories/') ? categories : list(route.request().url().includes('/products/') ? products : []) }))
      await page.route('https://trustseal.enamad.ir/**', route => route.abort())
      await page.goto(origin, { waitUntil: 'domcontentloaded' })
      const art = page.locator('.hero-lockup')
      check(`hero entrance enabled @${width}`, await art.evaluate(e => {
        const logo = getComputedStyle(e.querySelector('img'))
        const circle = getComputedStyle(e, '::before'), ring = getComputedStyle(e, '::after')
        return logo.animationName === 'hero-logo-in' && circle.animationName === 'hero-circle-in' && ring.animationName === 'hero-ring-in' && [logo, circle, ring].every(s => s.animationIterationCount === '1')
      }))
      await art.evaluate(e => Promise.all(e.getAnimations({ subtree: true }).map(a => a.finished)))
      check(`hero settles fully visible @${width}`, await art.evaluate(e => {
        const logo = getComputedStyle(e.querySelector('img'))
        return logo.opacity === '1' && (logo.transform === 'none' || new DOMMatrix(logo.transform).isIdentity) && !e.getAnimations({ subtree: true }).some(a => a.playState === 'running')
      }))
      check(`hero entrance no overflow @${width}`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      await page.screenshot({ path: `${out}/hero-entrance-${width}.png` })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      check(`hero reduced motion @${width}`, await art.evaluate(e => {
        const logo = getComputedStyle(e.querySelector('img'))
        return logo.opacity === '1' && logo.animationName === 'none' && getComputedStyle(e, '::before').animationName === 'none' && getComputedStyle(e, '::after').animationName === 'none'
      }))
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await page.goto(origin + '/catalog', { waitUntil: 'networkidle' })
      const card = page.locator('a.pcard').first()
      check(`bag and swirl entrance @${width}`, await card.evaluate(e => {
        const bag = getComputedStyle(e.querySelector('img')), swirl = getComputedStyle(e.querySelector('.pcard__media'), '::before')
        return bag.animationName === 'package-bag-in' && swirl.animationName === 'package-swirl-in' && bag.animationIterationCount === '1' && swirl.animationIterationCount === '1'
      }))
      await card.evaluate(e => Promise.all(e.getAnimations({ subtree: true }).map(a => a.finished)))
      check(`swirl settles visible @${width}`, await card.evaluate(e => getComputedStyle(e.querySelector('.pcard__media'), '::before').opacity === '0.8' && getComputedStyle(e.querySelector('img')).opacity === '1'))
      await page.screenshot({ path: `${out}/package-entrance-${width}.png`, fullPage: true })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      check(`package reduced motion @${width}`, await card.evaluate(e => getComputedStyle(e.querySelector('img')).animationName === 'none' && getComputedStyle(e.querySelector('.pcard__media'), '::before').animationName === 'none'))
      await page.goto(origin, { waitUntil: 'networkidle' })
      const story = page.locator('.pal-story')
      await story.scrollIntoViewIfNeeded()
      check(`supplied drip replaces branches @${width}`, await story.locator('.story-drip').getAttribute('viewBox') === '0 0 120 120' && await story.locator('.story-branch').count() === 0 && await story.locator('.story-drop').count() === 2 && await story.locator('.story-drip > circle').getAttribute('r') === '56')
      check(`static drip reduced motion @${width}`, await story.locator('.story-drop--first').evaluate(e => getComputedStyle(e).opacity === '1' && getComputedStyle(e).animationName === 'none'))
      await page.screenshot({ path: `${out}/story-drip-${width}.png` })
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await page.reload({ waitUntil: 'networkidle' })
      await story.scrollIntoViewIfNeeded()
      await page.waitForFunction(() => document.querySelector('.pal-story').classList.contains('story-entering'))
      check(`story finite drip @${width}`, await story.locator('.story-drop--first').evaluate(e => getComputedStyle(e).animationName === 'story-drip' && getComputedStyle(e).animationIterationCount === '3'))
      await story.evaluate(e => Promise.all(e.getAnimations({ subtree: true }).map(a => a.finished)))
      check(`story settles @${width}`, await story.evaluate(e => !e.getAnimations({ subtree: true }).some(a => a.playState === 'running') && getComputedStyle(e.querySelector('.story-copy')).opacity === '1'))
      await page.close()
    }
    for (const scene of ['about', 'registration']) {
      const page = await browser.newPage()
      page.on('pageerror', e => errors.push(e.message))
      await page.goto(origin + '/pal-design/' + scene + '-animated.html')
      check('scene palette ' + scene, await page.evaluate(() => getComputedStyle(document.body).backgroundColor === 'rgb(241, 241, 242)'))
      await page.locator('#card').click()
      if (scene === 'registration') {
        check('cat tap reaction', await page.locator('#art').getAttribute('data-mood') === 'surprised')
        await page.goto(origin + '/pal-design/registration-animated.html#success')
        check('success cat retained', await page.locator('#art').evaluate(e => e.classList.contains('registered')))
      } else check('about replay', await page.locator('#art').evaluate(e => e.classList.contains('play')))
      await page.emulateMedia({ reducedMotion: 'reduce' })
      check('scene reduced motion ' + scene, await page.locator('.steam').first().evaluate(e => getComputedStyle(e).animationName === 'none'))
      await page.close()
    }
    check('no page errors', errors.length === 0)
    check('no API writes or SMS', writes.length === 0)
    check('no failed same-origin assets', failedAssets.length === 0)
    fs.writeFileSync(`${out}/report.json`, JSON.stringify({ checks, errors, writes, failedAssets }, null, 2))
    console.log(`${checks.length} checks passed`)
  } finally { await browser.close() }
})().catch(e => { console.error(e); process.exitCode = 1 })
