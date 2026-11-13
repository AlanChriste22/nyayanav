import * as React from 'react'
import { cn } from '~/lib/utils'

export interface RailTOCItem {
  id: string
  heading: string
  badge?: string
}

export interface RailTOCProps {
  items: RailTOCItem[]
  activeId: string
  onSelect: (id: string) => void
  className?: string
}

export function RailTOC({
  items,
  activeId,
  onSelect,
  className,
}: RailTOCProps) {
  return (
    <aside
      data-slot="rail-toc"
      aria-label="Memorandum Sections"
      className={cn('border border-border bg-card p-3', className)}
    >
      <div className="mb-2.5 flex items-center justify-between border-b border-border pb-2">
        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          MEMORANDUM RAIL TOC
        </span>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {items.length} SEC
        </span>
      </div>
      <div className="relative space-y-1 border-l border-border pl-2.5">
        {items.map((item) => {
          const isActive = item.id === activeId
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                'group relative flex w-full items-center justify-between gap-2 py-1.5 px-2 text-left text-[11px] transition-colors cursor-pointer',
                isActive
                  ? 'bg-[#1D4ED8]/10 font-semibold text-[#1D4ED8] dark:bg-blue-500/15 dark:text-blue-300'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              )}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute -left-[11px] top-1 bottom-1 w-[2px] bg-[#1D4ED8] dark:bg-blue-400"
                />
              )}
              <span className="truncate">{item.heading}</span>
              {item.badge && (
                <span className="shrink-0 border border-border bg-background px-1 py-0.2 text-[9px] tabular-nums">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </aside>
  )
}
