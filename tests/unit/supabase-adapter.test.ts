import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fallbackContent } from '@/lib/content/fallback-content'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getPublicSupabaseConfig: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: mocks.createClient,
}))

vi.mock('@/lib/supabase/config', () => ({
  getPublicSupabaseConfig: mocks.getPublicSupabaseConfig,
  getMediaBucketName: vi.fn(() => 'media'),
}))

import { createSupabaseContentAdapter } from '@/lib/content/supabase-adapter'

type TableResult = {
  data: Array<Record<string, unknown>> | null
  error: Error | null
}

function clientFor(
  results: Partial<Record<string, TableResult>>,
  signedUrlResult: { data: { signedUrl: string } | null; error: Error | null } = {
    data: { signedUrl: 'https://signed.example.com/cms-library.webp' },
    error: null,
  },
) {
  const from = vi.fn((table: string) => {
    const result = results[table] ?? { data: [], error: null }
    const filteredQuery = {
      order: vi.fn().mockResolvedValue(result),
      eq: vi.fn(() => ({
        maybeSingle: vi.fn().mockResolvedValue({
          data: result.data?.[0] ?? null,
          error: result.error,
        }),
      })),
    }

    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => filteredQuery),
      })),
    }
  })
  const createSignedUrl = vi.fn().mockResolvedValue(signedUrlResult)
  const storageFrom = vi.fn(() => ({ createSignedUrl }))

  return {
    client: { from, storage: { from: storageFrom } },
    createSignedUrl,
    from,
    storageFrom,
  }
}

function publishedRow(overrides: Record<string, unknown>) {
  return {
    status: 'published',
    is_placeholder: false,
    source_url: 'https://example.com/source',
    source_credit: 'Editorial source',
    usage_permission: 'official_publication',
    verified_at: '2026-07-22T00:00:00.000Z',
    display_order: 1,
    updated_at: '2026-07-22T01:00:00.000Z',
    ...overrides,
  }
}

