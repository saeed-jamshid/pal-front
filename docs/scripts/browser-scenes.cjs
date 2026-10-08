/* eslint-disable @typescript-eslint/no-require-imports -- standalone browser check */
// Run with PLAYWRIGHT_MODULE pointing to an installed playwright-core package.
const assert = require('node:assert/strict')
const path = require('node:path')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core')

;(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM || '/usr/bin/chromium', args: ['--no-sandbox'] })
  try {
    for (const scene of ['landing', 'about', 'registration']) {
      const page = await browser.newPage()
      const errors = []
      page.on('pageerror', (error) => errors.push(String(error)))
      const file = `file://${path.resolve(`public/pal-design/${scene}-animated.html`)}`
      await page.goto(file)
      await page.waitForTimeout(100)
      assert.deepEqual(errors, [], `${scene} script errors`)

      if (scene !== 'registration') {
        const loop = page.locator('.steam').first()
        assert.equal(await loop.evaluate((el) => getComputedStyle(el).animationIterationCount), 'infinite')
        assert.equal(await loop.evaluate((el) => getComputedStyle(el).animationDuration), '3.6s')
        assert.equal(await page.locator('body').evaluate((el) => el.classList.contains('settled')), false)
        const intro = page.locator('.df').first()
        assert.ok(parseFloat(await intro.evaluate((el) => getComputedStyle(el).animationDelay)) < 1)
        await page.locator('#card').click()
        assert.match(await page.locator('#card').getAttribute('aria-label'), /بازپخش/)
      } else {
        assert.equal(await page.locator('.bean').count(), 6)
        assert.match(await page.locator('.tail').evaluate((el) => getComputedStyle(el).animationIterationCount), /infinite/)
        assert.match(await page.locator('.bean').first().evaluate((el) => getComputedStyle(el).animationIterationCount), /infinite/)
        await page.goto(`${file}#success`)
        assert.equal(await page.locator('#art').evaluate((el) => el.classList.contains('registered')), true)
        await page.waitForTimeout(700)
        assert.notEqual(await page.locator('.bean-heart').evaluate((el) => getComputedStyle(el).opacity), '0')
      }

      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.waitForTimeout(50)
      const moving = page.locator(scene === 'registration' ? '.tail' : '.steam').first()
      assert.equal(await moving.evaluate((el) => getComputedStyle(el).animationPlayState), 'paused')
      assert.deepEqual(errors, [], `${scene} errors after interaction`)
      await page.close()
      console.log(`${scene}: PASS`)
    }
  } finally {
    await browser.close()
  }
})().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
