import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ pending: false }))

vi.mock('react-dom', () => ({
  useFormStatus: () => ({ pending: mocks.pending }),
}))

import { AdminLoginSubmitButton } from '@/components/admin/AdminLoginSubmitButton'

describe('AdminLoginSubmitButton', () => {
  beforeEach(() => {
    mocks.pending = false
  })

  it('prevents repeated magic-link requests while the action is pending', () => {
    mocks.pending = true
    render(<AdminLoginSubmitButton />)

    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveTextContent('Đang gửi liên kết…')
  })

  it('allows the first request when idle', () => {
    render(<AdminLoginSubmitButton />)

    expect(screen.getByRole('button')).toBeEnabled()
    expect(screen.getByRole('button')).toHaveTextContent('Gửi liên kết đăng nhập')
  })
})
