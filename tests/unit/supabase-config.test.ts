import { afterEach, describe, expect, it, vi } from 'vitest'

import { getPublicSupabaseConfig } from '@/lib/supabase/config'

describe('Supabase public configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses the modern publishable key in production', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_modern')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

    expect(getPublicSupabaseConfig()).toEqual({
      url: 'https://example.supabase.co',
      anonKey: 'sb_publishable_modern',
    })
  })

  it('keeps the legacy anon key as a compatibility fallback', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'legacy-anon-key')

    expect(getPublicSupabaseConfig()).toEqual({
      url: 'https://example.supabase.co',
      anonKey: 'legacy-anon-key',
    })
  })
})
