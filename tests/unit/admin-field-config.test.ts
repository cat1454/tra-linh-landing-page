import { describe, expect, it } from "vitest";

import {
  getPageSectionFieldKeys,
  getPageSectionHelp,
  slugifyVietnamese,
} from "@/lib/cms/admin-field-config";

describe("low-tech admin field configuration", () => {
  it("shows only fields that affect the selected homepage area", () => {
    expect(getPageSectionFieldKeys("hero")).toEqual([
      "eyebrow",
      "title",
      "description",
      "secondary_text",
      "cta_label",
      "cta_href",
      "badges",
    ]);
    expect(getPageSectionFieldKeys("identity")).toEqual(["stats"]);
    expect(getPageSectionFieldKeys("journeys")).toEqual([
      "eyebrow",
      "title",
      "description",
    ]);
    expect(getPageSectionFieldKeys("final_cta")).toEqual([
      "eyebrow",
      "title",
      "description",
      "cta_label",
      "cta_href",
      "media_asset_id",
    ]);
    expect(getPageSectionFieldKeys("contact")).toEqual([
      "eyebrow",
      "title",
      "description",
    ]);
  });

  it("explains where each area appears without database language", () => {
    expect(getPageSectionHelp("identity")).toMatch(/4 ô giới thiệu/i);
    expect(getPageSectionHelp("final_cta")).toMatch(/cuối trang/i);
    expect(getPageSectionHelp("unknown")).toMatch(/trang chủ/i);
  });

  it("creates a readable article path from a Vietnamese title", () => {
    expect(slugifyVietnamese("  Đường đến Trà Linh & Ngọc Linh  ")).toBe(
      "duong-den-tra-linh-ngoc-linh",
    );
  });
});
