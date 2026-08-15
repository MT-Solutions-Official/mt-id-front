import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Dialog({ open, onOpenChange, title, description, children = null, footer, className }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#050714]/80 backdrop-blur-md" />
        <DialogPrimitive.Content className={cn('panel fixed top-1/2 left-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6', className)}>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="display text-2xl">{title}</DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-2 text-sm text-ink-muted">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close className="rounded-lg p-1 text-ink-faint hover:bg-white/5 hover:text-ink">
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
          {children}
          {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export function Callout({ title, children, tone = 'accent' }) {
  const tones = {
    accent: 'border-accent/25 bg-accent/8',
    danger: 'border-danger/25 bg-danger/8',
  }
  return (
    <div className={cn('rounded-xl border px-4 py-3 text-sm', tones[tone])}>
      {title ? <div className="mb-1 font-medium">{title}</div> : null}
      <div className="text-ink-muted">{children}</div>
    </div>
  )
}
