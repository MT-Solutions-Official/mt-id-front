import { useState } from 'react'
import { Check, Copy, Eye, EyeOff } from 'lucide-react'
import { copyText } from '../../lib/clipboard'
import { cn } from '../../lib/cn'
import { FieldLabel } from './InfoTip'
import { Button } from './Button'

export function CopyField({ label, value, secret = false, hint, info }) {
  const [revealed, setRevealed] = useState(!secret)
  const [copied, setCopied] = useState(false)
  const display = !value ? '—' : revealed ? value : '•'.repeat(Math.min(28, String(value).length))

  async function onCopy() {
    await copyText(value, label)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div>
      {label ? (
        <div className="mb-1.5">
          <FieldLabel info={info} className="text-[11px] tracking-[0.16em] text-ink-faint uppercase">
            {label}
          </FieldLabel>
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCopy}
          className="min-w-0 flex-1 truncate rounded-xl border border-line bg-bg/70 px-3 py-2.5 text-left font-mono text-xs text-ink hover:border-line-strong"
        >
          {display}
        </button>
        {secret ? (
          <Button type="button" size="icon" variant="secondary" onClick={() => setRevealed((current) => !current)} aria-label={revealed ? 'Ocultar' : 'Mostrar'}>
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        ) : null}
        <Button type="button" size="icon" variant="secondary" onClick={onCopy} aria-label={`Copiar ${label}`}>
          {copied ? <Check className="h-4 w-4 text-ok" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      {hint ? <p className="mt-1.5 text-xs text-ink-faint">{hint}</p> : null}
    </div>
  )
}

export function CopyButton({ value, label = 'Copiar', className }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      className={cn('inline-flex items-center gap-1.5 text-[11px] text-ink-faint hover:text-ink', className)}
      onClick={async (event) => {
        event.preventDefault()
        event.stopPropagation()
        await copyText(value, label)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1400)
      }}
    >
      {copied ? <Check className="h-3 w-3 text-ok" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copiado' : label}
    </button>
  )
}
