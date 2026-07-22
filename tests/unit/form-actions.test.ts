import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  isConfigured: vi.fn(),
  fingerprint: vi.fn(),
  consume: vi.fn(),
  createAdminClient: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabase/config', () => ({
  isSupabaseAdminConfigured: mocks.isConfigured,
}))
vi.mock('@/lib/supabase/rate-limit', () => ({
  getRequestFingerprint: mocks.fingerprint,
  consumeRateLimit: mocks.consume,
}))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: mocks.createAdminClient,
}))

import {
  submitContactAction,
  subscribeNewsletterAction,
} from '@/app/actions/forms'

const previousState = { status: 'idle' as const, message: '' }

function contactForm(overrides: Record<string, string | Blob> = {}) {
  const form = new FormData()
  const values: Record<string, string | Blob> = {
    name: 'Nguyễn An',
    email: 'AN@example.com',
    phone: '0900000000',
    interest: 'journey',
    message: 'Tôi muốn tìm hiểu hành trình có hướng dẫn tại Trà Linh.',
    consent: 'on',
    website: '',
    ...overrides,
  }
  for (const [key, value] of Object.entries(values)) form.set(key, value)
  return form
}

function newsletterForm(overrides: Record<string, string | Blob> = {}) {
  const form = new FormData()
  const values: Record<string, string | Blob> = {
    email: 'BAN@example.com',
    consent: 'accepted',
    website: '',
    ...overrides,
  }
  for (const [key, value] of Object.entries(values)) form.set(key, value)
  return form
}

function contactClient(error: unknown = null) {
  const insert = vi.fn().mockResolvedValue({ error })
  const from = vi.fn().mockReturnValue({ insert })
  return { from, insert }
}

function newsletterClient(error: unknown = null) {
  const upsert = vi.fn().mockResolvedValue({ error })
  const from = vi.fn().mockReturnValue({ upsert })
  return { from, upsert }
}

describe('public server actions', () => {
  beforeEach(() => {
    mocks.isConfigured.mockReturnValue(true)
    mocks.fingerprint.mockResolvedValue('fingerprint')
    mocks.consume.mockResolvedValue(true)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('keeps both forms disabled until the CMS is configured', async () => {
    mocks.isConfigured.mockReturnValue(false)

    await expect(
      submitContactAction(previousState, contactForm()),
    ).resolves.toMatchObject({ status: 'disabled' })
    await expect(
      subscribeNewsletterAction(previousState, newsletterForm()),
    ).resolves.toMatchObject({ status: 'disabled' })
    expect(mocks.fingerprint).not.toHaveBeenCalled()
  })

  it('returns field errors without touching persistence', async () => {
    const state = await submitContactAction(
      previousState,
      contactForm({
        name: 'A',
        email: 'bad-email',
        message: 'ngắn',
        consent: '',
        website: 'bot',
      }),
    )

    expect(state.status).toBe('error')
    expect(state.fieldErrors).toMatchObject({
      name: expect.any(Array),
      email: expect.any(Array),
      message: expect.any(Array),
      consent: expect.any(Array),
      website: expect.any(Array),
    })
    expect(mocks.fingerprint).not.toHaveBeenCalled()

    await expect(
      subscribeNewsletterAction(
        previousState,
        newsletterForm({ email: 'bad', consent: '' }),
      ),
    ).resolves.toMatchObject({ status: 'error' })
  })

  it('does not persist when a request fingerprint cannot be created', async () => {
    mocks.fingerprint.mockResolvedValue(null)

    await expect(
      submitContactAction(previousState, contactForm({ consent: 'true' })),
    ).resolves.toMatchObject({ status: 'disabled' })
    await expect(
      subscribeNewsletterAction(previousState, newsletterForm({ consent: '1' })),
    ).resolves.toMatchObject({ status: 'disabled' })
    expect(mocks.consume).not.toHaveBeenCalled()
  })

  it('returns a rate-limited state before persistence', async () => {
    mocks.consume.mockResolvedValue(false)

    await expect(
      submitContactAction(previousState, contactForm()),
    ).resolves.toMatchObject({ status: 'rate_limited' })
    await expect(
      subscribeNewsletterAction(previousState, newsletterForm()),
    ).resolves.toMatchObject({ status: 'rate_limited' })
    expect(mocks.createAdminClient).not.toHaveBeenCalled()
  })

  it('handles a missing admin client after rate limiting', async () => {
    mocks.createAdminClient.mockReturnValue(null)

    await expect(
      submitContactAction(previousState, contactForm()),
    ).resolves.toMatchObject({ status: 'disabled' })
    await expect(
      subscribeNewsletterAction(previousState, newsletterForm()),
    ).resolves.toMatchObject({ status: 'disabled' })
  })

  it('persists a normalized contact submission', async () => {
    const client = contactClient()
    mocks.createAdminClient.mockReturnValue(client)

    await expect(
      submitContactAction(previousState, contactForm({ consent: 'accepted' })),
    ).resolves.toMatchObject({ status: 'success' })
    expect(mocks.consume).toHaveBeenCalledWith('contact:fingerprint', 5, 3_600)
    expect(client.from).toHaveBeenCalledWith('contact_submissions')
    expect(client.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Nguyễn An',
        email: 'an@example.com',
        phone: '0900000000',
        interest: 'journey',
        consent: true,
        request_fingerprint: 'fingerprint',
      }),
    )
  })

  it('persists a newsletter subscription with explicit defaults', async () => {
    const client = newsletterClient()
    mocks.createAdminClient.mockReturnValue(client)

    await expect(
      subscribeNewsletterAction(previousState, newsletterForm()),
    ).resolves.toMatchObject({ status: 'success' })
    expect(mocks.consume).toHaveBeenCalledWith(
      'newsletter:fingerprint',
      3,
      86_400,
    )
    expect(client.from).toHaveBeenCalledWith('newsletter_subscribers')
    expect(client.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'ban@example.com',
        status: 'subscribed',
        unsubscribed_at: null,
      }),
      { onConflict: 'email' },
    )
  })

  it('returns safe errors when database writes fail', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.createAdminClient.mockReturnValueOnce(contactClient(new Error('db')))
    await expect(
      submitContactAction(previousState, contactForm()),
    ).resolves.toMatchObject({ status: 'error' })

    mocks.createAdminClient.mockReturnValueOnce(newsletterClient(new Error('db')))
    await expect(
      subscribeNewsletterAction(previousState, newsletterForm()),
    ).resolves.toMatchObject({ status: 'error' })
    expect(errorSpy).toHaveBeenCalledTimes(2)
    errorSpy.mockRestore()
  })

  it('treats non-text form entries as empty strings', async () => {
    const file = new File(['x'], 'x.txt', { type: 'text/plain' })
    const state = await submitContactAction(
      previousState,
      contactForm({ name: file }),
    )
    expect(state).toMatchObject({ status: 'error' })
  })
})
