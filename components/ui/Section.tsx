import type { HTMLAttributes } from 'react'
import clsx from 'clsx'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  readonly tone?: 'mist' | 'cream' | 'forest' | 'transparent'
}

const toneClasses: Record<NonNullable<SectionProps['tone']>, string> = {
  mist: 'bg-[#EEF1E9] text-[#10251A]',
  cream: 'bg-[#EEE3CB] text-[#10251A]',
  forest: 'bg-[#10251A] text-[#EEF1E9]',
  transparent: 'bg-transparent text-inherit',
}

export function Section({
  tone = 'mist',
  className,
  ...props
}: SectionProps) {
  return (
    <section
      {...props}
      className={clsx(
        'ui-section relative overflow-clip py-16 sm:py-20 lg:py-28',
        `ui-section--${tone}`,
        toneClasses[tone],
        className,
      )}
    />
  )
}

export default Section
