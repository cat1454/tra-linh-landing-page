'use client'

import { Children, useLayoutEffect, useRef, type HTMLAttributes } from 'react'
import clsx from 'clsx'

import { useReducedMotionPreference } from '@/components/animation/useReducedMotionPreference'

export function StickyStory({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const rootRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotionPreference()

  useLayoutEffect(() => {
    if (prefersReducedMotion || !rootRef.current) return
    let cancelled = false
    let cleanup: (() => void) | undefined

    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([gsapModule, scrollTriggerModule]) => {
        if (cancelled || !rootRef.current) return
        const { gsap } = gsapModule
        const { ScrollTrigger } = scrollTriggerModule
        gsap.registerPlugin(ScrollTrigger)
        let media: ReturnType<typeof gsap.matchMedia> | undefined
        const context = gsap.context(() => {
          const panels = gsap.utils.toArray<HTMLElement>('[data-story-panel]', rootRef.current)
          if (panels.length < 2) return
          media = gsap.matchMedia()
          media.add('(min-width: 1024px)', () => {
            gsap.set(panels.slice(1), { autoAlpha: 0.25, y: 28 })
            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: rootRef.current,
                start: 'top top',
                end: `+=${panels.length * 70}%`,
                scrub: 0.7,
                pin: true,
              },
            })
            panels.slice(1).forEach((panel, index) => {
              timeline
                .to(panels[index], { autoAlpha: 0.25, duration: 0.5 })
                .to(panel, { autoAlpha: 1, y: 0, duration: 0.5 }, '<')
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
    <div {...props} ref={rootRef} className={clsx('sticky-story', className)}>
      {Children.map(children, (child) => (
        <div data-story-panel className="sticky-story__panel">{child}</div>
      ))}
    </div>
  )
}

export default StickyStory
