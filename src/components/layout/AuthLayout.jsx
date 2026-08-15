import { Link } from 'react-router-dom'
import { Globe, KeyRound, ShieldCheck } from 'lucide-react'
import { Logo } from '../Logo'
import { cn } from '../../lib/cn'
import { API_HOST } from '../../lib/env'

const points = [
  { icon: ShieldCheck, text: 'Isolamento por appId, origins e papéis' },
  { icon: KeyRound, text: 'JWT curto, refresh rotacionado, corte de sessão' },
  { icon: Globe, text: 'Google JWKS, e-mail e CORS por aplicação' },
]

export function AuthLayout({ title, subtitle, switchTo, wide = false, progress, children }) {
  return (
    <div className="grid min-h-screen bg-bg lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden border-r border-line lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-12">
        <div className="pointer-events-none absolute inset-0 aurora" />
        <div className="pointer-events-none absolute inset-0 tech-grid opacity-70" />
        <div className="relative">
          <Logo size="lg" />
        </div>
        <div className="relative max-w-md">
          <p className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">Owner console</p>
          <h2 className="display mt-4 text-5xl leading-[0.95]">Identidade para as suas apps.</h2>
          <ul className="mt-10 space-y-4">
            {points.map((point) => (
              <li key={point.text} className="flex items-start gap-3 text-sm leading-6 text-ink-muted">
                <point.icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {point.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative font-mono text-[11px] text-ink-faint">MT ID · {API_HOST}</p>
      </aside>

      <main className="relative flex min-h-screen flex-col bg-bg-muted">
        <header className="flex h-16 items-center justify-between px-5 sm:px-8">
          <Logo className="lg:hidden" />
          {switchTo ? (
            <p className="ml-auto text-[13px] text-ink-muted">
              {switchTo.prompt}{' '}
              <Link to={switchTo.to} className="font-medium text-ink hover:text-accent">
                {switchTo.label}
              </Link>
            </p>
          ) : null}
        </header>
        <div className={cn('flex flex-1 justify-center px-5 py-10 sm:px-8', wide ? 'items-start' : 'items-center')}>
          <div className={cn('w-full', wide ? 'max-w-[520px]' : 'max-w-[440px]')}>
            <h1 className="display text-[40px]">{title}</h1>
            <p className="mt-2 text-[15px] leading-7 text-ink-muted">{subtitle}</p>
            {progress ? <div className="mt-6">{progress}</div> : null}
            <div className={cn(progress ? 'mt-6' : 'mt-8')}>{children}</div>
          </div>
        </div>
      </main>
    </div>
  )
}
