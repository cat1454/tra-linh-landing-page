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

  it('accepts both explicit placeholder labels', () => {
    expect(() =>
      assertContentIsPublishable('Nội dung đang hoàn thiện.', {
        isPlaceholder: true,
        placeholderLabel: 'Đang cập nhật',
      }),
    ).not.toThrow()
    expect(() =>
      assertContentIsPublishable('Hành trình đang được đề xuất.', {
        isPlaceholder: true,
        placeholderLabel: 'Nội dung đề xuất',
      }),
    ).not.toThrow()
  })

  it('requires a source for statistics when requested', () => {
    expect(() =>
      assertContentIsPublishable('Khu vực có 25 ha rừng.', {
        requireSourceForStatistics: true,
      }),
    ).toThrow(/nguồn xác minh/i)

    expect(() =>
      assertContentIsPublishable('Khu vực có 25 ha rừng.', {
        requireSourceForStatistics: true,
        sourceUrl: ' https://tralinh.danang.gov.vn/ ',
      }),
    ).not.toThrow()
  })

  it('walks arrays and objects safely, including circular objects', () => {
    const circular: Record<string, unknown> = { safe: 'Trà Linh' }
    circular.self = circular

    expect(findForbiddenContent([null, 10, circular])).toEqual([])
    expect(
      findForbiddenContent({ first: 'Cao Bằng', second: 'Cao Bằng' }),
    ).toEqual(['Cao Bằng'])
  })

  it('detects raw HTML and unsupported legacy figures', () => {
    const findings = findForbiddenContent(
      '<strong>29.000 người</strong>, gần 4.000 héc ta và 5 tỷ đồng.',
    )

    expect(findings).toEqual(
      expect.arrayContaining([
        '<strong>',
        '</strong>',
        '29.000 người',
        'gần 4.000 héc ta',
        '5 tỷ đồng',
      ]),
    )
  })
})
