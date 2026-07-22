import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createArticleSchema,
  createBreadcrumbSchema,
  createDetailMetadata,
  getAbsoluteUrl,
  getSiteUrl,
  JsonLd,
} from '@/components/detail/seo'

describe('SEO and site URL helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('normalizes the configured public site URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', ' example.com/path?query=yes#section ')

    expect(getSiteUrl().toString()).toBe('https://example.com/')
    expect(getAbsoluteUrl('/cam-nang/duong-den-tra-linh')).toBe(
      'https://example.com/cam-nang/duong-den-tra-linh',
    )
  })

  it('uses Vercel URL fallbacks in priority order', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'not a valid host/%')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'tra-linh.vercel.app')
    vi.stubEnv('VERCEL_URL', 'preview.vercel.app')
    expect(getSiteUrl().toString()).toBe('https://tra-linh.vercel.app/')

    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '')
    expect(getSiteUrl().toString()).toBe('https://preview.vercel.app/')
  })

  it('falls back to localhost when no valid URL exists', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '')
    vi.stubEnv('VERCEL_URL', '')
    expect(getSiteUrl().toString()).toBe('http://localhost:3000/')
    expect(getAbsoluteUrl()).toBe('http://localhost:3000/')
  })

  it('creates article metadata with an absolute image and custom alt text', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://tralinh.example')
    const metadata = createDetailMetadata({
      title: 'Đi dưới tán rừng',
      description: 'Hành trình có tổ chức tại Trà Linh.',
      pathname: '/hanh-trinh/trekking-duoi-tan-rung',
      imageUrl: '/images/forest.webp',
      imageAlt: 'Lối đi dưới tán rừng',
    })

    expect(metadata.alternates?.canonical).toBe(
      'https://tralinh.example/hanh-trinh/trekking-duoi-tan-rung',
    )
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      images: [
        {
          url: 'https://tralinh.example/images/forest.webp',
          alt: 'Lối đi dưới tán rừng',
        },
      ],
    })
    expect(metadata.twitter).toMatchObject({
      images: ['https://tralinh.example/images/forest.webp'],
    })
  })

  it('omits optional metadata images and defaults image alt to title', () => {
    const withoutImage = createDetailMetadata({
      title: 'Cẩm nang',
      description: 'Thông tin chuẩn bị.',
      pathname: '/cam-nang',
    })
    expect(withoutImage.openGraph).toMatchObject({ images: undefined })
    expect(withoutImage.twitter).toMatchObject({ images: undefined })

    const withDefaultAlt = createDetailMetadata({
      title: 'Cẩm nang',
      description: 'Thông tin chuẩn bị.',
      pathname: '/cam-nang',
      imageUrl: '/guide.jpg',
    })
    expect(withDefaultAlt.openGraph).toMatchObject({
      images: [{ alt: 'Cẩm nang' }],
    })
  })

  it('creates ordered breadcrumb data', () => {
    const schema = createBreadcrumbSchema([
      { name: 'Trang chủ', pathname: '/' },
      { name: 'Cẩm nang', pathname: '/cam-nang/duong-den-tra-linh' },
    ])

    expect(schema.itemListElement).toEqual([
      expect.objectContaining({ position: 1, name: 'Trang chủ' }),
      expect.objectContaining({ position: 2, name: 'Cẩm nang' }),
    ])
  })

  it('creates article schema with and without optional fields', () => {
    const complete = createArticleSchema({
      title: 'Đường đến Trà Linh',
      description: 'Cẩm nang di chuyển.',
      pathname: '/cam-nang/duong-den-tra-linh',
      imageUrl: '/route.jpg',
      datePublished: '2026-07-20',
      dateModified: '2026-07-22',
    })
    expect(complete).toMatchObject({
      '@type': 'Article',
      image: expect.stringContaining('/route.jpg'),
      datePublished: '2026-07-20',
      dateModified: '2026-07-22',
      inLanguage: 'vi-VN',
    })

    const minimal = createArticleSchema({
      title: 'Lưu ý',
      description: 'Đi rừng an toàn.',
      pathname: '/cam-nang/luu-y',
    })
    expect(minimal).not.toHaveProperty('image')
    expect(minimal).not.toHaveProperty('datePublished')
    expect(minimal).not.toHaveProperty('dateModified')
  })

  it('escapes markup in JSON-LD script content', () => {
    const { container } = render(<JsonLd data={{ name: '<Trà Linh>' }} />)
    expect(container.querySelector('script')?.textContent).toContain(
      '\\u003cTrà Linh>',
    )
  })
})
