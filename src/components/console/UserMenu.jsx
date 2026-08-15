import { Link, useNavigate } from 'react-router-dom'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { BookOpen, CircleUserRound, LogOut } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { ownerPhoto } from '../../lib/format'
import { Avatar } from '../ui/Avatar'

export function UserMenu() {
  const { owner, logout } = useAuth()
  const navigate = useNavigate()
  const email = owner?.email?.email

  async function onLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/4"
        >
          <Avatar name={owner?.name} src={ownerPhoto(owner)} size="md" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-ink">{owner?.name}</span>
            <span className="block truncate font-mono text-[10px] text-ink-faint">{email}</span>
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          side="top"
          sideOffset={8}
          className="panel z-50 w-56 rounded-xl p-1"
        >
          <div className="px-3 py-2">
            <div className="text-[11px] tracking-[0.14em] text-ink-faint uppercase">OWNER</div>
            <div className="mt-0.5 truncate text-xs text-ink-muted">{email}</div>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-line" />
          <DropdownMenu.Item asChild>
            <Link
              to="/app/account"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-ink-muted outline-none hover:bg-white/5 hover:text-ink"
            >
              <CircleUserRound className="h-3.5 w-3.5" />
              Meu perfil
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              to="/docs"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-ink-muted outline-none hover:bg-white/5 hover:text-ink"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Documentação
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-ink-muted outline-none hover:bg-white/5 hover:text-ink"
            onSelect={onLogout}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
