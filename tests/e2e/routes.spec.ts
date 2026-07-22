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
  await expect(page.getByRole('heading', { name: /không tìm thấy trang/i })).toBeVisible()
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

test('admin explains the safe fallback state when CMS is not configured', async ({ page }) => {
  const response = await page.goto('/admin', { waitUntil: 'domcontentloaded' })

  expect(response?.ok()).toBe(true)
  await expect(page.locator('main#noi-dung-chinh')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Chưa kết nối CMS' })).toBeVisible()
})

test('admin login remains unavailable without a configured CMS', async ({ page }) => {
  const response = await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })

  expect(response?.ok()).toBe(true)
  await expect(page.getByRole('heading', { name: 'Đăng nhập quản trị' })).toBeVisible()
  await expect(page.getByText('Chưa kết nối CMS')).toBeVisible()
  await expect(page.getByLabel('Email quản trị')).toHaveCount(0)
})
