import { useState } from 'react'
import { Bot, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../ui/Button'
import { cn } from '../../lib/cn'

export function CopyForAgent({ markdown, label = 'Copiar para agente', className, size = 'sm' }) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(markdown || '')
      toast.success('Copiado. Cole no agente.')
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('Não deu para copiar. Permita acesso à área de transferência.')
    }
  }

  return (
    <Button type="button" variant="secondary" size={size} className={cn('shrink-0', className)} onClick={onCopy}>
      {copied ? <Check className="h-3.5 w-3.5 text-ok" /> : <Bot className="h-3.5 w-3.5" />}
      {copied ? 'Copiado' : label}
    </Button>
  )
}
