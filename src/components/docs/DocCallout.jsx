import { Info, TriangleAlert, CircleCheck } from 'lucide-react'
import { cn } from '../../lib/cn'

const styles = {
  info: { wrap: 'border-accent/25 bg-accent/8', icon: Info, iconClass: 'text-accent' },
  warn: { wrap: 'border-accent-3/30 bg-accent-3/8', icon: TriangleAlert, iconClass: 'text-accent-3' },
  ok: { wrap: 'border-ok/25 bg-ok/8', icon: CircleCheck, iconClass: 'text-ok' },
}

export function DocCallout({ tone = 'info', title, children }) {
  const style = styles[tone] || styles.info
  const Icon = style.icon
  return (
    <div className={cn('mt-4 flex gap-3 rounded-xl border px-4 py-3 text-sm leading-6', style.wrap)}>
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', style.iconClass)} />
      <div>
        {title ? <div className="mb-1 font-medium text-ink">{title}</div> : null}
        <div className="text-ink-muted">{children}</div>
      </div>
    </div>
  )
}
