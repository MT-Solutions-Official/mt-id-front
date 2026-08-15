import { useEffect, useState } from 'react'
import { API_URL } from '../../lib/api'
import { cn } from '../../lib/cn'

const KINDS = [
  {
    id: 'verify',
    label: 'Verificação',
    subject: 'Confirme seu e-mail',
    title: 'Confirme seu e-mail',
    actionText: 'Confirmar e-mail',
    primary: 'Para ativar sua conta, confirme que este endereço de e-mail é seu.',
    secondary: 'Este link expira em breve. Se você não criou uma conta, ignore este e-mail.',
    accent: '#4F46E5',
    badge: 'Verificação',
    urlField: 'verificationRedirectUrl',
    fallback: `${API_URL}/api/v1/email/users/verify`,
    withToken: true,
  },
  {
    id: 'reset',
    label: 'Reset de senha',
    subject: 'Redefinição de senha',
    title: 'Redefinir sua senha',
    actionText: 'Redefinir senha',
    primary: 'Recebemos um pedido para redefinir a senha da sua conta.',
    secondary: 'O link é válido por pouco tempo. Se você não fez esta solicitação, nenhuma ação é necessária.',
    accent: '#C2410C',
    badge: 'Segurança',
    urlField: 'passwordResetRedirectUrl',
    fallback: `${API_URL}/api/v1/email/users/reset-password`,
    withToken: true,
  },
  {
    id: 'changed',
    label: 'Senha alterada',
    subject: 'Sua senha foi alterada',
    title: 'Senha atualizada',
    actionText: 'Acessar conta',
    primary: 'A senha da sua conta foi alterada com sucesso.',
    secondary: 'Se não foi você, redefina a senha imediatamente e fale com o suporte.',
    accent: '#047857',
    badge: 'Alerta',
    urlField: 'loginUrl',
    fallback: null,
    withToken: false,
    changedAt: true,
  },
]

function originOf(url) {
  try {
    const parsed = new URL(url.trim())
    return `${parsed.protocol}//${parsed.host}`
  } catch {
    return null
  }
}

function resolveActionUrl(kind, settings, origins) {
  const configured = settings[kind.urlField]?.trim()
  const originList = (origins || []).map((item) => item.replace(/\/$/, '')).filter(Boolean)
  const allowed = (url) => {
    const origin = originOf(url)
    if (!origin) return false
    if (!originList.length) return true
    return originList.some((item) => item.toLowerCase() === origin.toLowerCase())
  }

  if (configured && allowed(configured)) {
    return { url: kind.withToken ? `${configured}${configured.includes('?') ? '&' : '?'}token=••••` : configured, source: 'redirect' }
  }

  if (kind.id === 'changed') {
    const first = originList[0]
    if (first) return { url: first, source: 'origin' }
  }

  const fallback = kind.fallback || `${API_URL}/api/v1/email/users/verify`
  return {
    url: kind.withToken ? `${fallback}?token=••••` : fallback,
    source: configured ? 'blocked' : 'internal',
  }
}

