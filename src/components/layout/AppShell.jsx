import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AppWindow, BookOpen, CircleUserRound, LayoutDashboard, Menu, Plus, Search, Users } from 'lucide-react'
import { Drawer } from 'vaul'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Logo } from '../Logo'
import { Button } from '../ui/Button'
import { TooltipProvider } from '../ui/Tooltip'
import { CommandPalette, useCommandPalette } from '../console/CommandPalette'
import { Breadcrumbs } from '../console/Breadcrumbs'
import { UserMenu } from '../console/UserMenu'
import { cn } from '../../lib/cn'

const nav = [
  { to: '/app', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/app/applications', label: 'Aplicações', icon: AppWindow },
  { to: '/app/team', label: 'Time', icon: Users },
  { to: '/app/account', label: 'Conta', icon: CircleUserRound },
]

function NavItems({ onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-3">
      <p className="px-2 pt-2 pb-1 font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">Workspace</p>
      {nav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-ink-muted transition hover:bg-white/4 hover:text-ink',
              isActive && 'bg-white/6 text-ink shadow-[inset_2px_0_0_0_var(--color-accent)]',
            )
          }
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
      <p className="mt-5 px-2 pt-2 pb-1 font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">Recursos</p>
      <NavLink
        to="/docs"
        onClick={onNavigate}
        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-ink-muted hover:bg-white/4 hover:text-ink"
      >
        <BookOpen className="h-4 w-4" />
        Docs
      </NavLink>
    </nav>
  )
}

function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-5">
        <Logo size="sm" to="/app" />
        <span className="ml-2 rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
          Console
        </span>
      </div>
      <NavItems onNavigate={onNavigate} />
      <div className="mt-auto border-t border-line p-3">
        <UserMenu />
      </div>
    </div>
  )
}

export function AppShell() {
  const location = useLocation()
  const { open, setOpen } = useCommandPalette()
  const [drawer, setDrawer] = useState(false)

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-bg">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-line bg-bg-muted lg:flex lg:flex-col">
          <Sidebar />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-xl">
            <div className="flex h-14 items-center gap-3 px-4 md:px-6">
              <Drawer.Root direction="left" open={drawer} onOpenChange={setDrawer}>
                <Drawer.Trigger asChild>
                  <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-line lg:hidden" aria-label="Abrir menu">
                    <Menu className="h-4 w-4" />
                  </button>
                </Drawer.Trigger>
                <Drawer.Portal>
                  <Drawer.Overlay className="fixed inset-0 z-40 bg-black/50" />
                  <Drawer.Content className="fixed inset-y-0 left-0 z-50 w-72 outline-none">
                    <Drawer.Title className="sr-only">Menu do console</Drawer.Title>
                    <div className="h-full border-r border-line bg-bg-muted">
                      <Sidebar onNavigate={() => setDrawer(false)} />
                    </div>
                  </Drawer.Content>
                </Drawer.Portal>
              </Drawer.Root>

              <Breadcrumbs />

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="hidden h-9 items-center gap-2 rounded-lg border border-line bg-white/3 px-3 text-[13px] text-ink-muted hover:text-ink sm:inline-flex"
                >
                  <Search className="h-3.5 w-3.5" />
                  Buscar
                  <kbd className="ml-2 rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">⌘K</kbd>
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-line sm:hidden"
                  aria-label="Buscar"
                >
                  <Search className="h-4 w-4" />
                </button>
                <Link to="/app/applications/new">
                  <Button size="sm">
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Nova app</span>
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>

        <CommandPalette open={open} onOpenChange={setOpen} />
      </div>
    </TooltipProvider>
  )
}
