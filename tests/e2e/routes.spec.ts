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
