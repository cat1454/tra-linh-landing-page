import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Header } from '@/components/layout/Header'

describe('Header', () => {
  it('opens and closes an accessible mobile navigation', async () => {
    const user = userEvent.setup()
    render(<Header />)

    const trigger = screen.getByRole('button', { name: /mở menu/i })
    await user.click(trigger)

    expect(screen.getByRole('dialog', { name: /điều hướng/i })).toBeVisible()
    expect(screen.getByRole('link', { name: /vùng sâm/i })).toBeVisible()

    await user.click(screen.getByRole('button', { name: /đóng menu/i }))
    expect(screen.queryByRole('dialog', { name: /điều hướng/i })).toBeNull()
  })
})
