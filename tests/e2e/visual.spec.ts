import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Visual baselines are maintained in desktop Chromium.')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll<HTMLImageElement>('#dau-trang img')).every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  )
  await page.addStyleTag({
    content: `
      *,*::before,*::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        caret-color: transparent !important;
      }
      #dau-trang .hero-media,
      #dau-trang img,
      #dau-trang [data-parallax-layer] {
        transform: none !important;
      }
    `,
  })
})

test('hero visual baseline', async ({ page }) => {
  const screenshot = await page.locator('#dau-trang').screenshot({ animations: 'disabled' })
  expect(screenshot).toMatchSnapshot('hero.png', { maxDiffPixelRatio: 0.002 })
})

test('mobile hero visual baseline', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const screenshot = await page.locator('#dau-trang').screenshot({ animations: 'disabled' })
  expect(screenshot).toMatchSnapshot('hero-mobile.png', { maxDiffPixelRatio: 0.002 })
})

test('journey visual baseline', async ({ page }) => {
  const section = page.locator('#hanh-trinh')
  await section.scrollIntoViewIfNeeded()
  const visibleImage = section.locator('.horizontal-journey img').first()
  await expect(visibleImage).toBeVisible()
  await visibleImage.evaluate((image) => (image as HTMLImageElement).decode())
  await page.addStyleTag({ content: '.site-header,.skip-link{display:none!important}' })
  const screenshot = await section.screenshot({ animations: 'disabled' })
  expect(screenshot).toMatchSnapshot('journey.png', { maxDiffPixelRatio: 0.002 })
})

test('ginseng forest visual baseline', async ({ page }) => {
  const section = page.locator('#vung-sam')
  await section.scrollIntoViewIfNeeded()
  const visibleImage = section.locator('img').first()
  await expect(visibleImage).toBeVisible()
  await visibleImage.evaluate((image) => (image as HTMLImageElement).decode())
  await page.addStyleTag({ content: '.site-header,.skip-link{display:none!important}' })
  const screenshot = await section.screenshot({ animations: 'disabled' })
  expect(screenshot).toMatchSnapshot('ginseng-forest.png', { maxDiffPixelRatio: 0.002 })
})

test('mobile menu visual baseline', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.getByRole('button', { name: /mở menu/i }).click()
  const screenshot = await page
    .getByRole('dialog', { name: /điều hướng/i })
    .screenshot({ animations: 'disabled' })
  expect(screenshot).toMatchSnapshot('mobile-menu.png', { maxDiffPixelRatio: 0.002 })
})

test('reduced-motion visual baseline', async ({ page }) => {
  const screenshot = await page.locator('#dau-trang').screenshot({ animations: 'disabled' })
  expect(screenshot).toMatchSnapshot('reduced-motion-hero.png', { maxDiffPixelRatio: 0.002 })
})
