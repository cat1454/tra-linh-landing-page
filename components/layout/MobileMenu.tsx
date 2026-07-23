'use client'

import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import {
  PRIMARY_NAVIGATION,
  type NavigationItem,
} from '@/components/layout/navigation'

interface MobileMenuProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly items?: readonly NavigationItem[]
  readonly title?: string
  readonly subtitle?: string
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function MobileMenu({
  isOpen,
  onClose,
  items = PRIMARY_NAVIGATION,
  title = 'TRÀ LINH',
  subtitle = 'Đại ngàn Ngọc Linh',
}: MobileMenuProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!isOpen) return

    const dialog = dialogRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const backgroundElements = Array.from(
      dialog?.parentElement?.children ?? [],
    ).filter((element): element is HTMLElement => (
      element instanceof HTMLElement && element !== dialog
    )).map((element) => ({
      element,
      ariaHidden: element.getAttribute('aria-hidden'),
      wasInert: element.hasAttribute('inert'),
    }))
    backgroundElements.forEach(({ element }) => {
      element.setAttribute('aria-hidden', 'true')
      element.setAttribute('inert', '')
    })

    const focusableElements = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
      )

    const frame = window.requestAnimationFrame(() => {
      focusableElements()[0]?.focus()
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const elements = focusableElements()
      if (elements.length === 0) {
        event.preventDefault()
        return
      }

      const first = elements[0]
      const last = elements[elements.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      backgroundElements.forEach(({ element, ariaHidden, wasInert }) => {
        if (ariaHidden === null) element.removeAttribute('aria-hidden')
        else element.setAttribute('aria-hidden', ariaHidden)
        if (!wasInert) element.removeAttribute('inert')
      })
      previouslyFocused?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <motion.div
      ref={dialogRef}
      id="mobile-navigation"
      role="dialog"
      aria-modal="true"
      aria-label="Điều hướng chính"
      className="mobile-menu fixed inset-0 z-[100] flex min-h-dvh flex-col overflow-y-auto bg-[#10251A] px-5 pb-8 pt-5 text-[#EEF1E9] md:px-10"
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeOut' }}
    >
      <div className="mobile-menu__masthead flex items-start justify-between gap-4">
        <Link
          href="/"
          className="mobile-menu__brand inline-flex min-h-11 flex-col justify-center"
          onClick={onClose}
        >
          <span className="text-lg font-semibold tracking-[0.18em]">{title}</span>
          <span className="mt-1 text-xs text-[#EEF1E9]/65">{subtitle}</span>
        </Link>
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={onClose}
          className="mobile-menu__close inline-flex size-12 items-center justify-center rounded-full border border-white/20 transition-colors hover:border-[#D5A84E] hover:text-[#D5A84E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5A84E]"
        >
          <X aria-hidden="true" size={22} strokeWidth={1.5} />
        </button>
      </div>

      <nav className="mobile-menu__nav my-auto py-12" aria-label="Điều hướng trên thiết bị di động">
        <motion.ul
          className="space-y-1"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: prefersReducedMotion ? 0 : 0.055,
                delayChildren: prefersReducedMotion ? 0 : 0.08,
              },
            },
          }}
        >
          {items.map((item, index) => (
            <motion.li
              key={item.href}
              variants={{
                hidden: prefersReducedMotion
                  ? { y: 0 }
                  : { y: 14 },
                visible: { y: 0 },
              }}
            >
              <a
                href={item.href}
                onClick={onClose}
                className="mobile-menu__link group flex min-h-14 items-center gap-4 border-b border-white/10 py-3 text-[clamp(1.45rem,7vw,2.5rem)] font-medium leading-tight"
              >
                <span className="text-xs font-normal tabular-nums text-[#D5A84E]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  {item.label}
                </span>
              </a>
            </motion.li>
          ))}
        </motion.ul>
      </nav>

      <Button href="/#hanh-trinh" className="mobile-menu__cta w-full" onClick={onClose}>
        Khám phá hành trình
        <ArrowUpRight aria-hidden="true" size={18} />
      </Button>
    </motion.div>
  )
}

export default MobileMenu
