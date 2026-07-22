'use client'

import { useActionState, type ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'

import {
  INITIAL_PUBLIC_FORM_STATE,
  unavailableFormAction,
  type PublicFormAction,
} from '@/components/forms/types'

interface NewsletterFormProps
  extends Omit<ComponentPropsWithoutRef<'form'>, 'children' | 'action'> {
  readonly isEnabled: boolean
  readonly serverAction?: PublicFormAction
  readonly tone?: 'light' | 'dark'
  readonly statusMessage?: string
}

export function NewsletterForm({
  isEnabled,
  tone = 'light',
  statusMessage,
  className,
  serverAction,
  ...formProps
}: NewsletterFormProps) {
  const [state, formAction, isPending] = useActionState(
    serverAction ?? unavailableFormAction,
    INITIAL_PUBLIC_FORM_STATE,
  )
  const isDark = tone === 'dark'
  const availabilityMessage = state.message || (isEnabled
    ? statusMessage
    : 'Kênh nhận bản tin đang được hoàn thiện.'
  )

  return (
    <form
      {...formProps}
      action={formAction}
      className={clsx('newsletter-form', `newsletter-form--${tone}`, className)}
      aria-describedby={availabilityMessage ? 'newsletter-form-status' : undefined}
    >
      <p className={clsx('text-xs font-semibold uppercase tracking-[0.16em]', isDark ? 'text-[#D5A84E]' : 'text-[#49672D]')}>
        Thư từ đại ngàn
      </p>
      <h2 className={clsx('mt-2 text-xl font-semibold', isDark ? 'text-[#EEF1E9]' : 'text-[#10251A]')}>
        Nhận câu chuyện mới từ Trà Linh
      </h2>
      <p className={clsx('mt-2 text-sm leading-6', isDark ? 'text-[#EEF1E9]/65' : 'text-[#10251A]/65')}>
        Chỉ những cập nhật đã được biên tập, không gửi thư quảng cáo dồn dập.
      </p>

      <fieldset disabled={!isEnabled} className="newsletter-form__fields mt-5 disabled:opacity-60">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="newsletter-email">Email nhận bản tin</label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="email@vidu.vn"
            className={clsx(
              'min-h-12 min-w-0 flex-1 rounded-full border px-4 text-base outline-none transition focus:ring-2',
              isDark
                ? 'border-white/20 bg-white/8 text-white placeholder:text-white/40 focus:border-[#D5A84E] focus:ring-[#D5A84E]/20'
                : 'border-[#10251A]/15 bg-white text-[#10251A] focus:border-[#5E7F3B] focus:ring-[#5E7F3B]/20',
            )}
          />
          <button
            type="submit"
            disabled={!isEnabled || isPending}
            className="newsletter-form__submit inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[#D5A84E] px-5 font-semibold text-[#10251A] transition-colors hover:bg-[#E2BC6A] disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/55"
          >
            {isPending ? 'Đang gửi…' : isEnabled ? 'Đăng ký' : 'Sắp mở'}
          </button>
        </div>
        <label className={clsx('mt-3 flex items-start gap-2 text-xs leading-5', isDark ? 'text-[#EEF1E9]/60' : 'text-[#10251A]/60')}>
          <input name="consent" type="checkbox" value="accepted" required className="mt-0.5 accent-[#D5A84E]" />
          <span>Tôi đồng ý nhận bản tin và có thể hủy đăng ký bất cứ lúc nào.</span>
        </label>
        <label className="newsletter-form__honeypot absolute -left-[10000px] top-auto size-px overflow-hidden" aria-hidden="true">
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </fieldset>

      {state.fieldErrors?.email ? (
        <p className="mt-2 text-xs text-red-300">{state.fieldErrors.email[0]}</p>
      ) : null}

      {availabilityMessage ? (
        <p
          id="newsletter-form-status"
          role="status"
          aria-live="polite"
          className={clsx(
            'mt-3 text-xs leading-5',
            state.status === 'error' || state.status === 'rate_limited'
              ? isDark ? 'text-red-300' : 'text-red-700'
              : state.status === 'success'
                ? isDark ? 'text-[#9BBE62]' : 'text-[#49672D]'
                : isDark ? 'text-[#EEF1E9]/55' : 'text-[#10251A]/55',
          )}
        >
          {availabilityMessage}
        </p>
      ) : null}
    </form>
  )
}

export default NewsletterForm
