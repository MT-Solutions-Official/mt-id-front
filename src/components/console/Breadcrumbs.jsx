import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { apps } from '../../lib/api'

const labels = {
  app: 'Console',
  applications: 'Aplicações',
  new: 'Nova',
  team: 'Time',
  account: 'Conta',
}

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const appMatch = pathname.match(/^\/app\/applications\/([^/]+)/)
  const appId = appMatch && appMatch[1] !== 'new' ? appMatch[1] : null
  const appQuery = useQuery({
    queryKey: ['apps', appId],
    queryFn: async () => (await apps.get(appId)).data,
    enabled: Boolean(appId),
  })

  const parts = pathname.split('/').filter(Boolean)
  const crumbs = parts.map((part, index) => {
    const to = `/${parts.slice(0, index + 1).join('/')}`
    const last = index === parts.length - 1
    let label = labels[part] || part
    if (part === appId) label = appQuery.data?.name || 'Aplicação'
    return { to, label, last }
  })

  if (!crumbs.length) return null

  return (
    <nav className="flex min-w-0 items-center text-[13px] text-ink-muted">
      {crumbs.map((crumb, index) => (
        <Fragment key={crumb.to}>
          {index > 0 ? <ChevronRight className="mx-1 h-3.5 w-3.5 shrink-0 text-ink-faint" /> : null}
          {crumb.last ? (
            <span className="truncate text-ink">{crumb.label}</span>
          ) : (
            <Link to={crumb.to} className="truncate hover:text-ink">
              {crumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
