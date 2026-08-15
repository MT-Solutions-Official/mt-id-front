import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { Callout, Dialog } from '../../components/ui/Dialog'
import { CopyField } from '../../components/ui/CopyField'
import { copyText } from '../../lib/clipboard'
import { FieldChips } from '../../components/ui/FieldChips'
import { PageHeader } from '../../components/ui/PageHeader'
import { Avatar } from '../../components/ui/Avatar'
import { apps } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { getErrorMessage } from '../../lib/errors'
import { OriginEditor } from '../../components/OriginEditor'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '../../lib/cn'
import { ownerHelp } from '../../content/ownerHelp'
import { FieldLabel } from '../../components/ui/InfoTip'
import { EmailPreview } from '../../components/console/EmailPreview'

const STEPS = [
  { id: 'identity', label: 'Identidade' },
  { id: 'access', label: 'Acesso' },
  { id: 'comms', label: 'Comunicação' },
]

export function NewApplication() {
  const { owner } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [secret, setSecret] = useState(null)
  const [origins, setOrigins] = useState(['http://localhost:5173'])
  const [fields, setFields] = useState(['NAME', 'EMAIL', 'PASSWORD'])
  const [form, setForm] = useState({
    name: '',
    description: '',
    logoUrl: '',
    googleAudience: '',
    jwtExpirationInMinutes: 15,
    refreshTokenExpirationInDays: 30,
    fromName: '',
    loginUrl: '',
    verificationRedirectUrl: '',
    passwordResetRedirectUrl: '',
  })

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function toggleField(id) {
    setFields((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  async function onSubmit(event) {
    event.preventDefault()
    if (step < STEPS.length - 1) {
      if (step === 0 && !form.name.trim()) {
        toast.error('Dê um nome à aplicação.')
        return
      }
      setStep((current) => current + 1)
      return
    }
    setLoading(true)
    try {
      const { data } = await apps.create({
        name: form.name,
        ownerId: owner.ownerId,
        description: form.description || undefined,
        logoUrl: form.logoUrl || undefined,
        jwtExpirationInMinutes: Number(form.jwtExpirationInMinutes),
        refreshTokenExpirationInDays: Number(form.refreshTokenExpirationInDays),
        allowedOrigins: origins.filter(Boolean),
        googleAudience: form.googleAudience || undefined,
        requiredUserFields: fields,
        emailSettings: {
          fromName: form.fromName || undefined,
          loginUrl: form.loginUrl || undefined,
          verificationRedirectUrl: form.verificationRedirectUrl || undefined,
          passwordResetRedirectUrl: form.passwordResetRedirectUrl || undefined,
        },
      })
      await queryClient.invalidateQueries({ queryKey: ['apps'] })
      setSecret(data)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('mx-auto', step === 2 ? 'max-w-5xl' : 'max-w-2xl')}>
      <PageHeader
        kicker="Aplicações"
        title="Nova aplicação"
        description="O apiSecret aparece uma única vez depois de criar. Guarde fora do Git, só no servidor."
      />

      <ol className="mt-8 mb-8 grid grid-cols-3 gap-2">
        {STEPS.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => index < step && setStep(index)}
              className={cn(
                'flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs',
                index === step
                  ? 'border-accent/40 bg-accent/10 text-ink'
                  : index < step
                    ? 'border-line text-ink'
                    : 'border-line text-ink-faint',
              )}
            >
              <span
                className={cn(
                  'grid h-5 w-5 place-items-center rounded-full font-mono text-[10px]',
                  index <= step ? 'bg-accent text-accent-fg' : 'bg-white/6',
                )}
              >
                {index < step ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              {item.label}
            </button>
          </li>
        ))}
      </ol>

      <form onSubmit={onSubmit} className="space-y-6">
        {step === 0 ? (
          <div className="panel space-y-4 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <Avatar name={form.name || 'App'} src={form.logoUrl} size="lg" />
              <p className="text-sm text-ink-muted">Nome visível no console. Logo é opcional.</p>
            </div>
            <Input label="Nome" info={ownerHelp.name} value={form.name} onChange={(e) => setField('name', e.target.value)} required />
            <Textarea
              label="Descrição"
              info={ownerHelp.description}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="O que esta app autentica"
            />
            <Input
              label="Logo URL"
              info={ownerHelp.logoUrl}
              value={form.logoUrl}
              onChange={(e) => setField('logoUrl', e.target.value)}
            />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-6">
            <div className="panel space-y-4 rounded-2xl p-5">
              <FieldLabel info={ownerHelp.origins} className="text-[15px] font-medium">
                Allowed origins
              </FieldLabel>
              <OriginEditor value={origins} onChange={setOrigins} />
            </div>
            <div className="panel space-y-4 rounded-2xl p-5">
              <h2 className="text-[15px] font-medium">Tokens</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="JWT access (minutos)"
                  info={ownerHelp.jwt}
                  type="number"
                  min="1"
                  value={form.jwtExpirationInMinutes}
                  onChange={(e) => setField('jwtExpirationInMinutes', e.target.value)}
                />
                <Input
                  label="Refresh (dias)"
                  info={ownerHelp.refresh}
                  type="number"
                  min="1"
                  value={form.refreshTokenExpirationInDays}
                  onChange={(e) => setField('refreshTokenExpirationInDays', e.target.value)}
                />
              </div>
              <Input
                label="Google audience (Client ID)"
                info={ownerHelp.google}
                value={form.googleAudience}
                onChange={(e) => setField('googleAudience', e.target.value)}
              />
            </div>
            <div className="panel space-y-3 rounded-2xl p-5">
              <FieldLabel info={ownerHelp.requiredFields} className="text-[15px] font-medium">
                Campos obrigatórios no cadastro
              </FieldLabel>
              <FieldChips value={fields} onToggle={toggleField} />
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-6">
            <div className="panel space-y-4 rounded-2xl p-5">
              <Callout title="Pode pular">
                Sem URLs, o MT ID usa as páginas HTML internas de verificação e reset.
              </Callout>
              <Input label="From name" info={ownerHelp.fromName} value={form.fromName} onChange={(e) => setField('fromName', e.target.value)} />
              <Input label="Login URL" info={ownerHelp.loginUrl} value={form.loginUrl} onChange={(e) => setField('loginUrl', e.target.value)} />
              <Input
                label="Verification redirect"
                info={ownerHelp.verificationRedirect}
                value={form.verificationRedirectUrl}
                onChange={(e) => setField('verificationRedirectUrl', e.target.value)}
              />
              <Input
                label="Password reset redirect"
                info={ownerHelp.passwordResetRedirect}
                value={form.passwordResetRedirectUrl}
                onChange={(e) => setField('passwordResetRedirectUrl', e.target.value)}
              />
            </div>
            <EmailPreview
              appName={form.name}
              logoUrl={form.logoUrl}
              settings={form}
              origins={origins}
            />
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Criando…' : step < STEPS.length - 1 ? 'Continuar' : 'Criar aplicação'}
            {step < STEPS.length - 1 ? <ChevronRight className="h-4 w-4" /> : null}
          </Button>
        </div>
      </form>

      <Dialog
        open={Boolean(secret)}
        onOpenChange={(open) => {
          if (!open && secret) navigate(`/app/applications/${secret.appId}`)
        }}
        title="Guarde o apiSecret agora"
        description="Ele não será exibido de novo. Use só no servidor da sua aplicação."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() =>
                copyText(
                  `appId=${secret.appId}\napiKey=${secret.apiKey}\napiSecret=${secret.apiSecret}`,
                  'Credenciais',
                )
              }
            >
              Copiar tudo
            </Button>
            <Button onClick={() => navigate(`/app/applications/${secret.appId}`)}>Ir para a aplicação</Button>
          </>
        }
      >
        <Callout title="Não commite isso" tone="danger">
          apiSecret não volta a aparecer. Rotacione depois se perder.
        </Callout>
        <div className="mt-4 space-y-3">
          <CopyField label="appId" value={secret?.appId} info={ownerHelp.appId} />
          <CopyField label="apiKey" value={secret?.apiKey} info={ownerHelp.apiKey} />
          <CopyField label="apiSecret" value={secret?.apiSecret} secret info={ownerHelp.apiSecret} />
        </div>
      </Dialog>
    </div>
  )
}
