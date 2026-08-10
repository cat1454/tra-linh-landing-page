import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('landing page presents the published CMS hero', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#dau-trang')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByText('Trà Linh', { exact: true }).first()).toBeVisible()
  await expect(page.locator('body')).not.toContainText('Trà Lĩnh')
  await expect(page.getByRole('link', { name: /switch to english/i })).toHaveCount(0)
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

test('contact lives in the footer and exposes official channels without collecting personal data', async ({ page }) => {
  await page.goto('/#lien-he')

  await expect(page.locator('main #lien-he')).toHaveCount(0)
  const footer = page.locator('footer#lien-he')
  await expect(footer).toBeVisible()
  await expect(footer.getByRole('heading', { name: /liên hệ & hỗ trợ chuyến đi/i })).toBeVisible()
  await expect(footer.getByRole('link', { name: /nhắn fanpage/i })).toHaveAttribute('href', /facebook\.com/)
  await expect(footer.getByRole('link', { name: /gọi 037\.667\.1456/i })).toHaveAttribute('href', 'tel:0376671456')
  await expect(footer.getByRole('link', { name: /gửi email tralinh\.namtramy@danang\.gov\.vn/i })).toHaveAttribute('href', 'mailto:tralinh.namtramy@danang.gov.vn')
  await expect(footer.getByText(/phản hồi trong giờ hành chính/i)).toBeVisible()
  await expect(page.locator('#lien-he input, #lien-he textarea')).toHaveCount(0)
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

test('mobile footer keeps the project credit as one readable paragraph', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const credit = page.getByTestId('footer-project-credit')
  await credit.scrollIntoViewIfNeeded()
  await expect(credit).toContainText(
    'hỗ trợ triển khai trong Chiến dịch Mùa hè Xanh 2026',
  )
  const lineCount = await credit.evaluate((element) => {
    const style = getComputedStyle(element)
    return element.getBoundingClientRect().height / Number.parseFloat(style.lineHeight)
  })
  expect(lineCount).toBeLessThanOrEqual(5)
})

test('hero uses a lightweight poster and loads YouTube only on request', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#dau-trang video')).toHaveCount(0)
  await expect(page.locator('#dau-trang iframe')).toHaveCount(0)
  await expect(page.locator('#dau-trang .hero-media img')).toBeVisible()

  const trigger = page.getByRole('button', { name: /xem video giới thiệu/i })
  const card = page.getByRole('region', { name: /video giới thiệu trà linh/i })
  const cardBox = await card.boundingBox()
  expect(cardBox?.width).toBeLessThanOrEqual(360)
  await trigger.click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(card.getByTitle('Video giới thiệu Trà Linh')).toHaveAttribute(
    'src',
    /youtube-nocookie\.com\/embed\/NrI3fP5kq3A/,
  )
})

test('mobile hero centers the inline video card', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const box = await page
    .getByRole('region', { name: /video giới thiệu trà linh/i })
    .boundingBox()
  expect(box).not.toBeNull()
  expect(Math.abs((box?.x ?? 0) + (box?.width ?? 0) / 2 - 195)).toBeLessThanOrEqual(1)
})

test('removed shortcut bar stays absent while back-to-top remains available', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('navigation', { name: /tác vụ nhanh/i })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /tiết kiệm dữ liệu:/i })).toHaveCount(0)

  const backToTop = page.getByRole('link', { name: /quay lại đầu trang/i })
  await backToTop.scrollIntoViewIfNeeded()
  await expect(backToTop).toHaveAttribute('href', '#dau-trang')
  await backToTop.click()
  await expect(page).toHaveURL(/#dau-trang$/)
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
  await expect(rail.getByTestId('media-rail-originals').getByRole('img')).toHaveCount(64)
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
    `Filter touch targets: ${JSON.stringify(targets)}`,
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

  const closeButton = dialog.getByRole('button', { name: /đóng câu chuyện/i })
  await closeButton.focus()
  await page.keyboard.press('Enter')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})
