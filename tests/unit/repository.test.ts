import { afterEach, describe, expect, it, vi } from 'vitest'

import { fallbackContent } from '@/lib/content/fallback-content'
import { createContentRepository } from '@/lib/content/repository'

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
    const repository = createContentRepository({
      isConfigured: true,
      getHomePageContent: vi.fn().mockRejectedValue(new Error('offline')),
      getJourneyBySlug: vi.fn().mockRejectedValue(new Error('offline')),
      getProductBySlug: vi.fn().mockRejectedValue(new Error('offline')),
      getGuideBySlug: vi.fn().mockRejectedValue(new Error('offline')),
    })

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
})
