import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ContactForm } from '@/components/forms/ContactForm'

describe('ContactForm', () => {
  it('explains why submission is unavailable without Supabase', () => {
    render(<ContactForm isEnabled={false} />)

    expect(screen.getByRole('button', { name: /sắp mở/i })).toBeDisabled()
    expect(screen.getByText(/chưa kết nối cms/i)).toBeVisible()
  })

  it('enables the form when persistence is configured', () => {
    render(<ContactForm isEnabled />)

    expect(screen.getByRole('button', { name: /gửi yêu cầu/i })).toBeEnabled()
    expect(screen.getByLabelText(/đồng ý/i)).toBeRequired()
  })
})
