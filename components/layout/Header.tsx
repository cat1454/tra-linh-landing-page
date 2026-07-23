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

interface HeaderProps {
  title?: string
  subtitle?: string
  navigation?: ReadonlyArray<{ label: string; href: string }>
}

export function Header({
  title = 'TRÀ LINH',
  subtitle = 'Đại ngàn Ngọc Linh',
  navigation = PRIMARY_NAVIGATION,
}: HeaderProps = {}) {
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
            : 'site-header--transparent border-white/10 bg-[#10251A]/80 py-2.5 shadow-lg shadow-black/5 backdrop-blur-xl lg:border-transparent lg:bg-transparent lg:py-4 lg:shadow-none lg:backdrop-blur-none',
        )}
      >
        <div className="site-header__inner mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-6 md:gap-6 md:px-8 xl:px-12">
          <Link
            href="/"
            aria-label="Trà Linh — trang chủ"
            className="site-header__brand inline-flex min-h-10 shrink-0 flex-col justify-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5A84E]"
          >
            <span className="text-sm font-semibold tracking-[0.22em] sm:text-base lg:text-lg">{title}</span>
            <span className="mt-0.5 hidden text-[0.66rem] tracking-wide text-[#EEF1E9]/70 lg:block">
              {subtitle}
            </span>
          </Link>

          <nav className="site-header__desktop-nav hidden lg:block" aria-label="Điều hướng chính">
            <ul className="flex items-center gap-5 xl:gap-7">
              {navigation.map((item) => (
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
              className="site-header__cta hidden whitespace-nowrap md:inline-flex"
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
              className="site-header__menu-trigger inline-flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 transition-colors hover:border-[#D5A84E]/70 hover:bg-white/10 hover:text-[#D5A84E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5A84E] lg:hidden"
            >
              <Menu aria-hidden="true" size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen ? <MobileMenu isOpen onClose={closeMenu} items={navigation} title={title} subtitle={subtitle} /> : null}
    </>
  )
}

export default Header
