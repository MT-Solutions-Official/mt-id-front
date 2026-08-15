import { useState } from 'react'
import { cn } from '../../lib/cn'
import { CodeBlock } from '../ui/CodeBlock'

export function CodeTabs({ tabs }) {
  const [index, setIndex] = useState(0)
  const current = tabs[index]
  return (
    <div className="mt-4">
      <div className="mb-2 flex flex-wrap gap-1">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setIndex(i)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-[12px] font-medium',
              i === index ? 'bg-accent/15 text-accent' : 'text-ink-muted hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <CodeBlock language={current.language} code={current.code} />
    </div>
  )
}
