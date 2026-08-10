import { expect, test } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

async function waitForHeroImage(page: import('@playwright/test').Page) {
  const image = page.locator('#dau-trang img').first()
  await expect(image).toBeVisible()
  await image.evaluate((element) => (element as HTMLImageElement).decode())
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  }))
}

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium' || process.platform !== 'win32',
    'Visual baselines are maintained in desktop Chromium on Windows.',
  )
  await page.clock.setFixedTime(new Date('2026-08-10T05:37:00.000Z'))
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current: {
          time: '2026-08-10T12:37',
          temperature_2m: 28,
          apparent_temperature: 30,
          relative_humidity_2m: 61,
          weather_code: 2,
          wind_speed_10m: 4,
        },
      }),
    }),
  )
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
  await waitForHeroImage(page)
  const screenshot = await page.locator('#dau-trang').screenshot({ animations: 'disabled' })
  expect(screenshot).toMatchSnapshot('hero.png', { maxDiffPixelRatio: 0.002 })
})

test('mobile hero visual baseline', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitForHeroImage(page)
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
  const screenshot = await section.screenshot({
    animations: 'disabled',
    mask: [section.locator('[data-testid="media-rail"] img')],
    maskColor: '#DDE4D8',
  })
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
  await waitForHeroImage(page)
  const screenshot = await page.locator('#dau-trang').screenshot({ animations: 'disabled' })
  expect(screenshot).toMatchSnapshot('reduced-motion-hero.png', { maxDiffPixelRatio: 0.002 })
})
