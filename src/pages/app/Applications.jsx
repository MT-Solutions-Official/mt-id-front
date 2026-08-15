import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { apps } from '../../lib/api'
import { relativeTime } from '../../lib/format'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { CopyButton } from '../../components/ui/CopyField'
import { PageHeader } from '../../components/ui/PageHeader'
import { Skeleton } from '../../components/ui/Skeleton'
import { cn } from '../../lib/cn'
import { EmptyApps } from './Overview'

const filters = [
  { id: 'all', label: 'Todas' },
  { id: 'active', label: 'Ativas' },
  { id: 'inactive', label: 'Inativas' },
]

export function Applications() {
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['apps'],
    queryFn: async () => (await apps.list()).data,
  })
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return applications.filter((app) => {
      const active = app.active !== false
      if (filter === 'active' && !active) return false
      if (filter === 'inactive' && active) return false
      if (!term) return true
      return [app.name, app.appId, app.description, ...(app.allowedOrigins || [])]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
  }, [applications, filter, query])

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Workspace"
        title="Aplicações"
        description="Cada app isola users, origins e credenciais. Abra uma para rotacionar o secret ou ajustar o JWT."
        actions={
          <Link to="/app/applications/new">
            <Button>
              <Plus className="h-4 w-4" />
              Nova aplicação
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filtrar por nome, appId ou origin"
            className="h-10 w-full rounded-xl border border-line bg-bg/60 pr-3 pl-9 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
          />
        </label>
        <div className="flex rounded-xl border border-line p-1">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs',
                filter === item.id ? 'bg-white/8 text-ink' : 'text-ink-muted hover:text-ink',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {!isLoading && applications.length === 0 ? <EmptyApps /> : null}

      {!isLoading && applications.length > 0 && visible.length === 0 ? (
        <p className="text-sm text-ink-muted">Nenhuma aplicação corresponde ao filtro.</p>
      ) : null}

      {visible.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((app) => {
            const origins = app.allowedOrigins || []
            return (
              <Link
                key={app.appId}
                to={`/app/applications/${app.appId}`}
                className="panel flex flex-col rounded-2xl p-5 transition hover:border-line-strong hover:bg-white/4"
              >
                <div className="flex items-start justify-between gap-3">
                  <Avatar name={app.name} src={app.logoUrl} size="lg" />
                  <Badge tone={app.active === false ? 'danger' : 'ok'}>
                    {app.active === false ? 'Inativa' : 'Ativa'}
                  </Badge>
                </div>
                <h3 className="mt-4 truncate text-[15px] font-medium">{app.name}</h3>
                {app.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{app.description}</p>
                ) : null}
                <div className="mt-3 flex min-w-0 items-center gap-2">
                  <span className="truncate font-mono text-[11px] text-ink-faint">{app.appId}</span>
                  <CopyButton value={app.appId} label="appId" />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-ink-faint">
                  <span>
                    {origins.length
                      ? `${origins.length} origin${origins.length === 1 ? '' : 's'}`
                      : 'Sem origins'}
                  </span>
                  <span>{relativeTime(app.updatedAt || app.createdAt)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
