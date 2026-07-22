'use client'

import { Children, useCallback, useEffect, useState, type ReactNode } from 'react'
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react'
import clsx from 'clsx'

import { CarouselControls } from '@/components/ui/CarouselControls'

type EmblaOptions = Parameters<typeof useEmblaCarousel>[0]

interface CarouselProps {
  readonly children: ReactNode
  readonly label: string
  readonly options?: EmblaOptions
  readonly className?: string
  readonly slideClassName?: string
  readonly inverse?: boolean
  readonly showControls?: boolean
}

export function Carousel({
  children,
  label,
  options = { align: 'start', containScroll: 'trimSnaps' },
  className,
  slideClassName,
  inverse = false,
  showControls = true,
}: CarouselProps) {
  const [viewportRef, api] = useEmblaCarousel(options)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [canScrollPrevious, setCanScrollPrevious] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const updateState = useCallback((emblaApi: UseEmblaCarouselType[1]) => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setScrollSnaps(emblaApi.scrollSnapList())
    setCanScrollPrevious(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [])

  useEffect(() => {
    if (!api) return
    const frame = window.requestAnimationFrame(() => updateState(api))
    api.on('select', updateState)
    api.on('reInit', updateState)
    return () => {
      window.cancelAnimationFrame(frame)
      api.off('select', updateState)
      api.off('reInit', updateState)
    }
  }, [api, updateState])

  const slides = Children.toArray(children)

  return (
    <section
      className={clsx('ui-carousel min-w-0', className)}
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div ref={viewportRef} className="ui-carousel__viewport overflow-hidden">
        <div className="ui-carousel__track flex touch-pan-y gap-4">
          {slides.map((slide, index) => (
            <div
              key={index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${slides.length}`}
              className={clsx('ui-carousel__slide min-w-0 shrink-0 basis-[88%] sm:basis-[58%] lg:basis-[38%]', slideClassName)}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {showControls && slides.length > 1 ? (
        <div className="ui-carousel__footer mt-6 flex items-center justify-between gap-4">
          <div className="ui-carousel__dots flex items-center gap-2" aria-hidden="true">
            {scrollSnaps.map((_, index) => (
              <span
                key={index}
                className={clsx(
                  'h-1.5 rounded-full transition-all',
                  selectedIndex === index
                    ? inverse ? 'w-8 bg-[#D5A84E]' : 'w-8 bg-[#5E7F3B]'
                    : inverse ? 'w-1.5 bg-white/25' : 'w-1.5 bg-[#10251A]/20',
                )}
              />
            ))}
          </div>
          <CarouselControls
            onPrevious={() => api?.scrollPrev()}
            onNext={() => api?.scrollNext()}
            previousDisabled={!canScrollPrevious}
            nextDisabled={!canScrollNext}
            inverse={inverse}
          />
        </div>
      ) : null}
    </section>
  )
}

export default Carousel
