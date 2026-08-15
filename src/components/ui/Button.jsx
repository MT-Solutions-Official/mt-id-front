import { cva } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const variants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium tracking-tight transition duration-200 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-fg shadow-[0_0_24px_rgb(34_224_255_/_0.28)] hover:bg-accent/90',
        secondary: 'border border-line bg-white/3 text-ink hover:border-line-strong hover:bg-white/6',
        ghost: 'text-ink-muted hover:text-ink hover:bg-white/4',
        danger: 'bg-danger/15 text-danger hover:bg-danger/25',
        outline: 'border border-line text-ink hover:bg-surface-2',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-[15px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export function Button({ className, variant, size, type = 'button', ...props }) {
  return <button type={type} className={cn(variants({ variant, size }), className)} {...props} />
}
