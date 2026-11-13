import * as React from 'react'
import { cn } from '~/lib/utils'
import { type AgentStepTrace } from '~/lib/legal-agent'

export interface StepPlayerProps {
  steps: AgentStepTrace[]
  activeStepIndex: number
  onSelectStep: (idx: number) => void
  isPlaying?: boolean
  onReplay?: () => void
  className?: string
}

export function StepPlayer({
  steps,
  activeStepIndex,
  onSelectStep,
  isPlaying = false,
  onReplay,
  className,
}: StepPlayerProps) {
  const totalMs = steps.reduce((acc, s) => acc + s.duration_ms, 0)
  const currentStep = steps[activeStepIndex] ?? steps[0]

  return (
    <div
      data-slot="step-player"
      className={cn('border border-border bg-card', className)}
    >
      {/* Header Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 bg-[#1D4ED8] dark:bg-blue-400" />
          <span className="text-[11px] font-semibold tracking-wider uppercase">
            AGENT EXECUTION TRACE PLAYER
          </span>
          <span className="border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground tabular-nums">
            {steps.length} STAGES · {totalMs}ms TOTAL
          </span>
        </div>
        {onReplay && (
          <button
            type="button"
            onClick={onReplay}
            className="border border-border bg-background px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase hover:bg-accent cursor-pointer"
          >
            {isPlaying ? 'EXECUTING...' : 'REPLAY TRACE'}
          </button>
        )}
      </div>

      {/* Stepper Rail */}
      <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-5 md:divide-x md:divide-y-0 border-b border-border">
        {steps.map((s, idx) => {
          const isCurrent = idx === activeStepIndex
          const isCompleted = idx < activeStepIndex
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectStep(idx)}
              className={cn(
                'flex flex-col items-start justify-between p-3 text-left transition-colors cursor-pointer',
                isCurrent
                  ? 'bg-[#1D4ED8]/8 dark:bg-blue-500/10'
                  : 'hover:bg-muted/40',
              )}
            >
              <div className="flex w-full items-center justify-between gap-1 mb-1.5">
                <span
                  className={cn(
                    'px-1.5 py-0.5 text-[10px] font-semibold tabular-nums border',
                    isCurrent
                      ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                      : isCompleted
                        ? 'border-emerald-600/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'border-border bg-muted text-muted-foreground',
                  )}
                >
                  0{s.step}
                </span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {s.duration_ms}ms
                </span>
              </div>
              <div className="text-[11px] font-medium leading-snug text-foreground line-clamp-2">
                {s.title}
              </div>
            </button>
          )
        })}
      </div>

      {/* Active Step Inspector */}
      {currentStep && (
        <div className="grid grid-cols-1 gap-3 p-3.5 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-1">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">
                STAGE 0{currentStep.step}: {currentStep.title}
              </span>
              <span>·</span>
              <span>Engine: {currentStep.model_or_engine}</span>
            </div>
            <p className="text-xs leading-relaxed text-foreground/90">
              {currentStep.summary}
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-wrap items-center gap-2 lg:justify-end">
            {Object.entries(currentStep.telemetry).map(([k, v]) => (
              <div
                key={k}
                className="border border-border bg-muted/30 px-2.5 py-1 text-[10px]"
              >
                <span className="text-muted-foreground uppercase">{k}: </span>
                <span className="font-semibold text-foreground tabular-nums">
                  {String(v)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
