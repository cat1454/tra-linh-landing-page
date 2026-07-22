import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import clsx from 'clsx'

interface EditorialCardProps {
  readonly title: string
  readonly description?: string
  readonly eyebrow?: string
  readonly href?: string
  readonly media?: ReactNode
  readonly children?: ReactNode
  readonly className?: string
  readonly inverse?: boolean
}

export function EditorialCard({
  title,
  description,
  eyebrow,
  href,
  media,
  children,
  className,
  inverse = false,
}: EditorialCardProps) {
  const content = (
    <>
      {media ? <div className="editorial-card__media overflow-hidden rounded-[1.4rem]">{media}</div> : null}
      <div className="editorial-card__body p-5 sm:p-6">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D5A84E]">{eyebrow}</p> : null}
        <h3 className="mt-2 text-xl font-semibold leading-tight sm:text-2xl">{title}</h3>
        {description ? <p className={clsx('mt-3 text-sm leading-6', inverse ? 'text-[#EEF1E9]/68' : 'text-[#10251A]/68')}>{description}</p> : null}
        {children}
        {href ? (
          <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#D5A84E]">
            Đọc câu chuyện <ArrowUpRight aria-hidden="true" size={17} />
          </span>
        ) : null}
      </div>
    </>
  )
  const classes = clsx(
    'editorial-card block h-full overflow-hidden rounded-[2rem] border transition duration-300 hover:-translate-y-1',
    inverse
      ? 'border-white/10 bg-white/6 text-[#EEF1E9]'
      : 'border-[#10251A]/10 bg-white/65 text-[#10251A]',
    className,
  )
  return href ? <a href={href} className={classes}>{content}</a> : <article className={classes}>{content}</article>
}

export default EditorialCard
