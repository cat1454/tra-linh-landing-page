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
      phone: '0900000000',
      interest: 'journey',
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
      phone: 'abc',
      interest: 'khong-hop-le',
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

  it('accepts checkbox string values and trims optional fields', () => {
    const result = contactSubmissionSchema.parse({
      name: '  Nguyễn An  ',
      email: ' AN@EXAMPLE.COM ',
      phone: ' 0900000000 ',
      interest: 'partnership',
      message: '  Tôi muốn biết thêm thông tin về hành trình an toàn.  ',
      consent: 'on',
    })

    expect(result).toMatchObject({
      name: 'Nguyễn An',
      email: 'an@example.com',
      phone: '0900000000',
      interest: 'partnership',
      consent: true,
      website: '',
    })
  })

  it('accepts the serialized true consent value', () => {
    expect(
      newsletterSubscriptionSchema.safeParse({
        email: 'ban@example.com',
        consent: 'true',
        website: '',
      }).success,
    ).toBe(true)
  })

  it('enforces upper bounds for public form fields', () => {
    const result = contactSubmissionSchema.safeParse({
      name: 'A'.repeat(81),
      email: `${'a'.repeat(245)}@example.com`,
      phone: '0'.repeat(31),
      interest: 'other',
      message: 'M'.repeat(2_001),
      consent: true,
      website: '',
    })

    expect(result.success).toBe(false)
  })

  it('requires a valid Vietnamese phone number and a supported interest', () => {
    const base = {
      name: 'Nguyễn An',
      email: 'an@example.com',
      message: 'Tôi muốn tìm hiểu thêm thông tin về Trà Linh.',
      consent: true,
      website: '',
    }

    expect(contactSubmissionSchema.safeParse({
      ...base,
      phone: '',
      interest: 'journey',
    }).success).toBe(false)
    expect(contactSubmissionSchema.safeParse({
      ...base,
      phone: '0900000000',
      interest: 'unknown',
    }).success).toBe(false)
  })
})
