import { cn } from '../../lib/cn'

export function Badge({ children, tone = 'default', className }) {
  const tones = {
    default: 'text-ink-muted border-line bg-white/3',
    accent: 'text-accent border-accent/30 bg-accent/10',
    violet: 'text-accent-2 border-accent-2/30 bg-accent-2/10',
    ok: 'text-ok border-ok/30 bg-ok/10',
    danger: 'text-danger border-danger/30 bg-danger/10',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-[0.14em] uppercase', tones[tone], className)}>
      {children}
    </span>
  )
}
