import { useEffect, useState } from 'react'
import { cn } from '../../lib/cn'
import { initials } from '../../lib/format'

const sizes = {
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-9 w-9 text-[11px]',
  lg: 'h-11 w-11 text-sm',
  xl: 'h-20 w-20 text-lg',
}

export function Avatar({ name = '', src, size = 'md', className }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    setFailed(false)
  }, [src])
  const showImage = src && !failed

  return (
    <span
      className={cn(
        'inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-accent/12 font-semibold text-accent ring-1 ring-accent/20',
        sizes[size],
        className,
      )}
    >
      {showImage ? (
        <img src={src} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        initials(name)
      )}
    </span>
  )
}
