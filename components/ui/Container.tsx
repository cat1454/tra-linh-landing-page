import type { HTMLAttributes } from 'react'
import clsx from 'clsx'

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={clsx(
        'ui-container mx-auto w-full max-w-[1440px] px-5 md:px-8 xl:px-12',
        className,
      )}
    />
  )
}

export default Container
