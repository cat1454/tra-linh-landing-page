import { fallbackContent } from './fallback-content'
import { assertContentIsPublishable } from './content-guard'
import type {
  ContentRepository,
  Guide,
  HomePageContent,
  Journey,
  Product,
} from './types'

export type { ContentRepository } from './types'

const validSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function clone<T>(value: T): T {
  return structuredClone(value)
}

function normalizeSlug(slug: string): string | null {
  const normalized = slug.trim().toLowerCase()
  return validSlugPattern.test(normalized) ? normalized : null
}

interface PublishableRecord {
  status: string
  displayOrder: number
  isPlaceholder: boolean
  placeholderLabel?: string
  verificationStatus: string
  verifiedAt: string | null
  sourceUrl: string
  sourceCredit: string
}

function isPublishableRecord(record: PublishableRecord): boolean {
  if (
    record.status !== 'published' ||
    record.isPlaceholder ||
    record.verificationStatus !== 'verified' ||
    !record.verifiedAt?.trim() ||
    !record.sourceUrl.trim() ||
    !record.sourceCredit.trim()
  ) return false

  try {
    assertContentIsPublishable(record, {
      isPlaceholder: record.isPlaceholder,
      placeholderLabel: record.placeholderLabel,
      sourceUrl: record.sourceUrl,
      requireSourceForStatistics: true,
    })
    return true
  } catch {
    return false
  }
}

function published<T extends PublishableRecord>(
  records: T[],
): T[] {
  return records
    .filter(isPublishableRecord)
    .sort((left, right) => left.displayOrder - right.displayOrder)
}

function fallbackJourney(slug: string): Journey | null {
  return (
    fallbackContent.journeys.find(
      (journey) => journey.slug === slug && isPublishableRecord(journey),
    ) ?? null
  )
}

function fallbackProduct(slug: string): Product | null {
  return (
    fallbackContent.products.find(
      (product) => product.slug === slug && isPublishableRecord(product),
    ) ?? null
  )
}

function fallbackGuide(slug: string): Guide | null {
  return (
    fallbackContent.guides.find(
      (guide) => guide.slug === slug && isPublishableRecord(guide),
    ) ?? null
  )
}

export function createContentRepository(): ContentRepository {
  return {
    async getHomePageContent(): Promise<HomePageContent> {
      return clone({
        ...fallbackContent,
        journeys: published(fallbackContent.journeys),
        products: published(fallbackContent.products),
        guides: published(fallbackContent.guides),
      })
    },

    async getJourneyBySlug(slug: string): Promise<Journey | null> {
      const normalized = normalizeSlug(slug)
      if (!normalized) return null
      return clone(fallbackJourney(normalized))
    },

    async getProductBySlug(slug: string): Promise<Product | null> {
      const normalized = normalizeSlug(slug)
      if (!normalized) return null
      return clone(fallbackProduct(normalized))
    },

    async getGuideBySlug(slug: string): Promise<Guide | null> {
      const normalized = normalizeSlug(slug)
      if (!normalized) return null
      return clone(fallbackGuide(normalized))
    },

    async getPublishedJourneys(): Promise<Journey[]> {
      return clone(published(fallbackContent.journeys))
    },

    async getPublishedProducts(): Promise<Product[]> {
      return clone(published(fallbackContent.products))
    },

    async getPublishedGuides(): Promise<Guide[]> {
      return clone(published(fallbackContent.guides))
    },
  }
}
