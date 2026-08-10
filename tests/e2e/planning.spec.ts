import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const forecastResponse = {
  current: {
    time: '2026-08-10T10:00',
    temperature_2m: 19,
    apparent_temperature: 19,
    relative_humidity_2m: 80,
    weather_code: 2,
    wind_speed_10m: 6,
  },
  daily: {
    time: Array.from({ length: 7 }, (_, index) => `2026-08-${10 + index}`),
    weather_code: [2, 3, 61, 63, 0, 45, 80],
    temperature_2m_max: [22, 21, 20, 20, 23, 19, 18],
    temperature_2m_min: [15, 15, 14, 14, 16, 13, 13],
    precipitation_probability_max: [20, 30, 70, 80, 10, 40, 85],
  },
}

test('seven-day forecast renders complete Open-Meteo data', async ({ page }) => {
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(forecastResponse) }),
  )
  await page.goto('/thoi-tiet')

  await expect(page.getByRole('heading', { name: 'Dự báo 7 ngày' })).toBeVisible()
  await expect(page.locator('article')).toHaveCount(7)
  await expect(page.getByText(/cập nhật lúc 2026-08-10 10:00/i)).toBeVisible()
})

test('forecast failure keeps a useful retry path', async ({ page }) => {
  await page.route('https://api.open-meteo.com/**', (route) => route.fulfill({ status: 503 }))
  await page.goto('/thoi-tiet')

  await expect(page.locator('div[role="alert"]').filter({ hasText: 'Chưa thể tải dữ liệu thời tiết' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Thử lại' })).toBeEnabled()
})

for (const route of [
  '/thoi-tiet',
  '/tim-kiem',
  '/cau-hoi-thuong-gap',
  '/en',
  '/da-luu',
  '/cam-nang/duong-den-tra-linh',
  '/dia-diem/tram-duoc-lieu-tra-linh',
]) {
  test(`${route} has no serious or critical accessibility violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(route)
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([])
  })
}

test('saved journey can be reopened and removed from the local list', async ({ page }) => {
  await page.goto('/hanh-trinh/trekking-duoi-tan-rung')
  await page.getByRole('button', { name: 'Lưu hành trình' }).click()
  await page.getByRole('link', { name: 'Xem mục đã lưu' }).click()

  await expect(page).toHaveURL(/\/da-luu$/)
  await expect(page.getByRole('link', { name: 'Trekking dưới tán rừng già' })).toBeVisible()
  await page.getByRole('button', { name: /xóa trekking dưới tán rừng già khỏi mục đã lưu/i }).click()
  await expect(page.getByText(/chưa có nội dung nào được lưu/i)).toBeVisible()
})

test('homepage defers long specialty and map lists until requested', async ({ page }) => {
  await page.goto('/')

  const produce = page.locator('#san-vat')
  await expect(produce.getByRole('article')).toHaveCount(6)
  await expect(produce.getByRole('button', { name: /xem thêm 6 sản vật/i })).toBeVisible()
  await page.locator('#ban-do-du-lich').scrollIntoViewIfNeeded()
  await expect(page.locator('[data-testid="tourism-place-card"]')).toHaveCount(6)
})

test('guide offers printable offline access and place exposes verification sources', async ({ page }) => {
  await page.goto('/cam-nang/duong-den-tra-linh')
  await expect(page.getByRole('button', { name: /in hoặc lưu pdf/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /lưu cẩm nang/i })).toBeVisible()

  await page.goto('/dia-diem/tram-duoc-lieu-tra-linh')
  await expect(page.getByRole('heading', { name: 'Đã xác minh' })).toBeVisible()
  await expect(page.getByRole('link', { name: /nguồn tham khảo 1/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /lưu địa điểm/i })).toBeVisible()
})