describe('Supabase homepage content adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getPublicSupabaseConfig.mockReturnValue({
      url: 'https://project.supabase.co',
      anonKey: 'public-key',
    })
  })

  it('maps every homepage CMS table into the unified content model', async () => {
    const results: Record<string, TableResult> = {
      site_settings: {
        data: [publishedRow({
          id: 'settings-1',
          site_name: 'CMS Trà Linh',
          tagline: 'CMS tagline',
          description: 'CMS site description',
          primary_cta_label: 'CMS CTA',
          primary_cta_href: '/cms-journeys',
        })],
        error: null,
      },
      hero_slides: {
        data: [publishedRow({
          id: 'hero-1',
          eyebrow: 'CMS eyebrow',
          title: 'CMS hero',
          description: 'CMS hero description',
          image_url: '/images/cms-hero.webp',
          alt_text: 'CMS hero image',
          cta_label: 'CMS slide CTA',
          cta_href: '#cms',
        })],
        error: null,
      },
      stories: {
        data: [publishedRow({
          id: 'story-1',
          eyebrow: '01 · CMS',
          title: 'CMS story',
          description: 'CMS story description',
          image_url: '/images/cms-story.webp',
          alt_text: 'CMS story image',
        })],
        error: null,
      },
      journeys: {
        data: [publishedRow({
          id: 'journey-1',
          slug: 'cms-journey',
          title: 'CMS journey',
          category: 'heritage',
          short_description: 'CMS journey description',
          image_url: '/images/cms-journey.webp',
          alt_text: 'CMS journey image',
          location_label: 'CMS location',
          duration_label: '2 giờ',
          access_status: 'open',
          access_note: 'CMS access note',
          safety_note: 'CMS safety note',
          highlights: ['One', 'Two'],
        })],
        error: null,
      },
      ginseng_story_steps: {
        data: [publishedRow({
          id: 'step-1',
          step_number: 4,
          title: 'CMS ginseng step',
          description: 'CMS step description',
          quote: 'CMS quote',
          image_url: '/images/cms-step.webp',
          alt_text: 'CMS step image',
        })],
        error: null,
      },
      culture_stories: {
        data: [publishedRow({
          id: 'culture-1',
          title: 'CMS culture',
          description: 'CMS culture description',
          caption: 'CMS caption',
          image_url: '/images/cms-culture.webp',
          alt_text: 'CMS culture image',
        })],
        error: null,
      },
      local_products: {
        data: [publishedRow({
          id: 'local-1',
          slug: 'cms-local',
          name: 'CMS local product',
          category: 'duoc-lieu',
          description: 'CMS local product description',
          image_url: '/images/cms-local.webp',
          alt_text: 'CMS local product image',
        })],
        error: null,
      },
      ginseng_products: {
        data: [publishedRow({
          id: 'product-1',
          slug: 'cms-product',
          name: 'CMS ginseng product',
          product_type: 'dried-ginseng',
          short_description: 'CMS product description',
          image_url: '/images/cms-product.webp',
          alt_text: 'CMS product image',
          origin_note: 'CMS origin',
          legal_disclaimer: 'CMS legal disclaimer long enough',
          contact_url: '/contact',
        })],
        error: null,
      },
      travel_guides: {
        data: [publishedRow({
          id: 'guide-1',
          slug: 'cms-guide',
          title: 'CMS guide',
          excerpt: 'CMS guide description',
          image_url: '/images/cms-guide.webp',
          alt_text: 'CMS guide image',
          read_time_label: '5 phút đọc',
          season_label: 'Mùa khô',
          sections: [{ title: 'Plan', body: 'Bring water.' }],
        })],
        error: null,
      },
      media_assets: {
        data: [publishedRow({
          id: 'media-1',
          title: 'CMS media',
          file_url: 'https://public-url.example.com/must-not-be-used.webp',
          storage_path: '2026/cms-library.webp',
          alt_text: 'CMS library image',
        })],
        error: null,
      },
      page_sections: {
        data: [publishedRow({
          id: "section-hero",
          section_key: "hero",
          eyebrow: "Editable eyebrow",
          title: "Editable section title",
          description: "Editable section description",
          secondary_text: "Editable supporting text",
          cta_label: "Editable CTA",
          cta_href: "#editable",
          badges: ["One", "Two"],
          stats: [{ value: "4", label: "giá trị" }],
        })],
        error: null,
      },
    }
    const { client, createSignedUrl, from, storageFrom } = clientFor(results)
    mocks.createClient.mockReturnValue(client)

    const adapter = createSupabaseContentAdapter()
    const content = await adapter!.getHomePageContent()

    expect(new Set(from.mock.calls.map(([table]) => table))).toEqual(
      new Set(Object.keys(results)),
    )
    expect(content).toMatchObject({
      source: 'supabase',
      hero: {
        eyebrow: 'CMS eyebrow',
        title: 'CMS hero',
        placeName: 'CMS Trà Linh',
        description: 'CMS hero description',
        primaryCta: { label: 'CMS slide CTA', href: '#cms' },
        backgroundMedia: { src: '/images/cms-hero.webp' },
      },
      storyChapters: [{ id: 'story-1', title: 'CMS story' }],
      journeys: [{ slug: 'cms-journey', category: 'heritage' }],
      ginsengStorySteps: [{ id: 'step-1', stepNumber: 4 }],
      cultureStories: [{ id: 'culture-1', caption: 'CMS caption' }],
      localSpecialties: [{ slug: 'cms-local', category: 'duoc-lieu' }],
      products: [{ slug: 'cms-product', productType: 'dried-ginseng' }],
      guides: [{
        slug: 'cms-guide',
        description: 'CMS guide description',
        sections: [{ title: 'Plan', body: 'Bring water.' }],
      }],
      media: [{
        id: 'media-1',
        src: 'https://signed.example.com/cms-library.webp',
      }],
      sectionSettings: {
        hero: {
          eyebrow: "Editable eyebrow",
          title: "Editable section title",
          cta: { label: "Editable CTA", href: "#editable" },
          badges: ["One", "Two"],
        },
      },
    })
    expect(storageFrom).toHaveBeenCalledWith('media')
    expect(createSignedUrl).toHaveBeenCalledWith('2026/cms-library.webp', 3600)
    expect(content.identityValues).toEqual(fallbackContent.identityValues)
  })

  it('falls back section by section when a table is empty or fails', async () => {
    const cmsProduct = publishedRow({
      id: 'product-2',
      slug: 'surviving-product',
      name: 'Surviving product',
      product_type: 'fresh-ginseng',
      short_description: 'This CMS section still loads.',
      image_url: '/images/product.webp',
      alt_text: 'Product image',
    })
    const { client } = clientFor({
      stories: { data: null, error: new Error('stories unavailable') },
      ginseng_products: { data: [cmsProduct], error: null },
    })
    mocks.createClient.mockReturnValue(client)

    const content = await createSupabaseContentAdapter()!.getHomePageContent()

    expect(content.hero).toEqual(fallbackContent.hero)
    expect(content.storyChapters).toEqual(fallbackContent.storyChapters)
    expect(content.journeys).toEqual(fallbackContent.journeys)
    expect(content.ginsengStorySteps).toEqual(fallbackContent.ginsengStorySteps)
    expect(content.cultureStories).toEqual(fallbackContent.cultureStories)
    expect(content.localSpecialties).toEqual(fallbackContent.localSpecialties)
    expect(content.products).toHaveLength(1)
    expect(content.products[0].slug).toBe('surviving-product')
    expect(content.guides).toEqual(fallbackContent.guides)
    expect(content.media).toEqual(fallbackContent.media)
  })

  it('uses fallback media when private storage URL signing fails', async () => {
    const { client } = clientFor(
      {
        media_assets: {
          data: [publishedRow({
            id: 'media-private',
            title: 'Private CMS media',
            storage_path: '2026/private.webp',
            file_url: 'https://public-url.example.com/must-not-be-used.webp',
            alt_text: 'Private library image',
          })],
          error: null,
        },
      },
      { data: null, error: new Error('signing failed') },
    )
    mocks.createClient.mockReturnValue(client)

    const content = await createSupabaseContentAdapter()!.getHomePageContent()

    expect(content.media).toEqual(fallbackContent.media)
  })

  it('normalizes alternate enum paths and supports list and detail reads', async () => {
    const placeholderJourney = publishedRow({
      id: 'journey-placeholder',
      slug: 'placeholder-journey',
      title: 'Placeholder journey',
      short_description: 'A placeholder journey description.',
      category: 'ginseng',
      access_status: 'contact_required',
      highlights: null,
      image_url: '',
      alt_text: '',
      is_placeholder: true,
      placeholder_label: 'Nội dung đề xuất',
      verified_at: null,
    })
    const fallbackEnumJourney = publishedRow({
      id: 'journey-defaults',
      slug: 'default-journey',
      title: 'Default journey',
      short_description: 'A journey with unknown enum input.',
      category: 'unknown',
      access_status: 'unknown',
      contact_required: true,
      highlights: [],
      image_url: '/images/default.webp',
      alt_text: 'Default journey image',
    })
    const { client } = clientFor({
      journeys: {
        data: [placeholderJourney, fallbackEnumJourney],
        error: null,
      },
      ginseng_products: {
        data: [publishedRow({
          id: 'product-default',
          slug: 'default-product',
          name: 'Default product',
          product_type: 'unknown',
          short_description: 'A product with an unknown type.',
          image_url: '/images/default-product.webp',
          alt_text: 'Default product image',
        })],
        error: null,
      },
      travel_guides: {
        data: [publishedRow({
          id: 'guide-default',
          slug: 'default-guide',
          title: 'Default guide',
          excerpt: 'A guide without structured sections.',
          sections: ['legacy section'],
        })],
        error: null,
      },
    })
    mocks.createClient.mockReturnValue(client)
    const adapter = createSupabaseContentAdapter()!

    const journeys = await adapter.getPublishedJourneys!()
    const products = await adapter.getPublishedProducts!()
    const guides = await adapter.getPublishedGuides!()

    expect(journeys[0]).toMatchObject({
      category: 'ginseng',
      accessStatus: 'contact_required',
      highlights: [],
      isPlaceholder: true,
      placeholderLabel: 'Nội dung đề xuất',
    })
    expect(journeys[1]).toMatchObject({
      category: 'nature',
      accessStatus: 'contact_required',
    })
    expect(products[0].productType).toBe('herbal-tea')
    expect(guides[0].sections).toEqual([])
    await expect(
      adapter.getJourneyBySlug('placeholder-journey'),
    ).resolves.toMatchObject({ slug: 'placeholder-journey' })
    await expect(
      adapter.getProductBySlug('default-product'),
    ).resolves.toMatchObject({ slug: 'default-product' })
    await expect(
      adapter.getGuideBySlug('default-guide'),
    ).resolves.toMatchObject({ slug: 'default-guide' })
  })

  it('does not construct a client without public Supabase configuration', () => {
    mocks.getPublicSupabaseConfig.mockReturnValue(null)

    expect(createSupabaseContentAdapter()).toBeNull()
    expect(mocks.createClient).not.toHaveBeenCalled()
  })
})
