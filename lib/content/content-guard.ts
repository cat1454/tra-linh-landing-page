export interface PublishabilityOptions {
  isPlaceholder?: boolean
  placeholderLabel?: string | null
  sourceUrl?: string | null
  requireSourceForStatistics?: boolean
}

const forbiddenPatterns: RegExp[] = [
  /Trà\s+Lĩnh/giu,
  /(?:Thác\s+)?Bản\s+Giốc/giu,
  /Ngườm\s+Ngao/giu,
  /Tày\s*[–—-]\s*Nùng/giu,
  /Tày\s+Nùng/giu,
  /Cao\s+Bằng/giu,
  /chữa\s+(?:được|khỏi)/giu,
  /(?:cam\s+kết|bảo\s+đảm)[^.!?]{0,40}100%/giu,
  /mắt\s+sáng\s+hẳn\s+ra/giu,
  /29[.,]000\s+người/giu,
  /4[.,]800\s+hộ/giu,
  /(?:gần\s+)?4[.,]000\s+(?:héc\s*ta|ha)/giu,
  /5\s+t[ỷỉi]\s+đồng/giu,
  /<\/?[a-z][^>]*>/giu,
]

const visiblePlaceholderLabels = new Set(['Đang cập nhật', 'Nội dung đề xuất'])

function collectText(value: unknown, seen: WeakSet<object>): string[] {
  if (typeof value === 'string') return [value]
  if (value === null || value === undefined || typeof value !== 'object') return []
  if (seen.has(value)) return []

  seen.add(value)
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectText(item, seen))
  }

  return Object.values(value).flatMap((item) => collectText(item, seen))
}

export function findForbiddenContent(content: unknown): string[] {
  const text = collectText(content, new WeakSet()).join('\n')
  const findings: string[] = []

  for (const pattern of forbiddenPatterns) {
    pattern.lastIndex = 0
    for (const match of text.matchAll(pattern)) {
      const finding = match[0]
      if (!findings.includes(finding)) findings.push(finding)
    }
  }

  return findings
}

export function assertContentIsPublishable(
  content: unknown,
  options: PublishabilityOptions = {},
): void {
  const findings = findForbiddenContent(content)
  if (findings.length > 0) {
    throw new Error(`Nội dung chưa thể xuất bản: ${findings.join(', ')}`)
  }

  if (options.isPlaceholder) {
    const label = options.placeholderLabel?.trim() ?? ''
    if (!visiblePlaceholderLabels.has(label)) {
      throw new Error(
        'Nội dung tạm cần nhãn hiển thị “Đang cập nhật” hoặc “Nội dung đề xuất”.',
      )
    }
  }

  if (options.requireSourceForStatistics && !options.sourceUrl?.trim()) {
    const text = collectText(content, new WeakSet()).join(' ')
    if (/\b\d+(?:[.,]\d+)?\s*(?:%|ha|héc\s*ta|người|hộ|t[ỷỉi])\b/iu.test(text)) {
      throw new Error('Số liệu cần nguồn xác minh trước khi xuất bản.')
    }
  }
}
