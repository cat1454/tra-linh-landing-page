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
  PageSectionSettings,
  Product,
  SectionStat,
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
    mediaType: row.media_type === 'video' ? 'video' : 'image',
    mimeType: stringValue(row.mime_type) || undefined,
    fileSize: numberValue(row.file_size_bytes) || undefined,
    storagePath: stringValue(row.storage_path) || undefined,
    externalUrl: stringValue(row.external_url) || undefined,
  }
}

function safeExternalMediaUrl(value: unknown): string | null {
  const raw = stringValue(value)
  if (!raw) return null
  try {
    const url = new URL(raw)
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : null
  } catch {
    return null
  }
}

function sectionSettingsFromRows(
  rows: CmsRow[],
  mediaById: Map<string, MediaAsset>,
): Record<string, PageSectionSettings> {
  const sections: Record<string, PageSectionSettings> = {}
  for (const row of rows) {
    const key = stringValue(row.section_key)
    const title = stringValue(row.title)
    if (!key || !title) continue

    const badges = Array.isArray(row.badges)
      ? row.badges.filter((item): item is string => typeof item === 'string')
      : []
    const stats = Array.isArray(row.stats)
      ? row.stats.flatMap((item) => {
          if (!item || typeof item !== 'object') return []
          const stat = item as CmsRow
          const value = stringValue(stat.value)
          const label = stringValue(stat.label)
          if (!value || !label) return []
          const icon: SectionStat['icon'] =
            stat.icon === 'mountain' ||
            stat.icon === 'sprout' ||
            stat.icon === 'community' ||
            stat.icon === 'leaf'
              ? stat.icon
              : undefined
          return [{ value, label, icon }]
        })
      : []
    const ctaLabel = stringValue(row.cta_label)
    const ctaHref = stringValue(row.cta_href)
    const mediaId = stringValue(row.media_asset_id)

    sections[key] = {
      key,
      eyebrow: stringValue(row.eyebrow) || undefined,
      title,
      description: stringValue(row.description) || undefined,
      secondaryText: stringValue(row.secondary_text) || undefined,
      cta: ctaLabel && ctaHref ? { label: ctaLabel, href: ctaHref } : undefined,
      badges,
      stats,
      media: mediaById.get(mediaId),
    }
  }
  return sections
}

