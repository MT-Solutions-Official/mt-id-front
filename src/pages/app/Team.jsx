import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AppWindow, Eye, Mail, Pencil, Plus, Search, Trash2, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Callout, Dialog } from '../../components/ui/Dialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Avatar } from '../../components/ui/Avatar'
import { PageSkeleton } from '../../components/ui/Skeleton'
import { OwnerCreateForm, StepIndicator } from '../../components/auth/OwnerCreateForm'
import { apps } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { getErrorMessage } from '../../lib/errors'
import { appMembership, appRoleLabel, isAppWriter } from '../../lib/membership'
import { ownerPhoto } from '../../lib/format'
import { cn } from '../../lib/cn'

const ROLE_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'OWNER_WRITER', label: 'Writers' },
  { id: 'OWNER_VIEWER', label: 'Viewers' },
]

export function Team() {
  const { owner } = useAuth()
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(null)
  const [creating, setCreating] = useState(false)
  const [createStep, setCreateStep] = useState(1)
  const [addRole, setAddRole] = useState('OWNER_VIEWER')

  const appsQuery = useQuery({
    queryKey: ['apps'],
    queryFn: async () => (await apps.list()).data,
  })

  const applications = appsQuery.data || []
  const selectedId = params.get('app') || applications[0]?.appId
  const selected = applications.find((app) => app.appId === selectedId) || applications[0]
  const members = selected?.owners || []
  const canWrite = isAppWriter(selected, owner?.ownerId)
  const myRole = appMembership(selected, owner?.ownerId)?.role
  const writerCount = members.filter((item) => item.role === 'OWNER_WRITER').length
  const viewerCount = members.length - writerCount

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return [...members]
      .filter((item) => {
        if (roleFilter !== 'all' && item.role !== roleFilter) return false
        if (!term) return true
        return [item.name, item.email?.email, appRoleLabel(item.role)].join(' ').toLowerCase().includes(term)
      })
      .sort((left, right) => {
        if (left.ownerId === owner?.ownerId) return -1
        if (right.ownerId === owner?.ownerId) return 1
        const leftWriter = left.role === 'OWNER_WRITER' ? 0 : 1
        const rightWriter = right.role === 'OWNER_WRITER' ? 0 : 1
        if (leftWriter !== rightWriter) return leftWriter - rightWriter
        return (left.name || '').localeCompare(right.name || '', 'pt')
      })
  }, [members, owner?.ownerId, query, roleFilter])

  function selectApp(appId) {
    setParams({ app: appId }, { replace: true })
    setQuery('')
    setEmail('')
    setRoleFilter('all')
  }

  const addOwner = useMutation({
    mutationFn: (emails) => apps.addOwners({ appId: selected.appId, emails, role: addRole }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['apps'] })
      setEmail('')
      toast.success('Owner adicionado a esta app')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const updateRole = useMutation({
    mutationFn: ({ ownerId, role }) => apps.updateOwnerRole(selected.appId, ownerId, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['apps'] })
      toast.success('Papel atualizado nesta app')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const removeOwner = useMutation({
    mutationFn: (ownerId) => apps.removeOwner(selected.appId, ownerId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['apps'] })
      toast.success('Owner removido desta app')
      setPending(null)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  function onInvite(event) {
    event.preventDefault()
    if (!email.trim()) {
      toast.error('Informe o e-mail de um owner já cadastrado.')
      return
    }
    addOwner.mutate([email.trim()])
  }

  if (appsQuery.isLoading) return <PageSkeleton />

  if (applications.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          kicker="Organização"
          title="Time"
          description="Owners compartilham o console de uma aplicação. Writer e viewer são por app."
        />
        <EmptyState
          icon={AppWindow}
          title="Crie uma aplicação primeiro"
          description="O time nasce com a app. Quem você adicionar vê e edita só essa aplicação."
          action={
            <Link to="/app/applications/new">
              <Button>
                <Plus className="h-4 w-4" />
                Nova aplicação
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Organização"
        title="Time"
        description="Uma conta no MT ID, um papel em cada app. A mesma pessoa pode escrever numa e só ler em outra."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <AppRail applications={applications} selectedId={selected?.appId} ownerId={owner?.ownerId} onSelect={selectApp} />

        <div className="space-y-4">
          <section className="panel relative overflow-hidden rounded-2xl">
            <div className="pointer-events-none absolute inset-0 aurora opacity-40" />
            <div className="relative flex flex-wrap items-start justify-between gap-4 p-5 md:p-6">
              <div className="flex min-w-0 items-start gap-3">
                <Avatar name={selected.name} src={selected.logoUrl} size="lg" />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">Aplicação</p>
                  <h2 className="mt-1 truncate text-lg font-semibold tracking-tight">{selected.name}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone={canWrite ? 'accent' : 'default'}>Você · {appRoleLabel(myRole)}</Badge>
                    {selected.active === false ? <Badge tone="danger">Inativa</Badge> : null}
                  </div>
                </div>
              </div>
              <div className="flex gap-px overflow-hidden rounded-xl border border-line bg-line">
                <HeroStat label="Owners" value={members.length} />
                <HeroStat label="Writers" value={writerCount} />
                <HeroStat label="Viewers" value={viewerCount} />
              </div>
            </div>
          </section>

          {!canWrite ? (
            <Callout title="Você é viewer nesta app">
              Dá para ver o time. Convidar, mudar papel ou remover é de um writer desta aplicação.
            </Callout>
          ) : null}

          {canWrite ? (
            <form onSubmit={onInvite} className="panel rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Adicionar à {selected.name}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">Quem já tem conta no MT ID entra na hora. Senão, crie a conta.</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setCreateStep(1)
                    setCreating(true)
                  }}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Criar conta
                </Button>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="relative min-w-0 flex-1">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="owner@empresa.com"
                    autoComplete="off"
                    className="h-11 w-full rounded-xl border border-line bg-bg/60 pr-3 pl-10 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
                  />
                </label>
                <RoleSwitch value={addRole} onChange={setAddRole} />
                <Button type="submit" disabled={addOwner.isPending} className="sm:w-auto">
                  {addOwner.isPending ? 'Adicionando…' : 'Adicionar'}
                </Button>
              </div>
            </form>
          ) : null}

          <section className="panel overflow-hidden rounded-2xl">
            <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
              <label className="relative min-w-[180px] flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar nome ou e-mail"
                  className="h-9 w-full rounded-lg border border-line bg-bg/60 pr-3 pl-9 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
                />
              </label>
              <div className="flex rounded-lg border border-line p-0.5">
                {ROLE_FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRoleFilter(item.id)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs',
                      roleFilter === item.id ? 'bg-white/8 text-ink' : 'text-ink-muted hover:text-ink',
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {visible.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Users className="mx-auto h-5 w-5 text-ink-faint" />
                <p className="mt-3 text-sm text-ink-muted">
                  {members.length === 0
                    ? 'Ninguém nesta aplicação ainda.'
                    : 'Nenhum owner corresponde à busca.'}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {visible.map((item) => {
                  const self = item.ownerId === owner?.ownerId
                  const lastWriter = item.role === 'OWNER_WRITER' && writerCount <= 1
                  return (
                    <li
                      key={item.ownerId}
                      className={cn(
                        'flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between',
                        self && 'bg-accent/[0.04]',
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={item.name} src={ownerPhoto(item)} />
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            <p className="truncate text-sm font-medium">{item.name}</p>
                            {self ? <Badge tone="accent">Você</Badge> : null}
                            {item.active === false ? <Badge tone="danger">Inativo</Badge> : null}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-ink-faint">{item.email?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        {canWrite ? (
                          <RoleSwitch
                            value={item.role}
                            disabled={updateRole.isPending || lastWriter}
                            title={lastWriter ? 'Não dá para rebaixar o último writer' : undefined}
                            onChange={(role) => {
                              if (role === item.role) return
                              updateRole.mutate({ ownerId: item.ownerId, role })
                            }}
                          />
                        ) : (
                          <Badge tone={item.role === 'OWNER_WRITER' ? 'accent' : 'default'}>{appRoleLabel(item.role)}</Badge>
                        )}
                        {canWrite && !self ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 text-ink-faint hover:text-danger"
                            aria-label={`Remover ${item.name}`}
                            onClick={() => setPending(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="grid h-9 w-9 place-items-center" />
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </div>

      <Dialog
        open={creating}
        onOpenChange={(open) => {
          setCreating(open)
          if (!open) setCreateStep(1)
        }}
        title={createStep === 1 ? 'Nova conta' : 'Endereço'}
        description={
          createStep === 1
            ? `Cria o owner no MT ID e já coloca em ${selected.name}.`
            : 'No Brasil, complete o CEP e o número. Fora do Brasil, informe rua e número antes de buscar o código postal.'
        }
        className="max-h-[min(92vh,760px)]"
      >
        {creating ? (
          <>
            <div className="mb-5">
              <StepIndicator step={createStep} />
            </div>
            <OwnerCreateForm
              key="open"
              allowRole
              submitLabel="Criar e adicionar"
              onStepChange={setCreateStep}
              onCreated={async (created, appRole) => {
                const createdEmail = created?.email?.email
                if (createdEmail) {
                  await apps.addOwners({
                    appId: selected.appId,
                    emails: [createdEmail],
                    role: appRole || 'OWNER_VIEWER',
                  })
                }
                await queryClient.invalidateQueries({ queryKey: ['apps'] })
                toast.success(`Owner criado e adicionado a ${selected.name}.`)
                setCreating(false)
                setCreateStep(1)
              }}
            />
          </>
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
        title="Remover desta app?"
        description={
          pending
            ? `${pending.name} perde o acesso a ${selected.name}. A conta no MT ID continua existindo.`
            : ''
        }
        confirmLabel="Remover"
        loading={removeOwner.isPending}
        onConfirm={() => removeOwner.mutate(pending.ownerId)}
      />
    </div>
  )
}

function AppRail({ applications, selectedId, ownerId, onSelect }) {
  return (
    <aside className="lg:sticky lg:top-24">
      <p className="mb-2 hidden px-1 font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase lg:block">
        Apps
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {applications.map((app) => {
          const active = app.appId === selectedId
          const count = app.owners?.length || 0
          const role = appMembership(app, ownerId)?.role
          return (
            <button
              key={app.appId}
              type="button"
              onClick={() => onSelect(app.appId)}
              className={cn(
                'flex min-w-[200px] items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition lg:min-w-0',
                active
                  ? 'border-accent/35 bg-accent/10 text-ink'
                  : 'border-line bg-white/[0.02] text-ink-muted hover:border-line-strong hover:text-ink',
              )}
            >
              <Avatar name={app.name} src={app.logoUrl} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{app.name}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-faint">
                  <span>
                    {count} owner{count === 1 ? '' : 's'}
                  </span>
                  <span aria-hidden>·</span>
                  <span>{appRoleLabel(role)}</span>
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

function RoleSwitch({ value, onChange, disabled, title }) {
  return (
    <div
      title={title}
      className={cn('flex shrink-0 rounded-lg border border-line p-0.5', disabled && 'opacity-50')}
    >
      {[
        { id: 'OWNER_WRITER', label: 'Writer', icon: Pencil },
        { id: 'OWNER_VIEWER', label: 'Viewer', icon: Eye },
      ].map((item) => {
        const Icon = item.icon
        const selected = value === item.id
        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(item.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition',
              selected ? 'bg-white/10 text-ink' : 'text-ink-muted hover:text-ink',
              disabled && 'pointer-events-none',
            )}
          >
            <Icon className="h-3 w-3" />
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

function HeroStat({ label, value }) {
  return (
    <div className="min-w-[4.5rem] bg-bg/55 px-4 py-3">
      <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight">{value}</p>
    </div>
  )
}
