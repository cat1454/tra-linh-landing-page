import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getAdminAccess: vi.fn(),
  createServerSupabaseClient: vi.fn(),
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('@/lib/supabase/access', () => ({
  getAdminAccess: mocks.getAdminAccess,
}))
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}))
vi.mock('@/lib/supabase/config', () => ({
  getMediaBucketName: vi.fn(() => 'media'),
}))

import {
  createContentItemAction,
  updateContentItemAction,
} from '@/app/actions/admin-content'

function contentForm(
  table: string,
  overrides: Record<string, string> = {},
) {
  const form = new FormData()
  const values = {
    table,
    title: 'CMS content',
    slug: 'cms-content',
    category: 'nature',
    product_type: 'fresh-ginseng',
    access_status: 'contact_required',
    description: 'A complete editorial description.',
    image_url: '/images/cms.webp',
    alt_text: 'CMS image description',
    source_url: '',
    source_credit: '',
    usage_permission: '',
    status: 'draft',
    display_order: '0',
    is_placeholder: 'on',
    ...overrides,
  }
  for (const [key, value] of Object.entries(values)) form.set(key, value)
  return form
}

function insertClient() {
  const insert = vi.fn().mockResolvedValue({ error: null })
  const from = vi.fn(() => ({ insert }))
  return { from, insert }
}

function updateClient() {
  const eq = vi.fn().mockResolvedValue({ error: null })
  const update = vi.fn((payload: unknown) => {
    void payload
    return { eq }
  })
  const from = vi.fn(() => ({ update }))
  return { from, update, eq }
}

describe('admin content creation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAdminAccess.mockResolvedValue({ state: 'authorized' })
    mocks.redirect.mockImplementation((url: string) => {
      throw new Error(`redirect:${url}`)
    })
  })

  it('persists exact journey enum values', async () => {
    const client = insertClient()
    mocks.createServerSupabaseClient.mockResolvedValue(client)

    await expect(createContentItemAction(contentForm('journeys', {
      category: 'ginseng',
      access_status: 'organized_only',
    }))).rejects.toThrow('notice=created')

    expect(client.from).toHaveBeenCalledWith('journeys')
    expect(client.insert).toHaveBeenCalledWith(expect.objectContaining({
      category: 'ginseng',
      access_status: 'organized_only',
      contact_required: true,
    }))
  })

  it.each([
    ['journeys', { category: 'Khám phá', access_status: 'open' }],
    ['journeys', { category: 'nature', access_status: 'sometimes' }],
    ['local_products', { category: 'food' }],
    ['ginseng_products', { product_type: 'powder' }],
  ])('rejects invalid enum input for %s', async (table, overrides) => {
    const client = insertClient()
    mocks.createServerSupabaseClient.mockResolvedValue(client)

    await expect(
      createContentItemAction(contentForm(table, overrides)),
    ).rejects.toThrow('error=invalid-content')
    expect(client.from).not.toHaveBeenCalled()
  })

  it('rejects forged usage-permission enum values', async () => {
    const client = insertClient()
    mocks.createServerSupabaseClient.mockResolvedValue(client)

    await expect(createContentItemAction(contentForm('stories', {
      usage_permission: 'downloaded-from-web',
    }))).rejects.toThrow('error=invalid-content')
    expect(client.from).not.toHaveBeenCalled()
  })

  it('stores exact local and ginseng product enum values', async () => {
    const localClient = insertClient()
    mocks.createServerSupabaseClient.mockResolvedValueOnce(localClient)
    await expect(createContentItemAction(contentForm('local_products', {
      category: 'nong-san',
    }))).rejects.toThrow('notice=created')
    expect(localClient.insert).toHaveBeenCalledWith(expect.objectContaining({
      category: 'nong-san',
    }))

    const ginsengClient = insertClient()
    mocks.createServerSupabaseClient.mockResolvedValueOnce(ginsengClient)
    await expect(createContentItemAction(contentForm('ginseng_products', {
      product_type: 'herbal-tea',
    }))).rejects.toThrow('notice=created')
    expect(ginsengClient.insert).toHaveBeenCalledWith(expect.objectContaining({
      product_type: 'herbal-tea',
    }))
  })

  it('stores travel-guide sections in the adapter object shape', async () => {
    const client = insertClient()
    mocks.createServerSupabaseClient.mockResolvedValue(client)

    await expect(createContentItemAction(contentForm('travel_guides', {
      title: 'Prepare for Trà Linh',
      description: 'Bring water and verify local access before departure.',
      category: 'planning',
    }))).rejects.toThrow('notice=created')

    expect(client.insert).toHaveBeenCalledWith(expect.objectContaining({
      sections: [{
        title: 'Prepare for Trà Linh',
        body: 'Bring water and verify local access before departure.',
      }],
    }))
  })
})

describe('admin field updates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAdminAccess.mockResolvedValue({ state: 'authorized' })
    mocks.redirect.mockImplementation((url: string) => {
      throw new Error(`redirect:${url}`)
    })
  })

  it('persists a single changed field even when title is not submitted', async () => {
    const client = updateClient()
    mocks.createServerSupabaseClient.mockResolvedValue(client)
    const data = new FormData()
    data.set('table', 'site_settings')
    data.set('id', '11111111-1111-4111-8111-111111111111')
    data.set('intent', 'save-draft')
    data.set('display_order', '0')
    data.set('contact_email', 'contact@example.com')

    await expect(updateContentItemAction(data)).rejects.toThrow('notice=draft-saved')

    expect(client.update).toHaveBeenCalledWith(expect.objectContaining({
      contact_email: 'contact@example.com',
    }))
    expect(client.update.mock.calls[0][0]).not.toHaveProperty('site_name')
    expect(client.eq).toHaveBeenCalledWith('id', '11111111-1111-4111-8111-111111111111')
  })

  it('rejects an invalid single-field patch before writing to Supabase', async () => {
    const client = updateClient()
    mocks.createServerSupabaseClient.mockResolvedValue(client)
    const data = new FormData()
    data.set('table', 'site_settings')
    data.set('id', '11111111-1111-4111-8111-111111111111')
    data.set('intent', 'save-draft')
    data.set('display_order', '0')
    data.set('contact_email', 'not-an-email')

    await expect(updateContentItemAction(data)).rejects.toThrow('error=invalid-update')

    expect(client.update).not.toHaveBeenCalled()
  })
})
