import { describe, expect, it } from 'vitest'

import {
  assertContentIsPublishable,
  findForbiddenContent,
} from '@/lib/content/content-guard'

describe('content guard', () => {
  it('rejects locations and cultural references outside Trà Linh', () => {
    const findings = findForbiddenContent(
      'Khám phá Trà Lĩnh, Thác Bản Giốc và văn hóa Tày – Nùng.',
    )

    expect(findings).toEqual(
      expect.arrayContaining(['Trà Lĩnh', 'Thác Bản Giốc', 'Tày – Nùng']),
    )
  })

  it('rejects unsupported medical claims', () => {
    expect(findForbiddenContent('Sản phẩm này chữa được nhiều bệnh.')).toContain(
      'chữa được',
    )
  })

  it('accepts verified place copy with no invented statistics', () => {
    expect(() =>
      assertContentIsPublishable(
        'Trà Linh là vùng núi cao gắn với đại ngàn Ngọc Linh và cộng đồng Xơ Đăng.',
      ),
    ).not.toThrow()
  })

  it('requires a visible label for placeholder records', () => {
    expect(() =>
      assertContentIsPublishable('Sâm lát', {
        isPlaceholder: true,
        placeholderLabel: '',
      }),
    ).toThrow(/nhãn/i)
  })
})
