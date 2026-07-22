'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import clsx from 'clsx'

import { useReducedMotionPreference } from '@/components/animation/useReducedMotionPreference'

interface TextRevealProps {
  readonly children: ReactNode
  readonly className?: string
  readonly delay?: number
}

export function TextReveal({ children, className, delay = 0 }: TextRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotionPreference()

  useLayoutEffect(() => {
    if (prefersReducedMotion || !rootRef.current) return
    let cancelled = false
    let cleanup: (() => void) | undefined

    void import('gsap').then(({ gsap }) => {
      if (cancelled || !rootRef.current) return
      const context = gsap.context(() => {
        gsap.fromTo(
          rootRef.current,
          { autoAlpha: 0, yPercent: 24 },
          { autoAlpha: 1, yPercent: 0, duration: 0.9, delay, ease: 'power3.out' },
        )
      }, rootRef)
      cleanup = () => context.revert()
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [delay, prefersReducedMotion])

  return <div ref={rootRef} className={clsx('text-reveal', className)}>{children}</div>
}

export default TextReveal
