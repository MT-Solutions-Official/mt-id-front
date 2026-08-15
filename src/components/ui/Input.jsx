import { IMaskInput } from 'react-imask'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/cn'
import { masks } from '../../lib/mask'
import { FieldLabel } from './InfoTip'

const fieldClass =
  'h-12 w-full rounded-xl border border-line bg-bg/60 text-ink outline-none transition placeholder:text-ink-faint focus:border-accent focus:shadow-[0_0_0_3px_rgb(34_224_255_/_0.15)]'

const lockedFieldClass = 'cursor-default opacity-90 focus:border-line focus:shadow-none'

export function Input({
  label,
  info,
  hint,
  error,
  className,
  id,
  mask,
  onChange,
  value,
  placeholder,
  inputMode,
  autoComplete,
  icon,
  trailing,
  ...props
}) {
  const inputId = id || props.name
  const maskConfig = mask ? masks[mask] : null
  const padding = cn(icon ? 'pl-11' : 'pl-3.5', trailing ? 'pr-11' : 'pr-3.5')

  function handleMaskedAccept(next) {
    onChange?.({ target: { value: next, name: props.name } })
  }

  const control = maskConfig ? (
    <IMaskInput
      id={inputId}
      {...props}
      mask={maskConfig.imask}
      value={value || ''}
      unmask={false}
      onAccept={handleMaskedAccept}
      placeholder={placeholder ?? maskConfig.placeholder}
      inputMode={inputMode ?? maskConfig.inputMode}
      autoComplete={autoComplete ?? maskConfig.autoComplete}
      className={cn(
        fieldClass,
        padding,
        error && 'border-danger/60',
        (props.disabled || props.readOnly) && lockedFieldClass,
        props.disabled && 'cursor-not-allowed opacity-60',
      )}
    />
  ) : (
    <input
      id={inputId}
      {...props}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      inputMode={inputMode}
      autoComplete={autoComplete}
      className={cn(
        fieldClass,
        padding,
        error && 'border-danger/60',
        (props.disabled || props.readOnly) && lockedFieldClass,
        props.disabled && 'cursor-not-allowed opacity-60',
      )}
    />
  )

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-1.5 text-sm', className)}>
      {label ? <FieldLabel htmlFor={inputId} info={info}>{label}</FieldLabel> : null}
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-faint">{icon}</span>
        ) : null}
        {control}
        {trailing ? <div className="absolute top-1/2 right-2 -translate-y-1/2">{trailing}</div> : null}
      </div>
      {error ? <span className="text-xs text-danger">{error}</span> : hint ? <span className="text-xs text-ink-faint">{hint}</span> : null}
    </div>
  )
}

export function PasswordInput({ icon, ...props }) {
  const [visible, setVisible] = useState(false)
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      autoComplete={props.autoComplete || 'current-password'}
      icon={icon ?? <Lock className="h-4 w-4" />}
      trailing={
        <button
          type="button"
          className="rounded-md p-1.5 text-ink-faint hover:text-ink"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  )
}

export function Textarea({ label, info, className, id, ...props }) {
  const inputId = id || props.name
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      {label ? <FieldLabel htmlFor={inputId} info={info}>{label}</FieldLabel> : null}
      <textarea
        id={inputId}
        className={cn(
          'min-h-24 rounded-xl border border-line bg-bg/60 px-3.5 py-2.5 text-ink outline-none transition placeholder:text-ink-faint focus:border-accent focus:shadow-[0_0_0_3px_rgb(34_224_255_/_0.15)]',
          (props.disabled || props.readOnly) && 'cursor-default opacity-90 focus:border-line focus:shadow-none',
          props.disabled && 'cursor-not-allowed opacity-60',
          className,
        )}
        {...props}
      />
    </div>
  )
}
