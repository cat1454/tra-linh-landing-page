'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import clsx from 'clsx'

interface CarouselControlsProps {
  readonly onPrevious: () => void
  readonly onNext: () => void
  readonly previousDisabled?: boolean
  readonly nextDisabled?: boolean
  readonly className?: string
  readonly inverse?: boolean
}

export function CarouselControls({
  onPrevious,
  onNext,
  previousDisabled = false,
  nextDisabled = false,
  className,
  inverse = false,
}: CarouselControlsProps) {
  const controlClass = clsx(
    'inline-flex size-12 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5A84E] disabled:cursor-not-allowed disabled:opacity-35',
    inverse
      ? 'border-white/20 text-white hover:border-[#D5A84E] hover:text-[#D5A84E]'
      : 'border-[#10251A]/20 text-[#10251A] hover:border-[#5E7F3B] hover:text-[#5E7F3B]',
  )

  return (
    <div className={clsx('carousel-controls flex items-center gap-2', className)}>
      <button type="button" aria-label="Nội dung trước" onClick={onPrevious} disabled={previousDisabled} className={controlClass}>
        <ArrowLeft aria-hidden="true" size={19} />
      </button>
      <button type="button" aria-label="Nội dung tiếp theo" onClick={onNext} disabled={nextDisabled} className={controlClass}>
        <ArrowRight aria-hidden="true" size={19} />
      </button>
    </div>
  )
}

export default CarouselControls
