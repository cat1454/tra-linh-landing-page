'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import clsx from 'clsx'

import { useReducedMotionPreference } from '@/components/animation/useReducedMotionPreference'

interface ParallaxLayersProps {
  readonly children: ReactNode
  readonly className?: string
  readonly strength?: number
}

export function ParallaxLayers({
  children,
  className,
  strength = 14,
}: ParallaxLayersProps) {
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
        const context = gsap.context(() => {
          const layers = rootRef.current?.querySelectorAll<HTMLElement>('[data-parallax-depth]') ?? []
          layers.forEach((layer) => {
            const depth = Number(layer.dataset.parallaxDepth ?? 1)
            gsap.fromTo(
              layer,
              { yPercent: -strength * depth * 0.35 },
              {
                yPercent: strength * depth,
                ease: 'none',
                scrollTrigger: {
                  trigger: rootRef.current,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 0.8,
                },
              },
            )
          })
        }, rootRef)
        cleanup = () => context.revert()
      },
    )

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [prefersReducedMotion, strength])

  return <div ref={rootRef} className={clsx('parallax-layers relative', className)}>{children}</div>
}

export default ParallaxLayers
