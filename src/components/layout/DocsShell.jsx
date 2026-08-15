import { NavLink, Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useMemo, useState } from 'react'
import { SiteFooter, SiteHeader } from './SiteChrome'
import { docsNav } from '../../content/docs'
import { DocsSearch } from '../docs/DocsSearch'
import { CopyForAgent } from '../docs/CopyForAgent'
import { allDocsToMarkdown } from '../../lib/docsMarkdown'
import { cn } from '../../lib/cn'

function NavGroups({ onNavigate }) {
  return docsNav.map((group) => (
    <div key={group.title} className="mb-7">
      <div className="mb-2 px-2 text-[10px] tracking-[0.2em] text-ink-faint uppercase">{group.title}</div>
      <div className="flex flex-col">
        {group.items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/docs'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'rounded-lg px-2 py-1.5 text-[13px] text-ink-muted hover:bg-white/4 hover:text-ink',
                isActive && 'bg-accent/10 text-accent',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  ))
}

export function DocsShell() {
  const [open, setOpen] = useState(false)
  const fullMarkdown = useMemo(() => allDocsToMarkdown(), [])
  return (
    <div className="relative min-h-screen bg-bg">
      <div className="pointer-events-none absolute inset-0 aurora opacity-40" />
      <div className="relative z-10">
        <SiteHeader />
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:py-12">
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <DocsSearch />
            <CopyForAgent markdown={fullMarkdown} label="Copiar docs completa" className="mb-6 w-full" />
            <NavGroups />
          </aside>
          <div className="min-w-0">
            <button
              type="button"
              className="mb-6 inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm text-ink-muted lg:hidden"
              onClick={() => setOpen((current) => !current)}
            >
              <Menu className="h-4 w-4" />
              Índice
            </button>
            {open ? (
              <div className="mb-8 rounded-2xl border border-line p-4 lg:hidden">
                <DocsSearch />
                <CopyForAgent markdown={fullMarkdown} label="Copiar docs completa" className="mb-6 w-full" />
                <NavGroups onNavigate={() => setOpen(false)} />
              </div>
            ) : null}
            <article className="prose-docs pb-20">
              <Outlet />
            </article>
          </div>
        </div>
        <SiteFooter />
      </div>
    </div>
  )
}
