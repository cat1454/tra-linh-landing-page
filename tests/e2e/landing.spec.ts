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

for (const width of [320, 390, 768, 1440]) {
  test(`does not overflow horizontally at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })
}

test('mobile media rail scrolls manually and controls meet the 44px touch target', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  const rail = page.locator('[data-testid="media-rail"]').first()
  await rail.evaluate((element) => element.scrollIntoView({ block: 'center' }))
  const scroller = rail.locator('.responsive-media-rail__scroller')
  const before = await scroller.evaluate((element) => element.scrollLeft)
  await scroller.evaluate((element) => element.scrollTo({ left: 320 }))
  await expect.poll(() => scroller.evaluate((element) => element.scrollLeft)).toBeGreaterThan(before)

  const filters = page.locator('#san-vat button[aria-pressed]')
  const targets = await filters.evaluateAll((buttons) => buttons.map((button) => {
    const rect = button.getBoundingClientRect()
    return { width: rect.width, height: rect.height }
  }))
  expect(
    targets.every(
      ({ width, height }) => Math.round(width) >= 44 && Math.round(height) >= 44,
    ),
  ).toBe(true)
})

test('desktop media rail pauses and reduced motion disables autoplay', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'CSS animation state is verified in Chromium.')
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')

  const rail = page.locator('[data-testid="media-rail"]').first()
  await rail.scrollIntoViewIfNeeded()
  const track = rail.locator('.responsive-media-rail__track')
  await expect.poll(() => track.evaluate((element) => getComputedStyle(element).animationName)).toBe('marquee-scroll')
  await rail.locator('.responsive-media-rail__scroller').focus()
  await expect.poll(() => track.evaluate((element) => getComputedStyle(element).animationPlayState)).toBe('paused')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect.poll(() => track.evaluate((element) => getComputedStyle(element).animationName)).toBe('none')
})

test('specialty dialog has accessible names and restores keyboard focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#san-vat')

  const trigger = page.locator('#san-vat button[aria-haspopup="dialog"]').first()
  await trigger.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  expect((await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations).toEqual([])

  await dialog.getByRole('button', { name: /đóng câu chuyện/i }).click()
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})
