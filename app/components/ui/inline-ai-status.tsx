import * as React from 'react'
import { cn } from '~/lib/utils'

export interface InlineAIStatusProps extends React.ComponentProps<'div'> {
  state: 'idle' | 'intake' | 'researching' | 'synthesizing' | 'ready'
  modelLabel?: string
  detail?: string
  latencyMs?: number
}

const STATE_CONFIG: Record<
  InlineAIStatusProps['state'],
  { label: string; dotClass: string; badgeClass: string }
> = {
  idle: {
    label: 'STANDBY',
    dotClass: 'bg-emerald-500',
    badgeClass: 'border-border bg-muted/40 text-muted-foreground',
  },
  intake: {
    label: 'FACT INTAKE ANALYSIS',
    dotClass: 'bg-amber-500 animate-pulse',
    badgeClass: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  researching: {
    label: 'FAISS DUAL-INDEX RETRIEVAL',
    dotClass: 'bg-blue-500 animate-ping',
    badgeClass: 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  synthesizing: {
    label: 'DRAFTING LEGAL MEMORANDUM',
    dotClass: 'bg-indigo-500 animate-pulse',
    badgeClass: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  },
  ready: {
    label: 'PRECEDENT MEMO VERIFIED',
    dotClass: 'bg-emerald-500',
    badgeClass:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
}

export function InlineAIStatus({
  state,
  modelLabel = 'law-ai/InLegalBERT · 768d',
  detail,
  latencyMs,
  className,
  ...props
}: InlineAIStatusProps) {
  const cfg = STATE_CONFIG[state]
  return (
    <div
      data-slot="inline-ai-status"
      className={cn(
        'inline-flex items-center gap-2.5 border px-2.5 py-1 text-[11px] font-medium tracking-wider uppercase transition-colors',
        cfg.badgeClass,
        className,
      )}
      {...props}
    >
      <span className="relative flex h-2 w-2 items-center justify-center">
        <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dotClass)} />
      </span>
      <span className="font-semibold">{cfg.label}</span>
      <span className="text-muted-foreground/60">|</span>
      <span className="text-foreground/80 normal-case tracking-normal">
        {detail || modelLabel}
      </span>
      {typeof latencyMs === 'number' && (
        <>
          <span className="text-muted-foreground/60">|</span>
          <span className="tabular-nums text-muted-foreground">
            {latencyMs}ms
          </span>
        </>
      )}
    </div>
  )
}
