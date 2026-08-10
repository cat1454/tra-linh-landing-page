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
    expect(inner).toHaveClass('px-6', 'sm:px-8')
    expect(cta.parentElement).toHaveClass('hidden', 'md:inline-flex')
    expect(cta).toHaveClass('whitespace-nowrap')
    expect(trigger).toHaveClass('size-10', 'rounded-xl')
    expect(screen.queryByRole('link', { name: /switch to english/i })).not.toBeInTheDocument()
  })

  it('keeps a Vietnamese return link only on the direct English route', () => {
    render(<Header locale="en" />)

    expect(screen.getByRole('link', { name: /chuyển sang tiếng việt/i })).toHaveTextContent('VI')
  })

  it('shares the premium hero grid and keeps the desktop CTA secondary', () => {
    render(<Header />)

    const inner = document.querySelector('.site-header__inner')
    const cta = screen.getByRole('link', { name: /khám phá trà linh/i })

    expect(inner).toHaveClass(
      'max-w-[1680px]',
      'px-6',
      'sm:px-8',
      'lg:px-14',
      'xl:px-20',
    )
    expect(cta).toHaveClass(
      'border-[#DDB149]/70',
      'bg-transparent',
      'text-[#E6BD58]',
      'hover:bg-[#DDB149]',
    )
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
