import { expect, test } from "@playwright/test";

test("manual tourism intake persists a place draft and exports JSON", async ({ page }) => {
  await page.goto("/nhap-dia-diem", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Nhập thủ công từng địa điểm" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Thông tin cần nhập" })).toBeVisible();
  await page.getByLabel("Địa điểm").selectOption("tram-duoc-lieu-tra-linh");
  await expect(page.getByRole("heading", { name: "Trạm Dược liệu Trà Linh" })).toBeVisible();
  await page.getByLabel("Vĩ độ (latitude)").fill("15.123456");
  await page.getByLabel("Kinh độ (longitude)").fill("108.123456");
  await page
    .getByLabel("Link Google Maps")
    .fill("https://maps.google.com/?q=15.123456,108.123456");
  await page.getByLabel("Tôi đã kiểm tra đúng vị trí này").check();
  await page.getByLabel("Thư mục hoặc tên file ảnh").fill("D:\\AnhTraLinh\\tram-duoc-lieu.jpg");
  await page
    .getByLabel("Nguồn và quyền sử dụng ảnh")
    .fill("Ảnh do chủ website cung cấp và xác nhận quyền sử dụng.");
  await page.getByRole("button", { name: "Lưu bản nháp" }).click();
  await expect(page.getByRole("status")).toContainText("Đã lưu bản nháp");

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("status")).toContainText("Đã nạp bản nháp đã lưu trên máy");
  await page.getByLabel("Địa điểm").selectOption("tram-duoc-lieu-tra-linh");
  await expect(page.getByRole("heading", { name: "Trạm Dược liệu Trà Linh" })).toBeVisible();
  await expect(page.getByLabel("Vĩ độ (latitude)")).toHaveValue("15.123456");
  await expect(page.getByLabel("Tôi đã kiểm tra đúng vị trí này")).toBeChecked();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Xuất JSON" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("tra-linh-tourism-intake.json");
});

test("manual tourism intake is usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/nhap-dia-diem", { waitUntil: "domcontentloaded" });

  await expect(page.getByLabel("Địa điểm")).toBeVisible();
  await expect(page.getByRole("button", { name: "Lưu bản nháp" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Xuất JSON" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Thông tin cần nhập" })).toBeVisible();
});
