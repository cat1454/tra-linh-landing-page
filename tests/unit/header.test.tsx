import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Header } from '@/components/layout/Header'

describe('Header', () => {
  it('keeps the mobile navbar compact and defers its CTA to tablet', () => {
    render(<Header />)

    const header = document.querySelector('header')
    const inner = document.querySelector('.site-header__inner')
    const cta = screen.getByRole('link', { name: /khám phá trà linh/i })
    const trigger = screen.getByRole('button', { name: /mở menu/i })

    expect(header).toHaveClass('bg-[#10251A]/80')
    expect(inner).toHaveClass('px-4', 'sm:px-6')
    expect(cta.parentElement).toHaveClass('hidden', 'md:inline-flex')
    expect(cta).toHaveClass('whitespace-nowrap')
    expect(trigger).toHaveClass('size-10', 'rounded-xl')
  })

  it('opens and closes an accessible mobile navigation', async () => {
    const user = userEvent.setup()
    render(<Header />)

    const trigger = screen.getByRole('button', { name: /mở menu/i })
    await user.click(trigger)

    expect(await screen.findByRole('dialog', { name: /điều hướng/i })).toBeVisible()
    expect(screen.getByRole('link', { name: /vùng sâm/i })).toBeVisible()

    await user.click(screen.getByRole('button', { name: /đóng menu/i }))
    expect(screen.queryByRole('dialog', { name: /điều hướng/i })).toBeNull()
  })
})
