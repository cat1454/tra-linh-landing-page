import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import clsx from 'clsx'

interface JourneyCardProps {
  readonly title: string
  readonly description: string
  readonly step?: string | number
  readonly eyebrow?: string
  readonly href?: string
  readonly media?: ReactNode
  readonly meta?: ReactNode
  readonly className?: string
}

export function JourneyCard({
  title,
  description,
  step,
  eyebrow,
  href,
  media,
  meta,
  className,
}: JourneyCardProps) {
  const content = (
    <>
      {media ? <div className="journey-card__media aspect-[4/3] overflow-hidden rounded-[1.5rem]">{media}</div> : null}
      <div className="journey-card__body pt-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#49672D]">
            {step !== undefined ? `Chặng ${String(step).padStart(2, '0')}` : eyebrow}
          </p>
          {meta ? <div className="journey-card__meta text-xs text-[#10251A]/55">{meta}</div> : null}
        </div>
        <h3 className="mt-2 text-2xl font-semibold leading-tight text-[#10251A]">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#10251A]/68">{description}</p>
        {href ? (
          <span className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#5E7F3B]">
            Xem hành trình <ArrowUpRight aria-hidden="true" size={17} />
          </span>
        ) : null}
      </div>
    </>
  )

  const classes = clsx(
    'journey-card block h-full rounded-[2rem] border border-[#10251A]/10 bg-white/75 p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#10251A]/8 sm:p-5',
    className,
  )

  return href ? (
    <a href={href} className={classes}>{content}</a>
  ) : (
    <article className={classes}>{content}</article>
  )
}

export default JourneyCard
