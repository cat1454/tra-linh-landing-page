import { describe, expect, it } from "vitest";

import { fallbackContent } from "@/lib/content/fallback-content";
import { createContentRepository } from "@/lib/content/repository";

describe("ContentRepository", () => {
  it("returns curated static content in display order", async () => {
    const repository = createContentRepository();
    const home = await repository.getHomePageContent();

    expect(home.source).toBe("static");
    expect(home.journeys.map(({ displayOrder }) => displayOrder)).toEqual([1, 2, 3]);
    expect(home.guides.map(({ displayOrder }) => displayOrder)).toEqual([1, 2, 3]);
  });

  it("returns defensive copies of the local content", async () => {
    const repository = createContentRepository();
    const first = await repository.getHomePageContent();
    first.journeys[0].title = "Đã sửa ngoài repository";

    const second = await repository.getHomePageContent();

    expect(second.journeys[0].title).toBe(fallbackContent.journeys[0].title);
  });

  it("normalizes valid slugs and rejects malformed slugs", async () => {
    const repository = createContentRepository();

    await expect(
      repository.getJourneyBySlug("  TREKKING-DUOI-TAN-RUNG  "),
    ).resolves.toMatchObject({ slug: "trekking-duoi-tan-rung" });
    await expect(repository.getJourneyBySlug("../admin")).resolves.toBeNull();
    await expect(repository.getJourneyBySlug("khong-ton-tai")).resolves.toBeNull();
  });

  it("exposes only the publishable local detail and list records", async () => {
    const repository = createContentRepository();

    await expect(repository.getProductBySlug("sam-tuoi-ngoc-linh")).resolves.toBeNull();
    await expect(repository.getGuideBySlug("duong-den-tra-linh")).resolves.toBeTruthy();
    await expect(repository.getPublishedJourneys()).resolves.toHaveLength(3);
    await expect(repository.getPublishedProducts()).resolves.toHaveLength(0);
    await expect(repository.getPublishedGuides()).resolves.toHaveLength(3);
  });
});
