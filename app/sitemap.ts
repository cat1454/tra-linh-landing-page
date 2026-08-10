import type { MetadataRoute } from "next";

import { getAbsoluteUrl } from "@/components/detail/seo";
import {
  fallbackGuides,
  fallbackJourneys,
  fallbackProducts,
} from "@/lib/content/fallback-content";
import { createContentRepository } from "@/lib/content/repository";
import { tourismPlaces } from "@/data/tourism-map/places";
import { tourismEvents } from "@/data/tourism-map/events";
import { hasDocumentaryTourismCover } from "@/data/tourism-map/media";
import { getAllTourismEntities } from "@/lib/tourism-map";

function validLastModified(value: string): Date | undefined {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repository = createContentRepository();
  const [journeys, products, guides] = await Promise.all([
    repository.getPublishedJourneys(),
    repository.getPublishedProducts(),
    repository.getPublishedGuides(),
  ]);
  const publicJourneys = journeys.length ? journeys : fallbackJourneys;
  const publicProducts = products.length ? products : fallbackProducts;
  const publicGuides = guides.length ? guides : fallbackGuides;

  const detailEntries: MetadataRoute.Sitemap = [
    ...publicJourneys.map((journey) => ({
      url: getAbsoluteUrl(`/hanh-trinh/${journey.slug}`),
      ...(validLastModified(journey.updatedAt)
        ? { lastModified: validLastModified(journey.updatedAt) }
        : {}),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      ...(journey.featuredMedia?.src
        ? { images: [getAbsoluteUrl(journey.featuredMedia.src)] }
        : {}),
    })),
    ...publicProducts.map((product) => ({
      url: getAbsoluteUrl(`/san-vat/${product.slug}`),
      ...(validLastModified(product.updatedAt)
        ? { lastModified: validLastModified(product.updatedAt) }
        : {}),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      ...(product.featuredMedia?.src
        ? { images: [getAbsoluteUrl(product.featuredMedia.src)] }
        : {}),
    })),
    ...publicGuides.map((guide) => ({
      url: getAbsoluteUrl(`/cam-nang/${guide.slug}`),
      ...(validLastModified(guide.updatedAt)
        ? { lastModified: validLastModified(guide.updatedAt) }
        : {}),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      ...(guide.featuredMedia?.src
        ? { images: [getAbsoluteUrl(guide.featuredMedia.src)] }
        : {}),
    })),
  ];

  const tourismEntries: MetadataRoute.Sitemap = getAllTourismEntities(
    tourismPlaces,
    tourismEvents,
  ).map((place) => ({
    url: getAbsoluteUrl(`/dia-diem/${place.slug}`),
    changeFrequency: "monthly" as const,
    priority: 0.7,
    ...(hasDocumentaryTourismCover(place)
      ? { images: [getAbsoluteUrl(place.coverImage)] }
      : {}),
  }));

  return [
    {
      url: getAbsoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: getAbsoluteUrl("/ban-do-du-lich"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: getAbsoluteUrl("/chinh-sach-quyen-rieng"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    { url: getAbsoluteUrl("/vi"), changeFrequency: "weekly", priority: 0.9 },
    { url: getAbsoluteUrl("/en"), changeFrequency: "weekly", priority: 0.8 },
    { url: getAbsoluteUrl("/thoi-tiet"), changeFrequency: "daily", priority: 0.8 },
    { url: getAbsoluteUrl("/tim-kiem"), changeFrequency: "monthly", priority: 0.5 },
    { url: getAbsoluteUrl("/cau-hoi-thuong-gap"), changeFrequency: "monthly", priority: 0.6 },
    ...detailEntries,
    ...tourismEntries,
  ];
}
