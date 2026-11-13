import * as React from 'react'
import { cn } from '~/lib/utils'

export interface AnimatedCounterProps extends React.ComponentProps<'span'> {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  durationMs?: number
}

export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  durationMs = 420,
  className,
  ...props
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(value)
  const prevValueRef = React.useRef(value)

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      setDisplayValue(value)
      return
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setDisplayValue(value)
      prevValueRef.current = value
      return
    }

    const startVal = prevValueRef.current
    const diff = value - startVal
    if (Math.abs(diff) < 1e-6) {
      setDisplayValue(value)
      return
    }

    const startTime = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / durationMs)
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(startVal + diff * eased)
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        prevValueRef.current = value
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, durationMs])

  return (
    <span
      data-slot="animated-counter"
      className={cn('tabular-nums tracking-tight', className)}
      {...props}
    >
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  )
}
