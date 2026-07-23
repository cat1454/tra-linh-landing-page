'use client'

import { useEffect, type ReactNode } from 'react'

let activeSmoothScrollCleanup: (() => void) | null = null

interface SmoothScrollProviderProps {
  readonly children: ReactNode
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let cancelled = false
    let generation = 0
    let localCleanup: (() => void) | undefined

    const stop = () => {
      generation += 1
      localCleanup?.()
      localCleanup = undefined
    }

    const start = async () => {
      const currentGeneration = ++generation
      const [lenisModule, gsapModule, scrollTriggerModule] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (
        cancelled ||
        currentGeneration !== generation ||
        reducedMotionQuery.matches
      ) return

      const Lenis = lenisModule.default
      const { gsap } = gsapModule
      const { ScrollTrigger } = scrollTriggerModule
      gsap.registerPlugin(ScrollTrigger)

      activeSmoothScrollCleanup?.()
      const lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
        syncTouch: false,
      })

      const handleScroll = () => ScrollTrigger.update()
      const tick = (time: number) => lenis.raf(time * 1000)
      lenis.on('scroll', handleScroll)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)

      const animationMedia = gsap.matchMedia()
      const animationContext = gsap.context(() => {
        animationMedia.add(
          {
            desktop: '(min-width: 1024px)',
            reduce: '(prefers-reduced-motion: reduce)',
          },
          (mediaContext) => {
            const { desktop, reduce } = mediaContext.conditions ?? {}
            if (!desktop || reduce) return

            const heroMedia = document.querySelector<HTMLElement>('.hero-media')
            const hero = document.querySelector<HTMLElement>('.hero-section')
            if (heroMedia && hero) {
              gsap.to(heroMedia, {
                yPercent: 7,
                ease: 'none',
                scrollTrigger: {
                  trigger: hero,
                  start: 'top top',
                  end: 'bottom top',
                  scrub: 0.8,
                },
              })
            }

            gsap.utils
              .toArray<HTMLElement>('#vung-sam ol > li')
              .forEach((item) => {
                gsap.fromTo(
                  item,
                  { autoAlpha: 0.35, y: 24 },
                  {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.7,
                    ease: 'power2.out',
                    scrollTrigger: {
                      trigger: item,
                      start: 'top 78%',
                      toggleActions: 'play none none reset',
                    },
                  },
                )
              })

            // Entrance fade-and-rise animations for LocalProduceSection cards
            gsap.utils
              .toArray<HTMLElement>('#san-vat .produce-card')
              .forEach((item) => {
                gsap.fromTo(
                  item,
                  { autoAlpha: 0, y: 35 },
                  {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.85,
                    ease: 'power3.out',
                    scrollTrigger: {
                      trigger: item,
                      start: 'top 85%',
                      toggleActions: 'play none none reset',
                    },
                  },
                )
              })

            // Entrance fade-and-rise animations for XoDangCultureSection cards
            gsap.utils
              .toArray<HTMLElement>('#van-hoa .culture-card')
              .forEach((item) => {
                gsap.fromTo(
                  item,
                  { autoAlpha: 0, y: 35 },
                  {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.85,
                    ease: 'power3.out',
                    scrollTrigger: {
                      trigger: item,
                      start: 'top 85%',
                      toggleActions: 'play none none reset',
                    },
                  },
                )
              })

            // Parallax scroll effect for FinalCTA background image
            const finalCtaBg = document.querySelector<HTMLElement>('.final-cta-bg')
            const finalCta = document.querySelector<HTMLElement>('section[aria-labelledby="final-cta-heading"]')
            if (finalCtaBg && finalCta) {
              gsap.fromTo(
                finalCtaBg,
                { yPercent: -8 },
                {
                  yPercent: 8,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: finalCta,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.8,
                  },
                },
              )
            }
          },
        )
      })
      ScrollTrigger.refresh()

      const cleanup = () => {
        animationMedia.revert()
        animationContext.revert()
        lenis.off('scroll', handleScroll)
        gsap.ticker.remove(tick)
        lenis.destroy()
      }
      activeSmoothScrollCleanup = cleanup
      localCleanup = () => {
        cleanup()
        if (activeSmoothScrollCleanup === cleanup) {
          activeSmoothScrollCleanup = null
        }
      }
    }

    const handleMotionPreference = () => {
      if (reducedMotionQuery.matches) stop()
      else if (interactionStarted) void start()
    }

    let interactionStarted = false
    const removeInteractionListeners = () => {
      window.removeEventListener('pointerdown', beginOnInteraction)
      window.removeEventListener('wheel', beginOnInteraction)
      window.removeEventListener('touchstart', beginOnInteraction)
      window.removeEventListener('keydown', beginOnInteraction)
    }
    const beginOnInteraction = () => {
      interactionStarted = true
      removeInteractionListeners()
      if (!reducedMotionQuery.matches) void start()
    }

    reducedMotionQuery.addEventListener('change', handleMotionPreference)
    window.addEventListener('pointerdown', beginOnInteraction, { once: true, passive: true })
    window.addEventListener('wheel', beginOnInteraction, { once: true, passive: true })
    window.addEventListener('touchstart', beginOnInteraction, { once: true, passive: true })
    window.addEventListener('keydown', beginOnInteraction, { once: true })

    return () => {
      cancelled = true
      reducedMotionQuery.removeEventListener('change', handleMotionPreference)
      removeInteractionListeners()
      stop()
    }
  }, [])

  return children
}

export default SmoothScrollProvider
