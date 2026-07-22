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

export const contactSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Vui lòng nhập họ tên.')
    .max(80, 'Họ tên quá dài.'),
  email: normalizedEmailSchema,
  phone: z.string().trim().max(30, 'Số điện thoại quá dài.').optional(),
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
