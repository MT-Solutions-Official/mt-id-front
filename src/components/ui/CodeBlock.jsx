import { Highlight, themes } from 'prism-react-renderer'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/cn'

export function CodeBlock({ code, language = 'javascript', className }) {
  const [copied, setCopied] = useState(false)
  const lang = language === 'http' ? 'bash' : language

  async function copy() {
    await navigator.clipboard.writeText(code.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className={cn('group relative overflow-hidden rounded-2xl border border-line bg-[#070a16]', className)}>
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-danger/80" />
          <span className="h-2 w-2 rounded-full bg-accent-3/80" />
          <span className="h-2 w-2 rounded-full bg-ok/80" />
          <span className="ml-2 font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">{language}</span>
        </div>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1 text-[11px] text-ink-faint hover:text-accent">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <Highlight theme={themes.nightOwl} code={code.trim()} language={lang}>
        {({ className: cls, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={cn(cls, 'overflow-x-auto p-4 font-mono text-[13px] leading-6')} style={{ ...style, background: 'transparent', margin: 0 }}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}
