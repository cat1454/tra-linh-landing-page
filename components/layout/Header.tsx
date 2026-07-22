'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, Menu } from 'lucide-react'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { PRIMARY_NAVIGATION } from '@/components/layout/navigation'

const MobileMenu = dynamic(
  () => import('@/components/layout/MobileMenu').then((module) => module.MobileMenu),
  { ssr: false },
)

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const hasSolidBackground = (pathname !== null && pathname !== '/') || isScrolled

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = useCallback(() => setIsMenuOpen(false), [])

  return (
    <>
      <header
        className={clsx(
          'site-header fixed inset-x-0 top-0 z-50 border-b text-[#EEF1E9] transition-[background-color,border-color,padding] duration-300',
          hasSolidBackground
            ? 'site-header--scrolled border-white/10 bg-[#10251A]/90 py-2 shadow-lg shadow-black/5 backdrop-blur-xl'
            : 'site-header--transparent border-transparent bg-transparent py-4',
        )}
      >
        <div className="site-header__inner mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6 px-5 md:px-8 xl:px-12">
          <Link
            href="/"
            aria-label="Trà Linh — trang chủ"
            className="site-header__brand inline-flex min-h-11 shrink-0 flex-col justify-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5A84E]"
          >
            <span className="text-base font-semibold tracking-[0.2em] sm:text-lg">TRÀ LINH</span>
            <span className="mt-0.5 hidden text-[0.66rem] tracking-wide text-[#EEF1E9]/70 sm:block">
              Đại ngàn Ngọc Linh
            </span>
          </Link>

          <nav className="site-header__desktop-nav hidden lg:block" aria-label="Điều hướng chính">
            <ul className="flex items-center gap-5 xl:gap-7">
              {PRIMARY_NAVIGATION.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="site-header__nav-link relative inline-flex min-h-11 items-center text-sm text-[#EEF1E9]/85 transition-colors after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-[#D5A84E] after:transition-transform hover:text-white hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-header__actions flex items-center gap-2">
            <Button
              href="/#hanh-trinh"
              variant="light"
              size="sm"
              className="site-header__cta hidden xl:inline-flex"
            >
              Khám phá Trà Linh
              <ArrowRight aria-hidden="true" size={17} />
            </Button>
            <button
              type="button"
              aria-label="Mở menu"
              aria-haspopup="dialog"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMenuOpen(true)}
              className="site-header__menu-trigger inline-flex size-12 items-center justify-center rounded-full border border-white/25 bg-[#10251A]/20 backdrop-blur-sm transition-colors hover:border-[#D5A84E] hover:text-[#D5A84E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5A84E] lg:hidden"
            >
              <Menu aria-hidden="true" size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen ? <MobileMenu isOpen onClose={closeMenu} /> : null}
    </>
  )
}

export default Header
