import type { ReactNode } from 'react'
import clsx from 'clsx'

interface ProductCardProps {
  readonly name: string
  readonly description: string
  readonly image?: ReactNode
  readonly href?: string
  readonly label?: string
  readonly note?: string
  readonly className?: string
}

export function ProductCard({
  name,
  description,
  image,
  href,
  label = 'Nội dung đề xuất',
  note = 'Thông tin đang được xác minh',
  className,
}: ProductCardProps) {
  const content = (
    <>
      {image ? <div className="product-card__media aspect-[4/3] overflow-hidden rounded-[1.4rem] bg-white/5">{image}</div> : null}
      <div className="product-card__body pt-5">
        <span className="inline-flex rounded-full border border-[#D5A84E]/35 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#D5A84E]">
          {label}
        </span>
        <h3 className="mt-3 text-xl font-semibold text-[#EEF1E9]">{name}</h3>
        <p className="mt-2 text-sm leading-6 text-[#EEF1E9]/68">{description}</p>
        <p className="mt-4 text-xs text-[#EEF1E9]/48">{note}</p>
      </div>
    </>
  )

  const classes = clsx(
    'product-card block h-full rounded-[2rem] border border-white/10 bg-white/6 p-4 transition duration-300 hover:-translate-y-1 hover:border-[#D5A84E]/35 sm:p-5',
    className,
  )
  return href ? <a href={href} className={classes}>{content}</a> : <article className={classes}>{content}</article>
}

export default ProductCard
