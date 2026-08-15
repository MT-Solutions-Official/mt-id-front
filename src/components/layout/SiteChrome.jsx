import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Drawer } from 'vaul'
import { Logo } from '../Logo'
import { Button } from '../ui/Button'
import { useAuth } from '../../lib/auth'
import { cn } from '../../lib/cn'
import { API_HOST } from '../../lib/env'

const nav = [
  { to: '/', label: 'Produto', end: true },
  { to: '/docs', label: 'Docs', match: 'docs' },
  { to: '/docs/quickstart', label: 'Quickstart', end: true },
]

const footerColumns = [
  {
    title: 'Produto',
    links: [
      { to: '/', label: 'Início' },
      { to: '/docs/architecture', label: 'Arquitetura' },
      { to: '/app', label: 'Console' },
    ],
  },
  {
    title: 'Documentação',
    links: [
      { to: '/docs', label: 'Visão geral' },
      { to: '/docs/quickstart', label: 'Quickstart' },
      { to: '/docs/routes', label: 'Índice de rotas' },
      { to: '/docs/user-auth', label: 'Login de users' },
      { to: '/docs/google', label: 'Google' },
      { to: '/docs/jwt', label: 'JWT e papéis' },
    ],
  },
]

function isNavActive(item, pathname) {
  if (item.match === 'docs') {
    return pathname === '/docs' || (pathname.startsWith('/docs/') && pathname !== '/docs/quickstart')
  }
  if (item.end) return pathname === item.to
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

function NavLinks({ onNavigate, mobile = false }) {
  const { pathname } = useLocation()

  return (
    <nav className={cn(mobile ? 'flex flex-col gap-1' : 'hidden items-center gap-6 md:flex')}>
      {nav.map((item) => {
        const active = isNavActive(item, pathname)
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={cn(
              'relative text-[13px] transition-colors',
              mobile ? 'rounded-lg px-3 py-2.5 text-[15px]' : 'px-1 py-1',
              active ? 'text-ink' : 'text-ink-muted hover:text-ink',
              mobile && active && 'bg-white/6',
            )}
          >
            {item.label}
            {!mobile && active ? <span className="absolute inset-x-1 -bottom-2 h-px bg-accent" /> : null}
          </NavLink>
        )
      })}
    </nav>
  )
}

function AuthActions({ compact = false, onNavigate }) {
  const { hasSession } = useAuth()

  if (hasSession) {
    return (
      <Link to="/app" onClick={onNavigate} className={compact ? 'w-full' : undefined}>
        <Button size={compact ? 'lg' : 'sm'} className={compact ? 'w-full' : undefined}>
          Console
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    )
  }

  return (
    <div className={cn('flex items-center gap-3', compact && 'w-full flex-col gap-2')}>
      <Link
        to="/login"
        onClick={onNavigate}
        className={cn(
          'text-[13px] text-ink-muted transition-colors hover:text-ink',
          compact && 'flex h-11 w-full items-center justify-center rounded-lg border border-line',
        )}
      >
        Entrar
      </Link>
      <Link to="/signup" onClick={onNavigate} className={compact ? 'w-full' : undefined}>
        <Button size={compact ? 'lg' : 'sm'} className={compact ? 'w-full' : undefined}>
          Começar
          {compact ? <ArrowUpRight className="h-3.5 w-3.5" /> : null}
        </Button>
      </Link>
    </div>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-bg/72 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-8">
          <Logo />
          <NavLinks />
        </div>

        <div className="hidden md:block">
          <AuthActions />
        </div>

        <Drawer.Root direction="right" open={open} onOpenChange={setOpen}>
          <Drawer.Trigger asChild>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-muted hover:text-ink md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-50 bg-black/55" />
            <Drawer.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(88vw,360px)] flex-col bg-bg-muted outline-none">
              <Drawer.Title className="sr-only">Navegação</Drawer.Title>
              <div className="flex h-16 items-center justify-between border-b border-line px-5">
                <Logo size="sm" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-muted hover:text-ink"
                  aria-label="Fechar menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-1 flex-col px-5 py-6">
                <NavLinks mobile onNavigate={() => setOpen(false)} />
                <div className="mt-auto border-t border-line pt-5">
                  <AuthActions compact onNavigate={() => setOpen(false)} />
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
      <div className="hairline" />
    </header>
  )
}

export function SiteFooter() {
  const { hasSession } = useAuth()
  const accountLinks = hasSession
    ? [{ to: '/app', label: 'Console' }]
    : [
        { to: '/login', label: 'Entrar' },
        { to: '/signup', label: 'Criar conta' },
      ]

  return (
    <footer>
      <div className="hairline" />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_0.9fr_0.7fr]">
        <div>
          <Logo size="sm" />
          <p className="mt-4 max-w-[26ch] text-sm leading-6 text-ink-muted">
            Identity provider para owners, applications e users.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <p className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-[13px] text-ink-muted transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">Conta</p>
          <ul className="mt-4 space-y-2.5">
            {accountLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-[13px] text-ink-muted transition-colors hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-[11px] tracking-wide text-ink-faint">MT ID · Identity provider</span>
          <span className="font-mono text-[11px] tracking-wide text-ink-faint">API · {API_HOST}</span>
        </div>
      </div>
    </footer>
  )
}
