import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'
import { Search } from 'lucide-react'
import { docsNav, docs } from '../../content/docs'

function pageText(page) {
  if (!page) return ''
  return (page.sections || [])
    .flatMap((section) => [
      section.title,
      section.endpoint?.path,
      ...(section.paragraphs || []),
      ...(section.bullets || []),
      ...(section.steps || []),
      ...(section.fields || []).map((field) => `${field.name} ${field.notes || ''}`),
      ...(section.table?.rows || []).map((row) => row.join(' ')),
    ])
    .filter(Boolean)
    .join(' ')
}

function buildIndex() {
  return docsNav.flatMap((group) =>
    group.items.map((item) => {
      const slug = item.to === '/docs' ? 'overview' : item.to.replace('/docs/', '')
      const page = docs[slug]
      return {
        to: item.to,
        label: item.label,
        title: page?.title || item.label,
        lead: page?.lead || '',
        headings: (page?.sections || []).map((section) => section.title).join(' '),
        body: pageText(page),
      }
    }),
  )
}

export function DocsSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const inputRef = useRef(null)
  const index = useMemo(() => buildIndex(), [])
  const fuse = useMemo(
    () =>
      new Fuse(index, {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'label', weight: 2 },
          { name: 'lead', weight: 1 },
          { name: 'headings', weight: 1.4 },
          { name: 'body', weight: 0.6 },
        ],
        threshold: 0.34,
      }),
    [index],
  )
  const results = query.trim() ? fuse.search(query.trim()).slice(0, 8).map((hit) => hit.item) : []

  useEffect(() => {
    function onClick(event) {
      if (!boxRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    function onKey(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div ref={boxRef} className="relative mb-6">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar na docs"
        className="h-10 w-full rounded-xl border border-line bg-bg/70 pr-12 pl-9 text-[13px] text-ink outline-none placeholder:text-ink-faint focus:border-accent"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-faint sm:inline">
        ⌘K
      </kbd>
      {open && results.length > 0 ? (
        <div className="panel absolute z-30 mt-2 w-full overflow-hidden rounded-xl">
          {results.map((item) => (
            <button
              key={item.to}
              type="button"
              className="block w-full px-3 py-2.5 text-left text-[13px] text-ink-muted hover:bg-white/5 hover:text-ink"
              onClick={() => {
                navigate(item.to)
                setQuery('')
                setOpen(false)
              }}
            >
              <div className="font-medium text-ink">{item.label}</div>
              <div className="truncate text-[11px] text-ink-faint">{item.lead}</div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