function rowsWithResolvedMedia(
  rows: CmsRow[],
  mediaById: Map<string, MediaAsset>,
): CmsRow[] {
  return rows.map((row) => {
    const asset = mediaById.get(stringValue(row.media_asset_id))
    if (!asset) return row
    return {
      ...row,
      image_url: asset.src,
      alt_text: stringValue(row.alt_text, asset.altText),
      media_id: asset.id,
      media_title: asset.title,
      source_url: stringValue(row.source_url, asset.sourceUrl),
      source_credit: stringValue(row.source_credit, asset.sourceCredit),
      usage_permission: row.usage_permission ?? asset.usagePermission,
    }
  })
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
    durationLabel: stringValue(
      row.duration_label,
      'Cần xác nhận điều kiện thực tế',
    ),
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
      'Nguồn gốc cần được đơn vị cung cấp xác nhận.',
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
  sectionSettings: Record<string, PageSectionSettings>,
  mediaById: Map<string, MediaAsset>,
): HeroContent {
  const fallback = fallbackContent.hero
  const settings = settingsRows[0]
  const slide = slideRows[0]

  const section = sectionSettings.hero
  const videoAsset = mediaById.get(stringValue(settings?.hero_video_asset_id))
  const mobilePoster = mediaById.get(
    stringValue(settings?.hero_mobile_poster_asset_id),
  )
  const externalVideo = safeExternalMediaUrl(settings?.hero_video_url)
  const externalMobilePoster = safeExternalMediaUrl(
    settings?.hero_mobile_poster_url,
  )

  if (!settings && !slide && !section) return clone(fallback)

  return {
    eyebrow: stringValue(
      section?.eyebrow,
      stringValue(slide?.eyebrow, stringValue(settings?.tagline, fallback.eyebrow)),
    ),
    title: stringValue(
      section?.title,
      stringValue(slide?.title, stringValue(settings?.tagline, fallback.title)),
    ),
    placeName: stringValue(section?.secondaryText, stringValue(settings?.site_name, fallback.placeName)),
    description: stringValue(
      section?.description,
      stringValue(slide?.description, stringValue(settings?.description, fallback.description)),
    ),
    primaryCta: {
      label: stringValue(
        section?.cta?.label,
        stringValue(slide?.cta_label, stringValue(settings?.primary_cta_label, fallback.primaryCta.label)),
      ),
      href: stringValue(
        section?.cta?.href,
        stringValue(slide?.cta_href, stringValue(settings?.primary_cta_href, fallback.primaryCta.href)),
      ),
    },
    secondaryCta: clone(fallback.secondaryCta),
    tags: section?.badges.length ? clone(section.badges) : clone(fallback.tags),
    backgroundMedia: slide
      ? mediaFromRow(
          slide,
          fallback.backgroundMedia,
          stringValue(slide.id, 'cms-hero'),
        )
      : clone(fallback.backgroundMedia),
    videoMedia:
      videoAsset ??
      (externalVideo
        ? {
            ...clone(fallback.backgroundMedia),
            id: 'external-hero-video',
            src: externalVideo,
            mediaType: 'video',
            externalUrl: externalVideo,
          }
        : fallback.videoMedia),
    mobilePoster:
      mobilePoster ??
      (externalMobilePoster
        ? {
            ...clone(fallback.backgroundMedia),
            id: 'external-mobile-poster',
            src: externalMobilePoster,
            externalUrl: externalMobilePoster,
          }
        : fallback.mobilePoster),
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
        if (!storagePath) {
          const externalUrl = safeExternalMediaUrl(
            row.external_url ?? row.file_url,
          )
          return externalUrl ? directMediaFromRow(row, externalUrl) : null
        }
        if (storagePath.startsWith('/') || storagePath.split('/').includes('..')) {
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
    if (resolved.length === 0) return clone(fallbackContent.media)
    const byId = new Map(resolved.map((item) => [item.id, item]))
    const posterById = new Map(
      rows.map((row) => [
        stringValue(row.id),
        stringValue(row.poster_asset_id),
      ]),
    )
    return resolved.map((item) => {
      const poster = byId.get(posterById.get(item.id) ?? '')
      return poster ? { ...item, poster } : item
    })
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
      pageSectionRows,
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
      this.getRowsSafely('page_sections'),
    ])

    const media = await this.resolveMedia(mediaRows)
    const mediaById = new Map(media.map((item) => [item.id, item]))
    const sectionSettings = sectionSettingsFromRows(pageSectionRows, mediaById)
    const resolvedHeroRows = rowsWithResolvedMedia(heroRows, mediaById)
    const resolvedStoryRows = rowsWithResolvedMedia(storyRows, mediaById)
    const resolvedJourneyRows = rowsWithResolvedMedia(journeyRows, mediaById)
    const resolvedGinsengRows = rowsWithResolvedMedia(ginsengStepRows, mediaById)
    const resolvedCultureRows = rowsWithResolvedMedia(cultureRows, mediaById)
    const resolvedLocalRows = rowsWithResolvedMedia(localProductRows, mediaById)
    const resolvedProductRows = rowsWithResolvedMedia(productRows, mediaById)
    const resolvedGuideRows = rowsWithResolvedMedia(guideRows, mediaById)
    const identityStats = sectionSettings.identity?.stats ?? []
    const identityValues = identityStats.length
      ? identityStats.map((stat, index) => ({
          id: `identity-${index + 1}`,
          title: stat.value,
          description: stat.label,
          icon: stat.icon ?? fallbackContent.identityValues[index]?.icon ?? 'leaf',
        }))
      : clone(fallbackContent.identityValues)

    return {
      source: 'supabase',
      hero: heroFromRows(settingsRows, resolvedHeroRows, sectionSettings, mediaById),
      sectionSettings,
      identityValues,
      storyChapters: mapRowsOrFallback(
        resolvedStoryRows,
        fallbackContent.storyChapters,
        storyFromRow,
      ),
      journeys: mapRowsOrFallback(
        resolvedJourneyRows,
        fallbackContent.journeys,
        (row, fallback) => journeyFromRow(row, fallback.featuredMedia),
      ),
      ginsengStorySteps: mapRowsOrFallback(
        resolvedGinsengRows,
        fallbackContent.ginsengStorySteps,
        ginsengStepFromRow,
      ),
      cultureStories: mapRowsOrFallback(
        resolvedCultureRows,
        fallbackContent.cultureStories,
        cultureStoryFromRow,
      ),
      localSpecialties: mapRowsOrFallback(
        resolvedLocalRows,
        fallbackContent.localSpecialties,
        localSpecialtyFromRow,
      ),
      products: resolvedProductRows.map((row) => productFromRow(row)),
      guides: mapRowsOrFallback(
        resolvedGuideRows,
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
