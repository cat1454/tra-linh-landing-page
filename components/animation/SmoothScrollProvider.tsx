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
      const getHeaderOffset = () => {
        const value = getComputedStyle(document.documentElement).scrollPaddingTop
        return Number.parseFloat(value) || 0
      }
      const lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
        syncTouch: false,
        anchors: {
          duration: 0.85,
        },
        stopInertiaOnNavigate: true,
      })

      const handleScroll = () => ScrollTrigger.update()
      const tick = (time: number) => lenis.raf(time * 1000)
      lenis.on('scroll', handleScroll)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)

      const landingPage = document.querySelector<HTMLElement>('.landing-page')
      const desktopSnapQuery = window.matchMedia('(min-width: 1024px)')
      let chapterResizeObserver: ResizeObserver | undefined
      let chapterRefreshFrame = 0
      let chapterSnapTimer: ReturnType<typeof setTimeout> | undefined
      let chapterPoints: number[] = []
      let chapterSnapEnabled = false
      let chapterDirection: -1 | 1 = 1
      let chapterGestureDistance = 0

      const cancelChapterSettle = () => {
        if (chapterSnapTimer) clearTimeout(chapterSnapTimer)
        chapterSnapTimer = undefined
        chapterGestureDistance = 0
      }

      const refreshChapterPoints = () => {
        if (!chapterSnapEnabled || !landingPage) return

        const headerOffset = getHeaderOffset()
        const chapters = landingPage.querySelectorAll<HTMLElement>(
          ':scope > section:is([id], [aria-labelledby]), :scope > #lien-he',
        )
        chapterPoints = Array.from(chapters, (chapter) => {
          const top = chapter.getBoundingClientRect().top + window.scrollY
          return Math.max(0, Math.round(top - headerOffset))
        })
      }

      const scheduleChapterRefresh = () => {
        cancelAnimationFrame(chapterRefreshFrame)
        chapterRefreshFrame = requestAnimationFrame(refreshChapterPoints)
      }

      const disableChapterSnap = () => {
        cancelAnimationFrame(chapterRefreshFrame)
        cancelChapterSettle()
        chapterResizeObserver?.disconnect()
        chapterResizeObserver = undefined
        chapterPoints = []
        chapterSnapEnabled = false
        document.documentElement.removeAttribute('data-lenis-chapter-snap')
      }

      const settleChapter = () => {
        chapterSnapTimer = undefined
        const gestureDistance = chapterGestureDistance
        chapterGestureDistance = 0
        if (
          !chapterSnapEnabled ||
          chapterPoints.length === 0 ||
          gestureDistance < 40
        ) return

        const position = lenis.targetScroll
        const distanceThreshold = Math.min(window.innerHeight * 0.52, 520)
        const target = chapterDirection > 0
          ? chapterPoints.find((point) => point > position + 1)
          : chapterPoints.findLast((point) => point < position - 1)

        if (target === undefined || Math.abs(target - position) > distanceThreshold) return

        lenis.scrollTo(target, {
          duration: 0.72,
          lock: false,
          userData: { initiator: 'chapter-snap' },
        })
      }

      const handleChapterGesture = ({
        deltaX,
        deltaY,
        event,
      }: {
        deltaX: number
        deltaY: number
        event: WheelEvent | TouchEvent
      }) => {
        if (!chapterSnapEnabled || event.type === 'touchmove') return
        if (Math.abs(deltaY) <= Math.abs(deltaX) || deltaY === 0) return

        const eventTarget = event.target instanceof Element ? event.target : null
        if (eventTarget?.closest('[data-lenis-prevent], [data-lenis-prevent-wheel], [role="dialog"]')) return

        const nextDirection = deltaY > 0 ? 1 : -1
        if (chapterDirection !== nextDirection) chapterGestureDistance = 0
        chapterDirection = nextDirection
        chapterGestureDistance += Math.abs(deltaY)
        if (chapterSnapTimer) clearTimeout(chapterSnapTimer)
        chapterSnapTimer = setTimeout(settleChapter, 180)
      }

      const handleAnchorNavigation = (event: MouseEvent) => {
        const currentUrl = new URL(window.location.href)
        const anchor = event
          .composedPath()
          .find((node): node is HTMLAnchorElement =>
            node instanceof HTMLAnchorElement && Boolean(node.href),
          )
        if (!anchor) return

        const targetUrl = new URL(anchor.href)
        if (
          targetUrl.host === currentUrl.host &&
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.hash
        ) {
          cancelChapterSettle()
          const target = document.getElementById(
            decodeURIComponent(targetUrl.hash.slice(1)),
          )
          if (!target) return

          event.preventDefault()
          window.history.replaceState(null, '', targetUrl.hash)
          lenis.scrollTo(target, {
            offset: -getHeaderOffset(),
            duration: 0.85,
            lock: false,
            userData: { initiator: 'anchor-navigation' },
          })
        }
      }

      lenis.on('virtual-scroll', handleChapterGesture)
      document.addEventListener('click', handleAnchorNavigation, true)

      const syncChapterSnap = () => {
        if (!landingPage || !desktopSnapQuery.matches) {
          disableChapterSnap()
          return
        }
        if (chapterSnapEnabled) {
          scheduleChapterRefresh()
          return
        }

        chapterSnapEnabled = true
        document.documentElement.setAttribute('data-lenis-chapter-snap', '')
        chapterResizeObserver = new ResizeObserver(scheduleChapterRefresh)
        chapterResizeObserver.observe(landingPage)
        scheduleChapterRefresh()
      }

      desktopSnapQuery.addEventListener('change', syncChapterSnap)
      syncChapterSnap()

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
        desktopSnapQuery.removeEventListener('change', syncChapterSnap)
        disableChapterSnap()
        animationMedia.revert()
        animationContext.revert()
        document.removeEventListener('click', handleAnchorNavigation, true)
        lenis.off('virtual-scroll', handleChapterGesture)
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
    }
    const beginOnInteraction = (event: Event) => {
      if (event instanceof PointerEvent) {
        if (event.pointerType === 'touch') return
        const target = event.target instanceof Element ? event.target : null
        if (target?.closest('a[href^="#"]')) return
      }
      interactionStarted = true
      removeInteractionListeners()
      if (!reducedMotionQuery.matches) void start()
    }

    reducedMotionQuery.addEventListener('change', handleMotionPreference)
    window.addEventListener('pointerdown', beginOnInteraction, { passive: true })
    window.addEventListener('wheel', beginOnInteraction, { passive: true })

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
