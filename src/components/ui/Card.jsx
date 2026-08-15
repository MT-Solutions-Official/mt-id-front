import { cn } from '../../lib/cn'

export function Card({ className, ...props }) {
  return <div className={cn('panel rounded-2xl', className)} {...props} />
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('border-b border-line px-6 py-5', className)} {...props} />
}

export function CardBody({ className, ...props }) {
  return <div className={cn('px-6 py-5', className)} {...props} />
}
