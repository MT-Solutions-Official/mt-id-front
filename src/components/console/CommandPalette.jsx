import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Command } from 'cmdk'
import { AppWindow, BookOpen, CircleUserRound, LayoutDashboard, Plus, Users } from 'lucide-react'
import { apps } from '../../lib/api'

const pages = [
  { to: '/app', label: 'Visão geral', icon: LayoutDashboard, hint: 'Dashboard' },
  { to: '/app/applications', label: 'Aplicações', icon: AppWindow },
  { to: '/app/applications/new', label: 'Nova aplicação', icon: Plus },
  { to: '/app/team', label: 'Time', icon: Users },
  { to: '/app/account', label: 'Conta / perfil', icon: CircleUserRound },
  { to: '/docs', label: 'Documentação', icon: BookOpen },
  { to: '/docs/quickstart', label: 'Quickstart', icon: BookOpen },
  { to: '/docs/routes', label: 'Índice de rotas', icon: BookOpen },
]

export function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate()
  const { data: applications = [] } = useQuery({
    queryKey: ['apps'],
    queryFn: async () => (await apps.list()).data,
    enabled: open,
  })

  function go(to) {
    navigate(to)
    onOpenChange(false)
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Paleta de comandos"
      overlayClassName="cmdk-overlay"
      contentClassName="cmdk-dialog"
    >
      <Command.Input placeholder="Buscar páginas, apps, ações…" />
      <Command.List>
        <Command.Empty>Nada encontrado.</Command.Empty>
        <Command.Group heading="Ir para">
          {pages.map((item) => (
            <Command.Item key={item.to} value={item.label} onSelect={() => go(item.to)}>
              <item.icon className="h-4 w-4 text-ink-faint" />
              <span>{item.label}</span>
              {item.hint ? <span className="ml-auto text-[11px] text-ink-faint">{item.hint}</span> : null}
            </Command.Item>
          ))}
        </Command.Group>
        {applications.length ? (
          <Command.Group heading="Aplicações">
            {applications.map((app) => (
              <Command.Item
                key={app.appId}
                value={`${app.name} ${app.appId}`}
                onSelect={() => go(`/app/applications/${app.appId}`)}
              >
                <AppWindow className="h-4 w-4 text-ink-faint" />
                <span className="truncate">{app.name}</span>
                <span className="ml-auto font-mono text-[10px] text-ink-faint">{app.appId.slice(0, 8)}</span>
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}
      </Command.List>
    </Command.Dialog>
  )
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return { open, setOpen }
}
