import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'
import clsx from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'light'
type ButtonSize = 'sm' | 'md' | 'lg'

interface SharedButtonProps {
  readonly children: ReactNode
  readonly variant?: ButtonVariant
  readonly size?: ButtonSize
  readonly className?: string
}

type LinkButtonProps = SharedButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    readonly href: string
  }

type NativeButtonProps = SharedButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    readonly href?: never
  }

export type ButtonProps = LinkButtonProps | NativeButtonProps

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#5E7F3B] text-white hover:bg-[#49672D]',
  secondary: 'border border-[#5E7F3B]/45 bg-transparent text-[#10251A] hover:border-[#5E7F3B] hover:bg-[#5E7F3B]/8',
  ghost: 'bg-transparent text-current hover:bg-current/8',
  light: 'bg-[#EEF1E9] text-[#10251A] hover:bg-white',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-4 text-sm',
  md: 'min-h-12 px-6 text-sm',
  lg: 'min-h-14 px-7 text-base',
}

export function Button(props: ButtonProps) {
  const {
    children,
    variant = 'primary',
    size = 'md',
    className,
  } = props
  const classes = clsx(
    'ui-button group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,border-color,color,transform] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5A84E] disabled:pointer-events-none disabled:opacity-50',
    `ui-button--${variant}`,
    `ui-button--${size}`,
    variantClasses[variant],
    sizeClasses[size],
    className,
  )

  if ('href' in props && props.href) {
    const { href, variant: _variant, size: _size, className: _className, ...anchorProps } = props
    void _variant
    void _size
    void _className
    return (
      <a {...anchorProps} href={href} className={classes}>
        {children}
      </a>
    )
  }

  const {
    variant: _variant,
    size: _size,
    className: _className,
    type,
    ...buttonProps
  } = props as NativeButtonProps
  void _variant
  void _size
  void _className
  return (
    <button {...buttonProps} type={type ?? 'button'} className={classes}>
      {children}
    </button>
  )
}

export default Button
