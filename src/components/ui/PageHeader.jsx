import { cn } from '../../lib/cn'

export function PageHeader({ kicker, title, description, actions, className }) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        {kicker ? <p className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">{kicker}</p> : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink md:text-[28px]">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
