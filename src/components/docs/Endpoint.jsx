import { cn } from '../../lib/cn'

const tones = {
  GET: 'bg-ok/15 text-ok border-ok/25',
  POST: 'bg-accent/15 text-accent border-accent/25',
  PATCH: 'bg-accent-2/15 text-accent-2 border-accent-2/25',
  PUT: 'bg-accent-3/15 text-accent-3 border-accent-3/25',
  DELETE: 'bg-danger/15 text-danger border-danger/25',
}

export function Endpoint({ method, path, auth }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface/60 px-3 py-2.5">
      <span className={cn('rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide', tones[method] || tones.GET)}>
        {method}
      </span>
      <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink">{path}</code>
      {auth ? <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] tracking-wide text-ink-faint">{auth}</span> : null}
    </div>
  )
}
