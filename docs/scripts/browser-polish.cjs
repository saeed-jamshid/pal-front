/* eslint-disable @typescript-eslint/no-require-imports -- standalone browser check */
// Read-only local UI checks. Reuse an installed Playwright, no project dependency.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const origin = process.env.PAL_ORIGIN || 'http://localhost:3000'
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin).hostname))
const out = process.env.PAL_EVIDENCE_DIR || '/tmp/pal-polish'
fs.mkdirSync(out, { recursive: true })
const checks = []
const check = (name, ok) => { assert.ok(ok, name); checks.push(name); console.log('PASS', name) }
const delay = ms => new Promise(r => setTimeout(r, ms))
async function labelsFit(page, suffix) {
  check(`printed labels fit ${suffix}`, await page.locator('.bag-label').evaluateAll(labels => labels.every(e => {
    const box = e.getBoundingClientRect()
    return e.scrollHeight <= e.clientHeight + 1 && [...e.children].every(child => {
      const r = child.getBoundingClientRect()
      return r.left >= box.left - 1 && r.right <= box.right + 1 && r.top >= box.top - 1 && r.bottom <= box.bottom + 1
    })
  })))
}
;(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium' })
  const errors = []
  try {
    for (const width of [320, 375, 400, 430, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } })
      page.on('pageerror', e => errors.push(String(e)))
      await page.goto(`${origin}/catalog`)
      await page.locator('.pcard').first().waitFor()
      await page.waitForFunction(() => document.querySelectorAll('.pcard').length === 8)
      await page.evaluate(() => document.fonts.ready)
      check(`three categories @${width}`, JSON.stringify(await page.locator('.cats button').allTextContents()) === JSON.stringify(['همه', 'تک خاستگاه', 'تخصصی', 'تجاری']))
      check(`no overflow @${width}`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      const trigger = page.locator('.navigation-trigger')
      const cta = await page.locator('.nav-cta').boundingBox()
      check(`event CTA in top bar @${width}`, cta.y < 24 && cta.height >= 44)
      if (width < 1001) {
        const t = await trigger.boundingBox()
        check(`menu button bottom-right @${width}`, t.width >= 56 && t.x > width / 2)
        check(`desktop nav hidden @${width}`, await page.locator('.desktop-nav').isHidden())
        check(`closed nav hidden @${width}`, await page.locator('#public-menu').isHidden())
        await trigger.click()
        await page.waitForFunction(() => document.querySelector('.navigation-trigger').getAttribute('aria-expanded') === 'true')
        check(`menu opens @${width}`, await page.locator('#public-menu').isVisible())
        await page.keyboard.press('Escape')
        await page.waitForFunction(() => document.querySelector('.navigation-trigger').getAttribute('aria-expanded') === 'false')
        check(`Escape returns focus @${width}`, await trigger.evaluate(e => e === document.activeElement))
        await trigger.click()
        await page.locator('h1').click()
        check(`outside dismissal @${width}`, !await page.locator('#public-menu').evaluate(e => e.matches(':popover-open')))
      } else {
        check('desktop navbar four links + event button', await page.locator('.desktop-nav a').count() === 4 && await page.locator('.desktop-nav').isVisible() && await page.locator('.nav-cta').isVisible())
        check('desktop no floating menu', await trigger.isHidden())
      }
      await labelsFit(page, `@${width}`)
      const ids = await page.locator('.coffee-art clipPath').evaluateAll(es => es.map(e => e.id))
      check(`unique SVG clips @${width}`, new Set(ids).size === 8)
      await page.screenshot({ path: `${out}/catalog-${width}.png`, fullPage: true })
      await page.getByRole('button', { name: 'تخصصی', exact: true }).click()
      await page.waitForFunction(() => document.querySelectorAll('.pgrid .pcard').length === 2)
      check(`specialty lists Drugar + Yirgacheffe @${width}`, page.url().includes('category=commercial')
        && await page.locator('a[href="/catalog/drugar-natural"]').count() === 1 && await page.locator('a[href="/catalog/ethiopia-yirgacheffe"]').count() === 1)
      if (width < 1001) await trigger.click()
      await page.locator(width < 1001 ? '#public-menu' : '.desktop-nav').getByRole('link', { name: 'خانه', exact: true }).click()
      await page.waitForURL(origin + '/')
      check(`nav closes on route @${width}`, !await page.locator('#public-menu').evaluate(e => e.matches(':popover-open')))
      await page.locator('.pal-story').scrollIntoViewIfNeeded()
      await delay(1600)
      check(`historical story revealed @${width}`, await page.locator('.story-copy').evaluate(e => +getComputedStyle(e).opacity === 1 && e.textContent.includes('قهوه فقط یک نوشیدنی نیست')))
      check(`footer contacts + links @${width}`, await page.locator('footer a[href="https://instagram.com/palcoffee.ir"]').isVisible()
        && await page.locator('footer a[href="https://t.me/pooriya_mqdm"]').isVisible() && await page.locator('footer a[href="tel:+989393258985"]').isVisible()
        && await page.locator('footer a[href="/about"]').isVisible() && await page.locator('footer a[href="/submit"]').isVisible())
      await page.screenshot({ path: `${out}/home-${width}.png`, fullPage: true })
      if (width === 375 || width === 1440) {
        for (const route of ['/', '/about', '/submit']) {
          await page.goto(origin + route)
          const iframe = page.locator('iframe').first()
          await iframe.scrollIntoViewIfNeeded()
          await iframe.contentFrame().locator('svg').first().waitFor()
          check(`borderless art ${route} @${width}`, await iframe.evaluate(e => !e.closest('.arch')))
          await delay(5100)
          await iframe.screenshot({ path: `${out}/art-${route.replace(/\W/g, '_')}-${width}.png` })
          await page.screenshot({ path: `${out}/page-${route.replace(/\W/g, '_')}-${width}.png`, fullPage: true })
        }
      }
      await page.close()
    }
    const mouse = await browser.newPage()
    await mouse.goto(origin + '/catalog')
    const card = mouse.locator('a.pcard').first()
    await card.waitFor()
    await card.hover()
    await delay(250)
    check('hover motif activates', await card.locator('.bag-branch').evaluate(e => getComputedStyle(e).transform !== 'none'))
    await mouse.mouse.move(0, 0)
    await delay(250)
    check('unhover returns neutral', await card.locator('.bag-branch').evaluate(e => getComputedStyle(e).transform === 'none'))
    await mouse.close()
    const touch = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true })
    await touch.goto(origin + '/catalog')
    await touch.locator('a.pcard').first().tap()
    await touch.waitForURL(/\/catalog\/.+/)
    check('single tap opens coffee', true)
    await touch.locator('.navigation-trigger').tap()
    await touch.locator('#public-menu').getByRole('link', { name: 'خانه', exact: true }).tap()
    await touch.waitForURL(origin + '/')
    check('touch menu navigation', true)
    await touch.setViewportSize({ width: 812, height: 375 })
    await touch.locator('.navigation-trigger').tap()
    check('landscape menu bounded', await touch.locator('#public-menu').evaluate(e => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight }))
    await touch.close()

    const long = await browser.newPage({ viewport: { width: 320, height: 900 } })
    await long.route('**/api/v1/products/**', async route => {
      const res = await route.fetch(), data = await res.json()
      if (data.results) data.results[0].name = 'W'.repeat(180)
      await route.fulfill({ response: res, json: data })
    })
    await long.goto(origin + '/catalog')
    await long.locator('.bag-label').first().waitFor()
    await labelsFit(long, '180-character title')
    check('long heading wraps without page overflow', await long.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await long.close()

    // Scenes keep ambient loops (user choice): no pause UI, and reduced motion freezes everything.
    for (const variant of ['landing', 'registration', 'about', 'registration#success']) {
      const page = await browser.newPage()
      const [scene, hash] = variant.split('#')
      await page.goto(`${origin}/pal-design/${scene}-animated.html${hash ? '#' + hash : ''}`)
      await page.locator('svg').first().waitFor()
      check(`no pause button ${variant}`, await page.locator('#pause').count() === 0)
      check(`scene animates ${variant}`, await page.evaluate(() => document.getAnimations().some(a => a.playState === 'running')))
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.reload()
      await page.locator('svg').first().waitFor()
      await delay(300)
      check(`initial reduced motion is still ${variant}`, await page.evaluate(() => document.getAnimations().every(a => a.playState !== 'running')))
      await page.close()
    }
    const nojs = await browser.newPage({ javaScriptEnabled: false })
    await nojs.goto(origin)
    check('story readable without JS', await nojs.locator('.story-copy').isVisible())
    await nojs.close()
    check('no page errors', errors.length === 0 || (console.error(errors), false))
    fs.writeFileSync(`${out}/report.json`, JSON.stringify({ checks }, null, 2))
    console.log(`${checks.length} checks passed`)
  } finally { await browser.close() }
})().catch(e => { console.error(e); process.exitCode = 1 })
