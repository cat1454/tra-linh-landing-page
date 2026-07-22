import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import {
  getMediaBucketName,
  getPublicSupabaseConfig,
} from '@/lib/supabase/config'

import { fallbackContent } from './fallback-content'
import type {
  ContentAdapter,
  ContentStatus,
  CultureStory,
  GinsengStoryStep,
  Guide,
  HeroContent,
  HomePageContent,
  Journey,
  LocalSpecialty,
  MediaAsset,
  Product,
  StoryChapter,
  UsagePermission,
  VerificationStatus,
} from './types'

type CmsRow = Record<string, unknown>

const DEFAULT_UPDATED_AT = '1970-01-01T00:00:00.000Z'

function clone<T>(value: T): T {
  return structuredClone(value)
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function booleanValue(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function statusValue(value: unknown): ContentStatus {
  return value === 'draft' || value === 'review' || value === 'published'
    ? value
    : 'review'
}

function usagePermissionValue(
  value: unknown,
  fallback: UsagePermission,
): UsagePermission {
  if (
    value === 'client_confirmed' ||
    value === 'official_publication' ||
    value === 'pending'
  ) {
    return value
  }
  return fallback
}

function verificationValue(row: CmsRow): VerificationStatus {
  return booleanValue(row.is_placeholder) || !stringValue(row.verified_at)
    ? 'placeholder'
    : 'verified'
}

function mediaFromRow(
  row: CmsRow,
  fallback: MediaAsset,
  id: string,
  src = stringValue(row.image_url),
): MediaAsset {
  const customImage = stringValue(src)

  return {
    id: stringValue(row.media_id, `${id}-media`),
    src: customImage || fallback.src,
    title: stringValue(row.media_title, fallback.title),
    altText: stringValue(row.alt_text, fallback.altText),
    caption: stringValue(row.caption) || undefined,
    sourceUrl: stringValue(row.source_url, fallback.sourceUrl),
    sourceCredit: stringValue(row.source_credit, fallback.sourceCredit),
    usagePermission: usagePermissionValue(
      row.usage_permission,
      customImage ? 'pending' : fallback.usagePermission,
    ),
    verifiedAt: stringValue(row.verified_at) || null,
  }
}

function directMediaFromRow(row: CmsRow, signedUrl: string): MediaAsset {
  const fallback = fallbackContent.media[0]

  return {
    id: stringValue(row.id, 'cms-media'),
    src: signedUrl,
    title: stringValue(row.title, fallback.title),
    altText: stringValue(row.alt_text, fallback.altText),
    caption: stringValue(row.caption) || undefined,
    sourceUrl: stringValue(row.source_url, fallback.sourceUrl),
    sourceCredit: stringValue(row.source_credit, fallback.sourceCredit),
    usagePermission: usagePermissionValue(
      row.usage_permission,
      fallback.usagePermission,
    ),
    verifiedAt: stringValue(row.verified_at) || null,
    width: numberValue(row.width) || undefined,
    height: numberValue(row.height) || undefined,
  }
}

function baseFromRow(row: CmsRow, fallbackMedia: MediaAsset) {
  const id = stringValue(row.id, stringValue(row.slug, 'cms-content'))
  const isPlaceholder = booleanValue(row.is_placeholder)
  const rawPlaceholderLabel = stringValue(row.placeholder_label)
  const placeholderLabel: 'Đang cập nhật' | 'Nội dung đề xuất' =
    rawPlaceholderLabel === 'Nội dung đề xuất'
      ? 'Nội dung đề xuất'
      : 'Đang cập nhật'

  return {
    id,
    slug: stringValue(row.slug),
    title: stringValue(row.title ?? row.name),
    shortDescription: stringValue(
      row.short_description,
      stringValue(row.description),
    ),
    description: stringValue(row.description, stringValue(row.short_description)),
    status: statusValue(row.status),
    verificationStatus: verificationValue(row),
    isPlaceholder,
    placeholderLabel: isPlaceholder ? placeholderLabel : undefined,
    sourceUrl: stringValue(row.source_url, fallbackMedia.sourceUrl),
    sourceCredit: stringValue(row.source_credit, fallbackMedia.sourceCredit),
    verifiedAt: stringValue(row.verified_at) || null,
    displayOrder: numberValue(row.display_order),
    featuredMedia: mediaFromRow(row, fallbackMedia, id),
    gallery: [] as MediaAsset[],
    updatedAt: stringValue(row.updated_at, DEFAULT_UPDATED_AT),
  }
}

function journeyFromRow(
  row: CmsRow,
  fallbackMedia = fallbackContent.hero.backgroundMedia,
): Journey {
  const base = baseFromRow(row, fallbackMedia)
  const category = row.category
  const accessStatus = row.access_status

  return {
    ...base,
    category:
      category === 'community' ||
      category === 'heritage' ||
      category === 'ginseng'
        ? category
        : 'nature',
    locationLabel: stringValue(row.location_label, 'Xã Trà Linh'),
    durationLabel: stringValue(row.duration_label, 'Đang cập nhật'),
    accessStatus:
      accessStatus === 'open' ||
      accessStatus === 'contact_required' ||
      accessStatus === 'organized_only'
        ? accessStatus
        : booleanValue(row.contact_required)
          ? 'contact_required'
          : 'organized_only',
    accessNote: stringValue(
      row.access_note,
      'Vui lòng xác nhận điều kiện tiếp cận trước khi khởi hành.',
    ),
    safetyNote: stringValue(
      row.safety_note,
      'Tuân thủ hướng dẫn an toàn tại địa phương.',
    ),
    highlights: Array.isArray(row.highlights)
      ? row.highlights.filter((item): item is string => typeof item === 'string')
      : [],
  }
}

function productFromRow(
  row: CmsRow,
  fallbackMedia = fallbackContent.hero.backgroundMedia,
): Product {
  const base = baseFromRow(row, fallbackMedia)
  const productType = row.product_type

  return {
    ...base,
    productType:
      productType === 'fresh-ginseng' || productType === 'dried-ginseng'
        ? productType
        : 'herbal-tea',
    originNote: stringValue(
      row.origin_note,
      'Thông tin nguồn gốc đang được cập nhật.',
    ),
    legalDisclaimer: stringValue(
      row.legal_disclaimer,
      'Nội dung mang tính giới thiệu, không phải tư vấn y khoa.',
    ),
    contactUrl: stringValue(row.contact_url) || null,
  }
}

function guideFromRow(
  row: CmsRow,
  fallbackMedia = fallbackContent.hero.backgroundMedia,
): Guide {
  const base = baseFromRow(row, fallbackMedia)
  const sections = Array.isArray(row.sections)
    ? row.sections.flatMap((section) => {
        if (!section || typeof section !== 'object') return []
        const record = section as CmsRow
        const title = stringValue(record.title)
        const body = stringValue(record.body)
        return title && body ? [{ title, body }] : []
      })
    : []

  return {
    ...base,
    shortDescription: stringValue(row.excerpt, base.shortDescription),
    description: stringValue(row.excerpt, base.description),
    readTimeLabel: stringValue(row.read_time_label, '3 phút đọc'),
    seasonLabel: stringValue(row.season_label, 'Theo điều kiện thực tế'),
    sections,
  }
}

function storyFromRow(row: CmsRow, fallback: StoryChapter): StoryChapter {
  const id = stringValue(row.id, fallback.id)

  return {
    id,
    eyebrow: stringValue(row.eyebrow, fallback.eyebrow),
    title: stringValue(row.title, fallback.title),
    description: stringValue(row.description, fallback.description),
    media: mediaFromRow(row, fallback.media, id),
    displayOrder: numberValue(row.display_order, fallback.displayOrder),
  }
}

function ginsengStepFromRow(
  row: CmsRow,
  fallback: GinsengStoryStep,
): GinsengStoryStep {
  const id = stringValue(row.id, fallback.id)

  return {
    id,
    stepNumber: numberValue(row.step_number, fallback.stepNumber),
    title: stringValue(row.title, fallback.title),
    description: stringValue(row.description, fallback.description),
    quote: stringValue(row.quote) || undefined,
    media: mediaFromRow(row, fallback.media, id),
    displayOrder: numberValue(row.display_order, fallback.displayOrder),
  }
}

function cultureStoryFromRow(
  row: CmsRow,
  fallback: CultureStory,
): CultureStory {
  const id = stringValue(row.id, fallback.id)

  return {
    id,
    title: stringValue(row.title, fallback.title),
    description: stringValue(row.description, fallback.description),
    caption: stringValue(row.caption) || undefined,
    media: mediaFromRow(row, fallback.media, id),
    displayOrder: numberValue(row.display_order, fallback.displayOrder),
  }
}

function localSpecialtyFromRow(
  row: CmsRow,
  fallback: LocalSpecialty,
): LocalSpecialty {
  const id = stringValue(row.id, fallback.id)
  const category = row.category
  const isPlaceholder = booleanValue(row.is_placeholder)

  return {
    id,
    slug: stringValue(row.slug, fallback.slug),
    name: stringValue(row.name, fallback.name),
    category:
      category === 'duoc-lieu' || category === 'nong-san'
        ? category
        : 'am-thuc',
    description: stringValue(row.description, fallback.description),
    media: mediaFromRow(row, fallback.media, id),
    isPlaceholder,
    placeholderLabel: isPlaceholder
      ? baseFromRow(row, fallback.media).placeholderLabel
      : undefined,
    sourceUrl: stringValue(row.source_url, fallback.sourceUrl),
    sourceCredit: stringValue(row.source_credit, fallback.sourceCredit),
    displayOrder: numberValue(row.display_order, fallback.displayOrder),
  }
}

function heroFromRows(
  settingsRows: CmsRow[],
  slideRows: CmsRow[],
): HeroContent {
  const fallback = fallbackContent.hero
  const settings = settingsRows[0]
  const slide = slideRows[0]

  if (!settings && !slide) return clone(fallback)

  return {
    eyebrow: stringValue(
      slide?.eyebrow,
      stringValue(settings?.tagline, fallback.eyebrow),
    ),
    title: stringValue(
      slide?.title,
      stringValue(settings?.tagline, fallback.title),
    ),
    placeName: stringValue(settings?.site_name, fallback.placeName),
    description: stringValue(
      slide?.description,
      stringValue(settings?.description, fallback.description),
    ),
    primaryCta: {
      label: stringValue(
        slide?.cta_label,
        stringValue(settings?.primary_cta_label, fallback.primaryCta.label),
      ),
      href: stringValue(
        slide?.cta_href,
        stringValue(settings?.primary_cta_href, fallback.primaryCta.href),
      ),
    },
    secondaryCta: clone(fallback.secondaryCta),
    tags: clone(fallback.tags),
    backgroundMedia: slide
      ? mediaFromRow(
          slide,
          fallback.backgroundMedia,
          stringValue(slide.id, 'cms-hero'),
        )
      : clone(fallback.backgroundMedia),
  }
}

function mapRowsOrFallback<T>(
  rows: CmsRow[],
  fallback: T[],
  map: (row: CmsRow, fallbackItem: T) => T,
): T[] {
  if (rows.length === 0) return clone(fallback)

  return rows.map((row, index) =>
    map(row, fallback[index] ?? fallback[0]),
  )
}

class SupabaseContentAdapter implements ContentAdapter {
  readonly isConfigured = true

  constructor(private readonly client: SupabaseClient) {}

  private async getRows(table: string): Promise<CmsRow[]> {
    const { data, error } = await this.client
      .from(table)
      .select('*')
      .eq('status', 'published')
      .order('display_order', { ascending: true })

    if (error) throw error
    return (data ?? []) as CmsRow[]
  }

  private async getRowsSafely(table: string): Promise<CmsRow[]> {
    try {
      return await this.getRows(table)
    } catch {
      return []
    }
  }

  private async resolveMedia(rows: CmsRow[]): Promise<MediaAsset[]> {
    if (rows.length === 0) return clone(fallbackContent.media)

    let bucket: ReturnType<SupabaseClient['storage']['from']>
    try {
      bucket = this.client.storage.from(getMediaBucketName())
    } catch {
      return clone(fallbackContent.media)
    }

    const media = await Promise.all(
      rows.map(async (row): Promise<MediaAsset | null> => {
        const storagePath = stringValue(row.storage_path)
        if (
          !storagePath ||
          storagePath.startsWith('/') ||
          storagePath.split('/').includes('..')
        ) {
          return null
        }

        try {
          const { data, error } = await bucket.createSignedUrl(storagePath, 3600)
          if (error || !data?.signedUrl) return null
          return directMediaFromRow(row, data.signedUrl)
        } catch {
          return null
        }
      }),
    )
    const resolved = media.filter((item): item is MediaAsset => item !== null)
    return resolved.length > 0 ? resolved : clone(fallbackContent.media)
  }

  private async getRow(table: string, slug: string): Promise<CmsRow | null> {
    const { data, error } = await this.client
      .from(table)
      .select('*')
      .eq('status', 'published')
      .eq('slug', slug)
      .maybeSingle()

    if (error) throw error
    return (data as CmsRow | null) ?? null
  }

  async getPublishedJourneys(): Promise<Journey[]> {
    return (await this.getRows('journeys')).map((row) => journeyFromRow(row))
  }

  async getPublishedProducts(): Promise<Product[]> {
    return (await this.getRows('ginseng_products')).map((row) =>
      productFromRow(row),
    )
  }

  async getPublishedGuides(): Promise<Guide[]> {
    return (await this.getRows('travel_guides')).map((row) => guideFromRow(row))
  }

  async getHomePageContent(): Promise<HomePageContent> {
    const [
      settingsRows,
      heroRows,
      storyRows,
      journeyRows,
      ginsengStepRows,
      cultureRows,
      localProductRows,
      productRows,
      guideRows,
      mediaRows,
    ] = await Promise.all([
      this.getRowsSafely('site_settings'),
      this.getRowsSafely('hero_slides'),
      this.getRowsSafely('stories'),
      this.getRowsSafely('journeys'),
      this.getRowsSafely('ginseng_story_steps'),
      this.getRowsSafely('culture_stories'),
      this.getRowsSafely('local_products'),
      this.getRowsSafely('ginseng_products'),
      this.getRowsSafely('travel_guides'),
      this.getRowsSafely('media_assets'),
    ])

    const media = await this.resolveMedia(mediaRows)

    return {
      source: 'supabase',
      hero: heroFromRows(settingsRows, heroRows),
      identityValues: clone(fallbackContent.identityValues),
      storyChapters: mapRowsOrFallback(
        storyRows,
        fallbackContent.storyChapters,
        storyFromRow,
      ),
      journeys: mapRowsOrFallback(
        journeyRows,
        fallbackContent.journeys,
        (row, fallback) => journeyFromRow(row, fallback.featuredMedia),
      ),
      ginsengStorySteps: mapRowsOrFallback(
        ginsengStepRows,
        fallbackContent.ginsengStorySteps,
        ginsengStepFromRow,
      ),
      cultureStories: mapRowsOrFallback(
        cultureRows,
        fallbackContent.cultureStories,
        cultureStoryFromRow,
      ),
      localSpecialties: mapRowsOrFallback(
        localProductRows,
        fallbackContent.localSpecialties,
        localSpecialtyFromRow,
      ),
      products: mapRowsOrFallback(
        productRows,
        fallbackContent.products,
        (row, fallback) => productFromRow(row, fallback.featuredMedia),
      ),
      guides: mapRowsOrFallback(
        guideRows,
        fallbackContent.guides,
        (row, fallback) => guideFromRow(row, fallback.featuredMedia),
      ),
      media,
    }
  }

  async getJourneyBySlug(slug: string): Promise<Journey | null> {
    const row = await this.getRow('journeys', slug)
    return row ? journeyFromRow(row) : null
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const row = await this.getRow('ginseng_products', slug)
    return row ? productFromRow(row) : null
  }

  async getGuideBySlug(slug: string): Promise<Guide | null> {
    const row = await this.getRow('travel_guides', slug)
    return row ? guideFromRow(row) : null
  }
}

export function createSupabaseContentAdapter(): ContentAdapter | null {
  const config = getPublicSupabaseConfig()
  if (!config) return null

  const client = createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  })

  return new SupabaseContentAdapter(client)
}
