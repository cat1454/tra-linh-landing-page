import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPublishedJourneys: vi.fn(),
  getPublishedProducts: vi.fn(),
  getPublishedGuides: vi.fn(),
}));

vi.mock("@/lib/content/repository", () => ({
  createContentRepository: () => mocks,
}));
vi.mock("@/components/detail/seo", () => ({
  getAbsoluteUrl: (pathname: string) => `https://tralinh.example${pathname}`,
}));

import sitemap from "@/app/sitemap";

describe("public sitemap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPublishedJourneys.mockResolvedValue([]);
    mocks.getPublishedProducts.mockResolvedValue([]);
    mocks.getPublishedGuides.mockResolvedValue([]);
  });

  it("includes the privacy page and omits absent product placeholders", async () => {
    const entries = await sitemap();

    expect(entries.map((entry) => entry.url)).toEqual([
      "https://tralinh.example/",
      "https://tralinh.example/chinh-sach-quyen-rieng",
    ]);
    expect(entries.some((entry) => entry.url.includes("/san-vat/"))).toBe(false);
  });
});
