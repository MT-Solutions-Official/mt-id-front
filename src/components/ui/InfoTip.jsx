import * as Popover from '@radix-ui/react-popover'
import { cn } from '../../lib/cn'

export function InfoTip({ text, className }) {
  if (!text) return null
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            'inline-grid h-4 w-4 shrink-0 place-items-center rounded-full border border-line font-serif text-[11px] leading-none text-ink-faint transition hover:border-accent hover:text-accent',
            className,
          )}
          aria-label="O que é isso"
        >
          i
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="z-50 max-w-72 rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-[12px] leading-5 text-ink shadow-xl"
        >
          {text}
          <Popover.Arrow className="fill-surface-2" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export function FieldLabel({ children, info, htmlFor, className }) {
  const text = <span className={cn('text-[13px] font-medium text-ink', className)}>{children}</span>
  return (
    <span className="inline-flex items-center gap-1.5">
      {htmlFor ? <label htmlFor={htmlFor}>{text}</label> : text}
      <InfoTip text={info} />
    </span>
  )
}
