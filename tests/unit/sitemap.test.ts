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
import { tourismEvents } from "@/data/tourism-map/events";
import { tourismPlaces } from "@/data/tourism-map/places";
import { getAllTourismEntities } from "@/lib/tourism-map";

const tourismUrls = getAllTourismEntities(tourismPlaces, tourismEvents).map(
  (entity) => `https://tralinh.example/dia-diem/${entity.slug}`,
);

describe("public sitemap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPublishedJourneys.mockResolvedValue([]);
    mocks.getPublishedProducts.mockResolvedValue([]);
    mocks.getPublishedGuides.mockResolvedValue([]);
  });

  it("includes verified fallback routes and omits absent product placeholders", async () => {
    const entries = await sitemap();

    expect(entries.map((entry) => entry.url)).toEqual([
      "https://tralinh.example/",
      "https://tralinh.example/ban-do-du-lich",
      "https://tralinh.example/chinh-sach-quyen-rieng",
      "https://tralinh.example/hanh-trinh/trekking-duoi-tan-rung",
      "https://tralinh.example/hanh-trinh/ban-lang-trong-suong",
      "https://tralinh.example/hanh-trinh/cham-vao-mien-duoc-lieu",
      "https://tralinh.example/cam-nang/duong-den-tra-linh",
      "https://tralinh.example/cam-nang/thoi-diem-goi-y",
      "https://tralinh.example/cam-nang/luu-y-khi-vao-rung",
      ...tourismUrls,
    ]);
    expect(entries.some((entry) => entry.url.includes("/san-vat/"))).toBe(false);
  });

  it("includes every published public content route returned by the repository", async () => {
    mocks.getPublishedJourneys.mockResolvedValue([
      { slug: "trekking-duoi-tan-rung", updatedAt: "2026-07-22" },
    ]);
    mocks.getPublishedProducts.mockResolvedValue([
      { slug: "sam-ngoc-linh", updatedAt: "2026-07-22" },
    ]);
    mocks.getPublishedGuides.mockResolvedValue([
      { slug: "duong-den-tra-linh", updatedAt: "2026-07-22" },
    ]);

    const entries = await sitemap();

    expect(entries.map((entry) => entry.url)).toEqual([
      "https://tralinh.example/",
      "https://tralinh.example/ban-do-du-lich",
      "https://tralinh.example/chinh-sach-quyen-rieng",
      "https://tralinh.example/hanh-trinh/trekking-duoi-tan-rung",
      "https://tralinh.example/san-vat/sam-ngoc-linh",
      "https://tralinh.example/cam-nang/duong-den-tra-linh",
      ...tourismUrls,
    ]);
  });
});
