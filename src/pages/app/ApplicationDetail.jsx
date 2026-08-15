import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  KeyRound,
  Lock,
  Mail,
  Shield,
  SlidersHorizontal,
  Tags,
} from 'lucide-react'
import { apps, roles } from '../../lib/api'
import { isReservedRoleName, RESERVED_ROLE_NAMES } from '../../lib/constants'
import { getErrorMessage } from '../../lib/errors'
import { relativeTime } from '../../lib/format'
import { useAuth } from '../../lib/auth'
import { isAppWriter } from '../../lib/membership'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Callout, Dialog } from '../../components/ui/Dialog'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input, Textarea } from '../../components/ui/Input'
import { OriginEditor } from '../../components/OriginEditor'
import { CopyButton, CopyField } from '../../components/ui/CopyField'
import { FieldChips } from '../../components/ui/FieldChips'
import { Avatar } from '../../components/ui/Avatar'
import { PageSkeleton } from '../../components/ui/Skeleton'
import { FieldLabel, InfoTip } from '../../components/ui/InfoTip'
import { ownerHelp } from '../../content/ownerHelp'
import { EmailPreview } from '../../components/console/EmailPreview'
import { cn } from '../../lib/cn'

const TABS = [
  { id: 'geral', label: 'Geral', icon: SlidersHorizontal },
  { id: 'auth', label: 'Auth', icon: Shield },
  { id: 'email', label: 'E-mail', icon: Mail },
  { id: 'papeis', label: 'Papéis', icon: Tags },
  { id: 'credenciais', label: 'Credenciais', icon: KeyRound },
]

function formFromApp(app) {
  return {
    name: app.name || '',
    description: app.description || '',
    logoUrl: app.logoUrl || '',
    googleAudience: app.googleAudience || '',
    jwtExpirationInMinutes: app.jwtExpirationInMinutes || 15,
    refreshTokenExpirationInDays: app.refreshTokenExpirationInDays || 30,
    allowedOrigins: app.allowedOrigins?.length ? app.allowedOrigins : [''],
    requiredUserFields: app.requiredUserFields || [],
    fromName: app.emailSettings?.fromName || '',
    fromEmail: app.emailSettings?.fromEmail || '',
    replyTo: app.emailSettings?.replyTo || '',
    supportEmail: app.emailSettings?.supportEmail || '',
    supportUrl: app.emailSettings?.supportUrl || '',
    loginUrl: app.emailSettings?.loginUrl || '',
    verificationRedirectUrl: app.emailSettings?.verificationRedirectUrl || '',
    passwordResetRedirectUrl: app.emailSettings?.passwordResetRedirectUrl || '',
  }
}

