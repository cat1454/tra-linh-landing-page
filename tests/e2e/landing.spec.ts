import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('landing page presents Trà Linh and its primary journey', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { level: 1, name: /giữa đại ngàn/i }),
  ).toBeVisible()
  await expect(page.getByText('Trà Linh', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /khám phá hành trình/i }).first()).toHaveAttribute(
    'href',
    '#hanh-trinh',
  )
  await expect(page.locator('body')).not.toContainText('Trà Lĩnh')
})

test('homepage has no automatically detectable accessibility violations', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('mobile menu exposes the navigation', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await page.getByRole('button', { name: /mở menu/i }).click()

  await expect(page.getByRole('dialog', { name: /điều hướng/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /cẩm nang/i })).toBeVisible()
})

test('hero plays its public video and falls back to the poster for reduced motion', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Video playback is verified in Chromium.')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')

  const video = page.locator('#dau-trang video')
  await expect(video.locator('source')).toHaveAttribute(
    'src',
    '/videos/tra-linh-hero.mp4',
  )
  await expect
    .poll(() => video.evaluate((element) => (element as HTMLVideoElement).currentTime))
    .toBeGreaterThan(0)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(video).toHaveCSS('display', 'none')
  await expect(page.locator('#dau-trang img')).toBeVisible()
})

for (const width of [320, 768, 1024, 1440, 1920]) {
  test(`does not overflow horizontally at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })
}
