const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const origin = process.env.PAL_ORIGIN || 'http://localhost:3000'
const out = process.env.PAL_EVIDENCE_DIR || '/tmp/pal-vira-contact'
fs.mkdirSync(out, { recursive: true })
;(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium' })
  let checks = 0
  const check = (name, value) => { assert.ok(value, name); checks++; console.log('PASS', name) }
  try {
    for (const width of [320, 390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } })
      await page.goto(origin + '/login')
      const trigger = page.getByRole('button', { name: 'اطلاعات تماس ویرا رایانش سپهر', exact: true })
      await trigger.scrollIntoViewIfNeeded()
      await page.screenshot({ path: `${out}/footer-${width}.png` })
      await trigger.focus(); await page.keyboard.press('Enter')
      const dialog = page.getByRole('dialog', { name: 'ویرا رایانش سپهر' })
      await dialog.waitFor()
      await dialog.evaluate(e => Promise.all(e.getAnimations().map(a => a.finished)))
      check(`dialog within viewport @${width}`, await dialog.evaluate(e => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight }))
      check(`dialog opens by keyboard @${width}`, await dialog.isVisible())
      check(`phone href @${width}`, await dialog.getByRole('link', { name: /تلفن/ }).getAttribute('href') === 'tel:+989155649881')
      check(`Telegram href @${width}`, await dialog.getByRole('link', { name: /تلگرام/ }).getAttribute('href') === 'https://t.me/ViraRayaneshSepehr')
      const linkedin = dialog.getByRole('link', { name: /لینکدین/ })
      check(`LinkedIn secure new tab @${width}`, await linkedin.getAttribute('href') === 'https://www.linkedin.com/company/vira-rayanesh-sepehr' && await linkedin.getAttribute('target') === '_blank' && (await linkedin.getAttribute('rel')).includes('noopener'))
      check(`no overflow @${width}`, await dialog.evaluate(e => e.scrollWidth <= e.clientWidth) && await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      for (let i = 0; i < 8; i++) await page.keyboard.press('Tab')
      check(`focus trapped @${width}`, await dialog.evaluate(e => e.contains(document.activeElement)))
      await page.screenshot({ path: `${out}/dialog-${width}.png` })
      await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' })
      check(`Escape restores trigger focus @${width}`, await trigger.evaluate(e => e === document.activeElement))
      await trigger.click(); await dialog.waitFor()
      await page.mouse.click(4, 4); await dialog.waitFor({ state: 'hidden' })
      check(`outside click closes @${width}`, !(await dialog.isVisible()))
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await trigger.click(); await dialog.waitFor()
      check(`reduced motion @${width}`, await dialog.evaluate(e => getComputedStyle(e).animationName === 'none'))
      await page.getByRole('button', { name: 'بستن اطلاعات ویرا' }).click()
      await dialog.waitFor({ state: 'hidden' })
      await page.close()
    }
    console.log(`${checks} checks passed`)
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
