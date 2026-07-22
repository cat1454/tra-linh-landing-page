'use client'

import { useActionState, type ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'

import {
  INITIAL_PUBLIC_FORM_STATE,
  unavailableFormAction,
  type PublicFormAction,
} from '@/components/forms/types'

interface ContactFormProps
  extends Omit<ComponentPropsWithoutRef<'form'>, 'children' | 'action'> {
  readonly isEnabled: boolean
  readonly serverAction?: PublicFormAction
  readonly statusMessage?: string
}

export function ContactForm({
  isEnabled,
  statusMessage,
  className,
  serverAction,
  ...formProps
}: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(
    serverAction ?? unavailableFormAction,
    INITIAL_PUBLIC_FORM_STATE,
  )
  const availabilityMessage = state.message || (isEnabled
    ? statusMessage
    : 'Chưa kết nối CMS. Biểu mẫu sẽ được mở khi hệ thống lưu trữ được cấu hình.'
  )

  return (
    <form
      {...formProps}
      action={formAction}
      className={clsx('contact-form space-y-5', className)}
      aria-describedby={availabilityMessage ? 'contact-form-status' : undefined}
    >
      <div className="contact-form__heading">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#49672D]">
          Liên hệ địa phương
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#10251A]">Cùng chuẩn bị một hành trình có trách nhiệm</h2>
        <p className="mt-2 text-sm leading-6 text-[#10251A]/65">
          Gửi nhu cầu của bạn để được hướng dẫn khi kênh tiếp nhận chính thức hoạt động.
        </p>
      </div>

      <fieldset disabled={!isEnabled} className="contact-form__fields space-y-4 disabled:opacity-65">
        <legend className="sr-only">Thông tin liên hệ</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="contact-form__field grid gap-2 text-sm font-medium text-[#10251A]">
            Họ và tên
            <input
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              className="min-h-12 rounded-xl border border-[#10251A]/15 bg-white px-4 text-base font-normal outline-none transition focus:border-[#5E7F3B] focus:ring-2 focus:ring-[#5E7F3B]/20"
            />
            {state.fieldErrors?.name ? <span className="text-xs font-normal text-red-700">{state.fieldErrors.name[0]}</span> : null}
          </label>
          <label className="contact-form__field grid gap-2 text-sm font-medium text-[#10251A]">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              className="min-h-12 rounded-xl border border-[#10251A]/15 bg-white px-4 text-base font-normal outline-none transition focus:border-[#5E7F3B] focus:ring-2 focus:ring-[#5E7F3B]/20"
            />
            {state.fieldErrors?.email ? <span className="text-xs font-normal text-red-700">{state.fieldErrors.email[0]}</span> : null}
          </label>
        </div>

        <label className="contact-form__field grid gap-2 text-sm font-medium text-[#10251A]">
          Bạn quan tâm điều gì?
          <select
            name="interest"
            defaultValue="journey"
            className="min-h-12 rounded-xl border border-[#10251A]/15 bg-white px-4 text-base font-normal outline-none transition focus:border-[#5E7F3B] focus:ring-2 focus:ring-[#5E7F3B]/20"
          >
            <option value="journey">Hành trình khám phá</option>
            <option value="culture">Văn hóa Xơ Đăng</option>
            <option value="ginseng">Vùng sâm Ngọc Linh</option>
            <option value="other">Nội dung khác</option>
          </select>
        </label>

        <label className="contact-form__field grid gap-2 text-sm font-medium text-[#10251A]">
          Lời nhắn
          <textarea
            name="message"
            rows={4}
            required
            minLength={20}
            maxLength={1500}
            className="resize-y rounded-xl border border-[#10251A]/15 bg-white px-4 py-3 text-base font-normal outline-none transition focus:border-[#5E7F3B] focus:ring-2 focus:ring-[#5E7F3B]/20"
          />
          {state.fieldErrors?.message ? <span className="text-xs font-normal text-red-700">{state.fieldErrors.message[0]}</span> : null}
        </label>

        <label className="contact-form__honeypot absolute -left-[10000px] top-auto size-px overflow-hidden" aria-hidden="true">
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>

        <label className="contact-form__consent flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#10251A]/72">
          <input
            name="consent"
            type="checkbox"
            value="accepted"
            required
            className="mt-1 size-4 shrink-0 accent-[#5E7F3B]"
          />
          <span>Tôi đồng ý để thông tin này được dùng nhằm phản hồi yêu cầu liên hệ.</span>
          {state.fieldErrors?.consent ? <span className="sr-only">{state.fieldErrors.consent[0]}</span> : null}
        </label>

        <button
          type="submit"
          disabled={!isEnabled || isPending}
          className="contact-form__submit inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#49672D] px-6 font-semibold text-white transition-colors hover:bg-[#3E5926] disabled:cursor-not-allowed disabled:bg-[#10251A]/25 sm:w-auto"
        >
          {isPending ? 'Đang gửi…' : isEnabled ? 'Gửi yêu cầu' : 'Sắp mở'}
        </button>
      </fieldset>

      {availabilityMessage ? (
        <p
          id="contact-form-status"
          role="status"
          aria-live="polite"
          className={clsx(
            'contact-form__status text-sm leading-6',
            state.status === 'error' || state.status === 'rate_limited'
              ? 'text-red-700'
              : state.status === 'success'
                ? 'text-[#49672D]'
                : 'text-[#10251A]/65',
          )}
        >
          {availabilityMessage}
        </p>
      ) : null}
    </form>
  )
}

export default ContactForm
