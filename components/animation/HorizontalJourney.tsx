'use client'

import { Children, useLayoutEffect, useRef, type HTMLAttributes } from 'react'
import clsx from 'clsx'

import { useReducedMotionPreference } from '@/components/animation/useReducedMotionPreference'

export function HorizontalJourney({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotionPreference()

  useLayoutEffect(() => {
    if (
      prefersReducedMotion ||
      !window.matchMedia('(min-width: 1024px)').matches ||
      !rootRef.current ||
      !trackRef.current
    ) return
    let cancelled = false
    let cleanup: (() => void) | undefined

    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([gsapModule, scrollTriggerModule]) => {
        if (cancelled || !rootRef.current || !trackRef.current) return
        const { gsap } = gsapModule
        const { ScrollTrigger } = scrollTriggerModule
        gsap.registerPlugin(ScrollTrigger)
        let media: ReturnType<typeof gsap.matchMedia> | undefined
        const context = gsap.context(() => {
          media = gsap.matchMedia()
          media.add('(min-width: 1024px)', () => {
            const distance = () => Math.max(0, trackRef.current!.scrollWidth - rootRef.current!.clientWidth)
            gsap.to(trackRef.current, {
              x: () => -distance(),
              ease: 'none',
              scrollTrigger: {
                trigger: rootRef.current,
                start: 'top top',
                end: () => `+=${distance()}`,
                scrub: 0.7,
                pin: true,
                invalidateOnRefresh: true,
              },
            })
          })
        }, rootRef)
        cleanup = () => {
          media?.revert()
          context.revert()
        }
      },
    )

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [prefersReducedMotion])

  return (
    <div
      {...props}
      ref={rootRef}
      className={clsx('horizontal-journey min-w-0 overflow-x-auto lg:overflow-visible', className)}
    >
      <div ref={trackRef} className="horizontal-journey__track flex w-max gap-4 pr-5 md:gap-6">
        {Children.map(children, (child) => (
          <div data-horizontal-item className="horizontal-journey__item w-[min(86vw,28rem)] shrink-0">
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

export default HorizontalJourney
