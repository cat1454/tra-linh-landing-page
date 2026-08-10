'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, Menu } from 'lucide-react'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { PRIMARY_NAVIGATION } from '@/components/layout/navigation'

const MobileMenu = dynamic(
  () => import('@/components/layout/MobileMenu').then((module) => module.MobileMenu),
  { ssr: false },
)

interface HeaderProps {
  title?: string
  subtitle?: string
  navigation?: ReadonlyArray<{ label: string; href: string }>
  locale?: 'vi' | 'en'
}

export function Header({
  title,
  subtitle,
  navigation,
  locale = 'vi',
}: HeaderProps = {}) {
  const resolvedTitle = title ?? 'TRÀ LINH'
  const resolvedSubtitle = subtitle ?? (locale === 'en' ? 'Ngoc Linh highlands' : 'Đại ngàn Ngọc Linh')
  const resolvedNavigation = navigation ?? (locale === 'en'
    ? [
        { label: 'Overview', href: '/en#overview' },
        { label: 'Journeys', href: '/en#journeys' },
        { label: 'Travel advice', href: '/en#travel-advice' },
        { label: 'Contact', href: '/en#contact' },
      ]
    : PRIMARY_NAVIGATION)
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
        <div className="site-header__inner mx-auto flex w-full max-w-[1680px] items-center justify-between gap-3 px-6 sm:px-8 md:gap-6 lg:px-14 xl:px-20">
          <Link
            href={locale === 'en' ? '/en' : '/'}
            aria-label={locale === 'en' ? 'Tra Linh — home' : 'Trà Linh — trang chủ'}
            className="site-header__brand inline-flex min-h-10 shrink-0 flex-col justify-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5A84E]"
          >
            <span className="text-sm font-semibold tracking-[0.22em] sm:text-base lg:text-lg">{resolvedTitle}</span>
            <span className="mt-0.5 hidden text-[0.66rem] tracking-wide text-[#EEF1E9]/70 lg:block">
              {resolvedSubtitle}
            </span>
          </Link>

          <nav className="site-header__desktop-nav hidden min-[1180px]:block" aria-label="Điều hướng chính">
            <ul className="flex items-center gap-7 xl:gap-9">
              {resolvedNavigation.map((item) => (
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

          <div className="site-header__actions flex shrink-0 items-center gap-2">
            {locale === 'en' ? (
              <Link href="/" className="inline-flex min-h-10 items-center rounded-full px-3 text-xs font-semibold text-[#EEF1E9]/85 hover:text-[#D5A84E]" aria-label="Chuyển sang tiếng Việt">VI</Link>
            ) : null}
            <span className="hidden md:inline-flex">
              <Link
                href={locale === 'en' ? '/en#journeys' : '/#hanh-trinh'}
                className="site-header__cta inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#DDB149]/70 bg-transparent px-5 text-sm font-medium text-[#E6BD58] transition-colors hover:bg-[#DDB149] hover:text-[#10261F] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#DDB149]"
              >
                {locale === 'en' ? 'Explore Tra Linh' : 'Khám phá Trà Linh'}
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
            </span>
            <button
              type="button"
              aria-label="Mở menu"
              aria-haspopup="dialog"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMenuOpen(true)}
              className="site-header__menu-trigger inline-flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 transition-colors hover:border-[#D5A84E]/70 hover:bg-white/10 hover:text-[#D5A84E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5A84E] min-[1180px]:hidden"
            >
              <Menu aria-hidden="true" size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen ? <MobileMenu isOpen onClose={closeMenu} items={resolvedNavigation} title={resolvedTitle} subtitle={resolvedSubtitle} /> : null}
    </>
  )
}

export default Header
