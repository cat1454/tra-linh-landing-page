import { expect, test, type Page } from "@playwright/test";

const weatherPayload = {
  current: {
    temperature_2m: 25,
    apparent_temperature: 27,
    relative_humidity_2m: 77,
    weather_code: 53,
    wind_speed_10m: 7,
  },
};

async function openHero(page: Page) {
  await page.route("https://api.open-meteo.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(weatherPayload) }),
  );
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Giữa đại ngàn, một báu vật lớn lên" })).toBeVisible();
}

test.describe("premium responsive hero", () => {
  test("keeps the editorial content and right rail side by side on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1680, height: 945 });
    await openHero(page);

    await expect(page.getByRole("navigation", { name: "Điều hướng chính" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Mở menu" })).toBeHidden();

    const headingBox = await page.locator("#hero-title").boundingBox();
    const railBox = await page.getByLabel("Thông tin nhanh").boundingBox();
    expect(headingBox).not.toBeNull();
    expect(railBox).not.toBeNull();
    expect(railBox!.x).toBeGreaterThan(headingBox!.x + headingBox!.width);
  });

  test("moves the rail below the story and exposes the hamburger on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await openHero(page);

    await expect(page.getByRole("navigation", { name: "Điều hướng chính" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Mở menu" })).toBeVisible();

    const ctaBox = await page.locator("#dau-trang").getByRole("link", { name: /khám phá hành trình/i }).boundingBox();
    const railBox = await page.getByLabel("Thông tin nhanh").boundingBox();
    expect(ctaBox).not.toBeNull();
    expect(railBox).not.toBeNull();
    expect(railBox!.y).toBeGreaterThan(ctaBox!.y + ctaBox!.height);
  });

  test("uses a single non-overflowing column on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openHero(page);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
    await expect(page.getByRole("button", { name: "Mở menu" })).toBeVisible();

    const ctaBox = await page.locator("#dau-trang").getByRole("link", { name: /khám phá hành trình/i }).boundingBox();
    const railBox = await page.getByLabel("Thông tin nhanh").boundingBox();
    expect(ctaBox).not.toBeNull();
    expect(railBox).not.toBeNull();
    expect(railBox!.y).toBeGreaterThan(ctaBox!.y + ctaBox!.height);
  });
});