export function EmailPreview({ appName, logoUrl, settings, origins }) {
  const [kindId, setKindId] = useState('verify')
  const [logoFailed, setLogoFailed] = useState(false)

  useEffect(() => {
    setLogoFailed(false)
  }, [logoUrl])
  const kind = KINDS.find((item) => item.id === kindId)
  const name = appName?.trim() || 'Sua aplicação'
  const fromName = settings.fromName?.trim() || name
  const fromAddress = settings.fromEmail?.trim() || 'no-reply@mt-id.com'
  const replyTo = settings.replyTo?.trim() || settings.supportEmail?.trim()
  const action = resolveActionUrl(kind, settings, origins)
  const changedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date())

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-medium">Simulação para o user</h2>
          <p className="mt-0.5 text-xs text-ink-faint">Mesmo template HTML que o MT ID envia. Atualiza enquanto você edita.</p>
        </div>
        <div className="flex rounded-xl border border-line p-1">
          {KINDS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setKindId(item.id)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-[11px]',
                kindId === item.id ? 'bg-white/8 text-ink' : 'text-ink-muted hover:text-ink',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-[#eef1f6]">
        <div className="border-b border-black/5 bg-white px-4 py-3 text-[12px] text-slate-600">
          <div className="flex gap-2">
            <span className="w-16 shrink-0 text-slate-400">De</span>
            <span className="min-w-0 truncate font-medium text-slate-900">
              {fromName} <span className="font-normal text-slate-500">&lt;{fromAddress}&gt;</span>
            </span>
          </div>
          <div className="mt-1 flex gap-2">
            <span className="w-16 shrink-0 text-slate-400">Para</span>
            <span>Ana Silva &lt;ana@exemplo.com&gt;</span>
          </div>
          {replyTo ? (
            <div className="mt-1 flex gap-2">
              <span className="w-16 shrink-0 text-slate-400">Reply</span>
              <span className="truncate">{replyTo}</span>
            </div>
          ) : null}
          <div className="mt-1 flex gap-2">
            <span className="w-16 shrink-0 text-slate-400">Assunto</span>
            <span className="font-medium text-slate-900">{kind.subject}</span>
          </div>
        </div>

        <div className="px-3 py-6 sm:px-6">
          <div className="mx-auto max-w-[560px]">
            <div className="mb-5 text-center">
              {logoUrl && !logoFailed ? (
                <img
                  src={logoUrl}
                  alt=""
                  className="mx-auto inline-block max-h-10 max-w-[180px] object-contain"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <div className="text-[18px] font-bold tracking-wide text-slate-900">{name}</div>
              )}
            </div>
            <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_18px_45px_rgba(15,23,42,.08)]">
              <div className="h-1.5" style={{ background: kind.accent }} />
              <div className="px-7 pt-9 pb-3">
                <div
                  className="inline-block rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] uppercase"
                  style={{ color: kind.accent }}
                >
                  {kind.badge}
                </div>
                <h3 className="mt-4 text-[28px] leading-8 font-semibold tracking-tight text-slate-900">{kind.title}</h3>
              </div>
              <div className="px-7 py-2">
                <p className="m-0 mb-3.5 text-base leading-6 text-slate-700">Olá Ana,</p>
                <p className="m-0 mb-3.5 text-base leading-7 text-slate-700">{kind.primary}</p>
                <p className="m-0 text-[15px] leading-7 text-slate-500">{kind.secondary}</p>
              </div>
              {kind.changedAt ? (
                <div className="px-7 pt-2">
                  <div className="rounded-xl bg-slate-50 px-3.5 py-3 text-[13px] text-slate-600">
                    Alteração registrada em <strong className="text-slate-900">{changedAt}</strong>
                  </div>
                </div>
              ) : null}
              <div className="px-7 pt-7 pb-3 text-center">
                <span
                  className="inline-block rounded-xl px-7 py-3.5 text-[15px] font-bold text-white"
                  style={{ background: kind.accent }}
                >
                  {kind.actionText}
                </span>
              </div>
              <div className="px-7 pb-7">
                <p className="m-0 text-[12px] leading-6 break-all text-slate-400">
                  Se o botão não funcionar, copie e cole este link no navegador:
                  <br />
                  <span style={{ color: kind.accent }}>{action.url}</span>
                </p>
              </div>
              <div className="border-t border-slate-200 px-7 pt-5 pb-8">
                <p className="m-0 text-[12px] leading-6 text-slate-400">
                  Este é um e-mail automático de {name}. Não responda esta mensagem.
                </p>
                {settings.supportEmail?.trim() ? (
                  <p className="mt-2 m-0 text-[12px] leading-6 text-slate-600">
                    Suporte: <span style={{ color: kind.accent }}>{settings.supportEmail.trim()}</span>
                  </p>
                ) : null}
                {settings.supportUrl?.trim() ? (
                  <p className="mt-1 m-0 text-[12px] leading-6">
                    <span style={{ color: kind.accent }}>{settings.supportUrl.trim()}</span>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-ink-faint">
        {action.source === 'redirect'
          ? 'O botão aponta para o redirect que você configurou (com token).'
          : action.source === 'blocked'
            ? 'Este redirect não está em allowed origins. O MT ID cai na página HTML interna.'
            : action.source === 'origin'
              ? 'Sem login URL válida, o alerta usa o primeiro allowed origin.'
              : 'Sem redirect válido, o user cai na página HTML interna do MT ID.'}{' '}
        O endereço SMTP real continua sendo o do MT ID; from name é o que aparece na caixa de entrada.
      </p>
    </div>
  )
}
