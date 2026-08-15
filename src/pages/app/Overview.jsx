import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AppWindow, ArrowUpRight, BookOpen, CircleUserRound, Globe, KeyRound, Mail, Plus, Shield, Users } from 'lucide-react'
import { apps } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { firstName, greeting, isLocalOrigin, ownerPhoto, relativeTime } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageSkeleton } from '../../components/ui/Skeleton'
import { SetupChecklist } from '../../components/console/SetupChecklist'
import { cn } from '../../lib/cn'

function byRecent(left, right) {
  return new Date(right.updatedAt || right.createdAt || 0) - new Date(left.updatedAt || left.createdAt || 0)
}

function uniqueAppOwners(applications) {
  const map = new Map()
  for (const app of applications) {
    for (const member of app.owners || []) {
      if (member?.ownerId) map.set(member.ownerId, member)
    }
  }
  return [...map.values()]
}

export function Overview() {
  const { owner } = useAuth()
  const appsQuery = useQuery({
    queryKey: ['apps'],
    queryFn: async () => (await apps.list()).data,
  })

  const applications = [...(appsQuery.data || [])].sort(byRecent)
  const team = uniqueAppOwners(applications)
  const activeApps = applications.filter((app) => app.active !== false)
  const inactiveApps = applications.filter((app) => app.active === false)
  const originCount = applications.reduce((sum, app) => sum + (app.allowedOrigins?.length || 0), 0)
  const googleApps = applications.filter((app) => app.googleAudience).length
  const emailVerified = Boolean(owner?.email?.verified)
  const [featured, ...rest] = applications

  if (appsQuery.isLoading) return <PageSkeleton />

  return (
    <div className="space-y-8">
      <section className="panel relative overflow-hidden rounded-2xl">
        <div className="pointer-events-none absolute inset-0 aurora opacity-50" />
        <div className="pointer-events-none absolute inset-0 tech-grid opacity-40" />
        <div className="relative p-6 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex min-w-0 items-start gap-4">
              <Avatar name={owner?.name} src={ownerPhoto(owner)} size="xl" />
              <div className="min-w-0">
                <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">Console</p>
                <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight md:text-[32px]">
                  {greeting()}, {firstName(owner?.name)}
                </h1>
                <p className="mt-2 max-w-lg text-sm leading-6 text-ink-muted">
                  {applications.length
                    ? `${activeApps.length} app${activeApps.length === 1 ? '' : 's'} ativa${activeApps.length === 1 ? '' : 's'} neste workspace.`
                    : 'Crie a primeira aplicação para emitir credenciais e autenticar users.'}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge>OWNER</Badge>
                  <Badge tone={emailVerified ? 'ok' : 'danger'}>
                    {emailVerified ? 'E-mail verificado' : 'E-mail pendente'}
                  </Badge>
                  {inactiveApps.length ? (
                    <Badge tone="danger">
                      {inactiveApps.length} inativa{inactiveApps.length === 1 ? '' : 's'}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/docs">
                <Button variant="secondary">
                  <BookOpen className="h-4 w-4" />
                  Docs
                </Button>
              </Link>
              <Link to="/app/applications/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Nova aplicação
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
            <HeroMetric to="/app/applications" label="Aplicações" value={applications.length} hint={`${activeApps.length} ativas`} />
            <HeroMetric to="/app/applications" label="Origins" value={originCount} hint="CORS liberado" />
            <HeroMetric to="/app/team" label="Owners" value={team.length || '—'} hint="Nas suas apps" />
            <HeroMetric
              to={featured ? `/app/applications/${featured.appId}?tab=auth` : '/app/applications'}
              label="Google"
              value={googleApps}
              hint={googleApps ? 'apps com Sign-In' : 'nenhuma app'}
            />
          </div>
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="panel overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">Workspace</p>
              <h2 className="mt-1 text-[15px] font-medium">Aplicações</h2>
            </div>
            {applications.length > 0 ? (
              <Link to="/app/applications" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
                Ver todas
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ) : null}
          </div>

          {applications.length === 0 ? (
            <div className="p-5">
              <EmptyApps />
            </div>
          ) : (
            <>
              <FeaturedApp app={featured} />
              {rest.length ? (
                <ul className="divide-y divide-line border-t border-line">
                  {rest.slice(0, 4).map((app) => (
                    <li key={app.appId}>
                      <AppRow app={app} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </section>

        <div className="space-y-6">
          <SetupChecklist owner={owner} applications={applications} />

          <section className="panel rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">Organização</p>
                <h2 className="mt-1 text-[15px] font-medium">Time</h2>
              </div>
              <Link to="/app/team" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
                Ver
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-4 flex items-center">
              {team.slice(0, 6).map((item, index) => (
                <span key={item.ownerId} className={cn('ring-2 ring-bg', index ? '-ml-2' : '')} title={item.name}>
                  <Avatar name={item.name} src={ownerPhoto(item)} />
                </span>
              ))}
              {team.length > 6 ? (
                <span className="ml-2 text-xs text-ink-faint">+{team.length - 6}</span>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-ink-muted">
              {team.length} owner{team.length === 1 ? '' : 's'} nas suas aplicações.
            </p>
          </section>

          <section className="panel rounded-2xl p-2">
            <Shortcut to="/app/account" icon={CircleUserRound} label="Conta" hint="Foto, dados e endereço" />
            <Shortcut to="/app/team" icon={Users} label="Time" hint="Owners por aplicação" />
            <Shortcut to="/docs/quickstart" icon={BookOpen} label="Quickstart" hint="Primeira integração" />
          </section>
        </div>
      </div>
    </div>
  )
}

function HeroMetric({ to, label, value, hint }) {
  return (
    <Link to={to} className="bg-bg-muted/80 px-4 py-3.5 transition hover:bg-white/4">
      <div className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">{label}</div>
      <div className="mt-1 text-xl font-semibold tracking-tight">{value}</div>
      <div className="mt-0.5 truncate text-[11px] text-ink-faint">{hint}</div>
    </Link>
  )
}

function FeaturedApp({ app }) {
  const origins = app.allowedOrigins || []
  const prod = origins.some((origin) => origin && !isLocalOrigin(origin))

  return (
    <article className="p-5">
      <div className="flex items-start gap-4">
        <Avatar name={app.name} src={app.logoUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/app/applications/${app.appId}`} className="truncate text-[17px] font-medium hover:text-accent">
              {app.name}
            </Link>
            <Badge tone={app.active === false ? 'danger' : 'ok'}>{app.active === false ? 'Inativa' : 'Ativa'}</Badge>
            {app.googleAudience ? <Badge tone="accent">Google</Badge> : null}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-ink-muted">
            {app.description || 'Sem descrição interna.'}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-faint">
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              {origins.length ? `${origins.length} origin${origins.length === 1 ? '' : 's'}` : 'Sem origins'}
              {prod ? ' · produção' : origins.length ? ' · só local' : ''}
            </span>
            <span>Atualizada {relativeTime(app.updatedAt || app.createdAt)}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <QuickLink to={`/app/applications/${app.appId}?tab=auth`} icon={Shield} label="Auth" />
            <QuickLink to={`/app/applications/${app.appId}?tab=email`} icon={Mail} label="E-mail" />
            <QuickLink to={`/app/applications/${app.appId}?tab=credenciais`} icon={KeyRound} label="Credenciais" />
          </div>
        </div>
      </div>
    </article>
  )
}

function AppRow({ app }) {
  const origins = app.allowedOrigins || []
  return (
    <Link
      to={`/app/applications/${app.appId}`}
      className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-white/3"
    >
      <Avatar name={app.name} src={app.logoUrl} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{app.name}</span>
          <Badge tone={app.active === false ? 'danger' : 'ok'}>{app.active === false ? 'Inativa' : 'Ativa'}</Badge>
        </div>
        <div className="mt-0.5 truncate text-[11px] text-ink-faint">
          {origins.length ? `${origins.length} origins` : 'Sem origins'}
          {' · '}
          {relativeTime(app.updatedAt || app.createdAt)}
        </div>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-faint" />
    </Link>
  )
}

function QuickLink({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/3 px-2.5 py-1.5 text-xs text-ink-muted hover:border-line-strong hover:text-ink"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Link>
  )
}

function Shortcut({ to, icon: Icon, label, hint }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/4">
      <span className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-white/3 text-ink-muted">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-[11px] text-ink-faint">{hint}</span>
      </span>
      <ArrowUpRight className="h-3.5 w-3.5 text-ink-faint" />
    </Link>
  )
}

export function EmptyApps() {
  return (
    <EmptyState
      icon={AppWindow}
      title="Nenhuma aplicação ainda"
      description="Crie a primeira para receber appId, apiKey e apiSecret. O secret aparece uma única vez."
      action={
        <Link to="/app/applications/new">
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            Criar aplicação
          </Button>
        </Link>
      }
    />
  )
}
