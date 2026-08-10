export type ContentStatus = 'draft' | 'review' | 'published'

export type VerificationStatus = 'placeholder' | 'verified'

export type AccessStatus = 'open' | 'contact_required' | 'organized_only'

export type UsagePermission =
  | 'client_confirmed'
  | 'official_publication'
  | 'pending'

export type ContentSource = 'static'

export interface MediaAsset {
  id: string
  src: string
  title?: string
  altText: string
  caption?: string
  sourceUrl: string
  sourceCredit: string
  usagePermission: UsagePermission
  verifiedAt: string | null
  width?: number
  height?: number
  mediaType?: 'image' | 'video'
  mimeType?: string
  fileSize?: number
  storagePath?: string
  externalUrl?: string
  poster?: MediaAsset
}

export interface ContentLink {
  label: string
  href: string
}

export interface ContentSection {
  title: string
  body: string
}

export interface JourneyItineraryStep {
  title: string
  description: string
}

export interface BaseContentRecord {
  id: string
  slug: string
  title: string
  shortDescription: string
  description: string
  status: ContentStatus
  verificationStatus: VerificationStatus
  isPlaceholder: boolean
  placeholderLabel?: 'Đang cập nhật' | 'Nội dung đề xuất'
  sourceUrl: string
  sourceCredit: string
  verifiedAt: string | null
  displayOrder: number
  featuredMedia: MediaAsset
  gallery: MediaAsset[]
  updatedAt: string
}

export interface Journey extends BaseContentRecord {
  category: 'nature' | 'community' | 'heritage' | 'ginseng'
  locationLabel: string
  durationLabel: string
  difficultyLabel: string
  bestSeasonLabel: string
  itinerary: JourneyItineraryStep[]
  accessStatus: AccessStatus
  accessNote: string
  safetyNote: string
  highlights: string[]
}

export interface Product extends BaseContentRecord {
  productType: 'fresh-ginseng' | 'dried-ginseng' | 'herbal-tea'
  originNote: string
  legalDisclaimer: string
  contactUrl: string | null
}

export interface Guide extends BaseContentRecord {
  readTimeLabel: string
  seasonLabel: string
  sections: ContentSection[]
}

export type IdentityIcon = 'mountain' | 'sprout' | 'community' | 'leaf'

export interface IdentityValue {
  id: string
  title: string
  description: string
  icon: IdentityIcon
}

export interface StoryChapter {
  id: string
  eyebrow: string
  title: string
  description: string
  media: MediaAsset
  displayOrder: number
}

export interface GinsengStoryStep {
  id: string
  stepNumber: number
  title: string
  description: string
  quote?: string
  media: MediaAsset
  displayOrder: number
}

export interface CultureStory {
  id: string
  title: string
  description: string
  caption?: string
  media: MediaAsset
  displayOrder: number
}

export interface LocalSpecialty {
  id: string
  slug: string
  name: string
  category: 'am-thuc' | 'duoc-lieu' | 'nong-san'
  description: string
  media: MediaAsset
  isPlaceholder: boolean
  placeholderLabel?: 'Đang cập nhật' | 'Nội dung đề xuất'
  sourceUrl: string
  sourceCredit: string
  displayOrder: number
}

export interface PressArticle {
  id: string
  title: string
  publisher: string
  publishedDate: string
  summary: string
  url: string
  media: MediaAsset
  displayOrder: number
  isVerified: boolean
}

export interface HeroContent {
  eyebrow: string
  title: string
  placeName: string
  description: string
  primaryCta: ContentLink
  secondaryCta: ContentLink
  tags: string[]
  backgroundMedia: MediaAsset
  videoMedia?: MediaAsset
  mobilePoster?: MediaAsset
}

export interface SectionStat {
  value: string
  label: string
  icon?: IdentityIcon
}

export interface PageSectionSettings {
  key: string
  eyebrow?: string
  title: string
  description?: string
  secondaryText?: string
  cta?: ContentLink
  badges: string[]
  stats: SectionStat[]
  media?: MediaAsset
}

export interface HomePageContent {
  source: ContentSource
  hero: HeroContent
  sectionSettings: Record<string, PageSectionSettings>
  identityValues: IdentityValue[]
  storyChapters: StoryChapter[]
  journeys: Journey[]
  ginsengStorySteps: GinsengStoryStep[]
  cultureStories: CultureStory[]
  localSpecialties: LocalSpecialty[]
  products: Product[]
  guides: Guide[]
  pressArticles?: PressArticle[]
  media: MediaAsset[]
}

export interface ContentRepository {
  getHomePageContent(): Promise<HomePageContent>
  getJourneyBySlug(slug: string): Promise<Journey | null>
  getProductBySlug(slug: string): Promise<Product | null>
  getGuideBySlug(slug: string): Promise<Guide | null>
  getPublishedJourneys(): Promise<Journey[]>
  getPublishedProducts(): Promise<Product[]>
  getPublishedGuides(): Promise<Guide[]>
}
