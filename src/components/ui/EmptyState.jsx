import { cn } from '../../lib/cn'

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('rounded-2xl border border-dashed border-line px-6 py-14 text-center', className)}>
      {Icon ? (
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-line bg-white/3 text-accent">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <h2 className="text-base font-medium text-ink">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
