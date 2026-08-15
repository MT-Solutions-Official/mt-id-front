import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '../../lib/cn'

export function TooltipProvider({ children }) {
  return (
    <TooltipPrimitive.Provider delayDuration={200} skipDelayDuration={0}>
      {children}
    </TooltipPrimitive.Provider>
  )
}

export function Tooltip({ content, children, side = 'bottom' }) {
  if (!content) return children
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className={cn(
            'z-50 rounded-lg border border-line bg-surface-2 px-2 py-1 text-[11px] text-ink shadow-xl',
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-surface-2" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
