import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const screenshotDirectory = join(process.cwd(), "artifacts", "tourism-map");
const mapReadyTimeout = 30_000;
const hasLiveMapbox = Boolean(
  process.env.E2E_MAPBOX_ACCESS_TOKEN?.trim().startsWith("pk."),
);
const retiredImageHosts = [
  "baodanang.vn",
  "bvhttdl.gov.vn",
  "congnghiepmoitruong.vn",
  "danang.gov.vn",
  "icdn.dantri.com.vn",
  "namtramy.danang.gov.vn",
  "thanhdoandanang.org.vn",
  "tralinh.danang.gov.vn",
  "vtcnews.vn",
];

async function expectVisibleImagesToLoad(page: import("@playwright/test").Page) {
  const brokenImages = await page.locator("img:visible").evaluateAll(async (images) => {
    await Promise.all(
      images.map((image) => (image as HTMLImageElement).decode().catch(() => undefined)),
    );
    return images
      .filter(
        (image) =>
          Boolean((image as HTMLImageElement).currentSrc) &&
          !(image as HTMLImageElement).naturalWidth,
      )
      .map((image) => (image as HTMLImageElement).currentSrc);
  });

  expect(brokenImages).toEqual([]);
}

test.beforeAll(() => {
  mkdirSync(screenshotDirectory, { recursive: true });
});

test("loads Mapbox Standard, starts in Tra Linh, and opens a place on demand", async ({
  page,
}) => {
  test.skip(!hasLiveMapbox, "Set E2E_MAPBOX_ACCESS_TOKEN to run the live Mapbox test.");
  await page.setViewportSize({ width: 1440, height: 1000 });
  const retiredRequests: string[] = [];
  page.on("request", (request) => {
    if (retiredImageHosts.some((host) => request.url().includes(host))) {
      retiredRequests.push(request.url());
    }
  });
  const mapboxRequest = page.waitForRequest(
    (request) => request.url().startsWith("https://api.mapbox.com/"),
    { timeout: mapReadyTimeout },
  );

  const response = await page.goto("/ban-do-du-lich", {
    waitUntil: "domcontentloaded",
  });

  expect(response?.ok()).toBe(true);
  await expect(
    page.getByRole("heading", { name: "Khám phá Trà Linh trên bản đồ" }),
  ).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Tìm địa điểm" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Trong Trà Linh" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("link", { name: "Xem toàn bộ bản đồ" })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Thao tác nhanh" })).toHaveCount(0);
  const mapCanvas = page.getByTestId("tourism-map-canvas");
  await expect(mapCanvas).toBeVisible({
    timeout: mapReadyTimeout,
  });
  await expect(mapCanvas).toHaveAttribute("aria-busy", "false", {
    timeout: mapReadyTimeout,
  });
  await mapboxRequest;
  await expect(page.locator(".mapboxgl-canvas")).toBeVisible();
  await expect(page.locator(".mapboxgl-popup")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Vệ tinh", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Mapbox/i }).first()).toBeVisible();

  const desktopSearch = page.getByRole("searchbox", { name: "Tìm địa điểm" });
  const desktopCategoryFilters = page.getByRole("group", {
    name: "Lọc địa điểm du lịch",
  });
  expect((await desktopSearch.boundingBox())?.width).toBeGreaterThan(300);
  expect(
    await desktopCategoryFilters.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);

  const placeList = page.locator("aside [role='list']");
  await page.getByRole("button", { name: "Trong Trà Linh" }).click();
  await expect(page.locator("html.lenis")).toBeAttached({ timeout: 10_000 });
  await placeList.hover();
  const initialListScrollTop = await placeList.evaluate((element) => element.scrollTop);
  await page.mouse.wheel(0, 500);
  await expect
    .poll(() => placeList.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(initialListScrollTop);

  await expect(
    page.getByRole("img", {
      name: "Sâm Ngọc Linh sinh trưởng dưới tán rừng tại vùng cao Trà Linh",
    }).first(),
  ).toBeVisible();
  const ginsengMarker = page.getByTestId(
    "tourism-map-marker-diem-du-lich-vuon-sam-ngoc-linh-tak-ngo",
  );
  await page
    .locator("aside")
    .getByRole("button", {
      name: "Chọn Điểm du lịch Vườn sâm Ngọc Linh – Tăk Ngo trên bản đồ",
    })
    .click();
  await expect(ginsengMarker).toBeVisible();
  await expect(ginsengMarker).toHaveAttribute("data-category", "ginseng");
  await expect(ginsengMarker.locator("svg.lucide-leaf")).toBeVisible();
  await ginsengMarker.click();
  await expect(page.locator(".mapboxgl-popup")).toBeVisible();
  await expect(
    page.locator(".mapboxgl-popup").getByRole("img", {
      name: "Sâm Ngọc Linh sinh trưởng dưới tán rừng tại vùng cao Trà Linh",
    }),
  ).toBeVisible();

  const nearbyFilter = page.getByRole("button", { name: "Lân cận" });
  await nearbyFilter.click();
  await expect(nearbyFilter).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".mapboxgl-popup")).toHaveCount(0);
  await expect(page.getByText("Điểm du lịch cộng đồng Tăk Pổ").first()).toBeVisible();

  await expectVisibleImagesToLoad(page);
  expect(retiredRequests).toEqual([]);
  await page.screenshot({
    path: join(screenshotDirectory, "tourism-map-desktop-1440.png"),
    fullPage: true,
  });
});

