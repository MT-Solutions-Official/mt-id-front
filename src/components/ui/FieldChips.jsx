import { REQUIRED_FIELDS } from '../../lib/constants'
import { ownerHelp } from '../../content/ownerHelp'
import { cn } from '../../lib/cn'
import { InfoTip } from './InfoTip'

export function FieldChips({ value = [], onToggle, readOnly = false }) {
  return (
    <div className="flex flex-wrap gap-2">
      {REQUIRED_FIELDS.map((field) => {
        const active = value.includes(field.id)
        return (
          <span
            key={field.id}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs transition',
              active ? 'border-accent/40 bg-accent/10 text-accent' : 'border-line text-ink-muted',
              readOnly && 'opacity-90',
            )}
          >
            {readOnly ? (
              <span>{field.label}</span>
            ) : (
              <button type="button" onClick={() => onToggle(field.id)} className="hover:text-ink">
                {field.label}
              </button>
            )}
            <InfoTip text={ownerHelp.fields[field.id]} />
          </span>
        )
      })}
    </div>
  )
}
