import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { isLocalOrigin } from '../../lib/format'
import { Button } from '../ui/Button'

export function getSetupState(owner, applications = []) {
  const missingProd = applications.find(
    (app) => !(app.allowedOrigins || []).some((origin) => origin && !isLocalOrigin(origin)),
  )
  const withGoogle = applications.find((app) => app.googleAudience)
  const first = applications[0]

  const items = [
    {
      id: 'email',
      label: 'Verificar e-mail do owner',
      hint: 'Precisa estar verificado para o console e o reset de senha.',
      done: Boolean(owner?.email?.verified),
      to: '/app/account',
      cta: 'Abrir conta',
    },
    {
      id: 'app',
      label: 'Criar a primeira aplicação',
      hint: 'appId, apiKey e apiSecret saem na criação. O secret aparece uma vez.',
      done: applications.length > 0,
      to: '/app/applications/new',
      cta: 'Nova aplicação',
    },
    {
      id: 'origin',
      label: 'Liberar origin de produção',
      hint: 'Localhost não cobre o frontend publicado.',
      done: applications.some((app) => (app.allowedOrigins || []).some((origin) => origin && !isLocalOrigin(origin))),
      to: missingProd
        ? `/app/applications/${missingProd.appId}?tab=auth`
        : first
          ? `/app/applications/${first.appId}?tab=auth`
          : '/app/applications/new',
      cta: 'Configurar origins',
    },
    {
      id: 'google',
      label: 'Google Sign-In',
      hint: 'Audience do Client ID. Opcional.',
      done: Boolean(withGoogle),
      to: withGoogle
        ? `/app/applications/${withGoogle.appId}?tab=auth`
        : first
          ? `/app/applications/${first.appId}?tab=auth`
          : null,
      cta: 'Configurar Google',
      optional: true,
    },
  ]

  const required = items.filter((item) => !item.optional)
  const done = required.filter((item) => item.done).length
  const percent = Math.round((done / required.length) * 100)
  const next = items.find((item) => !item.done && !item.optional) || items.find((item) => !item.done)

  return { items, percent, next, complete: percent === 100 }
}

export function SetupChecklist({ owner, applications }) {
  const { items, percent, next, complete } = getSetupState(owner, applications)
  const remaining = items.filter((item) => !item.done)

  return (
    <div className="panel rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">Próximo passo</p>
          <h2 className="mt-1 text-[15px] font-medium">{complete ? 'Setup completo' : next?.label}</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            {complete ? 'O essencial da conta já está feito.' : next?.hint}
          </p>
        </div>
        <div className="font-mono text-sm text-accent">{percent}%</div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/6">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${percent}%` }} />
      </div>

      {complete ? (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-ok/20 bg-ok/8 px-3 py-2.5 text-sm text-ok">
          <CheckMark done />
          Pronto para produção
        </div>
      ) : (
        <>
          {next?.to ? (
            <Link to={next.to} className="mt-5 block">
              <Button className="w-full">{next.cta}</Button>
            </Link>
          ) : null}
          {remaining.length > 1 ? (
            <ul className="mt-4 space-y-1">
              {remaining.slice(1).map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.to || '/app'}
                    className="flex items-center gap-3 rounded-xl px-1 py-2 text-sm text-ink-muted hover:bg-white/4 hover:text-ink"
                  >
                    <CheckMark done={false} />
                    <span>
                      {item.label}
                      {item.optional ? <span className="ml-2 text-[11px] text-ink-faint">opcional</span> : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </div>
  )
}

function CheckMark({ done }) {
  return (
    <span
      className={cn(
        'grid h-5 w-5 shrink-0 place-items-center rounded-full border',
        done ? 'border-ok/40 bg-ok/15 text-ok' : 'border-line text-transparent',
      )}
    >
      <Check className="h-3 w-3" />
    </span>
  )
}
