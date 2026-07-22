import { describe, expect, it } from 'vitest'

import {
  contactSubmissionSchema,
  newsletterSubscriptionSchema,
} from '@/lib/validation/forms'

describe('public form validation', () => {
  it('accepts a concise contact request with explicit consent', () => {
    const result = contactSubmissionSchema.safeParse({
      name: 'Nguyễn An',
      email: 'an@example.com',
      message: 'Tôi muốn tìm hiểu hành trình có hướng dẫn tại Trà Linh.',
      consent: true,
      website: '',
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid email, missing consent and honeypot input', () => {
    const result = contactSubmissionSchema.safeParse({
      name: 'A',
      email: 'khong-hop-le',
      message: 'ngắn',
      consent: false,
      website: 'spam.example',
    })

    expect(result.success).toBe(false)
  })

  it('normalizes newsletter email', () => {
    const result = newsletterSubscriptionSchema.parse({
      email: '  BAN@EXAMPLE.COM ',
      consent: true,
      website: '',
    })

    expect(result.email).toBe('ban@example.com')
  })
})
