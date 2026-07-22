import { fallbackContent } from './fallback-content'
import { assertContentIsPublishable } from './content-guard'
import { createSupabaseContentAdapter } from './supabase-adapter'
import type {
  ContentAdapter,
  ContentRepository,
  Guide,
  HomePageContent,
  Journey,
  Product,
} from './types'

export type { ContentAdapter, ContentRepository } from './types'

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
}

function isPublishableRecord(record: PublishableRecord): boolean {
  if (record.status !== 'published') return false

  try {
    assertContentIsPublishable(record, {
      isPlaceholder: record.isPlaceholder,
      placeholderLabel: record.placeholderLabel,
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
      (journey) => journey.slug === slug && journey.status === 'published',
    ) ?? null
  )
}

function fallbackProduct(slug: string): Product | null {
  return (
    fallbackContent.products.find(
      (product) => product.slug === slug && product.status === 'published',
    ) ?? null
  )
}

function fallbackGuide(slug: string): Guide | null {
  return (
    fallbackContent.guides.find(
      (guide) => guide.slug === slug && guide.status === 'published',
    ) ?? null
  )
}

function resolveAdapter(adapter?: ContentAdapter): ContentAdapter | null {
  if (adapter) return adapter.isConfigured ? adapter : null

  try {
    return createSupabaseContentAdapter()
  } catch {
    return null
  }
}

export function createContentRepository(
  adapter?: ContentAdapter,
): ContentRepository {
  const source = resolveAdapter(adapter)

  return {
    async getHomePageContent(): Promise<HomePageContent> {
      if (!source) return clone(fallbackContent)

      try {
        const content = await source.getHomePageContent()
        return {
          ...content,
          journeys: published(content.journeys),
          products: published(content.products),
          guides: published(content.guides),
        }
      } catch {
        return clone(fallbackContent)
      }
    },

    async getJourneyBySlug(slug: string): Promise<Journey | null> {
      const normalized = normalizeSlug(slug)
      if (!normalized) return null
      if (!source) return clone(fallbackJourney(normalized))

      try {
        const result = await source.getJourneyBySlug(normalized)
        return result && isPublishableRecord(result) ? result : null
      } catch {
        return clone(fallbackJourney(normalized))
      }
    },

    async getProductBySlug(slug: string): Promise<Product | null> {
      const normalized = normalizeSlug(slug)
      if (!normalized) return null
      if (!source) return clone(fallbackProduct(normalized))

      try {
        const result = await source.getProductBySlug(normalized)
        return result && isPublishableRecord(result) ? result : null
      } catch {
        return clone(fallbackProduct(normalized))
      }
    },

    async getGuideBySlug(slug: string): Promise<Guide | null> {
      const normalized = normalizeSlug(slug)
      if (!normalized) return null
      if (!source) return clone(fallbackGuide(normalized))

      try {
        const result = await source.getGuideBySlug(normalized)
        return result && isPublishableRecord(result) ? result : null
      } catch {
        return clone(fallbackGuide(normalized))
      }
    },

    async getPublishedJourneys(): Promise<Journey[]> {
      if (!source) return clone(published(fallbackContent.journeys))

      try {
        const records = source.getPublishedJourneys
          ? await source.getPublishedJourneys()
          : (await source.getHomePageContent()).journeys
        return published(records)
      } catch {
        return clone(published(fallbackContent.journeys))
      }
    },

    async getPublishedProducts(): Promise<Product[]> {
      if (!source) return clone(published(fallbackContent.products))

      try {
        const records = source.getPublishedProducts
          ? await source.getPublishedProducts()
          : (await source.getHomePageContent()).products
        return published(records)
      } catch {
        return clone(published(fallbackContent.products))
      }
    },

    async getPublishedGuides(): Promise<Guide[]> {
      if (!source) return clone(published(fallbackContent.guides))

      try {
        const records = source.getPublishedGuides
          ? await source.getPublishedGuides()
          : (await source.getHomePageContent()).guides
        return published(records)
      } catch {
        return clone(published(fallbackContent.guides))
      }
    },
  }
}
