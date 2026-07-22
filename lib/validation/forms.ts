import { z } from 'zod'

const consentSchema = z.preprocess(
  (value) => (value === 'true' || value === 'on' ? true : value),
  z.literal(true, { error: 'Bạn cần đồng ý trước khi gửi.' }),
)

const honeypotSchema = z
  .string()
  .trim()
  .max(0, 'Yêu cầu không hợp lệ.')
  .optional()
  .default('')

const normalizedEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Email không hợp lệ.')
  .max(254, 'Email quá dài.')

const vietnamesePhoneSchema = z
  .string()
  .trim()
  .min(1, 'Vui lòng nhập số điện thoại.')
  .max(30, 'Số điện thoại quá dài.')
  .transform((value) => value.replace(/[.\s-]/g, ''))
  .refine(
    (value) => /^(?:0\d{9}|\+84\d{9})$/.test(value),
    'Số điện thoại không hợp lệ.',
  )

export const contactInterestSchema = z.enum(
  ['journey', 'culture', 'ginseng', 'partnership', 'other'],
  { error: 'Vui lòng chọn nội dung quan tâm.' },
)

export const contactSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Vui lòng nhập họ tên.')
    .max(80, 'Họ tên quá dài.'),
  email: normalizedEmailSchema,
  phone: vietnamesePhoneSchema,
  interest: contactInterestSchema,
  message: z
    .string()
    .trim()
    .min(20, 'Nội dung cần ít nhất 20 ký tự.')
    .max(2_000, 'Nội dung quá dài.'),
  consent: consentSchema,
  website: honeypotSchema,
})

export const newsletterSubscriptionSchema = z.object({
  email: normalizedEmailSchema,
  consent: consentSchema,
  website: honeypotSchema,
})

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>
export type NewsletterSubscription = z.infer<
  typeof newsletterSubscriptionSchema
>
