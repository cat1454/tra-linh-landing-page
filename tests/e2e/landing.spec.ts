import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('landing page presents the published CMS hero', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#dau-trang')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByText('Trà Linh', { exact: true }).first()).toBeVisible()
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

  const dialog = page.getByRole('dialog', { name: /điều hướng/i })
  await expect(dialog).toBeVisible()
  const guideLink = dialog.getByRole('link', { name: /cẩm nang/i })
  await expect(guideLink).toBeVisible()
  await guideLink.click()
  await expect(page.getByRole('dialog', { name: /điều hướng/i })).toBeHidden()
  await expect(page).toHaveURL(/#cam-nang$/)
})

test('configured contact section exposes the complete production form', async ({ page }) => {
  await page.goto('/#lien-he')

  await expect(page.getByRole('heading', { name: /cùng chuẩn bị/i })).toBeVisible()
  await expect(page.getByLabel('Họ và tên')).toHaveAttribute('required', '')
  await expect(page.getByLabel('Số điện thoại')).toHaveAttribute('required', '')
  await expect(page.getByLabel('Email')).toHaveAttribute('required', '')
  await expect(page.getByLabel(/bạn quan tâm/i)).toHaveAttribute('required', '')
  await expect(page.getByLabel('Lời nhắn')).toHaveAttribute('required', '')
  await expect(page.getByLabel(/tôi đồng ý/i)).toHaveAttribute('required', '')
  await expect(page.getByRole('button', { name: 'Gửi yêu cầu' })).toBeEnabled()
})

for (const width of [375, 390]) {
  test(`mobile sticky CTA respects the safe content area at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 })
    await page.goto('/')

    const sticky = page.getByRole('navigation', { name: /thao tác nhanh/i })
    await expect(sticky).toBeVisible()
    await expect(sticky.getByRole('link', { name: /chỉ đường/i })).toHaveAttribute(
      'href',
      /google\.com\/maps/,
    )
    const spacing = await page.evaluate(() => {
      const bar = document.querySelector<HTMLElement>('.mobile-sticky-cta')
      return {
        bodyPadding: Number.parseFloat(getComputedStyle(document.body).paddingBottom),
        barHeight: bar?.getBoundingClientRect().height ?? 0,
      }
    })
    expect(spacing.bodyPadding).toBeGreaterThanOrEqual(spacing.barHeight)
  })
}

test('hero loads its configured video and falls back to the poster for reduced motion', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Video playback is verified in Chromium.')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')

  const video = page.locator('#dau-trang video')
  await expect(video.locator('source')).toHaveAttribute('src', /^(?:https?:\/\/|\/).+/)
  await expect(page.locator('#dau-trang img')).toBeVisible()

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(video).toHaveCount(0)
  await expect(page.locator('#dau-trang img')).toBeVisible()
})

for (const width of [375, 390, 768, 1024, 1440]) {
  test(`does not overflow horizontally at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })
}
