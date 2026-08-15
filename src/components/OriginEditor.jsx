import { Plus, X } from 'lucide-react'
import { Input } from './ui/Input'
import { Button } from './ui/Button'

export function OriginEditor({ value, onChange, readOnly = false }) {
  function update(index, next) {
    if (readOnly) return
    const copy = [...value]
    copy[index] = next
    onChange(copy)
  }

  const origins = value.length ? value : ['']

  return (
    <div className="space-y-2">
      {origins.map((origin, index) => (
        <div key={index} className="flex gap-2">
          <Input
            className="flex-1"
            placeholder="https://app.seudominio.com"
            value={origin}
            readOnly={readOnly}
            onChange={(e) => update(index, e.target.value)}
          />
          {readOnly ? null : (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              aria-label="Remover origin"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      {readOnly ? null : (
        <Button type="button" size="sm" variant="ghost" onClick={() => onChange([...value, ''])}>
          <Plus className="h-3.5 w-3.5" />
          Adicionar origin
        </Button>
      )}
    </div>
  )
}
