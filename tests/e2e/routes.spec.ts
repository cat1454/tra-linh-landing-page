import { expect, test } from '@playwright/test'

test('published detail routes render curated content and a skip target', async ({ page }) => {
  const response = await page.goto('/hanh-trinh/trekking-duoi-tan-rung', {
    waitUntil: 'domcontentloaded',
  })

  expect(response?.ok()).toBe(true)
  await expect(page.locator('main#noi-dung-chinh')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('unknown or unpublished slugs return 404', async ({ page }) => {
  const response = await page.goto('/hanh-trinh/hanh-trinh-chua-xuat-ban', {
    waitUntil: 'domcontentloaded',
  })

  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: /không tìm thấy trang/i })).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByRole('link', { name: /về trang chủ/i })).toHaveAttribute('href', '/')
})

test('privacy route is indexable and links back home', async ({ page }) => {
  const response = await page.goto('/chinh-sach-quyen-rieng', {
    waitUntil: 'domcontentloaded',
  })

  expect(response?.ok()).toBe(true)
  await expect(page.getByRole('heading', { name: 'Chính sách quyền riêng tư' })).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/chinh-sach-quyen-rieng$/,
  )
})

test('planning, search, FAQ, and English routes are public', async ({ page }) => {
  for (const route of ['/thoi-tiet', '/tim-kiem', '/cau-hoi-thuong-gap', '/vi', '/en']) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
    expect(response?.ok(), `${route} should return HTTP 200`).toBe(true)
    await expect(page.locator('main#noi-dung-chinh')).toBeVisible()
  }
})

test('English route exposes English metadata and document language', async ({ page }) => {
  await page.goto('/en', { waitUntil: 'domcontentloaded' })

  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page).toHaveTitle(/Tra Linh/i)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Tra Linh/i)
})

test('retired admin routes stay unavailable on the static public site', async ({ page }) => {
  for (const route of ['/admin', '/admin/login']) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: /không tìm thấy trang/i })).toBeVisible()
  }
})
