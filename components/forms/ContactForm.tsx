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
  readonly fallbackContactUrl?: string
}

export function ContactForm({
  isEnabled,
  statusMessage,
  className,
  serverAction,
  fallbackContactUrl = 'https://tralinh.danang.gov.vn/',
  ...formProps
}: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(
    serverAction ?? unavailableFormAction,
    INITIAL_PUBLIC_FORM_STATE,
  )
  const availabilityMessage = state.message || statusMessage

  if (!isEnabled) {
    return (
      <section className={clsx('contact-form rounded-2xl bg-white/60 p-5 sm:p-7', className)}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#49672D]">
          Thông tin công khai
        </p>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-[#10251A]">
          Xác nhận trước khi bắt đầu hành trình
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#10251A]/70">
          Website chưa tiếp nhận thông tin cá nhân. Hãy xem thông báo và đầu mối
          hiện hành trên cổng thông tin của địa phương trước khi di chuyển.
        </p>
        <a
          href={fallbackContactUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-[#49672D] px-6 font-semibold text-white transition-colors hover:bg-[#3E5926] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#10251A]"
        >
          Cổng thông tin xã Trà Linh
        </a>
      </section>
    )
  }

  return (
    <form
      {...formProps}
      action={formAction}
      className={clsx('contact-form space-y-5', className)}
      aria-describedby={availabilityMessage ? 'contact-form-status' : undefined}
    >
      <div className="contact-form__heading">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#49672D]">
          Kết nối về Trà Linh
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#10251A]">Cùng chuẩn bị một hành trình có trách nhiệm</h2>
        <p className="mt-2 text-sm leading-6 text-[#10251A]/65">
          Gửi nhu cầu để bộ phận phụ trách website phản hồi hoặc hướng dẫn đến đầu mối phù hợp.
        </p>
      </div>

      <fieldset className="contact-form__fields space-y-4">
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
              maxLength={80}
              className="min-h-12 rounded-xl border border-[#10251A]/15 bg-white px-4 text-base font-normal outline-none transition focus:border-[#5E7F3B] focus:ring-2 focus:ring-[#5E7F3B]/20"
            />
            {state.fieldErrors?.name ? <span className="text-xs font-normal text-red-700">{state.fieldErrors.name[0]}</span> : null}
          </label>
          <label className="contact-form__field grid gap-2 text-sm font-medium text-[#10251A]">
            Số điện thoại
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              maxLength={30}
              className="min-h-12 rounded-xl border border-[#10251A]/15 bg-white px-4 text-base font-normal outline-none transition focus:border-[#5E7F3B] focus:ring-2 focus:ring-[#5E7F3B]/20"
            />
            {state.fieldErrors?.phone ? <span className="text-xs font-normal text-red-700">{state.fieldErrors.phone[0]}</span> : null}
          </label>
        </div>

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

        <label className="contact-form__field grid gap-2 text-sm font-medium text-[#10251A]">
          Bạn quan tâm điều gì?
          <select
            name="interest"
            defaultValue="journey"
            required
            className="min-h-12 rounded-xl border border-[#10251A]/15 bg-white px-4 text-base font-normal outline-none transition focus:border-[#5E7F3B] focus:ring-2 focus:ring-[#5E7F3B]/20"
          >
            <option value="journey">Hành trình khám phá</option>
            <option value="culture">Văn hóa Xơ Đăng</option>
            <option value="ginseng">Vùng sâm Ngọc Linh</option>
            <option value="partnership">Kết nối hợp tác</option>
            <option value="other">Nội dung khác</option>
          </select>
          {state.fieldErrors?.interest ? <span className="text-xs font-normal text-red-700">{state.fieldErrors.interest[0]}</span> : null}
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
          <span>
            Tôi đồng ý để thông tin này được dùng nhằm phản hồi yêu cầu liên hệ và đã đọc{' '}
            <a href="/chinh-sach-quyen-rieng" className="font-semibold underline underline-offset-4">
              chính sách quyền riêng tư
            </a>.
          </span>
          {state.fieldErrors?.consent ? <span className="sr-only">{state.fieldErrors.consent[0]}</span> : null}
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="contact-form__submit inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#49672D] px-6 font-semibold text-white transition-colors hover:bg-[#3E5926] disabled:cursor-not-allowed disabled:bg-[#10251A]/25 sm:w-auto"
        >
          {isPending ? 'Đang gửi…' : 'Gửi yêu cầu'}
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