test("keeps the place list usable when Mapbox credentials are absent", async ({ page }) => {
  test.skip(hasLiveMapbox, "The credential-free fallback is covered without a Mapbox token.");

  const response = await page.goto("/ban-do-du-lich", {
    waitUntil: "domcontentloaded",
  });

  expect(response?.ok()).toBe(true);
  await expect(
    page.getByRole("heading", { name: "Khám phá Trà Linh trên bản đồ" }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toContainText(
    "Không thể tải bản đồ tương tác",
    { timeout: mapReadyTimeout },
  );
  await expect(
    page.getByRole("link", {
      name: "Điểm du lịch Vườn sâm Ngọc Linh – Tăk Ngo",
      exact: true,
    }),
  ).toBeVisible();
});

test("place detail uses verified coordinates and category artwork for contextual media", async ({ page }) => {
  const retiredRequests: string[] = [];
  page.on("request", (request) => {
    if (retiredImageHosts.some((host) => request.url().includes(host))) {
      retiredRequests.push(request.url());
    }
  });
  await page.goto("/dia-diem/tram-duoc-lieu-tra-linh", {
    waitUntil: "domcontentloaded",
  });

  await expect(
    page.getByText("Vị trí tham khảo — vui lòng kiểm tra điểm đến trên Google Maps"),
  ).toHaveCount(0);
  const directionsLink = page.getByRole("link", {
    name: "Chỉ đường đến Trạm Dược liệu Trà Linh bằng Google Maps",
  });
  await expect(directionsLink).toHaveAttribute(
    "href",
    "https://maps.app.goo.gl/L52kCvrGj4rrbmin6",
  );
  await expect(page.getByTestId("tourism-category-artwork")).toHaveAttribute(
    "data-category",
    "ginseng",
  );
  await expect(
    page.getByRole("img", { name: "Khu làm việc của Trạm Dược liệu Trà Linh" }),
  ).toHaveCount(0);
  await expectVisibleImagesToLoad(page);
  expect(retiredRequests).toEqual([]);
});

test("place detail keeps a documentary cover as destination imagery", async ({ page }) => {
  await page.goto("/dia-diem/diem-du-lich-vuon-sam-ngoc-linh-tak-ngo", {
    waitUntil: "domcontentloaded",
  });

  await expect(
    page.getByRole("img", {
      name: "Sâm Ngọc Linh sinh trưởng dưới tán rừng tại vùng cao Trà Linh",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByTestId("tourism-category-artwork")).toHaveCount(0);
});

test("place detail disables directions when Google Maps has no confirmed listing", async ({
  page,
}) => {
  await page.goto("/dia-diem/lang-ty-phu", {
    waitUntil: "domcontentloaded",
  });

  await expect(
    page.getByRole("button", { name: "Chỉ đường đang cập nhật" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("link", { name: /Chỉ đường đến Làng Tỷ phú/i }),
  ).toHaveCount(0);
});

for (const viewport of [
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-320", width: 320, height: 720 },
]) {
  test(`tourism map responsive capture ${viewport.name}`, async ({ page }) => {
    test.skip(!hasLiveMapbox, "Set E2E_MAPBOX_ACCESS_TOKEN to run live map captures.");
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/ban-do-du-lich", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Khám phá Trà Linh trên bản đồ" }),
    ).toBeVisible();
    const mapCanvas = page.getByTestId("tourism-map-canvas");
    await expect(mapCanvas).toBeVisible({
      timeout: mapReadyTimeout,
    });
    await expect(mapCanvas).toHaveAttribute("aria-busy", "false", {
      timeout: mapReadyTimeout,
    });
    await expect(page.getByRole("button", { name: "Tất cả" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Vệ tinh", exact: true })).toHaveCount(0);
    const visibleCategoryMarkers = page.locator(
      '.mapboxgl-marker:visible [data-testid^="tourism-map-marker-"]',
    );
    await expect
      .poll(() => visibleCategoryMarkers.count(), { timeout: mapReadyTimeout })
      .toBeGreaterThan(0);
    await expect(visibleCategoryMarkers.first().locator("svg")).toBeVisible();
    if (viewport.width <= 390) {
      await expect(page.locator(".mapboxgl-ctrl-attrib")).toHaveClass(/mapboxgl-compact/);
    }
    const mobileSheet = page.getByTestId("tourism-mobile-sheet");
    await expect(mobileSheet).toHaveCount(0);

    const fullscreenButton = page.getByRole("button", {
      name: "Mở bản đồ toàn màn hình",
    });
    const legendButton = page.getByRole("button", { name: "Mở chú giải bản đồ" });
    for (const control of [fullscreenButton, legendButton]) {
      const box = await control.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }

    await legendButton.click();
    await expect(page.getByRole("dialog", { name: "Chú giải bản đồ" })).toBeVisible();
    await page.getByRole("button", { name: "Đóng chú giải bản đồ" }).click();
    await expect(page.getByRole("dialog", { name: "Chú giải bản đồ" })).toHaveCount(0);

    await page.screenshot({
      path: join(screenshotDirectory, `tourism-map-${viewport.name}-closed.png`),
      fullPage: true,
    });

    await page
      .getByRole("searchbox", { name: "Tìm địa điểm" })
      .fill("Điểm du lịch Vườn sâm Ngọc Linh – Tăk Ngo");
    const selectedMarker = page.getByTestId(
      "tourism-map-marker-diem-du-lich-vuon-sam-ngoc-linh-tak-ngo",
    );
    await expect(selectedMarker).toBeVisible({ timeout: mapReadyTimeout });
    await selectedMarker.click({ force: true });

    await expect(mobileSheet).toBeVisible({ timeout: mapReadyTimeout });
    await expect(mobileSheet.getByText("1 / 1 địa điểm")).toBeVisible();
    const selectedTitle = mobileSheet.getByRole("heading", {
      name: "Điểm du lịch Vườn sâm Ngọc Linh – Tăk Ngo",
    });
    expect(
      await selectedTitle.evaluate(
        (element) => element.scrollHeight - element.clientHeight,
      ),
    ).toBeLessThanOrEqual(1);
    await expect(mobileSheet.getByRole("link", { name: "Xem chi tiết" })).toBeVisible();
    await expect(mobileSheet.getByRole("link", { name: /chỉ đường/i })).toBeVisible();
    await expect(selectedMarker).toHaveAttribute("aria-pressed", "true");

    const mapBox = await mapCanvas.boundingBox();
    const sheetBox = await mobileSheet.boundingBox();
    expect(mapBox?.height).toBeDefined();
    expect(sheetBox?.height).toBeDefined();
    expect(sheetBox?.y).toBeDefined();
    expect(sheetBox?.height ?? Infinity).toBeLessThanOrEqual((mapBox?.height ?? 0) * 0.4);
    expect(
      await mobileSheet.evaluate((element) => element.scrollHeight <= element.clientHeight),
    ).toBe(true);

    const attribution = page.locator(".mapboxgl-ctrl-bottom-right");
    const attributionBox = await attribution.boundingBox();
    expect((attributionBox?.y ?? 0) + (attributionBox?.height ?? 0)).toBeLessThanOrEqual(
      (sheetBox?.y ?? 0) + 2,
    );

    const closeButton = mobileSheet.getByRole("button", {
      name: "Đóng thông tin địa điểm",
    });
    const closeBox = await closeButton.boundingBox();
    expect(Math.round(closeBox?.width ?? 0)).toBeGreaterThanOrEqual(44);
    expect(Math.round(closeBox?.height ?? 0)).toBeGreaterThanOrEqual(44);
    const categoryBox = await mobileSheet
      .getByText("Sâm & dược liệu", { exact: true })
      .boundingBox();
    expect((categoryBox?.y ?? 0) + 1).toBeGreaterThanOrEqual(
      (closeBox?.y ?? 0) + (closeBox?.height ?? 0),
    );

    if (viewport.width === 320) {
      const header = page.getByRole("banner");
      await expect(header.getByRole("link", { name: "Khám phá Trà Linh" })).toBeHidden();
      const menuBox = await header.getByRole("button", { name: "Mở menu" }).boundingBox();
      expect(menuBox?.x).toBeGreaterThanOrEqual(0);
      expect((menuBox?.x ?? 0) + (menuBox?.width ?? 0)).toBeLessThanOrEqual(
        viewport.width,
      );
    }
    await expectVisibleImagesToLoad(page);

    await page.screenshot({
      path: join(screenshotDirectory, `tourism-map-${viewport.name}-selected.png`),
      fullPage: true,
    });

    await page.getByRole("button", { name: "Lân cận" }).click();
    await expect(mobileSheet).toHaveCount(0);
  });
}
