import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLenis } from 'lenis/react'
import { CodeBlock } from '../../components/ui/CodeBlock'
import { CodeTabs } from '../../components/docs/CodeTabs'
import { CopyForAgent } from '../../components/docs/CopyForAgent'
import { DocCallout } from '../../components/docs/DocCallout'
import { Endpoint } from '../../components/docs/Endpoint'
import { pageToMarkdown } from '../../lib/docsMarkdown'
import { slugify } from '../../lib/slugify'
import { cn } from '../../lib/cn'

function SectionBody({ section }) {
  return (
    <>
      {section.endpoint ? (
        <Endpoint method={section.endpoint.method} path={section.endpoint.path} auth={section.endpoint.auth} />
      ) : null}
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="mt-3 text-[15px] leading-7 text-ink-muted">
          {paragraph}
        </p>
      ))}
      {section.callout ? (
        <DocCallout tone={section.callout.tone} title={section.callout.title}>
          {section.callout.body}
        </DocCallout>
      ) : null}
      {section.bullets ? (
        <ul className="mt-4 space-y-2 text-[15px] leading-7 text-ink-muted">
          {section.bullets.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-[0.85em] h-px w-3 shrink-0 bg-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {section.steps ? (
        <ol className="mt-4 space-y-3 text-[15px] leading-7 text-ink-muted">
          {section.steps.map((item, index) => (
            <li key={item} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 font-mono text-[11px] text-accent">
                {index + 1}
              </span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ol>
      ) : null}
      {section.fields ? (
        <div className="mt-4 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-surface-2 text-[11px] tracking-[0.12em] text-ink-faint uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Campo</th>
                <th className="px-4 py-3 font-medium">Obrigatório</th>
                <th className="px-4 py-3 font-medium">Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {section.fields.map((field) => (
                <tr key={field.name} className="border-t border-line">
                  <td className="px-4 py-3 font-mono text-[13px] text-ink">{field.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{field.required ? 'Sim' : 'Não'}</td>
                  <td className="px-4 py-3 text-ink-muted">{field.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {section.table ? (
        <div className="mt-4 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-surface-2 text-[11px] tracking-[0.12em] text-ink-faint uppercase">
              <tr>
                {section.table.headers.map((header) => (
                  <th key={header} className="px-4 py-3 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row) => (
                <tr key={row.join()} className="border-t border-line">
                  {row.map((cell) => (
                    <td key={cell} className="px-4 py-3 align-top text-ink-muted">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {section.code ? <CodeBlock className="mt-4" language={section.code.language} code={section.code.code} /> : null}
      {section.codeTabs ? <CodeTabs tabs={section.codeTabs} /> : null}
    </>
  )
}

export function DocArticle({ page, path, prev, next }) {
  const lenis = useLenis()
  const sections = page.sections || []
  const ids = useMemo(() => sections.map((section) => section.id || slugify(section.title)), [sections])
  const [active, setActive] = useState(ids[0])
  const markdown = useMemo(() => pageToMarkdown(page, { path }), [page, path])

  useEffect(() => {
    setActive(ids[0])

    function syncActive() {
      const marker = 120
      let current = ids[0]
      for (const id of ids) {
        const element = document.getElementById(id)
        if (element && element.getBoundingClientRect().top <= marker) current = id
      }
      setActive(current)
    }

    syncActive()
    window.addEventListener('scroll', syncActive, { passive: true })
    return () => window.removeEventListener('scroll', syncActive)
  }, [ids])

  function scrollToSection(id) {
    if (lenis) {
      lenis.scrollTo(`#${id}`, { offset: -96, duration: 1.05 })
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    window.history.replaceState(null, '', `#${id}`)
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-12">
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">{page.kicker}</p>
          <CopyForAgent markdown={markdown} label="Copiar para agente" />
        </div>
        <h1 className="display mt-3 text-4xl md:text-5xl">{page.title}</h1>
        <p className="mt-5 text-[17px] leading-8 text-ink-muted">{page.lead}</p>
        <div className="mt-12 space-y-14">
          {sections.map((section) => {
            const id = section.id || slugify(section.title)
            return (
              <section key={id} id={id} className="scroll-mt-28">
                <h2 className="text-xl font-semibold tracking-tight text-ink">{section.title}</h2>
                <SectionBody section={section} />
              </section>
            )
          })}
        </div>
        <div className="mt-16 flex flex-wrap justify-between gap-4 border-t border-line pt-8 text-sm">
          {prev ? (
            <Link to={prev.to} className="text-ink-muted hover:text-accent">
              ← {prev.label}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={next.to} className="ml-auto text-ink-muted hover:text-accent">
              {next.label} →
            </Link>
          ) : null}
        </div>
      </div>
      <nav className="sticky top-28 hidden h-fit lg:block">
        <CopyForAgent markdown={markdown} label="Copiar página" className="mb-5 w-full" />
        <div className="mb-3 text-[10px] tracking-[0.2em] text-ink-faint uppercase">Nesta página</div>
        <div className="flex flex-col gap-1.5">
          {sections.map((section) => {
            const id = section.id || slugify(section.title)
            return (
              <button
                key={id}
                type="button"
                onClick={() => scrollToSection(id)}
                className={cn(
                  'block w-full border-l-2 py-0.5 pl-3 text-left text-[12px] leading-5 transition-colors',
                  active === id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-ink-muted hover:text-ink',
                )}
              >
                {section.title}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
