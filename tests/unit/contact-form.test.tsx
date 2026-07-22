import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

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
})
