import clsx from 'clsx'

interface SectionHeadingProps {
  readonly eyebrow?: string
  readonly title: string
  readonly description?: string
  readonly id?: string
  readonly align?: 'left' | 'center'
  readonly inverse?: boolean
  readonly className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  align = 'left',
  inverse = false,
  className,
}: SectionHeadingProps) {
  return (
    <header
      className={clsx(
        'section-heading max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? (
        <p className={clsx('section-heading__eyebrow text-xs font-semibold uppercase tracking-[0.18em]', inverse ? 'text-[#D5A84E]' : 'text-[#49672D]')}>
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className={clsx('section-heading__title mt-3 text-[clamp(2rem,5vw,4.6rem)] font-semibold leading-[1.06] tracking-[-0.035em]', inverse ? 'text-[#EEF1E9]' : 'text-[#10251A]')}
      >
        {title}
      </h2>
      {description ? (
        <p className={clsx('section-heading__description mt-5 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8', inverse ? 'text-[#EEF1E9]/68' : 'text-[#10251A]/68', align === 'center' && 'mx-auto')}>
          {description}
        </p>
      ) : null}
    </header>
  )
}

export default SectionHeading
