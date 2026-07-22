import { afterEach, describe, expect, it, vi } from 'vitest'

import { fallbackContent } from '@/lib/content/fallback-content'
import { createContentRepository } from '@/lib/content/repository'
import type { ContentAdapter, HomePageContent } from '@/lib/content/types'

function createAdapter(
  overrides: Partial<ContentAdapter> = {},
): ContentAdapter {
  return {
    isConfigured: true,
    getHomePageContent: vi.fn().mockResolvedValue(structuredClone(fallbackContent)),
    getJourneyBySlug: vi.fn().mockResolvedValue(null),
    getProductBySlug: vi.fn().mockResolvedValue(null),
    getGuideBySlug: vi.fn().mockResolvedValue(null),
    ...overrides,
  }
}

describe('ContentRepository', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns curated fallback content when Supabase is not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

    const repository = createContentRepository()
    const home = await repository.getHomePageContent()

    expect(home.source).toBe('fallback')
    expect(home.journeys).toEqual(fallbackContent.journeys)
  })

  it('falls back when the Supabase adapter fails', async () => {
    const repository = createContentRepository(createAdapter({
      getHomePageContent: vi.fn().mockRejectedValue(new Error('offline')),
      getJourneyBySlug: vi.fn().mockRejectedValue(new Error('offline')),
      getProductBySlug: vi.fn().mockRejectedValue(new Error('offline')),
      getGuideBySlug: vi.fn().mockRejectedValue(new Error('offline')),
    }))

    const home = await repository.getHomePageContent()

    expect(home.source).toBe('fallback')
  })

  it('returns only a known published journey by slug', async () => {
    const repository = createContentRepository()

    await expect(
      repository.getJourneyBySlug('trekking-duoi-tan-rung'),
    ).resolves.toMatchObject({ status: 'published' })
    await expect(repository.getJourneyBySlug('khong-ton-tai')).resolves.toBeNull()
  })

  it('does not use an explicitly unconfigured adapter', async () => {
    const adapter = createAdapter({ isConfigured: false })
    const repository = createContentRepository(adapter)

    await expect(repository.getHomePageContent()).resolves.toMatchObject({
      source: 'fallback',
    })
    expect(adapter.getHomePageContent).not.toHaveBeenCalled()
  })

  it('normalizes valid slugs and rejects malformed slugs before querying', async () => {
    const adapter = createAdapter({
      getJourneyBySlug: vi
        .fn()
        .mockResolvedValue(structuredClone(fallbackContent.journeys[0])),
    })
    const repository = createContentRepository(adapter)

    await expect(
      repository.getJourneyBySlug('  TREKKING-DUOI-TAN-RUNG  '),
    ).resolves.toMatchObject({ slug: 'trekking-duoi-tan-rung' })
    await expect(repository.getJourneyBySlug('../admin')).resolves.toBeNull()
    expect(adapter.getJourneyBySlug).toHaveBeenCalledTimes(1)
  })

  it('filters, validates and sorts CMS homepage records', async () => {
    const valid = structuredClone(fallbackContent.journeys[0])
    valid.displayOrder = 8
    const earlier = structuredClone(fallbackContent.journeys[1])
    earlier.displayOrder = 2
    const draft = structuredClone(fallbackContent.journeys[2])
    draft.status = 'draft'
    const forbidden = structuredClone(fallbackContent.journeys[2])
    forbidden.description = 'Nội dung nhầm về Trà Lĩnh.'
    const missingLabel = structuredClone(fallbackContent.journeys[2])
    missingLabel.placeholderLabel = undefined

    const cmsContent: HomePageContent = {
      ...structuredClone(fallbackContent),
      source: 'supabase',
      journeys: [valid, draft, forbidden, missingLabel, earlier],
      products: [...structuredClone(fallbackContent.products)].reverse(),
      guides: [...structuredClone(fallbackContent.guides)].reverse(),
    }
    const repository = createContentRepository(
      createAdapter({
        getHomePageContent: vi.fn().mockResolvedValue(cmsContent),
      }),
    )

    const home = await repository.getHomePageContent()

    expect(home.source).toBe('supabase')
    expect(home.journeys.map((item) => item.slug)).toEqual([
      earlier.slug,
      valid.slug,
    ])
    expect(home.products.map((item) => item.displayOrder)).toEqual([1, 2, 3])
    expect(home.guides.map((item) => item.displayOrder)).toEqual([1, 2, 3])
  })

  it('returns only publishable CMS detail records', async () => {
    const journey = structuredClone(fallbackContent.journeys[0])
    const product = structuredClone(fallbackContent.products[0])
    const guide = structuredClone(fallbackContent.guides[0])
    const repository = createContentRepository(
      createAdapter({
        getJourneyBySlug: vi.fn().mockResolvedValue(journey),
        getProductBySlug: vi.fn().mockResolvedValue(product),
        getGuideBySlug: vi.fn().mockResolvedValue(guide),
      }),
    )

    await expect(repository.getJourneyBySlug(journey.slug)).resolves.toEqual(journey)
    await expect(repository.getProductBySlug(product.slug)).resolves.toEqual(product)
    await expect(repository.getGuideBySlug(guide.slug)).resolves.toEqual(guide)

    const hiddenRepository = createContentRepository(
      createAdapter({
        getJourneyBySlug: vi.fn().mockResolvedValue({ ...journey, status: 'review' }),
        getProductBySlug: vi.fn().mockResolvedValue(null),
        getGuideBySlug: vi.fn().mockResolvedValue({
          ...guide,
          description: 'Tham quan Bản Giốc',
        }),
      }),
    )

    await expect(hiddenRepository.getJourneyBySlug(journey.slug)).resolves.toBeNull()
    await expect(hiddenRepository.getProductBySlug(product.slug)).resolves.toBeNull()
    await expect(hiddenRepository.getGuideBySlug(guide.slug)).resolves.toBeNull()
  })

  it('uses fallback detail records after adapter errors', async () => {
    const repository = createContentRepository(
      createAdapter({
        getJourneyBySlug: vi.fn().mockRejectedValue(new Error('offline')),
        getProductBySlug: vi.fn().mockRejectedValue(new Error('offline')),
        getGuideBySlug: vi.fn().mockRejectedValue(new Error('offline')),
      }),
    )

    await expect(repository.getJourneyBySlug('trekking-duoi-tan-rung')).resolves.toBeTruthy()
    await expect(repository.getProductBySlug('sam-tuoi-ngoc-linh')).resolves.toBeTruthy()
    await expect(repository.getGuideBySlug('duong-den-tra-linh')).resolves.toBeTruthy()
    await expect(repository.getProductBySlug('khong-ton-tai')).resolves.toBeNull()
    await expect(repository.getGuideBySlug('khong-ton-tai')).resolves.toBeNull()
  })

  it('reads list methods directly and filters unpublished records', async () => {
    const journey = structuredClone(fallbackContent.journeys[0])
    const hiddenJourney = { ...structuredClone(journey), status: 'review' as const }
    const product = structuredClone(fallbackContent.products[0])
    const guide = structuredClone(fallbackContent.guides[0])
    const adapter = createAdapter({
      getPublishedJourneys: vi.fn().mockResolvedValue([hiddenJourney, journey]),
      getPublishedProducts: vi.fn().mockResolvedValue([product]),
      getPublishedGuides: vi.fn().mockResolvedValue([guide]),
    })
    const repository = createContentRepository(adapter)

    await expect(repository.getPublishedJourneys()).resolves.toEqual([journey])
    await expect(repository.getPublishedProducts()).resolves.toEqual([product])
    await expect(repository.getPublishedGuides()).resolves.toEqual([guide])
  })

  it('derives lists from homepage content when optional methods are absent', async () => {
    const adapter = createAdapter()
    const repository = createContentRepository(adapter)

    await expect(repository.getPublishedJourneys()).resolves.toHaveLength(3)
    await expect(repository.getPublishedProducts()).resolves.toHaveLength(3)
    await expect(repository.getPublishedGuides()).resolves.toHaveLength(3)
    expect(adapter.getHomePageContent).toHaveBeenCalledTimes(3)
  })

  it('falls back for all list methods after adapter errors', async () => {
    const repository = createContentRepository(
      createAdapter({
        getPublishedJourneys: vi.fn().mockRejectedValue(new Error('offline')),
        getPublishedProducts: vi.fn().mockRejectedValue(new Error('offline')),
        getPublishedGuides: vi.fn().mockRejectedValue(new Error('offline')),
      }),
    )

    await expect(repository.getPublishedJourneys()).resolves.toHaveLength(3)
    await expect(repository.getPublishedProducts()).resolves.toHaveLength(3)
    await expect(repository.getPublishedGuides()).resolves.toHaveLength(3)
  })

  it('returns fallback product, guide and sorted lists without a CMS', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
    const repository = createContentRepository()

    await expect(repository.getProductBySlug('sam-tuoi-ngoc-linh')).resolves.toBeTruthy()
    await expect(repository.getGuideBySlug('duong-den-tra-linh')).resolves.toBeTruthy()
    await expect(repository.getPublishedJourneys()).resolves.toHaveLength(3)
    await expect(repository.getPublishedProducts()).resolves.toHaveLength(3)
    await expect(repository.getPublishedGuides()).resolves.toHaveLength(3)
  })
})
