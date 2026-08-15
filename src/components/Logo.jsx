import { Link } from 'react-router-dom'
import { cn } from '../lib/cn'

const sizes = {
  sm: 'text-[18px]',
  md: 'text-[22px]',
  lg: 'text-3xl',
}

export function Logo({ className, size = 'md', to = '/' }) {
  return (
    <Link to={to} className={cn('wordmark leading-none text-ink', sizes[size], className)}>
      MT ID
    </Link>
  )
}
