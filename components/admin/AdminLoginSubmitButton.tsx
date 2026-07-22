'use client'

import { useFormStatus } from 'react-dom'

export function AdminLoginSubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="min-h-12 w-full rounded-full bg-[#10251a] px-5 font-semibold text-white transition hover:bg-[#294431] disabled:cursor-wait disabled:bg-[#10251a]/60"
    >
      {pending ? 'Đang gửi liên kết…' : 'Gửi liên kết đăng nhập'}
    </button>
  )
}
