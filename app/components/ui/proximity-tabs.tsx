import * as React from 'react'
import { cn } from '~/lib/utils'

export interface ProximityTabItem {
  id: string
  label: string
  badge?: string
  scriptTag?: string
}

export interface ProximityTabsProps {
  items: ProximityTabItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

export function ProximityTabs({
  items,
  activeId,
  onChange,
  className,
}: ProximityTabsProps) {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)

  return (
    <nav
      data-slot="proximity-tabs"
      aria-label="Primary Workbench Navigation"
      className={cn(
        'flex flex-wrap items-center border-b border-border bg-background/90 px-4',
        className,
      )}
      onMouseLeave={() => setHoveredId(null)}
    >
      {items.map((item) => {
        const isActive = item.id === activeId
        const isHovered = item.id === hoveredId
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            onMouseEnter={() => setHoveredId(item.id)}
            className={cn(
              'relative flex items-center gap-2 border-r border-border px-4 py-3 text-xs font-medium tracking-tight transition-colors cursor-pointer select-none',
              isActive
                ? 'bg-accent/70 text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground',
              isHovered && !isActive && 'bg-muted/40',
            )}
          >
            {item.scriptTag && (
              <span
                className={cn(
                  'border px-1.5 py-0.5 text-[10px] tabular-nums',
                  isActive
                    ? 'border-[#1D4ED8] bg-[#1D4ED8]/10 text-[#1D4ED8] dark:border-blue-400 dark:text-blue-300'
                    : 'border-border bg-muted/50 text-muted-foreground',
                )}
              >
                {item.scriptTag}
              </span>
            )}
            <span>{item.label}</span>
            {item.badge && (
              <span className="bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground tabular-nums">
                {item.badge}
              </span>
            )}
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[2px] bg-[#1D4ED8] dark:bg-blue-400"
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
