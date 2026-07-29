import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ContactForm } from '@/components/forms/ContactForm'

describe('ContactForm', () => {
  it('shows a useful public fallback without a dead form', () => {
    render(<ContactForm isEnabled={false} />)

    expect(screen.queryByRole('button', { name: /sắp mở/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /cổng thông tin xã trà linh/i })).toHaveAttribute(
      'href',
      'https://tralinh.danang.gov.vn/',
    )
  })

  it('enables the form when persistence is configured', () => {
    render(<ContactForm isEnabled />)

    expect(screen.getByRole('button', { name: /gửi yêu cầu/i })).toBeEnabled()
    expect(screen.getByLabelText(/số điện thoại/i)).toBeRequired()
    expect(screen.getByLabelText(/bạn quan tâm điều gì/i)).toBeRequired()
    expect(screen.getByRole('option', { name: /kết nối hợp tác/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/đồng ý/i)).toBeRequired()
  })

  it('connects server-side errors to their fields and focuses the first invalid field', async () => {
    const serverAction = vi.fn().mockResolvedValue({
      status: 'error' as const,
      message: 'Vui lòng kiểm tra lại các trường được đánh dấu.',
      fieldErrors: {
        email: ['Email không hợp lệ.'],
        phone: ['Số điện thoại không hợp lệ.'],
      },
    })

    render(<ContactForm isEnabled serverAction={serverAction} />)
    fireEvent.submit(screen.getByRole('form', { name: /liên hệ trà linh/i }))

    const email = await screen.findByLabelText(/email/i)
    const phone = screen.getByLabelText(/số điện thoại/i)

    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(email).toHaveAccessibleDescription('Email không hợp lệ.')
    expect(phone).toHaveAttribute('aria-invalid', 'true')
    await waitFor(() => expect(email).toHaveFocus())
    expect(screen.getByRole('alert')).toHaveTextContent(/vui lòng kiểm tra/i)
  })

  it('clears submitted values and announces a successful request', async () => {
    const user = userEvent.setup()
    const serverAction = vi.fn().mockResolvedValue({
      status: 'success' as const,
      message: 'Cảm ơn bạn. Yêu cầu đã được ghi nhận.',
    })

    render(<ContactForm isEnabled serverAction={serverAction} />)

    await user.type(screen.getByLabelText(/họ và tên/i), 'Nguyễn An')
    await user.type(screen.getByLabelText(/số điện thoại/i), '0900000000')
    await user.type(screen.getByLabelText(/email/i), 'an@example.com')
    await user.type(
      screen.getByLabelText(/lời nhắn/i),
      'Tôi muốn tìm hiểu hành trình khám phá Trà Linh.',
    )
    await user.click(screen.getByLabelText(/đồng ý/i))
    await user.click(screen.getByRole('button', { name: /gửi yêu cầu/i }))

    await waitFor(() => expect(serverAction).toHaveBeenCalledOnce())
    expect(await screen.findByRole('status')).toHaveTextContent(/đã được ghi nhận/i)
    await waitFor(() => expect(screen.getByLabelText(/họ và tên/i)).toHaveValue(''))
    expect(screen.getByLabelText(/đồng ý/i)).not.toBeChecked()
  })
})
