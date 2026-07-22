import { describe, expect, it } from 'vitest'

import { fallbackContent } from '@/lib/content/fallback-content'

const publicRecords = [
  ...fallbackContent.journeys,
  ...fallbackContent.guides,
  ...fallbackContent.localSpecialties,
]

describe('verified fallback content', () => {
  it('publishes no placeholder records or placeholder copy', () => {
    expect(publicRecords.every((record) => !record.isPlaceholder)).toBe(true)
    expect(JSON.stringify(fallbackContent)).not.toMatch(
      /Nội dung đề xuất|Đang cập nhật|Sắp mở|sẽ được xác nhận/i,
    )
  })

  it('keeps unverified commercial products out of the public fallback', () => {
    expect(fallbackContent.products).toEqual([])
  })

  it('records verification and a source for every public editorial record', () => {
    for (const record of publicRecords) {
      expect(record.sourceUrl).toMatch(/^https?:\/\//)
      if ('verificationStatus' in record) {
        expect(record.verificationStatus).toBe('verified')
        expect(record.verifiedAt).toBeTruthy()
      }
    }
  })
})