export function ApplicationDetail() {
  const { appId } = useParams()
  const { owner } = useAuth()
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((item) => item.id === params.get('tab')) ? params.get('tab') : 'geral'
  const queryClient = useQueryClient()
  const [secret, setSecret] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [form, setForm] = useState(null)
  const [snapshot, setSnapshot] = useState(null)

  const appQuery = useQuery({
    queryKey: ['apps', appId],
    queryFn: async () => (await apps.get(appId)).data,
  })
  const rolesQuery = useQuery({
    queryKey: ['roles', appId],
    queryFn: async () => (await roles.list(appId)).data,
  })

  useEffect(() => {
    if (appQuery.data) {
      const next = formFromApp(appQuery.data)
      setForm(next)
      setSnapshot(next)
    }
  }, [appQuery.data])

  const dirty = useMemo(() => form && snapshot && JSON.stringify(form) !== JSON.stringify(snapshot), [form, snapshot])

  const save = useMutation({
    mutationFn: async () =>
      (
        await apps.update({
          appId,
          name: form.name,
          description: form.description,
          logoUrl: form.logoUrl,
          googleAudience: form.googleAudience,
          jwtExpirationInMinutes: Number(form.jwtExpirationInMinutes),
          refreshTokenExpirationInDays: Number(form.refreshTokenExpirationInDays),
          allowedOrigins: form.allowedOrigins.filter(Boolean),
          requiredUserFields: form.requiredUserFields,
          emailSettings: {
            fromName: form.fromName || undefined,
            fromEmail: form.fromEmail || undefined,
            replyTo: form.replyTo || undefined,
            supportEmail: form.supportEmail || undefined,
            supportUrl: form.supportUrl || undefined,
            loginUrl: form.loginUrl || undefined,
            verificationRedirectUrl: form.verificationRedirectUrl || undefined,
            passwordResetRedirectUrl: form.passwordResetRedirectUrl || undefined,
          },
        })
      ).data,
    onSuccess: (data) => {
      queryClient.setQueryData(['apps', appId], data)
      queryClient.invalidateQueries({ queryKey: ['apps'] })
      toast.success('Alterações salvas')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  if (params.get('tab') === 'equipe') {
    return <Navigate to={`/app/team?app=${appId}`} replace />
  }

  if (appQuery.isLoading || !form) return <PageSkeleton />
  if (appQuery.isError) {
    return (
      <div>
        <p className="text-sm text-danger">{getErrorMessage(appQuery.error)}</p>
        <Link to="/app/applications" className="mt-3 inline-block text-sm text-ink-muted hover:text-ink">
          Voltar às aplicações
        </Link>
      </div>
    )
  }

  const app = appQuery.data
  const originCount = (form.allowedOrigins || []).filter(Boolean).length
  const ownerCount = (app.owners || []).length
  const googleOn = Boolean(form.googleAudience?.trim())
  const canWrite = isAppWriter(app, owner?.ownerId)
  const locked = !canWrite

  function setField(key, value) {
    if (locked) return
    setForm((current) => ({ ...current, [key]: value }))
  }

  function setTab(id) {
    setParams(id === 'geral' ? {} : { tab: id }, { replace: true })
  }

  return (
    <div className="pb-28">
      <section className="panel relative overflow-hidden rounded-2xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-accent/10 to-transparent" />
        <div className="relative flex flex-wrap items-start justify-between gap-6 p-6">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar name={form.name || app.name} src={form.logoUrl || app.logoUrl} size="xl" />
            <div className="min-w-0">
              <p className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">Aplicação</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-semibold tracking-tight md:text-[28px]">{form.name || app.name}</h1>
                <Badge tone={app.active === false ? 'danger' : 'ok'}>{app.active === false ? 'Inativa' : 'Ativa'}</Badge>
              </div>
              <div className="mt-2 flex min-w-0 items-center gap-2">
                <span className="truncate font-mono text-xs text-ink-faint">{app.appId}</span>
                <CopyButton value={app.appId} label="appId" />
              </div>
              <p className="mt-2 text-xs text-ink-faint">
                Atualizada {relativeTime(app.updatedAt || app.createdAt)}
              </p>
            </div>
          </div>
          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-3">
            <HeroStat label="Origins" value={originCount || '0'} hint="CORS liberado" />
            <HeroStat
              label="Owners"
              value={ownerCount || '0'}
              hint="Abrir time"
              to={`/app/team?app=${appId}`}
            />
            <HeroStat label="Google" value={googleOn ? 'Ligado' : 'Off'} hint={googleOn ? 'OAuth ativo' : 'Sem audience'} />
          </div>
        </div>
      </section>

      <div className="mt-6 flex gap-1 overflow-x-auto rounded-2xl border border-line bg-white/[0.03] p-1">
        {TABS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition',
                tab === item.id ? 'bg-white/8 text-ink shadow-[0_0_0_1px_rgb(34_224_255_/_0.18)]' : 'text-ink-muted hover:text-ink',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          )
        })}
      </div>

      {!canWrite ? (
        <div className="mt-4">
          <Callout title="Você é viewer nesta app">
            Pode ver settings, time e papéis. Só um writer desta aplicação altera, rotaciona secret ou convida owners.
          </Callout>
        </div>
      ) : null}

      <div className="mt-8">
        {tab === 'geral' ? (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <Section
              kicker="Identidade"
              title="Dados da aplicação"
              description="Nome e logo aparecem no console. A descrição é só interna, para o time."
            >
              <Input label="Nome" info={ownerHelp.name} value={form.name} readOnly={locked} onChange={(e) => setField('name', e.target.value)} />
              <Textarea
                label="Descrição"
                info={ownerHelp.description}
                value={form.description}
                readOnly={locked}
                onChange={(e) => setField('description', e.target.value)}
              />
              <Input
                label="Logo URL"
                info={ownerHelp.logoUrl}
                value={form.logoUrl}
                readOnly={locked}
                onChange={(e) => setField('logoUrl', e.target.value)}
                hint="HTTPS público. Se a imagem falhar, usamos as iniciais."
              />
            </Section>
            <aside className="panel rounded-2xl p-5">
              <p className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">Prévia</p>
              <div className="mt-5 flex flex-col items-center text-center">
                <Avatar name={form.name || app.name} src={form.logoUrl} size="xl" />
                <h2 className="mt-4 w-full truncate text-[15px] font-medium">{form.name || 'Sem nome'}</h2>
                <p className="mt-1 line-clamp-3 text-sm text-ink-muted">
                  {form.description || 'A descrição aparece aqui quando você preencher.'}
                </p>
              </div>
            </aside>
          </div>
        ) : null}

        {tab === 'auth' ? (
          <div className="grid items-start gap-6 xl:grid-cols-2">
            <Section
              kicker="CORS"
              title="Allowed origins"
              description="Origins do seu frontend autorizados a chamar a API. Inclua localhost no dev e o domínio de produção."
              info={ownerHelp.origins}
              className="xl:col-span-2"
            >
              <OriginEditor value={form.allowedOrigins} readOnly={locked} onChange={(value) => setField('allowedOrigins', value)} />
            </Section>
            <Section
              kicker="Tokens"
              title="Expiração"
              description="Access curto e refresh longo: o user permanece logado sem reexpor a senha."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="JWT minutos"
                  info={ownerHelp.jwt}
                  type="number"
                  value={form.jwtExpirationInMinutes}
                  readOnly={locked}
                  disabled={locked}
                  onChange={(e) => setField('jwtExpirationInMinutes', e.target.value)}
                  hint="Padrão seguro: 15"
                />
                <Input
                  label="Refresh dias"
                  info={ownerHelp.refresh}
                  type="number"
                  value={form.refreshTokenExpirationInDays}
                  readOnly={locked}
                  disabled={locked}
                  onChange={(e) => setField('refreshTokenExpirationInDays', e.target.value)}
                  hint="Padrão: 30"
                />
              </div>
            </Section>
            <Section
              kicker="Google"
              title="Sign-In"
              description="Vazio desliga o Google nesta app. O idToken do frontend precisa ser emitido para este Client ID."
              info={ownerHelp.google}
            >
              <Input
                label="Google audience"
                info={ownerHelp.google}
                value={form.googleAudience}
                readOnly={locked}
                onChange={(e) => setField('googleAudience', e.target.value)}
                placeholder="….apps.googleusercontent.com"
              />
            </Section>
            <Section
              kicker="Cadastro"
              title="Campos obrigatórios"
              description="Sem um campo marcado, o create (e o google-token, exceto senha) responde 400."
              info={ownerHelp.requiredFields}
              className="xl:col-span-2"
            >
              <FieldChips
                value={form.requiredUserFields}
                readOnly={locked}
                onToggle={(id) =>
                  setForm((current) => {
                    if (locked) return current
                    return {
                      ...current,
                      requiredUserFields: current.requiredUserFields.includes(id)
                        ? current.requiredUserFields.filter((item) => item !== id)
                        : [...current.requiredUserFields, id],
                    }
                  })
                }
              />
            </Section>
          </div>
        ) : null}

        {tab === 'email' ? (
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
            <div className="space-y-6">
              <Section kicker="Remetente" title="Identidade do e-mail" description="O SMTP continua sendo o do MT ID. Isto é o que o user vê.">
                <Input label="From name" info={ownerHelp.fromName} value={form.fromName} readOnly={locked} onChange={(e) => setField('fromName', e.target.value)} />
                <Input label="From email (display)" info={ownerHelp.fromEmail} value={form.fromEmail} readOnly={locked} onChange={(e) => setField('fromEmail', e.target.value)} />
                <Input label="Reply-to" info={ownerHelp.replyTo} value={form.replyTo} readOnly={locked} onChange={(e) => setField('replyTo', e.target.value)} />
              </Section>
              <Section kicker="Suporte" title="Contato" description="Citado nos e-mails transacionais.">
                <Input label="Support email" info={ownerHelp.supportEmail} value={form.supportEmail} readOnly={locked} onChange={(e) => setField('supportEmail', e.target.value)} />
                <Input label="Support URL" info={ownerHelp.supportUrl} value={form.supportUrl} readOnly={locked} onChange={(e) => setField('supportUrl', e.target.value)} />
              </Section>
              <Section kicker="Redirects" title="Destinos" description="Precisam casar com allowed origins. Vazio usa as páginas internas do MT ID.">
                <Input label="Login URL" info={ownerHelp.loginUrl} value={form.loginUrl} readOnly={locked} onChange={(e) => setField('loginUrl', e.target.value)} />
                <Input
                  label="Verification redirect"
                  info={ownerHelp.verificationRedirect}
                  value={form.verificationRedirectUrl}
                  readOnly={locked}
                  onChange={(e) => setField('verificationRedirectUrl', e.target.value)}
                />
                <Input
                  label="Password reset redirect"
                  info={ownerHelp.passwordResetRedirect}
                  value={form.passwordResetRedirectUrl}
                  readOnly={locked}
                  onChange={(e) => setField('passwordResetRedirectUrl', e.target.value)}
                />
              </Section>
            </div>
            <EmailPreview
              appName={form.name}
              logoUrl={form.logoUrl}
              settings={form}
              origins={form.allowedOrigins}
            />
          </div>
        ) : null}

        {tab === 'papeis' ? <RolesPanel appId={appId} items={rolesQuery.data || []} canWrite={canWrite} /> : null}

        {tab === 'credenciais' ? (
          <div className="space-y-6">
            <Section
              kicker="API"
              title="Chaves da aplicação"
              description="appId é público. apiKey e apiSecret ficam no servidor — nunca no frontend nem no Git."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <CopyField label="appId" value={app.appId} info={ownerHelp.appId} />
                <CopyField label="apiKey" value={app.apiKey} info={ownerHelp.apiKey} />
              </div>
              <div className="rounded-xl border border-line bg-bg/40 px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <FieldLabel info={ownerHelp.apiSecret} className="text-[11px] tracking-[0.16em] text-ink-faint uppercase">
                      apiSecret
                    </FieldLabel>
                    <p className="mt-1.5 max-w-lg text-sm leading-6 text-ink-muted">
                      Não fica armazenado em texto. Rotacione se perdeu o original — o valor anterior deixa de valer na hora.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {canWrite ? (
                      <Button type="button" variant="secondary" onClick={() => setConfirm('rotate')}>
                        Rotacionar secret
                      </Button>
                    ) : null}
                    <InfoTip text={ownerHelp.rotateSecret} />
                  </div>
                </div>
              </div>
            </Section>
            <section className="rounded-2xl border border-danger/25 bg-danger/[0.06] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.18em] text-danger/80 uppercase">Zona de risco</p>
                  <h2 className="mt-1 text-[15px] font-medium">Estado da aplicação</h2>
                  <p className="mt-1.5 max-w-xl text-sm leading-6 text-ink-muted">
                    App inativa rejeita login de user e tokens da aplicação. Os dados permanecem; é uma pausa, não uma exclusão.
                  </p>
                </div>
                {canWrite ? (
                  <Button
                    type="button"
                    variant={app.active === false ? 'primary' : 'danger'}
                    onClick={() => setConfirm(app.active === false ? 'enable' : 'disable')}
                  >
                    {app.active === false ? 'Ativar app' : 'Desativar app'}
                  </Button>
                ) : (
                  <Badge tone={app.active === false ? 'danger' : 'ok'}>
                    {app.active === false ? 'Inativa' : 'Ativa'}
                  </Badge>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </div>

      {dirty && canWrite ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/90 backdrop-blur-xl lg:left-60">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
            <div>
              <p className="text-sm font-medium">Alterações não salvas</p>
              <p className="text-xs text-ink-faint">Descartar volta ao último estado persistido.</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setForm(snapshot)}>
                Descartar
              </Button>
              <Button type="button" disabled={save.isPending} onClick={() => save.mutate()}>
                {save.isPending ? 'Salvando…' : 'Salvar alterações'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={Boolean(secret)} onOpenChange={() => setSecret(null)} title="Novo apiSecret">
        <Callout title="Última chance" tone="danger">
          Copie agora. O valor anterior deixa de valer.
        </Callout>
        <div className="mt-4">
          <CopyField label="apiSecret" value={secret?.apiSecret} secret />
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirm === 'rotate'}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Rotacionar apiSecret?"
        description="O secret atual deixa de funcionar imediatamente em todos os servidores que o usam."
        confirmLabel="Rotacionar"
        onConfirm={async () => {
          try {
            const { data } = await apps.rotateSecret(appId)
            setSecret(data)
            setConfirm(null)
            toast.success('Secret rotacionado')
          } catch (error) {
            toast.error(getErrorMessage(error))
          }
        }}
      />
      <ConfirmDialog
        open={confirm === 'disable'}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Desativar aplicação?"
        description="Users desta app não conseguem autenticar enquanto ela estiver inativa."
        confirmLabel="Desativar"
        onConfirm={async () => {
          try {
            const { data } = await apps.disable(appId)
            queryClient.setQueryData(['apps', appId], data)
            setConfirm(null)
            toast.success('App desativada')
          } catch (error) {
            toast.error(getErrorMessage(error))
          }
        }}
      />
      <ConfirmDialog
        open={confirm === 'enable'}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Ativar aplicação?"
        description="A app volta a aceitar autenticação."
        confirmLabel="Ativar"
        tone="primary"
        onConfirm={async () => {
          try {
            const { data } = await apps.enable(appId)
            queryClient.setQueryData(['apps', appId], data)
            setConfirm(null)
            toast.success('App ativada')
          } catch (error) {
            toast.error(getErrorMessage(error))
          }
        }}
      />
    </div>
  )
}

function HeroStat({ label, value, hint, to }) {
  const body = (
    <>
      <div className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">{label}</div>
      <div className="mt-1 text-lg font-semibold tracking-tight">{value}</div>
      {hint ? <div className="mt-0.5 text-[11px] text-ink-faint">{hint}</div> : null}
    </>
  )
  const className = 'min-w-[112px] rounded-xl border border-line bg-bg/40 px-3.5 py-3'
  if (to) {
    return (
      <Link to={to} className={cn(className, 'transition hover:border-line-strong hover:bg-white/4')}>
        {body}
      </Link>
    )
  }
  return <div className={className}>{body}</div>
}

function Section({ kicker, title, description, info, children, className }) {
  return (
    <section className={cn('panel rounded-2xl p-6', className)}>
      <div className="mb-5">
        {kicker ? <p className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">{kicker}</p> : null}
        <FieldLabel info={info} className="mt-1 text-[15px] font-medium">
          {title}
        </FieldLabel>
        {description ? <p className="mt-1.5 text-sm leading-6 text-ink-muted">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function RolesPanel({ appId, items, canWrite }) {
  const queryClient = useQueryClient()
  const [roleName, setRoleName] = useState('')

  async function onCreate() {
    const name = roleName.trim()
    if (!name) {
      toast.error('Informe o nome do papel.')
      return
    }
    if (isReservedRoleName(name)) {
      toast.error(
        name.toUpperCase() === 'USER'
          ? 'USER já é o papel do IdP. Todo user autenticado recebe isso no JWT — crie papéis da sua app, como ADMIN.'
          : `${name.toUpperCase()} é reservado do IdP. Use um nome da sua app, como ADMIN.`,
      )
      return
    }
    try {
      await roles.create(appId, name)
      setRoleName('')
      await queryClient.invalidateQueries({ queryKey: ['roles', appId] })
      toast.success('Papel criado')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="space-y-6">
      <Section
        kicker="Autorização"
        title="Papéis da app"
        description="Entram no JWT do user em groups, junto com USER, e no claim roles. USER já é automático."
        info={ownerHelp.roles}
      >
        <Callout title="USER já existe">
          Todo access token de user já leva <span className="font-mono text-ink">USER</span> em{' '}
          <span className="font-mono text-ink">groups</span>. Aqui você só cria papéis da sua app (ADMIN, BILLING…).
          Reservados: {RESERVED_ROLE_NAMES.join(', ')}.
        </Callout>
        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                <Lock className="h-3.5 w-3.5" />
              </span>
              <div>
                <div className="font-mono text-sm">USER</div>
                <div className="text-[11px] text-ink-faint">Papel do IdP · não pode remover</div>
              </div>
            </div>
            <Badge tone="accent">Sistema</Badge>
          </div>
          {items.map((role) => (
            <div key={role.userRoleId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-white/3 text-ink-muted">
                  <Tags className="h-3.5 w-3.5" />
                </span>
                <div className="font-mono text-sm">{role.roleName}</div>
              </div>
              {canWrite ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    try {
                      await roles.remove(role.userRoleId)
                      await queryClient.invalidateQueries({ queryKey: ['roles', appId] })
                    } catch (error) {
                      toast.error(getErrorMessage(error))
                    }
                  }}
                >
                  Remover
                </Button>
              ) : null}
            </div>
          ))}
        </div>
        {canWrite ? (
          <div className="flex gap-2 border-t border-line pt-4">
            <Input
              label="Novo papel"
              info={ownerHelp.roleName}
              placeholder="ADMIN"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  onCreate()
                }
              }}
            />
            <Button type="button" variant="secondary" className="self-end" onClick={onCreate}>
              Criar
            </Button>
          </div>
        ) : null}
      </Section>
    </div>
  )
}
