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

  it('uses the configured public URL and ignores deployment preview URLs', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'not a valid host/%')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'tra-linh.vercel.app')
    vi.stubEnv('VERCEL_URL', 'preview.vercel.app')
    expect(getSiteUrl().toString()).toBe(
      'https://tra-linh-landing-page.vercel.app/',
    )

    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://canonical.example')
    expect(getSiteUrl().toString()).toBe('https://canonical.example/')
  })

  it('falls back to the production URL when no configured URL exists', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '')
    vi.stubEnv('VERCEL_URL', '')
    expect(getSiteUrl().toString()).toBe(
      'https://tra-linh-landing-page.vercel.app/',
    )
    expect(getAbsoluteUrl()).toBe(
      'https://tra-linh-landing-page.vercel.app/',
    )
  })

  it('does not emit a localhost URL into public SEO metadata', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
    expect(getSiteUrl().toString()).toBe(
      'https://tra-linh-landing-page.vercel.app/',
    )
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

  it('uses the brand logo fallback and defaults content image alt to title', () => {
    const withoutImage = createDetailMetadata({
      title: 'Cẩm nang',
      description: 'Thông tin chuẩn bị.',
      pathname: '/cam-nang',
    })
    expect(withoutImage.openGraph).toMatchObject({
      images: [
        {
          url: expect.stringContaining('/images/brand/logo_tra_linh.jpg'),
          width: 570,
          height: 350,
        },
      ],
    })
    expect(withoutImage.twitter).toMatchObject({
      images: [expect.stringContaining('/images/brand/logo_tra_linh.jpg')],
    })

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
